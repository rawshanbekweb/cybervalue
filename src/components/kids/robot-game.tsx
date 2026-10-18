"use client";

import { useEffect, useImperativeHandle, useRef, useState } from "react";
import { COLORS, effective, type Rule, type Value } from "@/lib/kids/lang";
import type { GameProps } from "./game-types";
import "./robot-game.css";

// Logical playfield; the canvas is scaled to the container width.
const W = 640;
const H = 400;
const GROUND = 344;
const ROBOT_X = 112;
const CEILING = GROUND - 26;

const CHEAT_SECONDS: Record<string, number> = {
  uchish: 6,
  magnit: 8,
  kichrayish: 8,
  super_sakrash: 0,
};

type Phase = "ready" | "play" | "over";
type ObstacleKind = "crate" | "spike" | "enemy";

type Obstacle = {
  kind: ObstacleKind;
  x: number;
  w: number;
  h: number;
  step: number;
  gone: boolean;
};
type Coin = { x: number; h: number; spin: number; taken: boolean };
type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  color: string;
  size: number;
};
type Floater = { x: number; y: number; text: string; life: number };
type Banner = { text: string; life: number };

type LiveProps = {
  values: Record<string, Value>;
  rules: Rule[];
  running: boolean;
  onScore: (score: number) => void;
  onOver: (score: number) => void;
  labels: GameProps["labels"];
};

type Settings = {
  jump: number;
  gravity: number;
  speed: number;
  color: string;
  doubleJump: boolean;
  enemySpeed: number;
  coinPoints: number;
};

type Engine = {
  cheat: (name: string) => boolean;
  restart: () => void;
  press: () => void;
  release: () => void;
  setDown: (down: boolean) => void;
  redraw: () => void;
  destroy: () => void;
};

type UiHooks = {
  setFlying: (flying: boolean) => void;
  setAria: (label: string) => void;
};

function num(v: Value | undefined, fallback: number, min: number, max: number) {
  const n = typeof v === "number" && Number.isFinite(v) ? v : fallback;
  return Math.min(max, Math.max(min, n));
}

function readSettings(v: Record<string, Value>): Settings {
  const colorName = typeof v.robot_rangi === "string" ? v.robot_rangi : "";
  return {
    jump: num(v.sakrash_kuchi, 8, 1, 20),
    gravity: num(v.tortishish, 10, 1, 20),
    speed: num(v.yugurish_tezligi, 5, 1, 15),
    color: COLORS[colorName] ?? COLORS.kumush,
    doubleJump: v.ikki_marta_sakrash === true,
    enemySpeed: num(v.dushman_tezligi, 3, 0, 10),
    coinPoints: Math.round(num(v.tanga_ochkosi, 5, 1, 100)),
  };
}

// Tuned so the defaults clear a crate comfortably (≈110 px jump) while
// gravity 1 gives slow, floaty Moon jumps and gravity 20 short hops.
const gravityPx = (g: number) => 450 + g * 105;
const jumpPx = (j: number) => 330 + j * 31;
const scrollPx = (s: number) => 130 + s * 34;
const enemyPx = (e: number) => e * 26;

function hash(n: number) {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
}

function shade(hex: string, amount: number) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex);
  if (!m) return hex;
  const n = parseInt(m[1], 16);
  const f = (c: number) =>
    Math.round(amount < 0 ? c * (1 + amount) : c + (255 - c) * amount).toString(
      16,
    );
  const r = f((n >> 16) & 255).padStart(2, "0");
  const g = f((n >> 8) & 255).padStart(2, "0");
  const b = f(n & 255).padStart(2, "0");
  return `#${r}${g}${b}`;
}

function isTextTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
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

function drawCoin(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  spin: number,
) {
  const sx = Math.max(0.12, Math.abs(Math.cos(spin)));
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(sx, 1);
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fillStyle = "#ffd43b";
  ctx.fill();
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = "#c98a00";
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.58, 0, Math.PI * 2);
  ctx.fillStyle = "#ffb829";
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.75)";
  ctx.fillRect(-r * 0.15, -r * 0.4, r * 0.3, r * 0.8);
  ctx.restore();
}

