import { CHALLENGES, CHALLENGE_IDS, type ChallengeId } from "./catalog";

export const CTF_STORAGE_KEY = "cybervalue:ctf:signal-0017:v1";
export type Entry = {
  hints: number;
  proof: string;
  fragment: string;
  notes: string;
  message: string;
};
export type Progress = Record<ChallengeId, Entry>;

export function restoreProgress(value: unknown): Progress {
  const raw =
    value && typeof value === "object" && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : {};
  const restored = Object.fromEntries(
    CHALLENGE_IDS.map((id) => {
      const entry =
        raw[id] && typeof raw[id] === "object"
          ? (raw[id] as Record<string, unknown>)
          : {};
      const proof =
        typeof entry.proof === "string" && /^[a-f0-9]{64}$/.test(entry.proof)
          ? entry.proof
          : "";
      return [
        id,
        {
          hints:
            Number.isInteger(entry.hints) &&
            Number(entry.hints) >= 0 &&
            Number(entry.hints) <= 3
              ? Number(entry.hints)
              : 0,
          proof,
          fragment:
            proof &&
            typeof entry.fragment === "string" &&
            /^[A-Z]$/.test(entry.fragment)
              ? entry.fragment
              : "",
          notes:
            typeof entry.notes === "string" ? entry.notes.slice(0, 3000) : "",
          message:
            proof && typeof entry.message === "string"
              ? entry.message.slice(0, 1500)
              : "",
        },
      ];
    }),
  ) as Progress;
  if (!vaultUnlocked(restored)) {
    restored.vault.proof = "";
    restored.vault.fragment = "";
    restored.vault.message = "";
  }
  return restored;
}

export function ctfScore(progress: Progress) {
  return CHALLENGES.reduce(
    (total, challenge) =>
      total +
      (progress[challenge.id].proof
        ? challenge.points - progress[challenge.id].hints * 10
        : 0),
    0,
  );
}

export function vaultUnlocked(progress: Progress) {
  return CHALLENGE_IDS.slice(0, 4).every((id) => !!progress[id].proof);
}

export type DecodeMode = "base64" | "rot13" | "hex";
export function decodeSignal(input: string, mode: DecodeMode): string {
  const text = input.trim();
  if (!text || text.length > 6000)
    throw new Error("1–6000 belgili matn kiriting.");
  if (mode === "rot13")
    return text.replace(/[a-z]/gi, (char) =>
      String.fromCharCode(
        char.charCodeAt(0) + (char.toLowerCase() <= "m" ? 13 : -13),
      ),
    );
  if (mode === "hex") {
    const compact = text.replace(/\s/g, "");
    if (!/^(?:[a-f0-9]{2})+$/i.test(compact))
      throw new Error(
        "Hex uchun juft uzunlikdagi 0–9, A–F belgilarini kiriting.",
      );
    return new TextDecoder("utf-8", { fatal: true }).decode(
      Uint8Array.from(compact.match(/../g)!, (pair) => parseInt(pair, 16)),
    );
  }
  const compact = text.replace(/\s/g, "");
  if (
    !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(
      compact,
    )
  )
    throw new Error(
      "Base64 matni noto‘g‘ri. Faqat PAYLOAD qiymatini kiriting.",
    );
  return new TextDecoder("utf-8", { fatal: true }).decode(
    Uint8Array.from(atob(compact), (char) => char.charCodeAt(0)),
  );
}
