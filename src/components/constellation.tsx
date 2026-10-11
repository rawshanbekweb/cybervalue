"use client";

import { useEffect, useRef } from "react";

// Design.MD's signature visual: outlined triangular particles in vivid colours,
// a dense cloud on the right of the hero with sparse ambient ones around it.
// On load the particles gather from a scatter, the cloud then turns slowly in
// depth and parts around the pointer. Purely decorative, so it is aria-hidden
// and draws a still frame when the visitor prefers reduced motion.
const COLORS = [
  "#8052ff",
  "#a68bff",
  "#ffb829",
  "#1fb99a",
  "#ff5fd2",
  "#4f8bff",
];
const GATHER_MS = 1600;
const TURN_SPEED = 0.12; // radians per second
const POINTER_RADIUS = 120;
const POINTER_PUSH = 28;

type Particle = {
  // Cloud particles orbit (cx, cy) using dx and a depth dz; ambient ones only
  // drift around their (x, y).
  x: number;
  y: number;
  dx: number;
  dz: number;
  inCloud: boolean;
  startX: number;
  startY: number;
  delay: number;
  pushX: number;
  pushY: number;
  size: number;
  angle: number;
  spin: number;
  phase: number;
  drift: number;
  color: string;
  alpha: number;
};

type Field = { cx: number; rx: number; particles: Particle[] };

function seeded(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

function makeField(width: number, height: number): Field {
  const random = seeded(7);
  const compact = width < 850;
  const cloudCount = compact ? 110 : 620;
  const ambientCount = compact ? 30 : 90;
  // On wide screens the cloud fills the right half of the hero; on phones it
  // tucks into the top right corner so it stays clear of the headline.
  const cx = compact ? width * 0.92 : width * 0.76;
  const cy = compact ? height * 0.07 : height * 0.46;
  const rx = compact ? width * 0.26 : Math.min(width * 0.25, 430);
  const ry = compact ? height * 0.07 : Math.min(height * 0.42, 340);
  const particles: Particle[] = [];
  for (let i = 0; i < cloudCount + ambientCount; i++) {
    const inCloud = i < cloudCount;
    let x: number;
    let y: number;
    let dz = 0;
    if (inCloud) {
      // Two overlapping lobes with a soft edge read as an organic, brain-like
      // cloud rather than a perfect ellipse.
      const lobe = random() < 0.5 ? -1 : 1;
      const t = random() * Math.PI * 2;
      const r = Math.sqrt(random()) * (0.75 + random() * 0.3);
      x = cx + lobe * rx * 0.28 + Math.cos(t) * r * rx * 0.78;
      y = cy + Math.sin(t) * r * ry * (lobe < 0 ? 0.95 : 0.8);
      dz = (random() - 0.5) * rx * 1.1;
    } else {
      x = random() * width;
      y = random() * height;
    }
    particles.push({
      x,
      y,
      dx: x - cx,
      dz,
      inCloud,
      startX: x + (random() - 0.5) * width * 0.9,
      startY: y + (random() - 0.5) * height * 0.9,
      delay: random() * 500,
      pushX: 0,
      pushY: 0,
      size: inCloud ? 2 + random() * 4.5 : 2 + random() * 3,
      angle: random() * Math.PI * 2,
      spin: (random() - 0.5) * 0.004,
      phase: random() * Math.PI * 2,
      drift: 2 + random() * 5,
      color: COLORS[Math.floor(random() * COLORS.length)],
      alpha: !inCloud || compact ? 0.2 + random() * 0.3 : 0.45 + random() * 0.5,
    });
  }
  return { cx, rx, particles };
}

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

export function Constellation({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finePointer = window.matchMedia("(pointer: fine)");
    let field: Field = { cx: 0, rx: 1, particles: [] };
    let frame = 0;
    let visible = true;
    let started = -1;
    let gathered = still.matches;
    const pointer = { x: -9999, y: -9999 };

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      const { width, height } = canvas.getBoundingClientRect();
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      field = makeField(width, height);
      if (still.matches) draw(0);
    };

    const draw = (time: number) => {
      const { width, height } = canvas.getBoundingClientRect();
      const t = time / 1000;
      const turn = t * TURN_SPEED;
      const cos = Math.cos(turn);
      const sin = Math.sin(turn);
      if (started < 0) started = time;
      context.clearRect(0, 0, width, height);
      context.lineWidth = 1.1;
      let pending = false;
      for (const p of field.particles) {
        let x = p.x;
        let y = p.y;
        let depth = 1;
        if (p.inCloud) {
          // Turn around a vertical axis; nearer particles grow and brighten.
          const z = p.dx * sin + p.dz * cos;
          x = field.cx + p.dx * cos - p.dz * sin;
          depth = 1 + (z / field.rx) * 0.35;
        }
        x += Math.cos(t * 0.3 + p.phase) * p.drift;
        y += Math.sin(t * 0.4 + p.phase) * p.drift;

        if (!gathered) {
          const progress = Math.min(
            1,
            Math.max(0, (time - started - p.delay) / GATHER_MS),
          );
          if (progress < 1) pending = true;
          const eased = easeOut(progress);
          x = p.startX + (x - p.startX) * eased;
          y = p.startY + (y - p.startY) * eased;
        }

        const distX = x - pointer.x;
        const distY = y - pointer.y;
        const distance = Math.hypot(distX, distY);
        let targetX = 0;
        let targetY = 0;
        if (distance < POINTER_RADIUS && distance > 0.1) {
          const force =
            Math.pow(1 - distance / POINTER_RADIUS, 2) * POINTER_PUSH;
          targetX = (distX / distance) * force;
          targetY = (distY / distance) * force;
        }
        p.pushX += (targetX - p.pushX) * 0.12;
        p.pushY += (targetY - p.pushY) * 0.12;
        x += p.pushX;
        y += p.pushY;

        const size = p.size * Math.max(0.6, depth);
        const a = p.angle + time * p.spin * 0.06;
        context.globalAlpha = Math.min(
          1,
          p.alpha * depth * (0.7 + 0.3 * Math.sin(t * 0.8 + p.phase)),
        );
        context.strokeStyle = p.color;
        context.beginPath();
        for (let k = 0; k < 3; k++) {
          const corner = a + (k * Math.PI * 2) / 3;
          const px = x + Math.cos(corner) * size;
          const py = y + Math.sin(corner) * size;
          if (k === 0) context.moveTo(px, py);
          else context.lineTo(px, py);
        }
        context.closePath();
        context.stroke();
      }
      if (!gathered && !pending && field.particles.length > 0) gathered = true;
      context.globalAlpha = 1;
    };

    const loop = (time: number) => {
      draw(time);
      frame = requestAnimationFrame(loop);
    };
    const sync = () => {
      cancelAnimationFrame(frame);
      if (still.matches) {
        gathered = true;
        draw(0);
      } else if (visible) frame = requestAnimationFrame(loop);
    };
    const track = (event: PointerEvent) => {
      if (!finePointer.matches) return;
      const rect = canvas.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
    };
    const release = () => {
      pointer.x = -9999;
      pointer.y = -9999;
    };

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
    const resizer = new ResizeObserver(resize);
    observer.observe(canvas);
    resizer.observe(canvas);
    still.addEventListener("change", sync);
    window.addEventListener("pointermove", track, { passive: true });
    document.documentElement.addEventListener("pointerleave", release);
    resize();
    sync();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      resizer.disconnect();
      still.removeEventListener("change", sync);
      window.removeEventListener("pointermove", track);
      document.documentElement.removeEventListener("pointerleave", release);
    };
  }, []);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
