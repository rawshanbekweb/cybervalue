"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { Shot3D } from "@/lib/video-lessons/types";

type World = ReturnType<typeof import("./render").createWorld>;

/**
 * A 3D shot. three.js loads only when a 3D scene is shown; until then the
 * canvas carries data-3d-loading so the MP4 renderer waits for it. Without
 * WebGL the scene shows `fallback` instead.
 */
export function Scene3D({
  shot,
  stage = 0,
  p,
  t,
  talk,
  fallback,
}: {
  shot: Shot3D;
  stage?: number;
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
    import("./render")
      .then(({ createWorld }) => {
        if (!alive || !canvas.current) return;
        made = createWorld(canvas.current, shot, stage);
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
  }, [shot, stage]);

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
