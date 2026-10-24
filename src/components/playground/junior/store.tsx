"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import { saveJuniorPartAction } from "@/app/[lang]/junior/actions";
import type {
  JuniorProgress,
  JuniorProof,
  ProgressPart,
} from "@/lib/junior/progress";

type Store = {
  member: { name: string; group: string };
  progress: JuniorProgress;
  set: <P extends ProgressPart>(
    part: P,
    value: JuniorProgress[P],
    proof?: JuniorProof,
  ) => void;
  /** True when the last save did not reach the server. */
  unsaved: boolean;
  /** A step the server refused; the page must be reloaded to match it. */
  rejected: boolean;
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
  const [rejected, setRejected] = useState(false);
  // Parts whose last save failed are sent again with the next change,
  // together with the evidence of every step still unsaved.
  const pending = useRef(
    new Map<string, { value: unknown; proof: JuniorProof }>(),
  );
  const set = useCallback<Store["set"]>((part, value, proof = {}) => {
    setProgress((current) => ({ ...current, [part]: value }));
    const before = pending.current.get(part)?.proof ?? {};
    pending.current.set(part, { value, proof: mergeProof(before, proof) });
    for (const [key, item] of pending.current)
      saveJuniorPartAction(key, item.value, item.proof)
        .then((result) => {
          // A refused step is not sent again: it would be refused every time
          // and hold back later saves of the same part.
          if (pending.current.get(key) === item) {
            pending.current.delete(key);
            if (!result.ok) setRejected(true);
          }
          setUnsaved(pending.current.size > 0);
        })
        .catch(() => setUnsaved(true));
  }, []);
  return (
    <Context.Provider value={{ member, progress, set, unsaved, rejected }}>
      {children}
    </Context.Provider>
  );
}

export const useJuniorStore = () => useContext(Context);

function mergeProof(a: JuniorProof, b: JuniorProof): JuniorProof {
  const answers = { ...a.answers };
  for (const [cipher, given] of Object.entries(b.answers ?? {}))
    answers[cipher] = { ...answers[cipher], ...given };
  return {
    missions: { ...a.missions, ...b.missions },
    answers,
    daily: b.daily ?? a.daily,
  };
}
