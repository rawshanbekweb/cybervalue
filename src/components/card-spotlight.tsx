"use client";

import { useEffect } from "react";

// Feeds the pointer position to cards matching `selector` as --mx/--my, which
// the stylesheet turns into a soft iris glow that follows the cursor. One
// delegated listener covers every card; touch screens never get the glow.
export function CardSpotlight({ selector }: { selector: string }) {
  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const move = (event: PointerEvent) => {
      const card = (event.target as Element | null)?.closest<HTMLElement>(
        selector,
      );
      if (!card) return;
      const rect = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${event.clientX - rect.left}px`);
      card.style.setProperty("--my", `${event.clientY - rect.top}px`);
    };
    document.addEventListener("pointermove", move, { passive: true });
    return () => document.removeEventListener("pointermove", move);
  }, [selector]);
  return null;
}
