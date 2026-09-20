"use client";

import { useEffect, useState } from "react";

export function useTypewriter(text: string, speed = 32, startDelay = 300) {
  const [output, setOutput] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];

    if (reduceMotion) {
      timers.push(
        setTimeout(() => {
          if (cancelled) return;
          setOutput(text);
          setDone(true);
        }, 0),
      );
    } else {
      let i = 0;
      const typeNext = () => {
        if (cancelled) return;
        i += 1;
        setOutput(text.slice(0, i));
        if (i >= text.length) {
          setDone(true);
        } else {
          timers.push(setTimeout(typeNext, speed));
        }
      };
      timers.push(setTimeout(typeNext, startDelay));
    }

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [text, speed, startDelay]);

  return { output, done };
}
