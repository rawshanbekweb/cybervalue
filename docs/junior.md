# Cybervalue Academy Junior

A first step into cybersecurity for beginners (aimed at 7th-grade students, 13–14 years old) at `/junior`. Members sign in with an access code from their teacher; the Playground page shows a card for it above the other gateways.

## Accounts and access codes

- An admin creates members at **Admin → Academy Junior** (`/admin/junior`) from a list (`Full name | group`, one per line), optionally with an end date. Each member gets an 8-symbol code shown as `XXXX-XXXX` (Crockford base32, `src/lib/junior/codes.ts`). Codes are shown once and stored only as SHA-256 digests; a lost code is replaced from the member's page, which also closes their sessions.
- Signing in (`juniorLoginAction`) is rate limited per client (40 per 5 minutes) and globally (400 per 5 minutes) and opens a 24-hour session in the `cv_junior` cookie (path `/junior`, `src/lib/junior/session.ts`). Blocking a member or passing the end date ends access at once.
- Progress lives on the server in `JuniorMember.progress` (JSON, `src/lib/junior/progress.ts`): missions, cipher exercises, the case, solved daily puzzles, badge events and the agent card. Each part is saved separately (`saveJuniorPartAction`), re-validated with the same restore functions, and the XP is recomputed on the server, so an edited request can only claim what a real run could earn. The client store (`store.tsx`) updates at once and retries failed saves on the next change; a banner shows while something is unsaved.
- `/junior/secret` stays public so a friend without a code can open a secret link.

## Pages

| Path                   | What is there                                                     |
| ---------------------- | ----------------------------------------------------------------- |
| `/junior`              | Sign-in when signed out; missions and the Cyber HQ case otherwise |
| `/junior/ciphers`      | The Cipher Room: history, fun facts and workbenches               |
| `/junior/homework`     | Daily puzzle, cipher exercises (`#cipher/N`), printable sheet     |
| `/junior/achievements` | Agent card, group ranking, certificate and badges                 |
| `/junior/secret`       | Secret messages (public)                                          |

Every signed-in page shares `AcademyShell.tsx`: the member's name, rank and XP, a sign-out button and the section tabs. Icons are lucide glyphs inside the site's outline rings (`.jr-ring`); decorative emoji are not used.

## Admin: control and results

- `/admin/junior`: totals (members, active this week, average XP, groups), a per-group overview, the create form and a table of every member with rank, XP, missions, exercises, the case, daily puzzles and streak, last activity and status. Filter by group, sort by XP, name or activity, and download the same data as CSV (`/admin/junior/export`, formulas neutralised).
- `/admin/junior/[id]`: the member's missions, per-cipher progress bars and badges; edit name, group, note, end date and access; issue a new code, sign out everywhere, reset progress or delete. Every change is written to the audit log.
- The admin dashboard shows an academy overview for students and Junior members.

## Missions

Six short missions (about 30 minutes in total). Every mission has a goal, a hands-on activity, and feedback that explains _why_ an answer is right.

| #   | Mission                | What the student does                                                             | Completes when                              |
| --- | ---------------------- | --------------------------------------------------------------------------------- | ------------------------------------------- |
| 1   | Password master        | Types made-up passwords and sees an estimated time to crack them                  | The estimate reaches 10 years               |
| 2   | Spot the phish         | Classifies five messages as phishing or safe                                      | At least 4 of 5 are right                   |
| 3   | The secret cipher      | Moves a slider to break a Caesar cipher and finds the hidden word                 | The hidden word is entered                  |
| 4   | Digital footprint      | Ticks the risky details in a social media post                                    | Every risky and safe detail is marked right |
| 5   | Your first CTF         | Finds three flags: an HTML comment, a Base64 text, a reversed text (`CV{...}`)    | All three flags are submitted               |
| 6   | Ethical hacker’s rules | Decides whether five situations are acceptable (permission, labs, reporting bugs) | All five answers are right                  |

When all six are complete, the page shows next steps: HTML foundations, the Linux lab, the IP addressing lab and the story CTF.

## Story campaign, badges and certificate

- **The Cyber HQ case** (`src/lib/junior/story.ts`): someone tried to break into the Cybervalue cyber HQ. Each finished mission adds a piece of evidence to the case file; with all six, the recruit picks the attacker among three suspects. Solving it is worth 100 XP and is saved with the member's progress.
- **Certificate:** with all missions done and the case closed, a printable certificate shows the codename (or a name typed for it), rank, XP and date. Only the certificate prints.
- **Badges** (`src/lib/junior/badges.ts`): 12 achievements worked out from progress, plus three small events (tapping SOS on the telegraph key, sending a secret message, opening every cipher).
- **Daily puzzle** (`src/lib/junior/daily.ts`): one encrypted saying or safety tip per day (Tashkent midnight), the same for everyone, with the cipher and key shown. +20 XP each; consecutive days make a streak. It sits at the top of the homework page.
- **Narrator:** “Listen” buttons read mission briefs, the case and cipher stories aloud with the browser’s own speech engine; devices without an Uzbek voice read with another one and say so.

## Secret messages

`/junior/secret` encrypts a message with Caesar, Atbash, Vigenère, Enigma or Morse and makes a link. The ciphertext travels in the link’s `#m=` fragment, which browsers never send to the server; the key is left out unless the sender ticks the box, so the friend has to ask for it. Links are validated on read (`decodeSecret`): unknown ciphers, bad keys, oversized or malformed payloads are rejected and markup is stripped.

## Group ranking

