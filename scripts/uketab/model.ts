/**
 * Core tab grid model for the uketab editor.
 *
 * A tab is a 4 x N grid. Rows are the ukulele strings, G C E A, top to
 * bottom (the standard way uke tabs are written). Columns are beat slots:
 * each column is one beat, and a bar line falls every `beatsPerBar` columns.
 *
 * Cell values:
 *   ''        rest (string not played)
 *   '-'       sustain: the previous note on this string keeps ringing
 *   '0'-'99'  fret number on this string
 */

export const STRINGS = ['G', 'C', 'E', 'A'] as const

export type StringName = (typeof STRINGS)[number]

export const NUM_STRINGS = STRINGS.length

/** Semitone index of each open string, with middle C (c' in LilyPond) = 12. */
export const STRING_PITCH: Record<StringName, number> = {
  G: 19, // g' (G4)
  C: 12, // c' (C4)
  E: 16, // e' (E4)
  A: 21, // a' (A4)
}

const PITCH_NAMES = [
  'c',
  'cis',
  'd',
  'dis',
  'e',
  'f',
  'fis',
  'g',
  'gis',
  'a',
  'ais',
  'b',
]

/** Render a semitone index (c' = 12) as an absolute LilyPond pitch. */
export function pitchName(semitones: number): string {
  const name = PITCH_NAMES[((semitones % 12) + 12) % 12]
  const octave = Math.floor(semitones / 12) // 0 = octave 3, rendered plain
  const marks = octave >= 0 ? "'".repeat(octave) : ','.repeat(-octave)
  return name + marks
}

/** LilyPond pitch for the given (string, fret) position. */
export function fretPitch(string: StringName, fret: number): string {
  return pitchName(STRING_PITCH[string] + fret)
}

export type Cell = string

export type Grid = Cell[][]

export function emptyGrid(cols = 4): Grid {
  return Array.from({ length: NUM_STRINGS }, () => Array(cols).fill(''))
}

export function gridWidth(grid: Grid): number {
  return grid[0].length
}

export function isFret(cell: Cell): boolean {
  return /^\d{1,2}$/.test(cell)
}

export function ensureColumns(grid: Grid, cols: number): void {
  for (const row of grid) {
    while (row.length < cols) row.push('')
  }
}

/** Interactive editing state. */
export class UkeTab {
  grid: Grid
  row = 0
  col = 0
  beatsPerBar: number
  history: Grid[] = []
  dirty = false
  message = ''

  constructor(beatsPerBar = 4) {
    this.beatsPerBar = beatsPerBar
    this.grid = emptyGrid()
  }

  private snapshot(): void {
    this.history.push(this.grid.map((row) => [...row]))
    if (this.history.length > 100) this.history.shift()
  }

  private mutate(): void {
    this.dirty = true
    this.message = ''
  }

  get width(): number {
    return gridWidth(this.grid)
  }

  cell(row: number, col: number): Cell {
    return this.grid[row]?.[col] ?? ''
  }

  setCell(row: number, col: number, value: Cell): void {
    ensureColumns(this.grid, col + 1)
    this.grid[row][col] = value
  }

  move(dRow: number, dCol: number): void {
    this.row = Math.max(0, Math.min(NUM_STRINGS - 1, this.row + dRow))
    // Moving right past the last column creates a new column, so the grid
    // grows as you navigate and type. Home/end (large dCol) stay clamped.
    const target = this.col + dCol
    if (dCol === 1 && target >= this.width) ensureColumns(this.grid, target + 1)
    this.col = Math.max(0, Math.min(this.width - 1, target))
  }

  /** Type a fret digit. Appends to a single-digit cell to make two-digit
   *  frets; auto-advances down the strings, wrapping to the next column. */
  typeFret(digit: string): void {
    const current = this.cell(this.row, this.col)
    if (isFret(current)) {
      const next = current + digit
      this.snapshot()
      this.setCell(this.row, this.col, next.length <= 2 ? next : digit)
      this.mutate()
      return
    }
    this.snapshot()
    this.setCell(this.row, this.col, digit)
    this.row += 1
    if (this.row >= NUM_STRINGS) {
      this.row = 0
      this.col += 1
      ensureColumns(this.grid, this.col + 1)
    }
    this.mutate()
  }

  /** Place/extend a sustain dash on the current cell. */
  sustain(): void {
    this.snapshot()
    this.setCell(this.row, this.col, '-')
    this.mutate()
  }

  /** Clear the current cell (a rest). */
  clearCell(): void {
    if (this.cell(this.row, this.col) === '') return
    this.snapshot()
    this.setCell(this.row, this.col, '')
    this.mutate()
  }

  backspace(): void {
    if (this.cell(this.row, this.col) !== '') {
      this.clearCell()
    } else if (this.col > 0) {
      this.col -= 1
    }
  }

  insertColumn(): void {
    this.snapshot()
    for (const row of this.grid) row.splice(this.col, 0, '')
    this.mutate()
  }

  deleteColumn(): void {
    if (this.width <= 1) return
    this.snapshot()
    for (const row of this.grid) row.splice(this.col, 1)
    if (this.col >= this.width) this.col = this.width - 1
    this.mutate()
  }

  undo(): void {
    const last = this.history.pop()
    if (last) {
      this.grid = last
      if (this.col >= this.width) this.col = this.width - 1
      this.dirty = true
      this.message = 'undone'
    } else {
      this.message = 'nothing to undo'
    }
  }

  /** Convenience: build a grid from per-string digit strings (top to bottom). */
  static fromStrings(rows: string[]): Grid {
    const width = Math.max(4, ...rows.map((r) => r.length))
    const grid = emptyGrid(width)
    rows.forEach((rowText, s) => {
      for (let c = 0; c < width; c++) {
        grid[s][c] = rowText[c] ?? ''
      }
    })
    return grid
  }
}
