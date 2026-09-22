// Imported only by the server and tests. Never send the answer key to the browser.
import type { Challenge, Question } from "./contract";

const bank: (Question & { correct: number })[] = [
  {
    id: "label",
    lesson: 8,
    prompt:
      'Label bosilganda email maydoni tanlanmayapti: <label for="mail">Email</label><input id="email" type="email">. Eng to‘g‘ri tuzatish qaysi?',
    options: [
      'Inputga class="mail" berish',
      'Labelning for qiymatini "email" qilish',
      "Labelni <p> bilan almashtirish",
      "Inputni <strong> ichiga olish",
    ],
    correct: 1,
  },
  {
    id: "list",
    lesson: 4,
    prompt:
      "Uch bosqichli ro‘yxatda harakatlar ketma-ketligi muhim. Qaysi tuzilma ma’noni eng to‘g‘ri ifodalaydi?",
    options: [
      "<ul><p>...</p></ul>",
      "<div>1 ... 2 ... 3 ...</div>",
      "<ol><li>...</li><li>...</li><li>...</li></ol>",
      "<p><br><br></p>",
    ],
    correct: 2,
  },
  {
    id: "entity",
    lesson: 12,
    prompt:
      "Sahifada aynan <input> & <label> matni ko‘rinishi kerak. Qaysi kod uni elementga aylantirmaydi?",
    options: [
      "<p><input> & <label></p>",
      "<p>&lt;input&gt; &amp; &lt;label&gt;</p>",
      "<!-- <input> & <label> -->",
      "<p>&input; &label;</p>",
    ],
    correct: 1,
  },
  {
    id: "table",
    lesson: 7,
    prompt:
      "Mashg‘ulot va vaqt ustunlari jadvalida birinchi qator ma’lumot qatorlaridan qanday farqlanishi kerak?",
    options: [
      "Faqat <strong> bilan yoziladi",
      "Har bir katakka <h1> qo‘yiladi",
      "Ustun nomlari <th>, ma’lumotlar <td> bilan belgilanadi",
      "Jadval ichida faqat <div> ishlatiladi",
    ],
    correct: 2,
  },
  {
    id: "alt",
    lesson: 6,
    prompt:
      "Tadbir logotipi yuklanmasa ham uning ma’nosi tushunarli bo‘lishi kerak. Qaysi yechim mos?",
    options: [
      "Faqat width berish",
      'alt="image" yozish',
      "Rasmni comments ichiga olish",
      "src bilan birga mazmunli alt berish",
    ],
    correct: 3,
  },
  {
    id: "semantics",
    lesson: 9,
    prompt:
      "Sahifa menyusi, asosiy mazmuni va yakuniy aloqa qismini ajratish kerak. Qaysi tanlov mazmunni ifodalaydi?",
    options: [
      "<nav>, <main>, <footer>",
      "<span>, <span>, <span>",
      "Uchta <h1>",
      "Faqat class nomlari turlicha bo‘lgan <div>",
    ],
    correct: 0,
  },
  {
    id: "head",
    lesson: 1,
    prompt:
      "Brauzer tabida tadbir nomi ko‘rinmayapti, lekin body ichida <h1> bor. Nimani qo‘shish kerak?",
    options: [
      "Body oxiriga yana <h1>",
      "Head ichiga <title>",
      "H1 ga href",
      "Footer ichiga <meta>",
    ],
    correct: 1,
  },
  {
    id: "anchor",
    lesson: 5,
    prompt:
      '<a href="#signup"> yozildi. Havola aynan ro‘yxatdan o‘tish formasiga olib borishi uchun nima zarur?',
    options: [
      'Formaga class="signup"',
      'Formaga name="signup"',
      'Formaga id="signup", sahifada shu id yagona bo‘lishi',
      'Havolaga type="submit"',
    ],
    correct: 2,
  },
  {
    id: "emphasis",
    lesson: 3,
    prompt:
      "“Joylar soni cheklangan” jumlasi shunchaki rangli emas, muhim ogohlantirish bo‘lishi kerak. Qaysi teg mos?",
    options: ["<strong>", "<span>", "<br>", "<div>"],
    correct: 0,
  },
  {
    id: "id",
    lesson: 11,
    prompt:
      'Ikki elementga bir xil id="schedule" berilgan. To‘g‘ri yechim qaysi?',
    options: [
      "Buni o‘zgartirish shart emas",
      "Ikkalasiga yana shu id qo‘shish",
      "Barcha id larni classga o‘zgartirish, havolani qoldirish",
      "Havola nishoniga yagona id qoldirish, boshqasiga boshqa id berish",
    ],
    correct: 3,
  },
];

export const variants = [
  {
    name: "Robototexnika kuni",
    items: ["Sensorlar", "Robot yig‘ish", "Sinov maydoni"],
    times: ["09:00", "10:00", "11:00"],
    contact: "robot@example.test",
  },
  {
    name: "Kosmos ustaxonasi",
    items: ["Sayyoralar", "Raketa modeli", "Parvoz sinovi"],
    times: ["13:00", "14:00", "15:00"],
    contact: "kosmos@example.test",
  },
  {
    name: "Ekologiya laboratoriyasi",
    items: ["Suv tahlili", "Qayta ishlash", "Yashil loyiha"],
    times: ["10:00", "11:00", "12:00"],
    contact: "eko@example.test",
  },
];

