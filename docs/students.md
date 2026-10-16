# Student area

A private learning area at `/student` for students the admin invites. Nothing in it is public, indexed or listed in the sitemap.

## Access codes

- In **Admin → Students**, paste one student per line: `Full name | group`. The group is optional. You can also set a date when access ends.
- Each student gets a 16-character code such as `7KQ2-MX9D-…`. The codes are shown **once**, so download the list and hand each student their own code. Only a SHA-256 digest is stored, and the codes use 80 random bits.
- Students sign in at `/student/login`. Case, spaces and dashes in the code do not matter, and look-alike letters (O/0, I/L/1) are accepted.
- On a student's page you can:
  - edit the name or group, or block access (this ends open sessions immediately);
  - issue a new code (the old one stops working);
  - sign the student out everywhere;
  - delete the student together with all answers.
- Sessions last 12 hours, and the cookie is scoped to `/student`. Sign-in is rate-limited to 40 attempts per client and 400 attempts overall per 5 minutes, which leaves room for a whole classroom behind one address.

## Materials

In **Admin → Student materials**, create materials of four kinds:

| Kind         | Student sees                       | Completion                |
| ------------ | ---------------------------------- | ------------------------- |
| Lesson       | Markdown body                      | "Mark as complete" button |
| Lab          | Markdown body (+ open site labs)   | "Mark as complete" button |
| Practice     | Body + answer form; your feedback  | Submitting an answer      |
| Test         | Body + questions, graded on server | Submitting an attempt     |
| Personal lab | Body + their own file + flag form  | Submitting their own flag |

- **Groups**: an empty field means every student sees the material. Otherwise list groups separated by commas.
- **Order**: lower numbers come first.
- **Visible to students**: unchecked materials stay hidden.
- **Entrance exam**: materials whose slug starts with `kirish-sinovi-` are shown together in an "Entrance exam" section at the top of the student's page, whatever their kind, and are left out of the other sections.
- **Levels**: tick Beginner, Intermediate or Advanced to show a material only to students placed at those levels. With no level ticked, every student sees it, including students who are not placed yet. Keep the entrance exam open to everyone. A level works alongside groups: a student sees a material only when both their group and their level allow it.
- Markdown is sanitized like the public site's: raw HTML and images are not rendered.
- The Labs section also links to the existing public interactive labs.
- The student's page lists only sections that have materials (Labs always shows, for the open labs), as compact cards with a row of section links at the top.

### Writing a test

**Admin → Student materials → New test** opens the visual editor: one card per question with its options, a radio button for the correct one and an optional explanation. Questions can be moved, duplicated and deleted; empty options are dropped. The editor submits the questions as JSON (`quizJson`, checked by `parseQuizJson` in `src/lib/student/admin.ts`). The **Text** switch shows the same questions in the plain format below, for pasting a prepared test:

```text
? HTTPS odatda qaysi portdan foydalanadi?
- 80
+ 443
- 22

? Parolni saqlashning xavfsiz usuli?
- Ochiq matn
+ Sekin, tuzlangan hash
> Hash bir tomonlama: bazani o‘g‘irlagan odam parolni o‘qiy olmaydi.
```

Follow these rules when writing a test:

- Each question has exactly one `+` answer.
- Optional `>` lines under the options explain the answer in simple words; several lines make one explanation of up to 2,000 characters.
- A test can have up to 60 questions, each with up to 8 options.
- "Attempts per student" limits retakes; new materials start at 3, and `0` means unlimited. The student's page shows each test's best score and the attempts used.
- Every student gets the questions, and the options inside each question, in their own order, which changes with each attempt. Reloading the page keeps the order. Grading uses the stored order, so the answer key and results do not change.
- **Time limit** (minutes, `0` = none) makes the test timed. Students see a "Start the test" button first, and the questions appear once they press it. The timer:
  - is measured on the server, so it keeps running if the student reloads or leaves the page;
  - submits the form automatically at the deadline, and unanswered questions count as wrong;
  - allows 60 seconds of grace for a slow connection; answers that arrive later score 0;
  - turns an attempt that was started but never submitted into a zero-score attempt once its deadline passes, so leaving the page cannot buy a fresh timer.

How grading works:

- The answer key never reaches the browser.
- After an attempt, students see their score, the option they chose for each question and the explanations of the questions they got right.
- Correct options and the explanations of missed questions appear only after the last attempt, after a perfect score, or after every attempt when attempts are unlimited.
- **Explanation after answering** (Markdown) is shown below the review at the same moment, as a short summary of what to remember.
- The material's admin page shows every attempt and the average score.

### Writing a personal lab

A personal lab gives every student their own copy of an artifact (a log, a page, a config, a script…) with their own flag inside. Set a file name such as `access.log` and write the template:

