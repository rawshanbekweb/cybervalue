# Cryptography basics lab

An animated beginner lab at `/akademiya/crypto` that tells encoding, hashing
and encryption apart. It runs fully in the browser on the shared animated-lab
layout (`src/components/playground/anim-lab`) and saves progress like the other
labs (`ProgressSync`, lab id `crypto`, 11 lessons).

| #   | Lesson                          | Widget                                                  | Solved when                                                                 |
| --- | ------------------------------- | ------------------------------------------------------- | --------------------------------------------------------------------------- |
| 1   | Text is numbers                 | Each character's UTF-8 bytes in decimal, hex and binary | The student says the ‘ mark takes 3 bytes                                   |
| 2   | Base64: no key, no lock         | Decode and encode boxes, a site cookie                  | The cookie is opened and `admin=true` forged                                |
| 3   | Encoding, hash or cipher?       | Shared sort widget                                      | Every value is in its group                                                 |
| 4   | A hash is a digital fingerprint | Two texts and their SHA-256, changed hex marked         | The texts differ in exactly one character                                   |
| 5   | Has the file been changed?      | Three mirror downloads against the official hash        | The matching mirror is picked                                               |
| 6   | Salt                            | A leaked table with and without salt                    | The pair sharing a password is marked and salt switched on                  |
| 7   | A dictionary attack             | A word list hashed until it hits the leaked hash        | The found password is typed                                                 |
| 8   | XOR                             | Clickable key bits against an encrypted byte            | The key is 0x2a and the byte opens to “C”                                   |
| 9   | How long must a key be?         | Key length slider and search time                       | The shortest length that outlasts a million years at 10^12 keys/s (85 bits) |
| 10  | Digital signatures              | Toy RSA (n = 3233): sign, verify, tamper                | A valid check and a caught tampering are both seen                          |
| 11  | Final quiz                      | Shared quiz widget                                      | Every answer is right                                                       |

`src/lib/crypto-basics/tools.ts` holds the working parts: UTF-8 bytes,
Base64, a synchronous SHA-256 (so widgets hash on every keystroke), XOR,
key-space arithmetic and the toy RSA signature. `data.ts` holds the exercise
data; every hash is computed from it, never typed in. `tests/crypto-basics.test.ts`
checks SHA-256 against `node:crypto` and that each exercise has exactly the
answer its lesson promises; `tests/e2e/crypto-lab.spec.ts` solves the
lessons in a browser.

The lab complements, and does not repeat, the HTTPS lab (letter-shift cipher,
public keys, certificates). Students at the Intermediate level are only then
offered Intermediate labs on their "next step" card.
