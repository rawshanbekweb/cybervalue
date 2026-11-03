// Academy Intermediate · Reverse engineering, module 1: How programs are
// built. The lessons use ./tools.ts: the files of each compile stage, and
// the sections of an ELF file.
import type { CommonWidget, Lesson, Text } from "../anim-lab/types";

export type Widget = CommonWidget | { type: "stages" } | { type: "sections" };

export const PROGRESS_KEY = "cybervalue:build:progress:v1";

const t = (uz: string, en: string): Text => ({ uz, en });

const COMPILING = t("Kompilyatsiya", "Compiling");
const FILES = t("Bajariladigan fayl", "The executable");

export const LESSONS: Lesson<Widget>[] = [
  {
    id: 1,
    group: COMPILING,
    title: t("Manbadan mashina kodigacha", "From source to machine code"),
    minutes: 5,
    intro: t(
      "Protsessor C yoki Go’ni tushunmaydi: u faqat baytlardagi buyruqlarni — mashina kodini — bajaradi. Kompilyatsiya odam o‘qiydigan manba kodini shu baytlarga aylantiradi. Reverse engineering — teskari yo‘l: manba kodi bo‘lmasa ham, tayyor fayldan dastur nima qilishini tushunish. Himoyachilar buni zararli dasturni tahlil qilish, zaiflikni tekshirish va yo‘qolgan hujjatni tiklash uchun ishlatadi.",
      "A processor doesn’t understand C or Go: it runs only instructions encoded as bytes — machine code. Compiling turns human-readable source into those bytes. Reverse engineering goes the other way: understanding what a program does from the finished file, without its source. Defenders use it to analyse malware, check for vulnerabilities and recover lost documentation.",
    ),
    analogy: t(
      "Retseptdan pishgan tort: tortga qarab, retseptni taxmin qilish.",
      "A cake from a recipe: reverse engineering is guessing the recipe from the cake.",
    ),
    theory: [
      t(
        "Python va JavaScript odatda interpretatsiya qilinadi: manba kodi ishga tushirishda o‘qiladi.",
        "Python and JavaScript are usually interpreted: the source is read as the program runs.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t(
      "Protsessor faqat baytlarni biladi.",
      "The processor knows only bytes.",
    ),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Protsessor to‘g‘ridan-to‘g‘ri nimani bajaradi?",
            "What does a processor run directly?",
          ),
          options: [
            t("Mashina kodini", "Machine code"),
            t("C manba kodini", "C source code"),
            t("HTML’ni", "HTML"),
          ],
          answer: 0,
          explain: t(
            "Qolgan hammasi avval mashina kodiga aylantiriladi.",
            "Everything else is turned into machine code first.",
          ),
        },
        {
          ask: t(
            "Himoyachi nega reverse engineering qiladi?",
            "Why would a defender reverse engineer a program?",
          ),
          options: [
            t(
              "Shubhali fayl nima qilishini tushunish uchun",
              "To understand what a suspicious file does",
            ),
            t("Dasturni tezlashtirish uchun", "To make the program faster"),
            t("Faylni kichraytirish uchun", "To make the file smaller"),
          ],
          answer: 0,
          explain: t(
            "Masalan, zararli dastur qaysi serverga ulanishini topish.",
            "Finding which server a piece of malware calls, for example.",
          ),
        },
      ],
    },
  },
  {
    id: 2,
    group: COMPILING,
    title: t("To‘rt bosqich", "The four stages"),
    minutes: 8,
    intro: t(
      "`gcc hello.c -o hello` bitta buyruq, lekin ichida to‘rt bosqich bor. Preprotsessor `#include` va makroslarni ochadi (`.i`). Kompilyator C’ni assembler matniga aylantiradi (`.s`). Assembler uni mashina kodli obyekt fayliga aylantiradi (`.o`) — lekin `printf` kabi tashqi funksiyalarning manzili hali yo‘q. Linker obyektlarni kutubxonalar bilan bog‘lab, ishga tushiriladigan faylni yaratadi. `gcc -save-temps` barcha oraliq fayllarni qoldiradi.",
      "`gcc hello.c -o hello` is one command with four stages inside. The preprocessor expands `#include` and macros (`.i`). The compiler turns C into assembly text (`.s`). The assembler turns that into an object file of machine code (`.o`) — but the addresses of outside functions such as `printf` are still missing. The linker joins the objects to the libraries and produces the runnable file. `gcc -save-temps` keeps every intermediate file.",
    ),
    analogy: t(
      "Kitob nashri: qo‘lyozma, tahrir, tarjima, chop etish va muqovalash.",
      "Publishing a book: manuscript, editing, typesetting, printing and binding.",
    ),
    theory: [
      t(
        "Har bir bosqich alohida ishlatilishi mumkin: `gcc -E`, `-S`, `-c`.",
        "Each stage can be run on its own: `gcc -E`, `-S`, `-c`.",
      ),
    ],
    task: t(
      "Har bir faylni qaysi bosqich yaratgan?",
      "Which stage produced each file?",
    ),
    hint: t(
      "Fayl kengaytmasi tartibni aytadi: .c → .i → .s → .o → dastur.",
      "The extensions give the order: .c → .i → .s → .o → program.",
    ),
    widget: { type: "stages" },
  },
  {
    id: 3,
    group: COMPILING,
    title: t("Fayl formatlari", "File formats"),
    minutes: 5,
    intro: t(
      "Har bir operatsion tizimning o‘z bajariladigan fayl formati bor: Linux — ELF, Windows — PE (`.exe`, `.dll`), macOS — Mach-O. Ichki tuzilishi o‘xshash: sarlavha (qaysi protsessor uchun, qayerdan boshlash), bo‘limlar (kod, ma’lumot) va boshqa kutubxonalarga havolalar. Fayl turini kengaytmasiga qarab emas, birinchi baytlariga qarab bilinadi: ELF `7F 45 4C 46` bilan, PE `4D 5A` (“MZ”) bilan boshlanadi.",
      "Each operating system has its own executable format: Linux uses ELF, Windows uses PE (`.exe`, `.dll`), macOS uses Mach-O. Inside they look alike: a header (which processor, where to start), sections (code, data) and references to other libraries. A file’s type is known from its first bytes, not its extension: ELF starts with `7F 45 4C 46`, PE with `4D 5A` (“MZ”).",
    ),
    analogy: t(
      "Uch xil vilka standarti: vazifasi bir xil, shakli har xil.",
      "Three plug standards: the same job, different shapes.",
    ),
    theory: [
      t(
        "`file hello` fayl formati va protsessorni aytadi.",
        "`file hello` names the format and the processor.",
      ),
    ],
    task: t(
      "Har bir faylni operatsion tizimga moslang.",
      "Match each file to its operating system.",
    ),
    hint: t(
      "Birinchi baytlar va kengaytmaga qarang.",
      "Look at the first bytes and the extension.",
    ),
    widget: {
      type: "sort",
      buckets: [
        { id: "linux", label: t("Linux (ELF)", "Linux (ELF)") },
        { id: "windows", label: t("Windows (PE)", "Windows (PE)") },
        { id: "mac", label: t("macOS (Mach-O)", "macOS (Mach-O)") },
      ],
      items: [
        {
          label: t(
            "7F 45 4C 46 bilan boshlanadigan fayl",
            "A file starting 7F 45 4C 46",
          ),
          bucket: "linux",
        },
        { label: t("notepad.exe", "notepad.exe"), bucket: "windows" },
        {
          label: t(
            "“MZ” bilan boshlanadigan kernel32.dll",
            "kernel32.dll, starting with “MZ”",
          ),
          bucket: "windows",
        },
        {
          label: t("/usr/lib/libc.so.6", "/usr/lib/libc.so.6"),
          bucket: "linux",
        },
        {
          label: t(
            "Safari.app/Contents/MacOS/Safari",
            "Safari.app/Contents/MacOS/Safari",
          ),
          bucket: "mac",
        },
      ],
    },
  },
  {
    id: 4,
    group: FILES,
    title: t("Bo‘limlar", "Sections"),
    minutes: 8,
    intro: t(
      "ELF fayl ichida dastur qismlari bo‘limlarga ajratiladi. `.text` — mashina kodi (o‘qish va bajarish). `.rodata` — o‘zgarmas ma’lumotlar, masalan satr konstantalari. `.data` — boshlang‘ich qiymati bor global o‘zgaruvchilar. `.bss` — nol bilan boshlanadigan o‘zgaruvchilar: ular faylda joy egallamaydi, faqat hajmi yoziladi. Reverse engineer uchun bu xarita: satrlar `.rodata` da, mantiq `.text` da.",
      "Inside an ELF file, the parts of a program are split into sections. `.text` is machine code (read and execute). `.rodata` is constant data, such as string literals. `.data` holds globals that start with a value. `.bss` holds variables that start as zero: they take no room in the file, only their size is recorded. For a reverse engineer this is the map: the strings are in `.rodata`, the logic in `.text`.",
    ),
    analogy: t(
      "Kitob: matn boblari, ilovalar, bo‘sh daftar varaqlari.",
      "A book: the chapters, the appendices and the blank pages at the back.",
    ),
    theory: [
      t(
        "`readelf -S hello` barcha bo‘limlarni hajmi va huquqlari bilan ko‘rsatadi.",
        "`readelf -S hello` lists every section with its size and permissions.",
      ),
    ],
    task: t(
      "Har bir qism qaysi bo‘limga tushadi?",
      "Which section does each part land in?",
    ),
    hint: t(
      "Kod, o‘zgarmas, qiymatli yoki nol.",
      "Code, constant, given a value, or zero.",
    ),
    widget: { type: "sections" },
  },
  {
    id: 5,
    group: FILES,
    title: t("Sarlavha va kirish nuqtasi", "Headers and the entry point"),
    minutes: 6,
    intro: t(
      "Fayl sarlavhasi operatsion tizimga dasturni qanday yuklashni aytadi: qaysi protsessor (x86-64, ARM64), 32 yoki 64 bit, va kirish nuqtasi (entry point) — birinchi bajariladigan buyruq manzili. Bu odatda `main` emas, balki `_start`: u ish muhitini tayyorlab, keyin `main` ni chaqiradi. Sarlavhadagi g‘alati qiymatlar — masalan, `.text` ga yozish huquqi — paketlangan yoki zararli fayl belgisi bo‘lishi mumkin.",
      "A file’s header tells the operating system how to load it: which processor (x86-64, ARM64), 32 or 64 bit, and the entry point — the address of the first instruction to run. That is usually not `main` but `_start`, which prepares the environment and then calls `main`. Odd values in the header — say, a writable `.text` — can be a sign of a packed or malicious file.",
    ),
    analogy: t(
      "Kitob muqovasidagi ma’lumot: til, nashriyot va “birinchi bob — 7-sahifa”.",
      "A book’s title page: the language, the publisher and “chapter one starts on page 7”.",
    ),
    theory: [
      t(
        "`readelf -h hello` sarlavhani, jumladan Entry point address’ni ko‘rsatadi.",
        "`readelf -h hello` prints the header, including the entry point address.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t(
      "Birinchi buyruq — main emas.",
      "The first instruction isn’t main.",
    ),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Odatiy C dasturida birinchi qaysi kod bajariladi?",
            "In a typical C program, which code runs first?",
          ),
          options: [
            t("_start", "_start"),
            t("main", "main"),
            t("printf", "printf"),
          ],
          answer: 0,
          explain: t(
            "_start muhitni tayyorlab, main’ni chaqiradi.",
            "_start sets things up and then calls main.",
          ),
        },
        {
          ask: t(
            "Qaysi belgi faylning g‘ayrioddiy ekanini ko‘rsatishi mumkin?",
            "Which sign can show that a file is unusual?",
          ),
          options: [
            t(
              "Kod bo‘limiga yozish huquqi berilgan",
              "The code section is writable",
            ),
            t("Fayl nomi kichik harflarda", "A lower-case file name"),
            t("Fayl 64 bitli", "The file is 64-bit"),
          ],
          answer: 0,
          explain: t(
            "O‘zini o‘zi o‘zgartiradigan yoki ochadigan kod shunday qiladi.",
            "Self-modifying or self-unpacking code needs that.",
          ),
        },
      ],
    },
  },
  {
    id: 6,
    group: FILES,
    title: t("Statik va dinamik bog‘lash", "Static and dynamic linking"),
    minutes: 6,
    intro: t(
      "Dastur kutubxonani ikki yo‘l bilan oladi. Statik bog‘lashda kutubxona kodi faylning ichiga ko‘chiriladi: fayl katta, lekin mustaqil. Dinamik bog‘lashda fayl faqat “menga libc.so.6 kerak” deb yozadi va operatsion tizim uni ishga tushirishda yuklaydi: fayl kichik, kutubxonani bitta joyda yangilasa bo‘ladi. `ldd hello` dinamik kutubxonalar ro‘yxatini, import jadvali esa dastur qaysi funksiyalarni chaqirishini ko‘rsatadi — tahlilchi uchun dastur nima qila olishining birinchi belgisi.",
      "A program gets its libraries in one of two ways. With static linking the library code is copied into the file: big but self-contained. With dynamic linking the file only records “I need libc.so.6”, and the operating system loads it at run time: the file is small and the library can be updated in one place. `ldd hello` lists the dynamic libraries, and the import table shows which functions the program calls — an analyst’s first clue to what it can do.",
    ),
    analogy: t(
      "Statik — kitobni sotib olish; dinamik — kutubxonadan olish.",
      "Static is buying the book; dynamic is borrowing it from the library.",
    ),
    theory: [
      t(
        "Windows’da importlarni ko‘rish uchun `dumpbin /imports` yoki PE-bear ishlatiladi.",
        "On Windows, `dumpbin /imports` or PE-bear show the imports.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t("Ichida yoki tashqarida.", "Inside the file, or outside it."),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Kutubxonadagi xavfsizlik xatosi tuzatildi. Qaysi dasturlar avtomatik foyda oladi?",
            "A library’s security bug is fixed. Which programs benefit automatically?",
          ),
          options: [
            t("Dinamik bog‘langanlari", "Those linked dynamically"),
            t("Statik bog‘langanlari", "Those linked statically"),
            t("Hech qaysi", "None"),
          ],
          answer: 0,
          explain: t(
            "Statik dasturni qayta kompilyatsiya qilish kerak.",
            "A static program has to be rebuilt.",
          ),
        },
        {
          ask: t(
            "Import jadvalida `connect`, `send`, `CreateRemoteThread` bor. Bu nima haqida xabar beradi?",
            "The import table shows `connect`, `send`, `CreateRemoteThread`. What does that suggest?",
          ),
          options: [
            t(
              "Dastur tarmoqqa ulanadi va boshqa jarayonga kod qo‘yishi mumkin",
              "It talks to the network and may inject into another process",
            ),
            t("Dastur faqat matn chop etadi", "It only prints text"),
            t("Hech narsa", "Nothing"),
          ],
          answer: 0,
          explain: t(
            "Importlar — dastur nima qila olishining ro‘yxati.",
            "Imports are a list of what a program can do.",
          ),
        },
      ],
    },
  },
  {
    id: 7,
    group: FILES,
    title: t("Belgilar va strip", "Symbols and stripping"),
    minutes: 5,
    intro: t(
      "Kompilyator funksiya va o‘zgaruvchilar nomlarini — belgilar (symbols) jadvalida — qoldirishi mumkin, debug ma’lumoti esa hatto manba qatorlarini bog‘laydi. `strip` ularni olib tashlaydi: fayl kichrayadi, lekin tahlil qiyinlashadi, chunki `check_license` o‘rniga `FUN_00401a30` ko‘rinadi. Ko‘p tijorat va zararli dasturlar strip qilingan, shuning uchun tahlilchi funksiyalar vazifasini import va satrlarga qarab tiklaydi.",
      "A compiler can leave function and variable names in a symbol table, and debug information even links code back to source lines. `strip` removes them: the file shrinks, but analysis gets harder, because `FUN_00401a30` appears instead of `check_license`. Much commercial software and malware is stripped, so analysts work out what functions do from imports and strings.",
    ),
    analogy: t(
      "Xaritadan ko‘cha nomlarini o‘chirish: yo‘llar qoladi, nomlar yo‘qoladi.",
      "Rubbing the street names off a map: the roads stay, the names go.",
    ),
    theory: [
      t(
        "`nm hello` belgilar ro‘yxatini, `file hello` esa “stripped” yoki “not stripped” ni ko‘rsatadi.",
        "`nm hello` lists symbols; `file hello` says “stripped” or “not stripped”.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t("Nomlar yo‘qoladi, kod qoladi.", "The names go; the code stays."),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t("`strip` nimani olib tashlaydi?", "What does `strip` remove?"),
          options: [
            t("Belgilar va debug ma’lumotini", "Symbols and debug information"),
            t("Dastur kodini", "The program’s code"),
            t("Satr konstantalarini", "String literals"),
          ],
          answer: 0,
          explain: t(
            "Dastur avvalgidek ishlaydi, faqat nomlar yo‘q.",
            "The program still runs; only the names are gone.",
          ),
        },
        {
          ask: t(
            "Strip qilingan faylda funksiya vazifasini nimadan topasiz?",
            "In a stripped file, how do you work out what a function does?",
          ),
          options: [
            t(
              "U chaqiradigan importlar va ishlatadigan satrlardan",
              "From the imports it calls and the strings it uses",
            ),
            t("Fayl nomidan", "From the file name"),
            t("Topib bo‘lmaydi", "You can’t"),
          ],
          answer: 0,
          explain: t(
            "Keyingi modullarda buni amalda qilamiz.",
            "The next modules do exactly that.",
          ),
        },
      ],
    },
  },
  {
    id: 8,
    group: FILES,
    title: t("Yakuniy savollar", "Final questions"),
    minutes: 6,
    intro: t(
      "Endi bajariladigan faylning “anatomiyasi” tanish: u qanday paydo bo‘ladi, qaysi formatda, qanday bo‘limlarga ajraladi va qaysi kutubxonalarga tayanadi. Keyingi modulda `.text` bo‘limi ichiga kiramiz — assembler buyruqlarini o‘qishni o‘rganamiz.",
      "The anatomy of an executable is now familiar: how it comes about, which format it uses, how it splits into sections and which libraries it leans on. The next module goes inside the `.text` section — learning to read assembly.",
    ),
    analogy: t(
      "Mashina kapotini ochib, qismlarni nomlashni o‘rgandik; endi dvigatel ichiga qaraymiz.",
      "We’ve opened the bonnet and named the parts; next we look inside the engine.",
    ),
    theory: [
      t(
        "Tahlil har doim xavfsiz muhitda — virtual mashinada — qilinadi.",
        "Analysis is always done in a safe environment — a virtual machine.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t("Bosqichlar, formatlar, bo‘limlar.", "Stages, formats, sections."),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Qaysi bosqich `printf` manzilini bog‘laydi?",
            "Which stage resolves the address of `printf`?",
          ),
          options: [
            t("Linker", "The linker"),
            t("Preprotsessor", "The preprocessor"),
            t("Assembler", "The assembler"),
          ],
          answer: 0,
          explain: t(
            "Dinamik bog‘lashda yakuniy manzil ishga tushirishda belgilanadi.",
            "With dynamic linking the final address is fixed at run time.",
          ),
        },
        {
          ask: t(
            "Dasturdagi “Parol noto‘g‘ri” satri qaysi bo‘limda?",
            "Which section holds a program’s “Wrong password” message?",
          ),
          options: [
            t(".rodata", ".rodata"),
            t(".bss", ".bss"),
            t(".text", ".text"),
          ],
          answer: 0,
          explain: t(
            "Satrlar — tahlilchining birinchi topadigan narsasi.",
            "Strings are the first thing an analyst finds.",
          ),
        },
      ],
    },
  },
];
