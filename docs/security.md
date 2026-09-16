# Security decisions

The first release has no public mutation, login, user registration or upload endpoint. The publishing boundary is the local importer and database credentials. `User` is an author record, not an admin identity. No client authorization, session or CSRF mechanism is claimed as implemented.

Public queries enforce `PUBLISHED`, a non-null publication date no later than now, and authorization for labs. Slug validation and collection matching apply to detail and OG routes. Relationships and sitemap use the same public predicate. Downloads query publication directly and never serve draft files from the public directory.

Markdown is parsed without raw HTML/MDX, passed through rehype-sanitize, and encoded by React. The default Markdown URL transformer rejects dangerous schemes. Inline images are ignored; approved local images use next/image. Dynamic JSON-LD escapes `<`. Import URLs accept HTTPS only, with no embedded credentials. Query lengths, pagination, taxonomy and enum values are bounded. Prisma query builders parameterize database values.

CSP restricts resources to self, disallows frames/objects, and restricts forms/base URI. Inline scripts/styles remain allowed because statically generated Next.js pages embed bootstrap data. This is a deliberate limitation: CSP is not a complete inline-XSS defense. A nonce policy requires dynamic rendering, or a verified hash/SRI deployment pipeline. Development additionally permits eval and websocket connections. HSTS is set for production; HTTPS must be configured at the host.

Downloads have a global per-process budget of 30 per minute. It does not trust `X-Forwarded-For`, which clients can spoof unless a proxy sanitizes it. The Map is bounded and expires entries. For a public multi-instance deployment, enforce per-client rate limits at the trusted edge/WAF, and cap request sizes there. The Node limiter is not a distributed abuse-prevention system. Archive filtering is bounded but should also be protected by host-level request limits at scale.

Download filenames are allowlisted and contained in a fixed private directory; symbolic links are rejected, size is capped, and responses force attachment with nosniff/no-store/noindex. Only the trusted operator can write resource files. Downloads are intentionally buffered under a 20 MiB limit. Files are not automatically scanned; operator review is required before publishing.

ISR can retain previously public content for more than the nominal revalidation period while a stale page is served and regenerated. Do not store secrets in any published record. For urgent unpublishing, purge CDN/ISR caches or redeploy. The local importer does not call a public cache-purge endpoint. Future admin implementation must provide authenticated cache invalidation, server authorization, secure HTTP-only sessions, CSRF protection, rate limiting and an audited upload boundary before exposure.

Never print environment secrets. Error UI hides stack traces; download errors return generic messages. Use least-privilege database credentials and TLS in production. Keep dependencies and lockfile maintained. Store backups and test restoration independently of the site deployment.
