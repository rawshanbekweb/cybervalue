"use client";

import { useEffect, useImperativeHandle, useRef, useState } from "react";
import {
  COLORS,
  effective,
  normalize,
  type Rule,
  type Value,
} from "@/lib/kids/lang";
import type { GameProps } from "./game-types";
import "./snake-game.css";

// Logical playfield: a 32×20 grid of 20 px cells, scaled to the container.
const W = 640;
const H = 400;
const COLS = 32;
const ROWS = 20;
const CELL = W / COLS;

const CHEAT_SECONDS: Record<string, number> = {
  oltin_olma: 8,
  sekin: 6,
  arvoh: 8,
  qisqartir: 0,
};

/** Seconds the snake blinks (frozen) after losing a life. */
const RESPAWN_BLINK = 1;
/** Seconds before the game-over screen accepts a restart. */
const RESTART_DELAY = 0.6;
/** CSS pixels a finger must travel to count as a swipe. */
const SWIPE_PX = 22;

type Phase = "ready" | "play" | "over";
type Dir = "up" | "down" | "left" | "right";
type Cell = { x: number; y: number };

const VEC: Record<Dir, Cell> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};
const OPPOSITE: Record<Dir, Dir> = {
  up: "down",
  down: "up",
  left: "right",
  right: "left",
};

type Apple = { x: number; y: number; born: number; seed: number };
type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  color: string;
  size: number;
  grow: number;
};
type Floater = { x: number; y: number; text: string; life: number };
type Banner = { text: string; life: number };

type LiveProps = {
  values: Record<string, Value>;
  rules: Rule[];
  fire: GameProps["fire"];
  running: boolean;
  onScore: (score: number) => void;
  onOver: (score: number) => void;
  labels: GameProps["labels"];
};

type Settings = {
  /** Moves per second before cheats. */
  rate: number;
  color: string;
  points: number;
  apples: number;
  wrap: boolean;
};

type Engine = {
  cheat: (name: string) => boolean;
  restart: () => void;
  turn: (dir: Dir, repeat?: boolean) => void;
  press: () => void;
  redraw: () => void;
  destroy: () => void;
};

type UiHooks = { setAria: (label: string) => void };

function num(v: Value | undefined, fallback: number, min: number, max: number) {
  const n = typeof v === "number" && Number.isFinite(v) ? v : fallback;
  return Math.min(max, Math.max(min, n));
}

// tezlik 1 ≈ 3.8, 5 = 7, 15 = 15 cells per second.
const movesPerSecond = (tezlik: number) => 3 + tezlik * 0.8;

function readSettings(v: Record<string, Value>): Settings {
  const colorName = typeof v.ilon_rangi === "string" ? v.ilon_rangi : "";
  return {
    rate: movesPerSecond(num(v.tezlik, 5, 1, 15)),
    color: COLORS[colorName] ?? COLORS.yashil,
    points: Math.round(num(v.olma_ochkosi, 10, 1, 100)),
    apples: Math.round(num(v.olmalar_soni, 1, 1, 5)),
    wrap: v.devordan_otish === true,
  };
}

function rgb(hex: string): [number, number, number] {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex);
  if (!m) return [61, 220, 132];
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function mix(a: string, b: string, t: number) {
  const [r1, g1, b1] = rgb(a);
  const [r2, g2, b2] = rgb(b);
  const f = (x: number, y: number) => Math.round(x + (y - x) * t);
  return `rgb(${f(r1, r2)}, ${f(g1, g2)}, ${f(b1, b2)})`;
}

function shade(hex: string, amount: number) {
  const [r, g, b] = rgb(hex);
  const f = (c: number) =>
    Math.round(amount < 0 ? c * (1 + amount) : c + (255 - c) * amount)
      .toString(16)
      .padStart(2, "0");
  return `#${f(r)}${f(g)}${f(b)}`;
}

function luminance(hex: string) {
  const [r, g, b] = rgb(hex);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

function hash(n: number) {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
}

function isTextTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else line = next;
  }
  if (line) lines.push(line);
  return lines.slice(0, 4);
}

function heart(ctx: CanvasRenderingContext2D, x: number, y: number, s: number) {
  ctx.beginPath();
  ctx.moveTo(x, y + s * 0.3);
  ctx.bezierCurveTo(x, y, x - s * 0.5, y, x - s * 0.5, y + s * 0.3);
  ctx.bezierCurveTo(x - s * 0.5, y + s * 0.6, x, y + s * 0.8, x, y + s * 0.95);
  ctx.bezierCurveTo(
    x,
    y + s * 0.8,
    x + s * 0.5,
    y + s * 0.6,
    x + s * 0.5,
    y + s * 0.3,
  );
  ctx.bezierCurveTo(x + s * 0.5, y, x, y, x, y + s * 0.3);
  ctx.closePath();
}

