"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { Shot } from "./world";

type World = ReturnType<typeof import("./world").createWorld>;

/**
 * A 3D shot. three.js loads only when a 3D scene is shown; until then the
 * canvas carries data-3d-loading so the MP4 renderer waits for it. Without
 * WebGL the scene shows `fallback` instead.
 */
export function Scene3D({
  shot,
  p,
  t,
  talk,
  fallback,
}: {
  shot: Shot;
  p: number;
  t: number;
  talk: number;
  fallback: React.ReactNode;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const world = useRef<World | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "failed">("loading");

  useEffect(() => {
    let alive = true;
    let made: World | null = null;
    import("./world")
      .then(({ createWorld }) => {
        if (!alive || !canvas.current) return;
        made = createWorld(canvas.current, shot);
        world.current = made;
        setState("ready");
      })
      .catch(() => alive && setState("failed"));
    const onResize = () => world.current?.resize();
    window.addEventListener("resize", onResize);
    return () => {
      alive = false;
      window.removeEventListener("resize", onResize);
      made?.dispose();
      world.current = null;
    };
  }, [shot]);

  // Draw this moment, and again once the world has loaded.
  useLayoutEffect(() => {
    if (state === "ready") world.current?.draw(p, t, talk);
  }, [p, t, talk, state]);

  if (state === "failed") return <>{fallback}</>;
  return (
    <canvas
      ref={canvas}
      className="vl-3d"
      data-3d-loading={state === "loading" ? "" : undefined}
      aria-hidden="true"
    />
  );
}
