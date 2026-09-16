# Publishing real content

Content is authored locally as JSON and Markdown strings, never loaded from templates into the public site automatically. Start with `content/templates/research.json`. Keep working content outside `public/` and do not commit private evidence or credentials.

```sh
npm run content:import -- path/to/entry.json --validate-only
npm run content:import -- path/to/entry.json
```

The importer validates a file up to 1 MiB, checks referenced assets, then atomically upserts a record by its stable slug. Existing slugs cannot change type. Referenced related slugs must exist first. Re-import a file to edit a record; optional values omitted on re-import are cleared, including taxonomy, images, SEO overrides and optional project/event links. The author is Rawshanbek Gayipbaev. No authenticated web CMS is provided.

Common fields:

| Field                        | Purpose                                                             |
| ---------------------------- | ------------------------------------------------------------------- |
| `kind`                       | `PROJECT`, `LAB`, `RESEARCH`, `CTF`, `RESOURCE`                     |
| `slug`                       | Unique lowercase URL-safe slug; keep stable                         |
| `title`, `summary`, `body`   | Visible title, summary and Markdown                                 |
| `status`                     | Defaults to `DRAFT`; `PUBLISHED` or `ARCHIVED` explicit             |
| `publishedAt`                | Real ISO datetime with timezone; required for published content     |
| `seoTitle`, `seoDescription` | Optional manual overrides                                           |
| `featured`                   | Feature a published project on home                                 |
| `category`                   | Optional `{ "name": "Web security", "slug": "web-security" }`       |
| `tags`                       | Array of objects with `name` and `slug`                             |
| `relatedSlugs`               | Existing entries linked from the detail page in both directions     |
| `images`                     | Array of `{ path, alt, width, height }`; local reviewed screenshots |

Each type requires exactly one subtype object:

- `project`: `problem`, `objective`, `architecture`, `securityConsiderations`, `challenges`, `solution`, `result`, `lessonsLearned`, `technologies` (array), `projectStatus`; optional HTTPS `repositoryUrl`, `liveUrl`.
- `lab`: `environment`, `objective`, `tools` (array), `methodology`, `discovery`, `analysis`, `impact`, `remediation`, `lessonsLearned`, `difficulty` (`BEGINNER`, `INTERMEDIATE`, `ADVANCED`), `authorized: true`.
- `research`: `references` (array of HTTPS URLs).
- `ctf`: `eventName`, `eventDate` (ISO datetime), optional `location`, optional `placement`, `challengesSolved` and `categories` (arrays), `lessonsLearned`.
- `resource`: `type`, `filePath`, `topic`, `version`.

Long subtype text supports sanitized Markdown. The shared body should introduce the entry; put case-study/lab sections in their dedicated fields to avoid duplication. Inline Markdown images are suppressed to prevent tracking; screenshots belong in the reviewed `images` collection.

For images, use a filename such as `/images/authorization-flow.webp`, physically at `public/images/authorization-flow.webp`. Supported formats: WebP, AVIF, PNG, JPG, JPEG. Supply correct dimensions and descriptive alt text. Public screenshots are public assets regardless of entry status: never place confidential draft images in `public/`.

For resources, a `filePath` of `/downloads/reference-v1.pdf` maps to `content/private/downloads/reference-v1.pdf`. The path is an internal asset identifier, not the public URL. The public URL is `/downloads/<entry-slug>` and checks publication on each request. Supported downloads: PDF, TXT, MD, CSV, ZIP; maximum 20 MiB; no symlinks. Review files manually for sensitive information and malicious contents. No upload endpoint or automatic malware scanning is implemented.

Before publishing, remove credentials, personal/private data and unauthorized evidence. Verify dates, claims, sources, repositories and event results. Set `status: "PUBLISHED"` and the real `publishedAt`. Future dates remain hidden until reached and regeneration occurs. There is no artificial publication history.

To withdraw an entry, re-import with `ARCHIVED`. Database queries and downloads exclude it immediately, but previously generated pages and social previews can remain cached; purge/redeploy for urgent removals. Changing a slug creates a new entry: archive the old entry and add a reviewed permanent redirect in `next.config.ts` if appropriate.