function drawApple(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  golden: boolean,
  t: number,
) {
  ctx.save();
  ctx.translate(x, y);
  // Shadow.
  ctx.fillStyle = "rgba(0, 0, 0, 0.16)";
  ctx.beginPath();
  ctx.ellipse(1, r * 0.95, r * 0.8, r * 0.28, 0, 0, Math.PI * 2);
  ctx.fill();
  // Body: two overlapping circles make the apple shape.
  const body = ctx.createRadialGradient(-r * 0.35, -r * 0.35, r * 0.1, 0, 0, r);
  if (golden) {
    body.addColorStop(0, "#fff6c2");
    body.addColorStop(0.5, "#ffd43b");
    body.addColorStop(1, "#d99a00");
  } else {
    body.addColorStop(0, "#ff8a8a");
    body.addColorStop(0.55, "#f03e3e");
    body.addColorStop(1, "#b81d1d");
  }
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.arc(-r * 0.32, r * 0.05, r * 0.72, 0, Math.PI * 2);
  ctx.arc(r * 0.32, r * 0.05, r * 0.72, 0, Math.PI * 2);
  ctx.fill();
  // Shine.
  ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
  ctx.beginPath();
  ctx.ellipse(-r * 0.42, -r * 0.2, r * 0.14, r * 0.24, -0.4, 0, Math.PI * 2);
  ctx.fill();
  // Stem and leaf.
  ctx.strokeStyle = "#6b4226";
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(0, -r * 0.5);
  ctx.quadraticCurveTo(r * 0.05, -r * 0.85, r * 0.2, -r * 1.0);
  ctx.stroke();
  ctx.fillStyle = "#3fae4f";
  ctx.beginPath();
  ctx.ellipse(r * 0.42, -r * 0.82, r * 0.34, r * 0.15, -0.5, 0, Math.PI * 2);
  ctx.fill();
  // Twinkle on golden apples.
  if (golden) {
    const s = 3 + Math.sin(t * 6) * 1.5;
    ctx.translate(r * 0.6, -r * 0.45);
    ctx.rotate(t * 2);
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    for (let i = 0; i < 4; i++) {
      const a = (i * Math.PI) / 2;
      ctx.lineTo(Math.cos(a) * s, Math.sin(a) * s);
      ctx.lineTo(
        Math.cos(a + Math.PI / 4) * s * 0.3,
        Math.sin(a + Math.PI / 4) * s * 0.3,
      );
    }
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

function createEngine(
  canvas: HTMLCanvasElement,
  getProps: () => LiveProps,
  ui: UiHooks,
): Engine {
  const ctxOrNull = canvas.getContext("2d");
  const noop: Engine = {
    cheat: () => false,
    restart: () => {},
    turn: () => {},
    press: () => {},
    redraw: () => {},
    destroy: () => {},
  };
  if (!ctxOrNull) return noop;
  const ctx: CanvasRenderingContext2D = ctxOrNull;
  // Off-screen layer so a see-through snake has no darker overlaps.
  const layer = document.createElement("canvas");
  const layerCtx = layer.getContext("2d");

  let phase: Phase = "ready";
  let score = 0;
  let reportedScore = -1;
  let lives = 1;
  let time = 0;
  let clock = 0;
  let overAt = 0;
  let acc = 0;
  let dir: Dir = "right";
  let queue: Dir[] = [];
  let snake: Cell[] = [];
  let prev: Cell[] = [];
  let grow = 0;
  let apples: Apple[] = [];
  let particles: Particle[] = [];
  let floaters: Floater[] = [];
  let banners: Banner[] = [];
  let gold = 0;
  let slow = 0;
  let ghost = 0;
  let blink = 0;
  let shake = 0;
  let ariaAt = -10;
  let ariaText = "";
  let settings = readSettings(getProps().values);
  let raf = 0;
  let last = 0;
  let pausedDrawn = false;

  function runtime() {
    return { ochko: score, hayotlar: lives, vaqt: Math.floor(time) };
  }

  // Settings changed by "qachon" handlers during this round.
  let overrides: Record<string, Value> = {};
  let started = false;

  function refreshSettings() {
    const p = getProps();
    settings = readSettings(
      effective({ ...p.values, ...overrides }, p.rules, runtime()),
    );
  }

  function emit(event: string) {
    const p = getProps();
    const fired = p.fire(
      event,
      effective({ ...p.values, ...overrides }, p.rules, runtime()),
      { ochko: score, hayotlar: lives },
    );
    if (!fired) return;
    score = fired.ochko;
    lives = fired.hayotlar;
    overrides = { ...overrides, ...fired.set };
    refreshSettings();
    if (fired.say) {
      banners.push({ text: fired.say, life: 2.2 });
      banners = banners.slice(-3);
    }
  }

  function reportScore() {
    if (score !== reportedScore) {
      reportedScore = score;
      getProps().onScore(score);
    }
  }

  function currentRate() {
    return settings.rate * (slow > 0 ? 0.45 : 1);
  }

  function onSnake(x: number, y: number) {
    return snake.some((c) => c.x === x && c.y === y);
  }

  function freeCell(): Cell | null {
    const taken = new Set<number>();
    for (const c of snake) taken.add(c.y * COLS + c.x);
    for (const a of apples) taken.add(a.y * COLS + a.x);
    // Keep the cell right in front of the head free so apples never
    // appear where the child cannot react.
    const head = snake[0];
    if (head) {
      const v = VEC[dir];
      const fx = head.x + v.x;
      const fy = head.y + v.y;
      if (fx >= 0 && fx < COLS && fy >= 0 && fy < ROWS)
        taken.add(fy * COLS + fx);
    }
    const free: number[] = [];
    // Rows 0–1 sit under the HUD pills, so apples never hide there.
    for (let i = COLS * 2; i < COLS * ROWS; i++)
      if (!taken.has(i)) free.push(i);
    if (!free.length) return null;
    const pick = free[Math.floor(Math.random() * free.length)];
    return { x: pick % COLS, y: Math.floor(pick / COLS) };
  }

  /** Keeps exactly settings.apples apples on the field (applies live). */
  function syncApples() {
    if (apples.length > settings.apples)
      apples = apples.slice(0, settings.apples);
    while (apples.length < settings.apples) {
      const cell = freeCell();
      if (!cell) break;
      apples.push({ ...cell, born: clock, seed: Math.random() * 10 });
    }
  }

  /** Lays the snake out leftwards from the centre, moving right. */
  function placeSnake(length: number) {
    const cx = Math.floor(COLS / 2);
    const cy = Math.floor(ROWS / 2);
    snake = Array.from({ length }, (_, i) => ({
      x: Math.max(0, cx - i),
      y: cy,
    }));
    prev = snake.map((c) => ({ ...c }));
    dir = "right";
    queue = [];
    acc = 0;
    apples = apples.filter((a) => !onSnake(a.x, a.y));
  }

  function reset(next: Phase) {
    const p = getProps();
    const start = effective(p.values, p.rules, {
      ochko: 0,
      hayotlar: 0,
      vaqt: 0,
    });
    lives = Math.round(num(start.hayotlar, 1, 1, 99));
    score = 0;
    time = 0;
    overrides = {};
    started = false;
    grow = 0;
    gold = 0;
    slow = 0;
    ghost = 0;
    blink = 0;
    shake = 0;
    apples = [];
    particles = [];
    floaters = [];
    banners = [];
    placeSnake(Math.round(num(start.uzunlik, 3, 1, 20)));
    refreshSettings();
    syncApples();
    phase = next;
    pausedDrawn = false;
    reportedScore = -1;
    reportScore();
    ariaAt = -10;
  }

  function burst(
    x: number,
    y: number,
    colors: string[],
    n: number,
    speed: number,
  ) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = speed * (0.4 + Math.random() * 0.8);
      particles.push({
        x,
        y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp - 30,
        life: 0.45 + Math.random() * 0.3,
        max: 0.75,
        color: colors[i % colors.length],
        size: 2.5 + Math.random() * 2.5,
        grow: 0,
      });
    }
  }

  function poof(x: number, y: number) {
    for (let i = 0; i < 5; i++) {
      const a = Math.random() * Math.PI * 2;
      particles.push({
        x: x + Math.cos(a) * 4,
        y: y + Math.sin(a) * 4,
        vx: Math.cos(a) * 30,
        vy: Math.sin(a) * 30 - 20,
        life: 0.5,
        max: 0.5,
        color: i % 2 ? "#ffffff" : "#e6ecef",
        size: 6 + Math.random() * 4,
        grow: 26,
      });
    }
  }

  const center = (c: number) => (c + 0.5) * CELL;

  function crash() {
    const head = snake[0];
    shake = 0.35;
    if (head)
      burst(
        center(head.x),
        center(head.y),
        ["#ff5c5c", "#ffd43b", "#ffffff", settings.color],
        16,
        150,
      );
    lives = Math.max(0, lives - 1);
    emit("urilsa");
    acc = 0;
    queue = [];
    if (lives <= 0) {
      phase = "over";
      overAt = clock;
      gold = 0;
      slow = 0;
      ghost = 0;
      getProps().onOver(score);
      return;
    }
    // Respawn safely at the centre, keeping score and length.
    placeSnake(snake.length);
    syncApples();
    blink = RESPAWN_BLINK;
  }

  /** One grid move. Returns false when the snake crashed. */
  function step() {
    while (queue.length) {
      const next = queue.shift();
      if (!next) break;
      if (next !== dir && (next !== OPPOSITE[dir] || snake.length === 1)) {
        dir = next;
        break;
      }
    }
    const head = snake[0];
    const v = VEC[dir];
    let nx = head.x + v.x;
    let ny = head.y + v.y;
    const out = nx < 0 || nx >= COLS || ny < 0 || ny >= ROWS;
    if (out) {
      if (settings.wrap || ghost > 0) {
        nx = (nx + COLS) % COLS;
        ny = (ny + ROWS) % ROWS;
      } else {
        crash();
        return false;
      }
    }
    const eat = apples.findIndex((a) => a.x === nx && a.y === ny);
    const keepTail = grow > 0 || eat >= 0;
    if (ghost <= 0) {
      const body = keepTail ? snake : snake.slice(0, -1);
      if (body.some((c) => c.x === nx && c.y === ny)) {
        crash();
        return false;
      }
    }
    const old = snake;
    const n = old.length;
    snake = [{ x: nx, y: ny }, ...old];
    if (eat >= 0) grow += 1;
    if (grow > 0) grow -= 1;
    else snake.pop();
    prev = snake.map((_, i) => ({ ...old[Math.min(i, n - 1)] }));

    if (eat >= 0) {
      const golden = gold > 0;
      const points = settings.points * (golden ? 5 : 1);
      score += points;
      emit("olma_yeganda");
      const ax = center(nx);
      const ay = center(ny);
      burst(
        ax,
        ay,
        golden
          ? ["#ffd43b", "#fff3a0", "#ffb829"]
          : ["#ff5c5c", "#ff8a8a", "#3fae4f"],
        10,
        120,
      );
      floaters.push({ x: ax, y: ay - 10, text: `+${points}`, life: 0.9 });
      apples.splice(eat, 1);
      syncApples();
    }
    return true;
  }

  function shrink() {
    const n = snake.length;
    const target = Math.min(n, Math.max(2, Math.floor(n / 2)));
    const removed = snake.slice(target);
    removed
      .filter((_, i) => i % Math.max(1, Math.ceil(removed.length / 12)) === 0)
      .forEach((c) => poof(center(c.x), center(c.y)));
    snake = snake.slice(0, target);
    prev = prev.slice(0, target);
    grow = 0;
    const tail = snake[snake.length - 1];
    if (!removed.length && tail) poof(center(tail.x), center(tail.y));
  }

  function update(dt: number) {
    if (!started) {
      started = true;
      emit("boshlanganda");
    }
    time += dt;
    refreshSettings();
    syncApples();
    gold = Math.max(0, gold - dt);
    slow = Math.max(0, slow - dt);
    ghost = Math.max(0, ghost - dt);
    if (blink > 0) {
      blink = Math.max(0, blink - dt);
      acc = 0;
      return;
    }
    const stepTime = 1 / currentRate();
    acc += dt;
    let steps = 0;
    while (acc >= stepTime && steps < 4) {
      acc -= stepTime;
      steps += 1;
      if (!step() || phase !== "play") break;
    }
    acc = Math.min(acc, stepTime);
    reportScore();
  }

  function updateEffects(dt: number) {
    shake = Math.max(0, shake - dt);
    for (const p of particles) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 220 * dt;
      p.size += p.grow * dt;
      p.life -= dt;
    }
    particles = particles.filter((p) => p.life > 0).slice(-240);
    for (const f of floaters) {
      f.y -= 40 * dt;
      f.life -= dt;
    }
    floaters = floaters.filter((f) => f.life > 0);
    for (const b of banners) b.life -= dt;
    banners = banners.filter((b) => b.life > 0);
  }

  function drawBoard() {
    ctx.fillStyle = "#aad672";
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#9fcd66";
    for (let y = 0; y < ROWS; y++)
      for (let x = (y % 2) + 0; x < COLS; x += 2)
        ctx.fillRect(x * CELL, y * CELL, CELL, CELL);
    // A few grass tufts.
    ctx.strokeStyle = "rgba(60, 120, 40, 0.35)";
    ctx.lineWidth = 1.4;
    ctx.lineCap = "round";
    ctx.beginPath();
    for (let i = 0; i < 46; i++) {
      const gx = Math.floor(hash(i) * COLS) * CELL + 6 + hash(i + 9) * 8;
      const gy = Math.floor(hash(i + 70) * ROWS) * CELL + 14;
      ctx.moveTo(gx - 3, gy - 5);
      ctx.lineTo(gx, gy);
      ctx.lineTo(gx + 3, gy - 6);
    }
    ctx.stroke();

    // Walls: a hedge when solid, a dashed glowing line when the snake wraps.
    if (settings.wrap || ghost > 0) {
      ctx.save();
      ctx.setLineDash([10, 8]);
      ctx.lineDashOffset = -clock * 30;
      ctx.strokeStyle = ghost > 0 ? "rgba(190, 160, 255, 0.9)" : "#e8fff0";
      ctx.lineWidth = 3;
      ctx.strokeRect(1.5, 1.5, W - 3, H - 3);
      ctx.restore();
    } else {
      ctx.strokeStyle = "#4f8a2f";
      ctx.lineWidth = 6;
      ctx.strokeRect(0, 0, W, H);
    }
  }

  /** Where segment i is drawn, sliding smoothly between grid cells. */
  function segmentPositions(f: number) {
    return snake.map((c, i) => {
      const p = prev[i] ?? c;
      let dx = c.x - p.x;
      let dy = c.y - p.y;
      // A wrap jump slides in from the edge instead of across the field.
      if (dx > 1) dx = -1;
      else if (dx < -1) dx = 1;
      if (dy > 1) dy = -1;
      else if (dy < -1) dy = 1;
      return {
        x: center(c.x - dx * (1 - f)),
        y: center(c.y - dy * (1 - f)),
      };
    });
  }

  function drawSnake(g: CanvasRenderingContext2D, f: number) {
    const pos = segmentPositions(f);
    const n = pos.length;
    if (!n) return;
    const head = settings.color;
    const toward = luminance(head) < 0.35 ? "#ffffff" : "#000000";
    const tail = mix(head, toward, 0.38);
    const outline = luminance(head) < 0.35 ? "#15151c" : shade(head, -0.5);
    const radius = (i: number) =>
      CELL * 0.42 * (1 - 0.38 * (n > 1 ? i / (n - 1) : 0));
    const colorAt = (i: number) => mix(head, tail, n > 1 ? i / (n - 1) : 0);
    const near = (i: number) =>
      Math.hypot(pos[i].x - pos[i - 1].x, pos[i].y - pos[i - 1].y) < CELL * 1.5;

    g.lineCap = "round";
    g.lineJoin = "round";
    const pass = (
      extra: number,
      color: (i: number) => string,
      ox: number,
      oy: number,
    ) => {
      for (let i = n - 1; i >= 1; i--) {
        const c = color(i);
        g.strokeStyle = c;
        g.fillStyle = c;
        if (near(i)) {
          g.lineWidth = radius(i) * 2 + extra;
          g.beginPath();
          g.moveTo(pos[i].x + ox, pos[i].y + oy);
          g.lineTo(pos[i - 1].x + ox, pos[i - 1].y + oy);
          g.stroke();
        }
        g.beginPath();
        g.arc(pos[i].x + ox, pos[i].y + oy, radius(i) + extra / 2, 0, 7);
        g.fill();
      }
    };
    pass(0, () => "rgba(0, 0, 0, 0.14)", 2, 3);
    pass(3, () => outline, 0, 0);
    pass(0, colorAt, 0, 0);
    // Cute scale spots on every other segment.
    g.fillStyle = "rgba(255, 255, 255, 0.28)";
    for (let i = 2; i < n; i += 2) {
      g.beginPath();
      g.arc(
        pos[i].x - radius(i) * 0.25,
        pos[i].y - radius(i) * 0.25,
        radius(i) * 0.35,
        0,
        7,
      );
      g.fill();
    }

    // Head.
    const hx = pos[0].x;
    const hy = pos[0].y;
    const r = CELL * 0.52;
    const v = VEC[dir];
    g.save();
    g.translate(hx, hy);
    g.rotate(Math.atan2(v.y, v.x));
    // Tongue flicks out now and then.
    const flick = clock % 2.3;
    if (phase !== "over" && flick < 0.4) {
      const len = Math.sin((flick / 0.4) * Math.PI) * 9;
      g.strokeStyle = "#e8325a";
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(r - 2, 0);
      g.lineTo(r + len, 0);
      g.moveTo(r + len, 0);
      g.lineTo(r + len + 3, -2.5);
      g.moveTo(r + len, 0);
      g.lineTo(r + len + 3, 2.5);
      g.stroke();
    }
    g.fillStyle = "rgba(0, 0, 0, 0.14)";
    g.beginPath();
    g.ellipse(2, 3, r + 1, r * 0.92 + 1, 0, 0, 7);
    g.fill();
    g.fillStyle = outline;
    g.beginPath();
    g.ellipse(0, 0, r + 1.5, r * 0.92 + 1.5, 0, 0, 7);
    g.fill();
    const shine = g.createRadialGradient(-r * 0.3, -r * 0.3, 1, 0, 0, r);
    shine.addColorStop(0, shade(head, 0.35));
    shine.addColorStop(1, head);
    g.fillStyle = shine;
    g.beginPath();
    g.ellipse(0, 0, r, r * 0.92, 0, 0, 7);
    g.fill();
    // Rosy cheeks.
    g.fillStyle = "rgba(255, 122, 160, 0.55)";
    for (const side of [-1, 1]) {
      g.beginPath();
      g.arc(r * 0.45, side * r * 0.62, 2.4, 0, 7);
      g.fill();
    }
    // Eyes look where the snake is going.
    const blinking = clock % 3.4 < 0.12;
    for (const side of [-1, 1]) {
      const ex = r * 0.12;
      const ey = side * r * 0.42;
      if (phase === "over") {
        g.strokeStyle = "#1d2340";
        g.lineWidth = 1.8;
        g.beginPath();
        g.moveTo(ex - 2.6, ey - 2.6);
        g.lineTo(ex + 2.6, ey + 2.6);
        g.moveTo(ex + 2.6, ey - 2.6);
        g.lineTo(ex - 2.6, ey + 2.6);
        g.stroke();
        continue;
      }
      if (blinking) {
        g.strokeStyle = "#1d2340";
        g.lineWidth = 1.8;
        g.beginPath();
        g.moveTo(ex, ey - 3.5);
        g.lineTo(ex, ey + 3.5);
        g.stroke();
        continue;
      }
      g.fillStyle = "#ffffff";
      g.beginPath();
      g.arc(ex, ey, 4.2, 0, 7);
      g.fill();
      g.fillStyle = "#1d2340";
      g.beginPath();
      g.arc(ex + 1.6, ey, 2.2, 0, 7);
      g.fill();
      g.fillStyle = "#ffffff";
      g.beginPath();
      g.arc(ex + 2.2, ey - 0.9, 0.8, 0, 7);
      g.fill();
    }
    // Nostrils.
    g.fillStyle = "rgba(0, 0, 0, 0.35)";
    g.beginPath();
    g.arc(r * 0.8, -2, 0.9, 0, 7);
    g.arc(r * 0.8, 2, 0.9, 0, 7);
    g.fill();
    g.restore();
  }

  function drawHud() {
    const pill = "rgba(25, 55, 25, 0.55)";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";

    // Score.
    ctx.font = "800 22px system-ui, sans-serif";
    const scoreW = Math.max(96, ctx.measureText(String(score)).width + 64);
    ctx.fillStyle = pill;
    ctx.beginPath();
    ctx.roundRect(10, 8, scoreW, 36, 18);
    ctx.fill();
    drawApple(ctx, 31, 27, 10, gold > 0, clock);
    ctx.fillStyle = "#ffffff";
    ctx.fillText(String(score), 50, 27);

    // Hearts.
    const shown = Math.min(lives, 6);
    const extra = lives > 6;
    const pillW = extra ? 110 : Math.max(48, shown * 26 + 20);
    ctx.fillStyle = pill;
    ctx.beginPath();
    ctx.roundRect(W - 10 - pillW, 8, pillW, 36, 18);
    ctx.fill();
    ctx.fillStyle = "#ff5c7a";
    if (extra) {
      heart(ctx, W - 10 - pillW + 26, 15, 22);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.font = "800 20px system-ui, sans-serif";
      ctx.fillText(`× ${lives}`, W - 10 - pillW + 46, 27);
    } else {
      for (let i = 0; i < shown; i++) {
        heart(ctx, W - 10 - pillW + 23 + i * 26, 15, 22);
        ctx.fill();
      }
    }

    // Active cheat countdowns.
    const active: [string, number, number, string][] = [];
    if (gold > 0) active.push(["oltin_olma", gold, 8, "#ffb829"]);
    if (slow > 0) active.push(["sekin", slow, 6, "#4da3ff"]);
    if (ghost > 0) active.push(["arvoh", ghost, 8, "#a47bff"]);
    ctx.font = "700 13px system-ui, sans-serif";
    active.forEach(([name, left, total, color], i) => {
      const x = 10;
      const y = 52 + i * 24;
      ctx.fillStyle = pill;
      ctx.beginPath();
      ctx.roundRect(x, y, 130, 20, 10);
      ctx.fill();
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.roundRect(x + 2, y + 2, Math.max(16, 126 * (left / total)), 16, 8);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.fillText(name, x + 10, y + 11);
    });
  }

  function panel(
    lines: string[],
    accent: string,
    icon: "play" | "pause" | "again",
    hint: string,
  ) {
    ctx.fillStyle = "rgba(20, 40, 20, 0.42)";
    ctx.fillRect(0, 0, W, H);
    ctx.font = "800 24px system-ui, sans-serif";
    const wrapped = lines.flatMap((l) => wrapText(ctx, l, 420));
    ctx.font = "600 15px system-ui, sans-serif";
    const hints = hint ? wrapText(ctx, hint, 420).slice(0, 2) : [];
    const ph = 92 + wrapped.length * 32 + hints.length * 20 + 14;
    const py = (H - ph) / 2;
    ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
    ctx.beginPath();
    ctx.roundRect(W / 2 - 240, py, 480, ph, 22);
    ctx.fill();
    ctx.lineWidth = 5;
    ctx.strokeStyle = accent;
    ctx.stroke();

    const cx = W / 2;
    const cy = py + 44;
    ctx.fillStyle = accent;
    ctx.beginPath();
    ctx.arc(cx, cy, 26, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "#ffffff";
    if (icon === "play") {
      ctx.beginPath();
      ctx.moveTo(cx - 8, cy - 13);
      ctx.lineTo(cx + 13, cy);
      ctx.lineTo(cx - 8, cy + 13);
      ctx.closePath();
      ctx.fill();
    } else if (icon === "pause") {
      ctx.fillRect(cx - 10, cy - 12, 7, 24);
      ctx.fillRect(cx + 3, cy - 12, 7, 24);
    } else {
      ctx.lineWidth = 5;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.arc(cx, cy, 12, -Math.PI * 0.35, Math.PI * 1.4);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx + 13, cy - 16);
      ctx.lineTo(cx + 9, cy - 5);
      ctx.lineTo(cx + 2, cy - 13);
      ctx.closePath();
      ctx.fill();
    }

    ctx.fillStyle = "#1d2340";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "800 24px system-ui, sans-serif";
    wrapped.forEach((line, i) => ctx.fillText(line, cx, py + 96 + i * 32));
    ctx.font = "600 15px system-ui, sans-serif";
    ctx.fillStyle = "#5a5f7a";
    const hy = py + 96 + wrapped.length * 32 - 6;
    hints.forEach((line, i) => ctx.fillText(line, cx, hy + i * 20));
  }

  function draw() {
    const sx = canvas.width / W;
    const sy = canvas.height / H;
    let ox = 0;
    let oy = 0;
    if (shake > 0) {
      const m = shake * 14;
      ox = (Math.random() - 0.5) * m;
      oy = (Math.random() - 0.5) * m;
    }
    ctx.setTransform(sx, 0, 0, sy, ox * sx, oy * sy);
    drawBoard();

    const golden = gold > 0;
    apples.forEach((a) => {
      const pop = Math.min(1, (clock - a.born) * 5);
      const bob = 1 + Math.sin(clock * 4 + a.seed) * 0.06;
      drawApple(
        ctx,
        center(a.x),
        center(a.y),
        CELL * 0.42 * pop * bob,
        golden,
        clock + a.seed,
      );
    });

    const f =
      phase === "play" && blink <= 0 ? Math.min(1, acc * currentRate()) : 1;
    let alpha = 1;
    if (ghost > 0)
      alpha = ghost < 1.5 && Math.floor(ghost * 8) % 2 ? 0.7 : 0.45;
    if (blink > 0 && Math.floor(blink * 10) % 2 === 0) alpha = 0.2;
    if (alpha < 1 && layerCtx) {
      if (layer.width !== canvas.width || layer.height !== canvas.height) {
        layer.width = canvas.width;
        layer.height = canvas.height;
      }
      layerCtx.setTransform(1, 0, 0, 1, 0, 0);
      layerCtx.clearRect(0, 0, layer.width, layer.height);
      layerCtx.setTransform(sx, 0, 0, sy, ox * sx, oy * sy);
      drawSnake(layerCtx, f);
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalAlpha = alpha;
      ctx.drawImage(layer, 0, 0);
      ctx.restore();
    } else drawSnake(ctx, f);

    for (const p of particles) {
      ctx.globalAlpha = Math.max(0, p.life / p.max);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "800 18px system-ui, sans-serif";
    for (const fl of floaters) {
      ctx.globalAlpha = Math.min(1, fl.life * 2);
      ctx.lineWidth = 4;
      ctx.strokeStyle = "#5a3a00";
      ctx.strokeText(fl.text, fl.x, fl.y);
      ctx.fillStyle = "#ffe066";
      ctx.fillText(fl.text, fl.x, fl.y);
    }
    ctx.globalAlpha = 1;

    ctx.setTransform(sx, 0, 0, sy, 0, 0);
    drawHud();

    banners.forEach((b, i) => {
      const age = 1.8 - b.life;
      const y = 112 - age * 18 + i * 46;
      ctx.globalAlpha = Math.min(1, b.life * 2, age * 6);
      ctx.font = "900 30px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const text = `> ${b.text}`;
      const tw = ctx.measureText(text).width + 40;
      ctx.fillStyle = "rgba(29, 35, 64, 0.85)";
      ctx.beginPath();
      ctx.roundRect(W / 2 - tw / 2, y - 24, tw, 48, 24);
      ctx.fill();
      ctx.fillStyle = "#3ddc84";
      ctx.fillText(text, W / 2, y + 1);
    });
    ctx.globalAlpha = 1;

    const p = getProps();
    if (phase === "ready")
      panel([p.labels.start], "#3ddc84", "play", "← ↑ → ↓ · W A S D");
    else if (phase === "over")
      panel([p.labels.over, `★ ${score}`], "#ff9233", "again", p.labels.start);
    else if (!p.running) panel([p.labels.paused], "#4da3ff", "pause", "");
  }

  function syncUi() {
    if (clock - ariaAt < 1) return;
    ariaAt = clock;
    const p = getProps();
    const status =
      phase === "ready"
        ? p.labels.start
        : phase === "over"
          ? p.labels.over
          : !p.running
            ? p.labels.paused
            : "";
    const text = `Ilon o‘yini. Ochko: ${score}. Hayotlar: ${lives}.${
      status ? ` ${status}` : ""
    }`;
    if (text !== ariaText) {
      ariaText = text;
      ui.setAria(text);
    }
  }

  function frame(now: number) {
    raf = requestAnimationFrame(frame);
    const dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
    last = now;
    if (!getProps().running) {
      if (!pausedDrawn) {
        pausedDrawn = true;
        refreshSettings();
        syncApples();
        draw();
        ariaAt = -10;
        syncUi();
      }
      return;
    }
    pausedDrawn = false;
    clock += dt;
    if (phase === "play") update(dt);
    else {
      refreshSettings();
      if (phase === "ready") syncApples();
    }
    updateEffects(dt);
    draw();
    syncUi();
  }

  function redraw() {
    pausedDrawn = false;
  }

  function press() {
    if (!getProps().running) return;
    if (phase === "ready") begin();
    else if (phase === "over" && clock - overAt > RESTART_DELAY) reset("play");
  }

  function begin() {
    if (phase === "ready") phase = "play";
    ariaAt = -10;
  }

  reset("ready");
  raf = requestAnimationFrame(frame);

  return {
    cheat(raw) {
      const key = normalize(raw.trim());
      if (!Object.prototype.hasOwnProperty.call(CHEAT_SECONDS, key))
        return false;
      if (phase === "over") reset("play");
      begin();
      const secs = CHEAT_SECONDS[key];
      if (key === "oltin_olma") gold = secs;
      else if (key === "sekin") slow = secs;
      else if (key === "arvoh") ghost = secs;
      else shrink();
      banners.push({ text: key, life: 1.8 });
      banners = banners.slice(-3);
      ariaAt = -10;
      redraw();
      return true;
    },
    restart() {
      reset("play");
      redraw();
    },
    turn(next, repeat = false) {
      if (!getProps().running) return;
      if (phase === "over") {
        if (!repeat) press();
        return;
      }
      if (phase === "ready") {
        if (repeat) return;
        begin();
      }
      const lastDir = queue.length ? queue[queue.length - 1] : dir;
      if (next === lastDir) return;
      if (next === OPPOSITE[lastDir] && snake.length > 1) return;
      if (queue.length < 2) queue.push(next);
    },
    press,
    redraw,
    destroy() {
      cancelAnimationFrame(raf);
      layer.width = 0;
      layer.height = 0;
    },
  };
}

