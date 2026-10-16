"use client";
import { startTransition, useActionState } from "react";
import { useTranslator } from "@/components/locale-provider";
import { syncJuniorAction } from "@/app/student/actions";
import { useJuniorState } from "@/components/playground/junior/state";
import { PROGRESS_KEY } from "@/lib/junior/logic";
import { CIPHER_PROGRESS_KEY } from "@/lib/junior/cipher-content";
import { STORY_KEY } from "@/lib/junior/story";
import { DAILY_KEY } from "@/lib/junior/daily";
import { AGENT_KEY } from "@/lib/junior/rank";

const read = (key: string) => {
  try {
    return JSON.parse(window.localStorage.getItem(key) ?? "null");
  } catch {
    return null;
  }
};

// Sends what this browser stored for Junior; the server recomputes the XP.
export function JuniorSync({ shared }: { shared: number | null }) {
  const t = useTranslator();
  const { xp, missionCount, missionTotal, exercises } = useJuniorState();
  const [state, action, pending] = useActionState(syncJuniorAction, undefined);
  const send = () => {
    const form = new FormData();
    form.set(
      "snapshot",
      JSON.stringify({
        missions: read(PROGRESS_KEY),
        ciphers: read(CIPHER_PROGRESS_KEY),
        story: read(STORY_KEY),
        daily: read(DAILY_KEY),
        agent: read(AGENT_KEY),
      }),
    );
    startTransition(() => action(form));
  };
  return (
    <div className="student-junior-sync">
      <p className="student-quiet">
        {t(
          "On this device: {xp} XP · missions {missions}/{total} · cipher exercises {exercises}.",
          { xp, missions: missionCount, total: missionTotal, exercises },
        )}{" "}
        {shared !== null && t("In the ranking: {xp} XP.", { xp: shared })}
      </p>
      <button
        type="button"
        className="student-button"
        onClick={send}
        disabled={pending}
      >
        {pending ? t("Sending…") : t("Share my Junior results")}
      </button>
      {state?.error && (
        <p className="student-error" role="alert">
          {t(state.error)}
        </p>
      )}
      {state?.success && (
        <p className="student-success" role="status">
          {t(state.success)}
        </p>
      )}
    </div>
  );
}
