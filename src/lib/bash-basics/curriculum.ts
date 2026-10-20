// Academy · Bash basics: variables, loops and why scripts exist. Animated
// lessons on the shared widgets (../anim-lab/types) plus three of the lab's
// own, all running the safe interpreter in ./interp: a terminal, a script
// editor and a loop shown one turn at a time.
import {
  restoreLessons,
  type CommonWidget,
  type Lesson,
  type Text,
} from "../anim-lab/types";
import type { Files, State } from "./interp";

/** One command typed in the terminal and what it printed. */
export type Entry = { command: string; output: string[]; error: string | null };
export type Log = { state: State; entries: Entry[] };

export type Goal = { label: Text; check: (log: Log) => boolean };

export type Widget =
  | CommonWidget
  | { type: "shell"; files: Files; goals: Goal[] }
  | {
      type: "script";
      name: string;
      source: string;
      args: string;
      files: Files;
      goals: Goal[];
    }
  | { type: "loop"; name: string; items: string[]; line: string };

const t = (uz: string, en: string): Text => ({ uz, en });

const SCRIPTS = t("Shell va skriptlar", "Shell and scripts");
const LOOPS = t("Sikllar va shartlar", "Loops and decisions");
const REAL = t("Haqiqiy skriptlar", "Real scripts");

const LOGS: Files = {
  "app.log": "start ok\nrequest /home 200\nrequest /admin 403\n",
  "auth.log":
    "ok ali\nFAILED root\nFAILED root\nok vali\nFAILED admin\nFAILED root\n",
  "db.log": "backup ok\nquery slow 2.3s\n",
};

const printed = (log: Log, text: string) =>
  log.entries.some((e) => e.output.some((line) => line.includes(text)));

