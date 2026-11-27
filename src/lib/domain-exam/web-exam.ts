// A practice exam on HTML, CSS and JavaScript up to if/else. Most questions
// show a short piece of code and ask what the page or console shows. The
// questions carry their answers, so only server code may import this file.
import { q, type TopicExam } from "./topic-kit";

const HTML = 0;
const CSS = 1;
const JS = 2;
const IF = 3;

/** What the exam's own tests treat as "this code throws". */
export const THROWS = "Xato (TypeError)";

export const WEB_EXAM: TopicExam = {
  id: "web-html-css-js",
  title: {
    uz: "Veb-dasturchi sinovi: HTML, CSS va JavaScript",
    en: "Web developer trial: HTML, CSS and JavaScript",
  },
  minutes: 40,
  modules: [
    {
      title: { uz: "HTML: sahifa tuzilmasi", en: "HTML: page structure" },
      href: "/akademiya/html-basics",
    },
    {
      title: {
        uz: "CSS: selektorlar va bezak",
        en: "CSS: selectors and style",
      },
      href: "/akademiya/studio",
    },
    {
      title: {
        uz: "JavaScript: o‘zgaruvchilar va amallar",
        en: "JavaScript: variables and operators",
      },
      href: "/akademiya/studio",
    },
    {
      title: {
        uz: "JavaScript: shartlar (if / else)",
        en: "JavaScript: conditions (if / else)",
      },
      href: "/akademiya/studio",
    },
  ],
  questions: [
    // --- HTML ----------------------------------------------------------------
    q(
      HTML,
      [
        "Brauzer tabida saytingiz nomi “Kiber-kafe” bo‘lib chiqishi kerak. Qaysi teg buni qiladi?",
        "The browser tab should read “Kiber-kafe”. Which tag does that?",
      ],
      [
        "<title>Kiber-kafe</title>",
        "<h1>Kiber-kafe</h1>",
        "<header>Kiber-kafe</header>",
        "<meta>Kiber-kafe</meta>",
      ],
      0,
      [
        "`<title>` `<head>` ichida turadi va tab hamda qidiruv natijalaridagi nomni beradi. `<h1>` esa sahifaning o‘zidagi eng katta sarlavha.",
        "`<title>` sits in `<head>` and names the tab and search results. `<h1>` is the biggest heading on the page itself.",
      ],
    ),
    q(
      HTML,
      [
        "Bu kod sahifada qanday ko‘rinadi?",
        "How does this code look on the page?",
      ],
      [
        "1. Non  2. Choy  3. Shakar",
        "• Non  • Choy  • Shakar",
        "Non Choy Shakar (bir qatorda)",
        ["Hech narsa ko‘rinmaydi", "Nothing is shown"],
      ],
      0,
      [
        "`<ol>` — tartiblangan (ordered) ro‘yxat, shuning uchun elementlar raqamlanadi. Nuqtali ro‘yxat uchun `<ul>` ishlatiladi.",
        "`<ol>` is an ordered list, so the items are numbered. A bulleted list uses `<ul>`.",
      ],
      "<ol>\n  <li>Non</li>\n  <li>Choy</li>\n  <li>Shakar</li>\n</ol>",
    ),
    q(
      HTML,
      [
        "Ko‘zi ojiz foydalanuvchining ekran o‘quvchisi rasmni “Sardor futbol o‘ynayapti” deb o‘qishi kerak. Qaysi atribut kerak?",
        "A blind user’s screen reader should read the picture as “Sardor playing football”. Which attribute is needed?",
      ],
      ["alt", "src", "href", "title"],
      0,
      [
        "`alt` rasmning matnli tavsifi: ekran o‘quvchilar uni o‘qiydi, rasm yuklanmasa ham shu matn chiqadi. `src` — rasm fayli manzili.",
        "`alt` is the text description: screen readers read it, and it shows if the image fails to load. `src` is the file’s address.",
      ],
      '<img src="sardor.jpg" alt="Sardor futbol o‘ynayapti">',
    ),
    q(
      HTML,
      [
        "Bu jadvalda nechta katak (`td`) bor?",
        "How many cells (`td`) does this table have?",
      ],
      ["6", "2", "3", "5"],
      0,
      [
        "Ikki qator (`tr`), har birida uchta katak (`td`): 2 × 3 = 6.",
        "Two rows (`tr`) with three cells (`td`) each: 2 × 3 = 6.",
      ],
      "<table>\n  <tr><td>Ali</td><td>9</td><td>A</td></tr>\n  <tr><td>Vali</td><td>8</td><td>B</td></tr>\n</table>",
    ),
    q(
      HTML,
      [
        "Qaysi kod teglarni to‘g‘ri ichma-ich joylashtirgan?",
        "Which code nests the tags correctly?",
      ],
      [
        "<p>Salom <b>dunyo</b></p>",
        "<p>Salom <b>dunyo</p></b>",
        "<b><p>Salom dunyo</b></p>",
        "<p>Salom <b>dunyo</p>",
      ],
      0,
      [
        "Ichkarida ochilgan teg birinchi yopiladi: `<b>` `<p>` ichida ochilgan, demak `</b>` `</p>` dan oldin keladi.",
        "The tag opened last closes first: `<b>` opens inside `<p>`, so `</b>` comes before `</p>`.",
      ],
    ),
    q(
      HTML,
      [
        "Parol kiritilganda harflar o‘rniga nuqtalar ko‘rinishi kerak. Qaysi `input` kerak?",
        "Typed password letters should show as dots. Which `input` is it?",
      ],
      [
        '<input type="password">',
        '<input type="text">',
        '<input type="hidden">',
        '<input type="secret">',
      ],
      0,
      [
        '`type="password"` yozilganini yashiradi. `hidden` maydonni umuman ko‘rsatmaydi, `secret` degan tur esa yo‘q.',
        '`type="password"` masks what is typed. `hidden` shows no field at all, and there is no `secret` type.',
      ],
    ),
    q(
      HTML,
      [
        "Qaysi teg yopilmaydi (yopuvchi jufti yo‘q)?",
        "Which tag has no closing tag?",
      ],
      ["<img>", "<p>", "<div>", "<a>"],
      0,
      [
        "`<img>` (shuningdek `<br>`, `<input>`, `<meta>`) bo‘sh element: ichiga matn olmaydi, shuning uchun `</img>` yozilmaydi.",
        "`<img>` (like `<br>`, `<input>`, `<meta>`) is a void element: it holds no content, so there is no `</img>`.",
      ],
    ),
    q(
      HTML,
      [
        "“© 2026 Kiber-kafe” yozuvi har bir sahifaning eng pastida turadi. Unga eng mos semantik teg qaysi?",
        "“© 2026 Kiber-kafe” sits at the very bottom of every page. Which semantic tag fits best?",
      ],
      ["<footer>", "<header>", "<nav>", "<aside>"],
      0,
      [
        "`<footer>` sahifa yoki bo‘limning pastki qismi: mualliflik, aloqa, havolalar. `<header>` — tepa qism, `<nav>` — menyu.",
        "`<footer>` is the bottom of a page or section: copyright, contacts, links. `<header>` is the top, `<nav>` the menu.",
      ],
    ),
    q(
      HTML,
      [
        "Havola bosilganda sayt yangi tabda ochilishi kerak. Nima qo‘shiladi?",
        "Clicking the link should open the site in a new tab. What do you add?",
      ],
      ['target="_blank"', 'href="_new"', 'open="tab"', 'rel="tab"'],
      0,
      [
        '`target="_blank"` havolani yangi tabda ochadi. `href` faqat manzilni bildiradi.',
        '`target="_blank"` opens the link in a new tab. `href` only holds the address.',
      ],
      '<a href="https://example.com">Do‘kon</a>',
    ),
    q(
      HTML,
      [
        "Bu sahifadagi matn bosilganda nima bo‘ladi?",
        "What happens when you click the text on this page?",
      ],
      [
        [
          "“Bosh sahifa” matni ko‘rinadi, bosilsa cybervalue.uz ochiladi",
          "“Bosh sahifa” is shown; clicking it opens cybervalue.uz",
        ],
        [
          "Sahifada https://cybervalue.uz yozuvi ko‘rinadi",
          "The page shows the text https://cybervalue.uz",
        ],
        [
          "Hech narsa bo‘lmaydi, chunki bu `<button>` emas",
          "Nothing, because it isn’t a `<button>`",
        ],
        ["Sahifa qayta yuklanadi", "The page reloads"],
      ],
      0,
      [
        "`<a>` ichidagi matn ko‘rinadi, `href` dagi manzil esa bosilganda ochiladi.",
        "The text inside `<a>` is shown; the address in `href` opens on click.",
      ],
      '<a href="https://cybervalue.uz">Bosh sahifa</a>',
    ),

    // --- CSS -----------------------------------------------------------------
    q(
      CSS,
      [
        "“Diqqat!” matni qaysi rangda bo‘ladi?",
        "What colour is the text “Diqqat!”?",
      ],
      [
        ["Ko‘k (blue)", "Blue"],
        ["Qizil (red)", "Red"],
        ["Qora (standart)", "Black (default)"],
        ["Binafsha (qizil + ko‘k)", "Purple (red + blue)"],
      ],
      0,
      [
        "Klass selektori (`.muhim`) teg selektoridan (`p`) kuchliroq, shuning uchun ko‘k yutadi. CSS ranglarni aralashtirmaydi.",
        "A class selector (`.muhim`) beats a tag selector (`p`), so blue wins. CSS never mixes the colours.",
      ],
      'p { color: red; }\n.muhim { color: blue; }\n\n<p class="muhim">Diqqat!</p>',
    ),
    q(
      CSS,
      ["Logotip qaysi rangda bo‘ladi?", "What colour is the logo?"],
      [
        ["Yashil (green)", "Green"],
        ["To‘q sariq (orange)", "Orange"],
        ["Qora (standart)", "Black (default)"],
        ["Qaysi qoida pastda bo‘lsa, o‘sha", "Whichever rule comes last"],
      ],
      0,
      [
        "`id` selektori (`#logo`) klass selektoridan (`.logo`) kuchliroq — tartibidan qat’i nazar yashil yutadi.",
        "An `id` selector (`#logo`) beats a class selector (`.logo`), whatever the order, so green wins.",
      ],
      '.logo { color: orange; }\n#logo { color: green; }\n\n<h1 id="logo" class="logo">CyberValue</h1>',
    ),
    q(
      CSS,
      [
        '`class="card"` bo‘lgan barcha elementlarni qaysi selektor tanlaydi?',
        'Which selector picks every element with `class="card"`?',
      ],
      [".card", "#card", "card", "*card"],
      0,
      [
        "Nuqta (`.`) — klass, panjara (`#`) — id, nuqtasiz `card` esa `<card>` degan tegni qidiradi.",
        "A dot (`.`) means class, a hash (`#`) means id, and plain `card` looks for a `<card>` tag.",
      ],
    ),
    q(
      CSS,
      [
        "Quti ekranda jami necha piksel kenglikda bo‘ladi? (`box-sizing` standart holatda)",
        "How wide is the box on screen in total? (default `box-sizing`)",
      ],
      ["230px", "200px", "215px", "220px"],
      0,
      [
        "Standart `content-box` da: 200 (kontent) + 10 + 10 (padding chap/o‘ng) + 5 + 5 (border) = 230px. Margin tashqarida, kenglikka kirmaydi.",
        "With the default `content-box`: 200 (content) + 10 + 10 (padding) + 5 + 5 (border) = 230px. Margin is outside and doesn’t count.",
      ],
      ".box {\n  width: 200px;\n  padding: 10px;\n  border: 5px solid black;\n  margin: 20px;\n}",
    ),
    q(
      CSS,
      [
        "Ikki qoida bir xil selektorga ega. Sarlavha qaysi rangda?",
        "Two rules share the same selector. What colour is the heading?",
      ],
      [
        ["Binafsha (purple)", "Purple"],
        ["Qizil (red)", "Red"],
        ["Ikkalasi navbatma-navbat", "Both, taking turns"],
        ["Qora, chunki qoidalar to‘qnashdi", "Black, because the rules clash"],
      ],
      0,
      [
        "Kuchi teng bo‘lsa, keyin yozilgan qoida yutadi — CSS “kaskad” deyilishining sababi shu.",
        "When the strength is equal, the later rule wins — that is the “cascade” in CSS.",
      ],
      "h2 { color: red; }\nh2 { color: purple; }",
    ),
    q(
      CSS,
      ["Matn nega qizil bo‘lmayapti?", "Why isn’t the text red?"],
      [
        [
          "`color` dan keyin ikki nuqta (`:`) yo‘q",
          "There is no colon (`:`) after `color`",
        ],
        [
          "`red` o‘rniga `#red` yozish kerak",
          "It should say `#red`, not `red`",
        ],
        [
          "`p` selektori faqat sarlavhalarda ishlaydi",
          "The `p` selector only works on headings",
        ],
        ["Nuqta-vergul ortiqcha", "The semicolon is extra"],
      ],
      0,
      [
        "Xususiyat va qiymat ikki nuqta bilan ajratiladi: `color: red;`. Brauzer noto‘g‘ri yozilgan qatorni jimgina tashlab ketadi.",
        "A property and its value are separated by a colon: `color: red;`. The browser silently drops a malformed line.",
      ],
      "p {\n  color red;\n}",
    ),
    q(
      CSS,
      [
        "Tugma matni bilan uning chegarasi (border) orasiga joy qo‘shmoqchisiz. Qaysi xususiyat kerak?",
        "You want space between a button’s text and its border. Which property?",
      ],
      ["padding", "margin", "gap", "border-spacing"],
      0,
      [
        "`padding` — chegaraning ichidagi bo‘shliq, `margin` — chegaradan tashqaridagi, qo‘shni elementlar bilan oradagi bo‘shliq.",
        "`padding` is the space inside the border; `margin` is the space outside it, between neighbours.",
      ],
    ),
    q(
      CSS,
      ["Paragraf qaysi rangda bo‘ladi?", "What colour is the paragraph?"],
      [
        ["Pushti (pink)", "Pink"],
        ["Ko‘k (blue)", "Blue"],
        ["Qora (standart)", "Black (default)"],
        [
          "Ko‘k, chunki CSS fayli keyin yuklanadi",
          "Blue, because the CSS file loads later",
        ],
      ],
      0,
      [
        '`style="..."` atributi (inline uslub) teg, klass va id selektorlaridan kuchliroq.',
        'A `style="..."` attribute (inline style) beats tag, class and id selectors.',
      ],
      'p { color: blue; }\n\n<p style="color: pink;">Salom!</p>',
    ),
    q(
      CSS,
      ["Qaysi havolalar sariq bo‘ladi?", "Which links turn yellow?"],
      [
        ["Faqat `<nav>` ichidagi havolalar", "Only the links inside `<nav>`"],
        ["Sahifadagi barcha havolalar", "Every link on the page"],
        ["Faqat `<nav>` ning o‘zi", "Only the `<nav>` itself"],
        ["Hech biri — selektor noto‘g‘ri", "None — the selector is invalid"],
      ],
      0,
      [
        "Probel bilan yozilgan `nav a` — avlod selektori: faqat `<nav>` ichida joylashgan `<a>` larni tanlaydi.",
        "`nav a` with a space is a descendant selector: it picks only the `<a>` elements inside a `<nav>`.",
      ],
      "nav a { color: yellow; }",
    ),
    q(
      CSS,
      [
        "Svetoforning bir chirog‘i `#00ff00` rangida. U qaysi chiroq?",
        "One traffic light lamp is `#00ff00`. Which lamp is it?",
      ],
      [
        ["Yashil", "Green"],
        ["Qizil", "Red"],
        ["Sariq", "Yellow"],
        ["Oq", "White"],
      ],
      0,
      [
        "Hex rang `#RRGGBB`: qizil 00, yashil ff (eng ko‘p), ko‘k 00 — toza yashil. `#ff0000` qizil, `#ffff00` sariq, `#ffffff` oq.",
        "Hex is `#RRGGBB`: red 00, green ff (full), blue 00 — pure green. `#ff0000` is red, `#ffff00` yellow, `#ffffff` white.",
      ],
    ),

    // --- JavaScript: variables and operators --------------------------------
    q(
      JS,
      ["Konsolda nima chiqadi?", "What does the console print?"],
      ["11", "16", "10", "53"],
      0,
      [
        "Ko‘paytirish qo‘shishdan oldin bajariladi: 3 * 2 = 6, keyin 5 + 6 = 11. (5 + 3) * 2 = 16 bo‘lishi uchun qavs kerak edi.",
        "Multiplication goes before addition: 3 * 2 = 6, then 5 + 6 = 11. Getting 16 would need brackets: (5 + 3) * 2.",
      ],
      "let a = 5;\nlet b = 3;\nconsole.log(a + b * 2);",
    ),
    q(
      JS,
      ["Konsolda nima chiqadi?", "What does the console print?"],
      ["53", "8", "5 3", THROWS],
      0,
      [
        'Agar `+` ning bir tomoni matn (string) bo‘lsa, JavaScript sonni ham matnga aylantirib yopishtiradi: "5" + 3 → "53".',
        'If either side of `+` is a string, JavaScript turns the number into text and joins them: "5" + 3 → "53".',
      ],
      'console.log("5" + 3);',
    ),
    q(
      JS,
      [
        "Endi-chi? Konsolda nima chiqadi?",
        "And now? What does the console print?",
      ],
      ["6", "104", "10-4", "NaN"],
      0,
      [
        '`-` faqat sonlar uchun, shuning uchun "10" songa aylanadi: 10 - 4 = 6. Matnlarni faqat `+` yopishtiradi.',
        '`-` only works on numbers, so "10" becomes a number: 10 - 4 = 6. Only `+` joins strings.',
      ],
      'console.log("10" - 4);',
    ),
    q(
      JS,
      [
        "17 ta konfetni 5 ta bolaga teng bo‘ldingiz. Qancha ortib qoladi?",
        "You share 17 sweets equally among 5 children. How many are left over?",
      ],
      ["2", "3", "3.4", "12"],
      0,
      [
        "`%` — bo‘lishdagi qoldiq: 17 = 5 × 3 + 2, demak 2 ta ortadi.",
        "`%` is the remainder: 17 = 5 × 3 + 2, so 2 are left.",
      ],
      "console.log(17 % 5);",
    ),
    q(
      JS,
      ["Bu kod ishga tushganda nima bo‘ladi?", "What happens when this runs?"],
      ["3.14", "3", THROWS, "undefined"],
      2,
      [
        "`const` bilan e’lon qilingan o‘zgaruvchiga qayta qiymat berib bo‘lmaydi: “Assignment to constant variable” xatosi chiqadi. O‘zgaradigan qiymat uchun `let` ishlatiladi.",
        "A `const` can’t be given a new value: you get “Assignment to constant variable”. Use `let` for a value that changes.",
      ],
      "const pi = 3.14;\npi = 3;\nconsole.log(pi);",
    ),
    q(
      JS,
      ["Konsolda nima chiqadi?", "What does the console print?"],
      ["Salom, Ali!", "Salom, ism!", "Salom,Ali!", '"Salom, " + Ali + "!"'],
      0,
      [
        '`ism` qo‘shtirnoqsiz yozilgan — bu o‘zgaruvchi, uning qiymati "Ali" qo‘yiladi. Probel "Salom, " ning ichida bor.',
        '`ism` has no quotes, so it is the variable and its value "Ali" goes in. The space is inside "Salom, ".',
      ],
      'let ism = "Ali";\nconsole.log("Salom, " + ism + "!");',
    ),
    q(
      JS,
      ["Konsolda nima chiqadi?", "What does the console print?"],
      ["true false", "true true", "false false", "false true"],
      0,
      [
        '`==` turini o‘zgartirib solishtiradi ("5" → 5), shuning uchun `true`. `===` turini ham tekshiradi: son va matn har xil, demak `false`.',
        '`==` converts types before comparing ("5" → 5), so `true`. `===` also checks the type: a number and a string differ, so `false`.',
      ],
      'console.log(5 == "5", 5 === "5");',
    ),
    q(
      JS,
      ["Konsolda nima chiqadi?", "What does the console print?"],
      ["30", "25", "20", "10"],
      0,
      [
        "Qadamma-qadam: x = 10, keyin 10 + 5 = 15, keyin 15 * 2 = 30.",
        "Step by step: x = 10, then 10 + 5 = 15, then 15 * 2 = 30.",
      ],
      "let x = 10;\nx = x + 5;\nx = x * 2;\nconsole.log(x);",
    ),
    q(
      JS,
      [
        "Qaysi nom o‘zgaruvchi nomi bo‘la olmaydi?",
        "Which name can’t be a variable name?",
      ],
      ["2ball", "ball2", "_ball", "$ball"],
      0,
      [
        "O‘zgaruvchi nomi raqam bilan boshlanmaydi. Harf, `_` yoki `$` bilan boshlash mumkin, raqam keyin kelishi mumkin.",
        "A variable name can’t start with a digit. It may start with a letter, `_` or `$`, with digits after.",
      ],
    ),

    // --- JavaScript: if / else ----------------------------------------------
    q(
      IF,
      [
        "Kinoteatr kassasi. Ekranda nima chiqadi?",
        "A cinema ticket desk. What does it print?",
      ],
      ["Hali erta", "Kirishingiz mumkin", "Ikkalasi ham", "Hech narsa"],
      0,
      [
        "15 >= 18 yolg‘on (`false`), shuning uchun `else` bloki ishlaydi.",
        "15 >= 18 is `false`, so the `else` block runs.",
      ],
      'let yosh = 15;\nif (yosh >= 18) {\n  console.log("Kirishingiz mumkin");\n} else {\n  console.log("Hali erta");\n}',
    ),
    q(
      IF,
      [
        "Imtihon bahosi. 85 ball qaysi baho?",
        "Exam grades. What grade is 85 points?",
      ],
      ["B", "A", "C", "B C"],
      0,
      [
        'Shartlar yuqoridan tekshiriladi: 85 >= 90 yolg‘on, 85 >= 80 rost → "B". Birinchi rost shartdan keyin qolganlari tekshirilmaydi.',
        'Conditions are checked top-down: 85 >= 90 is false, 85 >= 80 is true → "B". After the first true one the rest are skipped.',
      ],
      'let ball = 85;\nif (ball >= 90) {\n  console.log("A");\n} else if (ball >= 80) {\n  console.log("B");\n} else if (ball >= 70) {\n  console.log("C");\n} else {\n  console.log("D");\n}',
    ),
    q(
      IF,
      [
        "Tuzoq! x 3 ga teng, lekin ekranda nima chiqadi?",
        "A trap! x is 3, but what does it print?",
      ],
      ["besh", "besh emas", THROWS, "Hech narsa"],
      0,
      [
        "`x = 5` solishtirish emas, qiymat berish: x 5 ga aylanadi, 5 esa rost (truthy) hisoblanadi. Solishtirish uchun `===` yozish kerak edi.",
        "`x = 5` is assignment, not comparison: x becomes 5, and 5 counts as true. Comparing needs `===`.",
      ],
      'let x = 3;\nif (x = 5) {\n  console.log("besh");\n} else {\n  console.log("besh emas");\n}',
    ),
    q(
      IF,
      [
        "Kursdan o‘tish uchun ball ham, davomat ham kerak. Natija?",
        "Passing needs both the score and attendance. The result?",
      ],
      ["Qoldi", "O‘tdi", "O‘tdi Qoldi", THROWS],
      0,
      [
        "`&&` (VA) ikkala tomon ham rost bo‘lsagina rost. ball >= 60 rost, lekin `davomat` yolg‘on → `else`.",
        "`&&` (AND) is true only if both sides are. ball >= 60 is true but `davomat` is false → `else`.",
      ],
      'let ball = 75;\nlet davomat = false;\nif (ball >= 60 && davomat) {\n  console.log("O‘tdi");\n} else {\n  console.log("Qoldi");\n}',
    ),
    q(
      IF,
      ["Bugun qanday kun?", "What kind of day is today?"],
      ["Dam olish", "Ish kuni", "shanba", THROWS],
      0,
      [
        '`||` (YOKI) bir tomoni rost bo‘lsa yetadi: kun === "shanba" rost.',
        '`||` (OR) needs just one true side: kun === "shanba" is true.',
      ],
      'let kun = "shanba";\nif (kun === "shanba" || kun === "yakshanba") {\n  console.log("Dam olish");\n} else {\n  console.log("Ish kuni");\n}',
    ),
    q(
      IF,
      [
        "Havo 35°. Dastur nima deydi? (Tartibga e’tibor bering!)",
        "It’s 35°. What does the program say? (Mind the order!)",
      ],
      ["Iliq", "Issiq", "Iliq Issiq", "Sovuq"],
      0,
      [
        '35 > 20 birinchi bo‘lib rost bo‘ladi va "Iliq" chiqadi — `else if (harorat > 30)` ga navbat yetmaydi. Kattaroq chegarani birinchi tekshirish kerak.',
        '35 > 20 is true first, so "Iliq" prints and `else if (harorat > 30)` never gets a turn. Check the bigger limit first.',
      ],
      'let harorat = 35;\nif (harorat > 20) {\n  console.log("Iliq");\n} else if (harorat > 30) {\n  console.log("Issiq");\n} else {\n  console.log("Sovuq");\n}',
    ),
    q(
      IF,
      ["7 juftmi yoki toq?", "Is 7 even or odd?"],
      ["toq", "juft", "1", THROWS],
      0,
      [
        '7 % 2 = 1, 1 === 0 yolg‘on, shuning uchun `else` → "toq". Juft sonlarda 2 ga bo‘lgandagi qoldiq 0.',
        '7 % 2 = 1, and 1 === 0 is false, so `else` → "toq" (odd). Even numbers leave remainder 0.',
      ],
      'let n = 7;\nif (n % 2 === 0) {\n  console.log("juft");\n} else {\n  console.log("toq");\n}',
    ),
    q(
      IF,
      [
        "Saytga kirgan oddiy foydalanuvchi qaysi sahifani ko‘radi?",
        "Which page does a signed-in regular user see?",
      ],
      ["Profil", "Admin panel", "Kirish", "Admin panel Profil"],
      0,
      [
        'Tashqi `if (login)` rost, ichkaridagi `if (admin)` yolg‘on → ichki `else` → "Profil".',
        'The outer `if (login)` is true, the inner `if (admin)` false → the inner `else` → "Profil".',
      ],
      'let login = true;\nlet admin = false;\nif (login) {\n  if (admin) {\n    console.log("Admin panel");\n  } else {\n    console.log("Profil");\n  }\n} else {\n  console.log("Kirish");\n}',
    ),
    q(
      IF,
      ["Soyabon olish kerakmi?", "Do you need an umbrella?"],
      ["Soyabon kerak emas", "Soyabon ol", "false", "true"],
      0,
      [
        "`!` (EMAS) qiymatni teskarisiga aylantiradi: `!false` → `true`, shuning uchun birinchi blok ishlaydi.",
        "`!` (NOT) flips the value: `!false` → `true`, so the first block runs.",
      ],
      'let yomgir = false;\nif (!yomgir) {\n  console.log("Soyabon kerak emas");\n} else {\n  console.log("Soyabon ol");\n}',
    ),
    q(
      IF,
      [
        "Seyf kodi to‘g‘ri kiritildi, lekin seyf ochildimi?",
        "The safe code was typed right, but did the safe open?",
      ],
      ["Xato kod", "Ochildi", "1234", THROWS],
      0,
      [
        '`kod` matn ("1234"), solishtirilayotgani esa son (1234). `===` turini ham tekshiradi, shuning uchun natija `false`.',
        '`kod` is a string ("1234") and it is compared with a number (1234). `===` checks the type too, so it is `false`.',
      ],
      'let kod = "1234";\nif (kod === 1234) {\n  console.log("Ochildi");\n} else {\n  console.log("Xato kod");\n}',
    ),
    q(
      IF,
      [
        "Do‘kon 100 000 so‘m va undan ko‘p xaridga chegirma beradi. Qaysi shart to‘g‘ri?",
        "A shop gives a discount on purchases of 100 000 so‘m or more. Which condition is right?",
      ],
      [
        "if (summa >= 100000)",
        "if (summa > 100000)",
        "if (summa = 100000)",
        "if (summa <= 100000)",
      ],
      0,
      [
        "“Va undan ko‘p” — teng bo‘lsa ham chegirma beriladi, demak `>=`. `>` aynan 100 000 ni chiqarib tashlaydi, `=` esa qiymat beradi.",
        "“Or more” includes exactly 100 000, so `>=`. `>` leaves out 100 000 itself, and `=` assigns instead of comparing.",
      ],
    ),
  ],
};
