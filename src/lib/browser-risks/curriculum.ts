// Academy Intermediate · Web application security, module 3: browser-side
// risks. The lessons use a pretend browser (./tools.ts): what markup a
// comment would create, a Content-Security-Policy put together directive by
// directive, and a bank whose transfer form another site submits.
import type { CommonWidget, Lesson, Text } from "../anim-lab/types";

export type Widget =
  CommonWidget | { type: "markup" } | { type: "csp" } | { type: "csrf" };

export const PROGRESS_KEY = "cybervalue:browser:progress:v1";

const t = (uz: string, en: string): Text => ({ uz, en });
const code = (s: string) => t(s, s);

const XSS = t("Sahifaga begona kod", "Foreign code in the page");
const POLICY = t("Brauzer qoidalari", "Browser rules");
const FORGERY = t("Soxta so‘rovlar", "Forged requests");

export const LESSONS: Lesson<Widget>[] = [
  {
    id: 1,
    group: XSS,
    title: t("Sahifadagi kod kimniki?", "Whose code is on the page?"),
    minutes: 6,
    intro: t(
      "Brauzer sahifadagi har bir skriptni sayt egasining kodi deb ishonadi: u cookie, forma va sahifa matnini ko‘ra oladi. Agar foydalanuvchi yozgan matn kod sifatida sahifaga tushsa, u ham shu huquqlarni oladi. Bu XSS (cross-site scripting) deyiladi.",
      "A browser trusts every script on a page as the site owner’s: it can read cookies, forms and the page’s text. If text a user wrote lands in the page as code, it gets the same rights. This is XSS (cross-site scripting).",
    ),
    analogy: t(
      "Do‘kon vitrinasiga xaridorlar o‘z e’lonini yopishtira oladi. Agar e’lon oddiy qog‘oz bo‘lsa — muammo yo‘q. Agar u “kassa kalitini menga bering” degan buyruq sifatida o‘qilsa — muammo.",
      "Shoppers may stick notes on a shop window. A plain note is fine. A note read as an order — “give me the till key” — is not.",
    ),
    theory: [
      t(
        "Saytning o‘z skriptlari ishonchli. Xavf — foydalanuvchidan kelgan matn (izoh, ism, qidiruv so‘zi) HTML sifatida sahifaga qo‘yilganda.",
        "The site’s own scripts are trusted. The risk is user text — a comment, a name, a search term — placed in the page as HTML.",
      ),
      t(
        "Stored XSS: zararli matn bazaga yoziladi va har bir o‘quvchiga ko‘rsatiladi. Reflected XSS: u havolaning o‘zida bo‘ladi va faqat havolani ochganda ishlaydi.",
        "Stored XSS: the harmful text is saved and shown to every reader. Reflected XSS: it sits in a link and works only for whoever opens it.",
      ),
    ],
    task: t(
      "Har bir narsani joyiga ajrating: u ishonchli kodmi yoki sahifaga begona kod olib kirishi mumkinmi?",
      "Sort each item: is it trusted code, or could it bring foreign code into the page?",
    ),
    hint: t(
      "Foydalanuvchi o‘zgartira oladigan narsa HTML sifatida chiqsa — xavfli.",
      "Anything a user can change, shown as HTML, is risky.",
    ),
    widget: {
      type: "sort",
      buckets: [
        { id: "trusted", label: t("Ishonchli", "Trusted") },
        { id: "risk", label: t("Begona kod xavfi", "Risk of foreign code") },
      ],
      items: [
        {
          label: code('<script src="/app.js">'),
          code: true,
          bucket: "trusted",
        },
        {
          label: t(
            "Izoh matni innerHTML orqali chiqarilgan",
            "A comment shown through innerHTML",
          ),
          bucket: "risk",
        },
        {
          label: t(
            "Izoh matni textContent orqali chiqarilgan",
            "A comment shown through textContent",
          ),
          bucket: "trusted",
        },
        {
          label: t(
            "Qidiruv so‘zi sahifaga kodlanmasdan qaytarilgan",
            "A search term echoed into the page unencoded",
          ),
          bucket: "risk",
        },
        {
          label: t(
            "React’da {comment} bilan chiqarilgan izoh",
            "A comment rendered in React as {comment}",
          ),
          bucket: "trusted",
        },
        {
          label: code("dangerouslySetInnerHTML={{ __html: comment }}"),
          code: true,
          bucket: "risk",
        },
      ],
    },
  },
  {
    id: 2,
    group: XSS,
    title: t("Matn emas, belgi", "Not text but markup"),
    minutes: 8,
    intro: t(
      "Izohlar sahifasi foydalanuvchi yozganini innerHTML ga qo‘yadi. Brauzer bu matnni HTML deb o‘qiydi va undan yangi elementlar yaratadi. Bu simulyator hech narsani ishga tushirmaydi — faqat brauzer nima yaratishini ko‘rsatadi.",
      "A comments page puts what users type into innerHTML. The browser reads that text as HTML and builds new elements from it. This simulator runs nothing — it only shows what the browser would build.",
    ),
    analogy: t(
      "Matbaachiga “qalin harf bilan” degan belgini qo‘lda yozib bersangiz, u matnni qalin bosadi. Ko‘rsatma va matn aralashib ketdi.",
      "Write “print this in bold” on a page for a printer and they will. Instruction and text got mixed.",
    ),
    theory: [
      t(
        "innerHTML matnni HTML sifatida o‘qiydi. textContent (yoki React’dagi {matn}) uni har doim oddiy matn sifatida qo‘yadi.",
        "innerHTML reads text as HTML. textContent (or {text} in React) always places it as plain text.",
      ),
      t(
        "Qalin harf zararsiz ko‘rinadi, lekin xuddi shu yo‘l bilan <script> yoki on… atributi ham tushadi — ular kod ishga tushiradi.",
        "Bold looks harmless, but the same path lets in <script> or an on… attribute, which run code.",
      ),
      t(
        "HTML kerak bo‘lsa (masalan, formatlangan matn), uni ruxsat etilgan teglar ro‘yxati bilan tozalovchi kutubxona (DOMPurify kabi) orqali o‘tkazing.",
        "When HTML is really needed, such as formatted text, pass it through a sanitiser with an allowlist of tags (like DOMPurify).",
      ),
    ],
    task: t(
      "Izohga HTML teg yozing va innerHTML undan element yaratganini ko‘ring. Keyin textContent ga o‘tkazing.",
      "Write an HTML tag in the comment and see innerHTML build an element from it. Then switch to textContent.",
    ),
    hint: t(
      "Masalan: Salom <b>do‘stlar</b> — keyin “textContent” ni tanlang.",
      "For example: Hello <b>friends</b> — then choose “textContent”.",
    ),
    widget: { type: "markup" },
  },
  {
    id: 3,
    group: XSS,
    title: t("Havola ham kod bo‘lishi mumkin", "A link can be code too"),
    minutes: 6,
    intro: t(
      "Profil sahifasida “Mening saytim” havolasi bor. Foydalanuvchi manzilni o‘zi yozadi. Kodlash qo‘shtirnoqni to‘xtatadi, lekin manzilning o‘zi javascript: bilan boshlansa, bosilganda kod ishlaydi.",
      "A profile page has a “My website” link whose address the user types. Encoding stops quotes, but if the address itself starts with javascript:, clicking it runs code.",
    ),
    analogy: t(
      "Pochta qutisiga “kalit shu yerda” emas, “eshikni och” deb yozilgan qog‘oz tashlashga o‘xshaydi — manzil o‘rniga buyruq.",
      "Like a note in the letterbox that says “open the door” instead of an address — an order where a place should be.",
    ),
    theory: [
      t(
        "href, src va action atributlari uchun sxemani tekshiring: faqat https: va http: (yoki sayt ichidagi yo‘l).",
        "For href, src and action check the scheme: only https: and http: (or a path on the site).",
      ),
      t(
        "Tekshiruvni matn bilan emas, URL tahlilchisi bilan qiling: bo‘sh joy, katta harflar va yangi qatorlar oddiy “startsWith” tekshiruvini aldaydi.",
        "Check with a URL parser, not string matching: spaces, capitals and newlines fool a simple “startsWith”.",
      ),
    ],
    task: t(
      "Qaysi manzillarni profil havolasiga qo‘yish xavfsiz, qaysilarini rad etish kerak?",
      "Which addresses are safe in the profile link, and which must be refused?",
    ),
    hint: t(
      "Faqat http yoki https bilan boshlanadigan (yoki saytdagi yo‘l) manzil xavfsiz.",
      "Only addresses with http or https (or a path on the site) are safe.",
    ),
    widget: {
      type: "sort",
      buckets: [
        { id: "ok", label: t("Xavfsiz", "Safe") },
        { id: "no", label: t("Rad etiladi", "Refused") },
      ],
      items: [
        { label: code("https://kitob.uz/ali"), code: true, bucket: "ok" },
        { label: code("javascript:…"), code: true, bucket: "no" },
        { label: code("/profil/ali"), code: true, bucket: "ok" },
        { label: code("JavaScript:…"), code: true, bucket: "no" },
        { label: code("data:text/html,…"), code: true, bucket: "no" },
        { label: code("HTTPS://Blog.Example.uz"), code: true, bucket: "ok" },
      ],
    },
  },
  {
    id: 4,
    group: POLICY,
    title: t("CSP: brauzerga qoida berish", "CSP: rules for the browser"),
    minutes: 10,
    intro: t(
      "Content-Security-Policy sarlavhasi brauzerga qaysi manbalardan skript, uslub va rasm yuklash mumkinligini aytadi. Kod sahifaga baribir tushib qolsa ham, CSP uni ishga tushirmaydi — bu ikkinchi himoya qatlami.",
      "The Content-Security-Policy header tells the browser where scripts, styles and images may load from. Even if code slips into the page, CSP does not run it — a second layer of defence.",
    ),
    analogy: t(
      "Bino qorovuliga mehmonlar ro‘yxatini berish: kimdir eshikdan o‘tib ketgan bo‘lsa ham, ro‘yxatda yo‘q odam ichki xonalarga kiritilmaydi.",
      "A guest list for the building’s guard: even someone who got past the front door is kept out of the inner rooms.",
    ),
    theory: [
      t(
        "default-src — boshqa yozilmagan turlar uchun umumiy qoida. script-src, img-src — aniq turlar uchun. Bir xil nomli birinchi qoida hisoblanadi.",
        "default-src is the fallback for types not listed. script-src and img-src cover specific types. The first directive of a name counts.",
      ),
      t(
        "'self' — faqat shu sayt. 'unsafe-inline' sahifa ichidagi skriptlarga ruxsat beradi — aynan XSS shunday ishlaydi, shuning uchun undan qoching.",
        "'self' means this site only. 'unsafe-inline' allows scripts written in the page — exactly how XSS works, so avoid it.",
      ),
      t(
        "* — hamma joydan. Bu qulay, lekin begona saytdagi skriptni ham ochib qo‘yadi.",
        "* means from anywhere. Convenient, but it also lets in a script from a foreign site.",
      ),
    ],
    task: t(
      "Shunday siyosat tuzing: sahifaning o‘zi ishlasin (o‘z skripti, uslublari, statistika va muqovalar), hujumlarning hammasi bloklansin.",
      "Build a policy so the page works (its own script, styles, statistics and covers) and every attack is blocked.",
    ),
    hint: t(
      "default-src 'self', statistika uchun aniq script-src va muqovalar uchun img-src.",
      "default-src 'self', a script-src naming the statistics host, and an img-src for the covers.",
    ),
    widget: { type: "csp" },
  },
  {
    id: 5,
    group: FORGERY,
    title: t("Begona sayt sizning nomingizdan", "A foreign site in your name"),
    minutes: 10,
    intro: t(
      "Siz bank saytiga kirgansiz. Boshqa tabda ochilgan sahifa bankka yashirin pul o‘tkazish formasini yuboradi. Brauzer bank cookie’sini qo‘shib yuborsa, bank buni sizning so‘rovingiz deb o‘ylaydi. Bu CSRF (cross-site request forgery).",
      "You are signed in to your bank. A page in another tab submits a hidden transfer form to the bank. If the browser attaches the bank’s cookie, the bank thinks it is your request. This is CSRF (cross-site request forgery).",
    ),
    analogy: t(
      "Kimdir sizning imzoingiz bor blankani to‘ldirib, bankka sizning nomingizdan topshirishiga o‘xshaydi.",
      "Like someone filling in a form you have already signed and handing it to the bank in your name.",
    ),
    theory: [
      t(
        "SameSite cookie atributi: Strict — boshqa saytdan kelgan hech qanday so‘rovga qo‘shilmaydi; Lax — faqat oddiy o‘tish (GET havola) bilan; None — har doim (faqat Secure bilan).",
        "The SameSite cookie attribute: Strict — never sent on requests from another site; Lax — only on plain navigation (a GET link); None — always (Secure only).",
      ),
      t(
        "CSRF tokeni: bank formasiga yashirin tasodifiy qiymat qo‘yiladi. Begona sayt uni bilmaydi, shuning uchun soxta so‘rov rad etiladi.",
        "A CSRF token: the bank puts a hidden random value in its own form. A foreign site cannot know it, so a forged request is refused.",
      ),
      t(
        "Ikkalasini birga ishlating: SameSite — brauzer himoyasi, token — server tekshiruvi.",
        "Use both: SameSite is the browser’s guard, the token is the server’s check.",
      ),
    ],
    task: t(
      "Bankni shunday sozlangki, uning o‘z sahifasidan pul o‘tkazish ishlasin, begona saytdan kelgan soxta so‘rov esa rad etilsin.",
      "Set up the bank so a transfer from its own page works and the forged request from the foreign site is refused.",
    ),
    hint: t(
      "Avval None bilan hujum o‘tishini ko‘ring. Keyin SameSite ni Lax qiling yoki tokenni yoqing.",
      "First see the attack pass with None. Then set SameSite to Lax or switch the token on.",
    ),
    widget: { type: "csrf" },
  },
  {
    id: 6,
    group: FORGERY,
    title: t("SameSite=Lax qachon yuboriladi", "When SameSite=Lax is sent"),
    minutes: 6,
    intro: t(
      "Zamonaviy brauzerlar atributsiz cookie’ni Lax deb hisoblaydi. Lax qaysi so‘rovlarda cookie yuborishini bilish CSRF xavfini baholashga yordam beradi.",
      "Modern browsers treat a cookie with no attribute as Lax. Knowing which requests carry a Lax cookie tells you where CSRF is still possible.",
    ),
    analogy: t(
      "Ofisga eshikdan o‘zingiz kirsangiz, ruxsatnomangiz ko‘rsatiladi. Kimdir sizning nomingizdan xat yuborsa — ruxsatnoma unga ilova qilinmaydi.",
      "Walk in through the door yourself and your pass is shown. A letter someone else sends in your name does not come with your pass.",
    ),
    theory: [
      t(
        "Lax: boshqa saytdan bosilgan oddiy havola (yuqori darajadagi GET o‘tish) — cookie yuboriladi. Boshqa saytdan POST forma, rasm, iframe yoki fetch — yuborilmaydi.",
        "Lax: a plain link clicked on another site (top-level GET navigation) carries the cookie. A POST form, image, iframe or fetch from another site does not.",
      ),
      t(
        "Shuning uchun GET so‘rovlari hech narsani o‘zgartirmasligi kerak: pul o‘tkazish, o‘chirish va sozlash faqat POST bilan.",
        "That is why GET requests must never change anything: transfers, deletions and settings use POST only.",
      ),
    ],
    task: t(
      "bank.cybervalue.uz cookie’si SameSite=Lax. Qaysi so‘rovlarda u yuboriladi?",
      "The bank.cybervalue.uz cookie is SameSite=Lax. On which requests is it sent?",
    ),
    hint: t(
      "Faqat bankning o‘z sahifalari va boshqa saytdan oddiy havola bilan o‘tish.",
      "Only the bank’s own pages, and plain link navigation from another site.",
    ),
    widget: {
      type: "sort",
      buckets: [
        { id: "sent", label: t("Cookie yuboriladi", "Cookie sent") },
        { id: "kept", label: t("Yuborilmaydi", "Not sent") },
      ],
      items: [
        {
          label: t(
            "Bank sahifasidagi o‘tkazma formasi (POST)",
            "The bank page’s own transfer form (POST)",
          ),
          bucket: "sent",
        },
        {
          label: t(
            "Boshqa saytdagi havola bosildi va bank ochildi (GET)",
            "A link clicked on another site opens the bank (GET)",
          ),
          bucket: "sent",
        },
        {
          label: t(
            "Boshqa saytdagi yashirin forma bankka POST yubordi",
            "A hidden form on another site POSTs to the bank",
          ),
          bucket: "kept",
        },
        {
          label: t(
            "Boshqa saytdagi <img> bank manzilini so‘radi",
            "An <img> on another site requests a bank address",
          ),
          bucket: "kept",
        },
        {
          label: t(
            "Boshqa saytning skripti bankka fetch() yubordi",
            "Another site’s script sends fetch() to the bank",
          ),
          bucket: "kept",
        },
      ],
    },
  },
  {
    id: 7,
    group: POLICY,
    title: t("Ko‘rinmas ramka", "The invisible frame"),
    minutes: 6,
    intro: t(
      "Begona sayt sizning sahifangizni ko‘rinmas iframe ichida ochib, ustiga “Sovg‘ani olish” tugmasini qo‘yishi mumkin. Foydalanuvchi aslida sizning sahifangizdagi “Tasdiqlash” tugmasini bosadi. Bu clickjacking deyiladi.",
      "A foreign site can open your page inside an invisible iframe and place a “Claim your gift” button over it. The user really clicks “Confirm” on your page. This is clickjacking.",
    ),
    analogy: t(
      "Shartnoma ustiga shaffof qog‘oz qo‘yib, “bu yerga imzo qo‘ying — bu sovg‘a uchun” deyishga o‘xshaydi.",
      "Like laying tracing paper over a contract and saying “sign here — it’s for a gift”.",
    ),
    theory: [
      t(
        "Himoya — sahifani boshqa saytlar ramkaga olishini taqiqlash: Content-Security-Policy: frame-ancestors 'none' (yoki 'self').",
        "The defence is to forbid other sites from framing the page: Content-Security-Policy: frame-ancestors 'none' (or 'self').",
      ),
      t(
        "Eski brauzerlar uchun X-Frame-Options: DENY ham qo‘shiladi. Ikkalasi bir maqsadga xizmat qiladi.",
        "Older browsers also get X-Frame-Options: DENY. Both serve the same purpose.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t(
      "frame-ancestors — sizni kim ramkaga ola olishini aytadi.",
      "frame-ancestors says who may frame you.",
    ),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Qaysi sarlavha sahifani boshqa saytlar ramkasiga olishni taqiqlaydi?",
            "Which header forbids other sites from framing the page?",
          ),
          options: [
            code("Content-Security-Policy: frame-ancestors 'none'"),
            code("Content-Security-Policy: frame-src 'none'"),
            code("Access-Control-Allow-Origin: *"),
          ],
          answer: 0,
          explain: t(
            "frame-ancestors — kim sizni ramkaga oladi; frame-src — siz kimni ramkaga olasiz.",
            "frame-ancestors is who frames you; frame-src is whom you frame.",
          ),
        },
        {
          ask: t(
            "Clickjacking’da foydalanuvchi aslida nimani bosadi?",
            "In clickjacking, what does the user really click?",
          ),
          options: [
            t(
              "Ko‘rinmas ramkadagi sizning sahifangiz tugmasini",
              "A button on your page in the invisible frame",
            ),
            t("Begona saytdagi rasmni", "A picture on the foreign site"),
            t("Brauzer manzil qatorini", "The browser’s address bar"),
          ],
          answer: 0,
          explain: t(
            "Bosish ko‘rinmas ramka orqali sizning sahifangizga tushadi.",
            "The click goes through the invisible frame to your page.",
          ),
        },
      ],
    },
  },
  {
    id: 8,
    group: POLICY,
    title: t("Yakuniy savollar", "Final questions"),
    minutes: 6,
    intro: t(
      "Modulni takrorlaymiz: XSS ni kodlash va xavfsiz API bilan, CSP bilan ikkinchi qatlam, CSRF ni SameSite va token bilan to‘xtatish.",
      "A review of the module: stop XSS with encoding and safe APIs, add CSP as a second layer, and stop CSRF with SameSite and a token.",
    ),
    analogy: t(
      "Uyni himoya qilish: mustahkam eshik (kodlash), signalizatsiya (CSP) va kim kelganini tekshiradigan qo‘ng‘iroq (token).",
      "Guarding a house: a solid door (encoding), an alarm (CSP) and a doorbell camera that checks who came (the token).",
    ),
    theory: [
      t(
        "XSS — begona kod sizning sahifangizda ishlashi. CSRF — begona sayt sizning nomingizdan so‘rov yuborishi.",
        "XSS is foreign code running on your page. CSRF is a foreign site sending requests in your name.",
      ),
    ],
    task: t(
      "Barcha savollarga to‘g‘ri javob bering.",
      "Answer every question correctly.",
    ),
    hint: t(
      "Har bir himoya qaysi hujumni to‘xtatishini eslang.",
      "Remember which attack each defence stops.",
    ),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Foydalanuvchi izohini sahifaga chiqarishning xavfsiz yo‘li?",
            "The safe way to put a user’s comment on the page?",
          ),
          options: [
            code("element.textContent = comment"),
            code("element.innerHTML = comment"),
            code("document.write(comment)"),
          ],
          answer: 0,
          explain: t(
            "textContent matnni har doim matn sifatida qo‘yadi.",
            "textContent always places it as text.",
          ),
        },
        {
          ask: t(
            "CSP’da qaysi qiymat XSS ga eshik ochadi?",
            "Which CSP value opens the door to XSS?",
          ),
          options: [code("'unsafe-inline'"), code("'self'"), code("'none'")],
          answer: 0,
          explain: t(
            "'unsafe-inline' sahifa ichidagi skriptlarni ishga tushiradi — aynan qo‘shilgan kodni.",
            "'unsafe-inline' runs scripts written in the page — exactly the injected code.",
          ),
        },
        {
          ask: t(
            "CSRF ga qarshi server tomonidagi himoya?",
            "The server-side defence against CSRF?",
          ),
          options: [
            t("Formadagi CSRF tokeni", "A CSRF token in the form"),
            t("Parolni uzunroq qilish", "A longer password"),
            t("HTTPS ga o‘tish", "Switching to HTTPS"),
          ],
          answer: 0,
          explain: t(
            "Begona sayt tokenni bilmaydi, shuning uchun uning so‘rovi rad etiladi.",
            "A foreign site cannot know the token, so its request is refused.",
          ),
        },
        {
          ask: t(
            "Nega pul o‘tkazish GET so‘rovi bilan bo‘lmasligi kerak?",
            "Why must a money transfer never be a GET request?",
          ),
          options: [
            t(
              "SameSite=Lax cookie boshqa saytdan GET havolasida ham yuboriladi",
              "A SameSite=Lax cookie is sent on GET links from other sites too",
            ),
            t("GET sekinroq ishlaydi", "GET is slower"),
            t("GET da tana bo‘lmaydi", "GET has no body"),
          ],
          answer: 0,
          explain: t(
            "Lax oddiy o‘tishga ruxsat beradi, shuning uchun o‘zgartiradigan amallar POST bilan bo‘lsin.",
            "Lax allows plain navigation, so anything that changes data uses POST.",
          ),
        },
      ],
    },
  },
];