const KEY_DIRS: Record<string, Dir> = {
  ArrowUp: "up",
  KeyW: "up",
  ArrowDown: "down",
  KeyS: "down",
  ArrowLeft: "left",
  KeyA: "left",
  ArrowRight: "right",
  KeyD: "right",
};

const BUTTONS: { dir: Dir; label: string; path: string }[] = [
  { dir: "up", label: "Yuqoriga", path: "M5 15l7-7 7 7" },
  { dir: "left", label: "Chapga", path: "M15 5 8 12l7 7" },
  { dir: "down", label: "Pastga", path: "M5 9l7 7 7-7" },
  { dir: "right", label: "O‘ngga", path: "m9 5 7 7-7 7" },
];

type Swipe = { id: number; x: number; y: number; moved: boolean };

export function SnakeGame({
  values,
  rules,
  fire,
  running,
  onScore,
  onOver,
  labels,
  ref,
}: GameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Engine | null>(null);
  const swipeRef = useRef<Swipe | null>(null);
  const propsRef = useRef<LiveProps>({
    values,
    rules,
    fire,
    running,
    onScore,
    onOver,
    labels,
  });
  const [aria, setAria] = useState("Ilon o‘yini");

  useEffect(() => {
    propsRef.current = {
      values,
      rules,
      fire,
      running,
      onScore,
      onOver,
      labels,
    };
    engineRef.current?.redraw();
  });

  useImperativeHandle(
    ref,
    () => ({
      cheat: (name: string) => engineRef.current?.cheat(name) ?? false,
      restart: () => engineRef.current?.restart(),
    }),
    [],
  );

  // Engine lifetime.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const engine = createEngine(canvas, () => propsRef.current, { setAria });
    engineRef.current = engine;
    return () => {
      engine.destroy();
      engineRef.current = null;
    };
  }, []);

  // Crisp, responsive canvas size.
  useEffect(() => {
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    if (!stage || !canvas) return;
    const resize = () => {
      const width = stage.clientWidth || W;
      const dpr = Math.min(3, window.devicePixelRatio || 1);
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(((width * H) / W) * dpr));
      // Resizing clears the canvas: draw again even while paused.
      engineRef.current?.redraw();
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(stage);
    window.addEventListener("resize", resize);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", resize);
    };
  }, []);

  // Keyboard on window, but never steal keys from text fields.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (isTextTarget(e.target) || e.ctrlKey || e.metaKey || e.altKey) return;
      const engine = engineRef.current;
      if (!engine || !propsRef.current.running) return;
      const code = e.code || (e.key === " " ? "Space" : e.key);
      const dir = KEY_DIRS[code];
      if (dir) {
        if (code.startsWith("Arrow")) e.preventDefault();
        engine.turn(dir, e.repeat);
      } else if (
        code === "Space" ||
        code === "Enter" ||
        code === "NumpadEnter"
      ) {
        if (code === "Space") e.preventDefault();
        if (!e.repeat) engine.press();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Swipe to steer; a tap without a swipe starts or restarts.
  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    swipeRef.current = {
      id: e.pointerId,
      x: e.clientX,
      y: e.clientY,
      moved: false,
    };
  };
  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const s = swipeRef.current;
    if (!s || s.id !== e.pointerId) return;
    const dx = e.clientX - s.x;
    const dy = e.clientY - s.y;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < SWIPE_PX) return;
    const dir: Dir =
      Math.abs(dx) > Math.abs(dy)
        ? dx > 0
          ? "right"
          : "left"
        : dy > 0
          ? "down"
          : "up";
    engineRef.current?.turn(dir);
    s.x = e.clientX;
    s.y = e.clientY;
    s.moved = true;
  };
  const onPointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const s = swipeRef.current;
    swipeRef.current = null;
    if (s && s.id === e.pointerId && !s.moved) engineRef.current?.press();
  };

  return (
    <div className="kids-snake">
      <div className="kids-snake-stage" ref={stageRef}>
        <canvas
          ref={canvasRef}
          className="kids-snake-canvas"
          role="img"
          aria-label={aria}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={() => {
            swipeRef.current = null;
          }}
          onContextMenu={(e) => e.preventDefault()}
        />
      </div>
      <div className="kids-snake-pad">
        {BUTTONS.map((b) => (
          <button
            key={b.dir}
            type="button"
            className={`kids-snake-btn kids-snake-btn-${b.dir}`}
            aria-label={b.label}
            onPointerDown={(e) => {
              e.preventDefault();
              engineRef.current?.turn(b.dir);
            }}
            onKeyDown={(e) => {
              // Keep the window handler from treating this as "start".
              if (e.key === " " || e.key === "Enter") {
                e.preventDefault();
                e.stopPropagation();
                if (!e.repeat) engineRef.current?.turn(b.dir);
              }
            }}
            onContextMenu={(e) => e.preventDefault()}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d={b.path} />
            </svg>
          </button>
        ))}
      </div>
      <p className="kids-snake-controls">{labels.controls}</p>
    </div>
  );
}