function drawRobot(
  ctx: CanvasRenderingContext2D,
  x: number,
  feetY: number,
  scale: number,
  color: string,
  t: number,
  runPhase: number,
  airborne: boolean,
  flying: boolean,
) {
  const dark = shade(color, -0.35);
  const light = shade(color, 0.35);
  ctx.save();
  ctx.translate(x, feetY);
  ctx.scale(scale, scale);
  ctx.lineJoin = "round";
  ctx.lineCap = "round";

  // Jet flames while flying.
  if (flying) {
    const flick = 8 + Math.sin(t * 50) * 4 + Math.random() * 3;
    for (const lx of [-7, 7]) {
      ctx.beginPath();
      ctx.moveTo(lx - 5, 0);
      ctx.lineTo(lx, flick + 6);
      ctx.lineTo(lx + 5, 0);
      ctx.closePath();
      ctx.fillStyle = "#ff9233";
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(lx - 2.5, 0);
      ctx.lineTo(lx, flick);
      ctx.lineTo(lx + 2.5, 0);
      ctx.closePath();
      ctx.fillStyle = "#fff3a0";
      ctx.fill();
    }
  }

  // Legs.
  const swing = airborne ? 3 : Math.sin(runPhase) * 6;
  const lift = airborne ? 0 : Math.max(0, Math.cos(runPhase)) * 3;
  const lift2 = airborne ? 0 : Math.max(0, -Math.cos(runPhase)) * 3;
  ctx.fillStyle = dark;
  ctx.beginPath();
  ctx.roundRect(-9 - swing, -15 - lift2, 7, 14, 3);
  ctx.fill();
  ctx.fillStyle = "#3a3a44";
  ctx.beginPath();
  ctx.roundRect(-11 - swing, -4 - lift2, 11, 4, 2);
  ctx.fill();
  ctx.fillStyle = shade(color, -0.2);
  ctx.beginPath();
  ctx.roundRect(2 + swing, -15 - lift, 7, 14, 3);
  ctx.fill();
  ctx.fillStyle = "#4a4a56";
  ctx.beginPath();
  ctx.roundRect(1 + swing, -4 - lift, 11, 4, 2);
  ctx.fill();

  // Back arm.
  const arm = airborne ? -0.9 : Math.sin(runPhase) * 0.7;
  ctx.strokeStyle = dark;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(-14, -30);
  ctx.lineTo(-14 - Math.sin(-arm) * 9, -30 + Math.cos(arm) * 10);
  ctx.stroke();

  // Body.
  ctx.fillStyle = color;
  ctx.strokeStyle = dark;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.roundRect(-16, -36, 32, 23, 6);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = light;
  ctx.fillRect(-12, -33, 5, 16);
  // Chest light.
  ctx.beginPath();
  ctx.arc(5, -25, 4, 0, Math.PI * 2);
  ctx.fillStyle = Math.sin(t * 4) > 0 ? "#3ddc84" : "#2aa866";
  ctx.fill();

  // Front arm.
  ctx.strokeStyle = shade(color, -0.15);
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(13, -30);
  ctx.lineTo(13 + Math.sin(arm) * 9, -30 + Math.cos(arm) * 10);
  ctx.stroke();

  // Neck and head.
  ctx.fillStyle = dark;
  ctx.fillRect(-4, -40, 8, 5);
  ctx.fillStyle = color;
  ctx.strokeStyle = dark;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.roundRect(-16, -62, 32, 24, 7);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#1d2340";
  ctx.beginPath();
  ctx.roundRect(-12, -58, 25, 16, 5);
  ctx.fill();

  // Eyes blink every few seconds.
  const blink = t % 3.2 < 0.13;
  ctx.fillStyle = "#6ff7ff";
  if (blink) {
    ctx.fillRect(-6, -50, 6, 2);
    ctx.fillRect(4, -50, 6, 2);
  } else {
    ctx.beginPath();
    ctx.roundRect(-5, -54, 5, 7, 2);
    ctx.roundRect(5, -54, 5, 7, 2);
    ctx.fill();
  }
  ctx.strokeStyle = "#6ff7ff";
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.arc(2.5, -46.5, 3, 0.2, Math.PI - 0.2);
  ctx.stroke();

  // Antenna.
  const bob = Math.sin(t * 9) * 1.5;
  ctx.strokeStyle = dark;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, -62);
  ctx.lineTo(bob, -71);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(bob, -73, 3.5, 0, Math.PI * 2);
  ctx.fillStyle = "#ff5c5c";
  ctx.fill();

  // Propeller while flying.
  if (flying) {
    const blade = Math.abs(Math.cos(t * 28)) * 14 + 2;
    ctx.fillStyle = "#4da3ff";
    ctx.beginPath();
    ctx.ellipse(bob, -77, blade, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#3a3a44";
    ctx.fillRect(bob - 1.5, -79, 3, 5);
  }
  ctx.restore();
}

