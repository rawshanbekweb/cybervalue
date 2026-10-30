// Academy Intermediate · System security, module 1: Linux hardening. The
// lessons use ./tools.ts: a listing with risky permissions, and a server's
// listening services.
import type { CommonWidget, Lesson, Text } from "../anim-lab/types";

export type Widget = CommonWidget | { type: "perms" } | { type: "services" };

export const PROGRESS_KEY = "cybervalue:hardening:progress:v1";

const t = (uz: string, en: string): Text => ({ uz, en });

const FILES = t("Fayllar va huquqlar", "Files and rights");
const SERVER = t("Server", "The server");

export const LESSONS: Lesson<Widget>[] = [
  {
    id: 1,
    group: FILES,
    title: t("Hujum yuzasi", "Attack surface"),
    minutes: 5,
    intro: t(
      "Mustahkamlash (hardening) — tizimdan keraksiz hamma narsani olib tashlash va qolganini qattiq sozlash. Har bir ochiq port, o‘rnatilgan paket, foydalanuvchi hisobi va ortiqcha huquq — hujumchi uchun yana bitta eshik. Hujum yuzasi qancha kichik bo‘lsa, kuzatish va himoyalash shuncha oson.",
      "Hardening means removing everything a system doesn’t need and locking down what remains. Every open port, installed package, user account and extra permission is one more door for an attacker. The smaller the attack surface, the easier it is to watch and defend.",
    ),
    analogy: t(
      "Uyda ishlatilmaydigan eshik va derazalarni g‘isht bilan yopish.",
      "Bricking up the doors and windows of a house that nobody uses.",
    ),
    theory: [
      t(
        "Minimal o‘rnatish: serverga faqat vazifasi uchun kerak paketlarni qo‘ying.",
        "Minimal install: put only the packages a server’s job needs on it.",
      ),
    ],
    task: t(
      "Bu hujum yuzasini kamaytiradimi yoki oshiradimi?",
      "Does this shrink the attack surface or grow it?",
    ),
    hint: t("Kamroq narsa — kamroq eshik.", "Less running means fewer doors."),
    widget: {
      type: "sort",
      buckets: [
        { id: "less", label: t("Kamaytiradi", "Shrinks it") },
        { id: "more", label: t("Oshiradi", "Grows it") },
      ],
      items: [
        {
          label: t(
            "Ishlatilmaydigan FTP xizmatini o‘chirish",
            "Switching off an unused FTP service",
          ),
          bucket: "less",
        },
        {
          label: t(
            "Serverga “har ehtimolga” deb kompilyator va GUI o‘rnatish",
            "Installing a compiler and a desktop “just in case”",
          ),
          bucket: "more",
        },
        {
          label: t(
            "Ishdan ketgan xodim hisobini o‘chirish",
            "Removing a former employee’s account",
          ),
          bucket: "less",
        },
        {
          label: t(
            "Bazani 0.0.0.0 da tinglatish",
            "Making the database listen on 0.0.0.0",
          ),
          bucket: "more",
        },
        {
          label: t(
            "Firewall’da faqat 22 va 443 portlarini ochish",
            "Opening only ports 22 and 443 in the firewall",
          ),
          bucket: "less",
        },
      ],
    },
  },
  {
    id: 2,
    group: FILES,
    title: t("Huquqlarni o‘qish", "Reading permissions"),
    minutes: 6,
    intro: t(
      "`ls -l` dagi `-rwxr-x---` uchta uchlikdan iborat: egasi, guruh, boshqalar. r — o‘qish, w — yozish, x — bajarish. Maxsus bitlar ham bor: egasining x o‘rnidagi `s` — SUID (dastur egasi huquqi bilan ishlaydi, ko‘pincha root), boshqalarning x o‘rnidagi `t` — sticky bit (papkada faqat fayl egasi uni o‘chira oladi). Xavfli belgilar: muhim faylda boshqalar uchun `w`, va kutilmagan joydagi `s`.",
      "`-rwxr-x---` in `ls -l` is three triplets: owner, group, others. r is read, w write, x execute. There are special bits too: `s` in the owner’s x slot is SUID (the program runs with its owner’s rights, often root), and `t` in the others’ x slot is the sticky bit (in a directory, only a file’s owner may delete it). The warning signs: `w` for others on an important file, and an `s` where you didn’t expect one.",
    ),
    analogy: t(
      "Bino kalitlari: kimda qaysi xonaning kaliti bor — va bosh kalit kimga berilgan.",
      "A building’s keys: who has which room — and who was given the master key.",
    ),
    theory: [
      t(
        "`find / -perm -4000 -type f 2>/dev/null` — barcha SUID fayllar ro‘yxati.",
        "`find / -perm -4000 -type f 2>/dev/null` lists every SUID file.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t(
      "Oxirgi uchlik — hamma boshqalar.",
      "The last triplet is everyone else.",
    ),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "`-rw-rw-rw-` faylga kim yoza oladi?",
            "Who can write to a `-rw-rw-rw-` file?",
          ),
          options: [
            t("Tizimdagi har bir foydalanuvchi", "Every user on the system"),
            t("Faqat egasi", "Only the owner"),
            t("Faqat root", "Only root"),
          ],
          answer: 0,
          explain: t(
            "Oxirgi uchlikdagi w — “boshqalar” ham yozadi.",
            "The w in the last triplet lets “others” write too.",
          ),
        },
        {
          ask: t(
            "`-rwsr-xr-x root` dagi `s` nimani bildiradi?",
            "What does the `s` in `-rwsr-xr-x root` mean?",
          ),
          options: [
            t(
              "Dastur kim ishga tushirmasin, root huquqi bilan ishlaydi (SUID)",
              "The program runs as root whoever starts it (SUID)",
            ),
            t("Fayl shifrlangan", "The file is encrypted"),
            t("Fayl yashirin", "The file is hidden"),
          ],
          answer: 0,
          explain: t(
            "Shuning uchun keraksiz SUID — ruxsatni oshirish yo‘li.",
            "That’s why an unneeded SUID is a privilege escalation path.",
          ),
        },
      ],
    },
  },
  {
    id: 3,
    group: FILES,
    title: t("Xavfli huquqlarni topish", "Finding risky permissions"),
    minutes: 9,
    intro: t(
      "Quyida tekshiruv paytida olingan `ls -l` natijasi. Ba’zi g‘alati ko‘rinadigan huquqlar to‘g‘ri (passwd’dagi SUID, /tmp’dagi sticky bit), ba’zilari esa jiddiy xato. Har birini so‘rang: bu fayl nima qiladi va bu huquq kimga nima imkon beradi?",
      "Below is `ls -l` output from an audit. Some odd-looking permissions are correct (SUID on passwd, the sticky bit on /tmp); others are serious mistakes. Ask of each: what does this file do, and what does this permission let someone do?",
    ),
    analogy: t(
      "Mehmonxona inspektori: har bir eshik qulfini tekshiradi, lekin favqulodda chiqish ochiq bo‘lishi kerakligini biladi.",
      "A hotel inspector checks every lock, but knows the fire exit is meant to open.",
    ),
    theory: [
      t(
        "Root ishga tushiradigan har qanday faylni (cron, systemd, skriptlar) faqat root yoza olishi kerak.",
        "Anything root runs (cron jobs, systemd units, scripts) must be writable only by root.",
      ),
    ],
    task: t("Xavfli yozuvlarni belgilang.", "Tick the risky entries."),
    hint: t(
      "Uchtasi xavfli: parol xeshlari, qo‘lda qo‘shilgan SUID va root ishga tushiradigan fayl.",
      "Three are risky: password hashes, a hand-added SUID and a file root runs.",
    ),
    widget: { type: "perms" },
  },
  {
    id: 4,
    group: FILES,
    title: t("sudo va eng kam huquq", "sudo and least privilege"),
    minutes: 6,
    intro: t(
      "Har kuni root bo‘lib ishlamang: oddiy hisobdan ishlab, kerak paytda `sudo` ishlating — u kim nima qilganini `/var/log/auth.log` ga yozadi. `/etc/sudoers` (faqat `visudo` bilan tahrirlanadi) kimga nima ruxsatligini belgilaydi. Eng xavfli qator — `user ALL=(ALL) NOPASSWD: ALL`: hisob buzilsa, hujumchi parolsiz root bo‘ladi. Faqat kerakli buyruqlarga ruxsat bering va `sudo -l` bilan tekshiring.",
      "Don’t work as root every day: use an ordinary account and `sudo` when needed — it logs who did what to `/var/log/auth.log`. `/etc/sudoers` (edited only with `visudo`) says who may do what. The most dangerous line is `user ALL=(ALL) NOPASSWD: ALL`: if the account is compromised, the attacker is root without a password. Allow only the commands people need, and check with `sudo -l`.",
    ),
    analogy: t(
      "Bosh kalitni har kuni cho‘ntakda yurgizmaslik: faqat kerak bo‘lganda olib, jurnalga yozish.",
      "Not carrying the master key every day: sign it out only when needed.",
    ),
    theory: [
      t(
        "Ba’zi oddiy dasturlar (vim, find, less) sudo bilan berilsa, root shell ochadi — GTFOBins ro‘yxati.",
        "Some ordinary programs (vim, find, less) open a root shell when allowed through sudo — see GTFOBins.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t(
      "Kamroq ruxsat — kamroq zarar.",
      "Less permission means less damage.",
    ),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "sudoers’dagi qaysi qator eng xavfli?",
            "Which sudoers line is most dangerous?",
          ),
          options: [
            t(
              "deploy ALL=(ALL) NOPASSWD: ALL",
              "deploy ALL=(ALL) NOPASSWD: ALL",
            ),
            t(
              "deploy ALL=(root) /usr/bin/systemctl restart app",
              "deploy ALL=(root) /usr/bin/systemctl restart app",
            ),
            t("%admin ALL=(ALL) ALL", "%admin ALL=(ALL) ALL"),
          ],
          answer: 0,
          explain: t(
            "Hamma narsa, parolsiz — hisob buzilsa, darhol root.",
            "Everything, without a password — compromise the account and you are root.",
          ),
        },
        {
          ask: t(
            "Foydalanuvchiga sudo orqali nimalar ruxsat ekanini qanday ko‘rasiz?",
            "How do you see what a user may run through sudo?",
          ),
          options: [
            t("sudo -l", "sudo -l"),
            t("ls /root", "ls /root"),
            t("whoami", "whoami"),
          ],
          answer: 0,
          explain: t(
            "Pentester ham birinchi shu buyruqni yozadi.",
            "It’s the first command a pentester types too.",
          ),
        },
      ],
    },
  },
  {
    id: 5,
    group: SERVER,
    title: t("Tinglayotgan xizmatlar", "Listening services"),
    minutes: 9,
    intro: t(
      "`sudo ss -tlnp` serverdagi har bir tinglayotgan xizmatni ko‘rsatadi. `0.0.0.0` — barcha tarmoqlardan, internetdan ham; `127.0.0.1` — faqat shu serverning o‘zidan. Bu server HTTPS orqali sayt beradi va SSH bilan boshqariladi. Har bir xizmat uchun hal qiling: ochiq qoladimi, faqat localhost’dami yoki umuman o‘chiriladimi?",
      "`sudo ss -tlnp` shows every listening service on a server. `0.0.0.0` means every network, the internet included; `127.0.0.1` means only from the server itself. This server serves a site over HTTPS and is managed over SSH. Decide for each service: does it stay public, move to localhost, or go off altogether?",
    ),
    analogy: t(
      "Do‘kon: peshtaxta mijozlarga ochiq, ombor faqat xodimlarga, eski yopiq eshik — g‘isht bilan.",
      "A shop: the counter is open to customers, the stockroom to staff, the old side door bricked up.",
    ),
    theory: [
      t(
        "O‘chirish: `sudo systemctl disable --now telnet.socket`; localhost: sozlamada `bind-address = 127.0.0.1`.",
        "Switch off: `sudo systemctl disable --now telnet.socket`; localhost: `bind-address = 127.0.0.1` in its config.",
      ),
    ],
    task: t(
      "Har bir xizmat uchun qaror tanlang.",
      "Choose what happens to each service.",
    ),
    hint: t(
      "Internetga faqat sayt va boshqaruv kerak.",
      "The internet needs only the site and the way in to manage it.",
    ),
    widget: { type: "services" },
  },
  {
    id: 6,
    group: SERVER,
    title: t("SSH’ni mustahkamlash", "Hardening SSH"),
    minutes: 6,
    intro: t(
      "SSH — serverning asosiy eshigi, shuning uchun internetdagi botlar unga kun bo‘yi parol taxmin qilib uriladi. `/etc/ssh/sshd_config` dagi asosiy sozlamalar: `PermitRootLogin no` (root to‘g‘ridan-to‘g‘ri kira olmaydi), `PasswordAuthentication no` (faqat kalit bilan), `AllowUsers` (faqat ro‘yxatdagilar). fail2ban ko‘p xato urinishdan keyin IP manzilni bloklaydi. O‘zgartirishdan oldin ikkinchi sessiyani ochiq qoldiring — o‘zingizni tashqarida qoldirib qo‘ymang.",
      "SSH is a server’s main door, so bots on the internet hammer it with password guesses all day. The key settings in `/etc/ssh/sshd_config`: `PermitRootLogin no` (root can’t log in directly), `PasswordAuthentication no` (keys only), `AllowUsers` (only those listed). fail2ban blocks an IP after repeated failures. Keep a second session open while you change it — don’t lock yourself out.",
    ),
    analogy: t(
      "Asosiy eshikka kod qulf o‘rniga elektron kalit va kuzatuv kamerasi.",
      "Swapping a keypad on the front door for a key card and a camera.",
    ),
    theory: [
      t(
        "O‘zgartirishdan keyin `sudo sshd -t` sozlamani tekshiradi, keyin `systemctl reload ssh`.",
        "After a change, `sudo sshd -t` checks the config; then `systemctl reload ssh`.",
      ),
    ],
    task: t(
      "Bu sozlama SSH’ni mustahkamlaydimi yoki zaiflashtiradimi?",
      "Does this setting harden SSH or weaken it?",
    ),
    hint: t(
      "Root va parollar — bot uchun eng oson nishon.",
      "Root and passwords are the bots’ easiest targets.",
    ),
    widget: {
      type: "sort",
      buckets: [
        { id: "good", label: t("Mustahkamlaydi", "Hardens it") },
        { id: "bad", label: t("Zaiflashtiradi", "Weakens it") },
      ],
      items: [
        {
          label: t("PermitRootLogin no", "PermitRootLogin no"),
          bucket: "good",
        },
        {
          label: t("PasswordAuthentication yes", "PasswordAuthentication yes"),
          bucket: "bad",
        },
        {
          label: t("AllowUsers ali deploy", "AllowUsers ali deploy"),
          bucket: "good",
        },
        {
          label: t("PermitEmptyPasswords yes", "PermitEmptyPasswords yes"),
          bucket: "bad",
        },
        {
          label: t(
            "fail2ban: 5 xatodan keyin 1 soat blok",
            "fail2ban: a one-hour ban after 5 failures",
          ),
          bucket: "good",
        },
      ],
    },
  },
  {
    id: 7,
    group: SERVER,
    title: t("Yangilanish, firewall va loglar", "Updates, firewall and logs"),
    minutes: 6,
    intro: t(
      "Uchta odat mustahkamlashni yakunlaydi. Yangilanishlar: xavfsizlik tuzatishlari avtomatik o‘rnatiladi (`unattended-upgrades`), kernel uchun qayta yuklash rejalashtiriladi. Firewall: sukut bo‘yicha hammasi yopiq, faqat kerakli portlar ochiladi (`ufw default deny incoming`, `ufw allow 22,443/tcp`). Loglar: `journalctl` va `/var/log/auth.log` saqlanadi va iloji bo‘lsa boshqa serverga yuboriladi — hujumchi o‘z izini o‘chira olmasligi uchun.",
      "Three habits finish the job. Updates: security fixes install automatically (`unattended-upgrades`), with reboots planned for the kernel. Firewall: everything closed by default, only the needed ports opened (`ufw default deny incoming`, `ufw allow 22,443/tcp`). Logs: `journalctl` and `/var/log/auth.log` are kept and, where possible, shipped to another server — so an attacker can’t erase their tracks.",
    ),
    analogy: t(
      "Uyni ta’mirlash, darvozani yopish va kuzatuv yozuvini boshqa joyda saqlash.",
      "Repairing the house, shutting the gate and keeping the camera footage somewhere else.",
    ),
    theory: [
      t(
        "Firewall xizmatni o‘chirish o‘rnini bosmaydi: ikkalasi — ikki qatlam.",
        "A firewall doesn’t replace switching a service off: they are two layers.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t("Sukut bo‘yicha — rad etish.", "Deny by default."),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Firewall uchun to‘g‘ri boshlang‘ich siyosat?",
            "The right starting policy for a firewall?",
          ),
          options: [
            t(
              "Kiruvchi hammasi yopiq, keraklilari ochiladi",
              "Deny all incoming, then open what is needed",
            ),
            t(
              "Hammasi ochiq, xavflilari yopiladi",
              "Allow everything, then close what is risky",
            ),
            t("Firewall kerak emas", "No firewall at all"),
          ],
          answer: 0,
          explain: t(
            "Unutilgan port shunda ham yopiq qoladi.",
            "That way a forgotten port stays closed.",
          ),
        },
        {
          ask: t(
            "Nega loglar boshqa serverga yuboriladi?",
            "Why ship logs to another server?",
          ),
          options: [
            t(
              "Serverni egallagan hujumchi ularni o‘chira olmasligi uchun",
              "So an attacker who owns the server can’t delete them",
            ),
            t("Disk tezroq ishlashi uchun", "To make the disk faster"),
            t("Bu shart emas", "There’s no reason"),
          ],
          answer: 0,
          explain: t(
            "Tergov uchun loglar — eng muhim dalil.",
            "Logs are the key evidence in an investigation.",
          ),
        },
      ],
    },
  },
  {
    id: 8,
    group: SERVER,
    title: t("Yakuniy savollar", "Final questions"),
    minutes: 6,
    intro: t(
      "Mustahkamlash bir martalik ish emas: yangi paket, yangi foydalanuvchi va har bir “vaqtincha” o‘zgarish tizimni asl holatidan uzoqlashtiradi. Shuning uchun tekshiruvlar muntazam takrorlanadi — buni “Yangilanish va bazaviy sozlamalar” modulida avtomatlashtiramiz.",
      "Hardening isn’t a one-off: every new package, new user and “temporary” change moves a system away from where it started. That is why checks are repeated regularly — the “Patching and baselines” module automates that.",
    ),
    analogy: t(
      "Bog‘: bir marta tozalash yetmaydi, o‘t yana o‘sadi.",
      "A garden: weeding once isn’t enough; the weeds grow back.",
    ),
    theory: [
      t(
        "Lynis kabi vositalar tizimni avtomatik tekshirib, tavsiyalar beradi.",
        "Tools such as Lynis audit a system automatically and suggest fixes.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t("Kamroq, qattiqroq, kuzatiladigan.", "Less, tighter, watched."),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Root har kuni ishga tushiradigan skript `-rwxrwxrwx`. Xavf?",
            "A script root runs daily is `-rwxrwxrwx`. The risk?",
          ),
          options: [
            t(
              "Har kim unga buyruq qo‘shib, root bo‘lib bajartira oladi",
              "Anyone can add a command to it and have root run it",
            ),
            t("Skript sekinlashadi", "The script gets slower"),
            t("Xavf yo‘q", "No risk"),
          ],
          answer: 0,
          explain: t(
            "To‘g‘ri huquq: `chmod 755` va egasi root.",
            "The right mode is `chmod 755`, owned by root.",
          ),
        },
        {
          ask: t(
            "Redis 0.0.0.0:6379 da parolsiz tinglayapti. Birinchi qadam?",
            "Redis listens on 0.0.0.0:6379 with no password. The first step?",
          ),
          options: [
            t("Uni 127.0.0.1 ga bog‘lash", "Bind it to 127.0.0.1"),
            t("Portni 6380 ga o‘zgartirish", "Move it to port 6380"),
            t("Hech narsa", "Nothing"),
          ],
          answer: 0,
          explain: t(
            "Port almashtirish yashirish, himoya emas.",
            "Changing the port hides it; it doesn’t protect it.",
          ),
        },
      ],
    },
  },
];
