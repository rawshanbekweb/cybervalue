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
