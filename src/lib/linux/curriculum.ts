import { HOME, type Event, type Shell } from "./engine";

export type Text = { uz: string; en: string };
export const L = (uz: string, en: string): Text => ({ uz, en });
type Requirement = {
  label: Text;
  check: (shell: Shell, events: Event[]) => boolean;
};
export type Lesson = {
  id: number;
  title: Text;
  group: Text;
  minutes: number;
  intro: Text;
  theory: Text[];
  examples: { code: string; explanation: Text }[];
  task: Text;
  hint: string[];
  requirements: Requirement[];
  quiz: { question: Text; choices: Text[]; answer: number; explanation: Text };
};
const basics = L("01 · Linux bilan tanishuv", "01 · Meet Linux");
const files = L("02 · Fayllar bilan ishlash", "02 · Work with files");
const text = L("03 · Matn va oqimlar", "03 · Text and streams");
const system = L(
  "04 · Tizim va yakuniy amaliyot",
  "04 · System and final practice",
);
const ran = (events: Event[], command: string, output?: string) =>
  events.some(
    (e) =>
      e.code === 0 &&
      e.command === command &&
      (!output || e.output.includes(output)),
  );
const content = (s: Shell, path: string) => s.files[`${HOME}/${path}`]?.content;
const exists = (s: Shell, path: string, kind: "file" | "dir" = "file") =>
  s.files[`${HOME}/${path}`]?.kind === kind;

