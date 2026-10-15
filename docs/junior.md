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

## Password estimate

`estimateStrength` is a teaching model. It assumes an offline attack of 10 billion guesses per second and treats a list of common passwords (including `P@ssw0rd`-style substitutions) as instantly guessable. Three or more distinct words count as a passphrase from a 7,776-word list, which is why four words fall short of 10 years and five pass. Real attackers use smarter models, so the result is an illustration, not a guarantee.

## Adding or changing a mission

1. Add the copy to `content.ts` as `{ uz, en }` pairs and add the mission to `MISSIONS`.
2. Build its panel in `missions.tsx` and register it in the `PANELS` map in `JuniorAcademy.tsx`.
3. Add the answer-key checks to `tests/junior.test.ts` and extend the end-to-end test.
