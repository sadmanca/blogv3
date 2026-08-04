/**
 * uketab — an interactive terminal editor for ukulele tablature that
 * converts what you type into LilyPond tab scores for the site's
 * `src/content/scores` collection.
 *
 * Usage: bun uketab [name] [--title X] [--artist Y] [--beats N] [--tempo N]
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { UkeTab } from './model.ts'
import { buildLy } from './convert.ts'
import { parseLy } from './parse.ts'
import {
  draw,
  parseKeys,
  render,
  showCursor,
  type Key,
  type RenderState,
} from './editor.ts'

const SCORES_DIR = join(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  '..',
  'src',
  'content',
  'scores',
)

interface Options {
  name?: string
  title?: string
  artist?: string
  beats: number
  tempo: number
}

function usage(): string {
  return [
    'uketab — ukulele tab editor',
    '',
    '  bun uketab [name] [options]',
    '',
    'Opens an existing score from src/content/scores/<name>.ly for editing',
    'when it exists; otherwise starts a new song with that name.',
    '',
    'Options:',
    '  --title TITLE   title for the score header',
    '  --artist ARTIST artist for the score header',
    '  --beats N       beats per bar (default 4)',
    '  --tempo N       tempo in bpm (default 90)',
    '  --help          show this help',
    '',
    'Keys:',
    '  arrows / hjkl   move                space  insert column at cursor',
    '  0-9             type fret (right)   backspace  delete column at cursor',
    '  -               sustain note        ↓      move down between chord notes',
    '  x               clear cell (rest)   I / D  insert / delete column',
    '  u               undo                s      save',
    '  q               quit',
  ].join('\n')
}

function parseArgs(argv: string[]): Options | { help: true } {
  const opts: Options = { beats: 4, tempo: 90 }
  const positional: string[] = []
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    const next = () => argv[++i]
    switch (arg) {
      case '--title':
        opts.title = next()
        break
      case '--artist':
        opts.artist = next()
        break
      case '--beats':
        opts.beats = Number(next())
        break
      case '--tempo':
        opts.tempo = Number(next())
        break
      case '--help':
      case '-h':
        return { help: true }
      default:
        if (arg.startsWith('-')) {
          console.error(`unknown option: ${arg}`)
          process.exit(1)
        }
        positional.push(arg)
    }
  }
  if (positional[0]) opts.name = positional[0]
  if (!Number.isInteger(opts.beats) || opts.beats < 1 || opts.beats > 16) {
    console.error('--beats must be an integer between 1 and 16')
    process.exit(1)
  }
  if (!Number.isFinite(opts.tempo) || opts.tempo < 1) {
    console.error('--tempo must be a positive number')
    process.exit(1)
  }
  return opts
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

type Mode =
  | { kind: 'edit' }
  | { kind: 'prompt'; field: 'name' | 'title' | 'artist'; label: string }
  | { kind: 'confirm-quit' }

interface Session {
  tab: UkeTab
  opts: Options
  name: string
  title: string
  artist: string
  mode: Mode
  input: string
  pending: string
  quitting: boolean
}

function promptLines(session: Session): RenderState {
  const base = render(session.tab, session.name)
  const termCols = process.stdout.columns ?? 80
  base.lines[base.lines.length - 1] = ''
  const mode = session.mode
  if (mode.kind === 'prompt') {
    base.lines[base.lines.length - 1] =
      `${mode.label} [${session.input}${'\u2588'}] (enter ok, ctrl-c cancel)`.slice(
        0,
        termCols,
      )
    base.cursorRow = base.lines.length
    base.cursorCol = Math.min(
      mode.label.length + session.input.length + 3,
      termCols,
    )
  } else if (mode.kind === 'confirm-quit') {
    base.lines[base.lines.length - 1] =
      'Unsaved changes — press y to quit, any other key to keep editing'
  }
  return base
}

function onKey(session: Session, key: Key): void {
  const { tab, mode } = session

  if (mode.kind === 'prompt') {
    if (key === 'ctrl-c') {
      session.mode = { kind: 'edit' }
      tab.message = 'cancelled'
    } else if (key === 'enter') {
      const value = session.input.trim()
      if (mode.field === 'name') {
        session.name = slugify(value) || 'untitled'
      } else if (mode.field === 'title') {
        session.title = value || session.name
      } else if (mode.field === 'artist') {
        session.artist = value
      }
      session.input = ''
      advanceSave(session)
    } else if (key === 'backspace') {
      session.input = session.input.slice(0, -1)
    } else if (key.length === 1 && key >= ' ') {
      session.input += key
    }
    return
  }

  if (mode.kind === 'confirm-quit') {
    if (key === 'y') session.quitting = true
    session.mode = { kind: 'edit' }
    return
  }

  switch (key) {
    case 'up':
    case 'k':
      tab.move(-1, 0)
      break
    case 'down':
    case 'j':
      tab.move(1, 0)
      break
    case 'left':
    case 'h':
      tab.move(0, -1)
      break
    case 'right':
    case 'l':
      tab.move(0, 1)
      break
    case 'home':
      tab.move(0, -tab.width)
      break
    case 'end':
      tab.move(0, tab.width)
      break
    case 'backspace':
      tab.deleteColumn()
      break
    case 'delete':
      tab.clearCell()
      break
    case '-':
      tab.sustain()
      break
    case ' ':
      tab.insertColumn()
      break
    case 'x':
      tab.clearCell()
      break
    case 'u':
      tab.undo()
      break
    case 'I':
      tab.insertColumn()
      break
    case 'D':
      tab.deleteColumn()
      break
    case 's':
      startSave(session)
      break
    case 'q':
    case 'ctrl-c':
      if (tab.dirty) session.mode = { kind: 'confirm-quit' }
      else session.quitting = true
      break
    default:
      if (/^[0-9]$/.test(key)) tab.typeFret(key)
  }
}

/** The next field that still needs prompting, or null when done. */
function nextPrompt(session: Session): Mode | null {
  if (!session.name)
    return { kind: 'prompt', field: 'name', label: 'Song id (file name)' }
  if (!session.title) return { kind: 'prompt', field: 'title', label: 'Title' }
  if (!session.artist)
    return { kind: 'prompt', field: 'artist', label: 'Artist' }
  return null
}

