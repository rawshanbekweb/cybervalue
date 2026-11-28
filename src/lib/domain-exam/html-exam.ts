// A gentle HTML exam, from the page skeleton up to forms. Twelve questions
// show a rendered page in a mock browser window and ask which code made it.
// The questions carry their answers, so only server code may import this.
import { q, see, type TopicExam } from "./topic-kit";

const TEXT = 0;
const LINKS = 1;
const LISTS = 2;
const FORMS = 3;

const WHICH: [string, string] = [
  "Brauzerda shunday sahifa ko‘rindi. Uni qaysi kod yasagan?",
  "The browser shows this page. Which code made it?",
];

// "Which code made this page?": the right option is the page's own code.
const which = (
  topic: number,
  options: string[],
  explain: [string, string],
  ask: [string, string] = WHICH,
) => see(q(topic, ask, options, 0, explain), options[0]);

export const HTML_EXAM: TopicExam = {
  id: "html-forms",
  title: {
    uz: "HTML sinovi: sahifadan formagacha",
    en: "HTML trial: from the page to forms",
  },
  minutes: 35,
  modules: [
    {
      title: { uz: "Tuzilma va matn", en: "Structure and text" },
      href: "/akademiya/html-basics",
    },
    {
      title: { uz: "Havolalar va rasmlar", en: "Links and images" },
      href: "/akademiya/html-basics",
    },
    {
      title: { uz: "Ro‘yxatlar va jadvallar", en: "Lists and tables" },
      href: "/akademiya/html-basics",
    },
    {
      title: { uz: "Formalar", en: "Forms" },
      href: "/akademiya/html-basics",
    },
  ],
  questions: [
    // --- Structure and text --------------------------------------------------
    q(
      TEXT,
      [
        "Sahifada ko‘rinadigan hamma narsa qaysi teg ichida turadi?",
        "Which tag holds everything you see on the page?",
      ],
      ["<body>", "<head>", "<title>", "<meta>"],
      0,
      [
        "`<body>` — sahifaning ko‘rinadigan qismi. `<head>` ichida esa sarlavha (`<title>`) va sozlamalar turadi.",
        "`<body>` is the visible part. `<head>` holds the `<title>` and settings.",
      ],
    ),
    which(
      TEXT,
      [
        "<h1>Kiber-kafe</h1>\n<p>Xush kelibsiz!</p>",
        "<p>Kiber-kafe</p>\n<h1>Xush kelibsiz!</h1>",
        "<h6>Kiber-kafe</h6>\n<p>Xush kelibsiz!</p>",
        "<title>Kiber-kafe</title>\n<p>Xush kelibsiz!</p>",
      ],
      [
        "Katta qalin sarlavha — `<h1>`, uning ostidagi oddiy matn — `<p>`. `<h6>` eng kichik sarlavha, `<title>` esa faqat brauzer tabida ko‘rinadi.",
        "The big bold heading is `<h1>` and the plain text under it is `<p>`. `<h6>` is the smallest heading; `<title>` only shows in the tab.",
      ],
    ),
    which(
      TEXT,
      [
        "<p>Bu <strong>juda</strong> muhim</p>",
        "<p>Bu <em>juda</em> muhim</p>",
        "<p>Bu <h1>juda</h1> muhim</p>",
        "<p>Bu <small>juda</small> muhim</p>",
      ],
      [
        "`<strong>` matnni qalin (muhim) qiladi. `<em>` — qiya, `<small>` — kichik.",
        "`<strong>` makes text bold (important). `<em>` is italic, `<small>` smaller.",
      ],
    ),
    which(
      TEXT,
      [
        "<p>Birinchi qism</p>\n<hr>\n<p>Ikkinchi qism</p>",
        "<p>Birinchi qism</p>\n<br>\n<p>Ikkinchi qism</p>",
        "<p>Birinchi qism</p>\n<line>\n<p>Ikkinchi qism</p>",
        "<p>Birinchi qism</p>\n<p>Ikkinchi qism</p>",
      ],
      [
        "Gorizontal chiziqni `<hr>` chizadi. `<br>` faqat yangi qatorga o‘tkazadi, `<line>` degan teg yo‘q.",
        "`<hr>` draws the horizontal line. `<br>` only breaks the line; there is no `<line>` tag.",
      ],
    ),
    q(
      TEXT,
      [
        "Bir paragraf ichida matnni yangi qatordan davom ettirish uchun qaysi teg kerak?",
        "Which tag continues text on a new line inside one paragraph?",
      ],
      ["<br>", "<hr>", "<p>", "<nl>"],
      0,
      [
        "`<br>` — qator uzish (line break). U yopilmaydi.",
        "`<br>` is a line break. It has no closing tag.",
      ],
      "<p>Toshkent sh.<br>Amir Temur ko‘chasi, 1</p>",
    ),
    q(
      TEXT,
      [
        "Bu kod sahifada nimani ko‘rsatadi?",
        "What does this code show on the page?",
      ],
      [
        ["“Salom” va “Dunyo”", "“Salom” and “Dunyo”"],
        [
          "“Salom”, “Bu yashirin” va “Dunyo”",
          "“Salom”, “Bu yashirin” and “Dunyo”",
        ],
        ["Faqat “Salom”", "Only “Salom”"],
        ["Hech narsa — xato bor", "Nothing — there is an error"],
      ],
      0,
      [
        "`<!-- ... -->` — izoh (comment). Brauzer uni ko‘rsatmaydi, u faqat dasturchi uchun.",
        "`<!-- ... -->` is a comment. The browser doesn’t show it; it is for the developer.",
      ],
      "<p>Salom</p>\n<!-- Bu yashirin -->\n<p>Dunyo</p>",
    ),
    q(
      TEXT,
      [
        '`<a href="index.html">` dagi `href` nima deyiladi?',
        'In `<a href="index.html">`, what is `href`?',
      ],
      [
        ["Atribut", "An attribute"],
        ["Teg", "A tag"],
        ["Element", "An element"],
        ["Izoh", "A comment"],
      ],
      0,
      [
        'Atribut — ochuvchi teg ichida yoziladigan qo‘shimcha ma’lumot: `nom="qiymat"`.',
        'An attribute is extra information inside the opening tag: `name="value"`.',
      ],
    ),
    q(
      TEXT,
      [
        "Fayl boshidagi `<!DOCTYPE html>` nima uchun kerak?",
        "Why is `<!DOCTYPE html>` at the top of the file?",
      ],
      [
        [
          "Brauzerga bu zamonaviy HTML (HTML5) hujjat ekanini aytadi",
          "It tells the browser this is a modern HTML (HTML5) document",
        ],
        ["Sahifa sarlavhasini yozadi", "It writes the page title"],
        ["Sahifani yashiradi", "It hides the page"],
        ["CSS faylni ulaydi", "It links the CSS file"],
      ],
      0,
      [
        "`<!DOCTYPE html>` teg emas, e’lon: brauzer sahifani standart rejimda ko‘rsatadi.",
        "`<!DOCTYPE html>` is a declaration, not a tag: the browser renders in standards mode.",
      ],
    ),

    // --- Links and images ----------------------------------------------------
    which(
      LINKS,
      [
        '<a href="index.html">Bosh sahifa</a>',
        '<link href="index.html">Bosh sahifa</link>',
        "<a>index.html</a>",
        '<p href="index.html">Bosh sahifa</p>',
      ],
      [
        'Ko‘k, tagi chizilgan matn — havola: `<a href="...">matn</a>`. `<link>` esa `<head>` da CSS ulash uchun.',
        'Blue underlined text is a link: `<a href="...">text</a>`. `<link>` is for attaching CSS in `<head>`.',
      ],
    ),
    q(
      LINKS,
      [
        "Qaysi kod rasmni to‘g‘ri chiqaradi?",
        "Which code shows the picture correctly?",
      ],
      [
        '<img src="mushuk.jpg" alt="Mushuk">',
        '<img href="mushuk.jpg" alt="Mushuk">',
        "<img>mushuk.jpg</img>",
        '<image src="mushuk.jpg">',
      ],
      0,
      [
        "Rasm fayli `src` atributida beriladi, `alt` — uning matnli tavsifi. `<img>` yopilmaydi.",
        "The image file goes in `src`; `alt` describes it in words. `<img>` has no closing tag.",
      ],
    ),
    q(
      LINKS,
      [
        "Rasm yuklanmasa, uning o‘rnida nima chiqadi?",
        "If the image fails to load, what appears in its place?",
      ],
      [
        [
          "`alt` dagi matn: “Samarqand, Registon”",
          "The `alt` text: “Samarqand, Registon”",
        ],
        ["Fayl nomi registon.jpg", "The file name registon.jpg"],
        ["Qizil xato oynasi", "A red error box"],
        ["Butun sahifa ochilmaydi", "The whole page won’t open"],
      ],
      0,
      [
        "`alt` matni rasm o‘rnida chiqadi va ekran o‘quvchi dasturlar ham uni o‘qiydi.",
        "The `alt` text shows instead, and screen readers read it aloud too.",
      ],
      '<img src="registon.jpg" alt="Samarqand, Registon">',
    ),
    q(
      LINKS,
      [
        "Bosilganda pochta dasturi ochilib, xat yozish boshlanishi kerak. Qaysi havola?",
        "Clicking should open the mail app with a new letter. Which link?",
      ],
      [
        '<a href="mailto:info@kafe.uz">Bizga yozing</a>',
        '<a href="info@kafe.uz">Bizga yozing</a>',
        '<a mail="info@kafe.uz">Bizga yozing</a>',
        '<a href="email:info@kafe.uz">Bizga yozing</a>',
      ],
      0,
      [
        "Email havolasi `mailto:` bilan boshlanadi. Telefon uchun esa `tel:` ishlatiladi.",
        "An email link starts with `mailto:`. A phone link uses `tel:`.",
      ],
    ),
    q(
      LINKS,
      [
        "Havola sahifani yangi tabda ochishi uchun nima qo‘shiladi?",
        "What makes a link open in a new tab?",
      ],
      ['target="_blank"', 'tab="new"', 'href="_blank"', 'open="tab"'],
      0,
      [
        '`target="_blank"` havolani yangi tabda (oynada) ochadi.',
        '`target="_blank"` opens the link in a new tab.',
      ],
    ),
    q(
      LINKS,
      [
        "Rasm 200 piksel kenglikda chiqishi uchun qaysi atribut?",
        "Which attribute shows the picture 200 pixels wide?",
      ],
      ['width="200"', 'size="200"', 'wide="200"', 'height="200"'],
      0,
      [
        "`width` — kenglik, `height` — balandlik. Faqat bittasini bersangiz, rasm o‘z nisbatini saqlaydi.",
        "`width` is the width, `height` the height. Give just one and the picture keeps its proportions.",
      ],
      '<img src="logo.png" alt="Logo" ______>',
    ),
    q(
      LINKS,
      [
        "“Aloqa” havolasi bosilganda o‘sha sahifadagi aloqa bo‘limiga o‘tishi kerak. Bo‘sh joyga nima yoziladi?",
        "Clicking “Aloqa” should jump to the contact section on the same page. What fills the blank?",
      ],
      ["#aloqa", "aloqa.html", "id=aloqa", ".aloqa"],
      0,
      [
        "Sahifa ichidagi joyga havola `#` va o‘sha elementning `id` si bilan yoziladi.",
        "A link to a spot on the page is `#` plus that element’s `id`.",
      ],
      '<a href="______">Aloqa</a>\n...\n<h2 id="aloqa">Biz bilan bog‘laning</h2>',
    ),

    // --- Lists and tables ----------------------------------------------------
    which(
      LISTS,
      [
        "<ul>\n  <li>Non</li>\n  <li>Choy</li>\n  <li>Shakar</li>\n</ul>",
        "<ol>\n  <li>Non</li>\n  <li>Choy</li>\n  <li>Shakar</li>\n</ol>",
        "<p>Non</p>\n<p>Choy</p>\n<p>Shakar</p>",
        "<ul>Non Choy Shakar</ul>",
      ],
      [
        "Nuqtali ro‘yxat — `<ul>` (unordered list), har bir band — `<li>`.",
        "A bulleted list is `<ul>` (unordered list); each item is an `<li>`.",
      ],
    ),
    which(
      LISTS,
      [
        "<ol>\n  <li>Kompyuterni yoq</li>\n  <li>Brauzerni och</li>\n  <li>Saytga kir</li>\n</ol>",
        "<ul>\n  <li>Kompyuterni yoq</li>\n  <li>Brauzerni och</li>\n  <li>Saytga kir</li>\n</ul>",
        "<li>Kompyuterni yoq</li>\n<li>Brauzerni och</li>\n<li>Saytga kir</li>",
        "<ol>Kompyuterni yoq, Brauzerni och, Saytga kir</ol>",
      ],
      [
        "Raqamlangan ro‘yxat — `<ol>` (ordered list): bosqichlar, reyting, ko‘rsatmalar uchun.",
        "A numbered list is `<ol>` (ordered list): for steps, rankings and instructions.",
      ],
    ),
    q(
      LISTS,
      [
        "Ro‘yxatning har bir bandi qaysi tegga yoziladi?",
        "Which tag holds each item of a list?",
      ],
      ["<li>", "<item>", "<ul>", "<td>"],
      0,
      [
        "`<li>` (list item) `<ul>` ichida ham, `<ol>` ichida ham ishlatiladi.",
        "`<li>` (list item) goes inside both `<ul>` and `<ol>`.",
      ],
    ),
    which(
      LISTS,
      [
        "<table>\n  <tr><th>Ism</th><th>Ball</th></tr>\n  <tr><td>Ali</td><td>95</td></tr>\n</table>",
        "<table>\n  <tr><td>Ism</td><td>Ball</td></tr>\n  <tr><td>Ali</td><td>95</td></tr>\n</table>",
        "<table>\n  <th>Ism Ball</th>\n  <td>Ali 95</td>\n</table>",
        "<table>\n  <tr><th>Ism</th><td>Ball</td></tr>\n  <tr><th>Ali</th><td>95</td></tr>\n</table>",
      ],
      [
        "Ustun sarlavhalari qalin va o‘rtada: bu `<th>` (table header). Oddiy kataklar — `<td>`.",
        "The column headers are bold and centred: that is `<th>` (table header). Plain cells are `<td>`.",
      ],
    ),
    q(
      LISTS,
      ["Jadvalda nechta qator bor?", "How many rows does the table have?"],
      ["3", "2", "6", "1"],
      0,
      [
        "Har bir `<tr>` (table row) — bitta qator. Bu yerda uchta `<tr>` bor.",
        "Each `<tr>` (table row) is one row. There are three `<tr>` here.",
      ],
      "<table>\n  <tr><th>Fan</th><th>Baho</th></tr>\n  <tr><td>Matematika</td><td>5</td></tr>\n  <tr><td>Tarix</td><td>4</td></tr>\n</table>",
    ),
    see(
      q(
        LISTS,
        [
          "“Jami” katagi ikki ustunni egallagan. Buni qaysi atribut qilgan?",
          "The “Jami” cell spans two columns. Which attribute did that?",
        ],
        ['colspan="2"', 'rowspan="2"', 'width="2"', 'span="2"'],
        0,
        [
          "`colspan` — katakni yonma-yon ustunlarga cho‘zadi, `rowspan` — pastdagi qatorlarga.",
          "`colspan` stretches a cell across columns; `rowspan` down across rows.",
        ],
      ),
      '<table>\n  <tr><td>Non</td><td>Choy</td><td>5 000</td></tr>\n  <tr><td colspan="2">Jami</td><td>5 000</td></tr>\n</table>',
    ),
    q(
      LISTS,
      [
        "Jadvalning bitta qatori qaysi teg bilan boshlanadi?",
        "Which tag starts one row of a table?",
      ],
      ["<tr>", "<td>", "<th>", "<row>"],
      0,
      [
        "`<tr>` — qator, uning ichida kataklar: `<td>` yoki sarlavha uchun `<th>`.",
        "`<tr>` is a row; inside it go the cells: `<td>`, or `<th>` for headers.",
      ],
    ),

    // --- Forms ---------------------------------------------------------------
    which(
      FORMS,
      [
        '<input type="text" placeholder="Ismingiz">',
        '<input type="text">Ismingiz</input>',
        '<input type="password" placeholder="Ismingiz">',
        "<button>Ismingiz</button>",
      ],
      [
        "Kulrang yordamchi matn — `placeholder`. Foydalanuvchi yoza boshlasa, u yo‘qoladi. `<input>` yopilmaydi.",
        "The grey hint text is `placeholder`; it disappears once the user types. `<input>` has no closing tag.",
      ],
    ),
    which(
      FORMS,
      [
        '<p>Qiziqishlar:</p>\n<label><input type="checkbox"> Futbol</label>\n<label><input type="checkbox"> Shaxmat</label>',
        '<p>Qiziqishlar:</p>\n<label><input type="radio"> Futbol</label>\n<label><input type="radio"> Shaxmat</label>',
        "<p>Qiziqishlar:</p>\n<select><option>Futbol</option><option>Shaxmat</option></select>",
        '<p>Qiziqishlar:</p>\n<input type="text" value="Futbol, Shaxmat">',
      ],
      [
        "Kvadrat belgilar — `checkbox`: bir nechtasini birga tanlash mumkin. Dumaloq — `radio`, faqat bittasi tanlanadi.",
        "Square boxes are `checkbox`: you can tick several. Round ones are `radio`: only one.",
      ],
    ),
    q(
      FORMS,
      [
        "To‘lov turidan faqat bittasini tanlash mumkin bo‘lishi kerak. Nima to‘g‘ri?",
        "Only one payment type may be chosen. What is right?",
      ],
      [
        [
          'Ikkalasi `type="radio"` va bir xil `name`',
          'Both `type="radio"` with the same `name`',
        ],
        ['Ikkalasi `type="checkbox"`', 'Both `type="checkbox"`'],
        [
          'Ikkalasi `type="radio"`, `name` lari har xil',
          'Both `type="radio"` with different `name`s',
        ],
        ['Ikkalasi `type="text"`', 'Both `type="text"`'],
      ],
      0,
      [
        "Bir xil `name` li `radio` tugmalar bitta guruh bo‘ladi: biri tanlansa, boshqasi o‘chadi.",
        "Radio buttons sharing a `name` form one group: picking one clears the other.",
      ],
      '<input type="radio" name="tolov"> Naqd\n<input type="radio" name="tolov"> Karta',
    ),
    which(
      FORMS,
      [
        "<p>Shahar:</p>\n<select>\n  <option>Toshkent</option>\n  <option>Samarqand</option>\n  <option>Buxoro</option>\n</select>",
        '<p>Shahar:</p>\n<input type="text" value="Toshkent">',
        "<p>Shahar:</p>\n<ul>\n  <li>Toshkent</li>\n  <li>Samarqand</li>\n  <li>Buxoro</li>\n</ul>",
        "<p>Shahar:</p>\n<textarea>Toshkent</textarea>",
      ],
      [
        "Ochiladigan ro‘yxat — `<select>`, uning variantlari — `<option>`.",
        "A drop-down list is `<select>`; its choices are `<option>`.",
      ],
    ),
    q(
      FORMS,
      [
        "Foydalanuvchi bir necha qatorli fikr yozishi kerak. Qaysi teg mos?",
        "The user should write a comment several lines long. Which tag fits?",
      ],
      ["<textarea>", '<input type="text">', "<select>", "<label>"],
      0,
      [
        '`<textarea>` ko‘p qatorli matn maydoni. `<input type="text">` faqat bitta qator.',
        '`<textarea>` is a multi-line text box. `<input type="text">` is one line only.',
      ],
    ),
    q(
      FORMS,
      [
        "Email maydoni bo‘sh qolsa, forma yuborilmasligi kerak. Qaysi atribut?",
        "The form must not send if the email field is empty. Which attribute?",
      ],
      ["required", "placeholder", "value", "disabled"],
      0,
      [
        "`required` maydonni majburiy qiladi: bo‘sh bo‘lsa, brauzer formani yubormaydi va ogohlantiradi.",
        "`required` makes the field mandatory: if empty, the browser won’t send the form and warns.",
      ],
      '<input type="email" name="email" ______>',
    ),
    q(
      FORMS,
      [
        "“Email” yozuvi bosilganda kursor maydonga tushishi uchun bo‘sh joyga nima yoziladi?",
        "So that clicking “Email” puts the cursor in the field, what fills the blank?",
      ],
      ['for="email"', 'name="email"', 'id="email"', 'href="email"'],
      0,
      [
        '`<label for="...">` maydonning `id` siga bog‘lanadi. Bu ekran o‘quvchilar uchun ham muhim.',
        '`<label for="...">` points at the field’s `id`. Screen readers rely on it too.',
      ],
      '<label ______>Email</label>\n<input type="email" id="email">',
    ),
    see(
      q(
        FORMS,
        [
          "Bu tugma bosilganda forma ma’lumotlari yuboriladi. Uning kodi qaysi?",
          "Clicking this button sends the form. Which is its code?",
        ],
        [
          '<button type="submit">Yuborish</button>',
          '<button type="reset">Yuborish</button>',
          '<input type="text" value="Yuborish">',
          '<a href="#">Yuborish</a>',
        ],
        0,
        [
          '`type="submit"` formani yuboradi. `type="reset"` esa hamma maydonlarni tozalaydi.',
          '`type="submit"` sends the form. `type="reset"` clears every field.',
        ],
      ),
      '<form>\n  <input type="text" placeholder="Ismingiz">\n  <button type="submit">Yuborish</button>\n</form>',
    ),
  ],
};
