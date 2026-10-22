# Staff roles and panels

Staff sign in at `/admin/login` (`/teacher/login` leads there too). Each role
lands on its own panel.

| Role      | Panel                   | What they do                                                                                                    |
| --------- | ----------------------- | --------------------------------------------------------------------------------------------------------------- |
| `owner`   | `/admin` and `/teacher` | Everything an admin does, plus adding, changing and removing owners and admins                                  |
| `admin`   | `/admin` and `/teacher` | Runs the site: content, files, settings, all users, Telegram, status, errors, clean-up, audit; manages teachers |
| `teacher` | `/teacher`              | Classes, learners, assignments, materials, grading, results and live quizzes for their own groups               |

## The two panels

- **`/teacher`** is the teaching workspace: dashboard, Class, Assignments,
  Student materials, Grading, Results, Live quiz, HTML assessment, Analytics,
  Groups, Students, Academy Junior, Academy Kids, Trash and Account settings.
  Teachers see only the groups listed on their account; owners and admins see
  every group.
- **`/admin`** runs the site: the system dashboard, Site settings, content
  collections, File library, Home page portrait, All users, Team, Telegram,
  System status, Errors, Clean-up, Audit log and Account settings. A teacher
  who opens an `/admin` page is sent to `/teacher`.

Owners and admins switch panels with the button at the bottom of the sidebar.
The old addresses of moved pages (for example `/admin/students/…`) redirect to
`/teacher/…` (`next.config.ts`).

## Access checks

Roles live in `User.role` (`src/lib/auth.ts`: `STAFF_ROLES`, `roleOf`,
`homeOf`). `scopeOf()` gives owners and admins every group and teachers their
own; `requireOwner()` admits owners and admins, so teachers get a 404 on
site-wide pages and actions. Team actions (`src/app/admin/(cms)/team/actions.ts`)
also check the target: an admin may only create, change, reset or delete
teachers, and the site always keeps one active owner.

The session cookie `cv_session` is scoped to `/` so it reaches both panels.
Browsers that still hold the old `/admin`-scoped cookie see "You are signed in"
on the sign-in page; **Continue** re-issues the cookie for `/`. The old copy
stops working when its session ends and expires within 12 hours.
