"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** Keys that copy, paste, save, print or open developer tools. */
const BLOCKED_WITH_MOD = new Set(["c", "x", "v", "a", "p", "s", "u"]);
const BLOCKED_WITH_SHIFT = new Set(["i", "j", "c", "s"]);
const editable = (target: EventTarget | null) =>
  target instanceof HTMLElement && target.matches("input, textarea, select");

/**
 * While the exam runs: no copying, pasting, selecting, right-click, printing
 * or saving, and the questions are hidden whenever the window loses focus
 * (as screenshot tools and other apps make it do). A browser cannot stop a
 * photo of the screen; it can make one harder and count every time a student
 * leaves the exam.
 */
export function useExamGuard(active: boolean, onLeave: () => void) {
  const [hidden, setHidden] = useState(false);
  const hiddenRef = useRef(false);
  /** Entering full screen blurs the window for a moment; that isn't leaving. */
  const graceUntil = useRef(0);
  const leave = useRef(onLeave);
  useEffect(() => {
    leave.current = onLeave;
  }, [onLeave]);

  useEffect(() => {
    if (!active) return;
    const flag = () => {
      if (hiddenRef.current || Date.now() < graceUntil.current) return;
      hiddenRef.current = true;
      setHidden(true);
      leave.current();
    };
    const block = (e: Event) => e.preventDefault();
    const blockSelect = (e: Event) => {
      if (!editable(e.target)) e.preventDefault();
    };
    const scrubClipboard = () => {
      navigator.clipboard?.writeText("").catch(() => {});
    };
    const onKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const mod = e.ctrlKey || e.metaKey;
      if (
        key === "printscreen" ||
        key === "f12" ||
        (mod && BLOCKED_WITH_MOD.has(key)) ||
        (mod && e.shiftKey && BLOCKED_WITH_SHIFT.has(key))
      ) {
        e.preventDefault();
        e.stopPropagation();
      }
      if (key === "printscreen") {
        scrubClipboard();
        flag();
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      // Windows reports PrintScreen only on key-up.
      if (e.key.toLowerCase() === "printscreen") {
        scrubClipboard();
        flag();
      }
    };
    // A blur only counts if focus doesn't come straight back: browsers blur
    // the window for a moment on some clicks and on entering full screen.
    let blurTimer = 0;
    const onBlur = () => {
      window.clearTimeout(blurTimer);
      blurTimer = window.setTimeout(() => {
        if (!document.hasFocus()) flag();
      }, 300);
    };
    const onVisibility = () => {
      if (document.hidden) flag();
    };
    const onFullscreen = () => {
      if (!document.fullscreenElement) flag();
    };
    const listeners: [EventTarget, string, EventListener][] = [
      [document, "copy", block],
      [document, "cut", block],
      [document, "paste", block],
      [document, "contextmenu", block],
      [document, "dragstart", block],
      [document, "drop", block],
      [document, "selectstart", blockSelect],
      [document, "keydown", onKeyDown as EventListener],
      [document, "keyup", onKeyUp as EventListener],
      [document, "visibilitychange", onVisibility],
      [document, "fullscreenchange", onFullscreen],
      [window, "blur", onBlur],
      [window, "beforeprint", flag],
    ];
    for (const [target, type, fn] of listeners)
      target.addEventListener(type, fn, { capture: true });
    return () => {
      window.clearTimeout(blurTimer);
      for (const [target, type, fn] of listeners)
        target.removeEventListener(type, fn, { capture: true });
    };
  }, [active]);

  /** Go full screen; the moment of switching doesn't count as leaving. */
  const fullscreen = useCallback(() => {
    graceUntil.current = Date.now() + 1500;
    document.documentElement.requestFullscreen?.().catch(() => {});
  }, []);
  const back = useCallback(() => {
    hiddenRef.current = false;
    setHidden(false);
    fullscreen();
  }, [fullscreen]);
  return { hidden, back, fullscreen };
}
