# Site structure and settings

The public site has two directions:

- **Academy Junior** (`/playground/junior`) for school students aged 10–14, entered with a teacher's access code.
- **Cybervalue Academy** (`/playground`) for students and beginners: the labs, CTF investigations, checkpoint tests and the student portal (`/student`).

The main navigation shows only these two and **About**. The author's portfolio (projects, research, lab write-ups, CTF, resources) is linked from About and the footer. The home page is a short hero, the two direction cards, "how it works" and a few featured entries.

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
