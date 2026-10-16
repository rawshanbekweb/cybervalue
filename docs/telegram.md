# Telegram notifications and parent reports

## Parent reports

Every student and Academy Junior member can have a private progress page at `/report/<token>`, created on their admin page under **Parents** (`reportToken`, migration `20261021090000_telegram_reports`). The page is never indexed, sends no referrer and can be printed or saved as PDF. **Replace link** issues a new token; **Turn off** removes it and unlinks the parents' Telegram chats.

Students see rank, this week's activity, completion, test average, two weeks of activity, assignments, recent test results, lab lessons, checkpoints and certificates. Junior members see rank, missions, exercises and daily puzzles. No classmates are shown.

## The bot

The bot is optional. Without these variables nothing is sent and **Admin → Telegram** explains the setup:

| Variable                | Value                                                                    |
| ----------------------- | ------------------------------------------------------------------------ |
| `TELEGRAM_BOT_TOKEN`    | the token from @BotFather                                                |
| `TELEGRAM_BOT_USERNAME` | the bot's username, without `@`                                          |
| `CRON_SECRET`           | 16+ random characters; Vercel Cron sends it as `Authorization: Bearer …` |

After a deploy, press **Connect the bot to this site** once: it registers `https://<SITE_URL>/api/telegram/webhook` with a secret header derived from `AUTH_SECRET` (or `DATABASE_URL`).

People link a chat by opening a deep link `t.me/<bot>?start=<payload>`. The payload names the kind (teacher, student, parent of a student, parent of a Junior member) and the id, signed with an HMAC, so it cannot be forged or reused for someone else. Links are on **Admin → Telegram** (teacher), the student's own page (student) and the **Parents** block (parent). `/stop` unlinks a chat; a chat that blocks the bot is unlinked on the next send. Linked chats are stored in `TelegramChat`.

## What is sent (in Uzbek)

- **New assignment** → linked students of the group, at once.
- **Practice answer handed in** → linked teachers, at once.
- **Daily job** (`/api/cron/daily`, 09:05 Tashkent, `vercel.json`):
  - a reminder for each unfinished assignment due within 24 hours;
  - the teacher's list of deadlines missed since yesterday;
  - on Mondays, each linked parent's weekly summary with the report link.

Every message of the daily job is recorded in `NotificationLog`, so a second run sends nothing twice; entries older than 30 days are removed.

## Tests

`tests/telegram.test.ts` covers link signing and message escaping. `tests/e2e/telegram.spec.ts` runs a stand-in Telegram API at `TELEGRAM_API_URL` (set in CI) and checks linking, the assignment message, the parent report, the daily reminder (sent once) and `/stop`.
