import type { VideoLesson } from "./types";

// Video lesson for the Bash basics lab, narrated in Uzbek.
export const BASH_VIDEO: VideoLesson = {
  id: "bash",
  title: "Bash asoslari",
  href: "/akademiya/bash",
  chapters: [
    {
      title: "Kirish",
      scenes: [
        {
          say: "Assalomu alaykum! Cybervalue Akademiyasiga xush kelibsiz. Bugungi darsimiz Bash haqida. Bash — bu buyruqlarni tushunadigan dastur, uni shell yoki qobiq deyishadi. Linux serverlarining deyarli barchasida, macOS va hatto Windowsda ham Bash bilan ishlash mumkin.",
          visual: {
            kind: "title",
            title: "Bash asoslari",
            subtitle: "O‘zgaruvchi, sikl va skript",
            icon: "terminal",
          },
        },
        {
          say: "Bu darsda skript nima ekanini, o‘zgaruvchilar, qo‘shtirnoqlar, hisob-kitob, for va while sikllari, if sharti va argumentlarni o‘rganamiz. Oxirida esa haqiqiy xavfsizlik skriptini yozamiz: u kirish jurnalidan shubhali urinishlarni topadi.",
          visual: {
            kind: "points",
            heading: "Bugun nimani o‘rganamiz",
            items: [
              "Skript nima va nega kerak",
              "O‘zgaruvchilar va qo‘shtirnoqlar",
              "Hisob-kitob",
              "for va while sikllari, if sharti",
              "Xavfsizlik skripti",
            ],
          },
        },
      ],
    },
    {
      title: "Skript nima va nega kerak",
      scenes: [
        {
          say: "Terminalda buyruqlarni bittadan yozish mumkin. Lekin bir xil ishni har kuni takrorlasangiz-chi? Masalan, zaxira nusxa olish, jurnallarni tekshirish yoki yuzlab fayllarni qayta nomlash. Mana shu yerda skript kerak bo‘ladi. Skript — buyruqlar yozilgan oddiy matn fayli. Siz uni bir marta yozasiz, kompyuter esa xohlagancha marta bajaradi.",
          visual: {
            kind: "analogy",
            icon: "chef",
            heading: "Oshpazlik retsepti",
            text: "Har safar eslab o‘tirmaysiz — qadamlar yozilgan, ular bo‘yicha ishlaysiz.",
          },
        },
        {
          say: "Mana oddiy skript. Birinchi qator panjara va undov belgisidan boshlanadi, uni shebang deyishadi. U skriptni qaysi dastur bajarishini aytadi, bizda bu bin papkasidagi bash. Panjara bilan boshlanadigan boshqa qatorlar izoh: kompyuter ularni o‘qimaydi, ular odamlar uchun.",
          visual: {
            kind: "code",
            title: "daily.sh",
            lines: [
              "#!/bin/bash",
              "# Kunlik jurnal tekshiruvi",
              'SERVER="web-1"',
              "for FILE in *.log; do",
              '  echo "Tekshirilmoqda: $FILE"',
              "done",
              'echo "$SERVER: tayyor"',
            ],
            focus: [0, 1],
          },
        },
        {
          say: "Keyingi qatorda SERVER degan o‘zgaruvchi yaratilgan. Undan keyin for sikli har bir log fayl uchun xabar chiqaradi. Oxirgi qator esa ish tugaganini aytadi. Hozir bu qatorlarning har birini alohida, qadamma-qadam o‘rganamiz.",
          visual: {
            kind: "code",
            title: "daily.sh",
            lines: [
              "#!/bin/bash",
              "# Kunlik jurnal tekshiruvi",
              'SERVER="web-1"',
              "for FILE in *.log; do",
              '  echo "Tekshirilmoqda: $FILE"',
              "done",
              'echo "$SERVER: tayyor"',
            ],
            focus: [2, 3, 4, 5, 6],
          },
        },
      ],
    },
    {
      title: "O‘zgaruvchilar",
      scenes: [
        {
          say: "O‘zgaruvchi — nomli quti. Unga qiymat solasiz va keyin nomi orqali ishlatasiz. Javondagi yorliqli qutilarni tasavvur qiling: NAME degan qutiga Ali solindi. Kerak bo‘lganda yorliqqa qarab olasiz.",
          visual: {
            kind: "boxes",
            vars: [
              ["NAME", "Ali"],
              ["CITY", "Nukus"],
            ],
          },
        },
        {
          say: "Qiymat berish shunday yoziladi: NAME, tenglik belgisi, Ali. Diqqat qiling: tenglik belgisining atrofida bo‘sh joy bo‘lmaydi. Agar bo‘sh joy qo‘ysangiz, Bash NAME so‘zini buyruq deb o‘ylaydi va xato beradi. Qiymatni ishlatish uchun nom oldiga dollar belgisi qo‘yiladi.",
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
        },
      ],
    },
    {
      title: "Qo‘shtirnoqlar",
      scenes: [
        {
          say: "Bashda qo‘shtirnoqning turi muhim. Ikkitalik qo‘shtirnoq ichida dollar belgisi ishlaydi: o‘zgaruvchi o‘rniga uning qiymati qo‘yiladi. Bittalik qo‘shtirnoq ichida esa hech narsa almashtirilmaydi, matn xuddi yozilganidek chiqadi.",
          visual: {
            kind: "terminal",
            lines: [
              { cmd: "NAME=Ali" },
              { cmd: 'echo "Salom, $NAME"' },
              { out: "Salom, Ali" },
              { cmd: "echo 'Salom, $NAME'" },
              { out: "Salom, $NAME" },
            ],
          },
        },
        {
          say: "Buni xat o‘qishga o‘xshatish mumkin. Ikkitalik qo‘shtirnoq — xatni o‘qib, ism o‘rniga haqiqiy ismni qo‘yish. Bittalik qo‘shtirnoq — xatni hech narsa o‘zgartirmasdan, so‘zma-so‘z o‘qish. Fayl nomida bo‘sh joy bo‘lsa ham, o‘zgaruvchini ikkitalik qo‘shtirnoqqa olish yaxshi odat.",
          visual: {
            kind: "points",
            heading: "Qaysi qo‘shtirnoq?",
            items: [
              '"…" — $NAME qiymatga almashadi',
              "'…' — hammasi so‘zma-so‘z",
              'Odat: o‘zgaruvchini "$NAME" ko‘rinishida yozing',
            ],
          },
        },
      ],
    },
    {
      title: "Hisob-kitob",
      scenes: [
        {
          say: "Bash uchun hamma narsa matn. Agar yetti plyus besh deb yozsangiz, Bash shunchaki shu matnni chiqaradi. Raqamlarni hisoblash uchun ularni dollar belgisi va ikki juft qavs ichiga olish kerak. Shunda Bash kalkulyatorga aylanadi.",
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
        },
        {
          say: "Qo‘shish, ayirish, ko‘paytirish, bo‘lish va qoldiq amallari bor. Bo‘lish butun son beradi: yettini ikkiga bo‘lsangiz, uch chiqadi. Hisoblagichni bittaga oshirish uchun esa i teng dollar, qavs ichida i plyus bir, deb yoziladi. Bu qator sikllarda juda ko‘p uchraydi.",
          visual: {
            kind: "points",
            heading: "Amallar",
            items: [
              "+  −  *  /  %",
              "$((7 / 2)) → 3",
              "i=$((i + 1)) — hisoblagich",
            ],
          },
        },
      ],
    },
    {
      title: "for sikli",
      scenes: [
        {
          say: "Endi sikllar. for sikli ro‘yxatdagi har bir element uchun bir xil qatorlarni takrorlaydi. Har bir aylanishda o‘zgaruvchi ro‘yxatdagi navbatdagi qiymatni oladi. Do va done so‘zlari orasidagi qatorlar sikl tanasi deb ataladi.",
          visual: {
            kind: "loop",
            items: ["app.log", "auth.log", "db.log"],
            variable: "FILE",
          },
        },
        {
          say: "Buni davomatga o‘xshatish mumkin. O‘qituvchi ro‘yxatdagi har bir ism uchun “Shu yerdami?” deb so‘raydi. Ro‘yxat o‘rniga yulduzcha nuqta log deb yozsangiz, papkadagi barcha log fayllar olinadi. Figurali qavs ichida bir, ikki nuqta, besh deb yozsangiz, birdan beshgacha sonlar olinadi.",
          visual: {
            kind: "terminal",
            lines: [
              { cmd: "for i in {1..5}; do echo $i; done" },
              { out: "1\n2\n3\n4\n5" },
              { cmd: "for f in *.log; do echo $f; done" },
              { out: "app.log\nauth.log\ndb.log" },
            ],
          },
        },
      ],
    },
    {
      title: "while va if",
      scenes: [
        {
          say: "while sikli shart to‘g‘ri bo‘lib turguncha aylanadi. if esa shartga qarab bitta yo‘lni tanlaydi. Shartlar kvadrat qavs ichida yoziladi va qavslar ichida bo‘sh joy qoldirish shart. Sonlarni solishtirish uchun maxsus so‘zlar bor: eq — teng, ne — teng emas, lt — kichik, gt — katta.",
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
            focus: [1],
          },
        },
        {
          say: "Bu skript beshdan birgacha sanaydi va oxirida Start deb yozadi. Muhim qator — hisoblagichni bittaga kamaytiradigan qator. Agar uni yozishni unutsangiz, shart doim to‘g‘ri bo‘lib qoladi va sikl hech qachon tugamaydi. Haqiqiy kompyuterda bunday siklni Ctrl va C tugmalari bilan to‘xtatasiz.",
          visual: { kind: "countdown" },
        },
        {
          say: "while — “choynak qaynamaguncha kut” degani. if esa — “yomg‘ir yog‘sa, soyabon ol”. Ikkalasi birga ishlatilganda skript o‘zi qaror qabul qila boshlaydi.",
          visual: {
            kind: "analogy",
            icon: "kettle",
            heading: "while va if",
            text: "while — choynak qaynamaguncha kut. if — yomg‘ir yog‘sa, soyabon ol.",
          },
        },
      ],
    },
    {
      title: "Xavfsizlik skripti",
      scenes: [
        {
          say: "Endi bilganlarimizni birlashtiramiz. Vazifa: kirish jurnalidan qaysi foydalanuvchilarga muvaffaqiyatsiz kirish urinishlari bo‘lganini topish. Skript faylni argument sifatida oladi. Dollar bir — birinchi argument, dollar ikki — ikkinchisi. Shunday qilib, bitta skript turli fayllar bilan ishlay oladi.",
          visual: {
            kind: "code",
            title: "check.sh",
            lines: [
              "#!/bin/bash",
              'LOG="$1"',
              "for USER in root admin ali; do",
              '  if grep -q "Failed password for $USER" "$LOG"; then',
              '    echo "Ogohlantirish: $USER"',
              "  fi",
              "done",
            ],
            focus: [1, 2, 3, 4],
          },
        },
        {
          say: "Skript har bir foydalanuvchi uchun grep buyrug‘i bilan jurnaldan “Failed password” yozuvini qidiradi. Topilsa, ogohlantirish chiqaradi. Qorovul har kecha jurnalni varaqlab, kim eshikni noto‘g‘ri kalit bilan ochmoqchi bo‘lganini yozib chiqadi. Skript esa buni bir soniyada qiladi.",
          visual: { kind: "logscan" },
        },
        {
          say: "Va eng muhim qoida. Skript siz bilan bir xil huquqlar bilan ishlaydi. U fayllaringizni o‘chirishi yoki ma’lumotlaringizni boshqa joyga yuborishi mumkin. Shuning uchun internetdan olingan skriptni ishga tushirishdan oldin, albatta, uni o‘qib chiqing.",
          visual: {
            kind: "analogy",
            icon: "warning",
            heading: "Avval o‘qing, keyin ishga tushiring",
            text: "Skript sizning huquqlaringiz bilan ishlaydi.",
          },
        },
      ],
    },
    {
      title: "Xulosa",
      scenes: [
        {
          say: "Xulosa qilamiz. Skript takroriy ishlarni avtomatlashtiradi. O‘zgaruvchi — nomli quti, tenglik atrofida bo‘sh joy yo‘q. Ikkitalik qo‘shtirnoqda dollar ishlaydi, bittalikda yo‘q. Hisob uchun dollar va ikki qavs. for ro‘yxat bo‘yicha aylanadi, while shart bo‘yicha, if esa yo‘l tanlaydi.",
          visual: {
            kind: "points",
            heading: "Esda tuting",
            items: [
              "NAME=Ali — bo‘sh joysiz",
              "\"$NAME\" va '$NAME' farqi",
              "$(( )) — hisob-kitob",
              "for · while · if",
              "$1 — birinchi argument",
            ],
          },
        },
        {
          say: "Endi laboratoriyaga o‘ting. U yerda brauzer ichidagi xavfsiz terminalda har bir buyruqni o‘zingiz yozib ko‘rasiz, siklni qadamma-qadam kuzatasiz va xavfsizlik skriptini ishga tushirasiz. Oxirida nazorat testidan o‘ting va sertifikat oling. Omad!",
          visual: {
            kind: "title",
            title: "Endi amaliyot!",
            subtitle: "Terminal · nazorat testi · sertifikat",
            icon: "check",
          },
        },
      ],
    },
  ],
};
