import { describe, expect, test } from 'bun:test'
import { buildLy } from './convert.ts'
import { UkeTab, emptyGrid } from './model.ts'
import { parseLy } from './parse.ts'

describe('parseLy', () => {
  test('round-trips a generated score back to the same grid', () => {
    const grid = emptyGrid(8)
    grid[0][0] = '2' // G string
    grid[1][0] = '0' // C string
    grid[2][0] = '1' // E string
    grid[0][4] = '0'
    grid[0][5] = '-'
    grid[0][6] = '-'
    grid[1][7] = '2' // d' after the 3-beat g'
    const ly = buildLy(grid, {
      title: 'My Song',
      artist: 'Some Artist',
      tempo: 110,
      beatsPerBar: 4,
    })
    const parsed = parseLy(ly)
    expect(parsed.warnings).toHaveLength(0)
    expect(parsed.meta).toEqual({
      title: 'My Song',
      artist: 'Some Artist',
      tempo: 110,
      beatsPerBar: 4,
    })
    expect(parsed.grid).toEqual(grid)
  })

  test('reads \time and \tempo from the score', () => {
    const ly = buildLy(emptyGrid(4), { beatsPerBar: 3, tempo: 160 })
    const parsed = parseLy(ly)
    expect(parsed.meta.beatsPerBar).toBe(3)
    expect(parsed.meta.tempo).toBe(160)
  })

  test('parses the twinkle demo: relative mode, no string numbers', () => {
    const ly = `\\version "2.26.0"

\\header {
  title = "Twinkle Twinkle Little Star"
  composer = "Traditional"
  tagline = ##f
}

\\score {
  \\new TabStaff {
    \\set TabStaff.stringTunings = #ukulele-tuning
    \\relative c' {
      c4 c g g a a g2 |
      f4 f e e d d c2 |
    }
  }
  \\layout {}
}
`
    const parsed = parseLy(ly)
    expect(parsed.warnings).toHaveLength(0)
    expect(parsed.meta.title).toBe('Twinkle Twinkle Little Star')
    expect(parsed.meta.artist).toBe('Traditional')
    //  c c g g a a g  f f e e d d c
    //  C0 C0 G0 G0 A0 A0 G0- E1 E1 E0 E0 C2 C2 C0-
    expect(parsed.grid[0]).toEqual([
      '',
      '',
      '0',
      '0',
      '',
      '',
      '0',
      '-',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
    ])
    expect(parsed.grid[1]).toEqual([
      '0',
      '0',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '2',
      '2',
      '0',
      '-',
    ])
    expect(parsed.grid[2]).toEqual([
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '1',
      '1',
      '0',
      '0',
      '',
      '',
      '',
      '',
    ])
    expect(parsed.grid[3]).toEqual([
      '',
      '',
      '',
      '',
      '0',
      '0',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
    ])
  })

  test('merges tied durations into one long note', () => {
    const grid = emptyGrid(5)
    grid[1][0] = '0'
    grid[1][1] = '-'
    grid[1][2] = '-'
    grid[1][3] = '-'
    grid[1][4] = '-'
    const ly = buildLy(grid, {})
    expect(ly).toContain("c'1~c'4\\2")
    const parsed = parseLy(ly)
    expect(parsed.warnings).toHaveLength(0)
    expect(parsed.grid).toEqual(grid)
  })

  test('quantizes sub-quarter durations with a warning', () => {
    const ly = `\\score {
  \\new TabStaff {
    \\time 4/4
    c'8 c'4
  }
  \\layout {}
}
`
    const parsed = parseLy(ly)
    expect(parsed.warnings.length).toBeGreaterThan(0)
    expect(parsed.warnings[0]).toContain('finer than a quarter note')
    expect(parsed.grid[1][0]).toBe('0')
    expect(parsed.grid[1][1]).toBe('0')
  })

  test('an empty or nonsense score yields an empty grid with a warning', () => {
    const parsed = parseLy('\\version "2.26.0"\n')
    expect(parsed.warnings.length).toBeGreaterThan(0)
    expect(parsed.grid[0]).toHaveLength(0)
  })
})

describe('edit round-trip via the editor', () => {
  test('a saved song reloads into the editor unchanged', () => {
    const tab = new UkeTab()
    tab.typeFret('2') // G col 0
    tab.move(1, -1)
    tab.typeFret('0') // C col 0
    tab.move(1, -1)
    tab.typeFret('1') // E col 0
    tab.move(1, -1)
    tab.typeFret('0') // A col 0
    for (let i = 0; i < 5; i++) tab.typeFret('0')
    const ly = buildLy(tab.grid, {
      title: 'Song',
      artist: 'Artist',
      tempo: 90,
      beatsPerBar: 4,
    })
    const parsed = parseLy(ly)
    expect(parsed.warnings).toHaveLength(0)
    // buildLy trims the trailing auto-created empty column, so compare the
    // part that survives.
    const expected = tab.grid.map((row) => row.slice(0, 6))
    expect(parsed.grid).toEqual(expected)
    expect(parsed.grid[0][0]).toBe('2')
    expect(parsed.grid[1][0]).toBe('0')
    expect(parsed.grid[3][1]).toBe('0')
  })
})
