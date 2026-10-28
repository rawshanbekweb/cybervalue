# Academy Intermediate

The second Academy level lives at `/intermediate`, next to Kids, Junior and
the beginner Academy labs. Its roadmap is public; its labs open only to
students placed at the Intermediate or Advanced level, and to staff.

## Pages

| Path                    | What is there                                                                  |
| ----------------------- | ------------------------------------------------------------------------------ |
| `/intermediate`         | The roadmap (12 domains in three phases, career paths) and an access card      |
| `/intermediate/http`    | Module 1 of web application security, HTTP in depth (10 lessons, a checkpoint) |
| `/intermediate/input`   | Module 2, untrusted input (9 lessons, a checkpoint)                            |
| `/intermediate/browser` | Module 3, browser-side risks (8 lessons, a checkpoint)                         |
| `/intermediate/access`  | Module 4, access control (9 lessons, a checkpoint)                             |

The old addresses `/akademiya/intermediate` and `/akademiya/http` redirect
permanently (`next.config.ts`). The section can be switched off in **Admin →
Site settings** (`intermediate`); the HTTP lab keeps its own switch (`http`).

The Intermediate pages load the lab dictionaries (`src/app/[lang]/intermediate/layout.tsx`),
like the Academy, so the labs' interface is translated.

## Module 2: untrusted input

`/intermediate/input` (lab id `input`, checkpoint `input-1`, award
`lab-input`) runs on a pretend back end in the browser
(`src/lib/untrusted-input/tools.ts`): a small SQL engine for one login query,
a file download handler and an HTML template. Nothing reaches a real system.

| Lessons | What the student does                                                                                        |
| ------- | ------------------------------------------------------------------------------------------------------------ |
| 1       | Sorts request parts into “attacker controls” and “server only”                                               |
| 2–4     | Breaks the login query with one quote, signs in without a password, fixes it with parameters                 |
| 5–6     | Sends a file name that leaves the folder, sees a one-pass “../” filter fail and the resolved-path check hold |
| 7       | Writes an anchored allowlist regex for usernames                                                             |
| 8       | Sees why escaping only `<` and `>` is not enough inside an attribute                                         |
| 9       | Final questions                                                                                              |

The site settings switch is `input`. `tests/untrusted-input.test.ts` checks
every exercise against the engine; `tests/e2e/input-lab.spec.ts` solves the
lessons as an Intermediate student.

## Module 3: browser-side risks

`/intermediate/browser` (lab id `browser`, checkpoint `browser-1`, award
`lab-browser`, site setting `browser`) uses a pretend browser
(`src/lib/browser-risks/tools.ts`). It only describes what would happen and
runs nothing: `readMarkup` lists what `innerHTML` would build from a comment,
`applyPolicy` applies chosen CSP directives to one page's resources, and
`transfer` shows whether the bank accepts its own and a forged transfer.

| Lessons | What the student does                                                         |
| ------- | ----------------------------------------------------------------------------- |
| 1       | Sorts what is trusted code and what can bring foreign code into the page      |
| 2       | Sees a comment become elements with innerHTML, and stay text with textContent |
| 3       | Sorts link addresses: only http(s) and site paths are allowed                 |
| 4       | Builds a CSP that keeps the page working and blocks the three attacks         |
| 5       | Stops a forged transfer with SameSite or a CSRF token                         |
| 6       | Sorts which requests carry a SameSite=Lax cookie                              |
| 7       | Clickjacking and `frame-ancestors`                                            |
| 8       | Final questions                                                               |

## Module 4: access control

`/intermediate/access` (lab id `access`, checkpoint `access-1`, award
`lab-access`, site setting `access`) uses pretend services
(`src/lib/access-control/tools.ts`) that answer in the page: `getOrder` is an
orders API with and without the owner check, `makeToken` and `check` issue and
check JWTs (with a simplified, keyed stand-in for HMAC-SHA256, so the lesson
needs no crypto library), and `stops` says which attacks each way of signing
in stops.

| Lessons | What the student does                                                        |
| ------- | ---------------------------------------------------------------------------- |
| 1       | Sorts checks into “who?” (authentication) and “allowed?” (authorization)     |
| 2       | Opens another person’s order by changing a number, then adds the owner check |
| 3       | Sorts which measures really protect: server checks, not hidden buttons       |
| 4       | Reads the parts of a JWT                                                     |
| 5       | Sets up the server so an edited token and an `alg: none` token are refused   |
| 6       | Sorts what may go in a token payload                                         |
| 7       | Chooses a second factor that stops all four attacks (a security key)         |
| 8       | Questions on password storage, error messages and rate limiting              |
| 9       | Final questions                                                              |

## Who gets in

`intermediateAccess()` (`src/lib/intermediate/access.ts`) decides:

- a signed-in student whose level is `intermediate` or `advanced`
  (`opensIntermediate`, `src/lib/student/levels.ts`) — the lab opens and its
  progress is saved to their account;
- a signed-in staff member — the lab opens as a preview;
- everyone else sees the lab's lock screen: a sign-in button for visitors, or,
  for a beginner student, what opens Intermediate (the beginner labs and the
  entrance test, then the teacher's placement).

Teachers set the level on the student's page; the Results page suggests one
after the entrance test.

## Sessions

The student cookie `cv_student` is scoped to `/` so `/intermediate` can read
it. Sign-in buttons on Intermediate pages go to `/student/continue?to=…`, a
Route Handler under `/student`: it re-issues a session cookie that an older
browser still holds for `/student` only, or sends the visitor to
`/student/login?next=…` and back. `next` is limited to `/student` and
`/intermediate` paths.

## Teacher panel

**Teacher → Academy Intermediate** (`/teacher/intermediate`) lists the
students at the Intermediate and Advanced levels in the teacher's groups, with
lessons done in each open lab, their best checkpoint score and last sign-in.

## Adding a module

Give the module an `href` under `/intermediate/` and its `lab` id in
`src/lib/intermediate/roadmap.ts`, add the lab to `src/lib/lab-progress.ts`,
and render the page through `intermediateAccess()` and `IntermediateLocked`
like `src/app/[lang]/intermediate/http/page.tsx`. The roadmap card, the
access card's "Open" button and the teacher table pick it up from there.
