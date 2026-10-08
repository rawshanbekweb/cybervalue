# Linux foundations lab

Route: `/playground/linux-basics`, linked from Labs, the Linux learning resource,
and the learning catalog on the home page and Playground. Supports Uzbek and
English through the site's locale.

The course contains 16 lessons in four groups, a separate free-practice workspace,
32 command names, task checks against virtual filesystem state and successful
command events, and a self-check question per lesson. Both the task and quiz must
pass before the lesson is marked complete. No account or database is required.

## Runtime boundary

`src/lib/linux/engine.ts` implements a bounded teaching shell entirely in the
browser. It never executes host processes, accesses host files or makes network
requests. It is **not Bash or a Linux VM**. The on-page reference lists supported
options and the limits panel explains omissions.

Supported operators: pipelines, `>`, `>>`, `<`, `&&` and `;`. Quoted operators stay
literal. Environment expansion takes place for each control-list segment;
pipeline builtins do not change the parent shell's directory or environment.
Pipeline status follows the final command. Failed commands retain filesystem
effects already performed, including redirection truncation, as a shell would.

The virtual user owns all files. Owner read/write/traversal permissions are
checked. Writable trees are `/home/student` and `/tmp`. System files are read-only
fixtures. Processes are three fixed teaching fixtures. No root, packages,
networking, script execution, general shell globbing or regex grep is supported.
`find -name` supports `*` and `?` without compiling user regex. `chmod` accepts
three octal digits. Some command output formatting is simplified.

Limits: 250 filesystem entries, 32,000 characters per file, 2,000 per command,
100 history commands, 80 transcript entries and 200 grading events per workspace.
Command names and option syntax are defined in `COMMANDS`; bilingual explanations
live in `COMMAND_NOTES` and the lesson content in `curriculum.ts`.

## Persistence and recovery

Per-lesson storage: `cybervalue:linux:session:<id>:v1`; the separate practice
workspace uses `sandbox` as the ID. Progress: `cybervalue:linux:progress:v1`.
Filesystem records, paths, modes, history, quiz answers and completion IDs are
validated on restoration. Invalid filesystem snapshots reset to the fixture.
Unavailable or full storage leaves the current in-memory session usable and
shows an export reminder. Reset asks for confirmation and affects only the
selected exercise. Progress is local practice feedback, not a secured assessment.

## Verification

- `npx tsx --test tests/linux.test.ts`: all lesson solutions, shell semantics,
  permissions, errors, persistence recovery and translation coverage.
- `npx playwright test tests/e2e/linux.spec.ts tests/e2e/learning.spec.ts`:
  all 16 lessons in a browser, saved work, catalog resume, exports, reset,
  unavailable storage, language changes, mobile layout and an axe audit.
- Standard project checks: `npm run lint`, `npm run typecheck`, `npm run build`.

For development-server browser tests, start `next dev --webpack` on port 3000
and set `PW_REUSE_SERVER=1`. Production browser tests use the built site through
the normal Playwright web server configuration.
