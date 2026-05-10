import type { GistFile } from './types'

export function gistFilePathsByCreatedAt(files: Record<string, GistFile>): string[] {
  return Object.values(files)
    .sort(compareGistFilesByCreatedAt)
    .map((file) => file.filename)
}

export function gistFilesByCreatedAt<T extends GistFile>(files: Record<string, T>): T[] {
  return Object.values(files).sort(compareGistFilesByCreatedAt)
}

function compareGistFilesByCreatedAt(left: GistFile, right: GistFile): number {
  return right.created_at.localeCompare(left.created_at) || left.filename.localeCompare(right.filename)
}
