# CTF Challenges

A public competition area at `/challenges`, separate from the self-paced
[00:17 CTF](ctf.md) and from the invited [student area](students.md). Anyone
can sign up with an email and password. It is switched on and off in
**Admin → Site settings** (section "CTF Challenges").

The area has its own root layout (`src/app/challenges/layout.tsx`), follows the
language cookie like `/student`, and is skipped by `proxy.ts`. Its browser
dictionary is `src/lib/i18n/challenges.json`.

## Accounts (phase 1)

- **Sign-up** (`/challenges/register`): email, username, password, and the
  rules checkbox. Usernames are 3–24 Latin letters, digits, `.`, `_` or `-`
  and unique regardless of case (`usernameKey`). Passwords need 10–200
  characters and must not contain the username or the email name, or be a
  common password with a few digits (`passwordProblem` in
  `src/lib/challenges/account.ts`). A hidden field catches form-filling bots.
- **Email confirmation**: sign-up sends a link valid for 24 hours. The link
  only opens `/challenges/verify`; the button there spends it, so mail
  scanners that fetch links cannot confirm an address. Unconfirmed players can
  sign in and see a banner with "Send the link again".
- **No account enumeration**: signing up with a taken email shows the same
  "check your email" screen and mails the owner instead; "forgot password"
  answers the same for unknown addresses; a wrong email and a wrong password
  give the same error, and an unknown email is checked against a dummy hash.
- **Password reset** (`/challenges/forgot`): a one-time link valid for 1 hour.
  The new password is checked before the link is spent. Setting it confirms
  the email and signs out every device.
- **Account page** (`/challenges/account`): change the username or password
  (other devices are signed out), resend the confirmation, delete the account.
- **Sessions**: a random 32-byte token in the `cv_ctf` cookie (`httpOnly`,
  `sameSite=lax`, 30 days); only its SHA-256 digest is stored
  (`CtfSession`). Blocking an account ends its sessions at once.
- **One-time links** (`CtfToken`, kinds `VERIFY` and `RESET`): only a
  SHA-256 digest is stored, a new link cancels the older unused ones, and a
  conditional update spends a link only once.
- **Rate limits** (shared `RateLimitBucket`): sign-up 40 per address and 300
  overall per hour (a classroom shares one address); sign-in 30 per address and
  10 per email per 10 minutes; reset requests 6 per address and 3 per email per
  hour; at most 3 emails per player per hour.

Passwords use the site's scrypt hashing (`src/lib/password.ts`).

## Email

