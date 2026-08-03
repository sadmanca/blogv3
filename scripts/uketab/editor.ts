/**
 * Terminal UI for uketab: renders the tab grid with ANSI escapes and maps
 * raw terminal input to editor commands. Input handling is terminal-specific;
 * the editing logic itself lives in UkeTab (model.ts).
 */

import { STRINGS, isFret, type UkeTab } from './model.ts'

export const CELL_WIDTH = 2

const ANSI = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  inverted: '\x1b[7m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
}

function pad(value: string, width: number): string {
  return value.padEnd(width)
}

function cellText(cell: string): string {
  if (isFret(cell)) return pad(cell, CELL_WIDTH)
  if (cell === '-') return '--'
  return '  '
}

function styleCell(cell: string, cursor: boolean): string {
  const text = cellText(cell)
  let style = isFret(cell) ? ANSI.bold : ANSI.dim
  if (cursor) style = ANSI.inverted
  return style + text + ANSI.reset
}

export function stringRow(tab: UkeTab, row: number, colsShown: number): string {
  const name = ANSI.bold + STRINGS[row] + ANSI.reset
  const prefix = `${name} | `
  let line = prefix
  for (let c = 0; c < colsShown; c++) {
    const cursor = tab.row === row && tab.col === c
    line += styleCell(tab.cell(row, c), cursor) + ' '
    if ((c + 1) % tab.beatsPerBar === 0)
      line += ANSI.dim + '|' + ANSI.reset + ' '
  }
  return line
}

export function rulerRow(tab: UkeTab, colsShown: number): string {
  let line = '    '
  for (let c = 0; c < colsShown; c++) {
    const beat = (c % tab.beatsPerBar) + 1
    line += ANSI.dim + pad(String(beat), CELL_WIDTH) + ' ' + ANSI.reset
    if ((c + 1) % tab.beatsPerBar === 0) line += ANSI.dim + '| ' + ANSI.reset
  }
  return line
}

export interface RenderState {
  lines: string[]
  cursorRow: number // 1-based terminal row
  cursorCol: number // 1-based terminal column
}

export function render(tab: UkeTab, name: string): RenderState {
  const colsShown = Math.max(8, tab.width)
  const bar = Math.floor(tab.col / tab.beatsPerBar) + 1

  const title =
    ANSI.cyan +
    ANSI.bold +
    'uketab' +
    ANSI.reset +
    ` · ${name}${tab.dirty ? ANSI.yellow + ' *' + ANSI.reset : ''}` +
    `   ${tab.beatsPerBar}/4 · bar ${bar}`

  const lines: string[] = [
    title,
    '',
    stringRow(tab, 0, colsShown),
    stringRow(tab, 1, colsShown),
    stringRow(tab, 2, colsShown),
    stringRow(tab, 3, colsShown),
    rulerRow(tab, colsShown),
    '',
    ANSI.dim +
      'arrows/hjkl move · 0-9 fret · - sustain · space/x clear · u undo · s save · I/D insert/delete col · q quit' +
      ANSI.reset,
    tab.message ? ANSI.green + tab.message + ANSI.reset : '',
  ]

  const cursorRow = 3 + tab.row
  const cursorCol = 4 + tab.col * (CELL_WIDTH + 1) + 1
  return { lines, cursorRow, cursorCol }
}

export function clearScreen(): void {
  process.stdout.write('\x1b[2J\x1b[H')
}

export function draw(state: RenderState): void {
  clearScreen()
  process.stdout.write(state.lines.join('\n') + '\n')
  process.stdout.write(`\x1b[${state.cursorRow};${state.cursorCol}H`)
}

export type Key =
  | 'up'
  | 'down'
  | 'left'
  | 'right'
  | 'home'
  | 'end'
  | 'backspace'
  | 'delete'
  | 'enter'
  | 'ctrl-c'
  | string // a printable character

/**
 * Parse a raw input chunk into key tokens. Escape sequences may be split
 * across data events, so unparsable tails are kept in `pending`.
 */
export function parseKeys(
  chunk: string,
  pending = '',
): { keys: Key[]; pending: string } {
  const input = pending + chunk
  const keys: Key[] = []
  let i = 0

  while (i < input.length) {
    const ch = input[i]
    if (ch === '\x1b') {
      const rest = input.slice(i)
      const seq = rest.match(/^\x1b\[([ABCDHF3])(?:~)?/)
      const alt = rest.match(/^\x1bO([ABCDHF])/)
      if (seq) {
        switch (seq[1]) {
          case 'A':
            keys.push('up')
            break
          case 'B':
            keys.push('down')
            break
          case 'C':
            keys.push('right')
            break
          case 'D':
            keys.push('left')
            break
          case 'H':
            keys.push('home')
            break
          case 'F':
            keys.push('end')
            break
          case '3':
            keys.push('delete')
            break
        }
        i += seq[0].length
      } else if (alt) {
        switch (alt[1]) {
          case 'A':
            keys.push('up')
            break
          case 'B':
            keys.push('down')
            break
          case 'C':
            keys.push('right')
            break
          case 'D':
            keys.push('left')
            break
          case 'H':
            keys.push('home')
            break
          case 'F':
            keys.push('end')
            break
        }
        i += alt[0].length
      } else if (rest.length < 4) {
        // Unfinished sequence (e.g. just "\x1b["): keep it for the next chunk.
        return { keys, pending: rest }
      } else {
        i += 1 // lone escape; ignore
      }
    } else if (ch === '\x7f') {
      keys.push('backspace')
      i += 1
    } else if (ch === '\r' || ch === '\n') {
      keys.push('enter')
      i += 1
    } else if (ch === '\x03') {
      keys.push('ctrl-c')
      i += 1
    } else if (ch === '\x01') {
      keys.push('home')
      i += 1
    } else if (ch === '\x05') {
      keys.push('end')
      i += 1
    } else if (ch < ' ') {
      i += 1 // ignore other control chars
    } else {
      keys.push(ch)
      i += 1
    }
  }

  return { keys, pending: '' }
}

export function showCursor(visible: boolean): void {
  process.stdout.write(visible ? '\x1b[?25h' : '\x1b[?25l')
}
