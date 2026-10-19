"use client";

import { useEffect, useImperativeHandle, useRef } from "react";
import { COLORS, effective, normalize, type Value } from "@/lib/kids/lang";
import type { GameApi, GameProps } from "./game-types";
import "./space-game.css";

// Kiber-qo'riqchi: attacks come down at the server. The child's code switches
// the defences on (a long password, two-step sign-in, a firewall, updates, an
// antivirus); phishing letters have to be caught by tapping them, while real
// letters are let through.

const W = 640;
const H = 400;
const HUD = 34;
const SERVER = { x: W / 2, y: H - 46 };
const SHIELD_R = 78;
const DECOY = { x: 70, y: H - 70 };
const FONT = '"Segoe UI", system-ui, Arial, sans-serif';

const CHEATS = {
  fishing_radar: 10,
  honeypot: 8,
  sekin_internet: 6,
  yamoq: 0,
} as const;
type CheatName = keyof typeof CHEATS;
const isCheat = (name: string): name is CheatName => name in CHEATS;

type Phase = "start" | "play" | "over";
type Kind = "parol" | "skaner" | "eski" | "virus";

// Labels and letters are English source text, translated when drawn.
const KINDS: Record<Kind, { color: string; label: string }> = {
  parol: { color: "#ff9233", label: "password cracker" },
  skaner: { color: "#a47bff", label: "scanner" },
  eski: { color: "#ff5c5c", label: "old hole" },
  virus: { color: "#3ddc84", label: "virus" },
};

const PHISHING = [
  "You won an iPhone! Click the link",
  "Send your password or your account will be closed",
  "Free coins! Type your card number",
  "From the bank: tell us the SMS code",
  "Click quickly: your gift is waiting!",
  "Admin: confirm your login and password",
];
const REAL = [
  "Teacher: tomorrow's lesson is at 9",
  "Mum: come home for lunch",
  "School: the celebration is on Friday",
  "My friend: coming out to play football?",
  "Library: your book is ready",
];

type Bot = { x: number; y: number; kind: Kind; speed: number; wobble: number };
type Letter = {
  x: number;
  y: number;
  w: number;
  text: string;
  phish: boolean;
  speed: number;
};
type Shot = { x: number; y: number; life: number };
type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
};
type Floater = {
  x: number;
  y: number;
  text: string;
  life: number;
  color: string;
};

type Settings = {
  password: number;
  mfa: boolean;
  firewall: boolean;
  updates: boolean;
  antivirus: number;
  speed: number;
  color: string;
};

type Engine = {
  cheat: (name: string) => boolean;
  restart: () => void;
  begin: () => void;
  tap: (x: number, y: number) => void;
  markLowest: () => void;
  setRunning: (running: boolean) => void;
  resize: () => void;
  phase: () => Phase;
  destroy: () => void;
};

const rand = (min: number, max: number) => min + Math.random() * (max - min);
const pick = <T,>(list: T[]) => list[Math.floor(Math.random() * list.length)];
const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v));

function num(v: Value | undefined, fallback: number, min: number, max: number) {
  const n = typeof v === "number" && Number.isFinite(v) ? v : fallback;
  return clamp(n, min, max);
}

function readSettings(v: Record<string, Value>): Settings {
  const name = typeof v.qalqon_rangi === "string" ? v.qalqon_rangi : "";
  return {
    password: num(v.parol_uzunligi, 6, 4, 20),
    mfa: v.ikki_bosqichli === true,
    firewall: v.firewall === true,
    updates: v.yangilanishlar === true,
    antivirus: num(v.antivirus_kuchi, 2, 1, 10),
    speed: num(v.hujum_tezligi, 4, 1, 10),
    color: COLORS[name] ?? COLORS["ko'k"],
  };
}