function startSave(session: Session): void {
  const next = nextPrompt(session)
  session.mode = next ?? { kind: 'edit' }
  if (!next) {
    session.tab.dirty = false
    void doSave(session)
  }
}

function advanceSave(session: Session): void {
  const next = nextPrompt(session)
  session.mode = next ?? { kind: 'edit' }
  if (!next) {
    session.tab.dirty = false
    void doSave(session)
  }
}

/** Write synchronously so saving can never race with quitting. */
function doSave(session: Session): void {
  const path = join(SCORES_DIR, `${session.name}.ly`)
  try {
    const ly = buildLy(session.tab.grid, {
      title: session.title,
      artist: session.artist,
      tempo: session.opts.tempo,
      beatsPerBar: session.opts.beats,
    })
    mkdirSync(dirname(path), { recursive: true })
    writeFileSync(path, ly)
    session.tab.message = `saved ${path} — reference it in a post with score: ${session.name}`
  } catch (err) {
    session.tab.dirty = true
    session.tab.message = `save failed: ${err}`
  }
}

async function main(): Promise<void> {
  const parsed = parseArgs(process.argv.slice(2))
  if ('help' in parsed) {
    console.log(usage())
    return
  }
  const opts = parsed

  const session: Session = {
    tab: new UkeTab(opts.beats),
    opts,
    name: opts.name ? slugify(opts.name) : '',
    title: opts.title ?? '',
    artist: opts.artist ?? '',
    mode: { kind: 'edit' },
    input: '',
    pending: '',
    quitting: false,
  }

  // Opening an existing score: load it back into the grid for editing.
  if (session.name) {
    const path = join(SCORES_DIR, `${session.name}.ly`)
    if (existsSync(path)) {
      try {
        const parsed = parseLy(readFileSync(path, 'utf8'))
        session.tab.grid = parsed.grid
        session.tab.beatsPerBar = parsed.meta.beatsPerBar ?? opts.beats
        opts.beats = session.tab.beatsPerBar
        opts.tempo = parsed.meta.tempo ?? opts.tempo
        session.title = parsed.meta.title ?? session.title
        session.artist = parsed.meta.artist ?? session.artist
        session.tab.message =
          `loaded ${path}` +
          (parsed.warnings.length > 0 ? ` — ${parsed.warnings.join('; ')}` : '')
      } catch (err) {
        session.tab.message = `couldn't load ${path}: ${err}`
      }
    }
  }

  const stdin = process.stdin
  ;(stdin as any).setRawMode(true)
  stdin.resume()
  stdin.setEncoding('utf8')

  let quitting = false

  const cleanup = (): void => {
    showCursor(true)
    process.stdout.write('\x1b[?1049l')
    ;(stdin as any).setRawMode(false)
    process.stdout.write(
      session.tab.dirty ? 'quitted without saving\n' : 'bye\n',
    )
  }

  const quit = (): void => {
    if (quitting) return
    quitting = true
    stdin.removeListener('data', onData)
    stdin.removeListener('end', onEnd)
    process.stdout.removeListener('resize', onResize)
    cleanup()
    process.exit(0)
  }

  const redraw = (): void => draw(promptLines(session))

  const onData = (chunk: string): void => {
    const { keys, pending } = parseKeys(chunk, session.pending)
    session.pending = pending
    for (const key of keys) {
      onKey(session, key)
      if (session.quitting) {
        quit()
        return
      }
    }
    redraw()
  }

  const onResize = (): void => {
    // The terminal width changed: re-render so lines clip at the new width
    // instead of wrapping.
    redraw()
  }

  const onEnd = (): void => {
    if (session.tab.dirty) {
      cleanup()
      process.stdout.write('quitted without saving\n')
    }
    process.exit(0)
  }

  stdin.on('data', onData)
  stdin.on('end', onEnd)
  process.stdout.on('resize', onResize)

  process.stdout.write('\x1b[?1049h') // alternate screen
  showCursor(false)
  draw(render(session.tab, session.name))
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