export const LESSONS: Lesson[] = [
  {
    id: 1,
    title: L("Linux, terminal va shell", "Linux, terminal and shell"),
    group: basics,
    minutes: 6,
    intro: L(
      "Terminalga yozilgan buyruq qayerga boradi? Avval tizimdagi o‘rningizni aniqlang.",
      "Where does a terminal command go? Start by identifying yourself and your location.",
    ),
    theory: [
      L(
        "Linux — operatsion tizim yadrosi: xotira, protsessor va qurilmalarni boshqaradi. Ubuntu, Debian va Fedora yadroni dasturlar va paket menejeri bilan birlashtirgan distributivlardir.",
        "Linux is a kernel: it manages memory, processors and devices. Ubuntu, Debian and Fedora are distributions that combine a kernel with programs and a package manager.",
      ),
      L(
        "Terminal matn kiritish va chiqarish oynasi; shell esa buyruqlarni tahlil qiluvchi dastur. Bash — keng tarqalgan shell. Bu laboratoriya Bash buyruqlarining cheklangan qismini simulyatsiya qiladi.",
        "A terminal is a text input/output interface; a shell interprets commands. Bash is a common shell. This lab simulates a limited subset of Bash commands.",
      ),
      L(
        "student@linux-lab:~$ satrida student — foydalanuvchi, linux-lab — kompyuter nomi, ~ — uy katalogi. $ belgisi buyruqqa kiritilmaydi. Buyruq va fayl nomlarida katta-kichik harf farq qiladi.",
        "In student@linux-lab:~$, student is the user, linux-lab is the host and ~ is the home directory. Do not type the prompt's $ sign. Commands and filenames are case-sensitive.",
      ),
    ],
    examples: [
      {
        code: "pwd",
        explanation: L(
          "Joriy katalogning to‘liq yo‘lini chiqaradi.",
          "Print the full path of the current directory.",
        ),
      },
      {
        code: "whoami",
        explanation: L(
          "Joriy foydalanuvchi nomini ko‘rsatadi.",
          "Show the current username.",
        ),
      },
      {
        code: "uname -a",
        explanation: L(
          "Simulyatsiyadagi tizim ma’lumotlarini ko‘rsatadi.",
          "Show the simulated system information.",
        ),
      },
    ],
    task: L(
      "pwd va whoami orqali katalogingiz va foydalanuvchingizni aniqlang.",
      "Use pwd and whoami to identify your directory and user.",
    ),
    hint: ["pwd", "whoami"],
    requirements: [
      {
        label: L("Uy katalogi aniqlandi", "Home directory identified"),
        check: (_, e) => ran(e, "pwd", HOME),
      },
      {
        label: L("Foydalanuvchi aniqlandi", "User identified"),
        check: (_, e) => ran(e, "whoami", "student"),
      },
    ],
    quiz: {
      question: L(
        "Buyruqni qaysi dastur tahlil qiladi?",
        "Which program interprets a command?",
      ),
      choices: [
        L("Shell", "Shell"),
        L("Monitor", "Monitor"),
        L("Fayl tizimi", "Filesystem"),
      ],
      answer: 0,
      explanation: L(
        "Shell buyruqni tahlil qilib, tegishli dasturni ishga tushiradi. Terminal uning kiritish-chiqarish oynasidir.",
        "The shell interprets commands and starts programs. The terminal provides its input/output interface.",
      ),
    },
  },
  {
    id: 2,
    title: L("Fayl tizimi va yashirin fayllar", "Filesystem and hidden files"),
    group: basics,
    minutes: 7,
    intro: L(
      "Linuxda hamma kataloglar / ildizidan boshlanadi. Ko‘rinmayotgan fayl ham mavjud bo‘lishi mumkin.",
      "All Linux directories begin at the / root. A file can exist without appearing in a normal listing.",
    ),
    theory: [
      L(
        "/ — ildiz; /home — foydalanuvchi kataloglari; /etc — sozlamalar; /var/log — jurnallar; /tmp — vaqtinchalik fayllar. /root esa root foydalanuvchisining uy katalogi bo‘lib, / bilan bir xil emas.",
        "/ is the root; /home contains user directories; /etc holds configuration; /var/log holds logs; /tmp holds temporary files. /root is the root user's home, not the filesystem root.",
      ),
      L(
        "ls ko‘rinadigan nomlarni, ls -a nuqta bilan boshlangan yashirin nomlarni ham chiqaradi. ls -l ruxsatlar, egasi va hajmni ko‘rsatadi. -la ikkita qisqa parametrni birlashtiradi.",
        "ls lists visible names; ls -a includes hidden names beginning with a dot. ls -l shows permissions, owner and size. -la combines two short options.",
      ),
    ],
    examples: [
      {
        code: "ls -la",
        explanation: L(
          "Yashirin fayllarni batafsil ko‘rish.",
          "List hidden files with details.",
        ),
      },
      {
        code: "tree documents",
        explanation: L(
          "Katalog tuzilishini daraxt shaklida ko‘rish.",
          "View the directory structure as a tree.",
        ),
      },
    ],
    task: L(
      "Uy katalogidagi .secret yashirin faylini ls orqali toping, so‘ng cat bilan o‘qing.",
      "Find the hidden .secret file using ls, then read it with cat.",
    ),
    hint: ["ls -la", "cat .secret"],
    requirements: [
      {
        label: L("Yashirin fayl ro‘yxatda ko‘rildi", "Hidden file listed"),
        check: (_, e) => ran(e, "ls", ".secret"),
      },
      {
        label: L("Yashirin fayl o‘qildi", "Hidden file read"),
        check: (_, e) => ran(e, "cat", "Hidden files"),
      },
    ],
    quiz: {
      question: L(
        "Yashirin fayl nomi qanday boshlanadi?",
        "How does a hidden filename begin?",
      ),
      choices: [
        L("$ bilan", "With $"),
        L(". bilan", "With ."),
        L("# bilan", "With #"),
      ],
      answer: 1,
      explanation: L(
        "Nuqta bilan boshlanuvchi nomlar odatiy ls natijasidan yashiriladi. Bu maxfiylik himoyasi emas.",
        "Names starting with a dot are hidden from a normal ls listing. This is not an access control.",
      ),
    },
  },
  {
    id: 3,
    title: L("Yo‘llar va kataloglar bo‘ylab yurish", "Paths and navigation"),
    group: basics,
    minutes: 7,
    intro: L(
      "Bir xil faylga mutlaq va nisbiy yo‘l bilan borish mumkin.",
      "You can reach the same file using an absolute or a relative path.",
    ),
    theory: [
      L(
        "Mutlaq yo‘l / bilan boshlanadi: /home/student/documents. Nisbiy yo‘l joriy katalogdan hisoblanadi: documents. . joriy, .. ota katalogni bildiradi.",
        "An absolute path starts with /: /home/student/documents. A relative path starts from your current directory: documents. . means the current directory; .. means its parent.",
      ),
      L(
        "cd katalogni almashtiradi; cd yoki cd ~ uyga, cd - avvalgi katalogga qaytaradi. Bo‘sh joyli nomlarni qo‘shtirnoqqa oling: cd 'my notes'.",
        "cd changes directory; cd or cd ~ returns home; cd - returns to the previous directory. Quote names containing spaces: cd 'my notes'.",
      ),
    ],
    examples: [
      {
        code: "cd documents",
        explanation: L(
          "Nisbiy yo‘l bilan kirish.",
          "Enter using a relative path.",
        ),
      },
      {
        code: "cd ..",
        explanation: L(
          "Bir pog‘ona yuqoriga chiqish.",
          "Move up one directory.",
        ),
      },
      {
        code: "cd /etc",
        explanation: L(
          "Mutlaq yo‘l bilan kirish.",
          "Enter using an absolute path.",
        ),
      },
    ],
    task: L(
      "/etc katalogiga o‘ting, os-release faylini o‘qing va uy katalogiga qayting.",
      "Go to /etc, read os-release and return home.",
    ),
    hint: ["cd /etc", "cat os-release", "cd ~"],
    requirements: [
      {
        label: L(
          "Distributiv ma’lumoti o‘qildi",
          "Distribution information read",
        ),
        check: (_, e) => ran(e, "cat", "ID=cybervalue"),
      },
      {
        label: L("Uy katalogiga qaytildi", "Returned home"),
        check: (s, e) => s.cwd === HOME && ran(e, "cd"),
      },
    ],
    quiz: {
      question: L("../ nimani anglatadi?", "What does ../ mean?"),
      choices: [
        L("Ildiz katalog", "Root directory"),
        L("Uy katalogi", "Home directory"),
        L("Ota katalog", "Parent directory"),
      ],
      answer: 2,
      explanation: L(
        ".. joriy katalogning ota katalogini bildiradi; / esa fayl tizimi ildizidir.",
        ".. refers to the parent of the current directory; / is the filesystem root.",
      ),
    },
  },
  {
    id: 4,
    title: L("Katalog va fayl yaratish", "Create directories and files"),
    group: files,
    minutes: 7,
    intro: L(
      "Yaxshi tartiblangan ish katalogi keyingi amallarni osonlashtiradi.",
      "An organised working directory makes later commands easier.",
    ),
    theory: [
      L(
        "mkdir yangi katalog yaratadi. mkdir -p yetishmayotgan ota kataloglarni ham yaratadi va mavjud katalog sababli xato bermaydi.",
        "mkdir creates a directory. mkdir -p also creates missing parent directories and accepts directories that already exist.",
      ),
      L(
        "touch mavjud bo‘lmagan faylni bo‘sh holda yaratadi. Haqiqiy Linuxda mavjud faylning vaqt belgilarini yangilaydi, mazmunini o‘chirmaydi. Simulyatorda vaqt belgilari modellashtirilmagan.",
        "touch creates a missing file without content. On Linux it updates an existing file's timestamps without erasing its content. Timestamps are not modelled in this simulator.",
      ),
    ],
    examples: [
      {
        code: "mkdir -p practice/notes",
        explanation: L(
          "Ichma-ich katalog yaratish.",
          "Create nested directories.",
        ),
      },
      {
        code: "touch practice/notes/day1.txt",
        explanation: L(
          "Bo‘sh qayd fayli yaratish.",
          "Create an empty notes file.",
        ),
      },
    ],
    task: L(
      "Uy katalogida practice/notes kataloglarini va uning ichida day1.txt faylini yarating.",
      "Create practice/notes inside your home and a day1.txt file inside it.",
    ),
    hint: ["mkdir -p practice/notes", "touch practice/notes/day1.txt"],
    requirements: [
      {
        label: L("notes katalogi yaratildi", "notes directory created"),
        check: (s) => exists(s, "practice/notes", "dir"),
      },
      {
        label: L("day1.txt fayli yaratildi", "day1.txt file created"),
        check: (s) => exists(s, "practice/notes/day1.txt"),
      },
    ],
    quiz: {
      question: L("mkdir -p nimani qo‘shadi?", "What does mkdir -p add?"),
      choices: [
        L(
          "Yetishmayotgan ota kataloglarni yaratadi",
          "Creates missing parent directories",
        ),
        L("Fayllarni o‘chiradi", "Deletes files"),
        L("Parol o‘rnatadi", "Sets a password"),
      ],
      answer: 0,
      explanation: L(
        "-p bilan barcha kerakli ota kataloglar ham yaratiladi.",
        "-p creates the required parent directories too.",
      ),
    },
  },
  {
    id: 5,
    title: L("Matn yozish va yo‘naltirish", "Write text and redirect output"),
    group: files,
    minutes: 8,
    intro: L(
      "Ekranga chiqqan natijani faylga yozishni o‘rganing.",
      "Learn to send terminal output into a file.",
    ),
    theory: [
      L(
        "echo matnni standart chiqishga (stdout) yuboradi. > shu chiqishni faylga yozadi: mavjud faylni avval bo‘shatadi. >> esa oxiriga qo‘shadi. Xato xabarlari alohida stderr oqimiga tegishli.",
        "echo writes text to standard output (stdout). > redirects it to a file, first truncating an existing file. >> appends instead. Error messages belong to the separate stderr stream.",
      ),
      L(
        "Qo‘shtirnoq bo‘sh joyli matnni bitta argument qiladi. Bir tirnoq '$USER' ni aynan yozadi; ikki tirnoq \"$USER\" o‘zgaruvchi qiymatini qo‘yadi. Buyruqni bajarishdan oldin > nishonini tekshiring.",
        "Quotes group text containing spaces into one argument. Single quotes keep '$USER' literal; double quotes expand \"$USER\" to its value. Check the target of > before executing.",
      ),
    ],
    examples: [
      {
        code: 'echo "Linux is powerful" > linux.txt',
        explanation: L(
          "Natijani yangi faylga yozish.",
          "Write output into a new file.",
        ),
      },
      {
        code: 'echo "Practice every day" >> linux.txt',
        explanation: L(
          "Mavjud matnni saqlab, yangi satr qo‘shish.",
          "Append a line while preserving the existing text.",
        ),
      },
    ],
    task: L(
      "linux.txt fayliga ketma-ket Linux is powerful va Practice every day satrlarini yozing.",
      "Write Linux is powerful and Practice every day as consecutive lines in linux.txt.",
    ),
    hint: [
      'echo "Linux is powerful" > linux.txt',
      'echo "Practice every day" >> linux.txt',
      "cat linux.txt",
    ],
    requirements: [
      {
        label: L(
          "Ikkala satr ham faylda saqlandi",
          "Both lines are saved in the file",
        ),
        check: (s) =>
          content(s, "linux.txt") === "Linux is powerful\nPractice every day\n",
      },
    ],
    quiz: {
      question: L(
        "Qaysi operator fayl oxiriga qo‘shadi?",
        "Which operator appends to a file?",
      ),
      choices: [L(">", ">"), L(">>", ">>"), L("|", "|")],
      answer: 1,
      explanation: L(
        ">> mavjud matnni saqlaydi. > esa mavjud mazmunni almashtiradi.",
        ">> preserves existing content. > replaces it.",
      ),
    },
  },
  {
    id: 6,
    title: L("Fayl mazmunini o‘qish", "Read file contents"),
    group: files,
    minutes: 6,
    intro: L(
      "Uzun jurnalni to‘liq chiqarish shart emas: kerakli qismini ko‘ring.",
      "You do not need to print an entire log: inspect the relevant part.",
    ),
    theory: [
      L(
        "cat faylni to‘liq chiqaradi; head dastlabki, tail oxirgi satrlarni ko‘rsatadi. Ikkalasida ham standart miqdor 10 satr, -n bilan o‘zgartiriladi.",
        "cat prints a whole file; head shows the beginning and tail the end. Both default to 10 lines; change the count with -n.",
      ),
      L(
        "Haqiqiy Linuxda less katta faylni sahifalab o‘qish uchun qulay; q bilan chiqiladi. tail -f o‘sib borayotgan jurnalni kuzatadi. Bu ikki interaktiv rejim simulyatorda yo‘q.",
        "On Linux, less pages through large files; press q to exit. tail -f follows a growing log. These two interactive modes are not available in the simulator.",
      ),
    ],
    examples: [
      {
        code: "head -n 2 logs/auth.log",
        explanation: L(
          "Jurnalning dastlabki 2 satri.",
          "The first 2 lines of the log.",
        ),
      },
      {
        code: "tail -n 1 logs/auth.log",
        explanation: L(
          "Jurnalning so‘nggi satri.",
          "The last line of the log.",
        ),
      },
    ],
    task: L(
      "auth.log jurnalining dastlabki 2 satrini head, oxirgi satrini tail bilan o‘qing.",
      "Read the first 2 lines of auth.log with head and its last line with tail.",
    ),
    hint: ["head -n 2 logs/auth.log", "tail -n 1 logs/auth.log"],
    requirements: [
      {
        label: L("Dastlabki ikki satr ko‘rildi", "First two lines inspected"),
        check: (_, e) =>
          e.some(
            (x) =>
              x.command === "head" &&
              x.code === 0 &&
              x.output ===
                "INFO user=ali login=success\nERROR user=guest login=failed\n",
          ),
      },
      {
        label: L("Oxirgi satr ko‘rildi", "Last line inspected"),
        check: (_, e) =>
          e.some(
            (x) =>
              x.command === "tail" &&
              x.code === 0 &&
              x.output === "WARN user=ali password=expiring\n",
          ),
      },
    ],
    quiz: {
      question: L("tail -n 1 nima qiladi?", "What does tail -n 1 do?"),
      choices: [
        L("Birinchi satrni chiqaradi", "Prints the first line"),
        L("Bir satr qo‘shadi", "Appends a line"),
        L("Oxirgi satrni chiqaradi", "Prints the last line"),
      ],
      answer: 2,
      explanation: L(
        "tail oxiridan, head boshidan o‘qiydi.",
        "tail reads from the end; head reads from the beginning.",
      ),
    },
  },
  {
    id: 7,
    title: L("Nusxalash va ko‘chirish", "Copy and move"),
    group: files,
    minutes: 7,
    intro: L(
      "Tahrirdan oldin zaxira nusxa yarating va fayllarni tartiblang.",
      "Make a backup before editing and organise your files.",
    ),
    theory: [
      L(
        "cp manba nishon nusxa yaratadi va manbani saqlaydi. mv esa ko‘chiradi yoki nomini almashtiradi. Nishon mavjud katalog bo‘lsa, fayl shu katalog ichiga tushadi.",
        "cp source destination creates a copy and keeps the source. mv moves or renames it. If the destination is an existing directory, the file goes inside it.",
      ),
      L(
        "cp -r katalog ichidagi daraxtni nusxalaydi. Ikkala buyruq ham mavjud nishon faylni almashtirishi mumkin; manba va nishon tartibini tekshiring.",
        "cp -r copies a directory tree. Both commands can overwrite an existing destination file; check the order of source and destination.",
      ),
    ],
    examples: [
      {
        code: "cp documents/notes.txt notes-backup.txt",
        explanation: L(
          "Asl faylga tegmasdan nusxa olish.",
          "Copy without changing the original.",
        ),
      },
      {
        code: "mv notes-backup.txt archive.txt",
        explanation: L("Nusxaning nomini almashtirish.", "Rename the copy."),
      },
    ],
    task: L(
      "documents/notes.txt nusxasini uy katalogida archive.txt nomi bilan saqlang. Asl fayl saqlansin.",
      "Save a copy of documents/notes.txt as archive.txt in your home. Keep the original.",
    ),
    hint: [
      "cp documents/notes.txt notes-backup.txt",
      "mv notes-backup.txt archive.txt",
    ],
    requirements: [
      {
        label: L("Asl fayl saqlangan", "Original preserved"),
        check: (s) =>
          content(s, "documents/notes.txt") ===
          "Linux\nShell\nKernel\nPermissions\n",
      },
      {
        label: L("Nusxa to‘g‘ri saqlangan", "Copy saved correctly"),
        check: (s, e) =>
          content(s, "archive.txt") === content(s, "documents/notes.txt") &&
          ran(e, "cp"),
      },
    ],
    quiz: {
      question: L(
        "Qaysi buyruq manbani saqlab, nusxa yaratadi?",
        "Which command copies while keeping the source?",
      ),
      choices: [L("cp", "cp"), L("mv", "mv"), L("rm", "rm")],
      answer: 0,
      explanation: L(
        "cp nusxalaydi; mv manbani ko‘chiradi yoki nomini o‘zgartiradi.",
        "cp copies; mv moves or renames the source.",
      ),
    },
  },
  {
    id: 8,
    title: L(
      "Fayllarni ehtiyotkorlik bilan o‘chirish",
      "Remove files carefully",
    ),
    group: files,
    minutes: 6,
    intro: L(
      "O‘chirishdan oldin pwd va ls bilan qayerdaligingizni tekshiring.",
      "Check where you are with pwd and ls before removing anything.",
    ),
    theory: [
      L(
        "rm faylni, rmdir faqat bo‘sh katalogni o‘chiradi. rm -r katalog va uning ichidagilarni o‘chiradi. -f mavjud bo‘lmagan nishon uchun xatoni bostiradi.",
        "rm removes a file; rmdir removes only an empty directory. rm -r removes a directory and its contents. -f suppresses errors for missing targets.",
      ),
      L(
        "Haqiqiy terminaldagi rm odatda faylni savatga yubormaydi. Bu laboratoriyada reset orqali virtual muhitni qaytarasiz; haqiqiy tizimda zaxira nusxa va yo‘lni tekshirish muhim.",
        "In a real terminal, rm generally does not send files to a recycle bin. This lab can reset its virtual environment; on a real system, verify paths and keep backups.",
      ),
    ],
    examples: [
      {
        code: "touch temporary.txt",
        explanation: L(
          "Sinov uchun vaqtinchalik fayl yaratish.",
          "Create a temporary practice file.",
        ),
      },
      {
        code: "rm temporary.txt",
        explanation: L(
          "Faqat ko‘rsatilgan faylni o‘chirish.",
          "Remove the specified file.",
        ),
      },
    ],
    task: L(
      "temporary.txt faylini yarating va rm bilan o‘chiring. documents katalogi saqlansin.",
      "Create temporary.txt and remove it with rm. Keep the documents directory.",
    ),
    hint: ["touch temporary.txt", "ls", "rm temporary.txt"],
    requirements: [
      {
        label: L("Fayl yaratilib, o‘chirildi", "File created and removed"),
        check: (s, e) =>
          !exists(s, "temporary.txt") &&
          e.some(
            (x) =>
              x.command === "touch" &&
              x.code === 0 &&
              x.args.includes("temporary.txt"),
          ) &&
          ran(e, "rm"),
      },
      {
        label: L("Hujjatlar saqlangan", "Documents preserved"),
        check: (s) =>
          exists(s, "documents", "dir") && exists(s, "documents/notes.txt"),
      },
    ],
    quiz: {
      question: L(
        "rmdir qachon katalogni o‘chiradi?",
        "When will rmdir remove a directory?",
      ),
      choices: [
        L("Har doim", "Always"),
        L("Katalog bo‘sh bo‘lsa", "When the directory is empty"),
        L("Faqat yashirin bo‘lsa", "Only if it is hidden"),
      ],
      answer: 1,
      explanation: L(
        "rmdir ichida fayl yoki katalog qolgan bo‘lsa xato beradi.",
        "rmdir fails if files or directories remain inside.",
      ),
    },
  },
  {
    id: 9,
    title: L("grep bilan jurnaldan qidirish", "Search logs with grep"),
    group: text,
    minutes: 8,
    intro: L(
      "Yuzlab satrlar orasidan xato yozuvlarini ajratib oling.",
      "Extract error records from a log.",
    ),
    theory: [
      L(
        "grep mos satrlarni chiqaradi. -F andozani oddiy matn sifatida, -i harf registrini hisobga olmasdan, -n satr raqami bilan, -v teskari tanlov bilan, -c son sifatida ishlatadi.",
        "grep prints matching lines. -F treats the pattern as literal text, -i ignores case, -n adds line numbers, -v selects non-matches and -c counts matching lines.",
      ),
      L(
        "Haqiqiy grep muntazam ifodalarni ham qo‘llaydi. Bu laboratoriyada faqat oddiy matn qidiruvi bor. Natija topilmasa exit code 1, topilsa 0 bo‘ladi; bo‘sh chiqish har doim dastur buzildi degani emas.",
        "Real grep also supports regular expressions. This lab supports literal searches only. A match returns exit code 0; no match returns 1. Empty output does not always mean a broken program.",
      ),
    ],
    examples: [
      {
        code: "grep -Fn ERROR logs/auth.log",
        explanation: L(
          "ERROR qatnashgan satrlarni raqamlari bilan olish.",
          "Show lines containing ERROR with their line numbers.",
        ),
      },
      {
        code: "grep -Fi error logs/auth.log",
        explanation: L(
          "Katta-kichik harfni farqlamasdan qidirish.",
          "Search without distinguishing letter case.",
        ),
      },
    ],
    task: L(
      "logs/auth.log faylidagi ERROR satrlarini errors.txt fayliga yozing. Unda aynan 2 xato satri bo‘lsin.",
      "Save the ERROR lines from logs/auth.log to errors.txt. It should contain exactly two error lines.",
    ),
    hint: ["grep -F ERROR logs/auth.log > errors.txt", "cat errors.txt"],
    requirements: [
      {
        label: L("Ikki xato satri ajratildi", "Two error records extracted"),
        check: (s, e) =>
          content(s, "errors.txt") ===
            "ERROR user=guest login=failed\nERROR user=guest login=failed\n" &&
          ran(e, "grep"),
      },
    ],
    quiz: {
      question: L(
        "grep -v qanday satrlarni chiqaradi?",
        "Which lines does grep -v print?",
      ),
      choices: [
        L("Faqat birinchi satrni", "Only the first line"),
        L("Faqat bo‘sh satrlarni", "Only empty lines"),
        L("Andozaga mos kelmagan satrlarni", "Lines that do not match"),
      ],
      answer: 2,
      explanation: L(
        "-v tanlovni teskarisiga o‘giradi.",
        "-v inverts the selection.",
      ),
    },
  },
  {
    id: 10,
    title: L("Pipe, saralash va takrorlar", "Pipes, sorting and duplicates"),
    group: text,
    minutes: 9,
    intro: L(
      "Bir nechta kichik buyruqni ulab, foydali natija oling.",
      "Connect several small commands to produce a useful result.",
    ),
    theory: [
      L(
        "| chap buyruq stdout oqimini o‘ng buyruq stdin oqimiga uzatadi. Fayl yaratmaydi. sort satrlarni tartiblaydi; -n sonli, -r teskari tartibni tanlaydi.",
        "| connects the left command's stdout to the right command's stdin. It does not create a file. sort orders lines; -n sorts numerically and -r reverses the order.",
      ),
      L(
        "uniq faqat yonma-yon turgan takrorlarni olib tashlaydi. Shu sababli odatda sort | uniq ishlatiladi. uniq -c har bir guruhdagi takror sonini chiqaradi.",
        "uniq removes only adjacent duplicates. That is why it is often preceded by sort. uniq -c prints the count for each group.",
      ),
    ],
    examples: [
      {
        code: "cat documents/users.txt | sort | uniq",
        explanation: L(
          "Takrorlanmagan, tartiblangan foydalanuvchilar.",
          "Sorted, distinct usernames.",
        ),
      },
      {
        code: "sort documents/users.txt | uniq -c",
        explanation: L(
          "Har bir nom necha marta uchraganini ko‘rish.",
          "Count how often each name occurs.",
        ),
      },
    ],
    task: L(
      "documents/users.txt dagi takrorlanmagan nomlarni tartiblab unique.txt fayliga yozing.",
      "Sort the distinct names in documents/users.txt and save them to unique.txt.",
    ),
    hint: ["sort documents/users.txt | uniq > unique.txt", "cat unique.txt"],
    requirements: [
      {
        label: L(
          "Tartiblangan uchta nom saqlandi",
          "Three sorted distinct names saved",
        ),
        check: (s, e) =>
          content(s, "unique.txt") === "ali\nsara\nzafar\n" && ran(e, "sort"),
      },
    ],
    quiz: {
      question: L(
        "Nima uchun uniq dan oldin sort ishlatiladi?",
        "Why use sort before uniq?",
      ),
      choices: [
        L(
          "Takrorlar yonma-yon turishi uchun",
          "To put duplicates next to each other",
        ),
        L("Fayl o‘chishi uchun", "To delete the file"),
        L("Ruxsatni almashtirish uchun", "To change permissions"),
      ],
      answer: 0,
      explanation: L(
        "uniq faqat ketma-ket kelgan bir xil satrlarni birlashtiradi.",
        "uniq combines only consecutive identical lines.",
      ),
    },
  },
  {
    id: 11,
    title: L("Sanash va buyruqlar zanjiri", "Count and chain commands"),
    group: text,
    minutes: 8,
    intro: L(
      "Buyruq natijasini sanang va keyingi amal qachon bajarilishini boshqaring.",
      "Count command output and control when the next command runs.",
    ),
    theory: [
      L(
        "wc -l yangi satr belgilarini, -w so‘zlarni, -c baytlarni sanaydi. echo -n yangi satr belgisini qo‘shmaydi, shuning uchun uning natijasida wc -l nol bo‘lishi mumkin.",
        "wc -l counts newline characters, -w counts words and -c counts bytes. echo -n omits the newline, so piping its output to wc -l can produce zero.",
      ),
      L(
        "A && B da B faqat A muvaffaqiyatli (exit code 0) bo‘lsa bajariladi. A ; B da B oldingi natijadan qat’i nazar bajariladi. < faylni standart kirishga yo‘naltiradi.",
        "In A && B, B runs only when A succeeds (exit code 0). In A ; B, B runs regardless of A's result. < redirects a file into standard input.",
      ),
    ],
    examples: [
      {
        code: "grep -F ERROR logs/auth.log | wc -l",
        explanation: L("Xato satrlari sonini hisoblash.", "Count error lines."),
      },
      {
        code: "mkdir report && echo ready > report/status.txt",
        explanation: L(
          "Katalog yaratilgandagina ichiga yozish.",
          "Write inside the directory only if creation succeeds.",
        ),
      },
    ],
    task: L(
      "auth.log dagi ERROR satrlari sonini count.txt fayliga yozing; faylda 2 soni bo‘lsin.",
      "Write the number of ERROR lines in auth.log to count.txt; the file should contain 2.",
    ),
    hint: ["grep -F ERROR logs/auth.log | wc -l > count.txt", "cat count.txt"],
    requirements: [
      {
        label: L("Xatolar soni to‘g‘ri hisoblandi", "Error count is correct"),
        check: (s, e) =>
          content(s, "count.txt")?.trim() === "2" && ran(e, "wc"),
      },
    ],
    quiz: {
      question: L(
        "A && B da A xato bersa nima bo‘ladi?",
        "What happens if A fails in A && B?",
      ),
      choices: [
        L("B ikki marta bajariladi", "B runs twice"),
        L("B bajarilmaydi", "B does not run"),
        L("A qayta bajariladi", "A runs again"),
      ],
      answer: 1,
      explanation: L(
        "&& keyingi buyruqni faqat oldingisi muvaffaqiyatli bo‘lganda bajaradi.",
        "&& runs the next command only after success.",
      ),
    },
  },
  {
    id: 12,
    title: L("find bilan fayl qidirish", "Find files by name and type"),
    group: text,
    minutes: 7,
    intro: L(
      "grep fayl ichidan, find esa katalog daraxtidan qidiradi.",
      "grep searches inside files; find searches the directory tree.",
    ),
    theory: [
      L(
        "find boshlang‘ich yo‘ldan pastga yuradi. -name nomni, -type f oddiy faylni, -type d katalogni tanlaydi. '*' istalgan uzunlikdagi, '?' bitta belgini bildiradi.",
        "find walks below a starting path. -name filters names; -type f selects regular files; -type d selects directories. '*' matches any number of characters and '?' matches one.",
      ),
      L(
        "Andozani tirnoqqa olish muhim: find . -name '*.txt'. Haqiqiy shellda tirnoqsiz * oldindan kengayishi mumkin. Bu simulyatorda * va ? faqat find -name ichida ishlaydi.",
        "Quote patterns: find . -name '*.txt'. In a real shell, an unquoted * may expand before find sees it. This simulator supports * and ? only inside find -name.",
      ),
    ],
    examples: [
      {
        code: "find . -type f -name '*.txt'",
        explanation: L(
          "Ichki kataloglardan ham matn fayllarini topish.",
          "Find text files, including in subdirectories.",
        ),
      },
      {
        code: "find . -type d",
        explanation: L(
          "Faqat kataloglarni chiqarish.",
          "List only directories.",
        ),
      },
    ],
    task: L(
      "find yordamida uy katalogi ichidagi auth.log faylini toping.",
      "Use find to locate auth.log under your home directory.",
    ),
    hint: ["find . -type f -name 'auth.log'"],
    requirements: [
      {
        label: L("Jurnal yo‘li topildi", "Log path found"),
        check: (_, e) => ran(e, "find", "logs/auth.log"),
      },
    ],
    quiz: {
      question: L(
        "Fayl ichidagi matnni qaysi buyruq qidiradi?",
        "Which command searches text inside a file?",
      ),
      choices: [L("find", "find"), L("cd", "cd"), L("grep", "grep")],
      answer: 2,
      explanation: L(
        "find nom va tur orqali fayllarni topadi; grep ularning mazmunidan satr qidiradi.",
        "find locates files by name and type; grep searches their contents.",
      ),
    },
  },
  {
    id: 13,
    title: L("Foydalanuvchilar va ruxsatlar", "Users and permissions"),
    group: system,
    minutes: 10,
    intro: L(
      "Kim o‘qishi, yozishi va bajarishi mumkinligini belgilang.",
      "Decide who can read, write and execute.",
    ),
    theory: [
      L(
        "Ruxsatlar egasi (u), guruhi (g), boshqalar (o) uchun alohida. r=4 o‘qish, w=2 yozish, x=1 bajarish. 640: egasi rw-, guruhi r--, boshqalar ---.",
        "Permissions are separate for owner (u), group (g) and others (o). r=4 means read, w=2 write and x=1 execute. 640 gives rw- to the owner, r-- to the group and --- to others.",
      ),
      L(
        "Katalogda r nomlarni ko‘rish, w yozuv qo‘shish/o‘chirish, x ichiga o‘tish imkonini beradi. Faylni o‘chirish asosan ota katalog ruxsatiga bog‘liq. 777 ni odatiy yechim sifatida qo‘llamang.",
        "On a directory, r lists names, w adds/removes entries and x allows traversal. Removing a file primarily depends on its parent directory's permissions. Do not use 777 as a default fix.",
      ),
      L(
        "chmod ruxsatni, chown egani almashtiradi. sudo ruxsat berilgan buyruqni boshqa foydalanuvchi, ko‘pincha root sifatida bajaradi. Laboratoriyada faqat sonli chmod bor, root huquqi va skript bajarish yo‘q.",
        "chmod changes permissions; chown changes ownership. sudo runs an authorised command as another user, often root. The lab supports numeric chmod only, without root privileges or script execution.",
      ),
    ],
    examples: [
      {
        code: "chmod 640 documents/notes.txt",
        explanation: L(
          "Qaydni faqat egasi yozadigan qilish.",
          "Make the notes writable only by their owner.",
        ),
      },
      {
        code: "chmod 750 backup.sh",
        explanation: L(
          "Skript uchun bajarish bitini o‘rnatish; simulyator skriptni bajarmaydi.",
          "Set executable permission for the script; the simulator does not execute it.",
        ),
      },
      {
        code: "ls -l documents",
        explanation: L(
          "Natijani ruxsatlar ustunida tekshirish.",
          "Verify the permissions in the listing.",
        ),
      },
    ],
    task: L(
      "documents/notes.txt ruxsatini 640, backup.sh ruxsatini 750 qiling.",
      "Set documents/notes.txt to mode 640 and backup.sh to mode 750.",
    ),
    hint: ["chmod 640 documents/notes.txt", "chmod 750 backup.sh", "ls -l"],
    requirements: [
      {
        label: L("Qayd ruxsati 640", "Notes mode is 640"),
        check: (s) => s.files[`${HOME}/documents/notes.txt`]?.mode === 0o640,
      },
      {
        label: L("Skript ruxsati 750", "Script mode is 750"),
        check: (s) => s.files[`${HOME}/backup.sh`]?.mode === 0o750,
      },
    ],
    quiz: {
      question: L(
        "chmod 640 dagi 6 nimani bildiradi?",
        "What does the 6 in chmod 640 mean?",
      ),
      choices: [
        L("Egasi o‘qiydi va yozadi", "Owner can read and write"),
        L("Hamma bajara oladi", "Everyone can execute"),
        L("Faqat guruh o‘qiydi", "Only the group can read"),
      ],
      answer: 0,
      explanation: L(
        "6 = 4 + 2 = r + w. Birinchi raqam fayl egasiga tegishli.",
        "6 = 4 + 2 = r + w. The first digit applies to the owner.",
      ),
    },
  },
  {
    id: 14,
    title: L("Muhit o‘zgaruvchilari", "Environment variables"),
    group: system,
    minutes: 7,
    intro: L(
      "Dasturlar sozlamalarni muhit o‘zgaruvchilaridan ham oladi.",
      "Programs can read configuration from environment variables.",
    ),
    theory: [
      L(
        "env muhitni ko‘rsatadi. HOME uy katalogini, USER foydalanuvchini, PATH buyruqlar qidiriladigan kataloglarni bildiradi. export NAME=value o‘zgaruvchini tashqi dasturlarga ham uzatiladigan qiladi.",
        "env displays the environment. HOME holds the home directory, USER the username and PATH the command search directories. export NAME=value makes a variable available to child programs.",
      ),
      L(
        "$NAME qiymatni o‘qiydi. export COURSE='Linux basics' da = atrofida bo‘sh joy bo‘lmaydi. Haqiqiy shellda export odatda faqat shu seans va uning avlodlariga ta’sir qiladi; doimiy sozlama uchun shell profilidan foydalaniladi.",
        "$NAME reads a value. In export COURSE='Linux basics', do not add spaces around =. On a real shell, export usually affects this session and its children; use a shell profile for persistent configuration.",
      ),
    ],
    examples: [
      {
        code: 'export COURSE="Linux basics"',
        explanation: L(
          "O‘quv kursi nomini o‘zgaruvchiga saqlash.",
          "Store the course name in a variable.",
        ),
      },
      {
        code: 'echo "$COURSE"',
        explanation: L("Saqlangan qiymatni o‘qish.", "Read the stored value."),
      },
    ],
    task: L(
      "COURSE o‘zgaruvchisiga Linux basics qiymatini bering va uni course.txt fayliga chiqaring.",
      "Set COURSE to Linux basics and write its value into course.txt.",
    ),
    hint: ['export COURSE="Linux basics"', 'echo "$COURSE" > course.txt'],
    requirements: [
      {
        label: L("O‘zgaruvchi o‘rnatildi", "Variable set"),
        check: (s) => s.env.COURSE === "Linux basics",
      },
      {
        label: L("Qiymat faylga yozildi", "Value written to file"),
        check: (s) => content(s, "course.txt") === "Linux basics\n",
      },
    ],
    quiz: {
      question: L(
        "Qaysi yozuv $COURSE qiymatini ochadi?",
        "Which expression expands $COURSE?",
      ),
      choices: [
        L("'$COURSE'", "'$COURSE'"),
        L('"$COURSE"', '"$COURSE"'),
        L("COURSE", "COURSE"),
      ],
      answer: 1,
      explanation: L(
        "Ikki tirnoq ichida o‘zgaruvchi ochiladi; bir tirnoq ichida aynan yozilgan matn qoladi.",
        "Double quotes allow variable expansion; single quotes keep the text literal.",
      ),
    },
  },
  {
    id: 15,
    title: L(
      "Jarayonlar, xizmatlar va tarmoq",
      "Processes, services and networking",
    ),
    group: system,
    minutes: 10,
    intro: L(
      "Fayl diskda turadi; jarayon esa ishlayotgan dastur nusxasidir.",
      "A file lives on disk; a process is a running instance of a program.",
    ),
    theory: [
      L(
        "ps jarayonlarni, PID ularning identifikatorini ko‘rsatadi. kill PID odatda SIGTERM yuborib, tugashni so‘raydi; bu darhol majburan to‘xtatish degani emas. Bu laboratoriyada 128 raqamli virtual worker to‘xtatiladi.",
        "ps lists processes and PID identifies them. kill PID normally sends SIGTERM to request termination; it is not necessarily an immediate forced stop. Here it stops virtual worker 128.",
      ),
      L(
        "Haqiqiy Linuxda top jarayonlarni kuzatadi, systemctl status xizmat holatini tekshiradi. Debian/Ubuntu apt, Fedora dnf orqali paketlarni boshqaradi. Paket o‘rnatish ko‘pincha administrator huquqini talab qiladi. Bu amallar simulyatorda bajarilmaydi.",
        "On Linux, top monitors processes and systemctl status checks a service. Debian/Ubuntu use apt and Fedora uses dnf for packages. Installation often requires administrator privileges. These operations are not executed in the simulator.",
      ),
      L(
        "Tarmoqni tekshirish tartibi: ip addr — manzil, ip route — marshrut, ping — ICMP yetib borishi, ss -tuln — tinglayotgan soketlar, curl -I — HTTP sarlavhalari. Ping bloklangan bo‘lishi mumkin; u veb xizmat ishlashini o‘zi isbotlamaydi. Laboratoriya tarmoq so‘rovi yubormaydi.",
        "A network checklist: ip addr for addresses, ip route for routes, ping for ICMP reachability, ss -tuln for listening sockets, curl -I for HTTP headers. Ping can be blocked and does not alone prove a web service works. The lab sends no network requests.",
      ),
    ],
    examples: [
      {
        code: "ps",
        explanation: L(
          "Virtual jarayonlar ro‘yxatini ko‘rish.",
          "Inspect the virtual process list.",
        ),
      },
      {
        code: "kill 128",
        explanation: L(
          "Faqat virtual backup-worker ni to‘xtatish.",
          "Stop only the virtual backup-worker.",
        ),
      },
    ],
    task: L(
      "ps orqali jarayonlarni ko‘ring va PID 128 virtual jarayonini to‘xtating.",
      "Inspect processes with ps and stop the virtual process with PID 128.",
    ),
    hint: ["ps", "kill 128", "ps"],
    requirements: [
      {
        label: L("Jarayonlar tekshirildi", "Processes inspected"),
        check: (_, e) => ran(e, "ps"),
      },
      {
        label: L("Virtual worker to‘xtadi", "Virtual worker stopped"),
        check: (s, e) => !s.processes.includes(128) && ran(e, "kill"),
      },
    ],
    quiz: {
      question: L("PID nima?", "What is a PID?"),
      choices: [
        L("Fayl ruxsati", "A file permission"),
        L("Tarmoq paroli", "A network password"),
        L("Jarayon identifikatori", "A process identifier"),
      ],
      answer: 2,
      explanation: L(
        "Har bir jarayon PID orqali aniqlanadi. Uni ps kabi vositalardan olasiz.",
        "A PID identifies a process. Tools such as ps show it.",
      ),
    },
  },
  {
    id: 16,
    title: L("Yakuniy amaliyot: jurnal auditi", "Final practice: log audit"),
    group: system,
    minutes: 12,
    intro: L(
      "Endi buyruqlarni birlashtirib kichik audit hisoboti tayyorlang.",
      "Combine your commands to prepare a small audit report.",
    ),
    theory: [
      L(
        "Ish oqimi: manbani o‘qish → kerakli satrlarni ajratish → natijani saqlash → sonini tekshirish → ruxsatni cheklash. Har qadamning natijasini ko‘rish xatoni tez topishga yordam beradi.",
        "Workflow: inspect the source → filter relevant lines → save the result → verify the count → restrict permissions. Inspecting each result helps locate mistakes.",
      ),
      L(
        "Haqiqiy tizimga o‘tganda help, man va dastur --help chiqishidan foydalaning. Dastlab uy katalogidagi mashq fayllarida ishlang. Bu kurs boshlang‘ich tayanch; to‘liq Bash, xizmat boshqaruvi va tarmoq amaliyoti alohida Linux muhitini talab qiladi.",
        "On a real system use help, man and program --help output. Start with practice files in your home directory. This course is a foundation; full Bash, service management and networking require a separate Linux environment.",
      ),
    ],
    examples: [
      {
        code: "help grep",
        explanation: L(
          "Qo‘llab-quvvatlanadigan sintaksisni eslash.",
          "Review the supported syntax.",
        ),
      },
    ],
    task: L(
      "Uy katalogida audit yarating. ERROR satrlarini audit/errors.log ga, ularning sonini audit/count.txt ga yozing. errors.log ruxsati 600 bo‘lsin. Asl jurnal o‘zgarmasin.",
      "Create audit in your home. Save ERROR lines to audit/errors.log and their count to audit/count.txt. Set errors.log to 600. Preserve the original log.",
    ),
    hint: [
      "mkdir audit",
      "grep -F ERROR logs/auth.log > audit/errors.log",
      "cat audit/errors.log | wc -l > audit/count.txt",
      "chmod 600 audit/errors.log",
      "ls -l audit",
    ],
    requirements: [
      {
        label: L("Audit katalogi yaratildi", "Audit directory created"),
        check: (s) => exists(s, "audit", "dir"),
      },
      {
        label: L("Ikki xato yozuvi saqlandi", "Two error records saved"),
        check: (s) =>
          content(s, "audit/errors.log") ===
          "ERROR user=guest login=failed\nERROR user=guest login=failed\n",
      },
      {
        label: L("Satrlar soni 2", "Line count is 2"),
        check: (s) => content(s, "audit/count.txt")?.trim() === "2",
      },
      {
        label: L("Ruxsat faqat egasiga: 600", "Owner-only permissions: 600"),
        check: (s) => s.files[`${HOME}/audit/errors.log`]?.mode === 0o600,
      },
      {
        label: L("Asl jurnal saqlangan", "Original log preserved"),
        check: (s) =>
          content(s, "logs/auth.log") ===
          "INFO user=ali login=success\nERROR user=guest login=failed\nINFO user=sara login=success\nERROR user=guest login=failed\nWARN user=ali password=expiring\n",
      },
    ],
    quiz: {
      question: L(
        "Nima uchun natija alohida faylga yoziladi?",
        "Why write results into a separate file?",
      ),
      choices: [
        L("Asl dalilni saqlash uchun", "To preserve the original evidence"),
        L("Jurnalni yashirish uchun", "To hide the log"),
        L("Ruxsatlarni chetlab o‘tish uchun", "To bypass permissions"),
      ],
      answer: 0,
      explanation: L(
        "Asl jurnalni saqlash tahlilni qayta tekshirish imkonini beradi.",
        "Preserving the source log lets you verify the analysis again.",
      ),
    },
  },
];

