// FI0-10854: In-memory TTL cache for reference data (species, countries, commodities)
// These rarely change and are fetched on nearly every page load.

const DEFAULT_TTL_MS = 5 * 60_000; // 5 minutes

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry<any>>();

export function getCached<T>(key: string, fetcher: () => Promise<T>, ttlMs: number = DEFAULT_TTL_MS): Promise<T> {
  const entry = cache.get(key);
  if (entry && entry.expiresAt > Date.now()) {
    return Promise.resolve(entry.value);
  }

  return fetcher().then((value) => {
    cache.set(key, { value, expiresAt: Date.now() + ttlMs });
    return value;
  });
}

export function clearReferenceDataCache(): void {
  cache.clear();
}
