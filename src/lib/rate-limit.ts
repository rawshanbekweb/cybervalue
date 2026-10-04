// Bounded, per-process limiter. Use an edge/WAF rule for multi-instance deployments.
// First hop of x-forwarded-for, which the hosting proxy sets; "unknown" when
// absent so such requests share one bucket instead of bypassing the limit.
export function clientKey(forwardedFor: string | null) {
  return forwardedFor?.split(",")[0]?.trim() || "unknown";
}

const buckets = new Map<string, { count: number; expires: number }>();
export function allowRequest(
  key: string,
  now = Date.now(),
  max = 30,
  windowMs = 60000,
) {
  for (const [id, bucket] of buckets)
    if (bucket.expires <= now) buckets.delete(id);
  const bucket = buckets.get(key);
  if (bucket) {
    if (bucket.count >= max) return false;
    bucket.count += 1;
    return true;
  }
  if (buckets.size >= 10000) return false;
  buckets.set(key, { count: 1, expires: now + windowMs });
  return true;
}

export function forgetRequests(key: string) {
  buckets.delete(key);
}

// Returns the hit count for `key` in its current window, across all instances.
export type HitStore = (key: string, windowMs: number) => Promise<number>;

// The process-local check runs first so a burst never reaches the shared
// store. Store failures fall back to the local verdict rather than locking
// every visitor out while the database is unavailable.
export async function allowShared(
  key: string,
  max: number,
  windowMs: number,
  store: HitStore | null,
  now = Date.now(),
) {
  if (!allowRequest(key, now, max, windowMs)) return false;
  if (!store) return true;
  try {
    return (await store(key, windowMs)) <= max;
  } catch {
    return true;
  }
}