function drawEnemy(
  ctx: CanvasRenderingContext2D,
  o: Obstacle,
  t: number,
  frozen: boolean,
) {
  const x = o.x + o.w / 2;
  const step = frozen ? 0 : Math.sin(o.step) * 3;
  ctx.save();
  ctx.translate(x, GROUND);
  ctx.lineCap = "round";
  // Legs.
  ctx.strokeStyle = frozen ? "#6c8fb0" : "#5b2a3a";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-8, -8);
  ctx.lineTo(-8 + step, -1);
  ctx.moveTo(8, -8);
  ctx.lineTo(8 - step, -1);
  ctx.stroke();
  // Body dome.
  ctx.fillStyle = frozen ? "#a9c7e8" : "#e0566b";
  ctx.strokeStyle = frozen ? "#6c8fb0" : "#9c2f42";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(-16, -7);
  ctx.lineTo(-16, -16);
  ctx.arc(0, -16, 16, Math.PI, 0);
  ctx.lineTo(16, -7);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // Eye looking at the robot.
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(-3, -18, 6.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#1d2340";
  ctx.beginPath();
  ctx.arc(-5.5, -18, 3, 0, Math.PI * 2);
  ctx.fill();
  // Antenna.
  ctx.strokeStyle = frozen ? "#6c8fb0" : "#9c2f42";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(4, -31);
  ctx.lineTo(7, -38);
  ctx.stroke();
  ctx.fillStyle = frozen ? "#e6f5ff" : "#ffd43b";
  ctx.beginPath();
  ctx.arc(7, -39, 2.8, 0, Math.PI * 2);
  ctx.fill();

  if (frozen) {
    // Ice block and a snowflake.
    ctx.fillStyle = "rgba(190, 235, 255, 0.45)";
    ctx.strokeStyle = "rgba(255, 255, 255, 0.85)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(-20, -44, 40, 44, 6);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.fillRect(-16, -40, 4, 14);
    ctx.save();
    ctx.translate(11, -36);
    ctx.rotate(t * 0.8);
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1.6;
    for (let i = 0; i < 3; i++) {
      ctx.rotate(Math.PI / 3);
      ctx.beginPath();
      ctx.moveTo(-5, 0);
      ctx.lineTo(5, 0);
      ctx.stroke();
    }
    ctx.restore();
  }
  ctx.restore();
}

function drawCrate(ctx: CanvasRenderingContext2D, o: Obstacle) {
  const y = GROUND - o.h;
  ctx.fillStyle = "#c8873a";
  ctx.strokeStyle = "#7a4a1a";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(o.x, y, o.w, o.h, 4);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(o.x + 5, y + 5);
  ctx.lineTo(o.x + o.w - 5, y + o.h - 5);
  ctx.moveTo(o.x + o.w - 5, y + 5);
  ctx.lineTo(o.x + 5, y + o.h - 5);
  ctx.stroke();
  ctx.fillStyle = "rgba(255,255,255,0.18)";
  ctx.fillRect(o.x + 3, y + 3, o.w - 6, 4);
}

function drawSpikes(ctx: CanvasRenderingContext2D, o: Obstacle) {
  const n = Math.max(2, Math.round(o.w / 14));
  const sw = o.w / n;
  ctx.fillStyle = "#7d8597";
  ctx.strokeStyle = "#3a3a44";
  ctx.lineWidth = 2;
  ctx.fillRect(o.x - 2, GROUND - 5, o.w + 4, 5);
  for (let i = 0; i < n; i++) {
    const x0 = o.x + i * sw;
    ctx.beginPath();
    ctx.moveTo(x0, GROUND - 4);
    ctx.lineTo(x0 + sw / 2, GROUND - o.h);
    ctx.lineTo(x0 + sw, GROUND - 4);
    ctx.closePath();
    ctx.fillStyle = "#c9d1de";
    ctx.fill();
    ctx.stroke();
  }
}

