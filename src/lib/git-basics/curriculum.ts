// Academy · Git & GitHub: version control from the first commit to pull
// requests and keeping secrets out of history. Animated lessons on the
// shared widgets (../anim-lab/types) plus the lab's own pretend terminal,
// which runs the in-browser Git in ./sim and draws the commit graph.
import {
  restoreLessons,
  type CommonWidget,
  type Figure,
  type Lesson,
  type Text,
} from "../anim-lab/types";
import { ancestors, emptyState, fileStatus, runAll, type State } from "./sim";

/** One command typed in the terminal and what it printed. */
export type Entry = { command: string; output: string[]; error: string | null };
export type Log = { state: State; entries: Entry[] };
export type Goal = { label: Text; check: (log: Log) => boolean };

export type Widget =
  | CommonWidget
  | {
      type: "git";
      /** The state the terminal starts from. */
      start: State;
      goals: Goal[];
      /** Commands to suggest under the terminal. */
      tips: string[];
    };

export const PROGRESS_KEY = "cybervalue:git:progress:v1";

const t = (uz: string, en: string): Text => ({ uz, en });

const BASICS = t("Git asoslari", "Git basics");
const BRANCHES = t("Tarmoqlar (branch)", "Branches");
const GITHUB = t("GitHub va jamoa", "GitHub and teamwork");
const SAFE = t("Xavfsiz ishlash", "Working safely");

// --- Goal helpers ----------------------------------------------------------------

const typed = (log: Log, pattern: RegExp) =>
  log.entries.some((e) => !e.error && pattern.test(e.command.trim()));
const head = (s: State) =>
  s.repo ? (s.repo.branches[s.repo.head] ?? null) : null;
const commitCount = (s: State) =>
  s.repo ? ancestors(s.repo.commits, head(s)).size : 0;
const clean = (s: State) => {
  if (!s.repo || s.merging) return false;
  const f = fileStatus(s);
  return !f.staged.length && !f.unstaged.length && !f.untracked.length;
};

// --- Pictures (real screenshots, see docs/git-lab.md for how they were made) ---

const fig = (
  file: string,
  width: number,
  height: number,
  alt: Text,
  caption: Text,
  credit?: string,
): Figure => ({
  src: `/lessons/git/${file}`,
  width,
  height,
  alt,
  caption,
  credit,
});

const SCM_HOME = fig(
  "scm-home.webp",
  1920,
  1230,
  t("git-scm.com sayti bosh sahifasi", "The home page of git-scm.com"),
  t(
    "Git’ning rasmiy sayti git-scm.com: o‘rnatish fayllari, bepul “Pro Git” kitobi va hujjatlar shu yerda.",
    "Git’s official site, git-scm.com: installers, the free “Pro Git” book and the reference are here.",
  ),
  "Skrinshot: git-scm.com",
);
const TERM_FIRST = fig(
  "terminal-first.webp",
  1668,
  1086,
  t(
    "Terminalda git init, status, add va commit",
    "git init, status, add and commit in a terminal",
  ),
  t(
    "Haqiqiy Git 2.43 natijasi: avval fayl “Untracked”, git add va git commit’dan keyin esa “working tree clean”.",
    "Real Git 2.43 output: the file is first “Untracked”; after git add and git commit the tree is “clean”.",
  ),
);
const TERM_DIFF = fig(
  "terminal-diff.webp",
  1668,
  638,
  t(
    "git diff natijasi: qizil va yashil qatorlar",
    "git diff output: red and green lines",
  ),
  t(
    "git diff: “−” bilan boshlangan qizil qatorlar o‘chirilgan, “+” bilan boshlangan yashil qatorlar qo‘shilgan.",
    "git diff: red lines starting with “−” were removed, green lines starting with “+” were added.",
  ),
);
const TERM_SECRET = fig(
  "terminal-secret.webp",
  1668,
  592,
  t(
    "git show eski commitdagi .env faylini ko‘rsatmoqda",
    "git show printing .env from an old commit",
  ),
  t(
    ".env oxirgi commitda o‘chirilgan, lekin git show HEAD~1:.env uni tarixdan baribir chiqarib beradi. Tarix hech narsani unutmaydi.",
    ".env was removed in the last commit, yet git show HEAD~1:.env still prints it from history. History forgets nothing.",
  ),
);
const SCM_BRANCHING = fig(
  "scm-branching.webp",
  1920,
  1350,
  t(
    "Pro Git kitobidagi commit va daraxt sxemasi",
    "The commit and tree diagram from the Pro Git book",
  ),
  t(
    "Har bir commit butun loyihaning surati (snapshot) va oldingi commitga ko‘rsatkich. Tarmoq — shunchaki commitga ko‘rsatkich.",
    "Each commit is a snapshot of the whole project plus a pointer to the commit before. A branch is just a pointer to a commit.",
  ),
  "“Pro Git”, Scott Chacon va Ben Straub, CC BY-NC-SA 3.0 — git-scm.com/book",
);
const TERM_GRAPH = fig(
  "terminal-graph.webp",
  1668,
  592,
  t(
    "git log --graph: ikki tarmoq va merge",
    "git log --graph: two branches and a merge",
  ),
  t(
    "git log --oneline --graph --all: “login” tarmog‘i ajralib chiqib, keyin main’ga qo‘shilgan (Merge branch 'login').",
    "git log --oneline --graph --all: the “login” branch split off and later joined main (Merge branch 'login').",
  ),
);
const TERM_CONFLICT = fig(
  "terminal-conflict.webp",
  1668,
  1086,
  t(
    "Merge konflikti va <<<<<<< belgilari",
    "A merge conflict and the <<<<<<< markers",
  ),
  t(
    "Ikki tarmoq bir qatorni turlicha o‘zgartirdi. Git ikkala variantni <<<<<<<, ======= va >>>>>>> orasiga yozib, tanlovni sizga qoldiradi.",
    "Two branches changed the same line differently. Git writes both between <<<<<<<, ======= and >>>>>>> and lets you choose.",
  ),
);

// --- Starting states ----------------------------------------------------------------

const SITE = [
  "git init",
  'echo "<h1>Mening saytim</h1>" > index.html',
  "git add .",
  'git commit -m "Birinchi sahifa"',
  'echo "body { font-family: sans-serif; }" > style.css',
  "git add .",
  'git commit -m "Dizayn qo‘shildi"',
];

const PORTFOLIO = "https://github.com/ali/portfolio.git";
const TEAM = "https://github.com/cybervalue/jamoa-loyiha.git";

/** A local repo on an older commit while a teammate pushed a newer one. */
function teamStart(): State {
  const vali = runAll(
    [
      "git init",
      'echo "# Jamoa loyihasi" > README.md',
      'echo "Vazifalar:" > TODO.txt',
      "git add .",
      'git commit -m "Loyiha boshlandi"',
      `git remote add origin ${TEAM}`,
      "git push -u origin main",
    ],
    emptyState({ user: { name: "Vali", email: "vali@example.uz" } }),
  );
  const ali = runAll(
    [`git clone ${TEAM}`],
    emptyState({ github: vali.github }),
  );
  const later = runAll(
    [
      'echo "- Kirish sahifasi (Vali)" >> TODO.txt',
      'git commit -am "Vali: vazifa qo‘shdi"',
      "git push",
    ],
    vali,
  );
  // Ali's clone sees the newer GitHub, but has not pulled yet.
  return { ...ali, github: later.github, origin: later.github[TEAM] };
}

