/**
 * Round-trip parser: turn a LilyPond tab score (.ly) back into the editor
 * grid, so saved songs can be reopened and edited.
 *
 * Supports the subset the site uses: TabStaff scores with whole-beat
 * durations, chords, rests, barlines, explicit string numbers (\N), ties,
 * \time, \tempo, and \relative pitch entry. Best-effort otherwise:
 * durations finer than a quarter note are quantized with a warning, and
 * notes without an explicit string number are assigned to the string with
 * the lowest fret (octave-shifting like LilyPond's handleNegativeFrets),
 * matching its default first-position placement.
 */

import { STRINGS, STRING_PITCH, ensureColumns, type Grid } from './model.ts'

export interface SongMeta {
  title?: string
  artist?: string
  tempo?: number
  beatsPerBar?: number
}

export interface ParsedLy {
  grid: Grid
  meta: SongMeta
  warnings: string[]
}

interface Token {
  t: 'pitch' | 'dur' | 'strnum' | 'cmd' | 'punct' | 'str' | 'word'
  v: string
}

const LETTER_SEMITONE: Record<string, number> = {
  c: 0,
  d: 2,
  e: 4,
  f: 5,
  g: 7,
  a: 9,
  b: 11,
}

/** Absolute semitone (c' = 12) of a LilyPond pitch token like `gis''`. */
function parsePitch(token: string): number {
  const m = /^([a-g])(is|es|isis|eses)?([']*)(,*)/.exec(token)
  if (!m) return 12
  const letter = LETTER_SEMITONE[m[1]]
  const acc =
    m[2] === 'isis'
      ? 2
      : m[2] === 'is'
        ? 1
        : m[2] === 'eses'
          ? -2
          : m[2] === 'es'
            ? -1
            : 0
  return letter + acc + (m[3].length - m[4].length) * 12
}

/** Nearest absolute pitch to `base` for a relative-mode pitch token. */
function relativePitch(base: number, token: string): number {
  const semitone = parsePitch(token)
  let best = semitone
  let bestDist = Number.POSITIVE_INFINITY
  for (let octave = -1; octave <= 2; octave++) {
    const candidate = semitone + octave * 12
    const dist = Math.abs(candidate - base)
    if (dist < bestDist) {
      bestDist = dist
      best = candidate
    }
  }
  return best
}

/** Whole beats for a duration token like `4`, `2.`, or `1`. */
function beatsFor(token: string, warnings: string[]): number {
  const dotted = token.endsWith('.')
  const value = parseFloat(token)
  let beats = (4 / value) * (dotted ? 1.5 : 1)
  if (!Number.isInteger(beats)) {
    warnings.push(
      `duration ${token} is finer than a quarter note — quantized to a quarter`,
    )
    beats = Math.max(1, Math.round(beats))
  }
  return beats
}

function tokenize(source: string): Token[] {
  const tokens: Token[] = []
  const src = source.replace(/%(?![{%])[^\n]*/g, '')
  let i = 0
  while (i < src.length) {
    const ch = src[i]
    if (/\s/.test(ch)) {
      i += 1
      continue
    }
    if (ch === '"') {
      const end = src.indexOf('"', i + 1)
      if (end === -1) break
      tokens.push({ t: 'str', v: src.slice(i + 1, end) })
      i = end + 1
      continue
    }
    if (ch === '\\') {
      const num = /^\\[0-9]+/.exec(src.slice(i))
      if (num) {
        tokens.push({ t: 'strnum', v: num[0].slice(1) })
        i += num[0].length
        continue
      }
      const cmd = /^\\[a-zA-Z]+/.exec(src.slice(i))
      if (cmd) {
        tokens.push({ t: 'cmd', v: cmd[0].slice(1) })
        i += cmd[0].length
        continue
      }
      i += 1
      continue
    }
    const pitch = /^[a-g](?:is|es|isis|eses)?[']*,*/.exec(src.slice(i))
    if (pitch) {
      tokens.push({ t: 'pitch', v: pitch[0] })
      i += pitch[0].length
      continue
    }
    const dur = /^\d+(?:\.)?/.exec(src.slice(i))
    if (dur) {
      tokens.push({ t: 'dur', v: dur[0] })
      i += dur[0].length
      continue
    }
    if (/[<>{}|~()=.,#]/.test(ch)) {
      tokens.push({ t: 'punct', v: ch })
      i += 1
      continue
    }
    const word = /^[a-zA-Z]+/.exec(src.slice(i))
    if (word) {
      tokens.push({ t: 'word', v: word[0] })
      i += word[0].length
      continue
    }
    i += 1
  }
  return tokens
}

const SKIP_BLOCK_COMMANDS = new Set([
  'new',
  'with',
  'layout',
  'context',
  'header',
  'paper',
  'score',
  'book',
  'bookpart',
  'markup',
  'midi',
])

/** Extract the tokens inside the score's music block. */
function extractMusic(tokens: Token[]): Token[] {
  let depth = 0
  let inMusic = false
  const music: Token[] = []
  let last: Token | null = null

  for (const tok of tokens) {
    if (tok.t === 'punct' && tok.v === '{') {
      const afterKeyword = last?.t === 'cmd' && SKIP_BLOCK_COMMANDS.has(last.v)
      if (
        !inMusic &&
        !afterKeyword &&
        (depth === 1 || (depth === 0 && music.length === 0))
      ) {
        inMusic = true
        depth += 1
        last = tok
        continue
      }
      depth += 1
    } else if (tok.t === 'punct' && tok.v === '}') {
      depth = Math.max(0, depth - 1)
      if (inMusic && depth === 1) {
        inMusic = false
        last = tok
        continue
      }
    }
    if (inMusic) music.push(tok)
    last = tok
  }
  return music
}

interface PendingNote {
  pitch: number
  row: number | null
}

interface Event {
  col: number
  notes: PendingNote[]
  beats: number
  rest: boolean
}

/** Choose the string + fret for a pitch, lowest fret first (octave recalc). */
function assignString(
  pitch: number,
  warnings: string[],
): { row: number; fret: number } {
  let best: { row: number; fret: number } | null = null
  for (let row = 0; row < STRINGS.length; row++) {
    let fret = pitch - STRING_PITCH[STRINGS[row]]
    while (fret < 0) fret += 12
    while (fret > 24) fret -= 12
    if (fret >= 0 && fret <= 24 && (!best || fret < best.fret)) {
      best = { row, fret }
    }
  }
  if (!best) {
    warnings.push(
      `pitch ${pitch} doesn't fit the fretboard — placed on the G string`,
    )
    best = { row: 0, fret: Math.max(0, pitch - STRING_PITCH.G) }
  }
  return best
}

/** Parse the music tokens into a grid. */
function parseMusic(tokens: Token[], meta: SongMeta, warnings: string[]): Grid {
  const grid: Grid = Array.from({ length: STRINGS.length }, () => [])
  let beat = 0
  let pending: Event | null = null
  let chordBuf: PendingNote[] | null = null
  let tieNext = false
  let relativeMode = false
  let relativeBase = 12
  let prevPitch: number | null = null

  const finalize = (): void => {
    const event = pending
    pending = null
    if (!event || event.rest || event.notes.length === 0) {
      if (event?.rest) beat += event.beats
      return
    }
    const cols = event.col + event.beats
    for (const note of event.notes) {
      const { row, fret } =
        note.row === null
          ? assignString(note.pitch, warnings)
          : {
              row: note.row,
              fret: note.pitch - STRING_PITCH[STRINGS[note.row]],
            }
      if (fret < 0 || fret > 24) {
        warnings.push(
          `note at beat ${event.col + 1} falls outside the fretboard`,
        )
        continue
      }
      ensureColumns(grid, cols)
      grid[row][event.col] = String(fret)
      for (let b = 1; b < event.beats; b++) {
        if ((grid[row][event.col + b] ?? '') === '')
          grid[row][event.col + b] = '-'
      }
    }
    beat += event.beats
  }

  const startEvent = (note: PendingNote): void => {
    finalize()
    pending = { col: beat, notes: [note], beats: 1, rest: false }
  }

  const applyDuration = (beats: number): void => {
    if (chordBuf) {
      pending = { col: beat, notes: chordBuf, beats, rest: false }
      chordBuf = null
    } else if (pending) {
      if (tieNext) pending.beats += beats
      else pending.beats = beats
      tieNext = false
    }
  }

  let i = 0
  while (i < tokens.length) {
    const tok = tokens[i]
    const next = (): Token | undefined => tokens[i + 1]
    if (tok.t === 'cmd') {
      if (tok.v === 'relative') {
        relativeMode = true
        const arg = next()
        if (arg?.t === 'pitch') {
          relativeBase = parsePitch(arg.v)
          i += 1
        }
      } else if (tok.v === 'time') {
        const a = next()
        if (a?.t === 'dur') {
          meta.beatsPerBar = parseInt(a.v, 10)
          i += 2 // numerator + denominator
        }
      } else if (tok.v === 'tempo') {
        const a = next()
        const b = tokens[i + 3] // \tempo 4 = 90
        if (a?.t === 'dur' && b?.t === 'dur') {
          meta.tempo = parseInt(b.v, 10)
          i += 3
        }
      } else if (tok.v === 'breve') {
        applyDuration(8)
      } else if (tok.v === 'longa') {
        applyDuration(16)
      }
    } else if (tok.t === 'pitch') {
      const pitch = relativeMode
        ? relativePitch(prevPitch ?? relativeBase, tok.v)
        : parsePitch(tok.v)
      if (relativeMode) prevPitch = pitch
      if (chordBuf) {
        chordBuf.push({ pitch, row: null })
      } else if (tieNext && pending) {
        // A tied continuation (c'1~ c'4): the next duration extends the
        // note; tieNext is cleared when that duration is applied.
      } else {
        startEvent({ pitch, row: null })
      }
    } else if (tok.t === 'strnum') {
      const row = parseInt(tok.v, 10) - 1
      if (chordBuf && chordBuf.length > 0)
        chordBuf[chordBuf.length - 1].row = row
      else if (pending) pending.notes[0].row = row
    } else if (tok.t === 'dur') {
      applyDuration(beatsFor(tok.v, warnings))
    } else if (tok.t === 'punct') {
      if (tok.v === '<') {
        finalize()
        chordBuf = []
      } else if (tok.v === '>') {
        if (chordBuf) {
          pending = { col: beat, notes: chordBuf, beats: 1, rest: false }
          chordBuf = null
        }
      } else if (tok.v === '~') {
        tieNext = true
      } else if (tok.v === '|') {
        finalize()
      } else if (
        tok.v === '(' ||
        tok.v === ')' ||
        tok.v === '=' ||
        tok.v === '.' ||
        tok.v === ','
      ) {
        // skip
      } else if (tok.v === '{' || tok.v === '}') {
        // nested blocks inside music (e.g. \relative braces) — skip
      }
    } else if (tok.t === 'word' && (tok.v === 'r' || tok.v === 'R')) {
      finalize()
      pending = { col: beat, notes: [], beats: 1, rest: true }
      const a = next()
      if (a?.t === 'dur') {
        pending.beats = beatsFor(a.v, warnings)
        i += 1
      }
    }
    i += 1
  }
  finalize()
  // Drop trailing all-empty columns (trailing rests).
  while (
    grid[0].length > 1 &&
    STRINGS.every((_, s) => (grid[s][grid[s].length - 1] ?? '') === '')
  ) {
    for (const row of grid) row.pop()
  }
  return grid
}

/** Parse a `.ly` score back into the editor grid. */
export function parseLy(source: string): ParsedLy {
  const warnings: string[] = []
  const meta: SongMeta = {}
  const title = /title\s*=\s*"([^"]*)"/.exec(source)?.[1]
  const composer = /composer\s*=\s*"([^"]*)"/.exec(source)?.[1]
  if (title !== undefined) meta.title = title
  if (composer !== undefined) meta.artist = composer

  const tokens = tokenize(source)
  const music = extractMusic(tokens)
  if (music.length === 0) {
    warnings.push('no TabStaff music found')
  }
  const grid = parseMusic(music, meta, warnings)
  return { grid, meta, warnings }
}
