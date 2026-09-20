"use client";

import { useEffect, useState } from "react";

export function useBootSequence(lines: string[], speed = 18, gap = 220) {
  const [renderedLines, setRenderedLines] = useState<string[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [complete, setComplete] = useState(false);
  const linesKey = lines.join("\n");

  useEffect(() => {
    const list = linesKey.split("\n");
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];

    if (reduceMotion) {
      timers.push(
        setTimeout(() => {
          if (cancelled) return;
          setRenderedLines(list);
          setActiveIndex(list.length);
          setComplete(true);
        }, 0),
      );
      return () => {
        cancelled = true;
        timers.forEach(clearTimeout);
      };
    }

    const typeLine = (lineIndex: number) => {
      if (cancelled) return;
      if (lineIndex >= list.length) {
        setComplete(true);
        return;
      }
      const line = list[lineIndex];
      let charIndex = 0;
      const step = () => {
        if (cancelled) return;
        charIndex += 1;
        setRenderedLines((prev) => {
          const next = prev.slice(0, lineIndex);
          next[lineIndex] = line.slice(0, charIndex);
          return next;
        });
        if (charIndex < line.length) {
          timers.push(setTimeout(step, speed));
        } else {
          setActiveIndex(lineIndex + 1);
          timers.push(setTimeout(() => typeLine(lineIndex + 1), gap));
        }
      };
      timers.push(setTimeout(step, 0));
    };

    timers.push(setTimeout(() => typeLine(0), 0));

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [linesKey, speed, gap]);

  return { renderedLines, activeIndex, complete };
}