function createEngine(
  canvas: HTMLCanvasElement,
  getProps: () => LiveProps,
  ui: UiHooks,
): Engine {
  const ctxOrNull = canvas.getContext("2d");
  if (!ctxOrNull)
    return {
      cheat: () => false,
      restart: () => {},
      press: () => {},
      release: () => {},
      setDown: () => {},
      redraw: () => {},
      destroy: () => {},
    };
  const ctx: CanvasRenderingContext2D = ctxOrNull;

  let phase: Phase = "ready";
  let score = 0;
  let reportedScore = -1;
  let lives = 3;
  let time = 0;
  let clock = 0;
  let world = 0;
  let overAt = 0;
  let h = 0;
  let vy = 0;
  let jumps = 0;
  let runPhase = 0;
  let invuln = 0;
  let shake = 0;
  let size = 1;
  let upHeld = false;
  let downHeld = false;
  let gap = 420;
  let fly = 0;
  let magnet = 0;
  let small = 0;
  let flyingShown = false;
  let ariaAt = -10;
  let ariaText = "";
  let obstacles: Obstacle[] = [];
  let coins: Coin[] = [];
  let particles: Particle[] = [];
  let floaters: Floater[] = [];
  let banners: Banner[] = [];
  let settings = readSettings(getProps().values);
  let raf = 0;
  let last = 0;
  let pausedDrawn = false;

  function runtime() {
    return { ochko: score, hayotlar: lives, vaqt: Math.floor(time) };
  }

  function refreshSettings() {
    const p = getProps();
    settings = readSettings(effective(p.values, p.rules, runtime()));
  }

  function reportScore() {
    if (score !== reportedScore) {
      reportedScore = score;
      getProps().onScore(score);
    }
  }

  function reset(next: Phase) {
    const p = getProps();
    const start = effective(p.values, p.rules, {
      ochko: 0,
      hayotlar: 0,
      vaqt: 0,
    });
    lives = Math.round(num(start.hayotlar, 3, 1, 99));
    score = 0;
    time = 0;
    world = 0;
    h = 0;
    vy = 0;
    jumps = 0;
    invuln = 0;
    shake = 0;
    size = 1;
    fly = 0;
    magnet = 0;
    small = 0;
    upHeld = false;
    downHeld = false;
    gap = 420;
    obstacles = [];
    coins = [];
    particles = [];
    floaters = [];
    banners = [];
    phase = next;
    pausedDrawn = false;
    refreshSettings();
    reportScore();
    ariaAt = -10;
  }

  function jump() {
    if (phase !== "play") return;
    if (fly > 0) {
      upHeld = true;
      return;
    }
    const maxJumps = settings.doubleJump ? 2 : 1;
    const grounded = h <= 0.01;
    if (grounded) jumps = 0;
    else if (jumps === 0) jumps = 1; // walked off: the ground jump is spent
    if (jumps >= maxJumps) return;
    jumps += 1;
    vy = jumpPx(settings.jump) * (jumps === 2 ? 0.9 : 1);
    puff(ROBOT_X, GROUND - h, "#ffffff", 6);
  }

  function puff(x: number, y: number, color: string, n: number) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = 40 + Math.random() * 120;
      particles.push({
        x,
        y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp - 40,
        life: 0.5 + Math.random() * 0.3,
        max: 0.8,
        color,
        size: 2 + Math.random() * 2.5,
      });
    }
  }

  function spawn() {
    const roll = Math.random();
    const kind: ObstacleKind =
      roll < 0.36 ? "crate" : roll < 0.66 ? "spike" : "enemy";
    const x = W + 40;
    let o: Obstacle;
    if (kind === "crate") {
      const big = Math.random() < 0.3;
      o = { kind, x, w: 36, h: big ? 50 : 36, step: 0, gone: false };
    } else if (kind === "spike") {
      o = {
        kind,
        x,
        w: Math.random() < 0.5 ? 42 : 56,
        h: 24,
        step: 0,
        gone: false,
      };
    } else {
      o = { kind, x, w: 32, h: 32, step: Math.random() * 6, gone: false };
    }
    obstacles.push(o);

    // Coins: an arc over the obstacle, or a row at some height after it.
    const r = Math.random();
    if (r < 0.3 && kind !== "enemy") {
      for (let i = 0; i < 3; i++)
        coins.push({
          x: x + o.w / 2 + (i - 1) * 30,
          h: o.h + 50 + (i === 1 ? 22 : 0),
          spin: i,
          taken: false,
        });
    } else if (r < 0.85) {
      const levels = [26, 26, 80, 80, 140, 205];
      const level = levels[Math.floor(Math.random() * levels.length)];
      const count = level > 150 ? 2 : 3 + Math.floor(Math.random() * 2);
      const startX = x + o.w + 110 + Math.random() * 40;
      for (let i = 0; i < count; i++)
        coins.push({
          x: startX + i * 32,
          h: level,
          spin: i * 0.6,
          taken: false,
        });
    }
  }

  function hurt() {
    lives = Math.max(0, lives - 1);
    invuln = 1.1;
    shake = 0.3;
    puff(ROBOT_X, GROUND - h - 28, "#ff5c5c", 12);
    if (lives <= 0) {
      phase = "over";
      overAt = clock;
      fly = 0;
      magnet = 0;
      small = 0;
      getProps().onOver(score);
    }
  }

  function update(dt: number) {
    time += dt;
    refreshSettings();
    const s = settings;
    const speed = scrollPx(s.speed);
    const dx = speed * dt;
    world += dx;
    runPhase += dt * (8 + s.speed * 0.9);

    fly = Math.max(0, fly - dt);
    magnet = Math.max(0, magnet - dt);
    small = Math.max(0, small - dt);
    invuln = Math.max(0, invuln - dt);
    shake = Math.max(0, shake - dt);
    const targetSize = small > 0 ? 0.5 : 1;
    size += (targetSize - size) * Math.min(1, dt * 10);

    // Robot physics.
    if (fly > 0) {
      const target = upHeld ? 260 : downHeld ? -260 : Math.sin(clock * 3) * 25;
      vy += (target - vy) * Math.min(1, dt * 8);
      h += vy * dt;
      if (h <= 0) {
        h = 0;
        vy = Math.max(0, vy);
      }
    } else {
      vy -= gravityPx(s.gravity) * dt;
      h += vy * dt;
      if (h <= 0) {
        if (vy < -300) puff(ROBOT_X, GROUND, "#e8dcc0", 4);
        h = 0;
        vy = 0;
        jumps = 0;
      }
    }
    if (h > CEILING - 60 * size) {
      h = CEILING - 60 * size;
      vy = Math.min(vy, 0);
    }

    // Spawning by distance so spacing scales with speed.
    gap -= dx;
    if (gap <= 0) {
      spawn();
      gap = 250 + Math.random() * 230 + speed * 0.35;
    }

    const enemyV = enemyPx(s.enemySpeed);
    for (const o of obstacles) {
      o.x -= dx + (o.kind === "enemy" ? enemyV * dt : 0);
      if (o.kind === "enemy" && enemyV > 0) o.step += dt * (6 + s.enemySpeed);
    }
    for (const c of coins) {
      c.x -= dx;
      c.spin += dt * 5;
    }

    // Robot hitbox (feet at GROUND - h).
    const hw = 13 * size;
    const top = GROUND - h - 58 * size;
    const bottom = GROUND - h - 2;
    const left = ROBOT_X - hw;
    const right = ROBOT_X + hw;

    if (invuln <= 0 && phase === "play") {
      for (const o of obstacles) {
        if (o.gone) continue;
        const inset = o.kind === "spike" ? 6 : 4;
        const ox1 = o.x + inset;
        const ox2 = o.x + o.w - inset;
        const oy1 = GROUND - o.h + (o.kind === "spike" ? 8 : 3);
        if (right > ox1 && left < ox2 && bottom > oy1 && top < GROUND) {
          if (o.kind === "enemy") {
            o.gone = true;
            puff(o.x + o.w / 2, GROUND - 16, "#e0566b", 10);
          }
          hurt();
          break;
        }
      }
    }

    const magnetR = 230;
    for (const c of coins) {
      if (c.taken) continue;
      const cy = GROUND - c.h;
      const rx = ROBOT_X;
      const ry = GROUND - h - 30 * size;
      if (magnet > 0) {
        const ddx = rx - c.x;
        const ddy = ry - cy;
        const d = Math.hypot(ddx, ddy);
        if (d < magnetR && d > 1) {
          const pull = (520 + speed) * dt;
          c.x += (ddx / d) * Math.min(pull, d);
          c.h -= (ddy / d) * Math.min(pull, d);
        }
      }
      const ccy = GROUND - c.h;
      if (
        c.x + 10 > left &&
        c.x - 10 < right &&
        ccy + 10 > top &&
        ccy - 10 < bottom
      ) {
        c.taken = true;
        score += s.coinPoints;
        puff(c.x, ccy, "#ffd43b", 7);
        floaters.push({
          x: c.x,
          y: ccy - 8,
          text: `+${s.coinPoints}`,
          life: 0.9,
        });
      }
    }

    obstacles = obstacles.filter((o) => o.x + o.w > -60 && !o.gone);
    coins = coins.filter((c) => c.x > -30 && !c.taken);
    reportScore();
  }

  function updateEffects(dt: number) {
    for (const p of particles) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 300 * dt;
      p.life -= dt;
    }
    particles = particles.filter((p) => p.life > 0).slice(-200);
    for (const f of floaters) {
      f.y -= 40 * dt;
      f.life -= dt;
    }
    floaters = floaters.filter((f) => f.life > 0);
    for (const b of banners) b.life -= dt;
    banners = banners.filter((b) => b.life > 0);
  }

  function drawBackground() {
    const sky = ctx.createLinearGradient(0, 0, 0, GROUND);
    sky.addColorStop(0, "#2b1d5c");
    sky.addColorStop(0.45, "#7b3f8c");
    sky.addColorStop(0.8, "#ff8a65");
    sky.addColorStop(1, "#ffd27f");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, GROUND);

    // Stars.
    for (let i = 0; i < 28; i++) {
      const sx = (hash(i) * W * 1.3 - world * 0.02) % (W * 1.3);
      const x = sx < 0 ? sx + W * 1.3 : sx;
      const y = hash(i + 50) * 120;
      const tw = 0.5 + 0.5 * Math.sin(clock * 2 + i);
      ctx.fillStyle = `rgba(255,255,255,${0.35 + tw * 0.5})`;
      ctx.fillRect(x, y, 2, 2);
    }

    // Sun.
    const sunGlow = ctx.createRadialGradient(470, 250, 10, 470, 250, 90);
    sunGlow.addColorStop(0, "rgba(255,240,180,0.9)");
    sunGlow.addColorStop(1, "rgba(255,200,120,0)");
    ctx.fillStyle = sunGlow;
    ctx.fillRect(380, 160, 180, 180);
    ctx.fillStyle = "#ffe8a3";
    ctx.beginPath();
    ctx.arc(470, 250, 34, 0, Math.PI * 2);
    ctx.fill();

    // Far hills.
    const hillOff = world * 0.12;
    ctx.fillStyle = "#6b3f86";
    ctx.beginPath();
    ctx.moveTo(0, GROUND);
    for (let x = 0; x <= W; x += 8) {
      const wx = x + hillOff;
      const y =
        250 + Math.sin(wx * 0.012) * 22 + Math.sin(wx * 0.031 + 1.7) * 10;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(W, GROUND);
    ctx.closePath();
    ctx.fill();

    // City silhouettes.
    const slot = 58;
    const cityOff = world * 0.35;
    const first = Math.floor(cityOff / slot);
    for (let i = first; i < first + Math.ceil(W / slot) + 2; i++) {
      const bx = i * slot - cityOff;
      const bw = 38 + hash(i) * 18;
      const bh = 40 + hash(i + 900) * 90;
      const by = GROUND - bh;
      ctx.fillStyle = "#3d2463";
      ctx.fillRect(bx, by, bw, bh);
      if (hash(i + 40) > 0.6) {
        ctx.fillRect(bx + bw / 2 - 1, by - 14, 2, 14);
        ctx.fillStyle = Math.sin(clock * 3 + i) > 0 ? "#ff5c5c" : "#7a2f50";
        ctx.fillRect(bx + bw / 2 - 2, by - 16, 4, 4);
      }
      for (let wy = by + 8; wy < GROUND - 14; wy += 14)
        for (let wx = bx + 6; wx < bx + bw - 8; wx += 11)
          if (hash(i * 31 + wx * 0.7 + wy * 1.3) > 0.55) {
            ctx.fillStyle = "#ffe08a";
            ctx.fillRect(wx, wy, 5, 7);
          }
    }

    // Near bushes.
    const bushOff = world * 0.6;
    ctx.fillStyle = "#2f6b4f";
    const bslot = 90;
    const bfirst = Math.floor(bushOff / bslot);
    for (let i = bfirst; i < bfirst + Math.ceil(W / bslot) + 2; i++) {
      const bx = i * bslot - bushOff + hash(i + 7) * 30;
      const r = 12 + hash(i + 3) * 10;
      ctx.beginPath();
      ctx.arc(bx, GROUND, r, Math.PI, 0);
      ctx.arc(bx + r, GROUND, r * 0.7, Math.PI, 0);
      ctx.fill();
    }

    // Ground tiles.
    ctx.fillStyle = "#8a5a3c";
    ctx.fillRect(0, GROUND, W, H - GROUND);
    const tile = 40;
    const tOff = world % tile;
    for (let i = -1; i < W / tile + 2; i++) {
      const tx = i * tile - tOff;
      ctx.fillStyle = i % 2 === 0 ? "#9b6845" : "#8a5a3c";
      ctx.fillRect(tx, GROUND + 10, tile, 22);
      ctx.fillStyle = "#74492f";
      ctx.fillRect(tx + tile / 2, GROUND + 32, tile, 24);
      ctx.fillStyle = "rgba(0,0,0,0.15)";
      ctx.fillRect(tx, GROUND + 10, 2, 22);
    }
    ctx.fillStyle = "#5fd16a";
    ctx.fillRect(0, GROUND, W, 10);
    ctx.fillStyle = "#3fae4f";
    for (let i = -1; i < W / 12 + 2; i++) {
      const gx = i * 12 - (world % 12);
      ctx.beginPath();
      ctx.moveTo(gx, GROUND + 10);
      ctx.lineTo(gx + 6, GROUND + 14);
      ctx.lineTo(gx + 12, GROUND + 10);
      ctx.fill();
    }
  }

  function drawHud() {
    // Score pill.
    ctx.fillStyle = "rgba(20, 12, 50, 0.55)";
    ctx.beginPath();
    ctx.roundRect(12, 10, 150, 38, 19);
    ctx.fill();
    drawCoin(ctx, 32, 29, 11, clock * 3);
    ctx.fillStyle = "#ffffff";
    ctx.font = "800 22px system-ui, sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(String(score), 52, 30);

    // Hearts.
    const showHearts = Math.min(lives, 6);
    const extra = lives > 6;
    const pillW = extra ? 110 : Math.max(48, showHearts * 26 + 20);
    ctx.fillStyle = "rgba(20, 12, 50, 0.55)";
    ctx.beginPath();
    ctx.roundRect(W - 12 - pillW, 10, pillW, 38, 19);
    ctx.fill();
    if (extra) {
      ctx.fillStyle = "#ff5c7a";
      heart(ctx, W - 12 - pillW + 26, 18, 22);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.font = "800 20px system-ui, sans-serif";
      ctx.fillText(`× ${lives}`, W - 12 - pillW + 46, 30);
    } else {
      for (let i = 0; i < showHearts; i++) {
        ctx.fillStyle = "#ff5c7a";
        heart(ctx, W - 12 - pillW + 23 + i * 26, 18, 22);
        ctx.fill();
      }
    }

    // Active cheat timers.
    const active: [string, number, number, string][] = [];
    if (fly > 0) active.push(["uchish", fly, 6, "#4da3ff"]);
    if (magnet > 0) active.push(["magnit", magnet, 8, "#ff5c5c"]);
    if (small > 0) active.push(["kichrayish", small, 8, "#3ddc84"]);
    ctx.font = "700 13px system-ui, sans-serif";
    active.forEach(([name, left, total, color], i) => {
      const x = 12;
      const y = 56 + i * 24;
      ctx.fillStyle = "rgba(20, 12, 50, 0.55)";
      ctx.beginPath();
      ctx.roundRect(x, y, 130, 20, 10);
      ctx.fill();
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.roundRect(x + 2, y + 2, 126 * (left / total), 16, 8);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.fillText(name, x + 10, y + 11);
    });
  }

  function panel(
    lines: string[],
    accent: string,
    icon: "play" | "pause" | "again",
  ) {
    ctx.fillStyle = "rgba(20, 12, 50, 0.45)";
    ctx.fillRect(0, 0, W, H);
    ctx.font = "800 24px system-ui, sans-serif";
    const wrapped = lines.flatMap((l) => wrap(ctx, l, 420));
    const ph = 110 + wrapped.length * 32;
    const py = (H - ph) / 2;
    ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
    ctx.beginPath();
    ctx.roundRect(W / 2 - 240, py, 480, ph, 22);
    ctx.fill();
    ctx.lineWidth = 5;
    ctx.strokeStyle = accent;
    ctx.stroke();

    // Icon circle.
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
    if (icon !== "pause") ctx.fillText("Space · ↑ · Enter", cx, py + ph - 18);
  }

  function draw() {
    const scaleX = canvas.width / W;
    const scaleY = canvas.height / H;
    ctx.setTransform(scaleX, 0, 0, scaleY, 0, 0);
    ctx.save();
    if (shake > 0) {
      const m = shake * 14;
      ctx.translate((Math.random() - 0.5) * m, (Math.random() - 0.5) * m);
    }
    drawBackground();

    const frozen = settings.enemySpeed <= 0;
    for (const o of obstacles) {
      if (o.x > W + 60) continue;
      if (o.kind === "crate") drawCrate(ctx, o);
      else if (o.kind === "spike") drawSpikes(ctx, o);
      else drawEnemy(ctx, o, clock, frozen);
    }
    for (const c of coins) drawCoin(ctx, c.x, GROUND - c.h, 10, c.spin);

    // Shadow.
    const shadowW = Math.max(6, 18 * size - h * 0.04);
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.beginPath();
    ctx.ellipse(ROBOT_X, GROUND + 2, shadowW, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    const blinkHide = invuln > 0 && Math.floor(invuln * 12) % 2 === 0;
    if (phase !== "over" && !blinkHide) {
      drawRobot(
        ctx,
        ROBOT_X,
        GROUND - h,
        size,
        settings.color,
        clock,
        phase === "play" ? runPhase : 0,
        h > 0.5,
        fly > 0,
      );
    }

    for (const p of particles) {
      ctx.globalAlpha = Math.max(0, p.life / p.max);
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
    }
    ctx.globalAlpha = 1;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "800 18px system-ui, sans-serif";
    for (const f of floaters) {
      ctx.globalAlpha = Math.min(1, f.life * 2);
      ctx.lineWidth = 4;
      ctx.strokeStyle = "#5a3a00";
      ctx.strokeText(f.text, f.x, f.y);
      ctx.fillStyle = "#ffe066";
      ctx.fillText(f.text, f.x, f.y);
    }
    ctx.globalAlpha = 1;
    ctx.restore();

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
    if (phase === "ready") panel([p.labels.start], "#3ddc84", "play");
    else if (phase === "over")
      panel([p.labels.over, `★ ${score}`], "#ff9233", "again");
    else if (!p.running) panel([p.labels.paused], "#4da3ff", "pause");
  }

  function syncUi() {
    const flying = phase === "play" && fly > 0;
    if (flying !== flyingShown) {
      flyingShown = flying;
      ui.setFlying(flying);
      if (!flying) downHeld = false;
    }
    if (clock - ariaAt > 1.5) {
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
      const text = `Robot sakrash. Ochko: ${score}. Hayotlar: ${lives}.${
        status ? ` ${status}` : ""
      }`;
      if (text !== ariaText) {
        ariaText = text;
        ui.setAria(text);
      }
    }
  }

  function frame(now: number) {
    raf = requestAnimationFrame(frame);
    const dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
    last = now;
    const running = getProps().running;
    if (!running) {
      if (!pausedDrawn) {
        pausedDrawn = true;
        refreshSettings();
        draw();
        ariaAt = -10;
        syncUi();
      }
      return;
    }
    pausedDrawn = false;
    clock += dt;
    if (phase === "play") update(dt);
    else refreshSettings();
    updateEffects(dt);
    draw();
    syncUi();
  }

  function redraw() {
    pausedDrawn = false;
  }

  reset("ready");
  raf = requestAnimationFrame(frame);

  return {
    cheat(name) {
      const key = name.trim().toLowerCase();
      if (!(key in CHEAT_SECONDS)) return false;
      if (phase === "ready") phase = "play";
      if (phase === "over") reset("play");
      const secs = CHEAT_SECONDS[key];
      if (key === "uchish") fly = secs;
      else if (key === "magnit") magnet = secs;
      else if (key === "kichrayish") small = secs;
      else {
        refreshSettings();
        const g = gravityPx(settings.gravity);
        vy = Math.max(vy, Math.max(760, Math.sqrt(2 * g * 250)));
        jumps = settings.doubleJump ? 1 : 0;
        if (fly > 0) fly = 0;
        puff(ROBOT_X, GROUND - h, "#ffe066", 14);
      }
      banners.push({ text: key, life: 1.8 });
      banners = banners.slice(-3);
      redraw();
      return true;
    },
    restart() {
      reset("play");
      redraw();
    },
    press() {
      if (!getProps().running) return;
      if (phase === "ready") {
        phase = "play";
        return;
      }
      if (phase === "over") {
        if (clock - overAt > 0.6) reset("play");
        return;
      }
      jump();
    },
    release() {
      upHeld = false;
    },
    setDown(down) {
      downHeld = down && fly > 0;
    },
    redraw,
    destroy() {
      cancelAnimationFrame(raf);
    },
  };
}

