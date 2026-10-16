"use client";

import { useCallback, useSyncExternalStore } from "react";

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

// One cached value and one listener set per key, shared by every component
// on the page: when one writes, all readers of the same key re-render.
const cache = new Map<string, unknown>();
const listeners = new Map<string, Set<() => void>>();

// Bridges localStorage (an external, synchronously-readable store) into React without
// violating render purity: the server snapshot is always `fallback` (no window on the server),
// and useSyncExternalStore handles re-rendering once the real client value is available.
// No cross-tab "storage" event support is needed: a page is the only writer for its keys.
export function useLocalStorageState<T>(
  key: string,
  fallback: T,
): [T, (value: T) => void] {
  const getSnapshot = () => {
    if (!cache.has(key)) cache.set(key, readJSON(key, fallback));
    return cache.get(key) as T;
  };
  const getServerSnapshot = () => fallback;
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      let set = listeners.get(key);
      if (!set) listeners.set(key, (set = new Set()));
      set.add(onStoreChange);
      return () => set.delete(onStoreChange);
    },
    [key],
  );

  const value = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setValue = useCallback(
    (next: T) => {
      cache.set(key, next);
      writeJSON(key, next);
      listeners.get(key)?.forEach((listener) => listener());
    },
    [key],
  );

  return [value, setValue];
}
