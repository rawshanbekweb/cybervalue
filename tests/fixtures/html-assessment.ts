import { variants } from "../../src/lib/html-assessment/challenge";

// Test fixture only: this answer is never included in the student application.
export function completedHtml(variant: number) {
  const v = variants[variant % variants.length];
  return `<!DOCTYPE html>
<html lang="uz"><head><meta charset="UTF-8"><title>${v.name}</title></head>
<body><header><h1>${v.name}</h1><nav><a href="#schedule">Dastur</a><a href="#signup">Ishtirok etish</a></nav></header>
<main><p>Ustaxonamizga xush kelibsiz, bugun birgalikda amaliy loyihalar yaratamiz.</p>
<h2>Tayyorgarlik</h2><ol><li>Yo‘nalishni tanlang</li><li>Arizani to‘ldiring</li><li>Tadbirga keling</li></ol>
<ul><li>Daftar</li><li>Qalam</li><li>Noutbuk</li></ul>
<div id="schedule"><h2>Mashg‘ulotlar dasturi</h2><table><tr><th>Mashg‘ulot</th><th>Vaqt</th></tr>
${v.items.map((item, i) => `<tr><td>${item}</td><td>${v.times[i]}</td></tr>`).join("\n")}</table></div>
<h2>Ro‘yxatdan o‘tish</h2><form id="signup"><label for="name">Ismingiz</label><input type="text" id="name" name="student">
<label for="email">Email manzilingiz</label><input type="email" id="email" name="email"><button type="submit">Yuborish</button></form>
<img src="/icon.svg" alt="${v.name} tadbirining belgisi">
<p><strong>Joylar soni cheklangan</strong>. <em>Vaqtida kelishingizni so‘raymiz</em>.</p>
<p>&lt;input&gt; &amp; &lt;label&gt;</p>
<!-- Label va input id qiymatlarini moslashtirdim. -->
<div class="note">Eslatma: <span>Ishtirok etish bepul</span></div></main>
<footer>Tashkilotchi bilan aloqa<br><a href="mailto:${v.contact}">Savollaringizni yuboring</a></footer></body></html>`;
}
