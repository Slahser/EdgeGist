export const GISTS_LIST_CACHE_TAG = 'gists-list'

export function gistCacheTag(gistId: string): string {
  return `gist:${gistId}`
}

async function purgeTags(tags: string[]): Promise<void> {
  try {
    const { cache } = await import('cloudflare:workers')
    await cache.purge({ tags })
  } catch {
    // Workers runtime only; tests and local dev skip purge.
  }
}

export async function purgeGistCache(gistId: string): Promise<void> {
  await purgeTags([gistCacheTag(gistId), GISTS_LIST_CACHE_TAG])
}

export async function purgeGistsListCache(): Promise<void> {
  await purgeTags([GISTS_LIST_CACHE_TAG])
}
