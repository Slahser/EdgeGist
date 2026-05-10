import { filenameHasPathSeparator } from '../filenames'

export type TextReadableFile = {
  name: string
  text(): Promise<string>
}

export type UploadedTextFile = {
  filename: string
  content: string
}

export type DraftFilename = {
  filename: string
  deleted?: boolean
}

export async function readUploadedTextFiles(
  files: Iterable<TextReadableFile>,
  existingFilenames: Iterable<string> = [],
): Promise<UploadedTextFile[]> {
  const readFiles = await Promise.all(
    Array.from(files).map(async (file) => ({
      content: await file.text(),
      name: file.name,
    })),
  )
  if (readFiles.some((file) => filenameHasPathSeparator(file.name))) {
    throw new Error('filename cannot contain /')
  }
  const usedFilenames = new Set(existingFilenames)

  return readFiles.map((file) => {
    const filename = uniqueFilename(file.name, usedFilenames)
    usedFilenames.add(filename)
    return {
      filename,
      content: file.content,
    }
  })
}

export function activeDraftFilenames(files: readonly DraftFilename[]): string[] {
  return files
    .filter((file) => !file.deleted)
    .map((file) => file.filename)
}

export function prependUploadedTextFiles<T>(
  files: readonly T[],
  uploadedFiles: readonly UploadedTextFile[],
  createFile: (file: UploadedTextFile) => T,
): T[] {
  return [...uploadedFiles.map(createFile).reverse(), ...files]
}

export function uploadedTextFilesToUpdateFiles(
  uploadedFiles: readonly UploadedTextFile[],
): Record<string, { content: string }> {
  return Object.fromEntries(
    uploadedFiles.map((file) => [
      file.filename,
      {
        content: file.content,
      },
    ]),
  )
}

export function duplicateFilename(filename: string, existingNames: Iterable<string>) {
  const existing = new Set(existingNames)
  const lastSlash = filename.lastIndexOf('/')
  const directory = lastSlash >= 0 ? `${filename.slice(0, lastSlash + 1)}` : ''
  const basename = lastSlash >= 0 ? filename.slice(lastSlash + 1) : filename
  const lastDot = basename.lastIndexOf('.')
  const hasExtension = lastDot > 0
  const stem = hasExtension ? basename.slice(0, lastDot) : basename
  const extension = hasExtension ? basename.slice(lastDot) : ''

  for (let index = 1; index < 1000; index += 1) {
    const suffix = index === 1 ? ' copy' : ` copy ${index}`
    const candidate = `${directory}${stem}${suffix}${extension}`
    if (!existing.has(candidate)) return candidate
  }

  return `${directory}${stem} copy ${Date.now()}${extension}`
}

function uniqueFilename(filename: string, existingNames: Set<string>) {
  if (!existingNames.has(filename)) return filename
  return duplicateFilename(filename, existingNames)
}