export const LESSONS: Lesson<Widget>[] = [
  {
    id: 1,
    group: SCRIPTS,
    title: t("Skript nima va nega kerak", "What a script is and why"),
    minutes: 5,
    intro: t(
      "Bash — buyruqlarni tushunadigan dastur (shell). Skript — shu buyruqlar yozilgan fayl: siz uni bir marta yozasiz, kompyuter esa xohlagancha marta bajaradi.",
      "Bash is a program that understands commands (a shell). A script is a file of those commands: you write it once and the computer runs it as often as you like.",
    ),
    analogy: t(
      "Oshpazlik retseptiga o‘xshaydi: har safar nima qilishni eslab o‘tirmaysiz — qadamlar yozilgan, ular bo‘yicha ishlaysiz.",
      "Like a recipe: you do not have to remember every step each time — they are written down and you follow them.",
    ),
    theory: [
      t(
        "Skriptlar takrorlanadigan ishlarni avtomatlashtiradi: zaxira nusxa olish, jurnallarni tekshirish, yuzlab fayllarni qayta nomlash.",
        "Scripts automate repeated work: taking backups, checking logs, renaming hundreds of files.",
      ),
      t(
        "Xavfsizlik mutaxassislari ham skript yozadi: masalan, har kuni kirish jurnalidan muvaffaqiyatsiz urinishlarni sanash uchun.",
        "Security people write scripts too: for example, to count failed sign-ins in the log every day.",
      ),
    ],
    task: t(
      "Skriptning har bir belgilangan qismini bosib, nima ekanini o‘qing.",
      "Click every highlighted part of the script and read what it is.",
    ),
    hint: t(
      "Birinchi qatordan boshlang: #!/bin/bash.",
      "Start with the first line: #!/bin/bash.",
    ),
    widget: {
      type: "anatomy",
      lines: [
        [{ text: "#!/bin/bash", id: "shebang" }],
        [{ text: "# Kunlik jurnal tekshiruvi", id: "comment" }],
        [{ text: 'SERVER="web-1"', id: "var" }],
        [{ text: "for FILE in *.log; do", id: "for" }],
        [{ text: "  " }, { text: 'echo "Tekshirilmoqda: $FILE"', id: "echo" }],
        [{ text: "done", id: "done" }],
        [{ text: 'echo "$SERVER: tayyor"', id: "last" }],
      ],
      parts: [
        {
          id: "shebang",
          title: t("Shebang", "Shebang"),
          body: t(
            "Birinchi qator: bu faylni qaysi dastur bajarishini aytadi — bu yerda Bash.",
            "The first line: it says which program runs the file — Bash here.",
          ),
        },
        {
          id: "comment",
          title: t("Izoh", "Comment"),
          body: t(
            "# bilan boshlangan qator bajarilmaydi. U odamlar uchun: skript nima qilishini tushuntiradi.",
            "A line starting with # is not run. It is for people: it explains what the script does.",
          ),
        },
        {
          id: "var",
          title: t("O‘zgaruvchi", "Variable"),
          body: t(
            "SERVER nomli “quti”ga web-1 qiymati solindi. = atrofida bo‘sh joy bo‘lmaydi!",
            "The value web-1 goes into a “box” named SERVER. No spaces around the = sign!",
          ),
        },
        {
          id: "for",
          title: t("for sikli", "for loop"),
          body: t(
            "*.log ga mos har bir fayl uchun quyidagi qatorlarni takrorla; har safar fayl nomi FILE ga yoziladi.",
            "Repeat the lines below for every file matching *.log; each time the file name goes into FILE.",
          ),
        },
        {
          id: "echo",
          title: t("echo va $", "echo and $"),
          body: t(
            "echo matnni chiqaradi. $FILE — o‘zgaruvchining joriy qiymati.",
            "echo prints text. $FILE is the variable’s current value.",
          ),
        },
        {
          id: "done",
          title: t("done", "done"),
          body: t("Sikl tanasining oxiri.", "The end of the loop body."),
        },
        {
          id: "last",
          title: t("Sikldan keyin", "After the loop"),
          body: t(
            "Sikl tugagach, bu qator bir marta bajariladi.",
            "Once the loop ends, this line runs once.",
          ),
        },
      ],
    },
  },
  {
    id: 2,
    group: SCRIPTS,
    title: t("O‘zgaruvchilar", "Variables"),
    minutes: 6,
    intro: t(
      "O‘zgaruvchi — nomli quti. Unga qiymat solasiz va keyin nom orqali ishlatasiz.",
      "A variable is a named box. You put a value in and use it later by name.",
    ),
    analogy: t(
      "Javondagi yorliqli qutilar: “ISM” qutisiga “Ali” solindi. Kerak bo‘lsa, yorliqqa qarab olasiz.",
      "Labelled boxes on a shelf: “NAME” holds “Ali”. When you need it, you look for the label.",
    ),
    theory: [
      t(
        "Qiymat berish: NAME=Ali — = atrofida bo‘sh joy yo‘q. Bo‘sh joy qo‘ysangiz, Bash NAME ni buyruq deb o‘ylaydi.",
        "Assigning: NAME=Ali — no spaces around =. With spaces, Bash thinks NAME is a command.",
      ),
      t(
        'Ishlatish: $NAME yoki ${NAME}. echo "Salom, $NAME" → Salom, Ali.',
        'Using: $NAME or ${NAME}. echo "Hi, $NAME" → Hi, Ali.',
      ),
    ],
    task: t(
      "Terminalda NAME o‘zgaruvchisini yarating va u bilan salomlashuvchi xabar chiqaring.",
      "In the terminal, create a NAME variable and print a greeting that uses it.",
    ),
    hint: t(
      'Avval: NAME=Ali  so‘ng: echo "Salom, $NAME"',
      'First: NAME=Ali  then: echo "Hi, $NAME"',
    ),
    widget: {
      type: "shell",
      files: LOGS,
      goals: [
        {
          label: t("NAME o‘zgaruvchisi yaratildi", "NAME variable created"),
          check: (log) => (log.state.vars.NAME ?? "") !== "",
        },
        {
          label: t(
            "echo bilan NAME qiymati chiqarildi",
            "NAME’s value printed with echo",
          ),
          check: (log) =>
            (log.state.vars.NAME ?? "") !== "" &&
            log.entries.some(
              (e) =>
                /\becho\b/.test(e.command) &&
                e.command.includes("$") &&
                e.output.some((l) => l.includes(log.state.vars.NAME)),
            ),
        },
      ],
    },
  },
  {
    id: 3,
    group: SCRIPTS,
    title: t("Qo‘shtirnoqlar", "Quotes"),
    minutes: 5,
    intro: t(
      "Bashda qo‘shtirnoq turi muhim: ikkitalik ichida $ ishlaydi, bittalik ichida esa hammasi so‘zma-so‘z chiqadi.",
      "In Bash the kind of quote matters: inside double quotes $ works, inside single quotes everything is literal.",
    ),
    analogy: t(
      "\"…\" — xatni o‘qib, ism o‘rniga haqiqiy ismni qo‘yish. '…' — xatni o‘zgartirmasdan, xuddi yozilganidek o‘qish.",
      "\"…\" is reading a letter and filling in the real name. '…' is reading it exactly as written.",
    ),
    theory: [
      t(
        "NAME=Ali bo‘lsa: echo \"$NAME\" → Ali, echo '$NAME' → $NAME.",
        "With NAME=Ali: echo \"$NAME\" → Ali, echo '$NAME' → $NAME.",
      ),
      t(
        'Qo‘shtirnoqsiz o‘zgaruvchi bo‘sh joylar bo‘yicha bo‘linadi. Shuning uchun fayl nomlari kabi qiymatlarni doim "$FILE" ko‘rinishida yozing.',
        'Unquoted variables are split on spaces. So always write values such as file names as "$FILE".',
      ),
    ],
    task: t(
      "Har bir buyruq nima chiqarishini toping.",
      "Work out what each command prints.",
    ),
    hint: t(
      "Bittalik qo‘shtirnoq — hech narsa almashtirilmaydi.",
      "Single quotes — nothing is replaced.",
    ),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            'NAME=Ali. echo "Salom, $NAME" nima chiqaradi?',
            'NAME=Ali. What does echo "Hi, $NAME" print?',
          ),
          options: [
            t("Salom, Ali", "Hi, Ali"),
            t("Salom, $NAME", "Hi, $NAME"),
            t("Xato", "An error"),
          ],
          answer: 0,
          explain: t(
            "Ikkitalik qo‘shtirnoq ichida $NAME qiymatga almashadi.",
            "Inside double quotes $NAME is replaced by its value.",
          ),
        },
        {
          ask: t(
            "NAME=Ali. echo 'Salom, $NAME' nima chiqaradi?",
            "NAME=Ali. What does echo 'Hi, $NAME' print?",
          ),
          options: [
            t("Salom, Ali", "Hi, Ali"),
            t("Salom, $NAME", "Hi, $NAME"),
            t("Salom,", "Hi,"),
          ],
          answer: 1,
          explain: t(
            "Bittalik qo‘shtirnoq hamma narsani so‘zma-so‘z qoldiradi.",
            "Single quotes keep everything literal.",
          ),
        },
        {
          ask: t(
            "NAME = Ali (bo‘sh joylar bilan) nima bo‘ladi?",
            "What happens with NAME = Ali (with spaces)?",
          ),
          options: [
            t("NAME ga Ali yoziladi", "NAME is set to Ali"),
            t(
              "Bash “NAME” degan buyruqni izlaydi va xato beradi",
              "Bash looks for a command called “NAME” and fails",
            ),
            t("Hech narsa", "Nothing"),
          ],
          answer: 1,
          explain: t(
            "= atrofida bo‘sh joy bo‘lmasligi kerak.",
            "There must be no spaces around =.",
          ),
        },
        {
          ask: t(
            "Qaysi biri o‘zgaruvchi qiymatini to‘g‘ri chiqaradi?",
            "Which one prints the variable’s value correctly?",
          ),
          options: [
            t("echo NAME", "echo NAME"),
            t("echo $NAME", "echo $NAME"),
            t("echo (NAME)", "echo (NAME)"),
          ],
          answer: 1,
          explain: t(
            "Qiymatni olish uchun $ kerak.",
            "You need $ to read the value.",
          ),
        },
      ],
    },
  },
  {
    id: 4,
    group: SCRIPTS,
    title: t("Hisob-kitob: $(( ))", "Arithmetic: $(( ))"),
    minutes: 6,
    intro: t(
      "Bash uchun hamma narsa matn. Raqamlarni qo‘shish uchun ularni $(( … )) ichiga olish kerak.",
      "To Bash everything is text. To add numbers you wrap them in $(( … )).",
    ),
    analogy: t(
      "$(( )) — kalkulyator tugmasi: ichiga misolni yozasiz, Bash natijani qo‘yadi.",
      "$(( )) is a calculator button: you type the sum inside and Bash fills in the result.",
    ),
    theory: [
      t(
        "A=7; B=5; echo $((A + B)) → 12. Ichkarida $ shart emas: $((A * B)) ham ishlaydi.",
        "A=7; B=5; echo $((A + B)) → 12. Inside, $ is optional: $((A * B)) works too.",
      ),
      t(
        "Amallar: + - * / % (qoldiq). Bo‘lish butun son beradi: $((7 / 2)) → 3.",
        "Operators: + - * / % (remainder). Division gives a whole number: $((7 / 2)) → 3.",
      ),
      t(
        "Hisoblagich odatda shunday oshiriladi: i=$((i + 1)).",
        "A counter is usually increased like this: i=$((i + 1)).",
      ),
    ],
    task: t(
      "A=7 va B=5 o‘zgaruvchilarini yarating, so‘ng ularning yig‘indisi (12) va ko‘paytmasini (35) chiqaring.",
      "Create A=7 and B=5, then print their sum (12) and product (35).",
    ),
    hint: t(
      "A=7; B=5  keyin  echo $((A + B))  va  echo $((A * B))",
      "A=7; B=5  then  echo $((A + B))  and  echo $((A * B))",
    ),
    widget: {
      type: "shell",
      files: LOGS,
      goals: [
        {
          label: t("A=7 va B=5", "A=7 and B=5"),
          check: (log) => log.state.vars.A === "7" && log.state.vars.B === "5",
        },
        {
          label: t("$(( )) bilan 12 chiqdi", "12 printed with $(( ))"),
          check: (log) =>
            log.entries.some(
              (e) => e.command.includes("$((") && e.output.includes("12"),
            ),
        },
        {
          label: t("$(( )) bilan 35 chiqdi", "35 printed with $(( ))"),
          check: (log) =>
            log.entries.some(
              (e) => e.command.includes("$((") && e.output.includes("35"),
            ),
        },
      ],
    },
  },
  {
    id: 5,
    group: LOOPS,
    title: t("for sikli qanday ishlaydi", "How a for loop works"),
    minutes: 5,
    intro: t(
      "for sikli ro‘yxatdagi har bir element uchun bir xil qatorlarni takrorlaydi. Har aylanishda o‘zgaruvchi navbatdagi qiymatni oladi.",
      "A for loop repeats the same lines for every item in a list. On each turn the variable takes the next value.",
    ),
    analogy: t(
      "O‘qituvchi davomat qiladi: ro‘yxatdagi har bir ism uchun “Shu yerdami?” deb so‘raydi.",
      "A teacher taking attendance: for every name on the list, “Are you here?”.",
    ),
    theory: [
      t(
        "Ko‘rinishi: for FILE in app.log auth.log db.log; do … done. do va done orasidagi qatorlar — sikl tanasi.",
        "Shape: for FILE in app.log auth.log db.log; do … done. The lines between do and done are the loop body.",
      ),
      t(
        "Ro‘yxat o‘rniga *.log (barcha .log fayllar) yoki {1..5} (1 dan 5 gacha sonlar) yozish mumkin.",
        "Instead of a list you can write *.log (every .log file) or {1..5} (the numbers 1 to 5).",
      ),
    ],
    task: t(
      "Siklni qadamma-qadam oxirigacha kuzating.",
      "Step through the loop to the end.",
    ),
    hint: t(
      "“Ijro” yoki “Keyingi qadam”ni bosing.",
      "Press Play or Next step.",
    ),
    widget: {
      type: "loop",
      name: "FILE",
      items: ["app.log", "auth.log", "db.log"],
      line: 'echo "Tekshirilmoqda: $FILE"',
    },
  },
  {
    id: 6,
    group: LOOPS,
    title: t("O‘zingiz sikl yozing", "Write your own loop"),
    minutes: 6,
    intro: t(
      "Endi siklni o‘zingiz yozasiz. Terminalda u bitta qatorda, ; bilan ajratilgan holda yoziladi.",
      "Now you write a loop. In the terminal it fits on one line, separated by ;.",
    ),
    analogy: t(
      "Bitta buyruqni beshta marta yozish o‘rniga — “beshta marta qil” deyish.",
      "Instead of typing a command five times — saying “do it five times”.",
    ),
    theory: [
      t(
        "for i in {1..5}; do echo $i; done — 1 dan 5 gacha chiqaradi.",
        "for i in {1..5}; do echo $i; done — prints 1 to 5.",
      ),
      t(
        "Fayllar bo‘yicha: for f in *.log; do echo $f; done",
        "Over files: for f in *.log; do echo $f; done",
      ),
    ],
    task: t(
      "1 dan 5 gacha sonlarni sikl bilan chiqaring, so‘ng barcha .log fayllar nomini sikl bilan chiqaring.",
      "Print the numbers 1 to 5 with a loop, then print the name of every .log file with a loop.",
    ),
    hint: t(
      "for i in {1..5}; do echo $i; done   va   for f in *.log; do echo $f; done",
      "for i in {1..5}; do echo $i; done   and   for f in *.log; do echo $f; done",
    ),
    widget: {
      type: "shell",
      files: LOGS,
      goals: [
        {
          label: t(
            "Sikl 1, 2, 3, 4, 5 ni chiqardi",
            "A loop printed 1, 2, 3, 4, 5",
          ),
          check: (log) =>
            log.entries.some(
              (e) =>
                /^\s*for\b/.test(e.command) &&
                !e.error &&
                e.output.join(",") === "1,2,3,4,5",
            ),
        },
        {
          label: t(
            "Sikl barcha .log fayllarni chiqardi",
            "A loop printed every .log file",
          ),
          check: (log) =>
            log.entries.some(
              (e) =>
                /^\s*for\b/.test(e.command) &&
                !e.error &&
                ["app.log", "auth.log", "db.log"].every((f) =>
                  e.output.some((l) => l.includes(f)),
                ),
            ),
        },
      ],
    },
  },
  {
    id: 7,
    group: LOOPS,
    title: t("while va if", "while and if"),
    minutes: 7,
    intro: t(
      "while sikli shart to‘g‘ri bo‘lguncha aylanadi. if esa shartga qarab bitta yo‘lni tanlaydi. Shartlar [ ] ichida yoziladi.",
      "A while loop goes round as long as a condition holds. if picks one path based on a condition. Conditions go inside [ ].",
    ),
    analogy: t(
      "while — “choynak qaynamaguncha kut”. if — “yomg‘ir yog‘sa, soyabon ol”.",
      "while is “wait until the kettle boils”. if is “if it rains, take an umbrella”.",
    ),
    theory: [
      t(
        "Sonlarni solishtirish: -eq (teng), -ne (teng emas), -lt (kichik), -le, -gt (katta), -ge. Masalan: [ $i -gt 0 ]. Qavslar ichida bo‘sh joylar shart!",
        "Comparing numbers: -eq (equal), -ne (not equal), -lt (less), -le, -gt (greater), -ge. For example: [ $i -gt 0 ]. Spaces inside the brackets are required!",
      ),
      t(
        "Diqqat: while ichida hisoblagichni o‘zgartirmasangiz, sikl hech qachon tugamaydi. Bu laboratoriya bunday siklni o‘zi to‘xtatadi — haqiqiy kompyuterda esa Ctrl+C kerak bo‘ladi.",
        "Careful: if the counter never changes inside while, the loop never ends. This lab stops such a loop for you — on a real computer you would press Ctrl+C.",
      ),
    ],
    task: t(
      "Skriptni ishga tushiring — u cheksiz aylanadi. Hisoblagichni kamaytiradigan qatorni qo‘shib, 5, 4, 3, 2, 1, Start! chiqishiga erishing.",
      "Run the script — it loops forever. Add the line that decreases the counter so it prints 5, 4, 3, 2, 1, Start!",
    ),
    hint: t(
      "Izoh o‘rniga yozing: i=$((i - 1))",
      "In place of the comment write: i=$((i - 1))",
    ),
    widget: {
      type: "script",
      name: "countdown.sh",
      args: "",
      files: {},
      source:
        '#!/bin/bash\ni=5\nwhile [ $i -gt 0 ]; do\n  echo $i\n  # shu yerda i ni bittaga kamaytiring\ndone\necho "Start!"\n',
      goals: [
        {
          label: t(
            "Chiqish: 5, 4, 3, 2, 1, Start!",
            "Output: 5, 4, 3, 2, 1, Start!",
          ),
          check: (log) =>
            log.entries.some(
              (e) => !e.error && e.output.join(",") === "5,4,3,2,1,Start!",
            ),
        },
      ],
    },
  },
  {
    id: 8,
    group: REAL,
    title: t("Xavfsizlik skripti", "A security script"),
    minutes: 8,
    intro: t(
      "Haqiqiy vazifa: kirish jurnalidan qaysi foydalanuvchilarga muvaffaqiyatsiz kirish urinishlari bo‘lganini topish. Skript faylni argument sifatida oladi: bash check.sh auth.log.",
      "A real task: find which users had failed sign-in attempts in the login log. The script takes the file as an argument: bash check.sh auth.log.",
    ),
    analogy: t(
      "Qorovul har kecha jurnalni varaqlab, kim eshikni noto‘g‘ri kalit bilan ochmoqchi bo‘lganini yozib chiqadi — skript buni bir soniyada qiladi.",
      "A night guard flips through the logbook to note who tried the door with the wrong key — a script does it in a second.",
    ),
    theory: [
      t(
        "Argumentlar: $1 — birinchi, $2 — ikkinchi, $# — nechta berilgani. Shunday qilib bitta skript turli fayllar bilan ishlaydi.",
        "Arguments: $1 is the first, $2 the second, $# how many were given. One script can then work on different files.",
      ),
      t(
        "grep -q MATN fayl — matn topilsa “muvaffaqiyat” qaytaradi va hech narsa chiqarmaydi. Uni if ichida ishlatish qulay.",
        "grep -q TEXT file succeeds when the text is found and prints nothing. It is handy inside if.",
      ),
    ],
    task: t(
      "Skriptni auth.log argumenti bilan ishga tushiring va tekshiriladigan foydalanuvchilar ro‘yxatiga admin ni qo‘shing: root va admin uchun ogohlantirish chiqishi kerak.",
      "Run the script with auth.log as the argument and add admin to the users it checks: warnings must appear for root and admin.",
    ),
    hint: t(
      "Argumentlar maydoniga auth.log yozing; for qatorini shunday qiling: for USER in root admin ali; do",
      "Type auth.log into the arguments box; make the for line: for USER in root admin ali; do",
    ),
    widget: {
      type: "script",
      name: "check.sh",
      args: "",
      files: LOGS,
      source:
        '#!/bin/bash\n# Foydalanish: bash check.sh <jurnal-fayl>\nLOG=$1\nif [ -z "$LOG" ]; then\n  echo "Jurnal fayli berilmadi"\n  exit 1\nfi\necho "Tekshirilmoqda: $LOG"\nfor USER in root ali; do\n  if grep -q "FAILED $USER" $LOG; then\n    echo "Ogohlantirish: $USER"\n  fi\ndone\n',
      goals: [
        {
          label: t(
            "Skript auth.log argumenti bilan ishga tushdi",
            "The script ran with auth.log as its argument",
          ),
          check: (log) =>
            log.entries.some(
              (e) =>
                !e.error &&
                e.command.endsWith(" auth.log") &&
                e.output.length > 0,
            ),
        },
        {
          label: t(
            "root va admin uchun ogohlantirish",
            "Warnings for root and admin",
          ),
          check: (log) =>
            printed(log, "Ogohlantirish: root") &&
            printed(log, "Ogohlantirish: admin"),
        },
        {
          label: t(
            "ali uchun ogohlantirish yo‘q (u xato qilmagan)",
            "No warning for ali (no failed attempts)",
          ),
          check: (log) =>
            printed(log, "Ogohlantirish: admin") &&
            !log.entries.some(
              (e) =>
                e.output.includes("Ogohlantirish: admin") &&
                e.output.includes("Ogohlantirish: ali"),
            ),
        },
      ],
    },
  },
  {
    id: 9,
    group: REAL,
    title: t("Yakuniy takrorlash", "Final review"),
    minutes: 6,
    intro: t(
      "Bash bo‘yicha bilimlaringizni tekshiring.",
      "Check what you know about Bash.",
    ),
    analogy: t(
      "Skript yozish — kompyuterga aniq yo‘riqnoma berish: qancha aniq bo‘lsa, shuncha yaxshi ishlaydi.",
      "Writing a script is giving the computer exact instructions: the clearer, the better.",
    ),
    theory: [
      t(
        "Esda tuting: skript siz bilan bir xil huquqlar bilan ishlaydi. Internetdan olingan skriptni ishga tushirishdan oldin uni o‘qing!",
        "Remember: a script runs with your own permissions. Read any script from the internet before you run it!",
      ),
    ],
    task: t(
      "Barcha savollarga to‘g‘ri javob bering.",
      "Answer every question correctly.",
    ),
    hint: t(
      "Shubhalansangiz, terminal darslariga qaytib sinab ko‘ring.",
      "Unsure? Go back to a terminal lesson and try it.",
    ),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Skriptning birinchi qatori nima uchun?",
            "What is a script’s first line for?",
          ),
          options: [
            t("Skript nomi", "The script’s name"),
            t(
              "Uni qaysi dastur bajarishini aytadi",
              "It says which program runs it",
            ),
            t("Izoh", "A comment"),
          ],
          answer: 1,
          explain: t("#!/bin/bash — shebang.", "#!/bin/bash is the shebang."),
        },
        {
          ask: t(
            "i=3 bo‘lsa, i=$((i + 1)) dan keyin i nechaga teng?",
            "With i=3, what is i after i=$((i + 1))?",
          ),
          options: [t("3", "3"), t("4", "4"), t("i+1", "i+1")],
          answer: 1,
          explain: t(
            "$(( )) hisoblaydi: 3 + 1 = 4.",
            "$(( )) does the sum: 3 + 1 = 4.",
          ),
        },
        {
          ask: t(
            "for i in {1..3}; do echo $i; done nima chiqaradi?",
            "What does for i in {1..3}; do echo $i; done print?",
          ),
          options: [
            t("{1..3}", "{1..3}"),
            t(
              "1 2 3 (har biri alohida qatorda)",
              "1 2 3 (each on its own line)",
            ),
            t("3", "3"),
          ],
          answer: 1,
          explain: t(
            "{1..3} — 1, 2, 3 ro‘yxatiga aylanadi.",
            "{1..3} expands to the list 1, 2, 3.",
          ),
        },
        {
          ask: t(
            "bash check.sh auth.log da $1 nimaga teng?",
            "In bash check.sh auth.log, what is $1?",
          ),
          options: [
            t("check.sh", "check.sh"),
            t("auth.log", "auth.log"),
            t("bash", "bash"),
          ],
          answer: 1,
          explain: t("$1 — birinchi argument.", "$1 is the first argument."),
        },
        {
          ask: t(
            "while siklida hisoblagich o‘zgarmasa nima bo‘ladi?",
            "What happens if the counter never changes in a while loop?",
          ),
          options: [
            t("Sikl bir marta ishlaydi", "The loop runs once"),
            t("Sikl hech qachon tugamaydi", "The loop never ends"),
            t("Bash xatoni o‘zi tuzatadi", "Bash fixes it itself"),
          ],
          answer: 1,
          explain: t(
            "Shart doim to‘g‘ri qoladi.",
            "The condition stays true forever.",
          ),
        },
        {
          ask: t(
            "Internetdan “bu skriptni ishga tushiring” degan buyruq topdingiz. To‘g‘ri yo‘l?",
            "You find a “just run this script” command online. What is the right move?",
          ),
          options: [
            t(
              "Darhol root sifatida ishga tushiraman",
              "Run it as root right away",
            ),
            t(
              "Avval o‘qib, nima qilishini tushunaman",
              "Read it first and understand what it does",
            ),
            t("Do‘stimga yuboraman", "Send it to a friend"),
          ],
          answer: 1,
          explain: t(
            "Skript sizning huquqlaringiz bilan ishlaydi — zararli buyruq hamma narsani o‘chirishi mumkin.",
            "A script runs with your permissions — a harmful one could delete everything.",
          ),
        },
      ],
    },
  },
];

export const PROGRESS_KEY = "cybervalue:bash:progress:v1";

export const restoreProgress = (raw: unknown) => restoreLessons(raw, LESSONS);