export function RobotGame({
  values,
  rules,
  running,
  onScore,
  onOver,
  labels,
  ref,
}: GameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Engine | null>(null);
  const propsRef = useRef<LiveProps>({
    values,
    rules,
    running,
    onScore,
    onOver,
    labels,
  });
  const [flying, setFlying] = useState(false);
  const [aria, setAria] = useState("Robot sakrash");
  const [jumpPressed, setJumpPressed] = useState(false);
  const [downPressed, setDownPressed] = useState(false);

  useEffect(() => {
    propsRef.current = { values, rules, running, onScore, onOver, labels };
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
    const engine = createEngine(canvas, () => propsRef.current, {
      setFlying,
      setAria,
    });
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
    const JUMP = new Set(["Space", "ArrowUp", "KeyW"]);
    const DOWN = new Set(["ArrowDown", "KeyS"]);
    const onKeyDown = (e: KeyboardEvent) => {
      if (isTextTarget(e.target) || e.ctrlKey || e.metaKey || e.altKey) return;
      const engine = engineRef.current;
      if (!engine || !propsRef.current.running) return;
      const code = e.code || (e.key === " " ? "Space" : e.key);
      if (JUMP.has(code) || code === "Enter" || code === "NumpadEnter") {
        if (code !== "KeyW" && code !== "Enter") e.preventDefault();
        if (code === "Enter" || code === "NumpadEnter") {
          if (!e.repeat) engine.press();
          return;
        }
        if (!e.repeat) engine.press();
      } else if (DOWN.has(code)) {
        if (code === "ArrowDown") e.preventDefault();
        engine.setDown(true);
      } else if (code === "ArrowLeft" || code === "ArrowRight") {
        e.preventDefault();
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (isTextTarget(e.target)) return;
      const engine = engineRef.current;
      if (!engine) return;
      const code = e.code || (e.key === " " ? "Space" : e.key);
      if (JUMP.has(code)) engine.release();
      else if (DOWN.has(code)) engine.setDown(false);
    };
    const onBlur = () => {
      engineRef.current?.release();
      engineRef.current?.setDown(false);
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);
    };
  }, []);

  const pressDown = (e: React.PointerEvent<HTMLElement>) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    engineRef.current?.press();
  };
  const pressUp = () => engineRef.current?.release();

  return (
    <div className="kids-robot">
      <div className="kids-robot-stage" ref={stageRef}>
        <canvas
          ref={canvasRef}
          className="kids-robot-canvas"
          role="img"
          aria-label={aria}
          onPointerDown={pressDown}
          onPointerUp={pressUp}
          onPointerCancel={pressUp}
          onContextMenu={(e) => e.preventDefault()}
        />
      </div>
      <div className="kids-robot-pad">
        <button
          type="button"
          className="kids-robot-btn"
          aria-label="Sakrash"
          data-pressed={jumpPressed}
          onPointerDown={(e) => {
            setJumpPressed(true);
            pressDown(e);
          }}
          onPointerUp={() => {
            setJumpPressed(false);
            pressUp();
          }}
          onPointerCancel={() => {
            setJumpPressed(false);
            pressUp();
          }}
          onKeyDown={(e) => {
            // Window handler already handles Space/Enter for the game.
            if (e.key === " " || e.key === "Enter") e.preventDefault();
          }}
          onContextMenu={(e) => e.preventDefault()}
        >
          ⬆ Sakrash
        </button>
        {flying ? (
          <button
            type="button"
            className="kids-robot-btn kids-robot-btn-down"
            aria-label="Pastga"
            data-pressed={downPressed}
            onPointerDown={(e) => {
              e.preventDefault();
              e.currentTarget.setPointerCapture?.(e.pointerId);
              setDownPressed(true);
              engineRef.current?.setDown(true);
            }}
            onPointerUp={() => {
              setDownPressed(false);
              engineRef.current?.setDown(false);
            }}
            onPointerCancel={() => {
              setDownPressed(false);
              engineRef.current?.setDown(false);
            }}
            onContextMenu={(e) => e.preventDefault()}
          >
            ⬇ Pastga
          </button>
        ) : null}
      </div>
      <p className="kids-robot-controls">{labels.controls}</p>
    </div>
  );
}
