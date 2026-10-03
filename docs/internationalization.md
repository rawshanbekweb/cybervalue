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
root layout reads the cookie itself. Changing language runs a Server Action and
then `router.refresh()`. The `[lang]` tree is swapped, so client components
remount: persisted state (storage keys, URL hashes) survives, transient in-memory
state does not.

## Coverage

| Area                                                                          | Uzbek                     | English                   |
| ----------------------------------------------------------------------------- | ------------------------- | ------------------------- |
| Header, footer, home, about, activity, archives, search, 404 and route errors | Yes                       | Yes                       |
| Public content labels, dates, learning catalog and gateways                   | Yes                       | Yes                       |
| All 12 HTML exercises, instructions, checks and controls                      | Yes                       | Yes                       |
| CTF narrative, five challenges, hints, controls, feedback and report          | Yes                       | Yes                       |
| Web Security Lab, Missions, Project Studio                                    | Source language notice    | Original English          |
| Graded HTML assessment                                                        | Original Uzbek            | Source language notice    |
| Standalone 75-slide presentation and offline ZIP                              | Original Uzbek            | Labeled as Uzbek          |
| Admin CMS and concept demos                                                   | Existing source languages | Existing source languages |

CMS-authored articles, learner code, notes, protocol examples, flags, and evidence
files are preserved verbatim. This is interface localization, not automatic
translation of arbitrary published or learner-authored content. The remaining
course modules and admin UI still need authored translations; language notices do
not claim otherwise.

## Adding translations

- Keep translations in `src/lib/i18n/messages.json`, `html.json`, or `ctf.json`.
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

`tests/i18n.test.ts` checks locale fallback, interpolation and translation coverage
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
