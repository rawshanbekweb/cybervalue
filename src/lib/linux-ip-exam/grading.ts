// Server-only grading for the Linux and IP exam. Never import this module
// from client components: it holds the answer keys.
import {
  CHOICES,
  MAX_OPEN,
  MAX_TEST,
  MAX_TOTAL,
  OPENS,
  type LipAnswers,
  type LipItemResult,
  type LipResult,
} from "./content";

/** The index of the right option of each test question. */
const CHOICE_KEYS: Record<string, number> = {
  l1: 1,
  l2: 2,
  l3: 3,
  l4: 0,
  l5: 3,
  l6: 1,
  l7: 2,
  l8: 0,
  l9: 1,
  l10: 3,
  l11: 1,
  l12: 0,
  l13: 2,
  l14: 2,
  l15: 1,
  l16: 2,
  l17: 3,
  l18: 0,
  l19: 1,
  l20: 2,
  n1: 1,
  n2: 2,
  n3: 1,
  n4: 3,
  n5: 1,
  n6: 0,
  n7: 2,
  n8: 1,
  n9: 2,
  n10: 3,
  n11: 1,
  n12: 1,
  n13: 1,
  n14: 2,
  n15: 1,
  n16: 2,
  n17: 3,
  n18: 2,
  n19: 0,
  n20: 3,
};

/** Tidy an answer: drop a leading prompt, unify quotes and spaces. */
export function norm(value: string) {
  return value
    .replace(/ /g, " ")
    .replace(/[“”«»]/g, '"')
    .replace(/[‘’]/g, "'")
    .trim()
    .replace(/^\$\s*/, "")
    .replace(/\s+/g, " ")
    .replace(/(?<!\\);$/, "")
    .trim();
}

const unquote = (s: string) => s.replace(/["']/g, "");

type OpenKey = {
  check: (answer: string) => boolean;
  expected: string;
};

const OPEN_KEYS: Record<string, OpenKey> = {
  o1: {
    check: (a) =>
      /^tail (-n ?5|-5|--lines=5) \/etc\/passwd$/.test(a) ||
      /^tail \/etc\/passwd -n ?5$/.test(a),
    expected: "tail -n 5 /etc/passwd",
  },
  o2: {
    check: (a) => a === "30",
    expected: "30",
  },
  o3: {
    check: (a) => {
      const m = a.match(/^chmod (\S+) (\.\/)?script\.sh$/);
      if (!m) return false;
      if (m[1] === "750" || m[1] === "0750") return true;
      const parts = m[1].split(",").sort();
      return (
        parts.join(",") === "g=rx,o=,u=rwx" ||
        parts.join(",") === "g=rx,o-rwx,u=rwx" ||
        parts.join(",") === "g=xr,o=,u=rwx"
      );
    },
    expected: "chmod 750 script.sh",
  },
  o4: {
    check: (a) => {
      const s = unquote(a);
      return (
        (/^grep -c Failed password \/var\/log\/auth\.log$/.test(s) ||
          /^grep Failed password \/var\/log\/auth\.log \| wc -l$/.test(s) ||
          /^cat \/var\/log\/auth\.log \| grep Failed password \| wc -l$/.test(
            s,
          ) ||
          /^cat \/var\/log\/auth\.log \| grep -c Failed password$/.test(s)) &&
        /["']Failed password["']/.test(a)
      );
    },
    expected: 'grep -c "Failed password" /var/log/auth.log',
  },
  o5: {
    check: (a) => a.replace(/\/20$/, "") === "172.16.32.0",
    expected: "172.16.32.0",
  },
  o6: {
    check: (a) => a === "192.168.1.95",
    expected: "192.168.1.95",
  },
  o7: {
    check: (a) => a.toLowerCase() === "2001:db8::ff00:42:8329",
    expected: "2001:db8::ff00:42:8329",
  },
  o8: {
    check: (a) => ["/22", "22", "255.255.252.0"].includes(a),
    expected: "/22",
  },
  o9: {
    check: (a) => {
      const s = a.replace(/^sudo /, "");
      const sockets = s.match(/^(ss|netstat) -([a-z]+)(?: \| grep :?8080)?$/);
      if (sockets) return ["l", "p"].every((f) => sockets[2].includes(f));
      return /^lsof -i ?(tcp)?:8080$/.test(s) || /^fuser 8080\/tcp$/.test(s);
    },
    expected: "sudo ss -tlnp | grep 8080",
  },
  o10: {
    check: (a) => {
      if (!/^find \.(\/)? /.test(a)) return false;
      const s = unquote(a);
      return (
        /-i?name \*\.log( |$)/.test(s) &&
        /-mtime \+7( |$)/.test(s) &&
        (/-delete$/.test(s) || /-exec rm (-f )?\{\} (\\;|\+)$/.test(s))
      );
    },
    expected: 'find . -name "*.log" -mtime +7 -delete',
  },
};

const round = (n: number) => Math.round(n * 10) / 10;

export function gradeLinuxIp(answers: LipAnswers): LipResult {
  const items: LipItemResult[] = [];
  for (const c of CHOICES) {
    const key = CHOICE_KEYS[c.id];
    const picked = c.options[Number(answers[c.id])];
    items.push({
      id: c.id,
      score: answers[c.id] === String(key) ? c.points : 0,
      max: c.points,
      expected: c.options[key],
      answer: answers[c.id] && picked ? picked : "",
    });
  }
  for (const o of OPENS) {
    const key = OPEN_KEYS[o.id];
    const answer = (answers[o.id] ?? "").trim().slice(0, 300);
    items.push({
      id: o.id,
      score: key.check(norm(answer)) ? o.points : 0,
      max: o.points,
      expected: key.expected,
      answer,
    });
  }
  return totals(items);
}

function totals(items: LipItemResult[]): LipResult {
  const sum = (ids: Set<string>) =>
    round(items.filter((i) => ids.has(i.id)).reduce((s, i) => s + i.score, 0));
  const test = sum(new Set(CHOICES.map((c) => c.id)));
  const open = sum(new Set(OPENS.map((o) => o.id)));
  return {
    total: round(test + open),
    max: MAX_TOTAL,
    test: { score: test, max: MAX_TEST },
    open: { score: open, max: MAX_OPEN },
    items,
  };
}

/**
 * The automatic grading with the teacher's scores for open questions laid
 * over it. A teacher score outside 0…max of its question is ignored.
 */
export function applyReview(
  grading: LipResult,
  overrides: Record<string, number>,
): LipResult {
  const openIds = new Set(OPENS.map((o) => o.id));
  return totals(
    grading.items.map((item) => {
      const score = overrides[item.id];
      return openIds.has(item.id) &&
        typeof score === "number" &&
        score >= 0 &&
        score <= item.max
        ? { ...item, score: round(score), reviewed: true }
        : item;
    }),
  );
}

/** Every question has a key — checked by the tests. */
export const keyIds = () => [
  ...Object.keys(CHOICE_KEYS),
  ...Object.keys(OPEN_KEYS),
];
