export interface HtmlCheck {
  label: string;
  test: (code: string) => boolean;
}

export interface HtmlLesson {
  id: number;
  title: string;
  intro: string;
  task: string;
  starter: string;
  solution: string;
  checks: HtmlCheck[];
}

export const HTML_LESSONS: HtmlLesson[] = [
  {
    id: 1,
    title: "HTML skeleti",
    intro:
      'Har bir HTML sahifa bir xil "skelet"dan boshlanadi: <!DOCTYPE html>, <html>, <head> va <body>. <head> ichida sahifa haqida meta-maʼlumot bo‘ladi, <body> ichida esa foydalanuvchi ko‘radigan mazmun joylashadi.',
    task: 'Quyidagi kodga <title>Mening sahifam</title> qatorini <head> ichiga, "Salom, HTML!" matnini esa <body> ichiga qo‘shing.',
    starter: `<!DOCTYPE html>\n<html lang="uz">\n<head>\n  <meta charset="UTF-8">\n\n</head>\n<body>\n\n</body>\n</html>`,
    solution: `<!DOCTYPE html>\n<html lang="uz">\n<head>\n  <meta charset="UTF-8">\n  <title>Mening sahifam</title>\n</head>\n<body>\n  Salom, HTML!\n</body>\n</html>`,
    checks: [
      { label: "<!DOCTYPE html> mavjud", test: (c) => /<!doctype html>/i.test(c) },
      { label: "<title> tegi <head> ichida bor", test: (c) => /<title>[^<]*<\/title>/i.test(c) },
      {
        label: "<body> ichida matn bor",
        test: (c) => {
          const m = c.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
          return !!(m && m[1].replace(/<[^>]+>/g, "").trim().length);
        },
      },
    ],
  },
  {
    id: 2,
    title: "Sarlavhalar va paragraflar",
    intro:
      "<h1> dan <h6> gacha sarlavha darajalarini bildiradi — <h1> eng muhimi. Oddiy matn esa <p> (paragraf) ichiga yoziladi. Sahifada odatda bitta <h1> bo‘ladi.",
    task: "Bitta <h1> sarlavha va kamida bitta <p> paragraf qo‘shing.",
    starter: `<!DOCTYPE html>\n<html lang="uz">\n<head><meta charset="UTF-8"></head>\n<body>\n\n</body>\n</html>`,
    solution: `<!DOCTYPE html>\n<html lang="uz">\n<head><meta charset="UTF-8"></head>\n<body>\n  <h1>Mening blogim</h1>\n  <p>Bu mening birinchi HTML sahifam.</p>\n</body>\n</html>`,
    checks: [
      { label: "<h1> mavjud", test: (c) => /<h1[^>]*>[^<]+<\/h1>/i.test(c) },
      { label: "<p> mavjud", test: (c) => /<p[^>]*>[^<]+<\/p>/i.test(c) },
    ],
  },
  {
    id: 3,
    title: "Matnni formatlash",
    intro:
      "<strong> matnni muhim (odatda qalin) qiladi, <em> esa urgʼu beradi (odatda kursiv). <br> qatorni ko‘chiradi, <hr> gorizontal chiziq chizadi.",
    task: "<strong>, <em> va <br> teglaridan kamida bittadan foydalaning.",
    starter: `<!DOCTYPE html>\n<html lang="uz">\n<head><meta charset="UTF-8"></head>\n<body>\n  <p>Bu oddiy matn.</p>\n</body>\n</html>`,
    solution: `<!DOCTYPE html>\n<html lang="uz">\n<head><meta charset="UTF-8"></head>\n<body>\n  <p>Bu <strong>muhim</strong> va <em>urgʼuli</em> matn.<br>Yangi qator shu yerdan boshlanadi.</p>\n</body>\n</html>`,
    checks: [
      { label: "<strong> ishlatilgan", test: (c) => /<strong>[^<]+<\/strong>/i.test(c) },
      { label: "<em> ishlatilgan", test: (c) => /<em>[^<]+<\/em>/i.test(c) },
      { label: "<br> ishlatilgan", test: (c) => /<br\s*\/?>/i.test(c) },
    ],
  },
  {
    id: 4,
    title: "Ro‘yxatlar",
    intro:
      "<ul> — tartibsiz (nuqtali), <ol> — tartibli (raqamli) ro‘yxat. Har ikkalasida ham har bir band <li> ichiga yoziladi.",
    task: "Kamida 3 ta bandli bitta <ul> ro‘yxat yarating.",
    starter: `<!DOCTYPE html>\n<html lang="uz">\n<head><meta charset="UTF-8"></head>\n<body>\n\n</body>\n</html>`,
    solution: `<!DOCTYPE html>\n<html lang="uz">\n<head><meta charset="UTF-8"></head>\n<body>\n  <ul>\n    <li>Non</li>\n    <li>Sut</li>\n    <li>Tuxum</li>\n  </ul>\n</body>\n</html>`,
    checks: [
      { label: "<ul> mavjud", test: (c) => /<ul>/i.test(c) },
      { label: "Kamida 3 ta <li>", test: (c) => (c.match(/<li>/gi) || []).length >= 3 },
    ],
  },
  {
    id: 5,
    title: "Havolalar",
    intro:
      '<a href="...">matn</a> — havola yaratadi. href atributi qayerga o‘tishni ko‘rsatadi. target="_blank" havolani yangi oynada ochadi.',
    task: "href atributiga ega bitta <a> havola qo‘shing.",
    starter: `<!DOCTYPE html>\n<html lang="uz">\n<head><meta charset="UTF-8"></head>\n<body>\n\n</body>\n</html>`,
    solution: `<!DOCTYPE html>\n<html lang="uz">\n<head><meta charset="UTF-8"></head>\n<body>\n  <a href="https://example.test" target="_blank">Saytga o‘tish</a>\n</body>\n</html>`,
    checks: [
      { label: "<a> tegi mavjud", test: (c) => /<a\s/i.test(c) },
      { label: "href atributi bor", test: (c) => /<a\s[^>]*href\s*=\s*["'][^"']+["']/i.test(c) },
    ],
  },
  {
    id: 6,
    title: "Rasmlar",
    intro:
      '<img src="..." alt="..."> rasm qo‘yadi. src — rasm manzili, alt — rasm yuklanmasa yoki ekran o‘quvchi ishlatilsa ko‘rinadigan matn. <img> yopiluvchi tegga muhtoj emas.',
    task: "src va alt atributlariga ega <img> qo‘shing.",
    starter: `<!DOCTYPE html>\n<html lang="uz">\n<head><meta charset="UTF-8"></head>\n<body>\n\n</body>\n</html>`,
    solution: `<!DOCTYPE html>\n<html lang="uz">\n<head><meta charset="UTF-8"></head>\n<body>\n  <img src="https://picsum.photos/200" alt="Tasodifiy rasm" width="200">\n</body>\n</html>`,
    checks: [
      { label: "<img> tegi mavjud", test: (c) => /<img\s/i.test(c) },
      { label: "src atributi bor", test: (c) => /<img\s[^>]*src\s*=\s*["'][^"']+["']/i.test(c) },
      { label: "alt atributi bor", test: (c) => /<img\s[^>]*alt\s*=\s*["'][^"']*["']/i.test(c) },
    ],
  },
  {
    id: 7,
    title: "Jadvallar",
    intro: "<table> jadval yaratadi. <tr> — qator, <th> — sarlavha katakchasi, <td> — oddiy katakcha.",
    task: "Kamida 2 qatorli, sarlavhali bitta jadval yarating.",
    starter: `<!DOCTYPE html>\n<html lang="uz">\n<head><meta charset="UTF-8"></head>\n<body>\n\n</body>\n</html>`,
    solution: `<!DOCTYPE html>\n<html lang="uz">\n<head><meta charset="UTF-8"></head>\n<body>\n  <table border="1">\n    <tr><th>Ism</th><th>Yosh</th></tr>\n    <tr><td>Ali</td><td>21</td></tr>\n  </table>\n</body>\n</html>`,
    checks: [
      { label: "<table> mavjud", test: (c) => /<table/i.test(c) },
      { label: "<th> mavjud", test: (c) => /<th>/i.test(c) },
      { label: "Kamida 2 ta <tr>", test: (c) => (c.match(/<tr>/gi) || []).length >= 2 },
    ],
  },
  {
    id: 8,
    title: "Formalar va inputlar",
    intro:
      "<form> foydalanuvchidan maʼlumot yigʼadi. <input> turli type ga ega bo‘lishi mumkin (text, email, password...). <label> input’ni tushuntiradi, <button> yuboradi.",
    task: 'type="text" inputga ega <label> bilan bogʼlangan forma va <button> qo‘shing.',
    starter: `<!DOCTYPE html>\n<html lang="uz">\n<head><meta charset="UTF-8"></head>\n<body>\n\n</body>\n</html>`,
    solution: `<!DOCTYPE html>\n<html lang="uz">\n<head><meta charset="UTF-8"></head>\n<body>\n  <form>\n    <label for="ism">Ismingiz:</label>\n    <input type="text" id="ism" name="ism">\n    <button type="submit">Yuborish</button>\n  </form>\n</body>\n</html>`,
    checks: [
      { label: "<form> mavjud", test: (c) => /<form/i.test(c) },
      { label: "<input> mavjud", test: (c) => /<input\s/i.test(c) },
      { label: "<label> mavjud", test: (c) => /<label/i.test(c) },
      { label: "<button> mavjud", test: (c) => /<button/i.test(c) },
    ],
  },
  {
    id: 9,
    title: "Semantik teglar",
    intro:
      "<div> o‘rniga maʼno bildiruvchi teglar ishlatish tavsiya etiladi: <header> (sahifa boshi), <nav> (menyu), <main> (asosiy mazmun), <footer> (sahifa oxiri). Bu qidiruv tizimlari va ekran o‘quvchilar uchun foydali.",
    task: "<header>, <main> va <footer> teglarini qo‘shing.",
    starter: `<!DOCTYPE html>\n<html lang="uz">\n<head><meta charset="UTF-8"></head>\n<body>\n\n</body>\n</html>`,
    solution: `<!DOCTYPE html>\n<html lang="uz">\n<head><meta charset="UTF-8"></head>\n<body>\n  <header><h1>Sayt nomi</h1></header>\n  <main><p>Asosiy mazmun shu yerda.</p></main>\n  <footer><p>&copy; 2026</p></footer>\n</body>\n</html>`,
    checks: [
      { label: "<header> mavjud", test: (c) => /<header/i.test(c) },
      { label: "<main> mavjud", test: (c) => /<main/i.test(c) },
      { label: "<footer> mavjud", test: (c) => /<footer/i.test(c) },
    ],
  },
  {
    id: 10,
    title: "div va span",
    intro:
      "<div> — block darajali umumiy konteyner (o‘z qatoridan boshlanadi). <span> — inline konteyner (matn ichida qoladi). Ular hech qanday o‘z maʼnosiga ega emas, faqat guruhlash uchun.",
    task: "Bitta <div> ichida bitta <span> ishlatilgan matn yarating.",
    starter: `<!DOCTYPE html>\n<html lang="uz">\n<head><meta charset="UTF-8"></head>\n<body>\n\n</body>\n</html>`,
    solution: `<!DOCTYPE html>\n<html lang="uz">\n<head><meta charset="UTF-8"></head>\n<body>\n  <div>\n    Bu paragraf ichida <span style="color:red">qizil</span> so‘z bor.\n  </div>\n</body>\n</html>`,
    checks: [
      { label: "<div> mavjud", test: (c) => /<div/i.test(c) },
      { label: "<span> mavjud", test: (c) => /<span/i.test(c) },
    ],
  },
  {
    id: 11,
    title: "Atributlar, id/class va izohlar",
    intro:
      "Har qanday tegga id (noyob nom) yoki class (guruh nomi) berish mumkin — keyinchalik CSS yoki JavaScript ular orqali murojaat qiladi. <!-- izoh --> kod ichida ko‘rinmaydigan eslatma qoldiradi.",
    task: "id atributiga ega bitta element, class atributiga ega yana bitta element va bitta HTML izoh qo‘shing.",
    starter: `<!DOCTYPE html>\n<html lang="uz">\n<head><meta charset="UTF-8"></head>\n<body>\n\n</body>\n</html>`,
    solution: `<!DOCTYPE html>\n<html lang="uz">\n<head><meta charset="UTF-8"></head>\n<body>\n  <!-- Bu sarlavha uchun maxsus id -->\n  <h2 id="asosiy-sarlavha">Salom</h2>\n  <p class="izoh">Bu class bilan belgilangan paragraf.</p>\n</body>\n</html>`,
    checks: [
      { label: "id atributi ishlatilgan", test: (c) => /\sid\s*=\s*["'][^"']+["']/i.test(c) },
      { label: "class atributi ishlatilgan", test: (c) => /\sclass\s*=\s*["'][^"']+["']/i.test(c) },
      { label: "HTML izoh mavjud", test: (c) => /<!--[\s\S]*?-->/.test(c) },
    ],
  },
  {
    id: 12,
    title: "Maxsus belgilar",
    intro:
      'Baʼzi belgilar (<, >, &) HTML sintaksisida maxsus maʼnoga ega, shuning uchun ularni to‘gʼridan-to‘gʼri yozib bo‘lmaydi. Ular o‘rniga "entity" ishlatiladi: &lt; (<), &gt; (>), &amp; (&), &copy; (©), &nbsp; (bo‘shliq).',
    task: 'Matningizda &lt;, &gt; yoki &amp; dan kamida bittasini ko‘rinadigan matn sifatida ishlating (masalan: "5 &lt; 10").',
    starter: `<!DOCTYPE html>\n<html lang="uz">\n<head><meta charset="UTF-8"></head>\n<body>\n\n</body>\n</html>`,
    solution: `<!DOCTYPE html>\n<html lang="uz">\n<head><meta charset="UTF-8"></head>\n<body>\n  <p>Matematikada: 5 &lt; 10 va 2 &amp; 2 = 4 emas, chunki &amp; mantiqiy amal.</p>\n</body>\n</html>`,
    checks: [{ label: "Kamida bitta entity (&lt; &gt; &amp; &copy; &nbsp;) ishlatilgan", test: (c) => /&(lt|gt|amp|copy|nbsp);/i.test(c) }],
  },
];
