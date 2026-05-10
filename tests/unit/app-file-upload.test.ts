import { describe, expect, test } from 'bun:test'
import {
  activeDraftFilenames,
  duplicateFilename,
  prependUploadedTextFiles,
  readUploadedTextFiles,
  uploadedTextFilesToUpdateFiles,
  type TextReadableFile,
} from '../../src/app/file-upload'

describe('app text file upload helpers', () => {
  test('reads uploaded text files with filenames and content', async () => {
    const files = await readUploadedTextFiles([
      textFile('config.json', '{"enabled":true}'),
      textFile('script.js', 'console.log("ok")'),
    ])

    expect(files).toEqual([
      { filename: 'config.json', content: '{"enabled":true}' },
      { filename: 'script.js', content: 'console.log("ok")' },
    ])
  })

  test('generates non-conflicting filenames for existing and same-batch duplicates', async () => {
    const files = await readUploadedTextFiles(
      [
        textFile('README.md', 'new readme'),
        textFile('README.md', 'another readme'),
      ],
      ['README.md'],
    )

    expect(files).toEqual([
      { filename: 'README copy.md', content: 'new readme' },
      { filename: 'README copy 2.md', content: 'another readme' },
    ])
  })

  test('preserves extensions when duplicating filenames', () => {
    expect(duplicateFilename('setup.md', ['setup.md'])).toBe('setup copy.md')
    expect(duplicateFilename('setup.md', ['setup.md', 'setup copy.md'])).toBe('setup copy 2.md')
  })

  test('rejects uploaded filenames with path separators', async () => {
    await expect(readUploadedTextFiles([textFile('docs/setup.md', 'setup')])).rejects.toThrow('filename cannot contain /')
  })

  test('keeps empty uploaded content for save validation to reject later', async () => {
    const files = await readUploadedTextFiles([textFile('empty.txt', '')])

    expect(files).toEqual([{ filename: 'empty.txt', content: '' }])
  })

  test('rejects the whole batch when one uploaded file cannot be read', async () => {
    await expect(readUploadedTextFiles([
      textFile('ok.txt', 'ok'),
      unreadableFile('bad.txt'),
    ])).rejects.toThrow('cannot read bad.txt')
  })

  test('returns active draft filenames without deleted drafts', () => {
    expect(activeDraftFilenames([
      { filename: 'current.txt' },
      { filename: 'deleted.txt', deleted: true },
      { filename: 'next.txt', deleted: false },
    ])).toEqual(['current.txt', 'next.txt'])
  })

  test('prepends uploaded files in reverse order without changing existing draft entries', () => {
    const existing = [{ filename: 'notes.md', content: 'manual' }]
    const next = prependUploadedTextFiles(
      existing,
      [
        { filename: 'config.json', content: '{}' },
        { filename: 'todo.txt', content: 'todo' },
      ],
      (file) => ({ filename: file.filename, content: file.content }),
    )

    expect(next).toEqual([
      { filename: 'todo.txt', content: 'todo' },
      { filename: 'config.json', content: '{}' },
      { filename: 'notes.md', content: 'manual' },
    ])
    expect(existing).toEqual([{ filename: 'notes.md', content: 'manual' }])
  })

  test('creates additive update payloads for uploaded files only', () => {
    expect(uploadedTextFilesToUpdateFiles([
      { filename: 'todo.txt', content: 'one' },
      { filename: 'notes.md', content: 'two' },
    ])).toEqual({
      'todo.txt': { content: 'one' },
      'notes.md': { content: 'two' },
    })
  })
})

function textFile(name: string, content: string): TextReadableFile {
  return {
    name,
    text: () => Promise.resolve(content),
  }
}

function unreadableFile(name: string): TextReadableFile {
  return {
    name,
    text: () => Promise.reject(new Error(`cannot read ${name}`)),
  }
}
