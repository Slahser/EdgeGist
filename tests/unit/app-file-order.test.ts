import { describe, expect, test } from 'bun:test'
import { gistFilePathsByCreatedAt } from '../../src/app/file-order'
import type { GistFile } from '../../src/app/types'

describe('app file order helpers', () => {
  test('orders numeric filenames by file created_at instead of object key order', () => {
    const files = {
      '1': gistFile('1', '2026-05-08T00:00:00.000Z'),
      '2': gistFile('2', '2026-05-08T00:00:00.000Z'),
      '3': gistFile('3', '2026-05-08T00:00:00.000Z'),
      '4': gistFile('4', '2026-05-08T01:00:00.000Z'),
    }

    expect(Object.keys(files)).toEqual(['1', '2', '3', '4'])
    expect(gistFilePathsByCreatedAt(files)).toEqual(['4', '1', '2', '3'])
  })

  test('uses filename order only when files share created_at', () => {
    expect(gistFilePathsByCreatedAt({
      z: gistFile('z', '2026-05-08T00:00:00.000Z'),
      a: gistFile('a', '2026-05-08T00:00:00.000Z'),
    })).toEqual(['a', 'z'])
  })
})

function gistFile(filename: string, createdAt: string): GistFile {
  return {
    filename,
    type: 'text/plain',
    language: null,
    raw_url: `https://edgegist.test/raw/${filename}`,
    size: 1,
    truncated: false,
    created_at: createdAt,
    updated_at: createdAt,
    content: filename,
  }
}
