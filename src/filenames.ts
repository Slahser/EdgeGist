export function filenameHasPathSeparator(filename: string): boolean {
  return filename.includes('/')
}

export function filenamePathSeparatorMessage(): string {
  return 'Validation Failed: filename cannot contain /'
}
