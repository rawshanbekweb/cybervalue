// Date buckets for the analytics page. Classes run in Tashkent (UTC+5, no
// daylight saving), so a "day" and a "week" (Monday to Sunday) are Tashkent
// ones whatever the server's time zone.

export const DAY = 86_400_000;
const OFFSET = 5 * 3_600_000;
export const WEEKS = 12;
export const DAYS = WEEKS * 7;

/** "YYYY-MM-DD" of the Tashkent date at this instant. */
export const tashkentDay = (at: Date | number) =>
  new Date(new Date(at).getTime() + OFFSET).toISOString().slice(0, 10);

/** The UTC instant of Tashkent midnight that starts this date. */
export const dayStart = (day: string) =>
  new Date(Date.parse(`${day}T00:00:00Z`) - OFFSET);

/** The Monday (Tashkent) of the current week, 00:00. */
export function weekStart(now: number) {
  const today = tashkentDay(now);
  const weekday = (new Date(`${today}T00:00:00Z`).getUTCDay() + 6) % 7;
  return dayStart(today).getTime() - weekday * DAY;
}

/**
 * The window the page charts: WEEKS whole weeks ending with the current one.
 * `from` is the first Monday; the current week is still running.
 */
export function chartWindow(now: number) {
  const thisWeek = weekStart(now);
  const from = thisWeek - (WEEKS - 1) * 7 * DAY;
  return { from, thisWeek };
}

/** Index of the week (0 = oldest) an instant falls in, or -1 outside. */
export function weekIndex(at: Date | number, from: number) {
  const i = Math.floor((new Date(at).getTime() - from) / (7 * DAY));
  return i >= 0 && i < WEEKS ? i : -1;
}

/** Index of the day (0 = oldest) an instant falls in, or -1 outside. */
export function dayIndex(at: Date | number, from: number) {
  const i = Math.floor((new Date(at).getTime() - from) / DAY);
  return i >= 0 && i < DAYS ? i : -1;
}

/** Counts per week, and distinct people per week. */
export function weekly(
  events: { at: Date | number; who: string }[],
  from: number,
) {
  const counts = Array<number>(WEEKS).fill(0);
  const people = Array.from({ length: WEEKS }, () => new Set<string>());
  for (const e of events) {
    const i = weekIndex(e.at, from);
    if (i < 0) continue;
    counts[i]++;
    people[i].add(e.who);
  }
  return { counts, people };
}

/** Counts per day over the chart window. */
export function daily(events: (Date | number)[], from: number) {
  const counts = Array<number>(DAYS).fill(0);
  for (const at of events) {
    const i = dayIndex(at, from);
    if (i >= 0) counts[i]++;
  }
  return counts;
}

/** Heat level 0–4 for a day count, relative to the busiest day. */
export function heatLevel(count: number, peak: number) {
  if (count <= 0 || peak <= 0) return 0;
  return Math.min(4, Math.max(1, Math.ceil((count / peak) * 4)));
}

/** Signed change, as "+3", "−2" or "0". */
export const signed = (n: number) =>
  n > 0 ? `+${n}` : n < 0 ? `−${Math.abs(n)}` : "0";
