# Architecture and implementation plan

The initial repository was empty: no packages, environment files, UI, database, domain, or deployment configuration existed.

1. Architecture: App Router, Server Components, a shared content entity with normalized subtype tables, and a graphite/lime design system.
2. Foundation: strict TypeScript, Tailwind 4, Prisma/PostgreSQL, Zod, semantic responsive layout.
3. Public pages: home, about, work, labs, research, CTF, resources, activity; honest empty states, no seeded career claims.
4. SEO: route metadata, canonical URLs, sitemap, robots, safe JSON-LD, breadcrumbs, generated social images.
5. Security: constrained public surface, safe Markdown, validated import pipeline, publication predicates, security headers.
6. Content: local operator-only JSON import, atomic writes, tags/categories, relationships and subtype details. No public CMS or write API.
7. Verification: lint, types, unit tests, build, browser checks, accessibility and SEO checks.

Static home/about/detail pages use incremental regeneration. Archives render server-side to support validated GET filters. Content is empty when DATABASE_URL is absent; configured database failures surface a generic error rather than masquerading as an empty archive. Search uses PostgreSQL through Prisma, without an external service. Database access stays on the server.

The shared Content table carries publishing state, SEO, authorship, taxonomy, dates and related entries. Project, Lab, ResearchArticle, CTFEvent and Resource hold type-specific attributes. Activity is derived from content publication, avoiding invented or duplicated activity records. User is an author entity, not an authentication implementation.