```text
2026-10-11 09:14:02 sshd: Failed password for admin from 203.0.113.9
2026-10-11 09:14:09 app: debug token={{decoy}}
2026-10-11 09:15:41 app: export payload={{flag:base64}}
=== variant ===
2026-10-11 10:02:17 nginx: GET /?q={{flag:url}} 200
```

| Placeholder                                                                             | Becomes                                                                                                                    |
| --------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `{{flag}}`                                                                              | the student's flag, `CV{` + 24 hex characters + `}`                                                                        |
| `{{flag:base64}}`, `{{flag:hex}}`, `{{flag:rot13}}`, `{{flag:reverse}}`, `{{flag:url}}` | the same flag, encoded                                                                                                     |
| `{{decoy}}`, `{{decoy:base64}}`, …                                                      | a fake flag of the same shape, different at each position; encodable like the flag, so decoding every string is not enough |
| `{{name}}`                                                                              | the student's name                                                                                                         |

How personal labs work:

- **Variants**: a line `=== variant ===` separates versions, up to 20; each student always gets the same one. Every variant needs at least one `{{flag}}`.
- **Flags**: flags and variants are derived with HMAC from a secret the material creates on first save, so no flag is stored and editing the template never changes a student's flag.
- **Download**: the file always downloads as an attachment and never renders on the site.
- **Checking**: flags are compared on the server in constant time. A student gets 20 tries per 10 minutes, and "Attempts per student" can cap the total (`0` = unlimited).
- **Feedback**: a wrong flag, a decoy and a classmate's flag all show the same message, so students learn nothing from it.
- **Explanation**: the **Explanation after answering** field (Markdown) appears once the student solves the lab or runs out of attempts, and is never sent earlier. Explain what happened, how to find it, why the decoys were wrong and how to fix the problem. Separate one text per artifact variant with `=== variant ===` (same count and order as the template) so each student reads the debrief for their own file.

The material's admin page has one row per student who can see the lab. It shows:

- their variant and flag;
- their attempts and when they solved it;
- warnings when they sent a decoy or a classmate's flag, and on the owner's row whose flag was passed on;
- a link to download exactly the file that student received.

Wrong answers are listed below the table; correct flags are not stored.

### Reviewing practice

The material's admin page lists answers that are still waiting for review first. Give an optional 0–100 score and feedback; the student sees both on the material page.

## Placement after the entrance exam

The entrance exam is the test and personal labs whose slug starts with `kirish-sinovi-`. The **Level** column in **Admin → Results** suggests a level from them:

| Suggestion   | Rule                                                                 |
| ------------ | -------------------------------------------------------------------- |
| Advanced     | best test score at least 88% and every entrance lab solved           |
| Intermediate | at least 60% and at least one lab solved (or no entrance labs exist) |
| Beginner     | anything else, once the test is taken                                |

There are two ways to confirm a suggestion:

- **Set: …** on a row places that one student.
- **Apply suggested levels** places every student in the selected group who has a result but no level yet. It never overwrites a level you already set.

You can also change a student's level on their page. Every change is recorded in the audit log, and the student sees their level at the top of their page.

## Certificates

On a student's page in **Admin → Students**, **Issue certificate** creates a certificate with a course title and, optionally, a level. The student's name, the title and the level are copied at that moment, so later edits to the student do not change what was issued.

- The student finds it under **Certificates** on their page and can print it or save it as a PDF (one A4 landscape sheet).
- The QR code and the code printed under it, such as `W6VE-B91E-55JW`, open the public page `/sertifikat/<code>`. That page shows the name, course, level and date, and is `noindex`. Codes carry 60 random bits, so they cannot be guessed, and look-alike letters are accepted.
- **Revoke** keeps the record: the public page then says the certificate was revoked and on what date, and the student no longer sees it. **Restore** undoes this. The public page is cached for up to a minute.
- Certificates outlive the student's account: deleting a student keeps the certificates they were issued valid.

Issuing, revoking and restoring are recorded in the audit log.

## Results

**Admin → Results** shows the class as a matrix: one row per student and one column per published material. You can filter the matrix by group. The cells read:

- `✓`: done (a lesson or lab marked complete);
- `85`: the teacher's practice score, or `To review (n)` while answers wait for review;
- `90% (2)`: a test's best score and the number of attempts;
- `✓ (3)` or `✗ (2)`: a personal lab, solved or still unsolved, with the number of attempts;
- `—`: not started.

Each row also shows completed/available and an average score: the mean of test best scores and reviewed practice scores. The footer shows how many students finished each material.

**Download CSV** exports the same view for the selected group. The file is UTF-8 with a BOM, so Excel shows Uzbek letters correctly, and cells that start with `=`, `+`, `-` or `@` are escaped against formula injection.

