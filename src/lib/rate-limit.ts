// Bounded, per-process limiter. Use an edge/WAF rule for multi-instance deployments.
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
