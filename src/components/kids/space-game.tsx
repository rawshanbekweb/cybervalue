"use client";

import { useEffect, useImperativeHandle, useRef } from "react";
import { COLORS, effective, normalize, type Value } from "@/lib/kids/lang";
import type { GameApi, GameProps } from "./game-types";
import "./space-game.css";

/* ------------------------------------------------------------------ */
/* Constants                                                           */
/* ------------------------------------------------------------------ */

const W = 640;
const H = 400;
const HUD = 34;
const SHIP_R = 15;
const FONT = '"Segoe UI", system-ui, Arial, sans-serif';

const CHEATS = {
  "yulduz_yomg'iri": 6,
  qalqon: 8,
  vaqtni_sekinlashtir: 6,
  portlash: 0,
} as const;
type CheatName = keyof typeof CHEATS;

const isCheat = (name: string): name is CheatName => name in CHEATS;

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

type Phase = "start" | "play" | "over";

type Asteroid = {
  x: number;
  y: number;
  r: number;
  speed: number;
  drift: number;
  rot: number;
  spin: number;
  shape: number[];
  craters: { a: number; d: number; r: number }[];
  color: string;
};

type Star = { x: number; y: number; speed: number; phase: number; rot: number };

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  size: number;
  color: string;
};

type Floater = { x: number; y: number; text: string; life: number };

type BgStar = { x: number; y: number; size: number; layer: number };

type Settings = {
  speed: number;
  color: string;
  asteroidSpeed: number;
  asteroidCount: number;
  points: number;
  invisible: boolean;
};

type Input = {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  holdLeft: boolean;
  holdRight: boolean;
  pointer: { x: number; y: number } | null;
};

type Engine = {
  cheat: (name: string) => boolean;
  restart: () => void;
  begin: () => void;
  setRunning: (running: boolean) => void;
  resize: () => void;
  input: Input;
  phase: () => Phase;
  destroy: () => void;
};

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const rand = (min: number, max: number) => min + Math.random() * (max - min);
const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v));

function num(v: Value | undefined, fallback: number, min: number, max: number) {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? clamp(n, min, max) : fallback;
}

function readSettings(values: Record<string, Value>): Settings {
  const colorName =
    typeof values.kema_rangi === "string" ? values.kema_rangi : "";
  return {
    speed: num(values.tezlik, 5, 1, 20),
    color: COLORS[colorName] ?? COLORS["ko'k"],
    asteroidSpeed: num(values.asteroid_tezligi, 4, 1, 10),
    asteroidCount: Math.round(num(values.asteroidlar_soni, 4, 1, 10)),
    points: Math.round(num(values.yulduz_ochkosi, 10, 1, 100)),
    invisible: values["ko'rinmas"] === true,
  };
}

/** Lightens (amount > 0) or darkens (amount < 0) a #rrggbb colour. */
function shade(hex: string, amount: number) {
  const n = parseInt(hex.slice(1), 16);
  const channel = (shift: number) => {
    const c = (n >> shift) & 255;
    const t = amount > 0 ? 255 : 0;
    return Math.round(c + (t - c) * Math.abs(amount));
  };
  return `rgb(${channel(16)}, ${channel(8)}, ${channel(0)})`;
}

function isTextField(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
}

function isControl(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  return target.closest("button, a, [role='button'], summary") !== null;
}

function makeAsteroid(): Asteroid {
  const r = rand(14, 28);
  const points = 11;
  const shape = Array.from({ length: points }, () => rand(0.8, 1.08));
  const craters = Array.from({ length: Math.round(rand(2, 4)) }, () => ({
    a: rand(0, Math.PI * 2),
    d: rand(0, 0.55),
    r: rand(0.14, 0.26),
  }));
  const palette = ["#8d7a6b", "#9a8778", "#7f7c8f", "#a0806a"];
  return {
    x: rand(r, W - r),
    y: -r - rand(0, 30),
    r,
    speed: rand(0.8, 1.2),
    drift: rand(-14, 14),
    rot: rand(0, Math.PI * 2),
    spin: rand(-1.2, 1.2),
    shape,
    craters,
    color: palette[Math.floor(Math.random() * palette.length)],
  };
}

