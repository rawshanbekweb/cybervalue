import { test } from "node:test";
import assert from "node:assert/strict";
import { checkMessage } from "../src/lib/scams/checker";
import { LESSONS } from "../src/lib/scams/curriculum";
import { LAB_PROGRESS } from "../src/lib/lab-progress";

const ids = (text: string) => checkMessage(text).flags.map((f) => f.id);

test("the checker finds the signs of common scams in three languages", () => {
  const bank = checkMessage(
    "Assalomu alaykum, QulayBank xavfsizlik xizmatidan. Kartangizdan shubhali o‘tkazma bo‘lyapti. Bloklash uchun SMS kodni ayting, 5 daqiqa ichida!",
  );
  assert.equal(bank.verdict, "danger");
  for (const id of ["code", "official", "urgent"])
    assert.ok(
      bank.flags.some((f) => f.id === id),
      id,
    );

  assert.deepEqual(
    ids(
      "Tabriklaymiz! Siz iPhone yutib oldingiz. Yetkazib berish uchun 99 000 so‘m to‘lang: http://bonus-qulaybank.top/olish",
    ).sort(),
    ["link", "prize", "upfront"],
  );
  assert.ok(
    ids("Здравствуйте! Сообщите код из СМС для отмены перевода").includes(
      "code",
    ),
  );
  assert.ok(
    ids("Вы выиграли приз! Оплатите доставку 50 000 сум").includes("upfront"),
  );
  assert.ok(ids("Вы выиграли приз!").includes("prize"));
  assert.ok(ids("Табриклаймиз, сиз ғолиб бўлдингиз!").includes("prize"));
  assert.ok(
    ids("Congratulations, you have won! Pay a small fee").includes("upfront"),
  );
  assert.ok(ids("Yangi ilova: subsidiya.apk ni o‘rnating").includes("apk"));
  assert.ok(ids("Kuniga 500 000 so‘m, tajriba shart emas!").includes("money"));
  assert.ok(
    ids("Ukam, 300 ming kartaga tashlab tur, kechqurun qaytaraman").includes(
      "transfer",
    ),
  );
  assert.ok(
    ids("Karta raqami, amal qilish muddati va CVV ni yozing").includes("card"),
  );
});

test("ordinary messages raise nothing", () => {
  for (const text of [
    "Salom! Ertaga darsga kelasanmi?",
    "QulayBank: 12:40 da kartangizdan 45 000 so‘m to‘landi. Balans: 312 000 so‘m.",
    "Buyurtmangiz yo‘lda. Kuryer ertaga 10:00–14:00 orasida keladi.",
    "Hi, are we still meeting at 6?",
  ])
    assert.equal(checkMessage(text).verdict, "none", text);
});

test("the strongest signs come first and very long input is cut", () => {
  const result = checkMessage("Tabriklaymiz! SMS kodni ayting va bonus oling");
  assert.equal(result.flags[0].id, "code");
  const long = checkMessage("salom ".repeat(5000) + "sms kodni ayting");
  assert.equal(long.verdict, "none");
});

test("every simulator scenario is solvable and its red flags match the text", () => {
  for (const lesson of LESSONS) {
    if (lesson.widget.type !== "scam") continue;
    const { scenario } = lesson.widget;
    assert.equal(
      scenario.choices.filter((c) => c.right).length,
      1,
      `#${lesson.id} has one right choice`,
    );
    const used = new Set(
      scenario.messages.flatMap((m) =>
        m.parts.flatMap((part) => (part.flag ? [part.flag] : [])),
      ),
    );
    assert.deepEqual(
      [...used].sort(),
      Object.keys(scenario.flags).sort(),
      `#${lesson.id} flags`,
    );
    assert.equal(scenario.scam, used.size > 0, `#${lesson.id} scam or safe`);
    for (const m of scenario.messages)
      for (const part of m.parts) assert.ok(part.text.uz && part.text.en);
  }
  assert.equal(LAB_PROGRESS.scams.total, LESSONS.length);
  // At least one message is safe, so the lesson is not "everything is a scam".
  assert.ok(
    LESSONS.some((l) => l.widget.type === "scam" && !l.widget.scenario.scam),
  );
});

test("the checker agrees with the simulator's scam messages", () => {
  for (const lesson of LESSONS) {
    if (lesson.widget.type !== "scam") continue;
    const { scenario } = lesson.widget;
    const said = scenario.messages
      .filter((m) => m.from === "them")
      .map((m) => m.parts.map((p) => p.text.uz).join(""))
      .join(" ");
    const verdict = checkMessage(said).verdict;
    if (scenario.scam) assert.notEqual(verdict, "none", `#${lesson.id}`);
    else assert.equal(verdict, "none", `#${lesson.id}`);
  }
});
