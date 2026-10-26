import type { VideoLesson } from "./types";

const DAILY = [
  "#!/bin/bash",
  "# Kunlik jurnal tekshiruvi",
  'SERVER="web-1"',
  "for FILE in *.log; do",
  '  echo "Tekshirilmoqda: $FILE"',
  "done",
  'echo "$SERVER: tayyor"',
];

const CHECK = [
  "#!/bin/bash",
  'LOG="$1"',
  "for USER in root admin ali; do",
  '  COUNT=$(grep -c "Failed password for $USER" "$LOG")',
  '  if [ "$COUNT" -gt 100 ]; then',
  '    echo "Ogohlantirish: $USER — $COUNT urinish"',
  "  fi",
  "done",
];

// Video lesson for the Bash scripting lab, narrated in Uzbek: the story of a
// night attack on a shop's server, told with Kibi and 3D shots.
export const BASH_VIDEO: VideoLesson = {
  id: "bash",
  title: "Bash asoslari",
  href: "/akademiya/bash",
  chapters: [
    {
      title: "Tungi hujum",
      scenes: [
        {
          say: "Tungi soat uch. Ali shop.uz internet do‘konida yosh tizim administratori bo‘lib ishlaydi. Birdan telefoni jiringladi: sayt juda sekin ishlayapti! Ali serverga ulandi va kirish jurnalini ochdi. Ekranda qizil qatorlar to‘xtovsiz oqyapti.",
          visual: { kind: "3d", shot: "nightserver", stage: 0 },
          host: { mood: "shock" },
          sfx: [
            { at: 0.15, name: "alarm" },
            { at: 0.6, name: "type" },
          ],
        },
        {
          say: "Har bir qatorda bir xil yozuv: “Failed password”, ya’ni noto‘g‘ri parol. Kimdir serverga minglab parollarni birma-bir sinab ko‘ryapti. Jurnalda o‘n ming qator bor. Ularni qo‘lda o‘qib chiqish uchun Aliga butun hafta kerak bo‘ladi. Hujum esa hozir bo‘lyapti!",
          visual: { kind: "3d", shot: "nightserver", stage: 0 },
          host: { mood: "sad" },
          sfx: [{ at: 0.5, name: "alarm" }],
        },
        {
          say: "Salom, men Kibi! Xavotir olmang, Alining qo‘lida kuchli qurol bor — Bash. Bash — buyruqlarni tushunadigan dastur, uni shell yoki qobiq deyishadi. Linux serverlarining deyarli barchasida u bor. Bugun Ali bilan birga skript yozamiz va hujumchini bir necha soniyada topamiz.",
          visual: {
            kind: "host",
            title: "Bash asoslari",
            subtitle: "O‘zgaruvchilar, sikllar, shartlar va xavfsizlik skripti",
            mood: "happy",
          },
          sfx: [{ at: 0.05, name: "magic" }],
        },
      ],
    },
    {
      title: "Skript — bu retsept",
      scenes: [
        {
          say: "Terminalda buyruqlarni bittadan yozish mumkin. Lekin bir xil ishni har kuni takrorlasangiz-chi? Mana shu yerda skript yordam beradi. Skript — buyruqlar ketma-ket yozilgan oddiy matn fayli. Bash uni yuqoridan pastga, qatorma-qator bajaradi.",
          visual: { kind: "3d", shot: "recipe" },
          host: { mood: "talk" },
          sfx: [{ at: 0.3, name: "pop" }],
        },
        {
          say: "Bu xuddi oshpazning retsepti kabi. Robot oshpaz retsept kartasidagi qatorlarni birma-bir o‘qiydi va bajaradi: guruch yuv, sabzi to‘gra, qozonni qizdir. U hech narsani o‘zidan qo‘shmaydi va hech qachon charchamaydi. Skript ham shunday ishlaydi.",
          visual: { kind: "3d", shot: "recipe" },
          host: { mood: "happy" },
          sfx: [
            { at: 0.3, name: "pop" },
            { at: 0.6, name: "pop" },
          ],
        },
        {
          say: "Mana oddiy skript. Birinchi qator panjara va undov belgisidan boshlanadi, uni shebang deyishadi. U skriptni qaysi dastur bajarishini aytadi, bizda bu bin papkasidagi bash. Panjara bilan boshlanadigan boshqa qatorlar izoh: kompyuter ularni o‘qimaydi, ular odamlar uchun.",
          visual: {
            kind: "code",
            title: "daily.sh",
            lines: DAILY,
            focus: [0, 1],
          },
          host: { mood: "talk" },
        },
        {
          say: "Keyingi qatorda SERVER degan o‘zgaruvchi yaratilgan. Undan keyin for sikli har bir log fayl uchun xabar chiqaradi. Oxirgi qator esa ish tugaganini aytadi. Skriptni ishga tushirish uchun unga chmod buyrug‘i bilan bajarish huquqini berasiz va nuqta slesh daily nuqta sh deb yozasiz.",
          visual: {
            kind: "code",
            title: "daily.sh",
            lines: DAILY,
            focus: [2, 3, 4, 5, 6],
          },
          host: { mood: "think" },
        },
      ],
    },
    {
      title: "O‘zgaruvchilar — nomli qutilar",
      scenes: [
        {
          say: "O‘zgaruvchi — nomli quti. Unga qiymat solasiz va keyin nomi orqali ishlatasiz. Javondagi yorliqli qutilarni tasavvur qiling: NAME degan qutiga Ali solindi, SERVER degan qutiga web-1. Kerak bo‘lganda yorliqqa qarab olasiz.",
          visual: { kind: "3d", shot: "shelf", stage: 0 },
          host: { mood: "happy" },
          sfx: [
            { at: 0.3, name: "pop" },
            { at: 0.55, name: "pop" },
          ],
        },
        {
          say: "Qiymat berish shunday yoziladi: NAME, tenglik belgisi, Ali. Diqqat qiling: tenglik belgisining atrofida bo‘sh joy bo‘lmaydi! Agar bo‘sh joy qo‘ysangiz, Bash NAME so‘zini buyruq deb o‘ylaydi, quti javondan tushib ketadi va xato chiqadi.",
          visual: { kind: "3d", shot: "shelf", stage: 1 },
          host: { mood: "shock" },
          sfx: [{ at: 0.55, name: "alarm" }],
        },
        {
          say: "Qiymatni ishlatish uchun nom oldiga dollar belgisi qo‘yiladi. Terminalda ko‘ramiz: NAME teng Ali, keyin echo “Salom, dollar NAME” — va ekranda “Salom, Ali” chiqadi. Bo‘sh joy bilan yozganda esa command not found xatosi.",
          visual: {
            kind: "terminal",
            lines: [
              { cmd: "NAME=Ali" },
              { cmd: 'echo "Salom, $NAME"' },
              { out: "Salom, Ali" },
              { cmd: "NAME = Ali" },
              { out: "bash: NAME: command not found" },
            ],
          },
          host: { mood: "talk" },
          sfx: [{ at: 0.1, name: "type" }],
        },
      ],
    },
    {
      title: "Qo‘shtirnoqlar va hisob",
      scenes: [
        {
          say: "Bashda qo‘shtirnoqning turi muhim. Bir xil xat ikki darvozadan o‘tadi. Ikkitalik qo‘shtirnoq darvozasida dollar belgisi ishlaydi: dollar NAME o‘rniga Ali qo‘yiladi. Bittalik qo‘shtirnoq darvozasida esa hech narsa almashtirilmaydi, matn xuddi yozilganidek chiqadi.",
          visual: { kind: "3d", shot: "quotes" },
          host: { mood: "think" },
          sfx: [
            { at: 0.3, name: "whoosh" },
            { at: 0.65, name: "whoosh" },
          ],
        },
        {
          say: "Fayl nomida bo‘sh joy bo‘lsa ham, o‘zgaruvchini ikkitalik qo‘shtirnoqqa olish yaxshi odat. Aks holda “mening hisobotim” degan fayl ikki xil faylga bo‘linib ketadi va skript adashadi.",
          visual: {
            kind: "points",
            heading: "Qo‘shtirnoqlar",
            items: [
              '"…" — $ ishlaydi: "Salom, $NAME" → Salom, Ali',
              "'…' — hech narsa almashmaydi",
              'O‘zgaruvchini doim "$FILE" deb yozing',
            ],
          },
          host: { mood: "talk" },
        },
        {
          say: "Bash uchun hamma narsa matn. Agar yetti plyus besh deb yozsangiz, Bash shunchaki shu matnni chiqaradi. Raqamlarni hisoblash uchun ularni dollar belgisi va ikki juft qavs ichiga olish kerak. Shunda Bash kalkulyatorga aylanadi va o‘n ikki deb javob beradi.",
          visual: {
            kind: "terminal",
            lines: [
              { cmd: "A=7; B=5" },
              { cmd: "echo $A + $B" },
              { out: "7 + 5" },
              { cmd: "echo $((A + B))" },
              { out: "12" },
              { cmd: "echo $((A * B))" },
              { out: "35" },
            ],
          },
          host: { mood: "happy" },
          sfx: [{ at: 0.1, name: "type" }],
        },
        {
          say: "Kichik test! NAME teng Ali bo‘lsa, echo bittalik qo‘shtirnoqda “Salom, dollar NAME” nimani chiqaradi?",
          visual: {
            kind: "quiz",
            question: "NAME=Ali. echo 'Salom, $NAME' nimani chiqaradi?",
            options: ["Salom, Ali", "Salom, $NAME", "Xato beradi"],
            answer: 1,
          },
          host: { mood: "think" },
          hold: 5,
        },
      ],
    },
    {
      title: "for sikli — konveyer",
      scenes: [
        {
          say: "Endi sikllar. Alining serverida o‘nlab jurnal fayllari bor. for sikli ro‘yxatdagi har bir element uchun bir xil ishni takrorlaydi. Konveyerni tasavvur qiling: fayllar birma-bir keladi, robot har birini tekshiradi va keyingisini kutadi.",
          visual: { kind: "3d", shot: "conveyor" },
          host: { mood: "talk" },
          sfx: [
            { at: 0.25, name: "pop" },
            { at: 0.5, name: "pop" },
            { at: 0.75, name: "pop" },
          ],
        },
        {
          say: "Har bir aylanishda o‘zgaruvchi ro‘yxatdagi navbatdagi qiymatni oladi: avval app.log, keyin auth.log, keyin db.log. Do va done so‘zlari orasidagi qatorlar sikl tanasi deb ataladi. Ro‘yxat tugaganda sikl ham tugaydi.",
          visual: { kind: "3d", shot: "conveyor" },
          host: { mood: "happy" },
        },
        {
          say: "Ro‘yxatni qo‘lda yozish shart emas. Yulduzcha nuqta log deb yozsangiz, papkadagi barcha log fayllar olinadi. Figurali qavs ichida bir, ikki nuqta, besh deb yozsangiz, birdan beshgacha sonlar olinadi.",
          visual: {
            kind: "terminal",
            lines: [
              { cmd: "for i in {1..5}; do echo $i; done" },
              { out: "1\n2\n3\n4\n5" },
              { cmd: "for f in *.log; do echo $f; done" },
              { out: "app.log\nauth.log\ndb.log" },
            ],
          },
          host: { mood: "talk" },
          sfx: [{ at: 0.1, name: "type" }],
        },
      ],
    },
    {
      title: "while va if",
      scenes: [
        {
          say: "while sikli shart to‘g‘ri bo‘lib turguncha aylanadi. Mana raketa: i besh bo‘lsa, besh deb aytadi va bittaga kamaytiradi. To‘rt, uch, ikki, bir… i nolga yetganda shart yolg‘on bo‘ladi, sikl tugaydi va raketa uchadi. Start!",
          visual: { kind: "3d", shot: "rocket" },
          host: { mood: "happy" },
          sfx: [
            { at: 0.75, name: "whoosh" },
            { at: 0.85, name: "magic" },
          ],
        },
        {
          say: "Muhim qator — hisoblagichni bittaga kamaytiradigan qator. Agar uni yozishni unutsangiz, shart doim to‘g‘ri bo‘lib qoladi va sikl hech qachon tugamaydi. Raketa hech qachon uchmaydi! Bunday siklni Ctrl va C tugmalari bilan to‘xtatasiz.",
          visual: {
            kind: "code",
            title: "countdown.sh",
            lines: [
              "i=5",
              "while [ $i -gt 0 ]; do",
              "  echo $i",
              "  i=$((i - 1))",
              "done",
              'echo "Start!"',
            ],
            focus: [1, 3],
          },
          host: { mood: "think" },
        },
        {
          say: "if esa yo‘l ayrilishi. Shart to‘g‘ri bo‘lsa, bir yo‘ldan, noto‘g‘ri bo‘lsa, boshqa yo‘ldan ketadi. Masalan: urinishlar soni yuzdan katta bo‘lsa — qizil yo‘l, ogohlantirish. Aks holda — yashil yo‘l, hammasi joyida.",
          visual: { kind: "3d", shot: "fork" },
          host: { mood: "talk" },
          sfx: [
            { at: 0.4, name: "whoosh" },
            { at: 0.75, name: "alarm" },
          ],
        },
        {
          say: "Shartlar kvadrat qavs ichida yoziladi va qavslar ichida bo‘sh joy qoldirish shart. Sonlarni solishtirish uchun maxsus so‘zlar bor: eq — teng, ne — teng emas, lt — kichik, gt — katta. if fi so‘zi bilan yopiladi — bu if so‘zining teskarisi.",
          visual: {
            kind: "points",
            heading: "Shartlar",
            items: [
              "[ $A -eq $B ] — teng",
              "[ $A -ne $B ] — teng emas",
              "[ $A -lt $B ] — kichik, -gt — katta",
              "if … then … else … fi",
            ],
          },
          host: { mood: "wink" },
        },
        {
          say: "Savol! Hisoblagichni kamaytiradigan qator unutilsa, while sikli bilan nima bo‘ladi?",
          visual: {
            kind: "quiz",
            question: "Hisoblagich kamaytirilmasa, while sikli nima bo‘ladi?",
            options: [
              "Bir marta ishlaydi",
              "Hech qachon tugamaydi",
              "Bash o‘zi tuzatadi",
            ],
            answer: 1,
          },
          host: { mood: "think" },
          hold: 5,
        },
      ],
    },
    {
      title: "Hujumchini topamiz",
      scenes: [
        {
          say: "Endi Aliga qaytamiz va bilganlarimizni birlashtiramiz. Skript jurnal faylini argument sifatida oladi. Dollar bir — birinchi argument. Shunday qilib, bitta skript istalgan jurnal bilan ishlaydi. for sikli root, admin va ali foydalanuvchilarini birma-bir oladi.",
          visual: {
            kind: "code",
            title: "check.sh",
            lines: CHECK,
            focus: [1, 2],
          },
          host: { mood: "talk" },
        },
        {
          say: "grep buyrug‘i jurnaldan “Failed password” yozuvlarini qidiradi, minus c esa ularni sanaydi. Dollar va oddiy qavs buyruq natijasini o‘zgaruvchiga soladi. if esa sonni yuz bilan solishtiradi va katta bo‘lsa, ogohlantirish chiqaradi.",
          visual: {
            kind: "code",
            title: "check.sh",
            lines: CHECK,
            focus: [3, 4, 5],
          },
          host: { mood: "think" },
        },
        {
          say: "Ali skriptni ishga tushirdi. Robot qorovul fonar bilan jurnal bo‘ylab yuguradi, har bir “Failed password” qatorini qizil bilan belgilaydi va sanaydi. Bir soniyadan keyin javob tayyor: root foydalanuvchisiga to‘qqiz ming sakkiz yuz urinish, hammasi bitta IP manzildan!",
          visual: { kind: "3d", shot: "guard", stage: 0 },
          host: { mood: "shock" },
          sfx: [
            { at: 0.2, name: "whoosh" },
            { at: 0.8, name: "alarm" },
          ],
        },
        {
          say: "Endi Ali bu IP manzilni xavfsizlik devorida blokladi. Qizil oqim to‘xtadi, sayt yana tez ishlay boshladi. Ali yana bir ish qildi: root bilan parol orqali kirishni butunlay o‘chirib, faqat SSH kalitlariga ruxsat berdi. Hujum tugadi!",
          visual: { kind: "3d", shot: "guard", stage: 1 },
          host: { mood: "happy" },
          sfx: [
            { at: 0.3, name: "pop" },
            { at: 0.7, name: "ding" },
          ],
        },
        {
          say: "Ali bu skriptni har soatda avtomatik ishlaydigan qilib qo‘ydi. Endi serverni tunda ham skript qo‘riqlaydi. Takroriy ishni kompyuterga topshirish — Bashning eng katta kuchi.",
          visual: { kind: "3d", shot: "nightserver", stage: 1 },
          host: { mood: "wink" },
          sfx: [{ at: 0.4, name: "magic" }],
        },
      ],
    },
    {
      title: "Begona skriptdan ehtiyot bo‘ling",
      scenes: [
        {
          say: "Va eng muhim qoida. Skript siz bilan bir xil huquqlar bilan ishlaydi. Internetda ko‘pincha shunday maslahat uchraydi: “curl bilan skriptni yuklab, to‘g‘ridan-to‘g‘ri bashga uzating”. Bu chiroyli quti ichida nima borligini bilmasdan, uni uyingizga olib kirishdek gap.",
          visual: { kind: "3d", shot: "trojan" },
          host: { mood: "think" },
          sfx: [{ at: 0.3, name: "whoosh" }],
        },
        {
          say: "Quti ochildi — ichida rm minus rf buyrug‘i! U fayllaringizni o‘chirib yuborishi yoki ma’lumotlaringizni begona serverga jo‘natishi mumkin. Shuning uchun begona skriptni avval yuklab oling, o‘qib chiqing va tushungandan keyingina ishga tushiring. Root huquqi bilan esa ayniqsa ehtiyot bo‘ling.",
          visual: { kind: "3d", shot: "trojan" },
          host: { mood: "shock" },
          sfx: [
            { at: 0.15, name: "pop" },
            { at: 0.35, name: "alarm" },
          ],
        },
        {
          say: "Oxirgi savol! Internetdan olingan skriptni ishga tushirishdan oldin nima qilish kerak?",
          visual: {
            kind: "quiz",
            question: "Internetdan olingan skript bilan avval nima qilasiz?",
            options: [
              "Darhol root bilan ishga tushiraman",
              "Yuklab olib, o‘qib chiqaman",
              "Do‘stlarimga yuboraman",
            ],
            answer: 1,
          },
          host: { mood: "think" },
          hold: 5,
        },
      ],
    },
    {
      title: "Xulosa",
      scenes: [
        {
          say: "Xulosa qilamiz. Skript takroriy ishlarni avtomatlashtiradi. O‘zgaruvchi — nomli quti, tenglik atrofida bo‘sh joy yo‘q. Ikkitalik qo‘shtirnoqda dollar ishlaydi, bittalikda yo‘q. Hisob uchun dollar va ikki qavs. for ro‘yxat bo‘yicha aylanadi, while shart to‘g‘ri ekan aylanadi, if yo‘lni tanlaydi.",
          visual: {
            kind: "points",
            heading: "Esda tuting",
            items: [
              "Skript — retsept, Bash qatorma-qator bajaradi",
              "NAME=Ali — bo‘sh joysiz, $NAME bilan o‘qiladi",
              "\"…\" da $ ishlaydi, '…' da yo‘q",
              "for — ro‘yxat, while — shart, if — tanlov",
              "Begona skriptni avval o‘qing",
            ],
          },
          host: { mood: "talk" },
        },
        {
          say: "Endi laboratoriyaga o‘ting. U yerda brauzer ichidagi xavfsiz terminalda har bir buyruqni o‘zingiz yozib ko‘rasiz, siklni qadamma-qadam kuzatasiz va xavfsizlik skriptini ishga tushirasiz. Oxirida nazorat testidan o‘tsangiz, sertifikat olasiz. Men sizni kutaman. Omad!",
          visual: {
            kind: "host",
            title: "Endi amaliyot!",
            subtitle: "Laboratoriya · nazorat testi · sertifikat",
            mood: "wink",
          },
          host: { hide: true },
          sfx: [{ at: 0.1, name: "magic" }],
        },
      ],
    },
  ],
};
