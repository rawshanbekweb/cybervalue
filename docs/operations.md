# Operations: errors, status, backups, offline use

## Errors

`src/instrumentation.ts` (`onRequestError`) stores every server error — pages, route handlers and server actions — and the public error boundaries send browser errors to `POST /api/errors` (same origin only, rate-limited). Both land in `ErrorEvent` (migration `20261023090000_error_events`), grouped by a fingerprint of source, route and message, so a repeat only raises `count`. Paths lose their query string and long tokens (report links, codes) become `:id`.

**Admin → Errors** lists open errors with their stack trace; **Resolved** closes one, and an error that happens again reopens. A new or reopened error is sent to linked teachers in Telegram, at most once a day per error. Resolved errors older than 90 days are removed by the daily job.

## System status

**Admin → System status** checks, in one place:

- the database connection time, PostgreSQL version and size, and the applied migrations;
- `AUTH_SECRET`, an HTTPS `SITE_URL`, search-engine indexing and the Telegram bot;
- when the daily job last ran (it records itself in `SiteSetting` `cron-last-run`);
- open errors of the last 24 hours;
- when the data was last downloaded.

## Backups

Neon keeps the database history and restores a branch to any moment inside the plan's window (Neon console → Branches → Restore, or create a branch from a past point in time). As a second, independent copy, **Download data (JSON)** on the status page exports students, materials, submissions, progress, certificates, checkpoints, assignments, Junior members, HTML exams, live games, Telegram links and site content. Admin password hashes and two-factor secrets, sessions, rate limits, logs and the bytes of uploaded files are left out. The status page turns amber when no export was downloaded in the last 30 days.

## Install and offline use

`src/app/manifest.ts` makes the site installable (icons in `public/icons`, generated from `src/app/icon.svg`). `public/sw.js`, registered in production by `ServiceWorker`, caches built assets and the public pages and labs a visitor opens, so they open again without a connection; a page never opened shows `/offline`. Admin, the student area, Junior, the live quiz, reports, certificates, downloads and every API are never cached. Bump `VERSION` in `sw.js` to drop old caches.

## Translations

All interface copy goes through the shared dictionaries in `src/lib/i18n/*.json` (English source → Uzbek). The interactive labs (`useT()` in network, Linux, Junior and checkpoints) now call `t("English", values)` like the rest of the site; their strings live in `labs-ui.json`. Lesson data that carries both languages itself (`{ uz, en }`) is shown with `text()`. `tests/i18n-coverage.test.ts` fails when a lab string has no Uzbek.
