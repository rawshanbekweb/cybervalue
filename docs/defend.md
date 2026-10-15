# Build & Defend lab

A browser-only secure coding lab at `/playground/defend`. Links appear on the playground and in the sitemap. No account, server request or database is required. The interface is available in English and Uzbek.

Each scenario gives the learner a small, deliberately vulnerable rendering function for a fictional client, plus hints, a live preview and an attacker bot. Pressing attack runs the learner's current code against every case: feature cases first (the page must still work), then attack cases (real payloads that try to execute script or leave the site). A scenario is defended only when every feature case and every attack case passes.

| Scenario           | Function                              | Topic                            |
| ------------------ | ------------------------------------- | -------------------------------- |
| The comment wall   | `renderComments(root, comments)`      | Stored XSS                       |
| The profile card   | `renderProfile(root, profile)`        | Attribute, URL and CSS injection |
| The search results | `renderResults(root, query, results)` | Reflected XSS                    |
| The return address | `safeRedirect(next)`                  | Open redirect                    |

Scenarios, cases, hints and debriefs live in `src/lib/defend/scenarios.ts`; there are 18 attack cases and 10 feature cases. Direct links use `#scenario/<id>` (`comments`, `profile`, `search`, `redirect`).

## Isolation

Every case runs in a fresh, hidden iframe with `sandbox="allow-scripts"` and no `allow-same-origin`, so the code has an opaque origin and no access to this site's cookies, storage or DOM. A CSP in the generated document (`SANDBOX_POLICY` in `src/lib/defend/harness.ts`) blocks every network request, image, font, form submission and `<base>`, so payloads can neither load resources nor send data anywhere. Learner code is capped at 12,000 characters and escaped so it cannot close its script element; inputs are embedded as JSON with `<` escaped.

Attacks are detected with a canary. Payloads call `__CANARY__`, which the runner replaces with a per-run random name (`__cv_<nonce>`) before the case starts, so learner code cannot predict or stub the detector. The harness simulates a visitor (mouseover, pointer and focus events on every element) to trigger delayed handlers, then reports fired canaries, errors, the returned value, text, HTML, links, `<mark>` contents and styles. `src/components/playground/defend/runner.ts` accepts only messages from that exact frame with the matching nonce and gives up after 2.5 seconds, so an infinite loop fails the case instead of freezing the page. The detector name is replaced with `pwned` before HTML is shown.

## Progress

Browser storage keeps the code, opened hints, attack-run count and defended state per scenario under `cybervalue:defend:<id>:v1`. Stored values are untrusted: malformed fields fall back to the starter code or zero, and code is truncated to the length limit. Editing after an attack marks the result as stale. Restoring the starter code asks for confirmation. The defense report exports as Markdown with every case's pass/fail state.

This is a self-paced exercise. Progress is editable and is not an authenticated achievement. The checks test the listed cases, not every possible payload, so a defended scenario does not prove the code is safe in general.

## Adding a scenario

Add an entry to `SCENARIOS` with a `call` expression over `root` (the page container) and `INPUT` (the case input), a benign `sample`, a vulnerable `starter`, and cases whose attack inputs call `CANARY`. Add every new string to `src/lib/i18n/defend.json`; `tests/i18n-coverage.test.ts` fails on missing Uzbek translations. Add a working defense to `tests/fixtures/defend.ts` so the e2e suite proves the scenario can be completed.

## Tests

`tests/e2e/defend.spec.ts` checks that the starter code is really exploited and shows evidence, that every scenario can be defended with the fixture solutions and progress survives a reload, that editing marks results stale, the Uzbek interface, and accessibility.
