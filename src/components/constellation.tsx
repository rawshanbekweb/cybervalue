"use client";

import { useEffect, useRef } from "react";

// Design.MD's signature visual: outlined triangular particles in vivid colours
// that gather from a scatter into the author's portrait (targets from
// scripts/portrait-points.ts). On wide screens the bust stands right of the
// headline; on narrower ones it sits below the actions, in space the hero
// reserves for it. The field then breathes and parts around the pointer, or
// around a tap on touch screens. Purely decorative, so it is aria-hidden and
// draws a still frame when the visitor prefers reduced motion.
const ACCENTS = ["#ffb829", "#1fb99a", "#ff5fd2", "#4f8bff"];
const COLORS = ["#8052ff", "#a68bff", ...ACCENTS];
const GATHER_MS = 1800;
const POINTER_RADIUS = 110;
const POINTER_PUSH = 26;
const ALPHA_STEPS = 6; // particles are batched per colour and alpha step
const TAP_MS = 700; // how long a tap keeps the particles parted
// Must match the space .cv-hero reserves below the actions on narrow screens.
const STACKED_MAX = 420;
const STACKED_SHARE = 0.9;
const FACE_LIMIT = 520; // portrait y (0–999) where the face ends and the body starts

type PortraitData = { aspect: number; points: number[] };

type Particle = {
  x: number;
  y: number;
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
  color: number;
  alpha: number;
  twinkle: number;
};

