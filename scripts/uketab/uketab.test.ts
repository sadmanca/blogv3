import { describe, expect, test } from 'bun:test'
import {
  buildLy,
  durationToken,
  gridToLilypond,
  gridToNotes,
} from './convert.ts'
import { clipStyled, render } from './editor.ts'
import { UkeTab, emptyGrid, fretPitch, pitchName } from './model.ts'

describe('pitchName', () => {
  test('maps semitone indices to absolute LilyPond pitches', () => {
    expect(pitchName(12)).toBe("c'") // middle C
    expect(pitchName(16)).toBe("e'")
    expect(pitchName(19)).toBe("g'")
    expect(pitchName(21)).toBe("a'")
    expect(pitchName(13)).toBe("cis'")
    expect(pitchName(17)).toBe("f'")
    expect(pitchName(7)).toBe('g')
    expect(pitchName(0)).toBe('c')
    expect(pitchName(24)).toBe("c''")
    expect(pitchName(31)).toBe("g''")
  })

  test('fretPitch maps (string, fret) positions', () => {
    expect(fretPitch('G', 0)).toBe("g'")
    expect(fretPitch('G', 2)).toBe("a'")
    expect(fretPitch('C', 0)).toBe("c'")
    expect(fretPitch('C', 1)).toBe("cis'")
    expect(fretPitch('E', 1)).toBe("f'")
    expect(fretPitch('E', 5)).toBe("a'")
    expect(fretPitch('A', 0)).toBe("a'")
    expect(fretPitch('G', 12)).toBe("g''")
  })
})

describe('durationToken', () => {
  test('maps beat counts to LilyPond durations', () => {
    expect(durationToken(1)).toBe('4')
    expect(durationToken(2)).toBe('2')
    expect(durationToken(3)).toBe('2.')
    expect(durationToken(4)).toBe('1')
    expect(durationToken(5)).toBe('1~4')
    expect(durationToken(6)).toBe('1~2')
    expect(durationToken(7)).toBe('1~2.')
    expect(durationToken(8)).toBe('1~1')
  })
})

describe('gridToNotes', () => {
  test('sustain dashes extend the previous note on the same string', () => {
    const grid = emptyGrid(4)
    grid[0][0] = '2'
    grid[0][1] = '-'
    grid[0][2] = '-'
    grid[0][3] = '-'
    const { notes, warnings } = gridToNotes(grid)
    expect(notes).toHaveLength(1)
    expect(notes[0]).toMatchObject({ string: 0, fret: 2, start: 0, beats: 4 })
    expect(warnings).toHaveLength(0)
  })

  test('a dash with no preceding note warns', () => {
    const grid = emptyGrid(4)
    grid[1][2] = '-'
    const { notes, warnings } = gridToNotes(grid)
    expect(notes).toHaveLength(0)
    expect(warnings).toHaveLength(1)
    expect(warnings[0]).toContain('C')
  })

  test('a new digit ends the sustain run', () => {
    const grid = emptyGrid(4)
    grid[3][0] = '0'
    grid[3][1] = '-'
    grid[3][2] = '3'
    const { notes } = gridToNotes(grid)
    expect(notes.map((n) => [n.fret, n.beats])).toEqual([
      [0, 2],
      [3, 1],
    ])
  })
})

