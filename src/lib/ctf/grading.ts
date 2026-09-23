// Server entry point only. Never import this module into a client component.
import { createHash } from "node:crypto";
import { CHALLENGE_IDS, type ChallengeId } from "./catalog";

const ANSWERS: Record<
  ChallengeId,
  { flag: string; fragment: string; message: string }
> = {
  source: {
    flag: "CV{comments_tell_stories}",
    fragment: "N",
    message:
      "Birinchi relay uyg‘ondi. Operator izohga yashirgan xabarni topdingiz. Brauzer ko‘rsatmaydigan ma’lumot ham yuklab olinadi: HTML izohi sir saqlash joyi emas.",
  },
  signal: {
    flag: "CV{rotate_the_signal}",
    fragment: "O",
    message:
      "Chastota tozalandi. Base64 ni ochib, ROT13 ni qaytardingiz. Kodlash ma’lumot ko‘rinishini o‘zgartiradi; u maxfiylikni ta’minlamaydi.",
  },
  archive: {
    flag: "CV{robots_are_not_locks}",
    fragment: "V",
    message:
      "Arxiv qayta ochildi. robots.txt qidiruv robotlariga ko‘rsatma beradi, foydalanuvchining kirish huquqini tekshirmaydi. Yashirin yo‘l ham avtorizatsiyaga muhtoj.",
  },
  trace: {
    flag: "CV{trace_before_trust}",
    fragment: "A",
    message:
      "Voqealar zanjiri tiklandi. Trace identifikatori kerakli oqimni ajratdi, sequence raqami esa tartibni berdi. Turli server soatlari voqealarni chalg‘itishi mumkin.",
  },
  vault: {
    flag: "CV{NOVA_0017}",
    fragment: "",
    message:
      "“Agar bu xabarni o‘qiyotgan bo‘lsangiz, stansiya yana eshitilyapti. Tizimni faqat kod emas, savol berishni to‘xtatmagan inson tikladi. Rahmat, operator.” — NOVA, 00:18",
  },
};

function receipt(id: ChallengeId) {
  return createHash("sha256")
    .update(`cybervalue:signal-0017:v1:${id}:${ANSWERS[id].flag}`)
    .digest("hex");
}

export function gradeFlag(input: unknown): {
  status: number;
  body: { ok: boolean; message: string; proof?: string; fragment?: string };
} {
  const error = (status: number, message: string) => ({
    status,
    body: { ok: false, message },
  });
  if (!input || typeof input !== "object" || Array.isArray(input))
    return error(400, "Flag va topshiriqni yuboring.");
  const data = input as Record<string, unknown>;
  if (
    typeof data.id !== "string" ||
    !CHALLENGE_IDS.includes(data.id as ChallengeId) ||
    typeof data.flag !== "string" ||
    data.flag.length > 160
  )
    return error(400, "Topshiriq yoki flag formati noto‘g‘ri.");
  const id = data.id as ChallengeId;
  const flag = data.flag.trim();
  if (!/^CV\{[A-Za-z0-9_]+\}$/.test(flag))
    return error(
      400,
      "Flag formati: CV{javob}. Katta-kichik harflarga e’tibor bering.",
    );
  if (id === "vault") {
    const proofs = data.proofs;
    if (
      !proofs ||
      typeof proofs !== "object" ||
      !CHALLENGE_IDS.slice(0, 4).every(
        (key) => (proofs as Record<string, unknown>)[key] === receipt(key),
      )
    )
      return error(
        403,
        "Avval to‘rtta relay flagini tasdiqlang. Saqlangan progress buzilgan bo‘lsa, flaglarni qayta yuboring.",
      );
  }
  if (flag !== ANSWERS[id].flag)
    return error(
      200,
      "Bu flag mos kelmadi. Izlarni yana tekshiring — urinish uchun ball kamaymaydi.",
    );
  return {
    status: 200,
    body: {
      ok: true,
      message: ANSWERS[id].message,
      proof: receipt(id),
      fragment: ANSWERS[id].fragment,
    },
  };
}
