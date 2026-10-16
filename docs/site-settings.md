# Site structure and settings

The public site has two directions:

- **Academy Junior** (`/junior`) for school students aged 10–14, entered with a teacher's access code.
- **Cybervalue Academy** (`/akademiya`) for students and beginners: the labs, CTF investigations, checkpoint tests and the student portal (`/student`).

The old addresses `/playground` and `/playground/junior/…` answer with permanent (308) redirects to `/akademiya` and `/junior` (see `next.config.ts`). The Junior session cookie now lives on `/junior`, so members signed in before the move sign in once more.

The main navigation shows only these two and **About**. The author's portfolio (projects, research, **lab write-ups** at `/labs`, CTF, resources) is linked from About and the footer; "Lab write-ups" is a different thing from the academy's interactive labs.

## Tests and exams in one place

The student portal's **Tests and exams** section lists the teacher's tests together with the lab checkpoints, the HTML exam (its own teacher-issued code) and the resources self-check exam. The Academy page points there instead of to a single exam.

## Lab progress follows the student

The IP addressing, Linux, HTML and web security labs keep lesson progress in the browser. For a signed-in student, `ProgressSync` mirrors it to `StudentLabProgress` through `/student/api/progress`: on load the browser and server copies are merged (a lesson finished on either device counts), and later changes are saved. Each finished lab lesson is worth 5 XP, and the student page shows per-lab progress. Migration: `20261018090000_student_lab_progress`. The home page is a short hero, the two direction cards, "how it works" and a few featured entries.

## Admin → Site settings (`/admin/settings`)

Stored as one JSON value in `SiteSetting` under `site-config`, read through `parseSiteConfig` (`src/lib/site-config.ts`). A missing or damaged value falls back to the defaults field by field.

| Setting             | Effect                                                                                                                                                                                                                                                    |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Sections            | Each direction, each lab and the portfolio can be switched off. A closed section disappears from the navigation, the home page and the Academy page, and its pages answer 404 (`requireSection`). Closing the Academy closes its labs; Junior stays open. |
| Announcement banner | Optional text (Uzbek and English) and link above every public page.                                                                                                                                                                                       |
| Home page           | Optional headline and intro; empty fields use the built-in copy.                                                                                                                                                                                          |
| Contacts            | Contact email and the GitHub, LinkedIn, Telegram and Instagram links shown in the footer and on About.                                                                                                                                                    |
| Search engines      | Yes, no, or the server default (`SITE_INDEXABLE`). Drives `robots.txt`, the sitemap and every page's robots meta.                                                                                                                                         |

Saving revalidates every public page (`revalidatePath("/[lang]", "layout")`), so changes show on the next visit. Every save is written to the audit log.

## Admin → All users (`/admin/users`)

Students and Academy Junior members in one list, filtered by name, type, group and status. Select rows to move them to a group, allow or block access (blocking signs them out), or sign them out everywhere. Each bulk action is audited.

The admin sidebar is grouped into **Learning**, **Site content** and **Security**.
