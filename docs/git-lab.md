# Git & GitHub lab

`/akademiya/git` — twelve animated lessons from the first commit to pull
requests and keeping secrets out of history, plus a narrated video lesson at
`/akademiya/git/video`.

## Lessons

| #   | Group               | Lesson                                                 | Widget   |
| --- | ------------------- | ------------------------------------------------------ | -------- |
| 1   | Git basics          | What Git is, what GitHub is                            | sort     |
| 2   | Git basics          | config, init, status                                   | terminal |
| 3   | Git basics          | The three areas: add and commit                        | terminal |
| 4   | Git basics          | History: log, diff, show                               | terminal |
| 5   | Git basics          | .gitignore: keep secrets out                           | terminal |
| 6   | Branches            | Branches: switch -c, switch                            | terminal |
| 7   | Branches            | Merge: fast-forward and a merge commit                 | terminal |
| 8   | Branches            | Resolving a merge conflict                             | terminal |
| 9   | GitHub and teamwork | remote add, push -u                                    | terminal |
| 10  | GitHub and teamwork | pull before push (a teammate's commit)                 | terminal |
| 11  | GitHub and teamwork | Fork and pull request                                  | sequence |
| 12  | Working safely      | Leaked secrets, 2FA, signed commits, branch protection | quiz     |

Checkpoint `git-1` (10 of 12 questions, `GIT_POOL`), award `lab-git`.

## The in-browser Git

`src/lib/git-basics/sim.ts` is a small Git for teaching: a working folder,
the index, commits with snapshots, branches, `switch`/`checkout`, fast-forward
and three-way merges with conflict markers and `merge --abort`, `.gitignore`,
`diff`, `log`, `show`, `restore`, `rm --cached`, and a pretend GitHub (`origin`,
`push` with the "fetch first" rejection, `fetch`, `pull`, `clone`). Output uses
Git's own wording. It never touches the network or real files; `run(line,
state)` returns a new state and never throws.

The widget (`src/components/playground/git-basics/GitBasics.tsx`) shows the
terminal, the three areas, a commit graph (one lane per branch, `HEAD` and
`origin/…` labels) and a GitHub panel with ahead/behind counts. Each terminal
lesson starts from a state built with `runAll` and checks goals against the
log. `tests/git-sim.test.ts` covers the simulator; `tests/git-lessons.test.ts`
checks that every terminal lesson starts unsolved and that its hint commands
solve it.

## Pictures

Lessons may carry `figures` (any AnimLab lab can: `Figure` in
`src/lib/anim-lab/types.ts`), shown under the theory. The Git lab's are in
`public/lessons/git/`:

- `terminal-*.webp` — real Git 2.43 sessions, run with colours, rendered as a
  terminal window and screenshotted with Playwright. The demo secret is
  `API_KEY=DEMO-kalit-12345`, deliberately not in any real key format.
- `scm-home.webp` — a screenshot of git-scm.com.
- `scm-branching.webp` — git-scm.com's "Branches in a Nutshell" page with the
  commit and tree diagram from _Pro Git_ by Scott Chacon and Ben Straub,
  CC BY-NC-SA 3.0 (credited under the picture).

GitHub's own pages could not be captured from the build environment, so the
GitHub steps are drawn (sequence widget, GitHub panel) rather than shown as
screenshots.

## Video

`src/lib/video-lessons/git.ts`, eight chapters (about 7 minutes). It adds three
scene kinds used by any lesson: `gitgraph` (a commit graph growing commit by
commit), `areas` (files moving working folder → staging → repository) and
`photo` (a real screenshot with a slow zoom). The narration was recorded with
Microsoft's `uz-UZ-SardorNeural` voice through edge-tts and joined with
`VIDEO_AUDIO_DIR=… npx tsx scripts/video-tts.ts git` (see
[video-lessons.md](video-lessons.md)).
