// Academy Intermediate · Social engineering, module 3: Awareness programmes.
// The lessons use ./tools.ts: an awareness plan to review.
import type { CommonWidget, Lesson, Text } from "../anim-lab/types";

export type Widget = CommonWidget | { type: "plan" };

export const PROGRESS_KEY = "cybervalue:awareness:progress:v1";

const t = (uz: string, en: string): Text => ({ uz, en });

const PLANNING = t("Rejalash", "Planning");
const RUNNING = t("O‘tkazish", "Running it");

export const LESSONS: Lesson<Widget>[] = [
  {
    id: 1,
    group: PLANNING,
    title: t("Nega xabardorlik", "Why awareness"),
    minutes: 5,
    intro: t(
      "Texnik himoya ko‘p narsani to‘xtatadi, lekin hammasini emas: phishing xat filtrdan o‘tib ketishi mumkin. Shunda oxirgi himoya chizig‘i — xatni ko‘rib, shubhalanib, xabar bergan odam. Xabardorlik dasturining maqsadi — odamlarni “eng zaif bo‘g‘in”dan “sensorlar tarmog‘i”ga aylantirish: ular aldashni tanib oladi, to‘xtaydi va tez xabar beradi. Bu bir martalik tadbir emas, balki odat.",
      "Technical defences stop a lot, but not everything: a phishing email can slip past the filter. Then the last line of defence is the person who sees it, gets suspicious and reports it. An awareness programme aims to turn people from “the weakest link” into a network of sensors: they recognise tricks, pause and report quickly. It is a habit, not a one-off event.",
    ),
    analogy: t(
      "Mahalladagi har bir qo‘shni g‘alati narsani sezsa xabar beradi — bu politsiyaning ko‘zi.",
      "Neighbours who report anything odd are the police’s extra eyes.",
    ),
    theory: [
      t(
        "Maqsad — xatti-harakat o‘zgarishi, test bahosi emas.",
        "The goal is changed behaviour, not a test score.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t("Odamlar — sensorlar.", "People are sensors."),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Xabardorlik dasturining asosiy maqsadi?",
            "The main goal of an awareness programme?",
          ),
          options: [
            t(
              "Aldashni tanib, tez xabar berish odati",
              "A habit of spotting tricks and reporting fast",
            ),
            t("Xatolarni jazolash", "Punishing mistakes"),
            t("Yillik testdan o‘tish", "Passing a yearly test"),
          ],
          answer: 0,
          explain: t(
            "Natija — odamlarning xatti-harakati.",
            "Success is measured in what people do.",
          ),
        },
        {
          ask: t(
            "Nega texnik filtrning o‘zi yetmaydi?",
            "Why isn’t a technical filter enough on its own?",
          ),
          options: [
            t(
              "Ba’zi xatlar baribir o‘tib ketadi",
              "Some messages still get through",
            ),
            t("Filtr hamma narsani to‘xtatadi", "Filters stop everything"),
            t("Filtrlar pullik", "Filters cost money"),
          ],
          answer: 0,
          explain: t(
            "Yangi va aniq yo‘naltirilgan xatlar ko‘pincha o‘tadi.",
            "New, targeted messages often get through.",
          ),
        },
      ],
    },
  },
  {
    id: 2,
    group: PLANNING,
    title: t("Kimga va nimani", "Who and what"),
    minutes: 6,
    intro: t(
      "Hammaga bir xil mashg‘ulot kamdan-kam ishlaydi. Avval xavflarni aniqlang: buxgalteriya soxta hisob-faktura va to‘lov so‘rovlarini oladi, HR — rezyume ko‘rinishidagi zararli fayllarni, rahbarlar — aniq nishonga olingan xatlarni (spear phishing), yordam xizmati — parolni tiklash bahonasidagi qo‘ng‘iroqlarni. Har bir guruh uchun o‘z misollarini tanlang va bitta mashg‘ulotda bitta asosiy xulosa bering.",
      "One session for everyone rarely works. First identify the risks: finance receives fake invoices and payment requests, HR gets malicious files dressed up as CVs, executives get targeted messages (spear phishing), and the help desk gets calls with password-reset pretexts. Pick examples for each group, and give one main takeaway per session.",
    ),
    analogy: t(
      "Shifokor har bir bemorga o‘z dorisini beradi, hammaga bir xilini emas.",
      "A doctor prescribes for each patient, not the same pill for everyone.",
    ),
    theory: [
      t(
        "Yangi xodimlar uchun birinchi haftada qisqa kirish mashg‘uloti foydali.",
        "A short induction in a new starter’s first week pays off.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t("Har bir guruhning o‘z xavfi.", "Each group has its own risks."),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Buxgalteriya uchun eng muhim mavzu?",
            "The most important topic for finance?",
          ),
          options: [
            t(
              "Soxta hisob-faktura va bank rekvizitlarini o‘zgartirish so‘rovlari",
              "Fake invoices and requests to change bank details",
            ),
            t("Wi-Fi router sozlamalari", "Wi-Fi router settings"),
            t("Kod ko‘rib chiqish", "Code review"),
          ],
          answer: 0,
          explain: t(
            "To‘lov aldovlari eng ko‘p zarar keltiradi.",
            "Payment fraud does the most damage.",
          ),
        },
        {
          ask: t(
            "Bitta mashg‘ulotda nechta asosiy xulosa bo‘lgani yaxshi?",
            "How many main takeaways should one session have?",
          ),
          options: [
            t("Bitta", "One"),
            t("O‘nta", "Ten"),
            t("Yigirmata", "Twenty"),
          ],
          answer: 0,
          explain: t(
            "Bitta aniq odat — eslab qolish oson.",
            "One clear habit is easy to remember.",
          ),
        },
      ],
    },
  },
  {
    id: 3,
    group: PLANNING,
    title: t("Rejani ko‘rib chiqish", "Reviewing a plan"),
    minutes: 7,
    intro: t(
      "Quyida kichik jamoa uchun tuzilgan xabardorlik rejasidagi sakkizta tanlov. Ularning to‘rttasi teskari natija beradi: odamlarni qo‘rqitadi, uyaltiradi yoki noto‘g‘ri narsani o‘lchaydi. Qaysilari?",
      "Below are eight choices from an awareness plan for a small team. Four of them backfire: they frighten people, shame them, or measure the wrong thing. Which ones?",
    ),
    analogy: t(
      "Murabbiy o‘yinchini maydonda uyaltirmaydi — mashg‘ulotda o‘rgatadi.",
      "A coach doesn’t shame a player on the pitch — they teach in training.",
    ),
    theory: [
      t(
        "Simulyatsiyalardan oldin rahbariyat va HR bilan qoidalarni kelishib oling.",
        "Agree the rules with management and HR before running simulations.",
      ),
    ],
    task: t(
      "Teskari natija beradigan tanlovlarni belgilang.",
      "Tick the choices that backfire.",
    ),
    hint: t(
      "Uyaltirish, qo‘rqitish, kam o‘lchash, kam takrorlash.",
      "Shaming, frightening, measuring too little, repeating too rarely.",
    ),
    widget: { type: "plan" },
  },
  {
    id: 4,
    group: RUNNING,
    title: t("Phishing simulyatsiyalari", "Phishing simulations"),
    minutes: 6,
    intro: t(
      "Simulyatsiya — xodimlarga xavfsiz, o‘quv phishing xatini yuborish. U maxsus platforma orqali, rahbariyat roziligi bilan va oldindan kelishilgan qoidalar bo‘yicha o‘tkaziladi. Yaxshi simulyatsiya haqiqiy hujumga o‘xshaydi, lekin odamlarni jarohatlamaydi: ish haqi, ishdan bo‘shatish yoki sog‘liq kabi og‘riqli mavzular ishlatilmaydi. Bosgan odam jazolanmaydi — u darhol qisqa tushuntirishni ko‘radi.",
      "A simulation sends staff a safe, training phishing email. It runs on a dedicated platform, with management’s approval and under rules agreed in advance. A good simulation looks like a real attack but doesn’t hurt people: no painful themes such as pay, redundancies or health. Whoever clicks isn’t punished — they see a short explanation straight away.",
    ),
    analogy: t(
      "Yong‘in mashqi: haqiqiy yong‘inga o‘xshaydi, lekin hech kim kuymaydi.",
      "A fire drill: it feels like the real thing, but no one gets burned.",
    ),
    theory: [
      t(
        "Qiyinlikni asta-sekin oshiring: avval oson, keyin murakkabroq xatlar.",
        "Raise the difficulty gradually: easy messages first, harder ones later.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t("O‘rgatish, jazolash emas.", "Teach, don’t punish."),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Simulyatsiyada bosgan xodim bilan nima qilinadi?",
            "What happens to someone who clicks a simulation?",
          ),
          options: [
            t(
              "Darhol qisqa tushuntirish ko‘radi",
              "They see a short explanation straight away",
            ),
            t("Maoshi kamaytiriladi", "Their pay is cut"),
            t("Ismi e’lon qilinadi", "Their name is announced"),
          ],
          answer: 0,
          explain: t(
            "Maqsad — o‘rganish, qo‘rquv emas.",
            "The aim is learning, not fear.",
          ),
        },
        {
          ask: t(
            "Simulyatsiya uchun qaysi mavzu mos emas?",
            "Which theme is wrong for a simulation?",
          ),
          options: [
            t("Ishdan bo‘shatish ro‘yxati", "A redundancy list"),
            t("Umumiy hujjatga taklif", "An invite to a shared document"),
            t("Posilka haqida xabar", "A parcel notification"),
          ],
          answer: 0,
          explain: t(
            "Og‘riqli mavzular ishonchni buzadi.",
            "Painful themes destroy trust.",
          ),
        },
      ],
    },
  },
  {
    id: 5,
    group: RUNNING,
    title: t("Nimani o‘lchash", "What to measure"),
    minutes: 6,
    intro: t(
      "Faqat bosish foizini kuzatish chalg‘itadi: xatni qiyinroq qilsangiz, foiz oshadi, osonroq qilsangiz — tushadi. Muhimroq ko‘rsatkichlar: xabar berish foizi (necha kishi “Report” tugmasini bosdi), birinchi xabargacha bo‘lgan vaqt (jamoa qanchalik tez sezdi) va haqiqiy hodisalar haqidagi xabarlar soni. Yaxshi dasturda vaqt o‘tishi bilan xabar berish oshadi.",
      "Tracking only the click rate is misleading: make the email harder and it goes up, easier and it goes down. Better measures: the report rate (how many pressed “Report”), the time to the first report (how fast the team noticed) and the number of reports of real incidents. In a good programme, reporting grows over time.",
    ),
    analogy: t(
      "Futbolda faqat o‘tkazib yuborilgan gollarni emas, qaytarilgan zarbalarni ham sanash.",
      "In football you count saves, not just goals conceded.",
    ),
    theory: [
      t(
        "Bitta xabar butun kompaniyani himoya qilishi mumkin: xavfsizlik jamoasi xatni hammadan o‘chiradi.",
        "One report can protect the whole company: security removes the email from every inbox.",
      ),
    ],
    task: t("Ko‘rsatkichlarni ajrating.", "Sort the measures."),
    hint: t(
      "Xabar berish va tezlik — foydali.",
      "Reporting and speed are useful.",
    ),
    widget: {
      type: "sort",
      buckets: [
        { id: "useful", label: t("Foydali", "Useful") },
        { id: "misleading", label: t("Chalg‘ituvchi", "Misleading") },
      ],
      items: [
        { label: t("Xabar berish foizi", "Report rate"), bucket: "useful" },
        {
          label: t("Birinchi xabargacha vaqt", "Time to first report"),
          bucket: "useful",
        },
        {
          label: t(
            "Haqiqiy hodisalar haqidagi xabarlar",
            "Reports of real incidents",
          ),
          bucket: "useful",
        },
        {
          label: t("Faqat bosish foizi", "Click rate alone"),
          bucket: "misleading",
        },
        {
          label: t(
            "Slaydlarni ko‘rgan odamlar soni",
            "How many people saw the slides",
          ),
          bucket: "misleading",
        },
        {
          label: t(
            "Eng ko‘p bosgan xodimlar reytingi",
            "A league table of who clicked most",
          ),
          bucket: "misleading",
        },
      ],
    },
  },
  {
    id: 6,
    group: RUNNING,
    title: t("Mashg‘ulot shakli", "The session itself"),
    minutes: 5,
    intro: t(
      "Odamlar qisqa, amaliy va o‘zlariga tegishli narsani eslab qoladi. Yaxshi mashg‘ulot 10–15 daqiqa davom etadi, haqiqiy (lekin anonimlashtirilgan) misollarni ko‘rsatadi, bitta aniq harakatni o‘rgatadi (“shubhali bo‘lsa — Report tugmasini bosing”) va savollarga vaqt qoldiradi. Xavfsizlik jamoasi do‘stona va ochiq bo‘lsa, odamlar unga murojaat qilishdan tortinmaydi.",
      "People remember what is short, practical and about them. A good session lasts 10–15 minutes, shows real (but anonymised) examples, teaches one clear action (“if in doubt, press Report”) and leaves time for questions. When the security team is friendly and approachable, people aren’t shy about coming to it.",
    ),
    analogy: t(
      "Retsept kartochkasi: qisqa, aniq va oshxonada ishlatsa bo‘ladi.",
      "A recipe card: short, clear and usable in the kitchen.",
    ),
    theory: [
      t(
        "Uydagi xavfsizlik (oila, bolalar) mavzulari ham qiziqish uyg‘otadi.",
        "Topics about safety at home (family, children) draw interest too.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t("Qisqa, amaliy, do‘stona.", "Short, practical, friendly."),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Yaxshi mashg‘ulot qancha davom etadi?",
            "How long should a good session be?",
          ),
          options: [
            t("10–15 daqiqa", "10–15 minutes"),
            t("3 soat", "3 hours"),
            t("Butun kun", "A whole day"),
          ],
          answer: 0,
          explain: t(
            "Qisqa va muntazam — uzoq va kam uchraydigandan yaxshi.",
            "Short and regular beats long and rare.",
          ),
        },
        {
          ask: t(
            "Qanday misollar eng yaxshi ishlaydi?",
            "Which examples work best?",
          ),
          options: [
            t(
              "Jamoaga tanish, anonimlashtirilgan haqiqiy misollar",
              "Real, anonymised examples the team will recognise",
            ),
            t(
              "Begona sohadagi umumiy misollar",
              "Generic examples from another industry",
            ),
            t("Misolsiz faqat qoidalar", "Rules with no examples"),
          ],
          answer: 0,
          explain: t(
            "Tanish ko‘rinish — haqiqiy hujumga eng yaqin.",
            "Familiar looks are closest to a real attack.",
          ),
        },
      ],
    },
  },
  {
    id: 7,
    group: RUNNING,
    title: t("Madaniyat", "Culture"),
    minutes: 5,
    intro: t(
      "Xabardorlikning eng kuchli qismi — madaniyat. Rahbarlar o‘zi ham qoidalarga amal qilsa (MFA, xabar berish), odamlar ham shunday qiladi. Xabar bergan xodimni ochiq maqtash, “Xavfsizlik chempionlari” — har bir bo‘limdagi ko‘ngilli yordamchilar — va xavfsizlik jamoasiga oson murojaat qilish imkoniyati dasturni har kungi odatga aylantiradi.",
      "The strongest part of awareness is culture. When leaders follow the rules themselves (MFA, reporting), people do too. Publicly thanking whoever reports, “Security Champions” — volunteer helpers in each department — and an easy way to reach the security team turn the programme into an everyday habit.",
    ),
    analogy: t(
      "Bolalar ota-onasi aytganini emas, qilganini takrorlaydi.",
      "Children copy what their parents do, not what they say.",
    ),
    theory: [
      t(
        "Har oy eng yaxshi xabar beruvchini e’tirof eting — bosganlarni emas.",
        "Each month, recognise the best reporter — not the people who clicked.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t("O‘rnak va maqtov.", "Lead by example, and say thank you."),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "“Xavfsizlik chempioni” kim?",
            "Who is a “Security Champion”?",
          ),
          options: [
            t(
              "Bo‘limdagi ko‘ngilli xavfsizlik yordamchisi",
              "A volunteer security helper in a department",
            ),
            t("Eng ko‘p bosgan xodim", "The person who clicked most"),
            t("Tashqi auditor", "An outside auditor"),
          ],
          answer: 0,
          explain: t(
            "U jamoa bilan xavfsizlik jamoasi o‘rtasidagi ko‘prik.",
            "They bridge the team and the security team.",
          ),
        },
        {
          ask: t(
            "Madaniyatni eng ko‘p nima o‘zgartiradi?",
            "What changes culture most?",
          ),
          options: [
            t("Rahbarlarning o‘z o‘rnagi", "Leaders setting the example"),
            t("Qattiq jarimalar", "Harsh fines"),
            t("Uzun qoidalar hujjati", "A long rules document"),
          ],
          answer: 0,
          explain: t(
            "Odamlar rahbarlarga qarab ish tutadi.",
            "People follow what leaders do.",
          ),
        },
      ],
    },
  },
  {
    id: 8,
    group: RUNNING,
    title: t("Yakuniy savollar", "Final questions"),
    minutes: 5,
    intro: t(
      "Yaxshi xabardorlik dasturi: xavfga qarab tanlangan mavzular, qisqa va muntazam mashg‘ulotlar, odamlarni jarohatlamaydigan simulyatsiyalar, xabar berishni o‘lchash va ayblovsiz madaniyat. Keyingi modul — hodisa haqida xabar berish: kimga, qanday va qanchalik tez.",
      "A good awareness programme has topics chosen by risk, short regular sessions, simulations that don’t hurt people, reporting as the main measure, and a blameless culture. Next module: reporting incidents — to whom, how and how fast.",
    ),
    analogy: t(
      "Bog‘ parvarishi: bir martalik ekish emas, muntazam sug‘orish.",
      "Gardening: not one day of planting, but regular watering.",
    ),
    theory: [
      t(
        "Har chorakda dasturni ko‘rsatkichlar bo‘yicha qayta ko‘rib chiqing.",
        "Review the programme against its measures every quarter.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t("Qisqa, muntazam, ayblovsiz.", "Short, regular, blameless."),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Dastur muvaffaqiyatining eng yaxshi belgisi?",
            "The best sign a programme is working?",
          ),
          options: [
            t(
              "Xabar berish vaqt o‘tishi bilan oshadi",
              "Reporting grows over time",
            ),
            t("Hech kim hech narsa xabar bermaydi", "No one reports anything"),
            t("Slaydlar ko‘payadi", "The slides get longer"),
          ],
          answer: 0,
          explain: t(
            "Jim turish — xavfsizlik belgisi emas.",
            "Silence isn’t a sign of safety.",
          ),
        },
        {
          ask: t(
            "Simulyatsiyalarni boshlashdan oldin nima kerak?",
            "What do you need before running simulations?",
          ),
          options: [
            t(
              "Rahbariyat va HR bilan kelishilgan qoidalar",
              "Rules agreed with management and HR",
            ),
            t("Hech narsa", "Nothing"),
            t("Xodimlarning parollari", "Staff passwords"),
          ],
          answer: 0,
          explain: t(
            "Ruxsat va aniq chegaralar — majburiy.",
            "Approval and clear limits are a must.",
          ),
        },
      ],
    },
  },
];
