"use client";

import { useEffect, useRef } from "react";

const CHARS = "01アイウエオカキクケコサシスセソタチツテト$#@!%&*+=<>/\\";

export function MatrixRain({
  className,
  color = "#39ff8c",
}: {
  className?: string;
  color?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const fontSize = 15;
    let columns = 0;
    let drops: number[] = [];
    let frame = 0;
    let raf = 0;

    const resize = () => {
      const { clientWidth, clientHeight } = canvas.parentElement ?? canvas;
      canvas.width = clientWidth;
      canvas.height = clientHeight;
      columns = Math.ceil(canvas.width / fontSize);
      drops = new Array(columns)
        .fill(0)
        .map(() => Math.floor(Math.random() * -40));
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      ctx.fillStyle = "rgba(3, 6, 4, 0.16)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = `${fontSize}px var(--font-mono, monospace)`;
      for (let i = 0; i < columns; i++) {
        const char = CHARS[Math.floor(Math.random() * CHARS.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;
        ctx.fillStyle = color;
        ctx.fillText(char, x, y);
        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i] += 1;
      }
    };

    if (reduceMotion) {
      draw();
    } else {
      const loop = () => {
        frame += 1;
        if (frame % 2 === 0) draw();
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    }

    return () => {
      window.removeEventListener("resize", resize);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [color]);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