export function checks(lesson: Lesson, shell: Shell, events: Event[]) {
  return lesson.requirements.map((r) => ({
    label: r.label,
    passed: r.check(shell, events),
  }));
}

export const COMMAND_NOTES: Record<string, Text> = {
  pwd: L(
    "Joriy katalogning mutlaq yo‘li.",
    "Absolute path of the current directory.",
  ),
  ls: L(
    "Fayllar ro‘yxati. -a yashirinlar, -l tafsilotlar.",
    "List files. -a includes hidden names; -l shows details.",
  ),
  cd: L(
    "Katalogga o‘tish. ~ uyga, .. yuqoriga, - oldingisiga.",
    "Change directory. ~ goes home, .. goes up, - goes back.",
  ),
  tree: L(
    "Katalog va ichki fayllar daraxti.",
    "Display a directory and its contents as a tree.",
  ),
  mkdir: L(
    "Katalog yaratish. -p ota kataloglarni ham yaratadi.",
    "Create directories. -p creates missing parents too.",
  ),
  touch: L(
    "Bo‘sh fayl yaratish; mavjud mazmun saqlanadi.",
    "Create an empty file; preserve existing contents.",
  ),
  cat: L(
    "Fayllarni yoki stdin oqimini chiqarish.",
    "Print files or the stdin stream.",
  ),
  echo: L(
    "Matn chiqarish. -n oxirgi yangi satrni qo‘shmaydi.",
    "Print text. -n omits the final newline.",
  ),
  cp: L(
    "Nusxa olish. Katalog uchun -r.",
    "Copy a file. Use -r for a directory.",
  ),
  mv: L(
    "Ko‘chirish yoki nomini almashtirish.",
    "Move or rename a file or directory.",
  ),
  rm: L(
    "O‘chirish. -r katalog daraxti; -f yo‘q fayl xatosini bostiradi.",
    "Remove. -r removes a directory tree; -f ignores missing files.",
  ),
  rmdir: L(
    "Faqat bo‘sh katalogni o‘chirish.",
    "Remove an empty directory only.",
  ),
  head: L(
    "Boshidan n satr; standart 10.",
    "Print the first n lines; default 10.",
  ),
  tail: L(
    "Oxiridan n satr; standart 10. -f mavjud emas.",
    "Print the last n lines; default 10. No -f mode.",
  ),
  grep: L(
    "Oddiy matn qidiruvi. -F matn, -i registrsiz, -n raqam, -v teskari, -c son. Regex yo‘q.",
    "Literal search. -F literal, -i ignore case, -n line numbers, -v invert, -c count. No regex.",
  ),
  sort: L(
    "Satrlarni saralash. -n sonli, -r teskari, -u takrorsiz.",
    "Sort lines. -n numeric, -r reversed, -u unique.",
  ),
  uniq: L(
    "Yonma-yon takrorlarni birlashtirish. -c takror soni.",
    "Collapse adjacent duplicates. -c shows counts.",
  ),
  wc: L(
    "-l yangi satr, -w so‘z, -c bayt soni.",
    "-l counts newlines, -w words, -c bytes.",
  ),
  find: L(
    "Fayl qidirish. -name andoza (*, ?), -type f yoki d.",
    "Find files. -name pattern (*, ?), -type f or d.",
  ),
  chmod: L(
    "Ruxsatlar: r=4, w=2, x=1. Faqat uch xonali sonli rejim.",
    "Permissions: r=4, w=2, x=1. Three-digit octal modes only.",
  ),
  whoami: L("Joriy foydalanuvchi nomi.", "Current username."),
  id: L(
    "Foydalanuvchi va guruh identifikatorlari.",
    "User and group identifiers.",
  ),
  uname: L(
    "Virtual tizim ma’lumoti. -a batafsil.",
    "Virtual system information. -a shows details.",
  ),
  hostname: L("Virtual kompyuter nomi.", "Virtual host name."),
  env: L("Muhit o‘zgaruvchilari ro‘yxati.", "List environment variables."),
  export: L(
    "NAME=value bilan o‘zgaruvchi o‘rnatish.",
    "Set a variable using NAME=value.",
  ),
  ps: L(
    "Uchta tayyor virtual jarayon holati.",
    "Inspect three predefined virtual processes.",
  ),
  kill: L(
    "PID 128 virtual worker jarayonini to‘xtatish.",
    "Stop the virtual worker with PID 128.",
  ),
  history: L(
    "Oxirgi 100 ta buyruq tarixi.",
    "History of the last 100 commands.",
  ),
  clear: L(
    "Terminal ekranini tozalash; fayllar saqlanadi.",
    "Clear the terminal display; files are preserved.",
  ),
  help: L(
    "Buyruqlar va qo‘llab-quvvatlanadigan sintaksis.",
    "Commands and supported syntax.",
  ),
  man: L(
    "Tanlangan buyruqning qisqa sintaksisi.",
    "Short syntax reference for a command.",
  ),
};