// --- Lessons ------------------------------------------------------------------------

export const LESSONS: Lesson<Widget>[] = [
  {
    id: 1,
    group: BASICS,
    title: t("Git nima va GitHub nima?", "What Git is, and what GitHub is"),
    minutes: 6,
    intro: t(
      "Dasturchilar kodni “yakuniy.zip”, “yakuniy2.zip”, “yakuniy-rostdan.zip” deb saqlamaydi. Ular Git ishlatadi: har bir o‘zgarish tarixda saqlanadi va istalgan vaqtga qaytish mumkin.",
      "Developers do not save code as “final.zip”, “final2.zip”, “final-really.zip”. They use Git: every change is kept in history and you can go back to any moment.",
    ),
    analogy: t(
      "Git — o‘yindagi “saqlash nuqtalari”. Har bir commit — saqlash nuqtasi: xato qilsangiz, oldingi nuqtadan davom etasiz. GitHub esa bu saqlashlarni bulutda saqlaydigan va do‘stlaringiz bilan ulashadigan joy.",
      "Git is a game’s save points. Each commit is a save point: make a mistake and you carry on from the one before. GitHub is the place that keeps those saves in the cloud and shares them with friends.",
    ),
    theory: [
      t(
        "Git — versiyalarni boshqarish tizimi (VCS). Uni 2005-yilda Linus Torvalds Linux yadrosi ustida ishlash uchun yaratgan. Git sizning kompyuteringizda ishlaydi va internet talab qilmaydi.",
        "Git is a version control system (VCS). Linus Torvalds created it in 2005 to work on the Linux kernel. Git runs on your computer and needs no internet.",
      ),
      t(
        "GitHub — Git repozitoriylarini saqlaydigan veb-xizmat. U yerda kodni ulashasiz, jamoa bilan Pull Request orqali ishlaysiz, xatolarni “Issue”larda muhokama qilasiz. GitLab va Bitbucket — shunga o‘xshash xizmatlar.",
        "GitHub is a web service that hosts Git repositories. There you share code, work with a team through pull requests and discuss bugs in issues. GitLab and Bitbucket are similar services.",
      ),
      t(
        "Repozitoriy (repo) — loyiha papkasi va uning butun tarixi. Tarix yashirin .git papkasida turadi.",
        "A repository (repo) is a project folder plus its whole history. The history lives in the hidden .git folder.",
      ),
      t(
        "Kiberxavfsizlikda Git hamma joyda: xavfsizlik vositalari GitHub’da tarqatiladi, hujum qoidalari (masalan, Sigma) Git’da saqlanadi, sizib chiqqan parollar esa ko‘pincha aynan Git tarixidan topiladi.",
        "In cybersecurity Git is everywhere: security tools ship on GitHub, detection rules (such as Sigma) live in Git, and leaked passwords are often found in Git history.",
      ),
    ],
    figures: [SCM_HOME],
    task: t(
      "Har bir ishni to‘g‘ri joyga qo‘ying: Git o‘zi (kompyuteringizda) qiladimi yoki GitHub xizmati (internetda)?",
      "Put each job in the right place: does Git do it on its own (on your computer) or the GitHub service (online)?",
    ),
    hint: t(
      "Internet kerak bo‘lmasa — Git. Boshqa odamlar bilan veb-sahifada ishlash — GitHub.",
      "If no internet is needed — Git. Working with other people on a website — GitHub.",
    ),
    widget: {
      type: "sort",
      buckets: [
        { id: "git", label: t("Git (kompyuterda)", "Git (on your computer)") },
        { id: "hub", label: t("GitHub (internetda)", "GitHub (online)") },
      ],
      items: [
        { label: t("Commit qilish", "Making a commit"), bucket: "git" },
        {
          label: t("Tarixni ko‘rish (git log)", "Viewing history (git log)"),
          bucket: "git",
        },
        {
          label: t("Yangi tarmoq (branch) ochish", "Creating a branch"),
          bucket: "git",
        },
        { label: t("Internetsiz ishlash", "Working offline"), bucket: "git" },
        {
          label: t("Pull Request ochish", "Opening a pull request"),
          bucket: "hub",
        },
        {
          label: t(
            "Issue (xato haqida xabar) yozish",
            "Writing an issue (bug report)",
          ),
          bucket: "hub",
        },
        {
          label: t(
            "Kodni brauzerda boshqalarga ko‘rsatish",
            "Showing code to others in a browser",
          ),
          bucket: "hub",
        },
        {
          label: t("Loyihani “fork” qilish", "Forking a project"),
          bucket: "hub",
        },
      ],
    },
  },
  {
    id: 2,
    group: BASICS,
    title: t(
      "Birinchi repozitoriy: config, init, status",
      "Your first repository: config, init, status",
    ),
    minutes: 7,
    intro: t(
      "Git’dan birinchi foydalanishda u sizni tanishi kerak: har bir commit muallifi yoziladi. Keyin papkani repozitoriyga aylantiramiz.",
      "The first time you use Git it needs to know you: every commit records its author. Then we turn a folder into a repository.",
    ),
    analogy: t(
      "git config — daftaringizning muqovasiga ismingizni yozish. git init — oddiy papkaga “tarix daftari”ni qo‘yish. git status — “hozir nima o‘zgardi?” deb so‘rash.",
      "git config is writing your name on the notebook’s cover. git init is putting a “history notebook” into an ordinary folder. git status asks “what has changed?”.",
    ),
    theory: [
      t(
        'git config --global user.name "Ism" va git config --global user.email "pochta" — bir marta sozlanadi. --global bu kompyuterdagi barcha loyihalar uchun degani.',
        'git config --global user.name "Name" and git config --global user.email "mail" — set once. --global means for every project on this computer.',
      ),
      t(
        "git init joriy papkada yashirin .git papkasini yaratadi. Shundan boshlab papka — repozitoriy. Uni o‘chirib yubormang: tarix aynan o‘sha yerda.",
        "git init creates a hidden .git folder in the current folder. From then on the folder is a repository. Do not delete it: the history is right there.",
      ),
      t(
        "git status — eng ko‘p ishlatiladigan buyruq. U qaysi tarmoqda turganingizni, qaysi fayllar o‘zgarganini va keyingi qadam nima ekanini aytadi. Ikkilanganda — git status.",
        "git status is the command you will use most. It tells you which branch you are on, which files changed and what to do next. When in doubt — git status.",
      ),
    ],
    figures: [TERM_FIRST],
    task: t(
      "Ismingiz va emailingizni sozlang, repozitoriy yarating va holatini tekshiring.",
      "Set your name and email, create a repository and check its status.",
    ),
    hint: t(
      'git config --global user.name "Ali" → git config --global user.email "ali@example.uz" → git init → git status',
      'git config --global user.name "Ali" → git config --global user.email "ali@example.uz" → git init → git status',
    ),
    widget: {
      type: "git",
      start: emptyState({
        user: null,
        files: { "index.html": "<h1>Salom</h1>\n" },
      }),
      tips: [
        'git config --global user.name "Ali"',
        "git init",
        "git status",
        "ls -a",
      ],
      goals: [
        {
          label: t(
            "Ismingizni sozlang (user.name)",
            "Set your name (user.name)",
          ),
          check: (l) => Boolean(l.state.user?.name),
        },
        {
          label: t(
            "Emailingizni sozlang (user.email)",
            "Set your email (user.email)",
          ),
          check: (l) => Boolean(l.state.user?.email),
        },
        {
          label: t(
            "git init bilan repozitoriy yarating",
            "Create a repository with git init",
          ),
          check: (l) => Boolean(l.state.repo),
        },
        {
          label: t(
            "git status bilan holatni ko‘ring",
            "Look at the state with git status",
          ),
          check: (l) => Boolean(l.state.repo) && typed(l, /^git status/),
        },
      ],
    },
  },
  {
    id: 3,
    group: BASICS,
    title: t("Uch hudud: add va commit", "The three areas: add and commit"),
    minutes: 8,
    intro: t(
      "Git’da fayl uch joyda bo‘ladi: ishchi papka, staging (index) va repozitoriy. git add faylni tayyorlaydi, git commit esa uni tarixga muhrlaydi.",
      "In Git a file lives in three places: the working folder, the staging area (index) and the repository. git add prepares a file, git commit seals it into history.",
    ),
    analogy: t(
      "Fotosuratchi: ishchi papka — studiya, staging — kamera oldiga chiqqan odamlar, commit — tushirilgan surat. Kimni suratga olishni (add) o‘zingiz tanlaysiz, so‘ng “chiq” (commit).",
      "A photographer: the working folder is the studio, staging is the people stepping in front of the camera, a commit is the photo taken. You choose who is in the picture (add), then click (commit).",
    ),
    theory: [
      t(
        "git add fayl.txt — bitta faylni staging’ga qo‘shadi. git add . — barcha o‘zgargan fayllarni. git restore --staged fayl.txt — staging’dan qaytarib oladi.",
        "git add file.txt adds one file to staging. git add . adds every changed file. git restore --staged file.txt takes it back out.",
      ),
      t(
        'git commit -m "xabar" — staging’dagi hamma narsadan surat (snapshot) oladi. Har bir commit’ning noyob identifikatori (hash) bo‘ladi, masalan 7a93e07.',
        'git commit -m "message" takes a snapshot of everything staged. Every commit gets a unique id (hash), for example 7a93e07.',
      ),
      t(
        "Yaxshi commit xabari nima qilinganini qisqa aytadi: “Kirish formasi qo‘shildi”, “Parol tekshiruvi tuzatildi”. Yomoni: “o‘zgarish”, “asdf”, “tayyor”.",
        "A good commit message says briefly what was done: “Add login form”, “Fix password check”. A bad one: “changes”, “asdf”, “done”.",
      ),
      t(
        "Rangli panel uchta hududni ko‘rsatadi: har bir buyruqdan keyin fayl qayerga ko‘chganini kuzating.",
        "The coloured panel shows the three areas: watch where a file moves after each command.",
      ),
    ],
    task: t(
      "index.html va style.css fayllarini staging’ga qo‘shing va ma’noli xabar bilan commit qiling. Oxirida ishchi papka toza bo‘lsin.",
      "Stage index.html and style.css and commit them with a meaningful message. The working folder should end up clean.",
    ),
    hint: t(
      'git add index.html style.css → git commit -m "Sayt sahifasi" → git status',
      'git add index.html style.css → git commit -m "Site page" → git status',
    ),
    widget: {
      type: "git",
      start: runAll(
        ["git init"],
        emptyState({
          files: {
            "index.html": "<h1>Mening saytim</h1>\n",
            "style.css": "h1 { color: green; }\n",
          },
        }),
      ),
      tips: [
        "git status",
        "git add index.html",
        "git add .",
        'git commit -m "Sayt sahifasi"',
      ],
      goals: [
        {
          label: t(
            "Ikkala faylni staging’ga qo‘shing (git add)",
            "Stage both files (git add)",
          ),
          check: (l) => typed(l, /^git add/),
        },
        {
          label: t(
            "Kamida 2 so‘zli xabar bilan commit qiling",
            "Commit with a message of at least two words",
          ),
          check: (l) =>
            commitCount(l.state) >= 1 &&
            l.state.repo!.commits[head(l.state)!].message.trim().split(/\s+/)
              .length >= 2,
        },
        {
          label: t(
            "Ikkala fayl ham commit ichida bo‘lsin",
            "Both files are in the commit",
          ),
          check: (l) => {
            const h = head(l.state);
            return (
              Boolean(h) &&
              ["index.html", "style.css"].every(
                (f) => f in l.state.repo!.commits[h!].tree,
              )
            );
          },
        },
        {
          label: t(
            "Ishchi papka toza (working tree clean)",
            "The working tree is clean",
          ),
          check: (l) => commitCount(l.state) >= 1 && clean(l.state),
        },
      ],
    },
  },
  {
    id: 4,
    group: BASICS,
    title: t("Tarix: log, diff va show", "History: log, diff and show"),
    minutes: 7,
    intro: t(
      "Commit qilish yarmi xolos. Git’ning kuchi — tarixni o‘qishda: kim, qachon, nimani o‘zgartirgan.",
      "Committing is only half of it. Git’s power is reading history: who changed what, and when.",
    ),
    analogy: t(
      "git log — kundalik sahifalarini varaqlash. git diff — ikki sahifani yonma-yon qo‘yib, farqini qizil va yashil ruchka bilan belgilash.",
      "git log is leafing through a diary. git diff is putting two pages side by side and marking the difference in red and green pen.",
    ),
    theory: [
      t(
        "git log — commitlar ro‘yxati (eng yangisi tepada). git log --oneline — har biri bitta qatorda. git log -p — har bir commitdagi o‘zgarish bilan.",
        "git log lists commits (newest first). git log --oneline puts each on one line. git log -p shows each commit’s changes too.",
      ),
      t(
        "git diff — hali staging’ga qo‘shilmagan o‘zgarishlar. git diff --staged — staging’dagi, commit qilinishi kutilayotgan o‘zgarishlar.",
        "git diff shows changes not yet staged. git diff --staged shows staged changes waiting to be committed.",
      ),
      t(
        "git show <hash> — bitta commit: muallif, xabar va aynan nima o‘zgargani. Xavfsizlik tekshiruvida (code review, incident) aynan shu buyruqlar bilan “kim nima qilgan”ni aniqlashadi.",
        "git show <hash> shows one commit: author, message and exactly what changed. Security reviews and incident work use exactly these commands to find out who did what.",
      ),
    ],
    figures: [TERM_DIFF],
    task: t(
      "index.html faylga yangi qator qo‘shing, o‘zgarishni git diff bilan ko‘ring, commit qiling va tarixni git log --oneline bilan chiqaring.",
      "Add a line to index.html, look at the change with git diff, commit it and print the history with git log --oneline.",
    ),
    hint: t(
      'echo "<p>Men haqimda</p>" >> index.html → git diff → git commit -am "Men haqimda bo‘limi" → git log --oneline',
      'echo "<p>About me</p>" >> index.html → git diff → git commit -am "About section" → git log --oneline',
    ),
    widget: {
      type: "git",
      start: runAll(SITE),
      tips: [
        'echo "<p>Men haqimda</p>" >> index.html',
        "git diff",
        'git commit -am "..."',
        "git log --oneline",
        "git show",
      ],
      goals: [
        {
          label: t("index.html faylni o‘zgartiring", "Change index.html"),
          check: (l) =>
            l.entries.some((e) =>
              /^echo .*>>?\s*index\.html/.test(e.command.trim()),
            ),
        },
        {
          label: t(
            "git diff bilan farqni ko‘ring",
            "See the difference with git diff",
          ),
          check: (l) =>
            l.entries.some(
              (e) =>
                /^git diff/.test(e.command.trim()) &&
                e.output.some((o) => o.startsWith("+")),
            ),
        },
        {
          label: t(
            "O‘zgarishni commit qiling (3 ta commit bo‘lsin)",
            "Commit the change (three commits in all)",
          ),
          check: (l) => commitCount(l.state) >= 3,
        },
        {
          label: t(
            "git log --oneline bilan tarixni chiqaring",
            "Print the history with git log --oneline",
          ),
          check: (l) => commitCount(l.state) >= 3 && typed(l, /^git log/),
        },
      ],
    },
  },
  {
    id: 5,
    group: BASICS,
    title: t(
      ".gitignore: sirlarni repozitoriyga qo‘ymang",
      ".gitignore: keep secrets out of the repository",
    ),
    minutes: 8,
    intro: t(
      "Har kuni GitHub’da minglab parol va API kalitlari tasodifan e’lon qilinadi. Botlar ularni bir necha daqiqada topadi. Eng yaxshi himoya — sirni umuman commit qilmaslik.",
      "Every day thousands of passwords and API keys are published on GitHub by accident. Bots find them within minutes. The best defence is never to commit the secret at all.",
    ),
    analogy: t(
      ".gitignore — eshik oldidagi qo‘riqchi ro‘yxati: “.env, parollar.txt va *.log ichkariga kirmaydi”. Ro‘yxatdagilarni git add . ko‘rmaydi ham.",
      ".gitignore is the guard’s list at the door: “.env, passwords.txt and *.log stay out”. git add . does not even see what is on the list.",
    ),
    theory: [
      t(
        ".gitignore — loyiha ildizidagi oddiy matnli fayl. Har bir qator — e’tiborsiz qoldiriladigan nom yoki naqsh: .env, *.log, node_modules/.",
        ".gitignore is a plain text file at the project root. Each line is a name or pattern to ignore: .env, *.log, node_modules/.",
      ),
      t(
        "Sirlar (parol, token, kalit) .env kabi faylda saqlanadi va .gitignore’ga yoziladi. Kodda esa faqat o‘zgaruvchi nomi qoladi.",
        "Secrets (passwords, tokens, keys) go in a file such as .env, listed in .gitignore. The code only keeps the variable’s name.",
      ),
      t(
        "Muhim: agar sir bir marta commit qilingan bo‘lsa, faylni o‘chirish yetmaydi — u tarixda qoladi (rasmga qarang). To‘g‘ri yo‘l: kalitni darhol bekor qilib, yangisini olish (rotate). Tarixni tozalash — qo‘shimcha chora xolos.",
        "Important: once a secret is committed, deleting the file is not enough — it stays in history (see the picture). The right move is to revoke the key at once and issue a new one (rotate). Cleaning history is only an extra step.",
      ),
    ],
    figures: [TERM_SECRET],
    task: t(
      "Loyihada .env faylida parol bor. .gitignore yarating va unga .env yozing, so‘ng qolgan fayllarni commit qiling. .env hech qaysi commitga tushmasin.",
      "The project has a password in .env. Create .gitignore with .env in it, then commit the rest. .env must not end up in any commit.",
    ),
    hint: t(
      'echo ".env" > .gitignore → git status (.env yo‘qoldi!) → git add . → git commit -m "Loyiha, sirlarsiz"',
      'echo ".env" > .gitignore → git status (.env is gone!) → git add . → git commit -m "Project, no secrets"',
    ),
    widget: {
      type: "git",
      start: runAll(
        ["git init"],
        emptyState({
          files: {
            "app.py": 'import os\nparol = os.environ["DB_PAROL"]\n',
            ".env": "DB_PAROL=Juda-maxfiy-2026\n",
            "README.md": "# Do‘kon ilovasi\n",
          },
        }),
      ),
      tips: [
        'echo ".env" > .gitignore',
        "git status",
        "git add .",
        'git commit -m "..."',
        "cat .gitignore",
      ],
      goals: [
        {
          label: t(".gitignore ichida .env bo‘lsin", ".gitignore lists .env"),
          check: (l) =>
            (l.state.files[".gitignore"] ?? "")
              .split("\n")
              .some((x) => x.trim() === ".env"),
        },
        {
          label: t(
            "app.py va .gitignore commit qilingan",
            "app.py and .gitignore are committed",
          ),
          check: (l) => {
            const h = head(l.state);
            return (
              Boolean(h) &&
              ["app.py", ".gitignore"].every(
                (f) => f in l.state.repo!.commits[h!].tree,
              )
            );
          },
        },
        {
          label: t(".env hech qaysi commitda yo‘q", ".env is in no commit"),
          check: (l) =>
            commitCount(l.state) >= 1 &&
            Object.values(l.state.repo!.commits).every(
              (c) => !(".env" in c.tree),
            ),
        },
      ],
    },
  },
  {
    id: 6,
    group: BRANCHES,
    title: t(
      "Tarmoq (branch): xavfsiz tajriba maydoni",
      "Branches: a safe place to experiment",
    ),
    minutes: 8,
    intro: t(
      "Yangi funksiya ustida ishlayotganda ishlab turgan saytni buzib qo‘ymaslik kerak. Buning uchun alohida tarmoq ochiladi.",
      "While building a new feature you must not break the working site. So you open a separate branch.",
    ),
    analogy: t(
      "Tarmoq — kitobning qoralama nusxasi. Asl kitob (main) tegmasdan qoladi, siz nusxada bemalol yozasiz. Natija yoqsa — asl kitobga qo‘shasiz, yoqmasa — tashlab yuborasiz.",
      "A branch is a draft copy of a book. The original (main) stays untouched while you write freely in the copy. Like the result — add it to the book; don’t — throw it away.",
    ),
    theory: [
      t(
        "Tarmoq — commitga ko‘rsatuvchi nom, xolos. Shuning uchun Git’da tarmoq ochish bir zumda bo‘ladi. Asosiy tarmoq odatda main (eskiroq loyihalarda master) deb ataladi.",
        "A branch is just a name pointing at a commit, so creating one in Git is instant. The main branch is usually called main (master in older projects).",
      ),
      t(
        "git branch — tarmoqlar ro‘yxati (* — hozirgisi). git switch -c login — “login” tarmog‘ini yaratib, unga o‘tish. git switch main — main’ga qaytish. Eski usul: git checkout -b login.",
        "git branch lists branches (* marks the current one). git switch -c login creates “login” and moves onto it. git switch main goes back. The older way: git checkout -b login.",
      ),
      t(
        "HEAD — “hozir qayerdaman” degan ko‘rsatkich. Tarmoqni almashtirsangiz, Git ishchi papkadagi fayllarni o‘sha tarmoq holatiga keltiradi: boshqa tarmoqdagi fayl vaqtincha “yo‘qoladi”.",
        "HEAD is the “where am I now” pointer. Switch branches and Git rewrites the working folder to that branch: a file from another branch “disappears” for a while.",
      ),
    ],
    figures: [SCM_BRANCHING],
    task: t(
      "“login” tarmog‘ini oching, unda login.html yarating va commit qiling. Keyin main’ga qayting va login.html yo‘qligiga ishonch hosil qiling.",
      "Create a “login” branch, add login.html there and commit it. Then go back to main and see that login.html is gone.",
    ),
    hint: t(
      'git switch -c login → echo "<form>" > login.html → git add . → git commit -m "Kirish sahifasi" → git switch main → ls',
      'git switch -c login → echo "<form>" > login.html → git add . → git commit -m "Login page" → git switch main → ls',
    ),
    widget: {
      type: "git",
      start: runAll(SITE),
      tips: [
        "git branch",
        "git switch -c login",
        'echo "<form>" > login.html',
        "git switch main",
        "ls",
      ],
      goals: [
        {
          label: t("“login” tarmog‘ini yarating", "Create the “login” branch"),
          check: (l) => Boolean(l.state.repo?.branches.login),
        },
        {
          label: t(
            "login tarmog‘ida login.html bilan commit",
            "A commit with login.html on login",
          ),
          check: (l) => {
            const b = l.state.repo?.branches.login;
            return Boolean(b) && "login.html" in l.state.repo!.commits[b!].tree;
          },
        },
        {
          label: t(
            "main’ga qayting (login.html ko‘rinmaydi)",
            "Back on main (login.html not there)",
          ),
          check: (l) =>
            l.state.repo?.head === "main" &&
            !("login.html" in l.state.files) &&
            Boolean(
              l.state.repo?.branches.login &&
              "login.html" in
                l.state.repo.commits[l.state.repo.branches.login].tree,
            ),
        },
      ],
    },
  },
  {
    id: 7,
    group: BRANCHES,
    title: t("Merge: tarmoqlarni birlashtirish", "Merge: joining branches"),
    minutes: 8,
    intro: t(
      "Tarmoqdagi ish tayyor bo‘lgach, uni main’ga qo‘shamiz. Git ikki xil birlashtiradi: fast-forward va merge commit.",
      "When the work on a branch is ready we bring it into main. Git joins branches in two ways: fast-forward and a merge commit.",
    ),
    analogy: t(
      "Fast-forward — main shunchaki oldinga “sakraydi”, chunki yo‘lda boshqa o‘zgarish yo‘q. Merge commit — ikki yo‘l chorrahada uchrashadi va Git ularni bog‘laydigan yangi tugun yasaydi.",
      "Fast-forward: main simply “jumps” ahead because nothing else happened on the way. A merge commit: two roads meet at a crossroads and Git builds a new knot that joins them.",
    ),
    theory: [
      t(
        "Birlashtirish doim “qabul qiladigan” tarmoqdan qilinadi: avval git switch main, keyin git merge dizayn.",
        "You always merge from the receiving branch: first git switch main, then git merge design.",
      ),
      t(
        "Agar main’da tarmoq ochilgandan beri yangi commit bo‘lmasa — fast-forward: yangi commit yaratilmaydi. Agar ikkalasida ham commit bo‘lsa — Git ikki ota-onali (parent) “Merge branch …” commitini yaratadi.",
        "If main has no new commits since the branch started — fast-forward: no new commit is made. If both have commits — Git makes a “Merge branch …” commit with two parents.",
      ),
      t(
        "Grafikda kuzating: merge commitdan ikkita chiziq chiqadi. Birlashtirilgan tarmoqni git branch -d dizayn bilan o‘chirish mumkin — commitlar main’da qoladi.",
        "Watch the graph: two lines leave a merge commit. A merged branch can be deleted with git branch -d design — its commits stay in main.",
      ),
    ],
    figures: [TERM_GRAPH],
    task: t(
      "main’ga avval “dizayn” tarmog‘ini (fast-forward), so‘ng “footer” tarmog‘ini (merge commit) qo‘shing.",
      "Merge the “dizayn” branch into main (fast-forward), then the “footer” branch (a merge commit).",
    ),
    hint: t(
      "git switch main → git merge dizayn → git merge footer → git log --oneline",
      "git switch main → git merge dizayn → git merge footer → git log --oneline",
    ),
    widget: {
      type: "git",
      start: runAll([
        "git init",
        'echo "<h1>Sayt</h1>" > index.html',
        "git add .",
        'git commit -m "Birinchi sahifa"',
        "git switch -c footer",
        'echo "<footer>2026</footer>" > footer.html',
        "git add .",
        'git commit -m "Footer qo‘shildi"',
        "git switch main",
        "git switch -c dizayn",
        'echo "h1 { color: teal; }" > style.css',
        "git add .",
        'git commit -m "Ranglar"',
        'echo "body { margin: 0; }" >> style.css',
        'git commit -am "Chekkalar"',
        "git switch main",
      ]),
      tips: [
        "git branch",
        "git merge dizayn",
        "git merge footer",
        "git log --oneline",
      ],
      goals: [
        {
          label: t(
            "dizayn main’ga qo‘shildi (style.css bor)",
            "dizayn merged into main (style.css there)",
          ),
          check: (l) => {
            const h = head(l.state);
            return (
              l.state.repo?.head === "main" &&
              Boolean(h) &&
              "style.css" in l.state.repo!.commits[h!].tree
            );
          },
        },
        {
          label: t(
            "footer main’ga qo‘shildi (footer.html bor)",
            "footer merged into main (footer.html there)",
          ),
          check: (l) => {
            const h = head(l.state);
            return (
              l.state.repo?.head === "main" &&
              Boolean(h) &&
              "footer.html" in l.state.repo!.commits[h!].tree
            );
          },
        },
        {
          label: t(
            "main’da ikki ota-onali merge commit bor",
            "main has a merge commit with two parents",
          ),
          check: (l) =>
            Boolean(l.state.repo) &&
            [...ancestors(l.state.repo!.commits, head(l.state))].some(
              (id) => l.state.repo!.commits[id].parents.length === 2,
            ),
        },
      ],
    },
  },
  {
    id: 8,
    group: BRANCHES,
    title: t("Merge konfliktini hal qilish", "Resolving a merge conflict"),
    minutes: 9,
    intro: t(
      "Ikki tarmoq bitta faylning bitta qatorini turlicha o‘zgartirsa, Git qaysi biri to‘g‘ri ekanini bilmaydi. Bu konflikt — xato emas, savol.",
      "When two branches change the same line of the same file differently, Git cannot know which is right. That is a conflict — not an error, a question.",
    ),
    analogy: t(
      "Ikki muharrir bitta jumlani ikki xil tahrir qildi. Bosh muharrir (siz) ikkalasini o‘qib, yakuniy variantni yozadi.",
      "Two editors rewrote the same sentence differently. The chief editor (you) reads both and writes the final version.",
    ),
    theory: [
      t(
        "Konfliktda Git faylga ikkala variantni yozadi: <<<<<<< HEAD dan ======= gacha — sizning tarmog‘ingiz, ======= dan >>>>>>> gacha — qo‘shilayotgan tarmoq.",
        "In a conflict Git writes both versions into the file: from <<<<<<< HEAD to ======= is your branch, from ======= to >>>>>>> is the branch being merged.",
      ),
      t(
        "Hal qilish: faylni ochib, to‘g‘ri variantni qoldirasiz va belgilarni (<<<<<<<, =======, >>>>>>>) o‘chirasiz. Keyin git add fayl va git commit.",
        "To resolve: open the file, keep the right version and delete the markers (<<<<<<<, =======, >>>>>>>). Then git add the file and git commit.",
      ),
      t(
        "Qo‘rqmang: git merge --abort hamma narsani merge’dan oldingi holatga qaytaradi. Ko‘p konflikt bo‘lmasligi uchun tez-tez commit va pull qiling, tarmoqlarni uzoq ushlamang.",
        "Do not panic: git merge --abort puts everything back as it was before the merge. To avoid conflicts commit and pull often, and do not keep branches open for long.",
      ),
    ],
    figures: [TERM_CONFLICT],
    task: t(
      "“chegirma” tarmog‘ini main’ga qo‘shing. Konflikt chiqadi: narx.txt’ni yakuniy narx bilan qayta yozing (belgilarsiz), so‘ng add va commit qiling.",
      "Merge the “chegirma” branch into main. A conflict appears: rewrite narx.txt with the final price (no markers), then add and commit.",
    ),
    hint: t(
      'git merge chegirma → cat narx.txt → echo "Narx: 90 000 so‘m" > narx.txt → git add narx.txt → git commit -m "Narx kelishildi"',
      'git merge chegirma → cat narx.txt → echo "Narx: 90 000 so‘m" > narx.txt → git add narx.txt → git commit -m "Agree the price"',
    ),
    widget: {
      type: "git",
      start: runAll([
        "git init",
        'echo "Narx: 100 000 so‘m" > narx.txt',
        "git add .",
        'git commit -m "Narx"',
        "git switch -c chegirma",
        'echo "Narx: 80 000 so‘m" > narx.txt',
        'git commit -am "Chegirma"',
        "git switch main",
        'echo "Narx: 120 000 so‘m" > narx.txt',
        'git commit -am "Narx oshdi"',
      ]),
      tips: [
        "git merge chegirma",
        "cat narx.txt",
        'echo "Narx: 90 000 so‘m" > narx.txt',
        "git add narx.txt",
        "git merge --abort",
      ],
      goals: [
        {
          label: t(
            "Merge’ni boshlang — konflikt chiqadi",
            "Start the merge — a conflict appears",
          ),
          check: (l) =>
            l.entries.some(
              (e) =>
                /^git merge chegirma/.test(e.command.trim()) &&
                Boolean(e.error),
            ),
        },
        {
          label: t(
            "narx.txt’dan belgilarni olib tashlang",
            "Remove the markers from narx.txt",
          ),
          check: (l) =>
            l.entries.some((e) => Boolean(e.error)) &&
            !/<<<<<<<|>>>>>>>|=======/.test(l.state.files["narx.txt"] ?? "<"),
        },
        {
          label: t(
            "Merge commit bilan yakunlang",
            "Finish with a merge commit",
          ),
          check: (l) =>
            !l.state.merging &&
            l.state.repo!.commits[head(l.state)!].parents.length === 2,
        },
      ],
    },
  },
  {
    id: 9,
    group: GITHUB,
    title: t(
      "GitHub’ga yuklash: remote va push",
      "Publishing to GitHub: remote and push",
    ),
    minutes: 8,
    intro: t(
      "Kompyuteringizdagi repozitoriyni GitHub’dagi bo‘sh repozitoriyga bog‘laymiz va commitlarni yuboramiz.",
      "We connect the repository on your computer to an empty one on GitHub and send the commits up.",
    ),
    analogy: t(
      "Remote — bulutdagi zaxira nusxaning manzili. git push — “saqlashlarimni bulutga yubor”. Endi kompyuter buzilsa ham loyiha yo‘qolmaydi.",
      "A remote is the address of the backup in the cloud. git push means “send my saves to the cloud”. Now even if the computer breaks, the project survives.",
    ),
    theory: [
      t(
        "GitHub’da “New repository” bosib bo‘sh repozitoriy ochasiz. Uning manzili shunday bo‘ladi: https://github.com/ali/portfolio.git",
        "On GitHub you press “New repository” to create an empty one. Its address looks like https://github.com/ali/portfolio.git",
      ),
      t(
        "git remote add origin <manzil> — manzilni “origin” nomi bilan saqlaydi. git push -u origin main — main tarmog‘ini yuboradi va bog‘lab qo‘yadi; keyingi safar shunchaki git push yetadi.",
        "git remote add origin <address> saves the address under the name “origin”. git push -u origin main sends main and links it; next time plain git push is enough.",
      ),
      t(
        "Kirish: GitHub endi parolni qabul qilmaydi. HTTPS uchun shaxsiy token (Personal Access Token) yoki SSH kalit ishlatiladi. Tokeningizni hech qachon kodga yozmang va hech kimga bermang.",
        "Signing in: GitHub no longer accepts passwords. HTTPS uses a Personal Access Token, or you use an SSH key. Never put your token in code and never share it.",
      ),
    ],
    task: t(
      "Portfolio repozitoriyingizni GitHub’dagi bo‘sh repozitoriyga bog‘lang va main tarmog‘ini yuboring.",
      "Connect your portfolio repository to the empty one on GitHub and push the main branch.",
    ),
    hint: t(
      `git remote add origin ${PORTFOLIO} → git remote -v → git push -u origin main → git status`,
      `git remote add origin ${PORTFOLIO} → git remote -v → git push -u origin main → git status`,
    ),
    widget: {
      type: "git",
      start: {
        ...runAll(SITE),
        github: { [PORTFOLIO]: { url: PORTFOLIO, commits: {}, branches: {} } },
      },
      tips: [
        `git remote add origin ${PORTFOLIO}`,
        "git remote -v",
        "git push -u origin main",
        "git status",
      ],
      goals: [
        {
          label: t("origin manzilini qo‘shing", "Add the origin address"),
          check: (l) => l.state.origin?.url === PORTFOLIO,
        },
        {
          label: t("main GitHub’ga yuborildi", "main is pushed to GitHub"),
          check: (l) =>
            Boolean(l.state.origin) &&
            l.state.origin!.branches.main === head(l.state),
        },
        {
          label: t(
            "git status: “up to date with 'origin/main'”",
            "git status: “up to date with 'origin/main'”",
          ),
          check: (l) =>
            l.entries.some(
              (e) =>
                /^git status/.test(e.command.trim()) &&
                e.output.some((o) =>
                  o.includes("up to date with 'origin/main'"),
                ),
            ),
        },
      ],
    },
  },
  {
    id: 10,
    group: GITHUB,
    title: t(
      "Jamoada ishlash: clone, pull, push",
      "Working in a team: clone, pull, push",
    ),
    minutes: 9,
    intro: t(
      "Jamoadoshingiz Vali GitHub’ga yangi commit yubordi. Siz o‘z ishingizni yuborishdan oldin uning o‘zgarishini olishingiz kerak — aks holda Git push’ni rad etadi.",
      "Your teammate Vali pushed a new commit to GitHub. Before you push your own work you must take his change — otherwise Git rejects your push.",
    ),
    analogy: t(
      "Umumiy Google hujjatiga o‘xshaydi, lekin “avtosaqlash”siz: git pull — boshqalarning o‘zgarishini olish, git push — o‘zingiznikini yuborish. Avval olasiz, keyin yuborasiz.",
      "Like a shared document without autosave: git pull takes the others’ changes, git push sends yours. Take first, then send.",
    ),
    theory: [
      t(
        "git clone <manzil> — GitHub’dagi repozitoriyni butun tarixi bilan kompyuterga ko‘chiradi va origin’ni avtomatik sozlaydi.",
        "git clone <address> copies a GitHub repository with all its history to your computer and sets up origin for you.",
      ),
      t(
        "git pull = git fetch (yangiliklarni olish) + git merge (o‘zingiznikiga qo‘shish). git status sizni GitHub’dan oldinda (ahead) yoki ortda (behind) ekaningizni aytadi.",
        "git pull = git fetch (get what is new) + git merge (join it with yours). git status says whether you are ahead of or behind GitHub.",
      ),
      t(
        "“rejected … (fetch first)” — GitHub’da sizda yo‘q commit bor degani. Yechim: git pull, kerak bo‘lsa konfliktni hal qilish, so‘ng git push. Hech qachon boshqalarning ishini “git push --force” bilan o‘chirib yubormang.",
        "“rejected … (fetch first)” means GitHub has a commit you do not. The fix: git pull, resolve any conflict, then git push. Never wipe other people’s work with “git push --force”.",
      ),
    ],
    task: t(
      "Avval Vali’ning o‘zgarishini oling (pull). Keyin TODO.txt’ga o‘z vazifangizni qo‘shing, commit qiling va GitHub’ga yuboring.",
      "First take Vali’s change (pull). Then add your own task to TODO.txt, commit it and push to GitHub.",
    ),
    hint: t(
      'git status → git pull → cat TODO.txt → echo "- Dizayn (Ali)" >> TODO.txt → git commit -am "Ali: vazifa" → git push',
      'git status → git pull → cat TODO.txt → echo "- Design (Ali)" >> TODO.txt → git commit -am "Ali: task" → git push',
    ),
    widget: {
      type: "git",
      start: teamStart(),
      tips: [
        "git status",
        "git fetch",
        "git pull",
        "cat TODO.txt",
        'git commit -am "..."',
        "git push",
      ],
      goals: [
        {
          label: t(
            "Vali’ning commitini oling (pull)",
            "Take Vali’s commit (pull)",
          ),
          check: (l) => (l.state.files["TODO.txt"] ?? "").includes("Vali"),
        },
        {
          label: t(
            "TODO.txt’ga o‘z vazifangizni qo‘shib commit qiling",
            "Add your task to TODO.txt and commit",
          ),
          check: (l) => {
            const h = head(l.state);
            return (
              Boolean(h) &&
              l.state.repo!.commits[h!].author === "Ali" &&
              (l.state.repo!.commits[h!].tree["TODO.txt"] ?? "")
                .split("\n")
                .filter(Boolean).length >= 3
            );
          },
        },
        {
          label: t("GitHub’ga yuboring (push)", "Push to GitHub"),
          check: (l) =>
            Boolean(l.state.origin) &&
            l.state.origin!.branches.main === head(l.state) &&
            l.state.repo!.commits[head(l.state)!].author === "Ali",
        },
      ],
    },
  },
  {
    id: 11,
    group: GITHUB,
    title: t("Fork va Pull Request", "Fork and pull request"),
    minutes: 7,
    intro: t(
      "Begona loyihaga (masalan, ochiq kodli xavfsizlik vositasiga) to‘g‘ridan-to‘g‘ri yozish huquqingiz yo‘q. Lekin hissa qo‘shishingiz mumkin: fork va Pull Request orqali.",
      "You cannot write straight into someone else’s project (an open-source security tool, say). But you can contribute: through a fork and a pull request.",
    ),
    analogy: t(
      "Fork — kutubxonadagi kitobning shaxsiy nusxasi. Unda tuzatish kiritasiz va muallifga “men shu xatoni tuzatdim, qo‘shib qo‘yasizmi?” deb xat yozasiz. O‘sha xat — Pull Request.",
      "A fork is your own copy of a library book. You fix something in it and write to the author: “I fixed this mistake, will you add it?” That letter is the pull request.",
    ),
    theory: [
      t(
        "Fork — GitHub’dagi tugma: begona repozitoriyning sizning akkauntingizdagi nusxasini yaratadi. Siz fork’ni clone qilasiz, yangi tarmoqda ishlaysiz va fork’ga push qilasiz.",
        "Fork is a GitHub button: it makes a copy of someone’s repository in your account. You clone your fork, work on a new branch and push to the fork.",
      ),
      t(
        "Pull Request (PR) — “mening tarmog‘imni sizning main’ingizga qo‘shing” degan so‘rov. PR sahifasida o‘zgarishlar ko‘rinadi, avtomatik testlar (CI) ishlaydi, egasi izoh yozadi.",
        "A pull request (PR) asks: “please merge my branch into your main”. The PR page shows the changes, automatic tests (CI) run and the owner comments.",
      ),
      t(
        "Code review — xavfsizlik uchun juda muhim: ikkinchi ko‘z SQL injection, maxfiy kalit yoki xavfli o‘zgarishni o‘tkazib yubormaydi. Jamoalarda main himoyalanadi (branch protection): ko‘rib chiqilmagan kod qo‘shilmaydi.",
        "Code review matters a lot for security: a second pair of eyes catches an SQL injection, a secret key or a risky change. Teams protect main (branch protection): unreviewed code is not merged.",
      ),
    ],
    task: t(
      "Pull Request yo‘lini oxirigacha kuzating: fork’dan to merge’gacha.",
      "Follow a pull request all the way: from fork to merge.",
    ),
    hint: t(
      "Har bir qadamni o‘qing: kim kimga nima yuborayapti?",
      "Read each step: who is sending what to whom?",
    ),
    widget: {
      type: "sequence",
      actors: [
        {
          id: "you",
          label: t("Siz (kompyuter)", "You (computer)"),
          icon: "laptop",
        },
        {
          id: "fork",
          label: t("Sizning fork’ingiz", "Your fork"),
          icon: "globe",
        },
        {
          id: "orig",
          label: t("Asl loyiha", "Original project"),
          icon: "server",
        },
        { id: "owner", label: t("Loyiha egasi", "Maintainer"), icon: "user" },
      ],
      steps: [
        {
          from: "orig",
          to: "fork",
          label: "Fork",
          detail: t(
            "GitHub’da “Fork” tugmasi: asl loyihaning nusxasi akkauntingizda paydo bo‘ladi.",
            "The “Fork” button on GitHub: a copy of the project appears in your account.",
          ),
        },
        {
          from: "fork",
          to: "you",
          label: "git clone",
          detail: t(
            "Fork’ni kompyuteringizga ko‘chirasiz.",
            "You copy your fork to your computer.",
          ),
        },
        {
          from: "you",
          to: "you",
          label: "git switch -c fix-typo",
          detail: t(
            "Yangi tarmoq ochib, tuzatish kiritasiz va commit qilasiz.",
            "You open a new branch, make the fix and commit it.",
          ),
        },
        {
          from: "you",
          to: "fork",
          label: "git push",
          detail: t(
            "Tarmog‘ingizni o‘z fork’ingizga yuborasiz.",
            "You push your branch to your fork.",
          ),
        },
        {
          from: "fork",
          to: "orig",
          label: "Pull Request",
          detail: t(
            "“fix-typo tarmog‘imni main’ga qo‘shing” degan so‘rov ochasiz.",
            "You open a request: “please merge my fix-typo branch into main”.",
          ),
        },
        {
          from: "orig",
          to: "owner",
          label: "Review + CI",
          detail: t(
            "Testlar avtomatik ishlaydi, egasi kodni ko‘rib izoh yozadi.",
            "Tests run automatically; the maintainer reviews the code and comments.",
          ),
          tone: "plain",
        },
        {
          from: "owner",
          to: "orig",
          label: "Merge ✓",
          detail: t(
            "Hammasi joyida — PR main’ga qo‘shildi. Siz ochiq kodga hissa qo‘shdingiz!",
            "All good — the PR is merged into main. You contributed to open source!",
          ),
          tone: "ok",
        },
      ],
    },
  },
  {
    id: 12,
    group: SAFE,
    title: t("Git va GitHub xavfsizligi", "Git and GitHub security"),
    minutes: 7,
    intro: t(
      "Repozitoriy — hujumchilar uchun xazina: parollar, kalitlar, ichki manzillar. Keling, eng muhim himoya qoidalarini mustahkamlaymiz.",
      "A repository is a treasure for attackers: passwords, keys, internal addresses. Let’s lock in the most important rules.",
    ),
    analogy: t(
      "Ochiq (public) repozitoriy — ko‘chadagi e’lonlar taxtasi: unga yopishtirilgan har narsani butun dunyo o‘qiydi, olib tashlasangiz ham kimdir allaqachon suratga olgan bo‘ladi.",
      "A public repository is a notice board on the street: the whole world reads what you pin on it, and even if you take it down someone has already photographed it.",
    ),
    theory: [
      t(
        "Sir commit qilinsa: 1) kalitni darhol bekor qiling va yangisini oling, 2) keyin tarixdan tozalang (git filter-repo yoki BFG), 3) nima bo‘lganini jamoaga xabar qiling. Faqat faylni o‘chirish — yechim emas.",
        "If a secret is committed: 1) revoke the key at once and issue a new one, 2) then clean it from history (git filter-repo or BFG), 3) tell the team what happened. Just deleting the file is not a fix.",
      ),
      t(
        "GitHub akkauntida ikki bosqichli autentifikatsiya (2FA) yoqing. Token va SSH kalitlarga eng kam huquq bering va muddat qo‘ying.",
        "Turn on two-factor authentication (2FA) on your GitHub account. Give tokens and SSH keys the least access needed and an expiry date.",
      ),
      t(
        "GitHub’ning Secret scanning va Push protection funksiyalari tanish kalit formatlarini push vaqtida to‘xtatadi. Dependabot esa kutubxonalardagi zaifliklar haqida ogohlantiradi.",
        "GitHub’s secret scanning and push protection stop known key formats at push time. Dependabot warns about vulnerable libraries.",
      ),
      t(
        "Imzolangan commitlar (GPG yoki SSH imzo) commit aynan sizdan ekanini isbotlaydi: Git’da user.name’ni istalgan odam istalgan ismga o‘zgartira oladi!",
        "Signed commits (a GPG or SSH signature) prove a commit really is yours: in Git anyone can set user.name to any name!",
      ),
    ],
    task: t(
      "Bilimingizni sinang: barcha savollarga to‘g‘ri javob bering.",
      "Test what you know: answer every question correctly.",
    ),
    hint: t(
      "Eslang: tarix unutmaydi, kalit sizsa — avval bekor qilinadi.",
      "Remember: history never forgets; a leaked key is revoked first.",
    ),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Siz .env faylini parol bilan GitHub’ga push qildingiz va 5 daqiqadan keyin buni sezdingiz. Birinchi qadam?",
            "You pushed .env with a password to GitHub and noticed five minutes later. The first step?",
          ),
          options: [
            t(
              "Parolni darhol almashtirish (kalitni bekor qilish)",
              "Change the password at once (revoke the key)",
            ),
            t(
              ".env ni o‘chirib, yangi commit qilish",
              "Delete .env and make a new commit",
            ),
            t("Repozitoriy nomini o‘zgartirish", "Rename the repository"),
            t(
              "Hech narsa — 5 daqiqada hech kim ko‘rmaydi",
              "Nothing — nobody sees it in five minutes",
            ),
          ],
          answer: 0,
          explain: t(
            "Botlar ochiq repozitoriylarni soniyalar ichida skanerlaydi. Fayl o‘chirilsa ham u tarixda qoladi, shuning uchun avval sirni yaroqsiz qilish kerak.",
            "Bots scan public repositories within seconds. Even a deleted file stays in history, so the secret must first be made useless.",
          ),
        },
        {
          ask: t(
            "Qaysi fayl .gitignore’ga yozilishi kerak?",
            "Which file belongs in .gitignore?",
          ),
          options: [
            t("README.md", "README.md"),
            t(".env", ".env"),
            t("index.html", "index.html"),
            t(".gitignore", ".gitignore"),
          ],
          answer: 1,
          explain: t(
            ".env — sirlar fayli. README, kod va .gitignore’ning o‘zi esa commit qilinadi.",
            ".env holds secrets. README, the code and .gitignore itself are committed.",
          ),
        },
        {
          ask: t(
            "Nima uchun commitlarni imzolash (GPG/SSH) foydali?",
            "Why is signing commits (GPG/SSH) useful?",
          ),
          options: [
            t("Commit tezroq yuklanadi", "Commits upload faster"),
            t(
              "Commit muallifini soxtalashtirib bo‘lmaydi",
              "A commit’s author cannot be faked",
            ),
            t(
              "Kod avtomatik shifrlanadi",
              "The code is encrypted automatically",
            ),
            t("Konfliktlar yo‘qoladi", "Conflicts disappear"),
          ],
          answer: 1,
          explain: t(
            "git config user.name’ni har kim xohlagancha yoza oladi. Imzo esa faqat sizning kalitingiz bilan qo‘yiladi va GitHub uni “Verified” deb belgilaydi.",
            "Anyone can set git config user.name to anything. A signature is made only with your key, and GitHub marks it “Verified”.",
          ),
        },
        {
          ask: t(
            "GitHub’da HTTPS orqali push qilish uchun nima ishlatiladi?",
            "What do you use to push to GitHub over HTTPS?",
          ),
          options: [
            t("Akkaunt paroli", "Your account password"),
            t("Shaxsiy kirish tokeni (PAT)", "A personal access token (PAT)"),
            t("Email manzil", "Your email address"),
            t("Hech narsa", "Nothing"),
          ],
          answer: 1,
          explain: t(
            "GitHub 2021-yildan beri Git uchun parolni qabul qilmaydi. Token yoki SSH kalit kerak — ularni kodga yozmang.",
            "Since 2021 GitHub no longer accepts passwords for Git. You need a token or an SSH key — never put them in code.",
          ),
        },
        {
          ask: t(
            "Jamoada main tarmog‘ini himoyalash (branch protection) nima beradi?",
            "What does protecting the main branch give a team?",
          ),
          options: [
            t(
              "Kod ko‘rib chiqilmasdan va testlarsiz main’ga tushmaydi",
              "No code reaches main without review and tests",
            ),
            t("main tarmog‘i yashirin bo‘ladi", "main becomes hidden"),
            t("Commitlar o‘chib ketmaydi", "Commits never disappear"),
            t("Repozitoriy bepul bo‘ladi", "The repository becomes free"),
          ],
          answer: 0,
          explain: t(
            "Branch protection Pull Request, review va yashil testlarni majburiy qiladi — bitta odamning xatosi yoki buzilgan akkaunt to‘g‘ridan-to‘g‘ri production’ga o‘tmaydi.",
            "Branch protection requires a pull request, a review and green tests — one person’s mistake or a hijacked account cannot go straight to production.",
          ),
        },
      ],
    },
  },
];

export const restoreProgress = (raw: unknown) => restoreLessons(raw, LESSONS);
