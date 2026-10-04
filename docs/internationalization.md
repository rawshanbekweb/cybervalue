# Uzbek and English

The public site defaults to Uzbek (`uz`). The header's UZ/EN buttons save an
explicit choice in the `cybervalue-locale` cookie for one year. Unsupported cookie
values fall back to Uzbek. The server renders the correct language on the first
request, including `html.lang`, page metadata and Open Graph locale.

Routes, query parameters, lesson hashes and browser progress keys stay stable:
visitors never see a language prefix. Public pages live under `src/app/[lang]`
and are prerendered once per language. `src/proxy.ts` reads the cookie and
rewrites each request to its language copy (`/about` to `/uz/about`), so pages
are statically generated or ISR-cached instead of rendered per request. A direct
`/uz/...` or `/en/...` request redirects to the unprefixed URL.

Server code reads the language with `getLocale()` (the `[lang]` root param).
Route handlers, Server Actions and the admin area sit outside `[lang]`; the admin
root layout reads the cookie itself, and admin server components use
`getAdminTranslator()`. Route handlers and Server Actions return messages in their
source language; the client translates them on display with `t(message)`, since the
translator maps Uzbek source text to English too. Changing language runs a Server Action and
then `router.refresh()`. The `[lang]` tree is swapped, so client components
remount: persisted state (storage keys, URL hashes) survives, transient in-memory
state does not.

## Coverage

| Area                                                                          | Uzbek          | English          |
| ----------------------------------------------------------------------------- | -------------- | ---------------- |
| Header, footer, home, about, activity, archives, search, 404 and route errors | Yes            | Yes              |
| Public content labels, dates, learning catalog and gateways                   | Yes            | Yes              |
| All 12 HTML exercises, instructions, checks and controls                      | Yes            | Yes              |
| CTF narrative, five challenges, hints, controls, feedback and report          | Yes            | Yes              |
| Web Security Lab: 36 lessons, quiz, practice renderers and notes              | Yes            | Yes              |
| Security Missions: briefs, case files, traces, regressions and report         | Yes            | Yes              |
| HTML & CSS Project Studio: briefs, hints, structural checks and exports       | Yes            | Yes              |
| Graded HTML assessment and resource exam: rules, questions, feedback, errors  | Yes            | Yes              |
| Admin CMS, 2FA, audit log and assessment results                              | Yes            | Yes              |
| Standalone slide decks and offline ZIPs                                       | Original Uzbek | Labeled as Uzbek |

CMS-authored articles, learner code, notes, protocol examples, flags, and evidence
files are preserved verbatim. This is interface localization, not automatic
translation of arbitrary published or learner-authored content. Graded content values that the grader checks (event names, table headings,
`lang="uz"`, file names in terminal tasks) stay identical in both languages, so a
class can take one exam in either language. Only the instructions around them are
translated.

## Adding translations

- Keep translations in `src/lib/i18n/*.json` (one file per module, merged in
  `src/lib/i18n/index.ts`). Duplicate keys across files must agree.
  Each entry pairs English source text with reviewed Uzbek text. Existing Uzbek
  source copy is also accepted by the translator, for example CTF feedback.
- Server components call `await getTranslator()` from `lib/i18n/server`.
  Client components call `useTranslator()` under `LocaleProvider`.
- Translate at the rendering boundary. Do not translate routes, storage keys,
  filter values, API enums, HTML code or evidence files.
- Use named placeholders for variable text (`{count}`, `{lesson}`), keeping
  sentence order inside the translation. Use locale-aware date formatting.
- Never store translated labels as identifiers. Catalog category selection uses
  stable source identifiers, and searches match both original and translated text.
- Unknown authored content falls back to its source text. A course available in
  only one language uses `ContentLanguage` to state its language and set `lang`.

## Verification and functional fixes

`tests/i18n-coverage.test.ts` fails when any lesson, mission, studio check,
assessment or exam text lacks a translation. `tests/i18n.test.ts` checks locale fallback, interpolation and translation coverage
for HTML instructions and CTF narratives/hints. `tests/e2e/i18n.spec.ts` checks
server rendering, persistence, URL preservation, localized search, editor state,
CTF grading/progress, responsive layout and accessibility in both languages.

`lessonRecord` validates untrusted localStorage records before HTML and Security
Lab render them. Null, arrays, invalid value types and unknown lesson IDs are
discarded. Only actual `true` records count as completed lessons. This fixes
crashes on damaged progress/drafts and inflated progress counts.

Database-dependent CMS, admin and graded-assessment workflows require a reachable
database and test credentials. A database-free public-site build does not validate
those integration flows.
