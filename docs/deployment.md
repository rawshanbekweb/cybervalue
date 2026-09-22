# Deploying CyberValue

No production domain or hosting credentials were supplied. Deployment is prepared, not performed.

## Node hosting

1. Provision Node 24 and PostgreSQL. Create a dedicated database and application credential. Set TLS and least-privilege permissions. Do not expose the PostgreSQL port publicly without appropriate network controls.
2. Set environment variables using the host secret manager. Set the real `SITE_URL` HTTPS origin. Keep `SITE_INDEXABLE=false` on previews; set `true` only on the canonical production deployment. Add real social URLs.
3. Install with `npm ci`, apply migrations with `npm run db:deploy`, then `npm run build`. The build needs database read access when `DATABASE_URL` is configured because it generates public pages.
4. Run `npm start` under a managed process supervisor. Put the Node service behind HTTPS. Configure host-level timeouts, body limits and rate limiting; the source does not trust forwarded client-IP headers.
5. Make reviewed images and private downloadable resources available in the corresponding directories. Persistent disks are needed if files change between deployments; a future storage adapter can use object storage.
6. Publish real entries through the local importer using authorized credentials. Rebuild for immediately updated static pages; normal updates appear through 60-second ISR. Withdrawal of previously public content requires cache invalidation/redeployment for immediate removal.
7. Confirm the canonical host redirects alternate hostnames at your proxy/hosting provider. Next.js handles trailing-slash redirects; no speculative legacy URLs are configured.

## Vercel

Import the repository as a Next.js project, configure the same environment variables, and provide a managed PostgreSQL connection string. The committed `vercel.json` runs `npm run vercel-build`: generate Prisma, apply committed migrations, then build Next.js. A reachable database is required before the first successful Vercel build. Node 24 is selected by `package.json`. No static export.

Set `DATABASE_URL` for Production. Preview deployments need their own separate database or database branch because the build applies migrations. Never attach the production database to Preview. Set indexing only on the production environment and the verified domain. See [the Uzbek setup guide](vercel-uz.md) for the first deployment and admin provisioning.

Admin uploads persist in PostgreSQL and do not write to the deployment filesystem. Apply the StoredFile migration before running the updated app. Each upload is capped at 4 MiB and library storage at 250 MiB; configure any proxy to accept that request size. Include StoredFile in database backups, and use private object storage if the archive outgrows this limit. Legacy files under `content/private` remain ignored by Git and must be supplied separately during a secure build; the download route traces `content/private/downloads/**/*`. The command-line importer runs locally or in trusted CI. Avoid printing connection strings in logs.

The interactive security lab currently keeps teaching sessions, token secrets and login attempt counters in process memory. On Vercel these can reset on cold starts or differ between instances; multi-request exercises are not guaranteed to retain state. Persistent shared lab state is a separate change. This does not affect the CMS, whose sessions and content use PostgreSQL.

## Launch verification

- Verify HTTPS, preferred-host redirect, correct canonical origin and production security headers.
- Check `/robots.txt` permits public crawling and references the real sitemap.
- Check `/sitemap.xml` contains only real published content and no preview/local origins.
- Inspect home/about/archive/detail metadata, OG images and JSON-LD.
- Confirm `SITE_INDEXABLE=true` and absence of accidental `noindex` on canonical public pages; filter/search/404 pages remain noindex.
- Run the documented checks, browse 320px and larger widths, navigate by keyboard, and manually inspect meaningful alt text and link labels.
- Measure performance on the deployed HTTPS origin with Lighthouse/PageSpeed and subsequently real-user Core Web Vitals. Local tests are not a performance certification.
- Verify database backups, resource availability, observability without secret logging, and host-level abuse limits.
