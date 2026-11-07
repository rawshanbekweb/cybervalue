"use client";
import { useEffect, useRef, useState } from "react";
import { useTranslator } from "@/components/locale-provider";

type Solve = {
  id: string;
  at: number;
  name: string;
  title: string;
  category: string;
  first: boolean;
};

const POLL_MS = 8000;
const SHOW_MS = 5000;

/**
 * Pop-ups in the corner while a competition runs: each new solve shows for
 * five seconds ("aziza solved Sirli xat"), first solves stand out. It only
 * reads /challenges/<slug>/solves, so if that fails the page is unaffected.
 */
export function SolveToasts({ slug }: { slug: string }) {
  const t = useTranslator();
  const [toasts, setToasts] = useState<(Solve & { leaving: boolean })[]>([]);
  // Only solves after the page opened; set when the effect starts.
  const since = useRef(0);
  const seen = useRef(new Set<string>());

  useEffect(() => {
    let stopped = false;
    since.current = Date.now();
    const timers: number[] = [];
    async function poll() {
      if (document.visibilityState !== "visible") return;
      try {
        const response = await fetch(
          `/challenges/${encodeURIComponent(slug)}/solves?since=${since.current}`,
          { cache: "no-store" },
        );
        if (!response.ok) return;
        const { solves } = (await response.json()) as { solves: Solve[] };
        for (const s of solves) {
          since.current = Math.max(since.current, s.at);
          if (seen.current.has(s.id) || stopped) continue;
          seen.current.add(s.id);
          setToasts((list) => [...list.slice(-3), { ...s, leaving: false }]);
          timers.push(
            window.setTimeout(
              () =>
                setToasts((list) =>
                  list.map((x) =>
                    x.id === s.id ? { ...x, leaving: true } : x,
                  ),
                ),
              SHOW_MS - 400,
            ),
            window.setTimeout(
              () => setToasts((list) => list.filter((x) => x.id !== s.id)),
              SHOW_MS,
            ),
          );
        }
      } catch {
        // A missed poll is fine; the next one catches up.
      }
    }
    const timer = window.setInterval(poll, POLL_MS);
    return () => {
      stopped = true;
      window.clearInterval(timer);
      timers.forEach((id) => window.clearTimeout(id));
    };
  }, [slug]);

  return (
    <div className="ctf-toasts" aria-live="polite" role="status">
      {toasts.map((s) => (
        <div
          key={s.id}
          className={`ctf-toast${s.first ? " is-first" : ""}${s.leaving ? " is-leaving" : ""}`}
        >
          <span className="ctf-toast-icon" aria-hidden="true">
            {s.first ? "🩸" : "🚩"}
          </span>
          <span className="ctf-toast-text">
            <b>{s.name}</b>{" "}
            {s.first
              ? t("solved “{title}” first!", { title: s.title })
              : t("solved “{title}”", { title: s.title })}
            <span className="ctf-toast-cat">{s.category}</span>
          </span>
          <span className="ctf-toast-bar" aria-hidden="true" />
        </div>
      ))}
    </div>
  );
}
