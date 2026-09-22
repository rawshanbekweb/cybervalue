# Publishing real content

Content can be authored through the private `/admin` CMS (log in after running `npm run admin:create-user`) or via the CLI importer below. Both validate against `contentSchema` and share transactional writes (`src/lib/content-write.ts`). The admin UI supports text/status/relationship edits, file uploads and images. Keep private working content outside `public/` and do not commit credentials.

Admin lists support search, status filters, sorting and 20 entries per page. Resources also support searching by topic or type and display version, size and availability. Upload a resource in the editor or select one from the file library. Existing reviewed files in `content/private/downloads` remain selectable. Publishing checks availability; missing files can remain attached to existing drafts but cannot be published.

Browser uploads accept files up to 4 MiB, with a 250 MiB total library limit. Resource formats: PDF, TXT, MD, CSV and ZIP. Image formats: PNG, JPG, WebP and AVIF; images are decoded, stripped of metadata, resized to at most 2400 × 2400 and saved as WebP. Animated images and images over 32 megapixels are rejected. Uploads are stored in PostgreSQL and survive redeploys. `/admin/files` provides search, preview and deletion of unused uploads; draft and archived references also prevent deletion. In each entry, attach up to 12 images, edit descriptions, reorder or remove them, then save. The image picker shows the newest 200 uploads. Removing an image from an entry does not delete the file.

New admin entries reject duplicate slugs instead of overwriting existing content. Editing uses the original entry ID and permanent slug. Use the row actions to publish, move back to draft, archive or delete; deletion removes the content record, not the underlying file, which may be shared by other entries.

```sh
npm run content:import -- path/to/entry.json --validate-only
npm run content:import -- path/to/entry.json
```

The importer validates a file up to 1 MiB, checks referenced assets, then atomically upserts a record by its stable slug. Existing slugs cannot change type. Referenced related slugs must exist first. Re-import a file to edit a record; optional values omitted on re-import are cleared, including taxonomy, images, SEO overrides and optional project/event links. The author is Rawshanbek Gayipbaev.

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

For legacy resources, `/downloads/reference-v1.pdf` maps to `content/private/downloads/reference-v1.pdf`; database uploads use generated paths in the same namespace. The path is an internal identifier, not the public URL. `/downloads/<entry-slug>` checks publication on each request. Legacy disk files have a 20 MiB limit and cannot use symlinks. Uploaded images use `/media/<generated-name>` and are publicly accessible only while referenced by published content. Admin previews require authentication. Files are not automatically scanned for malware; review them before publishing.

Before publishing, remove credentials, personal/private data and unauthorized evidence. Verify dates, claims, sources, repositories and event results. Set `status: "PUBLISHED"` and the real `publishedAt`. Future dates remain hidden until reached and regeneration occurs. There is no artificial publication history.

To withdraw an entry, re-import with `ARCHIVED`. Database queries and downloads exclude it immediately, but previously generated pages and social previews can remain cached; purge/redeploy for urgent removals. Changing a slug creates a new entry: archive the old entry and add a reviewed permanent redirect in `next.config.ts` if appropriate.
