// Academy Intermediate · Software and trust, module 5: Opening attachments
// safely. The lessons use ./tools.ts: eight attachments to judge.
import type { CommonWidget, Lesson, Text } from "../anim-lab/types";

export type Widget = CommonWidget | { type: "attachments" };

export const PROGRESS_KEY = "cybervalue:attachments:progress:v1";

const t = (uz: string, en: string): Text => ({ uz, en });

const FILES = t("Fayllar", "Files");
const OPENING = t("Ochish", "Opening");

export const LESSONS: Lesson<Widget>[] = [
  {
    id: 1,
    group: FILES,
    title: t("Fayl turlari", "File types"),
    minutes: 5,
    intro: t(
      "Fayl kengaytmasi kompyuterga uni qanday ochishni aytadi. .pdf, .jpg, .txt — ma’lumot: ular ko‘rsatiladi. .exe, .msi, .bat, .ps1, .js, .vbs, .lnk, .scr — ishga tushadigan narsa: ular buyruqlarni bajaradi. Pochta orqali kelgan ishga tushadigan fayl deyarli hech qachon kutilgan emas. Windows sukut bo‘yicha kengaytmalarni yashiradi, shuning uchun ularni ko‘rsatishni yoqing.",
      "A file’s extension tells the computer how to open it. .pdf, .jpg and .txt are data: they get displayed. .exe, .msi, .bat, .ps1, .js, .vbs, .lnk and .scr are things that run: they carry out commands. A runnable file arriving by email is almost never expected. Windows hides extensions by default, so switch them on.",
    ),
    analogy: t(
      "Xat va kalit farqi: xatni o‘qiysiz, kalit esa eshikni ochadi.",
      "A letter versus a key: you read a letter, but a key opens a door.",
    ),
    theory: [
      t(
        "File Explorer → View → “File name extensions” — kengaytmalarni ko‘rsatadi.",
        "File Explorer → View → “File name extensions” shows them.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t("Ishga tushadiganlar — xavfli.", "The runnable ones are risky."),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Qaysi kengaytma ishga tushadigan dastur?",
            "Which extension is a runnable program?",
          ),
          options: [t(".exe", ".exe"), t(".jpg", ".jpg"), t(".txt", ".txt")],
          answer: 0,
          explain: t(
            ".msi, .bat, .ps1, .js, .lnk ham shunday.",
            "So are .msi, .bat, .ps1, .js and .lnk.",
          ),
        },
        {
          ask: t(
            "Nega Windows’da kengaytmalarni ko‘rsatish kerak?",
            "Why switch on file extensions in Windows?",
          ),
          options: [
            t(
              "Fayl aslida nima ekanini ko‘rish uchun",
              "To see what a file really is",
            ),
            t("Fayllar tezroq ochilishi uchun", "So files open faster"),
            t("Kerak emas", "There’s no need"),
          ],
          answer: 0,
          explain: t(
            "Yashirilgan .exe “PDF” bo‘lib ko‘rinishi mumkin.",
            "A hidden .exe can pass for a “PDF”.",
          ),
        },
      ],
    },
  },
  {
    id: 2,
    group: FILES,
    title: t("Aldovchi nomlar", "Deceptive names"),
    minutes: 5,
    intro: t(
      "Firibgarlar fayl nomini aldovchi qiladi: “invoice.pdf.exe” (ikki kengaytma — oxirgisi muhim), PDF belgisi qo‘yilgan dastur, juda uzun nom bilan kengaytmani ko‘rinmas qilish yoki yorliq (.lnk) faylini hujjatga o‘xshatish. Qoida oddiy: faqat oxirgi kengaytmaga qarang va belgiga (ikonkaga) ishonmang.",
      "Scammers make file names deceptive: “invoice.pdf.exe” (a double extension — the last one is what counts), a program wearing a PDF icon, a very long name that pushes the extension out of sight, or a shortcut (.lnk) dressed up as a document. The rule is simple: look only at the last extension, and don’t trust the icon.",
    ),
    analogy: t(
      "Qadoqdagi rasmga emas, tarkibiga qarash.",
      "Reading the ingredients, not the picture on the box.",
    ),
    theory: [
      t(
        "Fayl xususiyatlarida (Properties) haqiqiy turi yoziladi.",
        "A file’s Properties show its real type.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t("Oxirgi kengaytma.", "The last extension."),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "“contract.docx.exe” aslida nima?",
            "What is “contract.docx.exe” really?",
          ),
          options: [
            t("Dastur", "A program"),
            t("Word hujjati", "A Word document"),
            t("Rasm", "An image"),
          ],
          answer: 0,
          explain: t("Oxirgi kengaytma — .exe.", "The last extension is .exe."),
        },
        {
          ask: t(
            "Fayl ikonkasi PDF ga o‘xshaydi. Bu yetarlimi?",
            "A file’s icon looks like a PDF. Is that enough?",
          ),
          options: [
            t(
              "Yo‘q, ikonkani istalgan dastur qo‘ya oladi",
              "No, any program can set its own icon",
            ),
            t("Ha, ikonka hech qachon aldamaydi", "Yes, icons never lie"),
            t("Faqat rangli bo‘lsa", "Only if it’s in colour"),
          ],
          answer: 0,
          explain: t(
            "Kengaytma va manbani tekshiring.",
            "Check the extension and the source.",
          ),
        },
      ],
    },
  },
  {
    id: 3,
    group: FILES,
    title: t("Makroslar", "Macros"),
    minutes: 6,
    intro: t(
      "Office hujjatlarida makros — kichik dastur bo‘lishi mumkin. .docx, .xlsx, .pptx formatlari makrosni saqlay olmaydi; .docm, .xlsm, .pptm va eski .doc/.xls esa saqlay oladi. Internetdan kelgan hujjatda Microsoft makroslarni sukut bo‘yicha bloklaydi, shuning uchun firibgarlar “ko‘rish uchun Enable Content tugmasini bosing” deb yozadi. Haqiqiy hujjatni o‘qish uchun makros deyarli hech qachon kerak emas.",
      "An Office document can carry a macro — a small program. The .docx, .xlsx and .pptx formats can’t hold macros; .docm, .xlsm, .pptm and the old .doc/.xls can. Microsoft blocks macros by default in documents from the internet, which is why scammers write “click Enable Content to view”. Reading a real document almost never needs a macro.",
    ),
    analogy: t(
      "Xat ichidagi “bu tugmani bosing, keyin o‘qiysiz” — g‘alati talab.",
      "A letter that says “press this button before you can read me” is odd.",
    ),
    theory: [
      t(
        "Kompaniyalar internetdan kelgan makroslarni guruh siyosati bilan butunlay bloklaydi.",
        "Companies block macros from the internet entirely with group policy.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t(
      "“Enable Content” so‘rasa — to‘xtang.",
      "If it asks for “Enable Content”, stop.",
    ),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Qaysi format makros saqlay oladi?",
            "Which format can hold a macro?",
          ),
          options: [
            t(".docm", ".docm"),
            t(".docx", ".docx"),
            t(".pdf", ".pdf"),
          ],
          answer: 0,
          explain: t(
            "“m” — macro-enabled.",
            "The “m” stands for macro-enabled.",
          ),
        },
        {
          ask: t(
            "Hujjat “ko‘rish uchun Enable Content bosing” deydi. Nima qilasiz?",
            "A document says “click Enable Content to view”. What do you do?",
          ),
          options: [
            t(
              "Bosmayman va IT’ga xabar beraman",
              "Don’t click it, and tell IT",
            ),
            t("Bosaman", "Click it"),
            t("Do‘stimga yuboraman", "Forward it to a friend"),
          ],
          answer: 0,
          explain: t(
            "Bu makrosni ishga tushirish uchun tuzoq.",
            "It’s a trap to get the macro running.",
          ),
        },
      ],
    },
  },
  {
    id: 4,
    group: OPENING,
    title: t("Ilovalarni baholash", "Judging attachments"),
    minutes: 8,
    intro: t(
      "Quyida bir haftada kompaniyaga kelgan sakkizta fayl: nomi va kimdan kelgani. To‘rttasini ochmaslik kerak. Har biri uchun so‘rang: kutganmidim, yuboruvchini taniymanmi va fayl turi nima?",
      "Below are eight files that reached the company in one week: the name and who sent it. Four should not be opened. For each one ask: was I expecting it, do I know the sender, and what kind of file is it?",
    ),
    analogy: t(
      "Eshik oldidagi posilka: buyurtma qilganmidingiz va kimdan?",
      "A parcel on the doorstep: did you order it, and who is it from?",
    ),
    theory: [
      t(
        "Shubha bo‘lsa — yuboruvchiga boshqa kanal orqali qo‘ng‘iroq qiling.",
        "When in doubt, call the sender on another channel.",
      ),
    ],
    task: t(
      "Ochmaslik kerak bo‘lganlarni belgilang.",
      "Tick the ones not to open.",
    ),
    hint: t(
      "Ikki kengaytma, makros, parolli arxiv, ISO ichidagi yorliq.",
      "A double extension, a macro, a password archive, a shortcut in an ISO.",
    ),
    widget: { type: "attachments" },
  },
  {
    id: 5,
    group: OPENING,
    title: t("Arxiv va disk obrazlari", "Archives and disk images"),
    minutes: 5,
    intro: t(
      "Pochta skanerlari ilovalarni tekshiradi, shuning uchun firibgarlar ularni yashiradi: parolli ZIP (parol xat matnida — skaner ochib ko‘ra olmaydi), ISO, IMG yoki VHD disk obrazlari (ularning ichidagi fayllar ba’zan Windows ogohlantirishini olmaydi). Kutilmagan parolli arxiv yoki disk obrazi — jiddiy belgi. Qonuniy yuboruvchi odatda faylni umumiy disk orqali ulashadi.",
      "Mail scanners inspect attachments, so scammers hide them: a password-protected ZIP (the password is in the email, so the scanner can’t look inside) or ISO, IMG and VHD disk images (files inside them sometimes miss Windows’ warning). An unexpected password archive or disk image is a serious sign. Legitimate senders usually share files through a shared drive.",
    ),
    analogy: t(
      "Bojxonadan o‘tmaslik uchun qulflangan quti — nega qulflangan?",
      "A locked box sent to dodge customs — why is it locked?",
    ),
    theory: [
      t(
        "Ko‘p kompaniyalar .iso, .img va .vhd ilovalarini pochta darajasida bloklaydi.",
        "Many companies block .iso, .img and .vhd attachments at the mail server.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t("Yashirish — belgi.", "Hiding is the sign."),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Nega parolli arxiv shubhali?",
            "Why is a password-protected archive suspicious?",
          ),
          options: [
            t(
              "Pochta skaneri ichini tekshira olmaydi",
              "The mail scanner can’t check what’s inside",
            ),
            t("U kattaroq", "It is bigger"),
            t("U eskiroq", "It is older"),
          ],
          answer: 0,
          explain: t(
            "Parol xatda bo‘lsa — himoya emas, yashirish.",
            "A password in the same email isn’t protection, it’s hiding.",
          ),
        },
        {
          ask: t(
            "“Kuryer”dan .iso fayl keldi. Bu?",
            "An .iso arrives from “the courier”. It is?",
          ),
          options: [
            t("Jiddiy shubha belgisi", "A serious warning sign"),
            t("Oddiy yetkazib berish yorlig‘i", "An ordinary shipping label"),
            t("Rasm", "A picture"),
          ],
          answer: 0,
          explain: t(
            "Yorliq PDF bo‘ladi, disk obrazi emas.",
            "A label is a PDF, not a disk image.",
          ),
        },
      ],
    },
  },
  {
    id: 6,
    group: OPENING,
    title: t("Xavfsiz ochish", "Opening safely"),
    minutes: 5,
    intro: t(
      "Kutilgan faylni ham xavfsizroq ochish mumkin. Office’ning Protected View rejimi faylni faqat o‘qish uchun ochadi; PDF’ni brauzerda ochish ko‘pincha xavfsizroq; Google Drive yoki OneDrive ko‘rish rejimi faylni kompyuteringizda ishga tushirmaydi. Shubhali faylni yuklab olgandan keyin ochmang — IT yoki xavfsizlik jamoasiga yuboring.",
      "Even expected files can be opened more safely. Office’s Protected View opens a file read-only; opening a PDF in the browser is often safer; the Google Drive or OneDrive viewer doesn’t run the file on your computer at all. Don’t open a suspicious file after downloading it — send it to IT or security.",
    ),
    analogy: t(
      "Shisha orqali qarash — tegmasdan ko‘rish.",
      "Looking through glass: you see it without touching it.",
    ),
    theory: [
      t(
        "Protected View’dan chiqish (Enable Editing) faqat ishonchli fayl uchun.",
        "Leave Protected View (Enable Editing) only for files you trust.",
      ),
    ],
    task: t("Odatlarni ajrating.", "Sort the habits."),
    hint: t("Faqat o‘qish — xavfsizroq.", "Read-only is safer."),
    widget: {
      type: "sort",
      buckets: [
        { id: "safe", label: t("Xavfsiz", "Safe") },
        { id: "risky", label: t("Xavfli", "Risky") },
      ],
      items: [
        {
          label: t("Protected View’da o‘qish", "Reading in Protected View"),
          bucket: "safe",
        },
        {
          label: t(
            "Fayl kengaytmalarini ko‘rsatishni yoqish",
            "Turning on file extensions",
          ),
          bucket: "safe",
        },
        {
          label: t(
            "Shubhali faylni IT’ga yuborish",
            "Sending a suspicious file to IT",
          ),
          bucket: "safe",
        },
        {
          label: t(
            "Notanishdan kelgan makrosni yoqish",
            "Enabling a macro from a stranger",
          ),
          bucket: "risky",
        },
        {
          label: t(
            "Xatdagi parol bilan arxivni ochish",
            "Opening an archive with the password from the email",
          ),
          bucket: "risky",
        },
        {
          label: t(
            "Antivirus ogohlantirishini o‘tkazib yuborish",
            "Clicking past an antivirus warning",
          ),
          bucket: "risky",
        },
      ],
    },
  },
  {
    id: 7,
    group: OPENING,
    title: t("Himoya qatlamlari", "Layers of defence"),
    minutes: 5,
    intro: t(
      "Bitta odamning ehtiyotkorligiga tayanmaslik uchun kompaniya qatlamlar quradi: pochta filtri xavfli turlarni bloklaydi, internetdan kelgan makroslar o‘chiriladi, antivirus/EDR fayl xatti-harakatini kuzatadi, oddiy foydalanuvchi hisoblari tizimni o‘zgartira olmaydi, zaxira nusxalar esa eng yomon holatdan qutqaradi. Xodim — oxirgi, lekin muhim qatlam: u to‘xtaydi va xabar beradi.",
      "So as not to rely on one person’s caution, a company builds layers: the mail filter blocks dangerous types, macros from the internet are switched off, antivirus/EDR watches what files do, standard user accounts can’t change the system, and backups rescue the worst case. The employee is the last layer, and an important one: they pause and report.",
    ),
    analogy: t(
      "Qal’a: xandaq, devor, darvoza va qorovul.",
      "A castle: a moat, a wall, a gate and a guard.",
    ),
    theory: [
      t(
        "Bitta qatlam yiqilsa, keyingisi ushlab qoladi.",
        "When one layer fails, the next one catches it.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t("Bir nechta qatlam.", "Several layers."),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Qaysi chora internetdan kelgan makroslarni to‘xtatadi?",
            "Which measure stops macros from the internet?",
          ),
          options: [
            t(
              "Guruh siyosati bilan makroslarni bloklash",
              "Blocking macros with group policy",
            ),
            t("Ekran yorqinligini oshirish", "Turning up screen brightness"),
            t("Parolni uzaytirish", "A longer password"),
          ],
          answer: 0,
          explain: t(
            "Foydalanuvchi bosib qo‘ysa ham ishlamaydi.",
            "It won’t run even if someone clicks.",
          ),
        },
        {
          ask: t(
            "Hamma qatlam yiqilsa, nima qutqaradi?",
            "If every layer fails, what saves you?",
          ),
          options: [
            t("Zaxira nusxalar", "Backups"),
            t("Omad", "Luck"),
            t("Hech narsa", "Nothing"),
          ],
          answer: 0,
          explain: t(
            "Ayniqsa ransomware holatida.",
            "Especially with ransomware.",
          ),
        },
      ],
    },
  },
  {
    id: 8,
    group: OPENING,
    title: t("Yakuniy savollar", "Final questions"),
    minutes: 5,
    intro: t(
      "Faylni ochishdan oldin uch savol: kutganmidim, yuboruvchini taniymanmi, fayl turi nima? Ishga tushadigan fayllar, makros so‘raydigan hujjatlar, parolli arxivlar va disk obrazlari — to‘xtash belgilari. Kutilgan fayllar ham Protected View yoki brauzerda ochiladi. Bu “Dasturlar va ularga ishonch” bo‘limining oxirgi moduli.",
      "Before opening a file, ask three questions: was I expecting it, do I know the sender, what kind of file is it? Runnable files, documents asking for macros, password archives and disk images are stop signs. Even expected files open in Protected View or the browser. This is the last module of the Software and trust section.",
    ),
    analogy: t(
      "Notanish odamning qo‘lingizga bergan quti — avval kimdan ekanini so‘raysiz.",
      "A box a stranger hands you: first you ask who it’s from.",
    ),
    theory: [
      t(
        "Xato ochib qo‘ysangiz — darhol tarmoqdan uzing va xabar bering.",
        "If you opened one by mistake, disconnect and report at once.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t(
      "Kutilganmi, kimdan, qanday tur.",
      "Expected? From whom? What type?",
    ),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t("Qaysi fayl eng xavfsiz?", "Which file is the safest?"),
          options: [
            t(
              "Kutilgan, tanish yuboruvchidan kelgan .pdf",
              "An expected .pdf from someone you know",
            ),
            t("Notanishdan kelgan .exe", "An .exe from a stranger"),
            t("Parolli .zip", "A password-protected .zip"),
          ],
          answer: 0,
          explain: t(
            "Kutilgan, tanish va ma’lumot turi.",
            "Expected, known, and a data type.",
          ),
        },
        {
          ask: t(
            "Shubhali faylni xato ochib qo‘ydingiz. Birinchi qadam?",
            "You opened a suspicious file by mistake. The first step?",
          ),
          options: [
            t(
              "Tarmoqdan uzib, IT’ga xabar berish",
              "Disconnect from the network and tell IT",
            ),
            t("Hech kimga aytmaslik", "Tell no one"),
            t("Faylni yana ochish", "Open it again"),
          ],
          answer: 0,
          explain: t(
            "Tez xabar — kichik zarar.",
            "A quick report means less damage.",
          ),
        },
      ],
    },
  },
];
