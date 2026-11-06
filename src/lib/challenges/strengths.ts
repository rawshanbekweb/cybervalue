// How an entrant did in each category of a competition: the points of the
// challenges it solved (at their current value) against everything the
// category is worth. Drives the strength charts on the scoreboard and on
// the entrant page. No database here, so it is unit-tested.
import { CATEGORIES } from "./scoring";

export type CategoryStat = {
  category: string;
  /** Points of the solved challenges, at their current value. */
  points: number;
  /** What every challenge of the category is worth now. */
  possible: number;
  solved: number;
  total: number;
  /** points / possible, 0 to 1 (0 when the category is worth nothing). */
  share: number;
};

type Challenge = { id: string; category: string };

/** Categories that have challenges, in the board's usual order. */
export function categoriesOf(challenges: Challenge[]) {
  const present = new Set(challenges.map((c) => c.category));
  const known: string[] = CATEGORIES.filter((c) => present.has(c));
  const other = [...present].filter((c) => !known.includes(c)).sort();
  return [...known, ...other];
}

export function categoryStats(
  challenges: Challenge[],
  values: Map<string, number>,
  solved: Iterable<string>,
): CategoryStat[] {
  const done = new Set(solved);
  return categoriesOf(challenges).map((category) => {
    const inside = challenges.filter((c) => c.category === category);
    const mine = inside.filter((c) => done.has(c.id));
    const points = mine.reduce((s, c) => s + (values.get(c.id) ?? 0), 0);
    const possible = inside.reduce((s, c) => s + (values.get(c.id) ?? 0), 0);
    return {
      category,
      points,
      possible,
      solved: mine.length,
      total: inside.length,
      share: possible > 0 ? Math.min(1, points / possible) : 0,
    };
  });
}

/** The category with the largest share (ties: more points), or null. */
export function strongest(stats: CategoryStat[]) {
  let best: CategoryStat | null = null;
  for (const s of stats)
    if (
      s.solved > 0 &&
      (!best ||
        s.share > best.share ||
        (s.share === best.share && s.points > best.points))
    )
      best = s;
  return best;
}

/**
 * The leader of each category: most points there, ties to whoever is placed
 * higher overall (rows come in rank order). Categories nobody scored in are
 * left out.
 */
export function categoryLeaders<
  R extends { entrantId: string; byCategory: CategoryStat[] },
>(rows: R[]) {
  const leaders = new Map<string, { row: R; stat: CategoryStat }>();
  for (const row of rows)
    for (const stat of row.byCategory) {
      const current = leaders.get(stat.category);
      if (stat.points > 0 && (!current || stat.points > current.stat.points))
        leaders.set(stat.category, { row, stat });
    }
  return leaders;
}
