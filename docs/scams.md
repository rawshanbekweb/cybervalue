# Scam simulator

`/firibgarlik` teaches people of any age to recognise the scams that reach
phones in Uzbekistan. It is public, needs no sign-in and can be switched off
in **Admin → Site settings** (`scams`). The page loads the lab dictionaries
(`src/app/[lang]/firibgarlik/layout.tsx`).

## The simulator

Eight lessons on the animated lab layout (`AnimLab`), each a conversation on a
pretend phone (`src/lib/scams/curriculum.ts`):

| #   | Situation                                  | Scam? |
| --- | ------------------------------------------ | ----- |
| 1   | A call from “the bank’s security team”     | yes   |
| 2   | A real bank text after a payment           | no    |
| 3   | “You have won!” with a delivery fee        | yes   |
| 4   | A friend’s hacked account asking for money | yes   |
| 5   | “300,000 a day from home” and a deposit    | yes   |
| 6   | A fake “subsidy” app sent as an .apk file  | yes   |
| 7   | A classifieds “buyer” with a payment link  | yes   |
| 8   | “40% profit a month” investment club       | yes   |

The student first chooses what to do. In a scam, the right choice opens the
second step: tapping the parts of the conversation that are red flags. The
lesson is solved when every flag is found; a safe message is solved by the
right choice alone. Banks, apps and people are made up (QulayBank, TezPay,
BozorPlus); no real brand appears.

Progress is a lab like the others (`scams`, 8 lessons): it syncs for signed-in
students, counts toward XP, and teachers can set it as an assignment.

## Check a suspicious message

Below the lessons, `checkMessage` (`src/lib/scams/checker.ts`) looks for ten
common signs in pasted text — an SMS code or card details requested, money
asked for first, a surprise prize, pressure, a suspicious link, an .apk file,
an “official” caller, quick money and a transfer request — in Uzbek (Latin
and Cyrillic), Russian and English. It runs in the browser and sends nothing.
It never calls a message safe: with no signs it says none were found and
reminds the visitor to check through a number they already know.

`tests/scams.test.ts` checks the rules on real-looking messages in each
language, that ordinary messages raise nothing, that every scenario has one
right choice and flags matching its text, and that the checker agrees with
the simulator. `tests/e2e/scams.spec.ts` plays a lesson and uses the checker.