`src/lib/challenges/mail.ts` sends through [Resend](https://resend.com) when
`RESEND_API_KEY` and `EMAIL_FROM` are set (for example
`Cybervalue CTF <ctf@yourdomain.uz>`, on a domain verified in Resend). Messages
are written in the player's language (`emails.ts`) with absolute links built
from `SITE_URL`.

Without those variables nothing leaves the server: in development the message
is printed to the log, and when `EMAIL_OUTBOX` is set (CI and e2e tests) each
message is appended to that file as one JSON line. In production without them
sign-up still works, but players cannot confirm their email.

## Admin

**Admin → CTF players** (`/admin/ctf/players`, owners only) lists players
with search by email or username. An owner can confirm an email by hand, block
or unblock an account (blocking signs it out), or delete it. **Confirm every
unconfirmed email** does it for all active players at once, for a class that
signs up together before email sending is set up. Each change is in the audit
log.

## Tests

- `tests/challenges-account.test.ts`: email and username rules, the password
  check, link tokens, safe redirects and the email text.
- `tests/e2e/challenges.spec.ts`: sign-up, confirmation, a spent link,
  username change, sign-in errors, the taken-email answer, password reset that
  signs out other devices, the admin blocking a player, a team built with an
  invite code and handed to a new captain, a whole competition (admin setup,
  file, paid hint, wrong and right flags, dynamic scores, blocking the
  leader, then the winner's certificate after the end), team registration
  and the running-competition lock, and
  accessibility.
- `tests/challenges-scoring.test.ts`, `tests/challenges-admin.test.ts` and
  `tests/challenges-transfer.test.ts`: phases, freeze, flags (several, case),
  release and prerequisite gates, attempt limits, values, standings, the admin
  forms, and the import format (defaults, typed and exported flags, loops).
- The e2e suite also imports a hand-written file, adds and tests flags,
  exports (no flag text), plays a locked challenge and an attempt limit, and
  copies the competition.
  It needs `DATABASE_URL` and `EMAIL_OUTBOX`.

## Teams (phase 2)

`/challenges/team` (`src/lib/challenges/teams.ts`). A player is in at most one
team at a time (`CtfPlayer.teamId`); playing alone needs no team. Only players
with a confirmed email can create or join a team.

- **Create**: the founder becomes the captain (`CtfTeam.captainId`, unique).
  Names are 2–32 Latin letters, digits, spaces, `.`, `_` or `-`, unique
  regardless of case and spacing (`nameKey`).
- **Invite code**: 10 Crockford base32 symbols shown as `XXXXX-XXXXX`; case,
  spaces and look-alike letters are forgiven. Every member sees it; the
  captain can replace it, and the old code stops working. Joining is limited
  to 20 tries per address per 10 minutes.
- **Size**: at most 10 players (`TEAM_MAX_MEMBERS`). Joining locks the team
  row (`SELECT … FOR UPDATE`) before counting, so two people joining at once
  cannot overfill it.
- **Captain tools**: rename, make another member captain, remove a member.
- **Leaving** (`releasePlayer`): a leaving captain hands the team to the
  longest-standing member; the last member leaving deletes the team. The same
  happens when a player deletes the account or an owner deletes it.

## Competitions (phase 3)

Owners run competitions from **Admin → CTF competitions** (`/admin/ctf/events`).

- **A competition** (`CtfEvent`) has an address (`/challenges/<slug>`; the
  area's own page names are reserved), a title, a short description, a
  Markdown description with its rules, a start and an end, an optional
  registration deadline and scoreboard freeze, a team size (1–10), whether
  players may take part alone, and a published switch. Times are entered and
  shown in Tashkent time. Owners can open an unpublished competition to check
  it before publishing.
- **Entrants** (`CtfEntrant`): a team registers through its captain, or a
  player registers alone (when allowed). Registration needs a confirmed email
  and stays open until the deadline or the end. A team may not be larger than
  the competition allows, and a member registered alone keeps the team out.
  Before the start a solo player, or the captain for the team, can withdraw.
  The entrant keeps the team's name at registration, so results survive a
  rename or a deleted team.
- **Teams are locked** while one of their competitions runs: nobody joins,
  leaves or is removed, so flags cannot travel between teams. Before the start
  a team may not grow past the competition's size. Deleting an account is
  always allowed.
- **Challenges** (`CtfChallenge`): title, category (Crypto, Web, Forensics,
  OSINT, Stego, Reverse, Pwn, Misc), Markdown task, flag, letter-case rule,
  scoring, order and visibility.
  - **Flags** are never stored: only SHA-256 of a random per-challenge salt
    and the flag (trimmed, NFC-normalised, lower-cased when case does not
    matter), compared in constant time. A new flag or a changed case rule
    replaces the salt and digest.
  - **Dynamic scoring** (`challengeValue`, the CTFd curve): a challenge is
    worth its starting value at first and falls along a parabola to its
    minimum after `decay + 1` solves. Every solver gets the current value, so
    scores move as others solve. Equal minimum and starting values make it
    static.
  - **Files** (`CtfFile`, any type, 4 MiB each, 200 MiB for all CTF files)
    are uploaded on the challenge page through `/admin/ctf/upload` and stored
    apart from the public file library. `/challenges/files/<id>` serves them
    as downloads only, to the competition's entrants while it runs, any
    signed-in player after the end, and owners.
  - **Hints** (`CtfHint`) may cost points; the text reaches the browser only
    after the entrant opens it (`CtfHintUnlock`). After the end every hint is
    open.
- **Playing** (`/challenges/<slug>/board`): the board lists challenges by
  category with their value and solve count. Flags are accepted only while
  the competition runs. Each attempt is recorded (`CtfSubmission`, with only
  a digest of what was typed) and limited to 10 per challenge per entrant and
  60 per player per minute. A solve (`CtfSolve`) is unique per entrant and
  challenge, so teammates cannot score it twice.
- **Scoreboard** (`/challenges/<slug>/scoreboard`): score = sum of the
  current values of solved challenges minus opened hints; a tie goes to the
  entrant who reached the score first. It shows first bloods and a step chart
  of the top 10 over time. From the freeze time until the end the public sees
  the standings at the freeze; owners see the live standings.
- **Organiser tools** on the competition page: the challenge list with
  current values, entrants with rank, points and attempts, **Block** (the
  entrant leaves the scoreboard and cannot submit), announcements (shown on
  the competition page), and a warning when three or more entrants typed the
  same wrong answer to a challenge. Every change is in the audit log.

Business rules that need no database (phase, registration window, freeze,
flag digest, values, standings, admin form checks) live in
`src/lib/challenges/scoring.ts` and `admin-forms.ts` and are unit-tested.

## Authoring tools

- **Several flags** (`CtfFlag`): a challenge accepts any of its flags, each
  with its own letter-case rule, for example `CV{salom}` and `CV{Salom}`. The
  first is set when the challenge is created; more are added on the challenge
  page, and the last one cannot be deleted. Only salted digests are stored.
- **Test an answer** on the challenge page checks a candidate against the
  flags without recording anything; the candidate never goes into the address.
- **Release time** (`releaseAt`): the challenge stays hidden from players, its
  files and hints included, until then. Use it to open challenges in waves.
- **Opens after** (`requiresId`): the challenge shows only its title and value
  until the entrant solves the chosen challenge of the same competition. Loops
  are refused. Its files, hints and flag form stay closed too.
- **Attempt limit** (`maxAttempts`): wrong answers allowed per entrant (0:
  unlimited). The board shows the attempts left; at 0 the flag form goes away.
- **Copy as a draft**: copies a competition with its challenges, flags, hints,
  files and prerequisites as an unpublished draft a week later, under a new
  address (`…-copy`).
- **Export (JSON)** downloads a competition without its files; flags are
  carried as salted digests, never as text. **Import** (Admin → CTF
  competitions) creates an unpublished draft from such a file or a hand-written
  one, up to 4 MiB. Files are then uploaded on each challenge page, or carried
  inline in a hand-written file (below).

### Writing a challenge set by hand

Times are Tashkent time (`YYYY-MM-DDTHH:mm`) or ISO 8601. Typed flags are
salted and hashed on import. Everything except `key`, `title`, `category` and
`flags` has a default.

```json
{
  "version": 1,
  "event": {
    "slug": "kuzgi-ctf-2026",
    "title": "Kuzgi CTF 2026",
    "summary": "Maktab o‘quvchilari uchun",
    "description": "## Qoidalar\n…",
    "startsAt": "2026-11-20T10:00",
    "endsAt": "2026-11-20T18:00",
    "freezeAt": "2026-11-20T17:00",
    "maxTeamSize": 4,
    "allowSolo": true
  },
  "challenges": [
    {
      "key": "b64",
      "title": "Base64 xat",
      "category": "Crypto",
      "description": "Xatni oching: `Q1Z7c2Fsb219`",
      "flags": [{ "flag": "CV{salom}", "caseSensitive": false }],
      "hints": [{ "text": "Base64 ni oching.", "cost": 50 }],
      "initialPoints": 300,
      "minimumPoints": 100,
      "decay": 15
    },
    {
      "key": "final",
      "title": "Yakuniy xat",
      "category": "Crypto",
      "requires": "b64",
      "maxAttempts": 5,
      "releaseAt": "2026-11-20T14:00",
      "flags": [{ "flag": "CV{oxirgi}" }]
    }
  ]
}
```

A challenge may carry its files inline as Base64, so a single import sets up
everything (each file at most 4 MiB, the whole import at most 4 MiB, and all
CTF files together at most 200 MiB):

```json
"files": [{ "name": "xat.txt", "base64": "UTFaN2MyRnNiMjE5" }]
```

Categories: Crypto, Web, Forensics, OSINT, Stego, Reverse, Pwn, Misc.

## Competition day

- **Live attempts**: the competition's admin page lists the latest 30
  attempts (time, entrant, player, challenge, right or wrong) and the wrong
  answers per challenge, next to the solves.
- **Score adjustments** (`CtfAward`): an owner gives an entrant a bonus or a
  penalty (±10,000) with a reason. It counts like a hint cost with the sign
  reversed, respects the freeze, is shown with its reason on the entrant's
  page, and can be removed. Each change is in the audit log.
- **Entrant page** (`/challenges/<slug>/entrant/<id>`, opened from a name on
  the scoreboard): place, points, team members, solved challenges with their
  current value, who typed the flag and when, hint costs and adjustments,
  as at the freeze for the public.
- **Auto-refresh**: while a competition runs, the scoreboard re-renders every
  10 seconds and the board every 20, while the tab is visible, so new waves
  and teammates' solves appear without reloading.
- **Exports**: `/challenges/<slug>/ctftime` is the public scoreboard in
  CTFtime's feed format (`{"standings":[{"pos","team","score"}]}`, freeze
  respected) for listing a competition on ctftime.org. **Results (CSV)** on
  the admin page gives the live standings with members and emails, with
  spreadsheet formulas neutralised.
- **Sign-up protection**: besides the hidden field and the rate limits, the
  sign-up form carries a time stamp signed with `AUTH_SECRET`; a post sent
  within 3 seconds of the form being shown, older than 2 hours, or without a
  valid stamp is refused. `CTF_FORM_MIN_SECONDS` lowers the wait (CI uses 0).

## Results and certificates

Finished competitions stay listed on `/challenges` under "Finished", with
their board (every hint open, no flag form) and final scoreboard. Each name on
a finished scoreboard opens its certificate
(`/challenges/<slug>/certificate/<entrant>`): a winner's certificate for the
top three with points, otherwise a certificate of participation, with the
place, points, solved challenges, team members and the address that proves
it. It prints cleanly or saves as PDF from the browser.
