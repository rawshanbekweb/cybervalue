# Cybervalue Academy Junior

A first step into cybersecurity for beginners (aimed at 7th-grade students, 13–14 years old) at `/playground/junior`. It is public: no account or access code is needed, and nothing typed there is sent to the server. The Playground page shows a card for it above the other gateways.

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

## Agent card and ranks

The Junior page and the Cipher Room show an **agent ID card** (`AgentCard.tsx`): a codename the student picks (or rolls at random), XP and a rank. Each finished mission is worth 100 XP and each solved Cipher Room exercise 15 XP; the ranks run from _New recruit_ to _Chief agent_ (`src/lib/junior/rank.ts`). A new rank is announced once. The card is stored in the browser under `cybervalue:junior:agent:v1` and the codename is sanitised on read.

## Cipher Room

`/playground/junior/ciphers` is a timeline of nine ciphers, each with a short history, a fun fact, an interactive workbench and homework:

| #   | Cipher                        | Era     | Workbench                                                    |
| --- | ----------------------------- | ------- | ------------------------------------------------------------ |
| 1   | Atbash                        | ~600 BC | Mirror alphabet that highlights the letters in use           |
| 2   | Spartan scytale               | ~400 BC | The rod (lines) and the unwound strip, coloured by column    |
| 3   | Polybius square               | ~150 BC | 5 × 5 grid that steps through a word; plays it as tap code   |
| 4   | Caesar                        | ~50 BC  | Rotating cipher wheel                                        |
| 5   | Al-Kindi’s frequency analysis | ~850 AD | Letter-frequency bars against Uzbek or English; “Crack it”   |
| 6   | Vigenère                      | 1553    | Letter + key letter = cipher letter, worked out with numbers |
| 7   | Pigpen                        | 1700s   | The key grids and the message drawn as symbols               |
| 8   | Morse code (an encoding)      | 1838    | Lamp and beep playback, and a telegraph key to tap your own  |
| 9   | Public keys (Diffie–Hellman)  | 1976    | Paint mixing: Ali and Vali share a colour Eve cannot make    |

- **Homework:** 3–6 fixed exercises per cipher (45 in total) count towards XP and are saved under `cybervalue:junior:ciphers:v1` as `{ "<cipher id>": [solved exercise indexes] }`. _New exercise_ adds unlimited generated practice (not counted).
- **Homework sheet:** teachers and parents pick ciphers and a number per cipher, make a fresh random sheet, print it (only the sheet prints) and can show the answers.
- Only A–Z are enciphered; answers are compared on letters only, so `o‘`/`g‘` apostrophes, case and spaces do not matter. Uzbek letter frequencies were counted from the site’s Uzbek copy.
- All content lives in `src/lib/junior/cipher-content.ts` as `{ uz, en }` pairs; answers are computed with the cipher functions in `src/lib/junior/ciphers.ts`, and `tests/junior-ciphers.test.ts` re-solves every exercise and 2,400 generated ones.

## Design rules

- **Tone:** a recruit joining a team of defenders, not a children’s game. Short sentences; each new term is explained where it first appears.
- **Safety first:** the password mission tells students never to type a real password, and nothing is stored or sent. The ethics mission teaches the permission rule before anything offensive appears; nothing in Junior touches a real system.
- **Progress** is saved in the browser under `cybervalue:junior:progress:v1` as `{ "<mission id>": true }`. Stored values are validated, so unknown ids and non-`true` values are discarded. A mission deep link is `#mission/N`.
- **Learning aid, not an assessment.** Answers and flags are checked in the browser, like the Missions and CTF labs. Do not use Junior for grading; use the student area for that.

## Where things live

| Path                                               | Purpose                                                        |
| -------------------------------------------------- | -------------------------------------------------------------- |
| `src/lib/junior/content.ts`                        | All mission copy and answer keys as `{ uz, en }` pairs         |
| `src/lib/junior/logic.ts`                          | Password estimate, Caesar and Base64 helpers, progress restore |
| `src/components/playground/junior/`                | Page shell (`JuniorAcademy.tsx`), mission panels, styles       |
| `src/components/junior-gateway.tsx`                | Card on the Playground page                                    |
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
