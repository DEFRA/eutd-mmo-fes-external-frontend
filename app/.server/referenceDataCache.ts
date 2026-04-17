/**
 * In-process TTL cache for slow-changing reference data (countries, species).
 *
 * Reference data endpoints are called on *every single request* across 20+ loaders
 * and action handlers. Because the data changes at most a few times per year, it is
 * safe to hold a warm copy in the Node process memory and revalidate it periodically.
 *
 * TTL is intentionally conservative (5 minutes) so a deployment or a manual cache
 * bust will propagate quickly.  The cache is per-process, so each Node instance
 * maintains its own warm copy — that is fine; we are reducing network I/O, not
 * achieving distributed cache consistency.
 */

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

const store = new Map<string, CacheEntry<unknown>>();

export function cacheGet<T>(key: string): T | undefined {
  const entry = store.get(key) as CacheEntry<T> | undefined;
  if (!entry) return undefined;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return undefined;
  }
  return entry.value;
}

export function cacheSet<T>(key: string, value: T, ttlMs: number = CACHE_TTL_MS): void {
  store.set(key, { value, expiresAt: Date.now() + ttlMs });
}

/** Remove a single entry — useful for tests or forced revalidation. */
export function cacheInvalidate(key: string): void {
  store.delete(key);
}

/** Clear the entire cache — used in tests to isolate state. */
export function cacheClear(): void {
  store.clear();
}
