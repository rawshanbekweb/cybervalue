# CyberValue

A personal cybersecurity and software development portfolio for Rawshanbek Gayipbaev. No demo achievements, fabricated projects, or invented social accounts are seeded.

## Run locally

Requires Node.js 22.12+ (Node 24 recommended) and npm. On Windows PowerShell, use `npm.cmd` if execution policy blocks `npm.ps1`.

```sh
npm install
cp .env.example .env
npm run dev
```

In PowerShell, use `Copy-Item .env.example .env`. Visit http://localhost:3000. A database is optional for the empty preview; configured database failures are not silently hidden.

## Architecture and folders

Next.js App Router with Server Components, TypeScript, Tailwind CSS, PostgreSQL/Prisma, and Zod. Home, about, activity, content details, and sitemap use static generation/60-second ISR. Searchable archives use server rendering. Only navigation and error recovery need client components.

```text
src/app/                   Public routes, metadata, error states, downloads
src/components/            Shared UI, archives, case studies, safe Markdown
src/lib/                   Database queries, validation, metadata, site config
src/generated/prisma/      Generated client (not committed)
prisma/schema.prisma       Normalized content model
prisma/migrations/         Versioned PostgreSQL migration
scripts/import-content.ts  Validated, local-only content publishing
content/templates/         Draft authoring templates (never publicly loaded)
content/private/downloads/ Private downloadable files (not committed)
public/images/             Reviewed public screenshots
tests/                     Unit and Playwright accessibility/SEO tests
docs/                      Architecture, publishing, security, deployment
```

Shared `Content` records contain unique stable slugs, publication state, dates, metadata, author, category, tags, images, and related content. `Project`, `Lab`, `ResearchArticle`, `CTFEvent`, and `Resource` are one-to-one detail tables. `User` stores authorship, and `SocialLink` stores verified links. Activity is derived from published records rather than separately maintained. The importer enforces type consistency and authorized labs.

## Environment

| Variable         | Purpose                                                              |
| ---------------- | -------------------------------------------------------------------- |
| `DATABASE_URL`   | PostgreSQL connection string; leave blank for empty preview          |
| `SITE_URL`       | Canonical origin, defaults to `http://localhost:3000`                |
| `SITE_INDEXABLE` | `false` for previews; set `true` explicitly on the real HTTPS domain |
| `GITHUB_URL`     | Optional real HTTPS profile URL                                      |
| `LINKEDIN_URL`   | Optional real HTTPS profile URL                                      |
| `TELEGRAM_URL`   | Optional real HTTPS channel/profile URL                              |
| `INSTAGRAM_URL`  | Optional real HTTPS profile URL                                      |

No secrets use a `NEXT_PUBLIC_` prefix. Environment errors identify invalid variable names without printing values. Social links are centrally managed through environment variables or the `SocialLink` table; database values override matching platforms.

## Database and content

Create a PostgreSQL database, set `DATABASE_URL`, then run:

```sh
npm run db:generate
npm run db:deploy
npm run content:import -- content/templates/research.json --validate-only
```

For future schema changes during development:

```sh
npm run db:migrate -- --name describe_change
```

Write actual content using [the publishing guide](docs/content.md), validate it, then import it. There is no automatic seed. Drafts, archived entries, future publication dates, and unauthorized labs are excluded from public reads, related entries, search, images and downloads. Previously public pages may remain in ISR/CDN caches until regeneration; redeploy or purge caches for immediate removal.

## Verification and production build

```sh
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e
npm run format:check
npm start
```

Install the Playwright browser once if needed: `npx playwright install chromium`. Browser tests cover public routes, unique titles, canonical and OG metadata, JSON-LD parsing, links, redirects, 404s, security headers, filters, widths from 320–1440px, keyboard navigation, and automated accessibility.

## SEO

Every public page has route-specific Metadata API output, canonical URL, Open Graph, and Twitter card. Detail pages generate 1200×630 previews. Person, WebSite, TechArticle/CreativeWork and BreadcrumbList JSON-LD reflect visible content. Sitemap entries are publication-filtered with actual content `updatedAt`; static page dates are omitted rather than invented. Query/filter pages use the base archive canonical and `noindex,follow`. Search is `noindex`. Next.js redirects trailing slashes.

**Production indexing is intentionally off until the real domain is configured.** Set `SITE_URL=https://your-real-domain` and `SITE_INDEXABLE=true`, rebuild, then verify robots and sitemap. Never use this flag as access control for private content.

## Security

Security headers include CSP, HSTS in production, anti-framing, MIME sniffing prevention, referrer and permissions policies. Markdown has no raw HTML/MDX execution, is sanitized, blocks unsafe URL schemes, and ignores inline images. Reviewed local screenshots use `next/image` with dimensions and alt text. JSON-LD escapes HTML delimiters. Zod validates imports, query filters, slugs, file paths, social links and environment configuration. Prisma uses typed parameterized queries. Download routes verify publication, constrain paths and size, disallow symlinks, force attachments, and apply a bounded process-wide rate limit.

There is no public write API, file upload, admin, login, cookie, or session surface. Authentication/CSRF is deferred until there is an actual private admin. See [security tradeoffs](docs/security.md).

## Deploy and remaining work

Follow [deployment instructions](docs/deployment.md). Deploy as a Node.js Next.js application or on Vercel with PostgreSQL; this is not a static export.

Owner input still required: real domain, database credentials, verified social links, real projects/research/resources, and confirmation of personal copy. No hosting account or production database is created automatically.

Known limits: no admin CMS/authentication; no public uploads, analytics, RSS or external search; substring search and facet enumeration suit a modest archive; activity shows the newest 50 entries with a link to search; download files use the deployment filesystem (use persistent storage/object storage when scaling). The CSP permits inline Next.js bootstrap scripts to retain static rendering. Rate limiting is per process, not distributed. Core Web Vitals require deployed measurements and real visitor data; automated accessibility is not a complete manual WCAG audit.

Implementation references: [Next.js CSP guidance](https://nextjs.org/docs/app/guides/content-security-policy), [Next.js documentation](https://nextjs.org/docs), [Prisma documentation](https://www.prisma.io/docs).
