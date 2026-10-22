// Labirint: the child writes a small program that walks a robot through a
// maze. Shared by the browser, which animates the run, and the server, which
// runs the same program again before it records a solved level.
//
//   oldinga(3)               steps forward (1 when no number)
//   chapga()  ongga()        turn left / right
//   takrorla 4:              repeat the indented lines
//   agar oldinda_devor bo'lsa:    if … (with aks_holda: for otherwise)
//   toki chiqishda_emas:     while …
//
// Nothing is executed as JavaScript: lines are matched to a tiny tree.

import { normalize, suggest, type Problem, type Text } from "./lang";

export type Dir = 0 | 1 | 2 | 3; // up, right, down, left

export type Level = {
  id: string;
  /** Rows of the map: # wall, . floor, S start, E exit, * star. */
  map: string[];
  dir: Dir;
};

export const CONDITIONS = [
  "oldinda_devor",
  "oldinda_yo'l",
  "chapda_yo'l",
  "ongda_yo'l",
  "chiqishda_emas",
] as const;
export type Condition = (typeof CONDITIONS)[number];

export type Node =
  | { kind: "move"; line: number; steps: number }
  | { kind: "turn"; line: number; side: "left" | "right" }
  | { kind: "repeat"; line: number; times: number; body: Node[] }
  | {
      kind: "if";
      line: number;
      cond: Condition;
      then: Node[];
      otherwise: Node[];
    }
  | { kind: "while"; line: number; cond: Condition; body: Node[] };

export type MazeProgram = { nodes: Node[]; problems: Problem[]; lines: number };