function seeded(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

function particle(
  random: () => number,
  width: number,
  height: number,
  values: Pick<Particle, "x" | "y" | "size" | "drift" | "color" | "alpha"> &
    Partial<Particle>,
): Particle {
  return {
    startX: values.x + (random() - 0.5) * width * 0.9,
    startY: values.y + (random() - 0.5) * height * 0.9,
    delay: random() * 600,
    pushX: 0,
    pushY: 0,
    angle: random() * Math.PI * 2,
    spin: (random() - 0.5) * 0.004,
    phase: random() * Math.PI * 2,
    twinkle: 0.25,
    ...values,
  };
}

function ambient(random: () => number, width: number, height: number) {
  const count = width < 1100 ? 30 : 90;
  return Array.from({ length: count }, () =>
    particle(random, width, height, {
      x: random() * width,
      y: random() * height,
      size: 2 + random() * 3,
      drift: 2 + random() * 5,
      color: Math.floor(random() * COLORS.length),
      alpha: 0.2 + random() * 0.3,
    }),
  );
}

function portraitField(
  width: number,
  height: number,
  portrait: PortraitData,
  wide: boolean,
): Particle[] {
  const random = seeded(7);
  // Either way the bust stands on the hero's bottom edge.
  const h = wide
    ? Math.min(height * 0.94, (width * 0.4) / portrait.aspect)
    : Math.min(width * STACKED_SHARE, STACKED_MAX);
  const w = h * portrait.aspect;
  const left = (wide ? width * 0.77 : width / 2) - w / 2;
  const top = height - h;
  const particles = ambient(random, width, height);
  const { points } = portrait;
  // Phones keep every point on the face, which carries the likeness, and
  // every other one on the body to stay light.
  const thinBody = width < 600;
  for (let i = 0; i < points.length; i += 3) {
    const onFace = points[i + 1] < FACE_LIMIT;
    if (thinBody && !onFace && (i / 3) % 2 === 1) continue;
    const tone = points[i + 2] / 9;
    // Accents stay off the face so its light and shadow read cleanly.
    const accent = random() < (onFace ? 0.05 : 0.2);
    particles.push(
      particle(random, width, height, {
        x: left + (points[i] / 999) * w,
        y: top + (points[i + 1] / 999) * h,
        size: wide ? 1.3 + random() * 1.3 : 1.1 + random() * 1.1,
        drift: 0.3 + random() * 0.7,
        twinkle: 0.12,
        // Tone picks the shade so light and shadow survive; a few accents
        // keep the brand's chromatic sparks.
        color: accent
          ? 2 + Math.floor(random() * ACCENTS.length)
          : tone > 0.7
            ? 1
            : 0,
        alpha: 0.18 + Math.pow(tone, 1.5) * 0.82,
      }),
    );
  }
  return particles;
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
    // Below this the bust moves under the actions so it clears the headline.
    const wide = window.matchMedia("(min-width: 1100px)");
    let portrait: PortraitData | null = null;
    let particles: Particle[] = [];
    let tapTimer = 0;
    let frame = 0;
    let visible = true;
    let disposed = false;
    let started = -1;
    let gathered = still.matches;
    const pointer = { x: -9999, y: -9999 };
    const buckets = Array.from(
      { length: COLORS.length * ALPHA_STEPS },
      () => [] as number[],
    );

    const build = () => {
      const { width, height } = canvas.getBoundingClientRect();
      // Until the portrait arrives only the ambient particles drift.
      particles = portrait
        ? portraitField(width, height, portrait, wide.matches)
        : ambient(seeded(7), width, height);
    };

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      const { width, height } = canvas.getBoundingClientRect();
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      build();
      if (still.matches) draw(0);
    };

    const draw = (time: number) => {
      const { width, height } = canvas.getBoundingClientRect();
      const t = time / 1000;
      if (started < 0) started = time;
      let pending = false;
      for (const bucket of buckets) bucket.length = 0;

      for (const p of particles) {
        let x = p.x + Math.cos(t * 0.3 + p.phase) * p.drift;
        let y = p.y + Math.sin(t * 0.4 + p.phase) * p.drift;

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

        const alpha = Math.min(
          1,
          p.alpha * (1 - p.twinkle + p.twinkle * Math.sin(t * 0.8 + p.phase)),
        );
        const step = Math.min(ALPHA_STEPS - 1, Math.floor(alpha * ALPHA_STEPS));
        const bucket = buckets[p.color * ALPHA_STEPS + step];
        bucket.push(
          x + p.pushX,
          y + p.pushY,
          p.size,
          p.angle + time * p.spin * 0.06,
        );
      }

      context.clearRect(0, 0, width, height);
      context.lineWidth = 1;
      buckets.forEach((bucket, index) => {
        if (bucket.length === 0) return;
        context.strokeStyle = COLORS[Math.floor(index / ALPHA_STEPS)];
        context.globalAlpha = ((index % ALPHA_STEPS) + 0.5) / ALPHA_STEPS;
        context.beginPath();
        for (let i = 0; i < bucket.length; i += 4) {
          const x = bucket[i];
          const y = bucket[i + 1];
          const size = bucket[i + 2];
          const angle = bucket[i + 3];
          for (let k = 0; k < 3; k++) {
            const corner = angle + (k * Math.PI * 2) / 3;
            const px = x + Math.cos(corner) * size;
            const py = y + Math.sin(corner) * size;
            if (k === 0) context.moveTo(px, py);
            else context.lineTo(px, py);
          }
          context.closePath();
        }
        context.stroke();
      });
      context.globalAlpha = 1;
      if (!gathered && !pending && particles.length > 0) gathered = true;
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
    const regather = () => {
      build();
      started = -1;
      gathered = still.matches;
      sync();
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
    // Touch has no hover, so a tap parts the particles for a moment instead.
    const tap = (event: PointerEvent) => {
      if (finePointer.matches) return;
      const rect = canvas.getBoundingClientRect();
      if (event.clientY < rect.top || event.clientY > rect.bottom) return;
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
      window.clearTimeout(tapTimer);
      tapTimer = window.setTimeout(release, TAP_MS);
    };

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
    const resizer = new ResizeObserver(resize);
    observer.observe(canvas);
    resizer.observe(canvas);
    still.addEventListener("change", sync);
    wide.addEventListener("change", regather);
    window.addEventListener("pointermove", track, { passive: true });
    window.addEventListener("pointerdown", tap, { passive: true });
    document.documentElement.addEventListener("pointerleave", release);
    resize();
    sync();
    import("./portrait-points.json").then(({ default: data }) => {
      if (disposed) return;
      portrait = data;
      regather();
    });
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      resizer.disconnect();
      still.removeEventListener("change", sync);
      window.clearTimeout(tapTimer);
      wide.removeEventListener("change", regather);
      window.removeEventListener("pointermove", track);
      window.removeEventListener("pointerdown", tap);
      document.documentElement.removeEventListener("pointerleave", release);
    };
  }, []);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