describe('gridToLilypond', () => {
  test('the F chord (2-0-1) on beat one, rest of the bar', () => {
    const grid = emptyGrid(4)
    grid[0][0] = '2' // G string
    grid[1][0] = '0' // C string
    grid[2][0] = '1' // E string
    const { music, warnings } = gridToLilypond(grid, 4)
    expect(warnings).toHaveLength(0)
    expect(music).toBe("<c'\\2 f'\\3 a'\\1>4")
  })

  test('rests fill empty columns between notes', () => {
    const grid = emptyGrid(6)
    grid[1][0] = '0' // c' on beat one
    grid[1][3] = '0' // c' on beat four
    const { music } = gridToLilypond(grid, 4)
    expect(music).toBe("c'4\\2 r4 r4 c'4\\2")
  })

  test('a trailing empty column is trimmed, but not trailing sustains', () => {
    const grid = emptyGrid(6)
    grid[0][0] = '0'
    grid[0][1] = '-'
    const { music } = gridToLilypond(grid, 4)
    expect(music).toBe("g'2\\1")
  })

  test('twinkle twinkle melody in first position', () => {
    const grid = emptyGrid(14)
    // c c g g a a g | f f e e d d c
    grid[1][0] = '0' // c'
    grid[1][1] = '0' // c'
    grid[0][2] = '0' // g'
    grid[0][3] = '0' // g'
    grid[0][4] = '2' // a'
    grid[0][5] = '2' // a'
    grid[0][6] = '0' // g'
    grid[2][7] = '1' // f'
    grid[2][8] = '1' // f'
    grid[2][9] = '0' // e'
    grid[2][10] = '0' // e'
    grid[1][11] = '2' // d'
    grid[1][12] = '2' // d'
    grid[1][13] = '0' // c'
    const { music } = gridToLilypond(grid, 4)
    expect(music).toBe(
      "c'4\\2 c'4\\2 g'4\\1 g'4\\1 | " +
        "a'4\\1 a'4\\1 g'4\\1 f'4\\3 | " +
        "f'4\\3 e'4\\3 e'4\\3 d'4\\2 | " +
        "d'4\\2 c'4\\2",
    )
  })

  test('two-digit frets', () => {
    const grid = emptyGrid(4)
    grid[0][0] = '12'
    const { music } = gridToLilypond(grid, 4)
    expect(music).toBe("g''4\\1")
  })

  test('sustain produces whole/half/dotted durations', () => {
    const grid = emptyGrid(8)
    grid[0][0] = '0'
    grid[0][1] = '-'
    grid[0][2] = '-'
    grid[0][3] = '-'
    grid[2][4] = '0'
    grid[2][5] = '-'
    grid[2][6] = '-'
    grid[1][7] = '0'
    const { music } = gridToLilypond(grid, 4)
    expect(music).toBe("g'1\\1 | e'2.\\3 c'4\\2")
  })

  test('partial bars are left open at the end', () => {
    const grid = emptyGrid(6)
    grid[1][0] = '0'
    grid[1][1] = '0'
    grid[1][2] = '0'
    grid[1][3] = '0'
    grid[1][4] = '0'
    grid[1][5] = '0'
    const { music } = gridToLilypond(grid, 4)
    expect(music).toBe("c'4\\2 c'4\\2 c'4\\2 c'4\\2 | c'4\\2 c'4\\2")
  })
})

describe('buildLy', () => {
  test('emits a complete score in the site format', () => {
    const grid = emptyGrid(4)
    grid[0][0] = '2'
    grid[1][0] = '0'
    grid[2][0] = '1'
    const ly = buildLy(grid, {
      title: 'My Song',
      artist: 'Some Artist',
      tempo: 120,
      beatsPerBar: 4,
    })
    expect(ly).toContain('\\version "2.26.0"')
    expect(ly).toContain('title = "My Song"')
    expect(ly).toContain('composer = "Some Artist"')
    expect(ly).toContain("stringTunings = \\stringTuning <a' e' c' g'>")
    expect(ly).toContain('\\time 4/4')
    expect(ly).toContain('\\tempo 4 = 120')
    expect(ly).toContain("<c'\\2 f'\\3 a'\\1>4")
    expect(ly).toContain(
      '\\context {\n      \\TabVoice\n      \\omit StringNumber\n    }',
    )
  })

  test('escapes quotes in header fields', () => {
    const grid = emptyGrid(4)
    const ly = buildLy(grid, { title: 'A "Quoted" Song' })
    expect(ly).toContain('title = "A \\"Quoted\\" Song"')
  })
})

describe('UkeTab editor', () => {
  test('typing frets auto-advances to the next column', () => {
    const tab = new UkeTab()
    tab.typeFret('2')
    expect([tab.row, tab.col]).toEqual([0, 1])
    expect(tab.grid[0][0]).toBe('2')
    tab.typeFret('0')
    tab.typeFret('1')
    expect(tab.grid[0][1]).toBe('0')
    expect(tab.grid[0][2]).toBe('1')
    expect([tab.row, tab.col]).toEqual([0, 3])
  })

  test('a chord is stacked in one column by moving down-left between notes', () => {
    const tab = new UkeTab()
    tab.typeFret('2') // G string, col 0
    tab.move(1, -1) // C string, col 0
    tab.typeFret('0')
    tab.move(1, -1) // E string, col 0
    tab.typeFret('1')
    tab.move(1, -1) // A string, col 0
    tab.typeFret('0')
    expect(tab.grid[0][0]).toBe('2')
    expect(tab.grid[1][0]).toBe('0')
    expect(tab.grid[2][0]).toBe('1')
    expect(tab.grid[3][0]).toBe('0')
  })

  test('two-digit frets append to the current cell', () => {
    const tab = new UkeTab()
    tab.typeFret('1')
    tab.move(0, -1)
    tab.typeFret('2')
    expect(tab.grid[0][0]).toBe('12')
  })

  test('typing a digit over a two-digit fret replaces it', () => {
    const tab = new UkeTab()
    tab.typeFret('1')
    tab.move(0, -1)
    tab.typeFret('2')
    tab.typeFret('3')
    expect(tab.grid[0][0]).toBe('3')
  })

  test('undo restores the previous grid', () => {
    const tab = new UkeTab()
    tab.typeFret('2')
    tab.typeFret('0')
    tab.undo()
    expect(tab.grid[0][0]).toBe('2')
    expect(tab.grid[0][1]).toBe('')
  })

  test('insert and delete columns', () => {
    const tab = new UkeTab()
    tab.typeFret('2')
    tab.col = 0
    tab.insertColumn()
    expect(tab.grid[0][0]).toBe('')
    expect(tab.grid[0][1]).toBe('2')
    tab.deleteColumn()
    expect(tab.grid[0][0]).toBe('2')
  })

  test('space-style insert at the cursor shifts everything right', () => {
    const tab = new UkeTab()
    tab.typeFret('2') // col 0
    tab.typeFret('0') // col 1
    tab.typeFret('1') // col 2
    tab.col = 1
    tab.insertColumn()
    expect(tab.grid[0].slice(0, 4)).toEqual(['2', '', '0', '1'])
  })

  test('backspace-style delete removes the column and shifts the rest left', () => {
    const tab = new UkeTab()
    tab.typeFret('2') // col 0
    tab.typeFret('0') // col 1
    tab.typeFret('1') // col 2
    tab.col = 1
    tab.deleteColumn()
    expect(tab.grid[0].slice(0, 2)).toEqual(['2', '1'])
  })

  test('grid auto-extends as you type past the last column', () => {
    const tab = new UkeTab()
    expect(tab.width).toBe(4)
    for (let i = 0; i < 6; i++) tab.typeFret('0')
    expect(tab.width).toBe(7)
    expect(tab.col).toBe(6)
  })

  test('moving right past the last column creates a new column', () => {
    const tab = new UkeTab()
    expect(tab.width).toBe(4)
    tab.move(0, 99)
    expect(tab.width).toBe(4)
    tab.col = 3
    tab.move(0, 1)
    expect(tab.width).toBe(5)
    expect(tab.col).toBe(4)
    tab.move(0, 1)
    expect(tab.width).toBe(6)
    expect(tab.col).toBe(5)
  })
})

