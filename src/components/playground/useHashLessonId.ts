"use client";

import { useCallback, useSyncExternalStore } from "react";

function subscribe(onStoreChange: () => void) {
  window.addEventListener("hashchange", onStoreChange);
  return () => window.removeEventListener("hashchange", onStoreChange);
}

// Reads the `#lesson/N` deep link as an external store: the server snapshot is always the
// default id (there is no hash on the server), and the client re-renders once the real hash
// is read after hydration, exactly like the localStorage bridge above. Lesson ids are assumed
// to be a contiguous 1..total range, which holds for both ported courses.
export function useHashLessonId(total: number, defaultId = 1): [number, (id: number) => void] {
  const getSnapshot = () => {
    const match = /#lesson\/(\d+)/.exec(window.location.hash);
    const id = match ? Number(match[1]) : defaultId;
    return id >= 1 && id <= total ? id : defaultId;
  };
  const getServerSnapshot = () => defaultId;

  const lessonId = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setLessonId = useCallback((id: number) => {
    window.location.hash = `#lesson/${id}`;
  }, []);

  return [lessonId, setLessonId];
}