/* ------------------------------------------------------------------ */
/* Drawing                                                             */
/* ------------------------------------------------------------------ */

function starPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  outer: number,
  inner: number,
  rot: number,
) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = rot - Math.PI / 2 + (i * Math.PI) / 5;
    const px = x + Math.cos(a) * r;
    const py = y + Math.sin(a) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
}

function heartPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
) {
  ctx.beginPath();
  ctx.moveTo(x, y + s * 0.35);
  ctx.bezierCurveTo(x, y, x - s * 0.5, y - s * 0.05, x - s * 0.5, y + s * 0.3);
  ctx.bezierCurveTo(x - s * 0.5, y + s * 0.6, x, y + s * 0.75, x, y + s * 0.95);
  ctx.bezierCurveTo(
    x,
    y + s * 0.75,
    x + s * 0.5,
    y + s * 0.6,
    x + s * 0.5,
    y + s * 0.3,
  );
  ctx.bezierCurveTo(x + s * 0.5, y - s * 0.05, x, y, x, y + s * 0.35);
  ctx.closePath();
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
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
  return lines.slice(0, 3);
}

function drawShip(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string,
  t: number,
  tilt: number,
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(tilt);

  // Flame
  const flicker = 10 + Math.sin(t * 38) * 3 + Math.sin(t * 23) * 2;
  ctx.fillStyle = "#ff9233";
  ctx.beginPath();
  ctx.moveTo(-7, 13);
  ctx.quadraticCurveTo(0, 13 + flicker * 1.9, 7, 13);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#ffe066";
  ctx.beginPath();
  ctx.moveTo(-4, 13);
  ctx.quadraticCurveTo(0, 13 + flicker * 1.1, 4, 13);
  ctx.closePath();
  ctx.fill();

  // Wings
  ctx.fillStyle = shade(color, -0.3);
  ctx.beginPath();
  ctx.moveTo(-9, -2);
  ctx.quadraticCurveTo(-22, 6, -21, 15);
  ctx.quadraticCurveTo(-14, 14, -8, 10);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(9, -2);
  ctx.quadraticCurveTo(22, 6, 21, 15);
  ctx.quadraticCurveTo(14, 14, 8, 10);
  ctx.closePath();
  ctx.fill();

  // Body
  const body = ctx.createLinearGradient(-12, 0, 12, 0);
  body.addColorStop(0, shade(color, 0.25));
  body.addColorStop(0.5, color);
  body.addColorStop(1, shade(color, -0.2));
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.moveTo(0, -24);
  ctx.bezierCurveTo(10, -18, 12, -4, 11, 8);
  ctx.quadraticCurveTo(11, 15, 4, 15);
  ctx.lineTo(-4, 15);
  ctx.quadraticCurveTo(-11, 15, -11, 8);
  ctx.bezierCurveTo(-12, -4, -10, -18, 0, -24);
  ctx.closePath();
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = shade(color, -0.45);
  ctx.stroke();

  // Window
  ctx.fillStyle = "#cdeeff";
  ctx.beginPath();
  ctx.arc(0, -6, 5.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.beginPath();
  ctx.arc(-1.8, -7.8, 1.8, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawAsteroid(ctx: CanvasRenderingContext2D, a: Asteroid) {
  ctx.save();
  ctx.translate(a.x, a.y);
  ctx.rotate(a.rot);
  ctx.beginPath();
  a.shape.forEach((k, i) => {
    const ang = (i / a.shape.length) * Math.PI * 2;
    const px = Math.cos(ang) * a.r * k;
    const py = Math.sin(ang) * a.r * k;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  });
  ctx.closePath();
  const g = ctx.createRadialGradient(
    -a.r * 0.3,
    -a.r * 0.3,
    a.r * 0.1,
    0,
    0,
    a.r,
  );
  g.addColorStop(0, shade(a.color, 0.25));
  g.addColorStop(1, shade(a.color, -0.25));
  ctx.fillStyle = g;
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.lineJoin = "round";
  ctx.strokeStyle = shade(a.color, -0.5);
  ctx.stroke();
  for (const c of a.craters) {
    const cx = Math.cos(c.a) * c.d * a.r;
    const cy = Math.sin(c.a) * c.d * a.r;
    ctx.fillStyle = shade(a.color, -0.3);
    ctx.beginPath();
    ctx.arc(cx, cy, c.r * a.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.12)";
    ctx.beginPath();
    ctx.arc(cx + 1, cy + 1, c.r * a.r * 0.6, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/* ------------------------------------------------------------------ */
/* Engine                                                              */
/* ------------------------------------------------------------------ */

function createEngine(
  canvas: HTMLCanvasElement,
  wrapper: HTMLElement,
  getProps: () => GameProps,
): Engine {
  const ctx = canvas.getContext("2d");
  const input: Input = {
    left: false,
    right: false,
    up: false,
    down: false,
    holdLeft: false,
    holdRight: false,
    pointer: null,
  };

  let phase: Phase = "start";
  let running = getProps().running;
  let raf = 0;
  let last = 0;
  let clock = 0;

  let score = 0;
  let reportedScore = -1;
  let lives = 3;
  let vaqt = 0;
  let invuln = 0;
  let shipX = W / 2;
  let shipY = H - 40;
  let tilt = 0;
  let asteroidTimer = 1;
  let starTimer = 0.6;
  const timers = { rain: 0, shield: 0, slow: 0 };
  let banner: { text: string; life: number } | null = null;
  let ariaTimer = 0;
  let ariaText = "";

  let asteroids: Asteroid[] = [];
  let stars: Star[] = [];
  let particles: Particle[] = [];
  let floaters: Floater[] = [];
  const bg: BgStar[] = Array.from({ length: 90 }, () => {
    const layer = Math.floor(rand(0, 3));
    return { x: rand(0, W), y: rand(0, H), size: 0.6 + layer * 0.6, layer };
  });

  const current = (): Settings => {
    const p = getProps();
    return readSettings(
      effective(p.values, p.rules, { ochko: score, hayotlar: lives, vaqt }),
    );
  };

  const burst = (
    x: number,
    y: number,
    colors: string[],
    count: number,
    power: number,
  ) => {
    for (let i = 0; i < count; i++) {
      const a = rand(0, Math.PI * 2);
      const s = rand(power * 0.3, power);
      const max = rand(0.4, 0.9);
      particles.push({
        x,
        y,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s,
        life: max,
        max,
        size: rand(1.5, 4),
        color: colors[i % colors.length],
      });
    }
    if (particles.length > 400) particles = particles.slice(-400);
  };

  const reportScore = () => {
    if (score !== reportedScore) {
      reportedScore = score;
      getProps().onScore(score);
    }
  };

  const restart = () => {
    const p = getProps();
    phase = "play";
    score = 0;
    lives = Math.round(num(p.values.hayotlar, 3, 1, 99));
    vaqt = 0;
    invuln = 0;
    shipX = W / 2;
    shipY = H - 40;
    asteroids = [];
    stars = [];
    particles = [];
    floaters = [];
    asteroidTimer = 1;
    starTimer = 0.6;
    timers.rain = 0;
    timers.shield = 0;
    timers.slow = 0;
    reportScore();
    if (!running) draw();
  };

  const gameOver = () => {
    phase = "over";
    burst(shipX, shipY, ["#ff9233", "#ffd43b", "#ff5c5c", "#ffffff"], 40, 220);
    getProps().onOver(score);
  };

  /* ---------------- update ---------------- */

  const update = (dt: number) => {
    clock += dt;
    for (const s of bg) {
      s.y += (6 + s.layer * 10) * dt;
      if (s.y > H) {
        s.y -= H;
        s.x = rand(0, W);
      }
    }
    if (banner) {
      banner.life -= dt;
      if (banner.life <= 0) banner = null;
    }
    for (const p of particles) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= 1 - 1.5 * dt;
      p.vy *= 1 - 1.5 * dt;
      p.life -= dt;
    }
    particles = particles.filter((p) => p.life > 0);
    for (const f of floaters) {
      f.y -= 30 * dt;
      f.life -= dt;
    }
    floaters = floaters.filter((f) => f.life > 0);

    if (phase !== "play") return;

    vaqt += dt;
    invuln = Math.max(0, invuln - dt);
    timers.rain = Math.max(0, timers.rain - dt);
    timers.shield = Math.max(0, timers.shield - dt);
    timers.slow = Math.max(0, timers.slow - dt);
    const settings = current();
    const slow = timers.slow > 0 ? 0.35 : 1;

    // Ship movement
    const shipSpeed = 60 + settings.speed * 30;
    let dx = 0;
    let dy = 0;
    if (input.left || input.holdLeft) dx -= 1;
    if (input.right || input.holdRight) dx += 1;
    if (input.up) dy -= 1;
    if (input.down) dy += 1;
    if (dx === 0 && dy === 0 && input.pointer) {
      const px = input.pointer.x - shipX;
      const py = input.pointer.y - shipY;
      const dist = Math.hypot(px, py);
      if (dist > 4) {
        const step = Math.min(1, dist / (shipSpeed * dt));
        dx = (px / dist) * step;
        dy = (py / dist) * step;
      }
    }
    shipX = clamp(shipX + dx * shipSpeed * dt, 22, W - 22);
    shipY = clamp(shipY + dy * shipSpeed * dt, H / 2 + 20, H - 32);
    tilt += (clamp(dx, -1, 1) * 0.25 - tilt) * Math.min(1, dt * 10);

    // Spawning
    asteroidTimer -= dt;
    if (asteroidTimer <= 0 && asteroids.length < settings.asteroidCount) {
      asteroids.push(makeAsteroid());
      asteroidTimer = rand(0.25, 0.7);
    }
    starTimer -= dt;
    if (starTimer <= 0 && stars.length < 40) {
      stars.push({
        x: rand(20, W - 20),
        y: -14,
        speed: rand(70, 110),
        phase: rand(0, Math.PI * 2),
        rot: rand(-0.3, 0.3),
      });
      starTimer = timers.rain > 0 ? rand(0.07, 0.14) : rand(1, 1.7);
    }

    // Asteroids
    const fall = (40 + settings.asteroidSpeed * 24) * slow;
    const canHit = !settings.invisible && timers.shield <= 0 && invuln <= 0;
    for (const a of asteroids) {
      a.y += fall * a.speed * dt;
      a.x += a.drift * slow * dt;
      a.rot += a.spin * slow * dt;
      if (a.x < a.r || a.x > W - a.r) a.drift = -a.drift;
    }
    const survivors: Asteroid[] = [];
    for (const a of asteroids) {
      if (a.y - a.r > H) continue;
      const hit = Math.hypot(a.x - shipX, a.y - shipY) < a.r * 0.85 + SHIP_R;
      if (hit && timers.shield > 0) {
        burst(a.x, a.y, ["#9fe7ff", "#ffffff", a.color], 18, 160);
        continue;
      }
      if (hit && canHit && invuln <= 0) {
        lives -= 1;
        invuln = 1;
        burst(a.x, a.y, ["#ff9233", "#ffd43b", a.color], 24, 180);
        if (lives <= 0) {
          lives = 0;
          gameOver();
        }
        continue;
      }
      survivors.push(a);
    }
    asteroids = survivors;

    // Stars
    for (const s of stars) {
      s.y += s.speed * slow * dt;
      s.phase += dt * 5;
    }
    stars = stars.filter((s) => {
      if (s.y > H + 14) return false;
      if (
        phase === "play" &&
        Math.hypot(s.x - shipX, s.y - shipY) < SHIP_R + 12
      ) {
        score += settings.points;
        floaters.push({
          x: s.x,
          y: s.y,
          text: `+${settings.points}`,
          life: 0.9,
        });
        burst(s.x, s.y, ["#ffd43b", "#fff3b0", "#ffffff"], 10, 110);
        return false;
      }
      return true;
    });

    reportScore();
  };

  /* ---------------- draw ---------------- */

  const drawOverlay = (title: string, lines: string[], big?: string) => {
    if (!ctx) return;
    ctx.fillStyle = "rgba(8, 12, 40, 0.6)";
    ctx.fillRect(0, 0, W, H);
    ctx.font = `bold 26px ${FONT}`;
    const titleLines = wrap(ctx, title, 420);
    ctx.font = `600 16px ${FONT}`;
    const sub = lines.flatMap((l) => wrap(ctx, l, 420));
    const h = 40 + titleLines.length * 32 + (big ? 52 : 0) + sub.length * 22;
    const w = 470;
    const x = (W - w) / 2;
    let y = (H - h) / 2;
    roundRect(ctx, x, y, w, h, 22);
    ctx.fillStyle = "rgba(30, 40, 96, 0.95)";
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#ffd43b";
    ctx.stroke();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    y += 34;
    ctx.fillStyle = "#ffffff";
    ctx.font = `bold 26px ${FONT}`;
    for (const l of titleLines) {
      ctx.fillText(l, W / 2, y);
      y += 32;
    }
    if (big) {
      ctx.font = `bold 34px ${FONT}`;
      const tw = ctx.measureText(big).width;
      ctx.fillStyle = "#ffd43b";
      starPath(ctx, W / 2 - tw / 2 - 20, y + 8, 14, 6, 0);
      ctx.fill();
      ctx.fillText(big, W / 2 + 12, y + 10);
      y += 52;
    }
    ctx.fillStyle = "#cfe0ff";
    ctx.font = `600 16px ${FONT}`;
    for (const l of sub) {
      ctx.fillText(l, W / 2, y);
      y += 22;
    }
  };

  const draw = () => {
    if (!ctx) return;
    const props = getProps();
    const settings = current();

    // Background
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, "#0b1033");
    g.addColorStop(1, "#1a1f5c");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    for (const s of bg) {
      ctx.globalAlpha = 0.35 + s.layer * 0.25;
      ctx.fillStyle = s.layer === 2 ? "#ffffff" : "#a9c4ff";
      ctx.fillRect(s.x, s.y, s.size, s.size);
    }
    ctx.globalAlpha = 1;

    // Stars
    for (const s of stars) {
      const tw = 1 + Math.sin(s.phase) * 0.15;
      ctx.save();
      ctx.shadowColor = "rgba(255, 212, 59, 0.8)";
      ctx.shadowBlur = 10;
      ctx.fillStyle = "#ffd43b";
      starPath(ctx, s.x, s.y, 11 * tw, 5 * tw, s.rot);
      ctx.fill();
      ctx.restore();
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      ctx.beginPath();
      ctx.arc(s.x - 2, s.y - 2, 2 * tw, 0, Math.PI * 2);
      ctx.fill();
    }

    // Asteroids
    for (const a of asteroids) drawAsteroid(ctx, a);

    // Ship
    if (phase !== "over") {
      const blinkHidden = invuln > 0 && Math.floor(invuln * 12) % 2 === 0;
      if (!blinkHidden) {
        ctx.save();
        if (settings.invisible)
          ctx.globalAlpha = 0.35 + Math.sin(clock * 6) * 0.15;
        drawShip(ctx, shipX, shipY, settings.color, clock, tilt);
        ctx.restore();
        if (settings.invisible) {
          ctx.save();
          ctx.globalAlpha = 0.5;
          ctx.strokeStyle = "#cdeeff";
          ctx.lineWidth = 1.5;
          for (let i = 0; i < 3; i++) {
            const yy = shipY - 20 + ((clock * 40 + i * 14) % 42);
            ctx.beginPath();
            ctx.moveTo(shipX - 12, yy);
            ctx.lineTo(shipX + 12, yy);
            ctx.stroke();
          }
          ctx.restore();
        }
      }
      if (timers.shield > 0) {
        const fading = timers.shield < 1.5 && Math.floor(clock * 8) % 2 === 0;
        ctx.save();
        ctx.globalAlpha = fading ? 0.35 : 0.8;
        const sg = ctx.createRadialGradient(shipX, shipY, 10, shipX, shipY, 34);
        sg.addColorStop(0, "rgba(120, 220, 255, 0)");
        sg.addColorStop(1, "rgba(120, 220, 255, 0.45)");
        ctx.fillStyle = sg;
        ctx.beginPath();
        ctx.arc(shipX, shipY, 32 + Math.sin(clock * 5) * 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#9fe7ff";
        ctx.lineWidth = 2.5;
        ctx.stroke();
        ctx.restore();
      }
    }

    // Particles and floaters
    for (const p of particles) {
      ctx.globalAlpha = clamp(p.life / p.max, 0, 1);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `bold 18px ${FONT}`;
    for (const f of floaters) {
      ctx.globalAlpha = clamp(f.life / 0.9, 0, 1);
      ctx.fillStyle = "#fff3b0";
      ctx.fillText(f.text, f.x, f.y);
    }
    ctx.globalAlpha = 1;

    // HUD
    ctx.fillStyle = "rgba(8, 12, 40, 0.55)";
    ctx.fillRect(0, 0, W, HUD);
    ctx.fillStyle = "#ffd43b";
    starPath(ctx, 22, HUD / 2, 11, 5, 0);
    ctx.fill();
    ctx.textAlign = "left";
    ctx.font = `bold 20px ${FONT}`;
    ctx.fillStyle = "#ffffff";
    ctx.fillText(String(score), 40, HUD / 2 + 1);
    const shownLives =
      phase === "start"
        ? Math.round(num(props.values.hayotlar, 3, 1, 99))
        : lives;
    ctx.fillStyle = "#ff5c7a";
    if (shownLives <= 6) {
      for (let i = 0; i < shownLives; i++) {
        heartPath(ctx, W - 20 - i * 26, 8, 18);
        ctx.fill();
      }
    } else {
      heartPath(ctx, W - 66, 8, 18);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.fillText(`× ${shownLives}`, W - 52, HUD / 2 + 1);
    }

    // Active cheat timers (small pills under the HUD)
    const active: [string, number, string][] = [];
    if (timers.shield > 0) active.push(["qalqon", timers.shield, "#9fe7ff"]);
    if (timers.slow > 0)
      active.push(["vaqtni_sekinlashtir", timers.slow, "#a47bff"]);
    if (timers.rain > 0)
      active.push(["yulduz_yomg'iri", timers.rain, "#ffd43b"]);
    ctx.font = `bold 12px ${FONT}`;
    let px = 10;
    for (const [name, left, color] of active) {
      const text = `${name} ${Math.ceil(left)}s`;
      const w = ctx.measureText(text).width + 16;
      roundRect(ctx, px, HUD + 6, w, 20, 10);
      ctx.fillStyle = "rgba(8, 12, 40, 0.7)";
      ctx.fill();
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillStyle = color;
      ctx.fillText(text, px + 8, HUD + 16);
      px += w + 6;
    }

    // Cheat banner
    if (banner) {
      const t = banner.life;
      const alpha = clamp(Math.min(t / 0.4, (1.8 - t) / 0.2 + 0.2), 0, 1);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.font = `bold 22px ${FONT}`;
      const text = `> ${banner.text}`;
      const w = ctx.measureText(text).width + 36;
      const y = 92 - (1.8 - t) * 12;
      roundRect(ctx, (W - w) / 2, y - 20, w, 40, 20);
      ctx.fillStyle = "rgba(61, 220, 132, 0.92)";
      ctx.fill();
      ctx.fillStyle = "#0b1033";
      ctx.textAlign = "center";
      ctx.fillText(text, W / 2, y + 1);
      ctx.restore();
    }

    // Overlays
    if (!props.running) drawOverlay(props.labels.paused, []);
    else if (phase === "start") drawOverlay(props.labels.start, []);
    else if (phase === "over")
      drawOverlay(props.labels.over, [props.labels.start], String(score));
  };

  /* ---------------- loop ---------------- */

  const updateAria = (dt: number) => {
    ariaTimer -= dt;
    if (ariaTimer > 0) return;
    ariaTimer = 0.5;
    const text = `Kosmik qochish o‘yini. Ochko: ${score}. Hayotlar: ${lives}.`;
    if (text !== ariaText) {
      ariaText = text;
      canvas.setAttribute("aria-label", text);
    }
  };

  const frame = (now: number) => {
    raf = 0;
    if (!running) return;
    const dt = last ? Math.min((now - last) / 1000, 0.05) : 0;
    last = now;
    update(dt);
    draw();
    updateAria(dt);
    raf = requestAnimationFrame(frame);
  };

  const startLoop = () => {
    if (raf || !running) return;
    last = 0;
    raf = requestAnimationFrame(frame);
  };

  const stopLoop = () => {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  };

  const resize = () => {
    if (!ctx) return;
    const width = wrapper.clientWidth || W;
    const height = (width * H) / W;
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    const pw = Math.round(width * dpr);
    const ph = Math.round(height * dpr);
    if (canvas.width !== pw || canvas.height !== ph) {
      canvas.width = pw;
      canvas.height = ph;
    }
    ctx.setTransform(pw / W, 0, 0, ph / H, 0, 0);
    draw();
  };

  resize();
  updateAria(0);
  startLoop();

  return {
    input,
    resize,
    phase: () => phase,
    restart,
    begin: () => {
      if (running && phase !== "play") restart();
    },
    cheat: (raw) => {
      const name = normalize(raw.trim());
      if (!isCheat(name)) return false;
      if (name === "portlash") {
        for (const a of asteroids)
          burst(a.x, a.y, ["#ff9233", "#ffd43b", "#ff5c5c", a.color], 16, 170);
        asteroids = [];
        asteroidTimer = 0.8;
      } else if (name === "qalqon") timers.shield = CHEATS.qalqon;
      else if (name === "vaqtni_sekinlashtir")
        timers.slow = CHEATS.vaqtni_sekinlashtir;
      else timers.rain = CHEATS["yulduz_yomg'iri"];
      banner = { text: name, life: 1.8 };
      if (!running) draw();
      return true;
    },
    setRunning: (next) => {
      running = next;
      if (next) startLoop();
      else {
        stopLoop();
        draw();
      }
    },
    destroy: stopLoop,
  };
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export function SpaceGame(props: GameProps) {
  const { ref, running, labels } = props;
  const propsRef = useRef(props);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Engine | null>(null);

  useEffect(() => {
    propsRef.current = props;
  });

  useImperativeHandle(
    ref,
    (): GameApi => ({
      cheat: (name: string) => engineRef.current?.cheat(name) ?? false,
      restart: () => engineRef.current?.restart(),
    }),
    [],
  );

  // Engine lifetime
  useEffect(() => {
    const canvas = canvasRef.current;
    const wrapper = wrapperRef.current;
    if (!canvas || !wrapper) return;
    const engine = createEngine(canvas, wrapper, () => propsRef.current);
    engineRef.current = engine;
    const input = engine.input;

    const observer = new ResizeObserver(() => engine.resize());
    observer.observe(wrapper);
    const media = window.matchMedia(
      `(resolution: ${window.devicePixelRatio}dppx)`,
    );
    const onDpr = () => engine.resize();
    media.addEventListener("change", onDpr);

    const setKey = (code: string, key: string, down: boolean) => {
      switch (code || key) {
        case "ArrowLeft":
        case "KeyA":
          input.left = down;
          return true;
        case "ArrowRight":
        case "KeyD":
          input.right = down;
          return true;
        case "ArrowUp":
        case "KeyW":
          input.up = down;
          return true;
        case "ArrowDown":
        case "KeyS":
          input.down = down;
          return true;
        default:
          return false;
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (isTextField(e.target) || e.ctrlKey || e.metaKey || e.altKey) return;
      if (setKey(e.code, e.key, true)) {
        if (e.key.startsWith("Arrow")) e.preventDefault();
        return;
      }
      if (e.code === "Space" || e.key === "Enter") {
        if (isControl(e.target)) return;
        if (e.code === "Space") e.preventDefault();
        if (!e.repeat) engine.begin();
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      setKey(e.code, e.key, false);
    };
    const onBlur = () => {
      input.left = input.right = input.up = input.down = false;
      input.holdLeft = input.holdRight = false;
      input.pointer = null;
    };

    // Pointer on the canvas: tap starts, drag steers.
    const toLogical = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: ((e.clientX - rect.left) / rect.width) * W,
        y: ((e.clientY - rect.top) / rect.height) * H,
      };
    };
    const onPointerDown = (e: PointerEvent) => {
      if (engine.phase() !== "play") {
        engine.begin();
        return;
      }
      canvas.setPointerCapture(e.pointerId);
      input.pointer = toLogical(e);
    };
    const onPointerMove = (e: PointerEvent) => {
      if (input.pointer) input.pointer = toLogical(e);
    };
    const onPointerUp = () => {
      input.pointer = null;
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);
    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointercancel", onPointerUp);

    return () => {
      engine.destroy();
      engineRef.current = null;
      observer.disconnect();
      media.removeEventListener("change", onDpr);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointercancel", onPointerUp);
    };
  }, []);

  useEffect(() => {
    engineRef.current?.setRunning(running);
  }, [running]);

  const hold = (side: "holdLeft" | "holdRight") => ({
    onPointerDown: (e: React.PointerEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.currentTarget.setPointerCapture(e.pointerId);
      const engine = engineRef.current;
      if (!engine) return;
      if (engine.phase() !== "play") engine.begin();
      engine.input[side] = true;
    },
    onPointerUp: () => {
      if (engineRef.current) engineRef.current.input[side] = false;
    },
    onPointerCancel: () => {
      if (engineRef.current) engineRef.current.input[side] = false;
    },
    onLostPointerCapture: () => {
      if (engineRef.current) engineRef.current.input[side] = false;
    },
    onContextMenu: (e: React.MouseEvent) => e.preventDefault(),
  });

  return (
    <div className="kids-space-game">
      <div className="kids-space-stage" ref={wrapperRef}>
        <canvas
          ref={canvasRef}
          className="kids-space-canvas"
          role="img"
          aria-label="Kosmik qochish o‘yini"
        />
      </div>
      <div className="kids-space-pad">
        <button
          type="button"
          className="kids-space-btn"
          aria-label="Chapga"
          {...hold("holdLeft")}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M15 5 8 12l7 7" />
          </svg>
        </button>
        <p className="kids-space-controls">{labels.controls}</p>
        <button
          type="button"
          className="kids-space-btn"
          aria-label="O‘ngga"
          {...hold("holdRight")}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="m9 5 7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
