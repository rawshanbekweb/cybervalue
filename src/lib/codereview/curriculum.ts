// Academy Intermediate · AppSec, module 5: Secure code review. The lessons
// use ./tools.ts: a pull request with four problems to flag, and findings
// to rate.
import type { CommonWidget, Lesson, Text } from "../anim-lab/types";

export type Widget = CommonWidget | { type: "review" } | { type: "rate" };

export const PROGRESS_KEY = "cybervalue:codereview:progress:v1";

const t = (uz: string, en: string): Text => ({ uz, en });

const READING = t("Kodni o‘qish", "Reading the code");
const REPORTING = t("Xulosa", "Reporting");

export const LESSONS: Lesson<Widget>[] = [
  {
    id: 1,
    group: READING,
    title: t("Nega odam ko‘rigi kerak", "Why people review"),
    minutes: 5,
    intro: t(
      "Avtomatik vositalar naqshlarni topadi, lekin “bu foydalanuvchi bu buyurtmani ko‘rishga haqlimi?” degan savolni faqat odam beradi. Kod ko‘rigi (code review) — har bir pull request’ni kamida bitta boshqa dasturchi o‘qib chiqishi. Xavfsizlik ko‘rigida u yana so‘raydi: kim chaqira oladi, qanday ma’lumot kiradi, nima chiqadi va xato bo‘lsa nima bo‘ladi.",
      "Automated tools find patterns, but only a person asks “is this user allowed to see this order?”. Code review means at least one other developer reads every pull request. A security review also asks: who can call this, what comes in, what goes out, and what happens on error?",
    ),
    analogy: t(
      "Maqolani muharrir o‘qiydi: imlo tekshiruvchi ma’nodagi xatoni ko‘rmaydi.",
      "An editor reads the article: a spell checker can’t see a mistake in meaning.",
    ),
    theory: [
      t(
        "Kichik pull request yaxshiroq ko‘riladi: 400 qatordan keyin diqqat keskin pasayadi.",
        "Small pull requests get better reviews: attention drops sharply past about 400 lines.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t("Mantiqni odam ko‘radi.", "People see the logic."),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Qaysi xatoni ko‘rikda odam vositadan yaxshiroq topadi?",
            "Which flaw does a reviewer find better than a tool?",
          ),
          options: [
            t(
              "Buyurtma egasini tekshirish unutilgani",
              "A missing check of who owns an order",
            ),
            t("eval() chaqiruvi", "An eval() call"),
            t("Eski kutubxona versiyasi", "An old library version"),
          ],
          answer: 0,
          explain: t(
            "Bu biznes qoidasi: kodda xato ko‘rinmaydi, faqat yetishmaydi.",
            "It is a business rule: nothing in the code looks wrong; something is missing.",
          ),
        },
        {
          ask: t(
            "Qaysi pull request’ni sifatli ko‘rib chiqish osonroq?",
            "Which pull request is easier to review well?",
          ),
          options: [
            t("Bitta vazifaga oid 150 qator", "150 lines about one task"),
            t("Besh vazifaga oid 3000 qator", "3,000 lines about five tasks"),
            t("Izohsiz yangi papka", "A new folder with no description"),
          ],
          answer: 0,
          explain: t(
            "Katta PR’da ko‘ruvchi “LGTM” deb o‘tib ketadi.",
            "On a huge PR the reviewer just writes “LGTM”.",
          ),
        },
      ],
    },
  },
  {
    id: 2,
    group: READING,
    title: t("Tekshiruv ro‘yxati", "The checklist"),
    minutes: 6,
    intro: t(
      "Yaxshi ko‘ruvchi xotirasiga emas, ro‘yxatga tayanadi. Xavfsizlik ro‘yxati qisqa: kirish (autentifikatsiya) va huquq (avtorizatsiya) tekshirilganmi; kiritma tekshirilib, chiqish ekranlanganmi; sirlar kodda emasmi; xatolar va loglar ortiqcha narsa aytmaydimi; yangi kutubxona kerakmi. Uslub, nomlar va formatlash — muhim, lekin bu boshqa ro‘yxat.",
      "Good reviewers rely on a checklist, not memory. The security list is short: are authentication and authorisation checked; is input validated and output escaped; are secrets out of the code; do errors and logs say too much; is the new library needed? Style, naming and formatting matter, but they’re another list.",
    ),
    analogy: t(
      "Uchuvchining parvozdan oldingi ro‘yxati: tajriba bor, lekin ro‘yxat baribir o‘qiladi.",
      "A pilot’s pre-flight checklist: they have experience, but they still read the list.",
    ),
    theory: [
      t(
        "OWASP Code Review Guide va ASVS — tayyor ro‘yxatlar manbai.",
        "The OWASP Code Review Guide and ASVS are sources of ready-made lists.",
      ),
    ],
    task: t("Bu xavfsizlik ro‘yxatidami?", "Is it on the security checklist?"),
    hint: t("Hujumchiga yordam bera oladimi?", "Could it help an attacker?"),
    widget: {
      type: "sort",
      buckets: [
        { id: "sec", label: t("Xavfsizlik ro‘yxati", "Security checklist") },
        { id: "other", label: t("Boshqa ro‘yxat", "Another list") },
      ],
      items: [
        {
          label: t(
            "Endpoint foydalanuvchi huquqini tekshiradimi?",
            "Does the endpoint check the user’s rights?",
          ),
          bucket: "sec",
        },
        {
          label: t(
            "Kiritma serverda tekshiriladimi?",
            "Is input validated on the server?",
          ),
          bucket: "sec",
        },
        {
          label: t(
            "Kodda kalit yoki parol bormi?",
            "Is there a key or password in the code?",
          ),
          bucket: "sec",
        },
        {
          label: t(
            "O‘zgaruvchi nomlari tushunarlimi?",
            "Are the variable names clear?",
          ),
          bucket: "other",
        },
        {
          label: t(
            "Qatorlar 80 belgidan oshmaydimi?",
            "Do lines stay under 80 characters?",
          ),
          bucket: "other",
        },
        {
          label: t(
            "Xato javobida stack trace qaytadimi?",
            "Does an error response return a stack trace?",
          ),
          bucket: "sec",
        },
      ],
    },
  },
  {
    id: 3,
    group: READING,
    title: t("Pull request’ni o‘qish", "Reading a pull request"),
    minutes: 10,
    intro: t(
      "Quyida “buyurtmani ko‘rish va admin paneli” degan kichik pull request. Uni ro‘yxat bo‘yicha o‘qing: har bir endpoint kim uchun, har bir qiymat qayerdan keladi, har bir shart nimani tekshiradi. To‘rt qatorda xavfsizlik muammosi bor — qolganlari to‘g‘ri.",
      "Below is a small pull request, “view an order and the admin panel”. Read it with the checklist: who each endpoint is for, where each value comes from, what each condition checks. Four lines have a security problem — the rest are fine.",
    ),
    analogy: t(
      "Shartnomani imzolashdan oldin har bir bandni o‘qish.",
      "Reading every clause of a contract before signing it.",
    ),
    theory: [
      t(
        "requireLogin — faqat “kirganmi?” deb so‘raydi, “bu uning buyurtmasimi?” deb emas.",
        "requireLogin only asks “signed in?”, not “is this their order?”.",
      ),
    ],
    task: t(
      "Xavfsizlik muammosi bor qatorlarni belgilang.",
      "Tick the lines with a security problem.",
    ),
    hint: t(
      "Huquq, sessiya muddati, CORS va bitta belgi.",
      "Rights, session length, CORS and one character.",
    ),
    widget: { type: "review" },
  },
  {
    id: 4,
    group: READING,
    title: t("Yaxshi izoh yozish", "Writing a good comment"),
    minutes: 6,
    intro: t(
      "Ko‘rik izohi muallifni emas, kodni tanqid qiladi. Yaxshi izoh uch narsani aytadi: muammo nima, u qanday ishlatilishi mumkin va qanday tuzatiladi — iloji bo‘lsa, aniq kod bilan. “Bu xavfli” deyish yetmaydi; “boshqa foydalanuvchi ID ni o‘zgartirib, birovning buyurtmasini ko‘radi — `where: { id, userId: req.user.id }` qo‘shing” — tuzatsa bo‘ladigan izoh.",
      "A review comment criticises the code, not the author. A good comment says three things: what the problem is, how it could be used, and how to fix it — with concrete code where possible. “This is insecure” isn’t enough; “another user can change the ID and read someone else’s order — add `where: { id, userId: req.user.id }`” is a comment someone can act on.",
    ),
    analogy: t(
      "Shifokor “kasalsiz” demaydi: tashxis, sabab va dori yozadi.",
      "A doctor doesn’t just say “you’re ill”: they give the diagnosis, the cause and the treatment.",
    ),
    theory: [
      t(
        "Muhimlikni belgilang: “blocker”, “should fix” yoki “nit”.",
        "Mark the weight: “blocker”, “should fix” or “nit”.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t("Muammo, ta’sir, tuzatish.", "Problem, impact, fix."),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t("Qaysi izoh eng foydali?", "Which comment is most useful?"),
          options: [
            t(
              "“Blocker: buyurtma egasi tekshirilmaydi, istalgan kishi ID bilan boshqa buyurtmani o‘qiydi. findById o‘rniga findFirst({ where: { id, userId } }) ishlating.”",
              "“Blocker: the order’s owner isn’t checked, so anyone can read another order by ID. Use findFirst({ where: { id, userId } }) instead of findById.”",
            ),
            t("“Bu xavfli.”", "“This is insecure.”"),
            t(
              "“Buni kim yozgan? Yana xato.”",
              "“Who wrote this? Wrong again.”",
            ),
          ],
          answer: 0,
          explain: t(
            "Muammo, ta’sir va tuzatish — hammasi bor.",
            "Problem, impact and fix are all there.",
          ),
        },
        {
          ask: t(
            "Muallif rozi emas. To‘g‘ri qadam?",
            "The author disagrees. The right step?",
          ),
          options: [
            t(
              "Hujum yo‘lini misol bilan ko‘rsatib, kerak bo‘lsa xavfsizlik jamoasini chaqirish",
              "Show the attack path with an example and bring in the security team if needed",
            ),
            t("Indamay tasdiqlash", "Approve quietly"),
            t("Pull request’ni yopish", "Close the pull request"),
          ],
          answer: 0,
          explain: t(
            "Dalil bahsni hal qiladi, ovoz balandligi emas.",
            "Evidence settles it, not volume.",
          ),
        },
      ],
    },
  },
  {
    id: 5,
    group: REPORTING,
    title: t("Xavfni baholash", "Rating risk"),
    minutes: 6,
    intro: t(
      "Hamma topilma bir xil emas. Xavf = ta’sir × ehtimollik. Ta’sir: nima yo‘qotiladi — butun tizim, shaxsiy ma’lumot yoki ozgina ma’lumot. Ehtimollik: hujum uchun nima kerak — hech narsa, oddiy login yoki avval boshqa narsani o‘g‘irlash. CVSS kabi tizimlar buni rasmiylashtiradi; ko‘rikda esa to‘rt daraja yetarli: kritik, yuqori, o‘rta, past.",
      "Not every finding weighs the same. Risk = impact × likelihood. Impact: what is lost — the whole system, personal data or a little information. Likelihood: what the attack needs — nothing, an ordinary login, or stealing something else first. Systems such as CVSS formalise this; in a review four levels are enough: critical, high, medium, low.",
    ),
    analogy: t(
      "Tibbiy navbat (triage): yurak xuruji — birinchi, tirnalgan barmoq — keyin.",
      "Medical triage: a heart attack goes first, a scratched finger later.",
    ),
    theory: [
      t(
        "Daraja tuzatish muddatini belgilaydi: kritik — bugun, past — reja bo‘yicha.",
        "The level sets the deadline: critical today, low on the plan.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t("Ta’sir va ehtimollik.", "Impact and likelihood."),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t("Xavf qanday baholanadi?", "How is risk rated?"),
          options: [
            t("Ta’sir × ehtimollik", "Impact × likelihood"),
            t("Kod qatorlari soni", "Lines of code"),
            t("Muallifning tajribasi", "The author’s experience"),
          ],
          answer: 0,
          explain: t(
            "Katta zarar, lekin deyarli imkonsiz — o‘rta bo‘lishi mumkin.",
            "Huge damage but nearly impossible may still be medium.",
          ),
        },
        {
          ask: t(
            "Hujumchiga hech narsa kerak bo‘lmasa, bu nimani oshiradi?",
            "When the attacker needs nothing at all, what goes up?",
          ),
          options: [
            t("Ehtimollikni", "The likelihood"),
            t("Ta’sirni", "The impact"),
            t("Hech narsani", "Nothing"),
          ],
          answer: 0,
          explain: t(
            "Oson hujum — tez-tez bo‘ladigan hujum.",
            "An easy attack is a frequent one.",
          ),
        },
      ],
    },
  },
  {
    id: 6,
    group: REPORTING,
    title: t("Topilmalarni baholash", "Rating the findings"),
    minutes: 8,
    intro: t(
      "Endi ko‘rikdagi topilmalarga daraja bering. Har biri uchun so‘rang: muvaffaqiyatli bo‘lsa nima yo‘qotiladi va hujumchiga nima kerak?",
      "Now give the review’s findings a level. For each, ask: what is lost if it works, and what does the attacker need?",
    ),
    analogy: t(
      "Uydagi nosozliklar: ochiq eshik, ishlamaydigan signalizatsiya, eski qulf, ko‘chadan ko‘rinadigan eshik raqami.",
      "Faults in a house: an open door, a broken alarm, an old lock, a house number visible from the street.",
    ),
    theory: [
      t(
        "Xulosa hisobotida kritik va yuqori topilmalar birinchi turadi.",
        "Critical and high findings come first in the report.",
      ),
    ],
    task: t("Har bir topilmaga daraja bering.", "Give each finding a level."),
    hint: t(
      "Login ham kerak bo‘lmasa — eng yuqori.",
      "If not even a login is needed, it’s the top.",
    ),
    widget: { type: "rate" },
  },
  {
    id: 7,
    group: REPORTING,
    title: t(
      "Tasdiqlash yoki o‘zgartirish so‘rash",
      "Approve or request changes",
    ),
    minutes: 5,
    intro: t(
      "Ko‘rik oxirida qaror qabul qilinadi. Kritik yoki yuqori muammo bor ekan — “Request changes”: birlashtirilmaydi. Faqat mayda izohlar (nit) yoki keyingi vazifaga qoldirsa bo‘ladigan past topilmalar qolgan bo‘lsa — “Approve”, izohlar bilan. Tasdiqlash — imzo: “men buni o‘qidim va xavfsiz deb hisoblayman”.",
      "A review ends with a decision. While a critical or high problem remains — “Request changes”: it doesn’t merge. When only nits or low findings that can wait for a follow-up ticket remain — “Approve”, with comments. An approval is a signature: “I read this and believe it is safe”.",
    ),
    analogy: t(
      "Texnik ko‘rik: tormoz ishlamasa — yo‘lga chiqmaydi; chiroq xira bo‘lsa — ogohlantirish bilan o‘tadi.",
      "A vehicle inspection: failed brakes keep it off the road; a dim bulb passes with a note.",
    ),
    theory: [
      t(
        "Muhim kod uchun ikki ko‘ruvchi va CODEOWNERS qoidasi ishlatiladi.",
        "Sensitive code uses two reviewers and a CODEOWNERS rule.",
      ),
    ],
    task: t(
      "Har bir holatda qaror qanday?",
      "What is the decision in each case?",
    ),
    hint: t("Kritik va yuqori — to‘xtatadi.", "Critical and high stop it."),
    widget: {
      type: "sort",
      buckets: [
        { id: "changes", label: t("O‘zgartirish so‘rash", "Request changes") },
        { id: "approve", label: t("Tasdiqlash", "Approve") },
      ],
      items: [
        {
          label: t(
            "Boshqa foydalanuvchining ma’lumotini ochadigan IDOR",
            "An IDOR that exposes another user’s data",
          ),
          bucket: "changes",
        },
        {
          label: t(
            "Faqat o‘zgaruvchi nomi bo‘yicha nit",
            "Only a nit about a variable name",
          ),
          bucket: "approve",
        },
        {
          label: t(
            "Kodga yozilgan to‘lov tizimi kaliti",
            "A payment provider key written in the code",
          ),
          bucket: "changes",
        },
        {
          label: t(
            "X-Powered-By sarlavhasi, keyingi vazifaga yozildi",
            "An X-Powered-By header, logged as a follow-up ticket",
          ),
          bucket: "approve",
        },
        {
          label: t(
            "Hammani admin qiladigan = belgisi",
            "An = that makes everyone admin",
          ),
          bucket: "changes",
        },
      ],
    },
  },
  {
    id: 8,
    group: REPORTING,
    title: t("Yakuniy savollar", "Final questions"),
    minutes: 6,
    intro: t(
      "Kod ko‘rigi bilan AppSec yo‘nalishi tugaydi: tahdid modeli nima qurishni, xavfsiz kod — qanday yozishni, kutubxonalar — nimaga tayanishni, avtomatik tekshiruvlar — har commit’ni, kod ko‘rigi esa odam ko‘zini beradi. Birgalikda ular xavfsizlikni boshidan qurilgan qiladi.",
      "Code review completes the AppSec domain: threat modelling says what to build, secure coding how to write it, dependency work what to rely on, automated checks watch every commit and code review adds a human eye. Together they build security in from the start.",
    ),
    analogy: t(
      "Bino: loyiha, qurilish, materiallar, sensorlar va inspektor.",
      "A building: the plan, the construction, the materials, the sensors and the inspector.",
    ),
    theory: [
      t(
        "Ko‘rikda topilgan har bir xato — yangi ro‘yxat bandi yoki yangi avtomatik qoida bo‘lishi mumkin.",
        "Every flaw found in review can become a checklist item or a new automated rule.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t("Odam, ro‘yxat, dalil.", "People, checklists, evidence."),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "`requireLogin` bor. Buyurtmani ko‘rishda yana nima kerak?",
            "`requireLogin` is there. What else does viewing an order need?",
          ),
          options: [
            t(
              "Buyurtma shu foydalanuvchiniki ekanini tekshirish",
              "A check that the order belongs to this user",
            ),
            t("Hech narsa", "Nothing"),
            t("Ikkinchi requireLogin", "A second requireLogin"),
          ],
          answer: 0,
          explain: t(
            "Autentifikatsiya — kim; avtorizatsiya — nimaga haqli.",
            "Authentication is who; authorisation is what they may do.",
          ),
        },
        {
          ask: t(
            "Kritik topilma bor pull request’da qaror?",
            "The decision on a pull request with a critical finding?",
          ),
          options: [
            t("Request changes", "Request changes"),
            t("Approve", "Approve"),
            t("Izohsiz merge", "Merge without comment"),
          ],
          answer: 0,
          explain: t(
            "Tuzatilmaguncha birlashtirilmaydi.",
            "It doesn’t merge until fixed.",
          ),
        },
      ],
    },
  },
];
