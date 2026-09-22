import { readFile, writeFile } from "node:fs/promises";
const translations = new Map([
  ['lang="uz"', 'lang="en"'],
  ["CyberValue — ovozsiz reklama", "CyberValue — silent advertisement"],
  ["Qayta ko‘rish", "Replay"],
  ["DASTURLASH × VEB XAVFSIZLIGI", "CODING × WEB SECURITY"],
  ["BILIMNI AMALGA AYLANTIRING", "TURN KNOWLEDGE INTO ACTION"],
  ["O‘rgan.", "Learn."],
  ["Yarat.", "Build."],
  ["Himoya qil.", "Secure."],
  ["Brauzerda amaliy o‘rganish.", "Hands-on learning. In your browser."],
  ["Kodni yoz.", "Write code."],
  ["Natijani ko‘r.", "See it live."],
  ["Topshiriq bajarildi", "Challenge complete"],
  ["12 ta mashq. Jonli natija.", "12 exercises. Instant preview."],
  ["Tizimni tushun.", "Know the system."],
  ["Xavfsizlikni", "Learn security."],
  ["amalda o‘rgan.", "Through practice."],
  ["36 dars  /", "36 lessons  /"],
  ["KO‘RISH → BAJARISH → TUSHUNISH", "EXPLORE → PRACTICE → UNDERSTAND"],
  ["Har bir qadam —", "Every step."],
  ["yangi ko‘nikma.", "A new skill."],
  ["HTML mashqi", "HTML exercises"],
  ["Kod + jonli natija", "Code + live preview"],
  ["Xavfsizlik darsi", "Security lessons"],
  ["Nazariya + amaliyot", "Theory + practice"],
  ["Hammasi brauzeringizda.", "All in your browser."],
  ["Bilimingizni amalda sinang.", "Put your knowledge into practice."],
  ["Birinchi mashqni boshlang", "Start your first challenge"],
  ["assets/html.png", "assets/html-en.png"],
  ["assets/lab.png", "assets/lab-en.png"],
]);
let html = await readFile(
  new URL("./cybervalue-ad.html", import.meta.url),
  "utf8",
);
for (const [source, target] of translations) {
  if (!html.includes(source))
    throw new Error(`Translation source missing: ${source}`);
  html = html.replaceAll(source, target);
}
await writeFile(new URL("./cybervalue-ad-en.html", import.meta.url), html);
console.log("English animation source ready.");