The achievements page ranks the member's group by XP (ties go to whoever got there first), showing only codenames (or first name and initial) and XP. Members without a group see a note instead.

## Agent card and ranks

The achievements page shows an **agent ID card** (`AgentCard.tsx`): a codename the student picks (or rolls at random), XP and a rank. Each finished mission is worth 100 XP, each solved Cipher Room exercise 15 XP, each daily puzzle 20 XP and closing the case 100 XP; the ranks run from _New recruit_ to _Chief agent_ (`src/lib/junior/rank.ts`). A new rank is announced once. The codename is sanitised on save and also shown in the ranking and the admin table.

## Cipher Room

`/junior/ciphers` is a timeline of ten ciphers, each with a short history, a fun fact, an interactive workbench and homework:

| #   | Cipher                             | Era       | Workbench                                                    |
| --- | ---------------------------------- | --------- | ------------------------------------------------------------ |
| 1   | Atbash                             | ~600 BC   | Mirror alphabet that highlights the letters in use           |
| 2   | Spartan scytale                    | ~400 BC   | The rod (lines) and the unwound strip, coloured by column    |
| 3   | Polybius square                    | ~150 BC   | 5 × 5 grid that steps through a word; plays it as tap code   |
| 4   | Caesar                             | ~50 BC    | Rotating cipher wheel                                        |
| 5   | Al-Kindi’s frequency analysis      | ~850 AD   | Letter-frequency bars against Uzbek or English; “Crack it”   |
| 6   | Vigenère                           | 1553      | Letter + key letter = cipher letter, worked out with numbers |
| 7   | Pigpen                             | 1700s     | The key grids and the message drawn as symbols               |
| 8   | Morse code (an encoding)           | 1838      | Lamp and beep playback, and a telegraph key to tap your own  |
| 9   | Enigma (rotors I–III, reflector B) | 1939–1945 | Rotor windows, lampboard, keyboard and the signal’s path     |
| 10  | Public keys (Diffie–Hellman)       | 1976      | Paint mixing: Ali and Vali share a colour Eve cannot make    |

- **Homework:** 3–6 fixed exercises per cipher (51 in total) are on the homework page, count towards XP and are saved as `{ "<cipher id>": [solved exercise indexes] }`. _New exercise_ adds unlimited generated practice (not counted).
- **Homework sheet:** teachers and parents pick ciphers and a number per cipher, make a fresh random sheet, print it (only the sheet prints) and can show the answers.
- Only A–Z are enciphered; answers are compared on letters only, so `o‘`/`g‘` apostrophes, case and spaces do not matter. Uzbek letter frequencies were counted from the site’s Uzbek copy.
- All content lives in `src/lib/junior/cipher-content.ts` as `{ uz, en }` pairs; answers are computed with the cipher functions in `src/lib/junior/ciphers.ts`, and `tests/junior-ciphers.test.ts` re-solves every exercise and 2,400 generated ones.

## Design rules

- **Tone:** a recruit joining a team of defenders, not a children’s game. Short sentences; each new term is explained where it first appears.
- **Safety first:** the password mission tells students never to type a real password, and nothing is stored or sent. The ethics mission teaches the permission rule before anything offensive appears; nothing in Junior touches a real system.
- **Progress** is saved to the member's account (see above). Stored values are validated, so unknown ids and non-`true` values are discarded. A mission deep link is `#mission/N`.
- **Learning aid, not an assessment.** Answers and flags are checked in the browser, like the Missions and CTF labs. Do not use Junior for grading; use the student area for that.

## Where things live

| Path                                               | Purpose                                                        |
| -------------------------------------------------- | -------------------------------------------------------------- |
| `src/lib/junior/content.ts`                        | All mission copy and answer keys as `{ uz, en }` pairs         |
| `src/lib/junior/logic.ts`                          | Password estimate, Caesar and Base64 helpers, progress restore |
| `src/components/playground/junior/`                | Page shell (`JuniorAcademy.tsx`), mission panels, styles       |
| `src/components/junior-gateway.tsx`                | Card on the Playground page                                    |
| `src/lib/junior/progress.ts`, `session.ts`         | Server-side progress model and member sessions                 |
| `src/lib/junior/admin.ts`                          | Admin summaries, group stats and CSV                           |
| `src/app/admin/(cms)/junior/`                      | Admin list, member page, actions and CSV export                |
| `src/lib/i18n/junior.json`                         | Dictionary entries for the card and page metadata              |
| `tests/junior.test.ts`, `tests/e2e/junior.spec.ts` | Unit tests and a full end-to-end run                           |
| `src/lib/junior/ciphers.ts`, `cipher-content.ts`   | Cipher Room: cipher functions, stories, homework, generator    |
| `src/lib/junior/rank.ts`                           | XP, ranks and codenames for the agent card                     |
| `src/components/playground/junior/ciphers/`        | Cipher Room page, workbenches, homework and printable sheet    |

## Password estimate

`estimateStrength` is a teaching model. It assumes an offline attack of 10 billion guesses per second and treats a list of common passwords (including `P@ssw0rd`-style substitutions) as instantly guessable. Three or more distinct words count as a passphrase from a 7,776-word list, which is why four words fall short of 10 years and five pass. Real attackers use smarter models, so the result is an illustration, not a guarantee.

## Adding or changing a mission

1. Add the copy to `content.ts` as `{ uz, en }` pairs and add the mission to `MISSIONS`.
2. Build its panel in `missions.tsx` and register it in the `PANELS` map in `JuniorAcademy.tsx`.
3. Add the answer-key checks to `tests/junior.test.ts` and extend the end-to-end test.
