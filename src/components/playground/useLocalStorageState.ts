"use client";

import { useCallback, useRef, useSyncExternalStore } from "react";

function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage unavailable — the tool still works, just without persistence
  }
}

// Bridges localStorage (an external, synchronously-readable store) into React without
// violating render purity: the server snapshot is always `fallback` (no window on the server),
// and useSyncExternalStore handles re-rendering once the real client value is available.
// `setValue` notifies the local listener set directly (no cross-tab "storage" event support
// needed — this component is the only writer for its own key).
export function useLocalStorageState<T>(key: string, fallback: T): [T, (value: T) => void] {
  const valueRef = useRef<T | undefined>(undefined);
  const initializedRef = useRef(false);
  const listenersRef = useRef(new Set<() => void>());

  const getSnapshot = () => {
    if (!initializedRef.current) {
      valueRef.current = readJSON(key, fallback);
      initializedRef.current = true;
    }
    return valueRef.current as T;
  };
  const getServerSnapshot = () => fallback;
  const subscribe = useCallback((onStoreChange: () => void) => {
    listenersRef.current.add(onStoreChange);
    return () => listenersRef.current.delete(onStoreChange);
  }, []);

  const value = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setValue = useCallback(
    (next: T) => {
      valueRef.current = next;
      initializedRef.current = true;
      writeJSON(key, next);
      listenersRef.current.forEach((listener) => listener());
    },
    [key],
  );

  return [value, setValue];
}
