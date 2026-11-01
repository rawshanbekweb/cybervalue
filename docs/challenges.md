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
or unblock an account (blocking signs it out), or delete it. Each change is in
the audit log.

## Tests

- `tests/challenges-account.test.ts`: email and username rules, the password
  check, link tokens, safe redirects and the email text.
- `tests/e2e/challenges.spec.ts`: sign-up, confirmation, a spent link,
  username change, sign-in errors, the taken-email answer, password reset that
  signs out other devices, the admin blocking a player, a team built with an
  invite code and handed to a new captain, and accessibility.
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

## Next phases

Competitions with challenges, files, hashed flags, hints and dynamic scoring,
then the live scoreboard, freeze, announcements, archive and certificates.