export function questionsFor(variant: number) {
  // Equivalent difficulty: shared core skills, varied order and rotated options.
  const ids =
    variant % 3 === 0
      ? [0, 1, 2, 3, 4, 5]
      : variant % 3 === 1
        ? [7, 3, 2, 6, 0, 8]
        : [9, 4, 1, 0, 2, 5];
  return ids.map((index, position) => {
    const question = bank[index];
    const rotation = (variant + position) % 4;
    return {
      ...question,
      options: [
        ...question.options.slice(rotation),
        ...question.options.slice(0, rotation),
      ],
      correct: (question.correct - rotation + 4) % 4,
    };
  });
}

export function challengeFor(variant: number): Challenge {
  const v = variants[variant % variants.length];
  return {
    name: v.name,
    variant,
    questions: questionsFor(variant).map(({ id, prompt, options, lesson }) => ({
      id,
      prompt,
      options,
      lesson,
    })),
    starter: `<!DOCTYPE html>\n<html lang="uz">\n<head>\n  <meta charset="UTF-8">\n  <title>Tadbir</title>\n</head>\n<body>\n  <!-- Bu sahifadagi xatolarni toping va buyurtmani yakunlang. -->\n  <header>\n    <h1>${v.name}</h1>\n    <nav><a href="#signup">Ishtirok etish</a></nav>\n  </header>\n  <main>\n    <p>Tadbirga xush kelibsiz.</p>\n    <div id="schedule">\n      <h1>Dastur</h1>\n      <table>\n        <tr><td>Mashg‘ulot</td><td>Vaqt</td></tr>\n        <tr><td>${v.items[0]}</td><td>${v.times[0]}</td></tr>\n      </table>\n    </div>\n    <form id="register">\n      <label for="student">Ismingiz</label>\n      <input type="text" id="name">\n      <button type="button">Yuborish</button>\n    </form>\n  </main>\n</body>\n</html>`,
    requirements: [
      `01 · Hujjat: doctype, lang="uz", head va body yozilsin; title aynan “${v.name}” bo‘lsin. Teglar to‘g‘ri joylashsin. (1-dars)`,
      "02 · Header, nav, bitta main va footer bo‘lsin; nav header ichida, dastur va forma main ichida bo‘lsin. (9-dars)",
      `03 · Bitta h1 — “${v.name}”; main ichida kamida ikkita mazmunli h2 va kamida 20 belgilik kirish paragrafi bo‘lsin. (2-dars)`,
      "04 · Nav ichida “#schedule” va “#signup” havolalari bo‘lsin. Ular main ichidagi mavjud, yagona id larga olib borsin. Formaning id qiymati signup bo‘lsin. (5, 11-dars)",
      "05 · Main ichida ishtirokchining uchta tayyorgarlik bosqichini tartibli ro‘yxatda yozing; har bir li mazmunli, ol ning bevosita farzandi bo‘lsin. (4-dars)",
      "06 · Main ichida olib kelinadigan uchta buyumni tartibsiz ro‘yxatda yozing; har bir li mazmunli, ul ning bevosita farzandi bo‘lsin. (4-dars)",
      `07 · #schedule ichida ikki ustunli jadval: “Mashg‘ulot”, “Vaqt” sarlavhalari th bilan, uchta ma’lumot qatori td bilan: ${v.items.map((item, i) => `${item} — ${v.times[i]}`).join("; ")}. (7-dars)`,
      '08 · #signup formasida type="text" ism maydoni, type="email" email maydoni, ikkalasida ham name va yagona id, shu id ga bog‘langan mazmunli label hamda type="submit" tugma bo‘lsin. (8-dars)',
      '09 · Main ichida src="/icon.svg" rasmiga tadbirni ifodalovchi kamida 8 belgilik alt yozing. Rasm yuklanmasa, shu tavsif foydali bo‘lsin. (6-dars)',
      "10 · Main ichida strong bilan muhim ogohlantirish va em bilan alohida urg‘u yozing. Footer ichida br yordamida ikki qatorli aloqa matni yarating. (3-dars)",
      "11 · Main ichidagi p da aynan “<input> & <label>” ko‘rinsin: teglar matn bo‘lishi uchun HTML entities ishlating. (12-dars)",
      `12 · Main ichida class="note" bo‘lgan div va uning ichida mazmunli span bo‘lsin; tuzatishingiz haqida kamida 15 belgilik yangi HTML comment yozing. Footer ichida mailto:${v.contact} manziliga mazmunli havola bo‘lsin. (5, 10, 11-dars)`,
    ],
    reasoning: [
      "Boshlang‘ich koddagi ikkita xatoni tanlang. Har biri nimaga xalaqit beradi va uni qanday tuzatdingiz? “Kod ishlamadi” bilan cheklanmang: foydalanuvchiga ta’sirini tushuntiring. (5 ball)",
      "Nega tayyorgarlik bosqichlari uchun ol, buyumlar uchun ul tanladingiz? Label–input bog‘lanishini o‘z kodingizdan aniq id/for misoli bilan tushuntiring. (5 ball)",
    ],
  };
}
