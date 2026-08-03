/**
 * Convert a tab grid into a LilyPond score, written for the site's
 * `scores` collection (rendered by astro-lilypond).
 *
 * Every note is emitted with an explicit LilyPond string number (`\N`),
 * because LilyPond's automatic string selection is unreliable for the
 * ukulele's non-monotonic tuning. String 1 is the top staff line, so the
 * tuning `<a' e' c' g'>` puts the G string on top, matching how the tab
 * is written and read.
 */

import {
  STRINGS,
  STRING_PITCH,
  fretPitch,
  gridWidth,
  isFret,
  type Grid,
  type StringName,
} from './model.ts'

interface Note {
  string: number // visual row index (0 = G, top)
  fret: number
  start: number // column (beat) the note is struck
  beats: number // duration in beats, extended by trailing '-'
}

export interface SongMeta {
  title?: string
  artist?: string
  tempo?: number
  beatsPerBar?: number
}

export interface ConversionResult {
  music: string
  warnings: string[]
}

/** Scan the grid into per-string note events with sustain-extended beats. */
export function gridToNotes(grid: Grid): { notes: Note[]; warnings: string[] } {
  const cols = gridWidth(grid)
  const notes: Note[] = []
  const warnings: string[] = []
  const lastByString = new Map<number, Note>()

  for (let s = 0; s < STRINGS.length; s++) {
    for (let c = 0; c < cols; c++) {
      const cell = grid[s][c]
      if (isFret(cell)) {
        const note: Note = {
          string: s,
          fret: parseInt(cell, 10),
          start: c,
          beats: 1,
        }
        notes.push(note)
        lastByString.set(s, note)
      } else if (cell === '-') {
        const last = lastByString.get(s)
        if (last) {
          last.beats += 1
        } else {
          warnings.push(
            `bar ${Math.floor(c / 4) + 1}, beat ${(c % 4) + 1}: ` +
              `sustain "-" on the ${STRINGS[s]} string with no note before it`,
          )
        }
      }
    }
  }
  return { notes, warnings }
}

/** Map a run length in beats to a LilyPond duration token. */
export function durationToken(beats: number): string {
  const wholes = Math.floor(beats / 4)
  const rem = beats % 4
  const tail = rem === 0 ? '' : rem === 1 ? '4' : rem === 2 ? '2' : '2.'
  return Array(wholes)
    .fill('1')
    .concat(tail ? [tail] : [])
    .join('~')
}

export function gridToLilypond(
  grid: Grid,
  beatsPerBar: number,
): ConversionResult {
  const { notes, warnings } = gridToNotes(grid)
  // Trim trailing all-empty columns so the auto-created column after the
  // last typed note doesn't render as a stray rest. Sustains (`-`) count.
  let cols = gridWidth(grid)
  while (
    cols > 1 &&
    !STRINGS.some((_, s) => (grid[s][cols - 1] ?? '') !== '')
  ) {
    cols -= 1
  }

  const byStart = new Map<number, Note[]>()
  for (const note of notes) {
    const list = byStart.get(note.start) ?? []
    list.push(note)
    byStart.set(note.start, list)
  }

  const tokens: string[] = []
  for (let c = 0; c < cols; c++) {
    const struck = byStart.get(c) ?? []
    const sounding = notes.some((n) => n.start <= c && c < n.start + n.beats)
    if (struck.length > 0) {
      const beats = Math.min(...struck.map((n) => n.beats))
      const dur = durationToken(beats)
      const byPitch = (n: Note): number =>
        STRING_PITCH[STRINGS[n.string] as StringName] + n.fret
      if (struck.length === 1) {
        const n = struck[0]
        tokens.push(
          `${fretPitch(STRINGS[n.string], n.fret)}${dur}\\${n.string + 1}`,
        )
      } else {
        const chordInner = [...struck]
          .sort((a, b) => byPitch(a) - byPitch(b))
          .map(
            (n) => `${fretPitch(STRINGS[n.string], n.fret)}\\${n.string + 1}`,
          )
          .join(' ')
        tokens.push(`<${chordInner}>${dur}`)
      }
    } else if (!sounding) {
      tokens.push('r4')
    }
    if ((c + 1) % beatsPerBar === 0 && c !== cols - 1) tokens.push('|')
  }

  return { music: tokens.join(' '), warnings }
}

function quote(value: string): string {
  return `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`
}

/** Build the complete `.ly` file for a grid. */
export function buildLy(grid: Grid, meta: SongMeta = {}): string {
  const beatsPerBar = meta.beatsPerBar ?? 4
  const tempo = meta.tempo ?? 90
  const { music } = gridToLilypond(grid, beatsPerBar)

  return (
    '\\version "2.26.0"\n' +
    '\n' +
    '\\header {\n' +
    `  title = ${quote(meta.title ?? 'Untitled')}\n` +
    `  composer = ${quote(meta.artist ?? '')}\n` +
    '  tagline = ##f\n' +
    '}\n' +
    '\n' +
    '\\score {\n' +
    '  \\new TabStaff \\with {\n' +
    "    stringTunings = \\stringTuning <a' e' c' g'>\n" +
    '  } {\n' +
    `    \\time ${beatsPerBar}/4\n` +
    `    \\tempo 4 = ${tempo}\n` +
    `    ${music}\n` +
    '  }\n' +
    '  \\layout {\n' +
    '    \\context {\n' +
    '      \\TabVoice\n' +
    '      \\omit StringNumber\n' +
    '    }\n' +
    '  }\n' +
    '}\n'
  )
}
