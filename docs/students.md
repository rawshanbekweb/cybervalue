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
- Markdown is sanitized like the public site's: raw HTML and images are not rendered.
- The Labs section also links to the existing public interactive labs.

### Writing a test

```text
? HTTPS odatda qaysi portdan foydalanadi?
- 80
+ 443
- 22

? Parolni saqlashning xavfsiz usuli?
- Ochiq matn
+ Sekin, tuzlangan hash
```

Follow these rules when writing a test:

- Each question has exactly one `+` answer.
- A test can have up to 60 questions, each with up to 8 options.
- "Attempts per student" limits retakes; `0` means unlimited.

How grading works:

- The answer key never reaches the browser.
- After an attempt, students see their score and which questions were right, but not the correct options.
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

| Placeholder                                                                             | Becomes                                                   |
| --------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| `{{flag}}`                                                                              | the student's flag, `CV{` + 24 hex characters + `}`       |
| `{{flag:base64}}`, `{{flag:hex}}`, `{{flag:rot13}}`, `{{flag:reverse}}`, `{{flag:url}}` | the same flag, encoded                                    |
| `{{decoy}}`                                                                             | a fake flag of the same shape, different at each position |
| `{{name}}`                                                                              | the student's name                                        |

How personal labs work:

- **Variants**: a line `=== variant ===` separates versions, up to 20; each student always gets the same one. Every variant needs at least one `{{flag}}`.
- **Flags**: flags and variants are derived with HMAC from a secret the material creates on first save, so no flag is stored and editing the template never changes a student's flag.
- **Download**: the file always downloads as an attachment and never renders on the site.
- **Checking**: flags are compared on the server in constant time. A student gets 20 tries per 10 minutes, and "Attempts per student" can cap the total (`0` = unlimited).
- **Feedback**: a wrong flag, a decoy and a classmate's flag all show the same message, so students learn nothing from it.

The material's admin page has one row per student who can see the lab. It shows:

- their variant and flag;
- their attempts and when they solved it;
- warnings when they sent a decoy or a classmate's flag, and on the owner's row whose flag was passed on;
- a link to download exactly the file that student received.

Wrong answers are listed below the table; correct flags are not stored.

### Reviewing practice

The material's admin page lists answers that are still waiting for review first. Give an optional 0–100 score and feedback; the student sees both on the material page.

## Data

The Prisma models are `Student`, `StudentSession`, `StudentMaterial`, `StudentSubmission` and `StudentProgress`; the migrations are `20261010090000_student_portal` and `20261011090000_student_challenges`. Admin actions on students, materials and reviews are recorded in the audit log.