## Data

The Prisma models are `Student`, `StudentSession`, `StudentMaterial`, `StudentSubmission`, `StudentProgress`, `StudentQuizStart` (an open timed attempt) and `StudentCertificate`; the migrations are `20261010090000_student_portal`, `20261011090000_student_challenges`, `20261012090000_student_explanations` `20261013090000_timed_quizzes`, `20261013100000_student_levels`, `20261013110000_student_certificates` and `20261014090000_more_quiz_attempts` (which raises tests limited to one or two attempts to three). Admin actions on students, materials and reviews are recorded in the audit log.

## Lab checkpoints

The IP addressing and Linux labs end with **checkpoint tests** (`src/lib/checkpoints/`): `network-1` (lessons 1–6, 12 questions), `network-2` (lessons 7–12, 10 questions) and `linux-1` (10 questions from the lesson quizzes). Pass mark: 70%.

- Every attempt gets fresh questions from a random seed. Address arithmetic is generated with the lab's own `ip.ts`/`practice.ts` code; concept questions come from fixed pools.
- `POST /student/api/checkpoint` with `{action: "start", id}` returns the questions **without answers** and a signed attempt token (HMAC keyed from `AUTH_SECRET`, or from `DATABASE_URL` when it is unset; valid 2 hours, bound to the signed-in student). `{action: "submit", token, answers}` rebuilds the questions from the seed and grades them on the server; the right answers and explanations are returned only then.
- Anyone can take a checkpoint. For a signed-in student (the route sits under `/student`, so the `cv_student` cookie reaches it) the result is stored in `StudentCheckpoint`; a seed can be graded only once per student.

### Question analysis

A test's admin page shows, for every question, the share of attempts that got it wrong, the wrong option picked most often and how many left it blank, with the three hardest questions on top (`src/lib/student/quiz-stats.ts`). Attempts saved before the number of questions changed are left out.

## Assignments

**Admin → Assignments** (`/admin/assignments`) sets work for one group (or every student) with a deadline in Tashkent time. The target is a student material, a lab checkpoint or every lesson of an open lab, stored as `material:<id>`, `checkpoint:<id>` or `lab:<id>` in `StudentAssignment` (migration `20261019090000_student_assignments`). Nothing is marked by hand: a material counts once finished or handed in, a checkpoint once passed, a lab once all its lessons are saved. A status is _done_, _done late_, _still open_ or _missed_.

Students see their assignments at the top of their page, open work due within a week and missed work first. The class panel lists the last 30 days of assignments with who missed them, and a missed deadline puts a student on the **Needs attention** list.

## XP, ranks, badges and the group ranking

`src/lib/student/xp.ts` turns what a student has done into XP: lesson or lab completed 20, practice handed in 30, test best percent (up to 100), personal lab solved 100, checkpoint best percent × 0.6, each finished lesson in an open lab 5. Ranks run from Trainee (0) to Expert (3200). Twelve badges reward first steps, tests, flags, checkpoints, a three-week streak and finishing everything. Weeks start on Monday, Tashkent time; the weekly goal is three actions.

The student page shows the rank card, badges, the group ranking (first name and initial only, active students of the same group) and the lab checkpoints with their best scores.

## Class panel

**Admin → Class** (`/admin/class`) shows a group at a glance: students active this week, completion, test average, checkpoint pass rate, Academy Junior members of the same group, activity per day over two weeks, and a **Needs attention** list (no activity, inactive for over a week, far behind the class average, tests below 50%). The table lists every student's rank, XP, completion, test average, checkpoints and activity; **Weekly report (CSV)** exports the same. Each student's admin page also shows their rank, weekly activity and checkpoint attempts. The migration is `20261017090000_student_checkpoints`.

## Live quiz

**Admin → Live quiz** (`/admin/live`) turns any test into a classroom game. Opening a game snapshots the test's questions into `LiveGame` (migration `20261020090000_live_quiz`) and shows a six-digit code and a QR code on the host screen (`/admin/live/<id>`, with a full-screen button for the projector).

- Students open **/live** on their phones, type the code and a name (unique within the game). No account is needed; the seat token lives in the browser tab and only its SHA-256 hash is stored.
- The host starts the game and each question runs for 10–60 seconds. Phones poll `POST /api/live/state` every 1.5–2.5 seconds and answer with `POST /api/live/answer`; the right answer never leaves the server before the reveal.
- A right answer earns 500 points plus up to 500 for speed. The screen reveals by itself when time is up or everyone has answered, then shows how the class voted, the explanation and the top five. The last question leads to a podium and the full ranking.
- Host commands only move from the state they were read in, so a double click cannot skip a question. Games stay listed with their results until deleted.