const MOVE = /^oldinga\s*(?:\(\s*(\d*)\s*\))?$/;
const TURN = /^(chapga|ongga|o'ngga)\s*(?:\(\s*\))?$/;
const REPEAT = /^takrorla\s+(\d+)\s*(?:marta)?\s*:?$/;
const IF = /^agar\s+([a-z_']+)\s*(?:bo'lsa)?\s*:?$/;
const ELSE = /^aks_holda\s*:?$/;
const WHILE = /^toki\s+([a-z_']+)\s*:?$/;

type Open = {
  indent: number;
  body: Node[];
  /** The line that opened the block. */
  line: number;
};
type IfNode = Extract<Node, { kind: "if" }>;

const indentOf = (source: string) => {
  let n = 0;
  for (const c of source) {
    if (c === " ") n += 1;
    else if (c === "\t") n += 4;
    else break;
  }
  return n;
};

/** Reads a maze program; bad lines are reported and skipped. */
export function parseMaze(code: string): MazeProgram {
  const problems: Problem[] = [];
  const root: Node[] = [];
  const stack: Open[] = [{ indent: -1, body: root, line: 0 }];
  // The block an indented line may open: set after a line ending in ":".
  let pending: Open | null = null;
  // Open "agar" blocks by indent, so an "aks_holda" finds its own.
  const ifs = new Map<number, IfNode>();
  let lines = 0;
  const fail = (line: number, message: Text) =>
    problems.push({ line, message });

  code
    .split("\n")
    .slice(0, 200)
    .forEach((source, index) => {
      const line = index + 1;
      const text = normalize(source)
        .replace(/(\/\/|#).*$/, "")
        .trim();
      if (!text) return;
      lines += 1;
      const indent = indentOf(source);

      if (pending) {
        if (indent > pending.indent) stack.push(pending);
        else
          fail(pending.line, {
            uz: "Bu blok bo‘sh: ichidagi qatorlarni bo‘sh joy bilan suring.",
            en: "This block is empty: indent the lines that belong to it.",
          });
        pending = null;
      }
      while (stack.length > 1 && indent <= stack[stack.length - 1].indent)
        stack.pop();
      const body = stack[stack.length - 1].body;

      const owner = ifs.get(indent);
      for (const key of [...ifs.keys()]) if (key >= indent) ifs.delete(key);
      if (ELSE.test(text)) {
        if (!owner) {
          fail(line, {
            uz: "“aks_holda” faqat “agar … bo'lsa:” blokidan keyin keladi.",
            en: "“aks_holda” (else) only comes right after an “agar … bo'lsa:” block.",
          });
          return;
        }
        pending = { indent, body: owner.otherwise, line };
        return;
      }

      const condition = (name: string): Condition | null => {
        if ((CONDITIONS as readonly string[]).includes(name))
          return name as Condition;
        const close = suggest(name, [...CONDITIONS]);
        fail(line, {
          uz: close
            ? `“${name}” degan shart yo‘q. Balki “${close}”?`
            : `Shartlar: ${CONDITIONS.join(", ")}.`,
          en: close
            ? `There is no condition “${name}”. Did you mean “${close}”?`
            : `Conditions: ${CONDITIONS.join(", ")}.`,
        });
        return null;
      };

      let match = MOVE.exec(text);
      if (match) {
        const steps = match[1] ? Number(match[1]) : 1;
        if (steps < 1 || steps > 20) {
          fail(line, {
            uz: "oldinga() ichida 1 dan 20 gacha son yozing.",
            en: "Put a number from 1 to 20 inside oldinga().",
          });
          return;
        }
        body.push({ kind: "move", line, steps });
        return;
      }
      match = TURN.exec(text);
      if (match) {
        body.push({
          kind: "turn",
          line,
          side: match[1] === "chapga" ? "left" : "right",
        });
        return;
      }
      match = REPEAT.exec(text);
      if (match) {
        const times = Number(match[1]);
        if (times < 1 || times > 20) {
          fail(line, {
            uz: "takrorla dan keyin 1 dan 20 gacha son yozing.",
            en: "Write a number from 1 to 20 after takrorla.",
          });
          return;
        }
        const node: Node = { kind: "repeat", line, times, body: [] };
        body.push(node);
        pending = { indent, body: node.body, line };
        return;
      }
      match = IF.exec(text);
      if (match) {
        const cond = condition(match[1]);
        if (!cond) return;
        const node: IfNode = {
          kind: "if",
          line,
          cond,
          then: [],
          otherwise: [],
        };
        body.push(node);
        pending = { indent, body: node.then, line };
        ifs.set(indent, node);
        return;
      }
      match = WHILE.exec(text);
      if (match) {
        const cond = condition(match[1]);
        if (!cond) return;
        const node: Node = { kind: "while", line, cond, body: [] };
        body.push(node);
        pending = { indent, body: node.body, line };
        return;
      }
      const word = /^[a-z_']+/.exec(text)?.[0] ?? text;
      const close = suggest(word, [
        "oldinga",
        "chapga",
        "ongga",
        "takrorla",
        "agar",
        "toki",
        "aks_holda",
      ]);
      fail(line, {
        uz: close
          ? `Bu buyruqni tushunmadim. Balki “${close}”?`
          : "Bu buyruqni tushunmadim. Namuna: oldinga(2)",
        en: close
          ? `I did not understand this command. Did you mean “${close}”?`
          : "I did not understand this command. Example: oldinga(2)",
      });
    });
  if (pending)
    fail((pending as Open).line, {
      uz: "Oxirgi blok bo‘sh: ichidagi qatorlarni bo‘sh joy bilan suring.",
      en: "The last block is empty: indent the lines that belong to it.",
    });
  return { nodes: root, problems, lines };
}

export type Pos = { x: number; y: number; dir: Dir };
export type Frame = Pos & { line: number };
export type Outcome = "exit" | "wall" | "ended" | "too-long";
export type Run = { frames: Frame[]; outcome: Outcome; stars: number };

const STEP = [
  [0, -1],
  [1, 0],
  [0, 1],
  [-1, 0],
] as const;
const MAX_FRAMES = 400;

export function find(level: Level, char: string) {
  for (let y = 0; y < level.map.length; y++) {
    const x = level.map[y].indexOf(char);
    if (x >= 0) return { x, y };
  }
  return { x: 0, y: 0 };
}

const wall = (level: Level, x: number, y: number) =>
  (level.map[y]?.[x] ?? "#") === "#";

/** Runs a program on a level and records every position for the animation. */
export function runMaze(nodes: Node[], level: Level): Run {
  const start = find(level, "S");
  const exit = find(level, "E");
  const pos: Pos = { ...start, dir: level.dir };
  const frames: Frame[] = [{ ...pos, line: 0 }];
  const stars = new Set<string>();
  let outcome: Outcome | null = null;

  const at = (dir: number) => {
    const [dx, dy] = STEP[((dir % 4) + 4) % 4];
    return { x: pos.x + dx, y: pos.y + dy };
  };
  const test = (cond: Condition) => {
    if (cond === "chiqishda_emas") return pos.x !== exit.x || pos.y !== exit.y;
    if (cond === "oldinda_devor") {
      const a = at(pos.dir);
      return wall(level, a.x, a.y);
    }
    const turn = cond === "oldinda_yo'l" ? 0 : cond === "chapda_yo'l" ? 3 : 1;
    const a = at(pos.dir + turn);
    return !wall(level, a.x, a.y);
  };
  const push = (line: number) => {
    frames.push({ ...pos, line });
    if (frames.length >= MAX_FRAMES) outcome = "too-long";
  };

  const exec = (list: Node[]) => {
    for (const node of list) {
      if (outcome) return;
      if (node.kind === "move") {
        for (let i = 0; i < node.steps && !outcome; i++) {
          const next = at(pos.dir);
          if (wall(level, next.x, next.y)) {
            outcome = "wall";
            push(node.line);
            return;
          }
          pos.x = next.x;
          pos.y = next.y;
          if (level.map[pos.y][pos.x] === "*") stars.add(`${pos.x},${pos.y}`);
          push(node.line);
          if (pos.x === exit.x && pos.y === exit.y) outcome = "exit";
        }
      } else if (node.kind === "turn") {
        pos.dir = ((pos.dir + (node.side === "left" ? 3 : 1)) % 4) as Dir;
        push(node.line);
      } else if (node.kind === "repeat") {
        for (let i = 0; i < node.times && !outcome; i++) exec(node.body);
      } else if (node.kind === "if") {
        exec(test(node.cond) ? node.then : node.otherwise);
      } else {
        let guard = 0;
        while (!outcome && test(node.cond)) {
          const before = frames.length;
          exec(node.body);
          // A loop that does nothing would never end.
          if (frames.length === before && ++guard > 3) {
            outcome = "too-long";
            break;
          }
        }
      }
    }
  };
  exec(nodes);
  return { frames, outcome: outcome ?? "ended", stars: stars.size };
}

/** What a level's program has to use, besides reaching the exit. */
export type Needs = { loop?: boolean; while?: boolean; if?: boolean };

function uses(nodes: Node[], kind: Node["kind"]): boolean {
  return nodes.some(
    (n) =>
      n.kind === kind ||
      (n.kind === "repeat" && uses(n.body, kind)) ||
      (n.kind === "while" && uses(n.body, kind)) ||
      (n.kind === "if" && (uses(n.then, kind) || uses(n.otherwise, kind))),
  );
}

export function mazeSolved(
  code: string,
  level: Level,
  rules: { needs?: Needs; maxLines?: number },
) {
  const program = parseMaze(code);
  if (program.problems.length) return false;
  if (rules.maxLines && program.lines > rules.maxLines) return false;
  if (rules.needs?.loop && !uses(program.nodes, "repeat")) return false;
  if (rules.needs?.while && !uses(program.nodes, "while")) return false;
  if (rules.needs?.if && !uses(program.nodes, "if")) return false;
  return runMaze(program.nodes, level).outcome === "exit";
}

export const LEVELS: Record<string, Level> = {
  l1: { id: "l1", dir: 1, map: ["#######", "#S...E#", "#######"] },
  l2: {
    id: "l2",
    dir: 1,
    map: ["######", "#S..##", "###.##", "###.##", "###E##", "######"],
  },
  l3: {
    id: "l3",
    dir: 1,
    map: ["#######", "#S.####", "##.####", "##..*E#", "#######"],
  },
  l4: {
    id: "l4",
    dir: 1,
    map: ["########", "#E...###", "####.###", "#S...###", "########"],
  },
  l5: {
    id: "l5",
    dir: 2,
    map: [
      "#########",
      "#S#######",
      "#..######",
      "##..#####",
      "###..####",
      "####..###",
      "#####.E##",
      "#########",
    ],
  },
  l6: {
    id: "l6",
    dir: 1,
    map: [
      "#########",
      "#S..#####",
      "###.#####",
      "###...###",
      "#####.###",
      "#####...#",
      "#######.#",
      "#######E#",
      "#########",
    ],
  },
  l7: {
    id: "l7",
    dir: 1,
    map: [
      "#######",
      "#S..*.#",
      "#####.#",
      "#####.#",
      "#####.#",
      "#E.*..#",
      "#######",
    ],
  },
  l8: {
    id: "l8",
    dir: 1,
    map: [
      "#########",
      "#S......#",
      "#######.#",
      "#....E#.#",
      "#.#####.#",
      "#.......#",
      "#########",
    ],
  },
  l9: {
    id: "l9",
    dir: 3,
    map: [
      "#########",
      "#......S#",
      "#.#######",
      "#.#E....#",
      "#.#####.#",
      "#.......#",
      "#########",
    ],
  },
  l10: {
    id: "l10",
    dir: 2,
    map: ["#######", "#S#...#", "#.#.#.#", "#...#E#", "#######"],
  },
  l11: {
    id: "l11",
    dir: 0,
    map: [
      "###########",
      "#...#.*.###",
      "#.#.#.#.###",
      "#S#...#..E#",
      "###########",
    ],
  },
  l12: {
    id: "l12",
    dir: 1,
    map: [
      "#########",
      "#S..#...#",
      "###.#.#.#",
      "#...#.#.#",
      "#.###.#.#",
      "#.....#E#",
      "#########",
    ],
  },
  l13: {
    id: "l13",
    dir: 1,
    map: [
      "###########",
      "#S....#...#",
      "#####.#.#.#",
      "#...#...#.#",
      "#.#.#####.#",
      "#.#...*...#",
      "#.#######.#",
      "#........E#",
      "###########",
    ],
  },
};