/** Whether the defences stop a bot at the shield. Viruses need the antivirus. */
function stops(kind: Kind, s: Settings) {
  if (kind === "parol") return s.mfa || s.password >= 12;
  if (kind === "skaner") return s.firewall;
  if (kind === "eski") return s.updates;
  return false;
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

function createEngine(
  canvas: HTMLCanvasElement,
  wrapper: HTMLElement,
  getProps: () => GameProps,
): Engine {
  const ctx = canvas.getContext("2d");
  const t: GameProps["t"] = (source, values) => getProps().t(source, values);
  let phase: Phase = "start";
  let running = getProps().running;
  let raf = 0;
  let last = 0;
  let clock = 0;

  let score = 0;
  let reported = -1;
  let lives = 5;
  let vaqt = 0;
  let shake = 0;
  let botTimer = 1.2;
  let letterTimer = 2;
  let turretTimer = 0;
  const timers = { radar: 0, honeypot: 0, slow: 0 };
  let bots: Bot[] = [];
  let letters: Letter[] = [];
  let shots: Shot[] = [];
  let particles: Particle[] = [];
  let floaters: Floater[] = [];
  let banner: { text: string; life: number } | null = null;
  let ariaText = "";
  let ariaTimer = 0;
  let overrides: Record<string, Value> = {};
  let started = false;

  const live = () => ({
    ochko: score,
    hayotlar: lives,
    vaqt: Math.floor(vaqt),
  });
  const merged = () => {
    const p = getProps();
    return effective({ ...p.values, ...overrides }, p.rules, live());
  };
  const current = () => readSettings(merged());

  const emit = (event: string) => {
    const fired = getProps().fire(event, merged(), {
      ochko: score,
      hayotlar: lives,
    });
    if (!fired) return;
    score = fired.ochko;
    lives = fired.hayotlar;
    overrides = { ...overrides, ...fired.set };
    if (fired.say) banner = { text: fired.say, life: 2.2 };
  };

  const burst = (x: number, y: number, color: string, count = 14) => {
    for (let i = 0; i < count; i++) {
      const a = rand(0, Math.PI * 2);
      const s = rand(40, 160);
      particles.push({
        x,
        y,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s,
        life: rand(0.3, 0.7),
        color,
      });
    }
    if (particles.length > 300) particles = particles.slice(-300);
  };

  const float = (x: number, y: number, text: string, color = "#fff3b0") =>
    floaters.push({ x, y, text, life: 0.9, color });

  const report = () => {
    if (score !== reported) {
      reported = score;
      getProps().onScore(score);
    }
  };

  const restart = () => {
    const p = getProps();
    phase = "play";
    overrides = {};
    started = false;
    score = 0;
    vaqt = 0;
    lives = Math.round(num(p.values.hayotlar, 5, 1, 99));
    bots = [];
    letters = [];
    shots = [];
    particles = [];
    floaters = [];
    botTimer = 1.2;
    letterTimer = 2;
    timers.radar = 0;
    timers.honeypot = 0;
    timers.slow = 0;
    report();
    if (!running) draw();
  };

  const hurt = (text: string) => {
    lives = Math.max(0, lives - 1);
    shake = 0.3;
    burst(SERVER.x, SERVER.y - 10, "#ff5c5c", 18);
    banner = { text, life: 1.8 };
    emit("urilsa");
    if (lives <= 0) {
      lives = 0;
      phase = "over";
      getProps().onOver(score);
    }
  };

  const repelled = (x: number, y: number, color: string) => {
    score += 5;
    burst(x, y, color);
    float(x, y - 10, "+5");
    emit("hujum_qaytarildi");
  };

  const judge = (letter: Letter) => {
    letters = letters.filter((l) => l !== letter);
    if (letter.phish) {
      score += 10;
      burst(letter.x, letter.y, "#3ddc84");
      float(letter.x, letter.y - 14, "+10", "#3ddc84");
      emit("fishing_ushlandi");
    } else {
      score = Math.max(0, score - 5);
      float(letter.x, letter.y - 14, "-5", "#ff5c5c");
      banner = { text: t("That was a real letter!"), life: 1.8 };
    }
    report();
  };

  const update = (dt: number) => {
    clock += dt;
    shake = Math.max(0, shake - dt);
    if (banner) {
      banner.life -= dt;
      if (banner.life <= 0) banner = null;
    }
    for (const p of particles) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
    }
    particles = particles.filter((p) => p.life > 0);
    for (const f of floaters) {
      f.y -= 28 * dt;
      f.life -= dt;
    }
    floaters = floaters.filter((f) => f.life > 0);
    for (const s of shots) s.life -= dt;
    shots = shots.filter((s) => s.life > 0);
    if (phase !== "play") return;
    if (!started) {
      started = true;
      emit("boshlanganda");
    }

    vaqt += dt;
    timers.radar = Math.max(0, timers.radar - dt);
    timers.honeypot = Math.max(0, timers.honeypot - dt);
    timers.slow = Math.max(0, timers.slow - dt);
    const s = current();
    const slow = timers.slow > 0 ? 0.35 : 1;

    // New attacks and letters
    botTimer -= dt * slow;
    if (botTimer <= 0 && bots.length < 12) {
      const kind = pick<Kind>(["parol", "skaner", "eski", "virus", "virus"]);
      bots.push({
        x: rand(30, W - 30),
        y: HUD + 6,
        kind,
        speed: rand(0.85, 1.15) * (26 + s.speed * 7),
        wobble: rand(0, Math.PI * 2),
      });
      botTimer = rand(1.6, 2.6) - s.speed * 0.1;
    }
    letterTimer -= dt * slow;
    if (letterTimer <= 0 && letters.length < 3) {
      const phish = Math.random() < 0.6;
      const text = t(phish ? pick(PHISHING) : pick(REAL));
      if (ctx) ctx.font = `bold 15px ${FONT}`;
      const w = Math.min(340, (ctx?.measureText(text).width ?? 200) + 44);
      letters.push({
        x: rand(w / 2 + 8, W - w / 2 - 8),
        y: HUD + 20,
        w,
        text,
        phish,
        speed: 18 + s.speed * 2.5,
      });
      letterTimer = rand(3, 4.5);
    }

    // Bots move to the server, or to the decoy while the honeypot is on
    const survivors: Bot[] = [];
    for (const b of bots) {
      const target = timers.honeypot > 0 ? DECOY : SERVER;
      const dx = target.x - b.x;
      const dy = target.y - b.y;
      const dist = Math.hypot(dx, dy);
      b.wobble += dt * 3;
      b.x += (dx / dist) * b.speed * slow * dt + Math.sin(b.wobble) * 12 * dt;
      b.y += (dy / dist) * b.speed * slow * dt;
      if (timers.honeypot > 0 && dist < 22) {
        repelled(b.x, b.y, "#ffd43b");
        continue;
      }
      if (timers.honeypot <= 0 && dist < SHIELD_R) {
        if (stops(b.kind, s)) repelled(b.x, b.y, s.color);
        else hurt(t("{name} got through!", { name: t(KINDS[b.kind].label) }));
        if (phase !== "play") return;
        continue;
      }
      survivors.push(b);
    }
    bots = survivors;

    // The antivirus fires at the nearest virus; stronger means faster
    turretTimer -= dt;
    if (turretTimer <= 0) {
      const target = bots
        .filter((b) => b.kind === "virus")
        .sort(
          (a, b) =>
            Math.hypot(a.x - SERVER.x, a.y - SERVER.y) -
            Math.hypot(b.x - SERVER.x, b.y - SERVER.y),
        )[0];
      if (
        target &&
        Math.hypot(target.x - SERVER.x, target.y - SERVER.y) < 300
      ) {
        shots.push({ x: target.x, y: target.y, life: 0.15 });
        bots = bots.filter((b) => b !== target);
        repelled(target.x, target.y, KINDS.virus.color);
        turretTimer = Math.max(0.3, 2.1 - s.antivirus * 0.18);
      } else turretTimer = 0.1;
    }

    // Letters that reach the server
    for (const l of [...letters]) {
      l.y += l.speed * slow * dt;
      if (l.y > SERVER.y - 40) {
        letters = letters.filter((x) => x !== l);
        if (l.phish) hurt(t("A phishing letter got through!"));
        else {
          score += 5;
          float(l.x, l.y - 10, "+5");
        }
        if (phase !== "play") return;
      }
    }
    report();
  };

  const drawBot = (b: Bot) => {
    if (!ctx) return;
    const { color, label } = KINDS[b.kind];
    ctx.save();
    ctx.translate(b.x, b.y);
    ctx.fillStyle = color;
    ctx.strokeStyle = "#0b0f1d";
    ctx.lineWidth = 2;
    if (b.kind === "virus") {
      ctx.beginPath();
      for (let i = 0; i < 16; i++) {
        const a = (i / 16) * Math.PI * 2 + clock;
        const r = i % 2 ? 9 : 14;
        ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.arc(0, 0, 13, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#0b0f1d";
      if (b.kind === "parol") {
        // a key
        ctx.beginPath();
        ctx.arc(-4, 0, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(-1, -1.5, 10, 3);
        ctx.fillRect(5, 0, 2, 4);
      } else if (b.kind === "skaner") {
        // an eye
        ctx.beginPath();
        ctx.ellipse(0, 0, 8, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(Math.sin(clock * 3) * 3, 0, 2.5, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // a bug
        ctx.fillRect(-5, -6, 10, 12);
        ctx.fillRect(-9, -3, 18, 2);
        ctx.fillRect(-9, 2, 18, 2);
      }
    }
    ctx.font = `bold 10px ${FONT}`;
    ctx.textAlign = "center";
    ctx.fillStyle = "#e6e9ff";
    ctx.fillText(t(label), 0, 26);
    ctx.restore();
  };

  const drawLetter = (l: Letter) => {
    if (!ctx) return;
    const radar = timers.radar > 0 && l.phish;
    const x = l.x - l.w / 2;
    const y = l.y - 16;
    roundRect(ctx, x, y, l.w, 32, 8);
    ctx.fillStyle = "#f4f4f6";
    ctx.fill();
    ctx.lineWidth = radar ? 3 : 1.5;
    ctx.strokeStyle = radar ? "#ff5c5c" : "#8c8ba3";
    ctx.stroke();
    // envelope
    ctx.fillStyle = radar ? "#ff5c5c" : "#4da3ff";
    ctx.fillRect(x + 8, y + 9, 20, 14);
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x + 8, y + 9);
    ctx.lineTo(x + 18, y + 17);
    ctx.lineTo(x + 28, y + 9);
    ctx.stroke();
    ctx.fillStyle = "#14141c";
    ctx.font = `bold 15px ${FONT}`;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(l.text, x + 36, l.y + 1, l.w - 44);
  };

  const drawServer = (s: Settings) => {
    if (!ctx) return;
    // shield ring
    ctx.save();
    ctx.globalAlpha = 0.25 + Math.sin(clock * 3) * 0.08;
    ctx.strokeStyle = s.color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(SERVER.x, SERVER.y, SHIELD_R, Math.PI, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
    // tower
    const x = SERVER.x - 26;
    const y = SERVER.y - 34;
    roundRect(ctx, x, y, 52, 64, 6);
    ctx.fillStyle = "#26304f";
    ctx.fill();
    ctx.strokeStyle = s.color;
    ctx.lineWidth = 2.5;
    ctx.stroke();
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = "#11162a";
      ctx.fillRect(x + 8, y + 8 + i * 16, 36, 10);
      ctx.fillStyle = (Math.floor(clock * 3) + i) % 2 ? "#3ddc84" : "#1f7a4a";
      ctx.fillRect(x + 36, y + 11 + i * 16, 4, 4);
    }
    // defences in force, bottom left
    const pills: [string, boolean][] = [
      [t("password: {length}", { length: s.password }), s.password >= 12],
      [t("2-step"), s.mfa],
      ["firewall", s.firewall],
      [t("updated"), s.updates],
      [`antivirus: ${s.antivirus}`, s.antivirus >= 8],
    ];
    ctx.font = `bold 11px ${FONT}`;
    ctx.textBaseline = "middle";
    let py = H - 14;
    for (const [text, on] of pills.reverse()) {
      const w = ctx.measureText(text).width + 22;
      roundRect(ctx, W - w - 8, py - 9, w, 18, 9);
      ctx.fillStyle = on ? "rgba(61,220,132,0.18)" : "rgba(255,92,92,0.16)";
      ctx.fill();
      ctx.fillStyle = on ? "#3ddc84" : "#ff8a8a";
      ctx.textAlign = "left";
      ctx.fillText(`${on ? "✓" : "✗"} ${text}`, W - w, py);
      py -= 22;
    }
    if (timers.honeypot > 0) {
      ctx.fillStyle = "#ffd43b";
      ctx.beginPath();
      ctx.arc(DECOY.x, DECOY.y, 16 + Math.sin(clock * 8) * 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#0b0f1d";
      ctx.font = `bold 10px ${FONT}`;
      ctx.textAlign = "center";
      ctx.fillText("honeypot", DECOY.x, DECOY.y + 28);
    }
  };

  const drawOverlay = (title: string, sub: string[], big?: string) => {
    if (!ctx) return;
    ctx.fillStyle = "rgba(6, 8, 20, 0.6)";
    ctx.fillRect(0, 0, W, H);
    const h = 80 + (big ? 44 : 0) + sub.length * 22;
    roundRect(ctx, W / 2 - 230, H / 2 - h / 2, 460, h, 18);
    ctx.fillStyle = "rgba(24, 30, 60, 0.96)";
    ctx.fill();
    ctx.strokeStyle = "#3ddc84";
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    let y = H / 2 - h / 2 + 36;
    ctx.fillStyle = "#ffffff";
    ctx.font = `bold 22px ${FONT}`;
    ctx.fillText(title, W / 2, y, 420);
    y += 36;
    if (big) {
      ctx.fillStyle = "#ffd43b";
      ctx.font = `bold 32px ${FONT}`;
      ctx.fillText(big, W / 2, y);
      y += 44;
    }
    ctx.fillStyle = "#cfe0ff";
    ctx.font = `600 15px ${FONT}`;
    for (const line of sub) {
      ctx.fillText(line, W / 2, y, 420);
      y += 22;
    }
  };

  function draw() {
    if (!ctx) return;
    const props = getProps();
    const s = current();
    ctx.save();
    if (shake > 0)
      ctx.translate(rand(-4, 4) * shake * 3, rand(-4, 4) * shake * 3);
    ctx.fillStyle = "#0b0f1d";
    ctx.fillRect(-10, -10, W + 20, H + 20);
    ctx.strokeStyle = "rgba(77,163,255,0.08)";
    ctx.lineWidth = 1;
    for (let x = 0; x <= W; x += 32) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    }
    for (let y = (clock * 12) % 32; y <= H; y += 32) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }
    drawServer(s);
    for (const shot of shots) {
      ctx.strokeStyle = `rgba(61,220,132,${shot.life / 0.15})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(SERVER.x, SERVER.y - 34);
      ctx.lineTo(shot.x, shot.y);
      ctx.stroke();
    }
    for (const b of bots) drawBot(b);
    for (const l of letters) drawLetter(l);
    for (const p of particles) {
      ctx.globalAlpha = clamp(p.life / 0.5, 0, 1);
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x - 2, p.y - 2, 4, 4);
    }
    ctx.globalAlpha = 1;
    ctx.font = `bold 17px ${FONT}`;
    ctx.textAlign = "center";
    for (const f of floaters) {
      ctx.globalAlpha = clamp(f.life / 0.9, 0, 1);
      ctx.fillStyle = f.color;
      ctx.fillText(f.text, f.x, f.y);
    }
    ctx.globalAlpha = 1;
    ctx.restore();

    // HUD
    ctx.fillStyle = "rgba(8, 12, 30, 0.75)";
    ctx.fillRect(0, 0, W, HUD);
    ctx.textBaseline = "middle";
    ctx.textAlign = "left";
    ctx.font = `bold 18px ${FONT}`;
    ctx.fillStyle = "#ffd43b";
    ctx.fillText(`★ ${score}`, 12, HUD / 2 + 1);
    const shown =
      phase === "start"
        ? Math.round(num(props.values.hayotlar, 5, 1, 99))
        : lives;
    ctx.textAlign = "right";
    ctx.fillStyle = "#ff7a9a";
    ctx.fillText(
      `server: ${"■".repeat(Math.min(shown, 10))}${shown > 10 ? ` ${shown}` : ""}`,
      W - 12,
      HUD / 2 + 1,
    );
    const active: [string, number][] = [];
    if (timers.radar > 0) active.push(["fishing_radar", timers.radar]);
    if (timers.honeypot > 0) active.push(["honeypot", timers.honeypot]);
    if (timers.slow > 0) active.push(["sekin_internet", timers.slow]);
    ctx.font = `bold 12px ${FONT}`;
    ctx.textAlign = "center";
    active.forEach(([name, left], i) => {
      ctx.fillStyle = "#3ddc84";
      ctx.fillText(`${name} ${Math.ceil(left)}s`, W / 2, HUD + 14 + i * 16);
    });
    if (banner) {
      ctx.save();
      ctx.globalAlpha = clamp(banner.life / 0.4, 0, 1);
      ctx.font = `bold 20px ${FONT}`;
      const w = ctx.measureText(banner.text).width + 36;
      roundRect(ctx, (W - w) / 2, 76, w, 38, 19);
      ctx.fillStyle = "rgba(61, 220, 132, 0.94)";
      ctx.fill();
      ctx.fillStyle = "#0b0f1d";
      ctx.fillText(banner.text, W / 2, 96);
      ctx.restore();
    }
    if (!props.running) drawOverlay(props.labels.paused, []);
    else if (phase === "start")
      drawOverlay(props.labels.start, [props.labels.controls]);
    else if (phase === "over")
      drawOverlay(props.labels.over, [props.labels.start], String(score));
  }

  const frame = (now: number) => {
    raf = 0;
    if (!running) return;
    const dt = last ? Math.min((now - last) / 1000, 0.05) : 0;
    last = now;
    update(dt);
    draw();
    ariaTimer -= dt;
    if (ariaTimer <= 0) {
      ariaTimer = 0.5;
      const text = t(
        "Cyber Guard game. Score: {score}. Server lives: {lives}. {letters} letters on screen.",
        { score, lives, letters: letters.length },
      );
      if (text !== ariaText) {
        ariaText = text;
        canvas.setAttribute("aria-label", text);
      }
    }
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
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    const pw = Math.round(width * dpr);
    const ph = Math.round(((width * H) / W) * dpr);
    if (canvas.width !== pw || canvas.height !== ph) {
      canvas.width = pw;
      canvas.height = ph;
    }
    ctx.setTransform(pw / W, 0, 0, ph / H, 0, 0);
    draw();
  };

  resize();
  startLoop();

  return {
    resize,
    phase: () => phase,
    restart,
    begin: () => {
      if (running && phase !== "play") restart();
    },
    tap: (x, y) => {
      if (phase !== "play") return;
      const hit = [...letters]
        .reverse()
        .find(
          (l) => Math.abs(x - l.x) <= l.w / 2 + 4 && Math.abs(y - l.y) <= 20,
        );
      if (hit) judge(hit);
    },
    markLowest: () => {
      if (phase !== "play") return;
      const lowest = [...letters].sort((a, b) => b.y - a.y)[0];
      if (lowest) judge(lowest);
    },
    cheat: (raw) => {
      const name = normalize(raw.trim());
      if (!isCheat(name) || phase !== "play") return false;
      if (name === "yamoq") {
        for (const b of bots) burst(b.x, b.y, KINDS[b.kind].color, 8);
        bots = [];
      } else if (name === "fishing_radar") timers.radar = CHEATS.fishing_radar;
      else if (name === "honeypot") timers.honeypot = CHEATS.honeypot;
      else timers.slow = CHEATS.sekin_internet;
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

export function GuardGame(props: GameProps) {
  const { ref, running, labels, t } = props;
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

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrapper = wrapperRef.current;
    if (!canvas || !wrapper) return;
    const engine = createEngine(canvas, wrapper, () => propsRef.current);
    engineRef.current = engine;
    const observer = new ResizeObserver(() => engine.resize());
    observer.observe(wrapper);

    const typing = (target: EventTarget | null) =>
      target instanceof HTMLElement &&
      (target.isContentEditable ||
        ["INPUT", "TEXTAREA", "SELECT", "BUTTON", "A"].includes(
          target.tagName,
        ));
    const onKeyDown = (e: KeyboardEvent) => {
      if (typing(e.target) || e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.code === "KeyF") {
        if (engine.phase() === "play") engine.markLowest();
        return;
      }
      if (e.code === "Space" || e.key === "Enter") {
        if (e.code === "Space") e.preventDefault();
        if (!e.repeat) engine.begin();
      }
    };
    const onPointerDown = (e: PointerEvent) => {
      if (engine.phase() !== "play") {
        engine.begin();
        return;
      }
      const rect = canvas.getBoundingClientRect();
      engine.tap(
        ((e.clientX - rect.left) / rect.width) * W,
        ((e.clientY - rect.top) / rect.height) * H,
      );
    };
    window.addEventListener("keydown", onKeyDown);
    canvas.addEventListener("pointerdown", onPointerDown);
    return () => {
      engine.destroy();
      engineRef.current = null;
      observer.disconnect();
      window.removeEventListener("keydown", onKeyDown);
      canvas.removeEventListener("pointerdown", onPointerDown);
    };
  }, []);

  useEffect(() => {
    engineRef.current?.setRunning(running);
  }, [running]);

  return (
    <div className="kids-space-game">
      <div className="kids-space-stage kids-guard-stage" ref={wrapperRef}>
        <canvas
          ref={canvasRef}
          className="kids-space-canvas"
          role="img"
          aria-label={t("Cyber Guard game")}
        />
      </div>
      <div className="kids-space-pad">
        <p className="kids-space-controls">{labels.controls}</p>
        <button
          type="button"
          className="kids-button kids-button-small"
          onClick={() => {
            const engine = engineRef.current;
            if (!engine) return;
            if (engine.phase() !== "play") engine.begin();
            else engine.markLowest();
          }}
        >
          {labels.mark ?? t("Phishing!")}
        </button>
      </div>
    </div>
  );
}
