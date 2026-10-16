"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import { saveJuniorPartAction } from "@/app/[lang]/junior/actions";
import type { JuniorProgress, ProgressPart } from "@/lib/junior/progress";

type Store = {
  member: { name: string; group: string };
  progress: JuniorProgress;
  set: <P extends ProgressPart>(part: P, value: JuniorProgress[P]) => void;
  /** True when the last save did not reach the server. */
  unsaved: boolean;
};

const Context = createContext<Store | null>(null);

// The signed-in member's progress, loaded with the page and saved part by
// part to their account. The screen updates at once; a failed save is shown
// so the member knows to check their connection.
export function JuniorStoreProvider({
  member,
  initial,
  children,
}: {
  member: Store["member"];
  initial: JuniorProgress;
  children: React.ReactNode;
}) {
  const [progress, setProgress] = useState(initial);
  const [unsaved, setUnsaved] = useState(false);
  // Parts whose last save failed are sent again with the next change.
  const pending = useRef(new Map<string, unknown>());
  const set = useCallback<Store["set"]>((part, value) => {
    setProgress((current) => ({ ...current, [part]: value }));
    pending.current.set(part, value);
    for (const [key, item] of pending.current)
      saveJuniorPartAction(key, item)
        .then((result) => {
          if (result.ok && pending.current.get(key) === item)
            pending.current.delete(key);
          setUnsaved(pending.current.size > 0);
        })
        .catch(() => setUnsaved(true));
  }, []);
  return (
    <Context.Provider value={{ member, progress, set, unsaved }}>
      {children}
    </Context.Provider>
  );
}

export const useJuniorStore = () => useContext(Context);
