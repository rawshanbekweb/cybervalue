# Security missions

Open `/playground/missions`. The learning hub, home page, and existing security course link to this workspace.

Three investigations complement the guided lessons:

| Case                  | Failure to investigate                                     | What the fix must preserve                                      |
| --------------------- | ---------------------------------------------------------- | --------------------------------------------------------------- |
| The invoice next door | Cross-account access through detail and collection queries | Both owners can still read their own invoices                   |
| The one-cent order    | Client pricing, invalid quantities, repeated coupons       | Correctly priced purchases, bulk orders, and one valid discount |
| Delivered twice       | Forged notifications and replayed payment events           | Valid fulfillment, safe retries, and ignored unrelated events   |

Each case includes a brief, source-like pseudocode or logs, acceptance criteria, an editable request workbench, response comparisons, execution traces, policy controls, and a regression suite. The workbench accepts synthetic paths, identities, and JSON; it does not send arbitrary HTTP traffic. The existing security course continues to provide its real local API exercises.

## Verification

A case closes only after a learner observes normal behavior, reproduces a failure, identifies the root cause, manually observes a defense, and passes every regression check under the current policy. Turning the service off fails legitimate-use checks. Changing a policy resets sandbox state and invalidates manual defense and regression verification. Regression requests execute in independent clean fixtures and do not silently add evidence to the learner's history.

The 100-point learning score allocates 15 points to a baseline, 20 to failure reproduction, 10 to diagnosis, 15 to manual defense, and 40 proportionally to regression results. Each of three optional hints subtracts five points. Hints never prevent completion. These client-side records are learning aids, not tamper-resistant assessments, credentials, or server-issued achievements.

## Persistence and reports

Each mission saves separately under `cybervalue:mission:<id>:v1` in browser storage. Records are validated before restoring. Notes, current requests, policies, evidence, and the most recent 16 requests survive a reload when storage is available. Export produces a Markdown report with each request's policy, response, trace, notes, and current test outcomes.

Reset sandbox clears transient delivery counters and replay records, keeping investigation evidence. New case variant asks before clearing the selected mission's current work; it cycles through three sets of fixture IDs and prices. These variants change data, not the underlying learning objectives.

## Simulation boundaries

All data is synthetic and simulation runs locally in the browser. There is no arbitrary code execution, external target access, payment processing, or real cryptographic verification. For the webhook case, `provider-valid` is an explicit fixture representing a successful verifier. The model is sequential; it does not test concurrency, transactional fulfillment, provider-specific signing algorithms, or distributed idempotency. The debrief explains these remaining production concerns.

## Implementation and checks

- `src/lib/missions/catalog.ts`: case briefs, hints, policy choices, diagnostic questions, and fixture files.
- `src/lib/missions/engine.ts`: deterministic simulation and behavioral regression cases.
- `src/lib/missions/session.ts`: bounded history, storage validation, evidence gates, score, and report export.
- `src/components/playground/missions/MissionControl.tsx`: investigation workspace.
- `tests/missions.test.ts`: partial defenses, monetary outcomes, replay handling, verification gates, and recovery.
- `tests/e2e/missions.spec.ts`: full investigations, reloads, invalid input, export, variants, small screens, and accessibility.
