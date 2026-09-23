# CyberValue

A personal cybersecurity and software development portfolio for Rawshanbek Gayipbaev. No demo achievements, fabricated projects, or invented social accounts are seeded.

## Run locally

Requires Node.js 24 and npm. On Windows PowerShell, use `npm.cmd` if execution policy blocks `npm.ps1`.

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
src/app/admin/             Private CMS: login, dashboard, per-collection CRUD
src/components/            Shared UI, archives, case studies, safe Markdown
src/lib/                   Database queries, validation, metadata, site config, auth
src/generated/prisma/      Generated client (not committed)
prisma/schema.prisma       Normalized content model
prisma/migrations/         Versioned PostgreSQL migrations
scripts/import-content.ts  Validated, local-only content publishing
scripts/create-admin.ts    Operator-only admin account provisioning
content/templates/         Draft authoring templates (never publicly loaded)
content/private/downloads/ Private downloadable files (not committed)
public/images/             Reviewed public screenshots
tests/                     Unit and Playwright accessibility/SEO tests
docs/                      Architecture, publishing, security, deployment
```

Shared `Content` records contain unique stable slugs, publication state, dates, metadata, author, category, tags, images, and related content. `Project`, `Lab`, `ResearchArticle`, `CTFEvent`, and `Resource` are one-to-one detail tables. `User` stores authorship and, optionally, the admin login (`email`/`passwordHash`); `Session` stores active admin logins; `SocialLink` stores verified links. Activity is derived from published records rather than separately maintained. The importer and the admin CMS share the same schema and enforce the same type consistency and authorized-labs rule.

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

## Admin

Create the one admin account (there is no self-registration):

```sh
npm run admin:create-user -- --email you@example.com
```

You'll be prompted for a password (12–200 characters) on stdin. Alternatively, add `--generate-password` to generate and display a random password once; with no email argument, the existing owner email is preserved. Provisioning revokes old sessions. Log in at `/admin/login`. Use Account settings to change the password or sign out other sessions. Sessions last 12 hours; `/admin` is `noindex` and disallowed in `robots.txt`. The CMS supports content editing, resource/image uploads, an uploaded file library and image ordering/descriptions. See [the publishing guide](docs/content.md) and [security tradeoffs](docs/security.md).

## Verification and production build

HTML Basics includes a timed, single-attempt assessment with teacher-issued codes, server-side grading and an admin results dashboard. See [the teacher guide](docs/html-assessment.md).

```sh
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e
npm run format:check
npm start
```

Install the Playwright browser once if needed: `npx playwright install chromium`. Browser tests cover public routes, unique titles, canonical and OG metadata, JSON-LD parsing, links, redirects, 404s, security headers, filters, widths from 320–1440px, keyboard navigation, and automated accessibility. The unauthenticated-redirect and bad-credentials admin tests always run; the full login → publish → archive → delete flow additionally requires `DATABASE_URL`, `E2E_ADMIN_EMAIL`, and `E2E_ADMIN_PASSWORD` for a seeded account and is skipped otherwise.

## Learning hub

The [HTML & CSS project studio](docs/studio.md) at `/playground/studio` includes three fictional client briefs, separate HTML/CSS editors, isolated live previews, structural feedback, saved drafts, and HTML/review exports.

The hub now includes [three investigation missions](docs/missions.md) at `/playground/missions`: invoice authorization, checkout integrity, and webhook replay. Learners edit requests, collect evidence, choose defense policies, and run behavioral regression checks. Completion requires demonstrated outcomes. These browser simulations complement the existing guided lessons and real local API exercises.

Home and `/playground` share a searchable catalog of the existing HTML and web security lessons. Track counts and lesson titles come from the course data through `src/lib/learning.ts`; only catalog metadata is passed to the client. Both courses support direct links in the form `#lesson/2`.

The catalog reads each course's existing browser progress, counts only valid completed lessons, and links to the first unfinished lesson. Completed tracks offer a review link. Progress stays on the current browser and does not sync to an account. Missing or malformed storage does not block the catalog. Home's Build / Investigate / Defend panel presents educational examples and opens the corresponding exercise.

`tests/e2e/learning.spec.ts` covers filtering, lesson links, progress recovery, preview interactions, responsive layouts, and accessibility.

## SEO

Every public page has route-specific Metadata API output, canonical URL, Open Graph, and Twitter card. Detail pages generate 1200×630 previews. Person, WebSite, TechArticle/CreativeWork and BreadcrumbList JSON-LD reflect visible content. Sitemap entries are publication-filtered with actual content `updatedAt`; static page dates are omitted rather than invented. Query/filter pages use the base archive canonical and `noindex,follow`. Search is `noindex`. Next.js redirects trailing slashes.

**Production indexing is intentionally off until the real domain is configured.** Set `SITE_URL=https://your-real-domain` and `SITE_INDEXABLE=true`, rebuild, then verify robots and sitemap. Never use this flag as access control for private content.

## Security

Security headers include CSP, HSTS in production, anti-framing, MIME sniffing prevention, referrer and permissions policies. Markdown has no raw HTML/MDX execution, is sanitized, blocks unsafe URL schemes, and ignores inline images. Reviewed local screenshots use `next/image` with dimensions and alt text. JSON-LD escapes HTML delimiters. Zod validates imports, query filters, slugs, file paths, social links and environment configuration. Prisma uses typed parameterized queries. Download routes verify publication, constrain paths and size, disallow symlinks, force attachments, and apply a bounded process-wide rate limit.

There is no public write API or public upload. Admin access uses a scrypt-hashed password and a database-backed, httpOnly session cookie. Server Actions use Next.js Origin checks; the private upload route independently checks authentication, Origin, format and streamed body size. See [security tradeoffs](docs/security.md).

## Deploy and remaining work

Follow [deployment instructions](docs/deployment.md). Deploy as a Node.js Next.js application or on Vercel with PostgreSQL; this is not a static export.

Vercel uchun bosqichma-bosqich o'zbekcha qo'llanma: [Vercel'ga joylash](docs/vercel-uz.md).

Owner input still required: real domain, database credentials, verified social links, real projects/research/resources, and confirmation of personal copy. No hosting account or production database is created automatically.

Known limits: the CMS uses one owner account without a multi-user/role model. Browser uploads are capped at 4 MiB each and 250 MiB total, stored in PostgreSQL; use object storage when scaling. Legacy disk downloads support up to 20 MiB. No automatic malware scanning, public uploads, analytics, RSS or external search. Substring search suits a modest archive; activity shows the newest 50 entries. The CSP permits inline Next.js bootstrap scripts. Rate limiting is per process, not distributed. Core Web Vitals require deployed measurements; automated accessibility is not a complete manual WCAG audit.

Implementation references: [Next.js CSP guidance](https://nextjs.org/docs/app/guides/content-security-policy), [Next.js documentation](https://nextjs.org/docs), [Prisma documentation](https://www.prisma.io/docs).
