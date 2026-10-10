// Picks the connection string for Prisma CLI commands. DIRECT_URL wins when
// set. Otherwise a Neon pooled host ("<endpoint>-pooler.<region>.neon.tech")
// is turned into its direct host by dropping "-pooler", because migrations
// need a session-level advisory lock that the pooler cannot keep.
export function migrationUrl(env) {
  if (env.DIRECT_URL) return env.DIRECT_URL;
  const value = env.DATABASE_URL;
  if (!value || !URL.canParse(value)) return value;
  const url = new URL(value);
  if (/^[a-z0-9-]+-pooler\.[a-z0-9.-]+\.neon\.tech$/i.test(url.hostname)) {
    url.hostname = url.hostname.replace("-pooler.", ".");
    return url.toString();
  }
  return value;
}