describe('render', () => {
  const strip = (s: string): string => s.replace(/\x1b\[[0-9;]*m/g, '')

  test('renders the tab rows with the typed notes in place', () => {
    const tab = new UkeTab()
    tab.typeFret('0')
    tab.typeFret('1')
    tab.typeFret('2')
    tab.typeFret('3')
    const lines = render(tab, 'song', 80).lines
    expect(strip(lines[2])).toMatch(/^G \| 0  1  2  3/)
    expect(strip(lines[3])).toMatch(/^C \|/)
    expect(strip(lines[4])).toMatch(/^E \|/)
    expect(strip(lines[5])).toMatch(/^A \|/)
  })

  test('cursor column accounts for bar lines', () => {
    const tab = new UkeTab()
    tab.col = 0
    expect(render(tab, 'song', 80).cursorCol).toBe(5)
    tab.col = 3
    expect(render(tab, 'song', 80).cursorCol).toBe(14)
    tab.col = 4
    expect(render(tab, 'song', 80).cursorCol).toBe(19)
    tab.col = 7
    expect(render(tab, 'song', 80).cursorCol).toBe(28)
  })

  test('no line ever wraps: every row fits the terminal width', () => {
    const tab = new UkeTab()
    for (let i = 0; i < 60; i++) tab.typeFret('0')
    tab.move(0, 40)
    const state = render(tab, 'song', 40)
    for (const line of state.lines) {
      expect(strip(line).length).toBeLessThanOrEqual(40)
    }
    expect(state.cursorCol).toBeLessThanOrEqual(40)
  })

  test('a wide grid scrolls the viewport to keep the cursor visible', () => {
    const tab = new UkeTab()
    for (let i = 0; i < 60; i++) tab.typeFret('0')
    tab.col = 59
    const state = render(tab, 'song', 40)
    // The cursor's column is visible, on screen, within the width.
    expect(state.cursorCol).toBeGreaterThan(4)
    expect(state.cursorCol).toBeLessThanOrEqual(40)
    // The last visible cell is the cursor's column: the viewport scrolled.
    expect(strip(state.lines[2]).endsWith('0  | ')).toBe(true)
  })

  test('a narrow terminal shows fewer columns without breaking', () => {
    const tab = new UkeTab()
    for (let i = 0; i < 20; i++) tab.typeFret('0')
    const state = render(tab, 'song', 20)
    for (const line of state.lines) {
      expect(strip(line).length).toBeLessThanOrEqual(20)
    }
    expect(state.cursorCol).toBeLessThanOrEqual(20)
  })

  test('clipping keeps ANSI codes intact', () => {
    const clipped = clipStyled('\x1b[36m\x1b[1muketab\x1b[0m', 5)
    expect(clipped).toContain('\x1b[36m')
    expect(clipped).toContain('\x1b[1m')
    expect(clipped.endsWith('\x1b[0m')).toBe(true)
    expect(clipped.replace(/\x1b\[[0-9;]*m/g, '')).toBe('uketa')
  })
})
