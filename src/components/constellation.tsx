"use client";

import { useEffect, useRef } from "react";

// Design.MD's signature visual: outlined triangular particles in vivid colours,
// a dense cloud on the right of the hero with sparse ambient ones around it.
// Purely decorative, so it is aria-hidden and draws a still frame when the
// visitor prefers reduced motion.
const COLORS = [
  "#8052ff",
  "#a68bff",
  "#ffb829",
  "#1fb99a",
  "#ff5fd2",
  "#4f8bff",
];

type Particle = {
  x: number;
  y: number;
  size: number;
  angle: number;
  spin: number;
  phase: number;
  drift: number;
  color: string;
  alpha: number;
};

function seeded(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

function makeParticles(width: number, height: number) {
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
    const ambient = i >= cloudCount;
    let x: number;
    let y: number;
    if (ambient) {
      x = random() * width;
      y = random() * height;
    } else {
      // Two overlapping lobes with a soft edge read as an organic, brain-like
      // cloud rather than a perfect ellipse.
      const lobe = random() < 0.5 ? -1 : 1;
      const t = random() * Math.PI * 2;
      const r = Math.sqrt(random()) * (0.75 + random() * 0.3);
      x = cx + lobe * rx * 0.28 + Math.cos(t) * r * rx * 0.78;
      y = cy + Math.sin(t) * r * ry * (lobe < 0 ? 0.95 : 0.8);
    }
    particles.push({
      x,
      y,
      size: ambient ? 2 + random() * 3 : 2 + random() * 4.5,
      angle: random() * Math.PI * 2,
      spin: (random() - 0.5) * 0.004,
      phase: random() * Math.PI * 2,
      drift: 2 + random() * 5,
      color: COLORS[Math.floor(random() * COLORS.length)],
      alpha: ambient || compact ? 0.2 + random() * 0.3 : 0.45 + random() * 0.5,
    });
  }
  return particles;
}

export function Constellation({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)");
    let particles: Particle[] = [];
    let frame = 0;
    let visible = true;

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      const { width, height } = canvas.getBoundingClientRect();
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      particles = makeParticles(width, height);
      draw(0);
    };

    const draw = (time: number) => {
      const { width, height } = canvas.getBoundingClientRect();
      context.clearRect(0, 0, width, height);
      context.lineWidth = 1.1;
      for (const p of particles) {
        const t = time / 1000;
        const x = p.x + Math.cos(t * 0.3 + p.phase) * p.drift;
        const y = p.y + Math.sin(t * 0.4 + p.phase) * p.drift;
        const a = p.angle + time * p.spin * 0.06;
        context.globalAlpha =
          p.alpha * (0.7 + 0.3 * Math.sin(t * 0.8 + p.phase));
        context.strokeStyle = p.color;
        context.beginPath();
        for (let k = 0; k < 3; k++) {
          const corner = a + (k * Math.PI * 2) / 3;
          const px = x + Math.cos(corner) * p.size;
          const py = y + Math.sin(corner) * p.size;
          if (k === 0) context.moveTo(px, py);
          else context.lineTo(px, py);
        }
        context.closePath();
        context.stroke();
      }
      context.globalAlpha = 1;
    };

    const loop = (time: number) => {
      draw(time);
      frame = requestAnimationFrame(loop);
    };
    const sync = () => {
      cancelAnimationFrame(frame);
      if (visible && !still.matches) frame = requestAnimationFrame(loop);
    };

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
    const resizer = new ResizeObserver(resize);
    observer.observe(canvas);
    resizer.observe(canvas);
    still.addEventListener("change", sync);
    resize();
    sync();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      resizer.disconnect();
      still.removeEventListener("change", sync);
    };
  }, []);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
