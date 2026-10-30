// Never import from client components: the explanations give the answers
// away. The full explanation shown under each question once the
// teacher approves a result. Each one says why the answer is right, why the
// tempting wrong answers are wrong, and where the idea is used in practice.
import type { Text } from "../anim-lab/types";

const t = (uz: string, en: string): Text => ({ uz, en });

export const EXPLANATIONS: Record<string, Text> = {
  // --- Linux ---------------------------------------------------------------------------
  l1: t(
    "`pwd` — print working directory: terminal hozir qaysi papkada turganini to‘liq (absolyut) yo‘l bilan chiqaradi, masalan `/home/ali/docs`. Nisbiy yo‘llar (`./file`, `../x`) aynan shu papkadan hisoblanadi, shuning uchun skript yoki buyruq «fayl topilmadi» desa, birinchi navbatda `pwd` bilan qayerda turganingizni tekshiring. Fayllar ro‘yxatini `ls`, jarayonlarni `ps`, parolni `passwd` ko‘rsatadi/o‘zgartiradi.",
    "`pwd` (print working directory) prints the full, absolute path of the directory the shell is in, e.g. `/home/ali/docs`. Relative paths (`./file`, `../x`) are resolved from this directory, so when a script or command says “file not found”, checking where you are with `pwd` is the first step. Listing files is `ls`, processes are `ps`, and changing a password is `passwd`.",
  ),
  l2: t(
    "`ls` faqat nomlarni chiqaradi. `-l` (long) har bir faylni bitta qatorda batafsil ko‘rsatadi: huquqlar, havolalar soni, egasi, guruhi, hajmi va o‘zgarish sanasi. `-a` (all) nuqta bilan boshlanadigan yashirin fayllarni ham (`.bashrc`, `.ssh`, `.env`) qo‘shadi. Bayroqlarni birlashtirish mumkin: `ls -la` = `ls -l -a`. Xavfsizlik tekshiruvida `.ssh` yoki `.env` kabi yashirin fayllar ko‘pincha eng muhim topilma bo‘ladi. `dir -h` Linuxda bunday ma’noga ega emas.",
    "Plain `ls` prints names only. `-l` (long) shows one detailed line per file: permissions, link count, owner, group, size and modification time. `-a` (all) also includes hidden files whose names start with a dot (`.bashrc`, `.ssh`, `.env`). Flags combine: `ls -la` is `ls -l -a`. In a security review, hidden files such as `.ssh` or `.env` are often the most important find. `dir -h` doesn’t mean this on Linux.",
  ),
  l3: t(
    "`..` har doim joriy papkaning ota (bir daraja yuqori) papkasini bildiradi, `.` esa joriy papkaning o‘zini. `/home/ali/docs` dan `cd ..` sizni `/home/ali` ga olib chiqadi. Ikki daraja yuqoriga `cd ../..`, uy papkasiga `cd` yoki `cd ~`, ildizga `cd /`, oldingi papkaga `cd -` qaytaradi. `/home` ga borish uchun ikki marta yuqoriga chiqish kerak bo‘lardi.",
    "`..` always means the parent of the current directory (one level up), and `.` the current directory itself. From `/home/ali/docs`, `cd ..` takes you to `/home/ali`. Two levels up is `cd ../..`, home is `cd` or `cd ~`, the root is `cd /`, and `cd -` returns to the previous directory. Reaching `/home` would take two steps up.",
  ),
  l4: t(
    "`mkdir` odatda faqat oxirgi papkani yaratadi va yo‘ldagi biror papka yo‘q bo‘lsa «No such file or directory» xatosini beradi. `-p` (parents) yo‘ldagi barcha yetishmayotgan oraliq papkalarni (`loyiha`, `loyiha/src`) ham yaratadi, papka allaqachon bor bo‘lsa esa xato bermaydi. Shu sababli skriptlarda `mkdir -p` xavfsiz va qayta-qayta ishga tushirsa bo‘ladigan usul hisoblanadi. Huquqlar `-m` bilan yoki `chmod` bilan beriladi, yashirin papka esa nomi nuqta bilan boshlanadi.",
    "`mkdir` normally creates only the last directory and fails with “No such file or directory” if a parent on the path is missing. `-p` (parents) creates every missing intermediate directory (`loyiha`, `loyiha/src`) and doesn’t complain if the directory already exists. That’s why scripts use `mkdir -p`: it is safe to run again and again. Permissions are set with `-m` or `chmod`; a hidden directory is just one whose name starts with a dot.",
  ),
  l5: t(
    "`cat` (concatenate) fayl mazmunini standart chiqishga — terminalga — yozadi. Bir nechta faylni ketma-ket ham chiqaradi: `cat a.txt b.txt > ikkalasi.txt` ularni birlashtiradi. Uzun fayllar uchun `less` qulayroq (sahifalab o‘qish), boshi va oxiri uchun `head` va `tail`. Faylni `rm` o‘chiradi, `mv` qayta nomlaydi, `touch` bo‘sh fayl yaratadi.",
    "`cat` (concatenate) writes a file’s contents to standard output — the terminal. It can print several files in a row too: `cat a.txt b.txt > both.txt` joins them. For long files `less` is handier (page by page), and `head` and `tail` show the start and the end. `rm` deletes a file, `mv` renames it and `touch` creates an empty one.",
  ),
  l6: t(
    "`cp` sukut bo‘yicha faqat fayllarni nusxalaydi; papka berilsa «omitting directory» deb uni o‘tkazib yuboradi. `-r` (recursive) papkaning ichiga kirib, barcha fayl va ichki papkalarni ham nusxalaydi. Zaxira nusxa olishda ko‘pincha `cp -a` ishlatiladi: u `-r` ga qo‘shimcha ravishda huquqlar, egasi va sanalarni ham saqlaydi. Faqat yangi fayllarni nusxalash `-u`, katta zaxiralar uchun esa `rsync` qulayroq.",
    "By default `cp` copies files only; given a directory it skips it with “omitting directory”. `-r` (recursive) walks into the directory and copies every file and subdirectory. Backups often use `cp -a`, which on top of `-r` keeps permissions, owners and timestamps. Copying only newer files is `-u`, and for big backups `rsync` is the better tool.",
  ),
  l7: t(
    "`mv` (move) bir papka ichida ishlatilsa faylni qayta nomlaydi: ma’lumot diskda joyidan qo‘zg‘almaydi, faqat nomi o‘zgaradi, shuning uchun mazmun aynan saqlanadi va bu juda tez. Boshqa papkaga ko‘chirishda ham xuddi shu buyruq ishlaydi. Ehtiyot bo‘ling: agar `hisobot_eski.txt` allaqachon bo‘lsa, `mv` uni so‘ramasdan ustidan yozib yuboradi — `mv -i` oldin so‘raydi, `mv -n` esa ustidan yozmaydi. Ikki fayl paydo bo‘lishi uchun `cp` kerak bo‘lardi.",
    "Within one directory `mv` (move) renames a file: the data doesn’t move on disk, only the name changes, so the contents stay exactly the same and it is instant. The same command moves files to another directory. Careful: if `hisobot_eski.txt` already exists, `mv` silently overwrites it — `mv -i` asks first and `mv -n` never overwrites. Ending up with two files would need `cp`.",
  ),
  l8: t(
    "Har bir raqam bitta toifa uchun: birinchisi — egasi, ikkinchisi — guruh, uchinchisi — boshqalar. Raqam huquqlar yig‘indisi: o‘qish r = 4, yozish w = 2, bajarish x = 1. 6 = 4 + 2 = `rw-`, 4 = `r--`. Demak 644 → `rw-r--r--`: egasi o‘qiydi va yozadi, guruh va boshqalar faqat o‘qiydi. Bu veb-sahifalar va konfiguratsiya fayllari uchun odatiy huquq: server faylni o‘qiy oladi, lekin uni faqat egasi o‘zgartiradi. Hammaga hamma narsa 777 bo‘lardi — bu xavfli.",
    "Each digit is one class: the first is the owner, the second the group, the third everyone else. A digit is the sum of permissions: read r = 4, write w = 2, execute x = 1. 6 = 4 + 2 = `rw-`, 4 = `r--`. So 644 → `rw-r--r--`: the owner reads and writes, the group and others only read. It is the usual mode for web pages and config files: the server can read the file but only its owner can change it. Everything for everyone would be 777 — and dangerous.",
  ),
  l9: t(
    "`chown` (change owner) fayl egasini o‘zgartiradi; `egasi:guruh` shakli bir yo‘la ikkalasini belgilaydi. `ali:dev` → egasi `ali`, guruhi `dev`. Faqat guruhni o‘zgartirish uchun `chown :dev fayl` yoki `chgrp dev fayl`, papkani ichidagilari bilan — `chown -R`. Boshqa foydalanuvchiga fayl berish tizim xavfsizligiga ta’sir qilgani uchun bu odatda `sudo` talab qiladi. Foydalanuvchi yaratish — `useradd`, parol — `passwd`.",
    "`chown` (change owner) changes a file’s owner; the `owner:group` form sets both at once. `ali:dev` → owner `ali`, group `dev`. To change only the group use `chown :dev file` or `chgrp dev file`, and for a directory with its contents `chown -R`. Giving a file to another user affects system security, so it normally needs `sudo`. Creating users is `useradd`, passwords are `passwd`.",
  ),
  l10: t(
    "`grep` sukut bo‘yicha katta-kichik harfni farqlaydi: `error` qidirsangiz, `ERROR` yoki `Error` qatorlari chiqmaydi. `-i` (ignore case) bu farqni olib tashlaydi. Loglarda bitta xato turli shakllarda yozilishi mumkin, shuning uchun tahlilda `-i` ko‘p ishlatiladi. Boshqa foydali bayroqlar: `-v` — mos kelmaganlar, `-n` — qator raqami, `-c` — sonini sanash, `-m 1` — birinchi topilgandan keyin to‘xtash, `-r` — papkalar bo‘ylab qidirish.",
    "`grep` is case-sensitive by default: searching for `error` misses lines with `ERROR` or `Error`. `-i` (ignore case) removes that difference. Logs often spell the same error in different ways, so analysts use `-i` a lot. Other useful flags: `-v` — non-matching lines, `-n` — line numbers, `-c` — count matches, `-m 1` — stop after the first match, `-r` — search through directories.",
  ),
  l11: t(
    "Pipe (`|`) chap buyruqning standart chiqishini (stdout) o‘ng buyruqning standart kirishiga (stdin) to‘g‘ridan-to‘g‘ri uzatadi; oraliq fayl kerak emas. `ps aux` barcha jarayonlarni chiqaradi, `grep nginx` ulardan faqat nginx qatorlarini qoldiradi. Unix falsafasi shu: har bir kichik buyruq bitta ishni yaxshi qiladi, pipe esa ularni zanjirga ulaydi (`cat log | grep 404 | wc -l`). «Xato bo‘lsa ishga tushirish» bu `||`, «muvaffaqiyatli bo‘lsa» esa `&&`; faylga yozish `>`.",
    "A pipe (`|`) feeds the standard output (stdout) of the left command straight into the standard input (stdin) of the right one, with no temporary file. `ps aux` lists every process and `grep nginx` keeps only the nginx lines. That is the Unix idea: each small command does one job well and pipes chain them together (`cat log | grep 404 | wc -l`). “Run if the first failed” is `||`, “run if it succeeded” is `&&`, and writing to a file is `>`.",
  ),
  l12: t(
    "`kill` jarayonga signal yuboradi; 4321 — jarayon raqami (PID), 9 — signal raqami. Sukut bo‘yicha `kill` 15 (SIGTERM) yuboradi: dastur fayllarini saqlab, toza yopilishi mumkin. 9 (SIGKILL) esa yadro tomonidan jarayonni darhol, hech qanday tozalashsiz to‘xtatadi — uni ushlab yoki rad etib bo‘lmaydi. Shuning uchun avval oddiy `kill`, jarayon javob bermasa `kill -9` ishlatiladi. PID ni `ps`, `pgrep` yoki `top` bilan topasiz. `kill` portlarni yopmaydi, lekin portni tinglayotgan jarayonni to‘xtatsa, port bo‘shaydi.",
    "`kill` sends a signal to a process; 4321 is the process ID (PID) and 9 is the signal number. By default `kill` sends 15 (SIGTERM), so the program can save its files and exit cleanly. 9 (SIGKILL) is applied by the kernel: the process stops at once, with no clean-up, and it cannot catch or ignore it. So try plain `kill` first and use `kill -9` only when the process won’t respond. You find the PID with `ps`, `pgrep` or `top`. `kill` doesn’t close ports, though stopping the process that listens on a port frees it.",
  ),
  l13: t(
    "Har bir jarayonda ikki chiqish oqimi bor: 1 — stdout (oddiy natija) va 2 — stderr (xatolar). `> out.log` stdout ni faylga yo‘naltiradi (fayl avval tozalanadi). `2>&1` esa «2-oqimni 1-oqim hozir qayerga ketayotgan bo‘lsa, o‘sha yerga yubor» degani — ya’ni xatolar ham out.log ga tushadi. Tartib muhim: `2>&1 > out.log` yozilsa, xatolar ekranda qoladi. Faylning oxiriga qo‘shish uchun `>>` kerak; faqat xatolarni yozish `2> err.log`. Cron vazifalari va zaxira skriptlarida aynan shu shakl hamma narsani bitta logga yig‘adi.",
    "Every process has two output streams: 1 — stdout (normal output) and 2 — stderr (errors). `> out.log` sends stdout to the file (emptying it first). `2>&1` means “send stream 2 wherever stream 1 is going right now” — so errors land in out.log too. Order matters: written as `2>&1 > out.log`, errors would stay on the screen. Appending needs `>>`; errors alone would be `2> err.log`. Cron jobs and backup scripts use exactly this form to collect everything in one log.",
  ),
  l14: t(
    "`sudo` (superuser do) bitta buyruqni root — tizim administratori — huquqi bilan bajaradi. `apt update` paketlar ro‘yxatini `/var/lib/apt` ga yozadi, u yerga esa faqat root yoza oladi. `sudo` sizning parolingizni so‘raydi va buyruqni jurnalga yozadi, shuning uchun har doim root bo‘lib ishlashdan xavfsizroq: xato buyruq kamroq zarar keltiradi va kim nima qilgani ko‘rinadi. Kimga ruxsat borligi `/etc/sudoers` da belgilanadi. Tezlik yoki internetga aloqasi yo‘q.",
    "`sudo` (superuser do) runs one command with the rights of root, the system administrator. `apt update` writes the package lists to `/var/lib/apt`, where only root may write. `sudo` asks for your own password and logs the command, which makes it safer than working as root all the time: a mistyped command does less damage and you can see who did what. Who may use it is set in `/etc/sudoers`. It has nothing to do with speed or the internet.",
  ),
  l15: t(
    "`df` (disk free) fayl tizimlari — disk bo‘limlari — bo‘yicha jami, band va bo‘sh joyni ko‘rsatadi; `-h` (human-readable) sonlarni G, M kabi qulay o‘lchovda chiqaradi. Uni `du` bilan adashtirmang: `du -sh papka` bitta papka qancha joy egallaganini o‘lchaydi — disk to‘lib qolganda «nima joy oldi» degan savolga javob beradi. `free -h` diskni emas, operativ xotirani (RAM) ko‘rsatadi. Server disk to‘lishi loglar yozilmay qolishiga va xizmatlar to‘xtashiga olib keladi, shuning uchun `df -h` monitoring asosiy buyruqlaridan biri.",
    "`df` (disk free) shows total, used and free space per file system — per disk partition; `-h` (human-readable) prints sizes as G, M and so on. Don’t mix it up with `du`: `du -sh folder` measures how much one folder takes — the answer to “what filled the disk?”. `free -h` shows memory (RAM), not disk. A full disk on a server stops logs being written and can bring services down, so `df -h` is a basic monitoring command.",
  ),
  l16: t(
    '`find` ko‘rsatilgan papkadan boshlab ichki papkalarni ham aylanib chiqadi. `-name "*.log"` nomi .log bilan tugaganlarni tanlaydi (qo‘shtirnoq shell `*` ni o‘zi ochib yubormasligi uchun kerak). `-mtime` mazmun o‘zgargan vaqtni 24 soatlik kunlarda o‘lchaydi: `-1` — 1 kundan kam, ya’ni oxirgi 24 soat ichida; `+1` — 1 kundan ko‘p (eski fayllar); `1` — aynan bir kun oldin. Hajm bo‘yicha qidirish uchun `-size` ishlatiladi. Hodisa tekshiruvida «oxirgi sutkada qaysi loglar o‘zgardi» savoliga aynan shunday javob olinadi.',
    '`find` starts at the given directory and walks all its subdirectories. `-name "*.log"` picks names ending in .log (the quotes stop the shell from expanding `*` itself). `-mtime` measures when the contents changed, in 24-hour days: `-1` — less than 1 day ago, i.e. within the last 24 hours; `+1` — more than 1 day (older files); `1` — exactly one day ago. Searching by size uses `-size`. In an incident review this is how you answer “which logs changed in the last day?”.',
  ),
  l17: t(
    "`man` (manual) buyruqning rasmiy qo‘llanma sahifasini ochadi: barcha bayroqlar, misollar va tegishli buyruqlar. `man ls` ochilgach, `/so‘z` bilan qidirasiz, `n` keyingi topilmaga o‘tadi, `q` chiqadi. Qisqa yordam uchun ko‘p buyruqlarda `ls --help` bor; `help` esa faqat bash ichki buyruqlari (`cd`, `echo`) uchun. `info --ls` va `ls ?` mavjud usullar emas. Internet bo‘lmagan serverda ham `man` ishlaydi — bu uning eng katta afzalligi.",
    "`man` (manual) opens the official manual page of a command: every flag, examples and related commands. Inside `man ls`, `/word` searches, `n` jumps to the next hit and `q` quits. For a short summary most commands have `ls --help`; `help` is only for bash built-ins (`cd`, `echo`). `info --ls` and `ls ?` aren’t real forms. `man` works on a server with no internet — its biggest advantage.",
  ),
  l18: t(
    "Birinchi belgi `-` — bu oddiy fayl. Keyin uchta uchlik keladi: egasi `rwx`, guruh `r-x`, boshqalar `---`. Egasi — `ali`, guruh — `dev`. dev guruhidagi boshqa foydalanuvchiga guruh uchligi `r-x` tegishli: o‘qiy oladi (r), bajara oladi (x), lekin yoza olmaydi (w o‘rnida `-`). Guruhda bo‘lmaganlar esa hech narsa qila olmaydi. Raqamda bu 750. Bunday sozlash jamoa skriptlari uchun yaxshi: jamoa ishga tushiradi, lekin faqat muallif o‘zgartiradi.",
    "The first character `-` means a regular file. Then come three triplets: owner `rwx`, group `r-x`, others `---`. The owner is `ali`, the group `dev`. Another user in dev gets the group triplet `r-x`: they can read (r) and execute (x) but not write (a `-` where w would be). Users outside the group can do nothing. In digits it is 750. That suits team scripts: the team can run it, only the author can change it.",
  ),
  l19: t(
    "`tail` faylning oxirgi qatorlarini (sukut bo‘yicha 10 ta) ko‘rsatadi. `-f` (follow) buyruqni tugatmaydi: faylga yangi qator yozilishi bilan uni darhol ekranga chiqaradi — loglarni jonli kuzatishning asosiy usuli. `Ctrl+C` bilan to‘xtatiladi. Log aylantirilganda (rotate) ham kuzatishni davom ettirish uchun `tail -F` ishlatiladi. Birinchi qatorlar uchun `head`, filtrlash uchun `tail -f log | grep xato` kabi pipe ishlatiladi.",
    "`tail` shows the last lines of a file (10 by default). `-f` (follow) keeps running: as soon as a new line is written to the file, it prints it — the standard way to watch a log live. Stop it with `Ctrl+C`. To keep following across log rotation use `tail -F`. The first lines are `head`, and filtering is a pipe such as `tail -f log | grep error`.",
  ),
  l20: t(
    "Buyruq yozilganda shell uni `PATH` o‘zgaruvchisidagi papkalardan (`echo $PATH`) chapdan o‘ngga qidiradi va birinchi topilganini ishga tushiradi. `which python3` aynan shu faylning yo‘lini chiqaradi, masalan `/usr/bin/python3`. Bu tizimda bir nechta versiya bo‘lsa yoki kimdir `PATH` ga zararli papka qo‘shib, mashhur buyruq nomi bilan soxta fayl qo‘ygan bo‘lsa, muhim. `type python3` alias va ichki buyruqlarni ham ko‘rsatadi. `echo python3` faqat so‘zni chiqaradi, `cat` esa fayl mazmunini o‘qiydi.",
    "When you type a command, the shell searches the directories in `PATH` (`echo $PATH`) from left to right and runs the first match. `which python3` prints the path of exactly that file, e.g. `/usr/bin/python3`. It matters when several versions are installed, or when someone has added a directory to `PATH` with a fake file named like a common command. `type python3` also reports aliases and built-ins. `echo python3` only prints the word, and `cat` reads a file’s contents.",
  ),

  // --- IP ------------------------------------------------------------------------------
  n1: t(
    "IPv4 manzil 32 bit: har biri 8 bitli to‘rtta oktet, nuqta bilan ajratib o‘nlik sonlarda yoziladi (192.168.1.10). Shuning uchun jami 2^32 ≈ 4,3 milliard manzil bor — bugungi qurilmalar soniga yetmaydi, shu sababli NAT va IPv6 paydo bo‘ldi. 128 bit — bu IPv6, 16 va 64 bit esa IP manzil uzunligi emas.",
    "An IPv4 address is 32 bits: four 8-bit octets written as decimal numbers separated by dots (192.168.1.10). That gives 2^32 ≈ 4.3 billion addresses — not enough for today’s devices, which is why NAT and IPv6 exist. 128 bits is IPv6; 16 and 64 bits aren’t IP address lengths.",
  ),
  n2: t(
    "Har bir oktet 8 bit, ya’ni 0 dan 255 gacha bo‘ladi va oktetlar aynan to‘rtta bo‘lishi kerak. 10.0.0.1 shu shartlarga mos (u xususiy tarmoq manzili ham). 192.168.1.256 va 300.1.1.1 da 255 dan katta son bor, 172.16.1 da esa atigi uchta oktet. Formulalarda va firewall qoidalarida bunday xato manzil qoidani butunlay buzib qo‘yishi mumkin.",
    "Each octet is 8 bits, so 0 to 255, and there must be exactly four octets. 10.0.0.1 meets both rules (and is a private address). 192.168.1.256 and 300.1.1.1 contain a number above 255, and 172.16.1 has only three octets. In configs and firewall rules an invalid address like these can break the whole rule.",
  ),
  n3: t(
    "Prefiks maskaning boshidan nechta bit 1 ekanini aytadi. /24 → 24 ta bir: 11111111.11111111.11111111.00000000 = 255.255.255.0. Birinchi uch oktet tarmoqni, oxirgisi hostni bildiradi: 256 manzil, 254 host. Uy va ofis tarmoqlarining eng keng tarqalgan o‘lchami. 255.255.0.0 — /16, 255.0.0.0 — /8, 255.255.255.255 — /32 (bitta host).",
    "The prefix says how many leading bits of the mask are 1. /24 → twenty-four ones: 11111111.11111111.11111111.00000000 = 255.255.255.0. The first three octets name the network and the last one the host: 256 addresses, 254 hosts. It is the most common size for home and office networks. 255.255.0.0 is /16, 255.0.0.0 is /8, 255.255.255.255 is /32 (a single host).",
  ),
  n4: t(
    "RFC 1918 uchta xususiy diapazonni belgilaydi: 10.0.0.0/8, 172.16.0.0/12 (172.16.0.0 – 172.31.255.255) va 192.168.0.0/16. Bu manzillar internetda yo‘naltirilmaydi va ichki tarmoqlarda erkin ishlatiladi. 172.20.5.4 — 172.16–172.31 oralig‘ida, demak xususiy. 172.32.0.1 esa bu oraliqdan bir qadam tashqarida — ochiq manzil, bu ko‘p uchraydigan tuzoq. 8.8.8.8 (Google DNS) va 1.1.1.1 (Cloudflare DNS) — ochiq manzillar.",
    "RFC 1918 defines three private ranges: 10.0.0.0/8, 172.16.0.0/12 (172.16.0.0 – 172.31.255.255) and 192.168.0.0/16. They aren’t routed on the internet and are free to use inside networks. 172.20.5.4 falls within 172.16–172.31, so it is private. 172.32.0.1 is one step outside that range — a public address, and a common trap. 8.8.8.8 (Google DNS) and 1.1.1.1 (Cloudflare DNS) are public.",
  ),
  n5: t(
    "127.0.0.1 — loopback, ya’ni «shu kompyuterning o‘zi». Unga yuborilgan paket tarmoq kartasidan chiqmaydi va hech qachon tarmoqqa tushmaydi. Butun 127.0.0.0/8 bloki loopback uchun ajratilgan, `localhost` nomi ham odatda 127.0.0.1 ga teng (IPv6 da ::1). Dasturchilar o‘z kompyuterida serverni sinash uchun ishlatadi; xavfsizlik nuqtai nazaridan faqat 127.0.0.1 da tinglayotgan xizmatga tashqaridan ulanib bo‘lmaydi.",
    "127.0.0.1 is the loopback address — “this computer itself”. A packet sent to it never leaves the network card or reaches the network. The whole 127.0.0.0/8 block is reserved for loopback, and the name `localhost` usually means 127.0.0.1 (::1 in IPv6). Developers use it to test servers on their own machine; for security, a service listening only on 127.0.0.1 cannot be reached from outside.",
  ),
  n6: t(
    "DHCP (Dynamic Host Configuration Protocol) tarmoqqa ulangan qurilmaga avtomatik ravishda IP manzil, maska, default gateway va DNS server manzilini beradi. Jarayon to‘rt qadam: Discover → Offer → Request → Acknowledge (DORA). Manzil ma’lum muddatga «ijaraga» (lease) beriladi. DHCP bo‘lmasa, har bir qurilmani qo‘lda sozlash kerak bo‘lardi. Nomni IP ga aylantirish — DNS, shifrlash — TLS yoki VPN vazifasi.",
    "DHCP (Dynamic Host Configuration Protocol) automatically gives a device joining the network its IP address, mask, default gateway and DNS server. It works in four steps: Discover → Offer → Request → Acknowledge (DORA). The address is leased for a limited time. Without DHCP every device would need manual setup. Turning names into IPs is DNS’s job, and encryption is TLS’s or a VPN’s.",
  ),
  n7: t(
    "Kompyuter manzil o‘z tarmog‘ida (maska bo‘yicha) emasligini aniqlasa, paketni default gateway ga — odatda routerning ichki manziliga (masalan, 192.168.1.1) — yuboradi; router uni keyingi tarmoqqa uzatadi. Gateway noto‘g‘ri bo‘lsa, lokal tarmoq ishlaydi, lekin internet ishlamaydi — bu tez-tez uchraydigan nosozlik. Linuxda uni `ip route` (`default via …` qatori) ko‘rsatadi.",
    "When a computer sees, using its mask, that an address isn’t on its own network, it sends the packet to the default gateway — usually the router’s inside address (e.g. 192.168.1.1) — and the router passes it to the next network. With a wrong gateway the local network works but the internet doesn’t, a very common fault. On Linux `ip route` shows it (the `default via …` line).",
  ),
  n8: t(
    "/26 da host qismi 32 − 26 = 6 bit, ya’ni 2^6 = 64 manzil. Ulardan birinchisi tarmoq manzili, oxirgisi broadcast manzili — ularni qurilmaga berib bo‘lmaydi. Foydalaniladigan hostlar: 64 − 2 = 62. Umumiy formula: 2^(32 − prefiks) − 2. 64 — jami manzillar soni (tuzoq), 30 — /27, 126 — /25 uchun.",
    "In a /26 the host part is 32 − 26 = 6 bits, so 2^6 = 64 addresses. The first is the network address and the last the broadcast address, and neither can be given to a device. Usable hosts: 64 − 2 = 62. The general formula is 2^(32 − prefix) − 2. 64 is the total count (the trap), 30 is for a /27, and 126 for a /25.",
  ),
  n9: t(
    "/25 oxirgi oktetni 128 lik ikki blokka bo‘ladi: 0–127 va 128–255. 130 ikkinchi blokda, demak tarmoq manzili 192.168.1.128, broadcast — 192.168.1.255. Usul: blok o‘lchami 256 − maskadagi son (255.255.255.128 → 128); manzil ichidagi oktetni blok o‘lchamiga bo‘lib, butun qismini blokka ko‘paytirasiz: ⌊130 / 128⌋ × 128 = 128. 192.168.1.0 /24 uchun to‘g‘ri bo‘lardi.",
    "A /25 splits the last octet into two blocks of 128: 0–127 and 128–255. 130 is in the second, so the network address is 192.168.1.128 and the broadcast 192.168.1.255. Method: block size = 256 − the mask number (255.255.255.128 → 128); divide the octet by the block size and multiply the whole part back: ⌊130 / 128⌋ × 128 = 128. 192.168.1.0 would be right for a /24.",
  ),
  n10: t(
    "Birinchi uch oktet 255 — bu 24 ta bir. 240 ikkilikda 11110000 — yana 4 ta bir. Jami 24 + 4 = 28, ya’ni /28. Tekshirish: blok o‘lchami 256 − 240 = 16 manzil, 14 host. Oxirgi oktet uchun yodlab qo‘yish foydali: 128 → /25, 192 → /26, 224 → /27, 240 → /28, 248 → /29, 252 → /30.",
    "The first three octets are 255 — twenty-four ones. 240 in binary is 11110000 — four more. 24 + 4 = 28, so /28. Check: block size 256 − 240 = 16 addresses, 14 hosts. It pays to memorise the last-octet values: 128 → /25, 192 → /26, 224 → /27, 240 → /28, 248 → /29, 252 → /30.",
  ),
  n11: t(
    "/24 da birinchi uch oktet tarmoqni bildiradi. 10.1.1.10 — 10.1.1.0/24 tarmog‘ida, 10.1.2.10 esa 10.1.2.0/24 da: uchinchi oktet farq qiladi, demak tarmoqlar har xil. Ular bevosita gaplasha olmaydi — paket router (gateway) orqali o‘tishi kerak. «10.x.x.x» bo‘lishi ularni bitta katta 10.0.0.0/8 xususiy diapazonga kiritadi, lekin tarmoqni maska belgilaydi. Oxirgi oktet bir xilligi yoki ulanish turi (Wi‑Fi) bunga ta’sir qilmaydi.",
    "In a /24 the first three octets name the network. 10.1.1.10 is in 10.1.1.0/24 and 10.1.2.10 in 10.1.2.0/24: the third octet differs, so the networks differ. They can’t talk directly — traffic has to go through a router (gateway). Both being “10.x.x.x” puts them in the big private 10.0.0.0/8 range, but the mask decides the network. The same last octet or the link type (Wi‑Fi) changes nothing.",
  ),
  n12: t(
    "`ip a` (`ip addr`) har bir tarmoq interfeysini (lo, eth0, wlan0…) holati (UP/DOWN), MAC manzili va unga berilgan IPv4/IPv6 manzillari bilan (prefiks bilan, masalan 192.168.1.20/24) ko‘rsatadi. U eskirgan `ifconfig` o‘rnini egallagan. Tegishli buyruqlar: `ip route` — marshrutlar va gateway, `ss -tln` — ochiq portlar, `resolvectl` — DNS. Tarmoq nosozligida birinchi savol «qurilmada umuman IP bormi?» — unga aynan `ip a` javob beradi.",
    "`ip a` (`ip addr`) lists every network interface (lo, eth0, wlan0…) with its state (UP/DOWN), MAC address and assigned IPv4/IPv6 addresses with prefix, e.g. 192.168.1.20/24. It replaces the old `ifconfig`. Related commands: `ip route` — routes and gateway, `ss -tln` — open ports, `resolvectl` — DNS. When a network breaks, the first question is “does the device have an IP at all?” — and `ip a` answers it.",
  ),
  n13: t(
    "`ping` ICMP (Internet Control Message Protocol) «Echo Request» paketini yuboradi va «Echo Reply» kutadi, javob vaqtini (ms) va yo‘qolgan paketlarni o‘lchaydi. ICMP portlardan foydalanmaydi, u TCP yoki UDP emas — to‘g‘ridan-to‘g‘ri IP ustida ishlaydi. Shu sababli ko‘p firewall ICMP ni bloklaydi va host ishlayotgan bo‘lsa ham ping o‘tmasligi mumkin. HTTP — veb, FTP — fayl uzatish, SMTP — pochta yuborish protokollari.",
    "`ping` sends ICMP (Internet Control Message Protocol) “Echo Request” packets and waits for “Echo Reply”, measuring round-trip time (ms) and lost packets. ICMP uses no ports — it isn’t TCP or UDP but runs directly on IP. That’s why many firewalls block ICMP, and a host can be up while ping fails. HTTP is the web, FTP file transfer and SMTP sending mail.",
  ),
  n14: t(
    "DNS (Domain Name System) — internetning «telefon kitobi»: odam eslab qoladigan nomni (cybervalue.uz) kompyuter ishlatadigan IP manzilga aylantiradi (A yozuvi — IPv4, AAAA — IPv6). Brauzer avval DNS ga so‘raydi, keyin olingan IP ga ulanadi. Shu sababli DNS ishlamasa «internet yo‘q» kabi ko‘rinadi, IP orqali esa ishlayveradi. Tekshirish: `nslookup`, `dig` yoki `host`. Manzil tarqatish — DHCP, shifrlash — TLS.",
    "DNS (Domain Name System) is the internet’s “phone book”: it turns a name people remember (cybervalue.uz) into the IP address computers use (an A record for IPv4, AAAA for IPv6). The browser asks DNS first and then connects to the IP it got. So when DNS fails it looks like “no internet”, while connecting by IP still works. Check it with `nslookup`, `dig` or `host`. Handing out addresses is DHCP, encryption is TLS.",
  ),
  n15: t(
    "169.254.0.0/16 — link-local (APIPA) diapazoni. Qurilma DHCP serverdan javob ololmasa, o‘ziga shu oraliqdan tasodifiy manzil beradi. Bunday manzil bilan faqat o‘sha kabeldagi qo‘shnilar bilan gaplashish mumkin: gateway va DNS yo‘q, internet ishlamaydi. Sabablar: router yoki DHCP xizmati o‘chiq, kabel/Wi‑Fi muammosi, DHCP manzillari tugagan. Tuzatish: ulanishni tekshirish, routerni qayta yoqish, Linuxda manzilni qayta so‘rash (`sudo dhclient` yoki NetworkManager). Bu IPv6 emas va provayder bunday manzil bermaydi.",
    "169.254.0.0/16 is the link-local (APIPA) range. When a device gets no answer from a DHCP server, it picks a random address from this range for itself. With it a device can only talk to neighbours on the same link: there is no gateway and no DNS, so no internet. Causes: router or DHCP service down, a cable or Wi‑Fi problem, the DHCP pool used up. Fix: check the connection, restart the router, ask for an address again (on Linux `sudo dhclient` or NetworkManager). It isn’t IPv6, and ISPs don’t hand these out.",
  ),
  n16: t(
    "Tarmoqni 2^n ta teng qismga bo‘lish uchun prefiksga n bit qo‘shiladi. 4 = 2^2, demak 2 bit: /16 + 2 = /18. Har bir subnet 2^(32 − 18) = 16 384 manzil: 172.16.0.0/18, 172.16.64.0/18, 172.16.128.0/18 va 172.16.192.0/18. /17 — faqat 2 qism, /20 — 16 qism, /24 — 256 qism beradi. Bu bo‘limlarni (masalan, ofis, server, mehmon Wi‑Fi) alohida tarmoqlarga ajratib, firewall bilan ajratish (segmentatsiya) asosidir.",
    "Splitting a network into 2^n equal parts adds n bits to the prefix. 4 = 2^2, so 2 bits: /16 + 2 = /18. Each subnet has 2^(32 − 18) = 16,384 addresses: 172.16.0.0/18, 172.16.64.0/18, 172.16.128.0/18 and 172.16.192.0/18. /17 gives only 2 parts, /20 gives 16 and /24 gives 256. This is the basis of segmentation: putting departments (office, servers, guest Wi‑Fi) on separate networks with a firewall between them.",
  ),
  n17: t(
    "/29 da host qismi 3 bit: 2^3 = 8 manzil, 192.168.5.0 dan 192.168.5.7 gacha. .0 — tarmoq manzili, .7 — broadcast, hostlar .1 – .6 (6 ta). Demak oxirgi foydalaniladigan host .6. .7 (broadcast) eng ko‘p tanlanadigan xato javob; .8 keyingi subnetning tarmoq manzili, .254 esa /24 uchun to‘g‘ri bo‘lardi. /29 va /30 kabi kichik tarmoqlar routerlar orasidagi ulanishlar va bir nechta ochiq IP li mijozlar uchun ishlatiladi.",
    "A /29 has 3 host bits: 2^3 = 8 addresses, from 192.168.5.0 to 192.168.5.7. .0 is the network address and .7 the broadcast, so the hosts are .1 – .6 (six of them) and the last usable host is .6. .7 (the broadcast) is the most common wrong pick; .8 is the next subnet’s network address, and .254 would be right for a /24. Small networks like /29 and /30 are used for links between routers and for customers with a few public IPs.",
  ),
  n18: t(
    "IPv6 manzil 128 bit — IPv4 dan to‘rt barobar uzun. U 16 bitli sakkizta guruh bilan, o‘n oltilik sanoqda, ikki nuqta bilan ajratib yoziladi: 2001:0db8:0000:…:8329. 2^128 manzil shunchalik ko‘pki, NAT ga ehtiyoj yo‘qoladi va har bir qurilma global manzil olishi mumkin. Odatda birinchi 64 bit tarmoqni, oxirgi 64 bit interfeysni bildiradi. 32 bit — IPv4.",
    "An IPv6 address is 128 bits — four times as long as IPv4. It is written as eight 16-bit groups in hexadecimal separated by colons: 2001:0db8:0000:…:8329. 2^128 addresses are so many that NAT becomes unnecessary and every device can have a global address. Usually the first 64 bits name the network and the last 64 the interface. 32 bits is IPv4.",
  ),
  n19: t(
    "NAT (Network Address Translation) uydagi barcha qurilmalarning xususiy manzillarini (192.168.x.x) provayder bergan bitta ochiq IP ga almashtiradi. Router har bir ulanishni port raqami bilan jadvalda eslab qoladi va javobni to‘g‘ri qurilmaga qaytaradi (PAT / masquerade). Bu IPv4 manzillarini tejaydi va qo‘shimcha ta’siri sifatida tashqaridan ichki qurilmalarga so‘ralmagan ulanishlar kira olmaydi (port forwarding qilinmagan bo‘lsa). Lekin NAT firewall o‘rnini bosmaydi. Wi‑Fi shifrlash — WPA2/WPA3, nomlar — DNS vazifasi.",
    "NAT (Network Address Translation) replaces the private addresses of every device at home (192.168.x.x) with the single public IP from the ISP. The router remembers each connection by port number in a table and sends replies back to the right device (PAT / masquerade). It saves IPv4 addresses and, as a side effect, unsolicited connections from outside can’t reach inside devices (unless a port is forwarded). It is still no substitute for a firewall. Wi‑Fi encryption is WPA2/WPA3, and names are DNS’s job.",
  ),
  n20: t(
    "`traceroute` har bir qadamdagi router manzilini va javob vaqtini ko‘rsatadi. `* * *` o‘sha router javob bermaganini bildiradi: ko‘p routerlar xavfsizlik yoki yuklama sababli ICMP «TTL exceeded» xabarlarini yubormaydi. Lekin keyingi qadamlar (4–9) va oxirgi manzil 8.8.8.8 javob bergan — demak paketlar 3-qadamdan muvaffaqiyatli o‘tgan va yo‘l ishlayapti. Haqiqiy uzilish bo‘lsa, `* * *` dan keyin hech bir qadam javob bermasdi. Natijani o‘qishda hamma narsani bitta qatorga qarab emas, butun zanjirga qarab baholang.",
    "`traceroute` shows the router at each hop and its response time. `* * *` means that router didn’t answer: many routers don’t send ICMP “TTL exceeded” messages, for security or load reasons. But the later hops (4–9) and the destination 8.8.8.8 did answer — so packets got through hop 3 and the path works. A real break would leave every hop after the `* * *` silent too. Read the whole chain, not one line.",
  ),

  // --- Open questions ------------------------------------------------------------------
  o1: t(
    "`tail -n 5 /etc/passwd` faylning oxirgi 5 qatorini chiqaradi (`tail -5` ham qabul qilinadi). `/etc/passwd` tizimdagi har bir foydalanuvchi uchun bitta qator saqlaydi: `nom:x:UID:GID:izoh:uy_papka:shell`. Yangi yaratilgan hisoblar faylning oxiriga qo‘shiladi, shuning uchun hujumchi yaratgan yashirin hisobni tekshirishda aynan oxirgi qatorlar foydali. Parollar bu yerda emas — ular faqat root o‘qiy oladigan `/etc/shadow` da xeshlangan holda saqlanadi.",
    "`tail -n 5 /etc/passwd` prints the last 5 lines of the file (`tail -5` is accepted too). `/etc/passwd` holds one line per account: `name:x:UID:GID:comment:home:shell`. New accounts are appended at the end, so the last lines are what you check when looking for an account an attacker created. Passwords aren’t here — they are stored hashed in `/etc/shadow`, which only root can read.",
  ),
  o2: t(
    "/27 da host qismi 32 − 27 = 5 bit: 2^5 = 32 manzil (192.168.10.0 – 192.168.10.31). Tarmoq manzili (.0) va broadcast (.31) qurilmaga berilmaydi, demak 32 − 2 = 30 ta foydalaniladigan host. Formula: 2^(32 − prefiks) − 2. Javob 32 bo‘lsa, ikkita maxsus manzil hisobdan chiqarilmagan.",
    "In a /27 the host part is 32 − 27 = 5 bits: 2^5 = 32 addresses (192.168.10.0 – 192.168.10.31). The network address (.0) and the broadcast (.31) can’t go to devices, so 32 − 2 = 30 usable hosts. Formula: 2^(32 − prefix) − 2. Answering 32 forgets to subtract the two special addresses.",
  ),
  o3: t(
    "Har bir toifa uchun huquqlarni qo‘shamiz: egasi rwx = 4 + 2 + 1 = 7, guruh r-x = 4 + 1 = 5, boshqalar --- = 0. Natija: `chmod 750 script.sh`. Belgili shakl ham to‘g‘ri: `chmod u=rwx,g=rx,o= script.sh`. Bajarish huquqi (x) bo‘lmasa, `./script.sh` «Permission denied» beradi. Skriptlar uchun 777 berish xavfli: har kim uni o‘zgartirib, sizning nomingizdan buyruq bajartirishi mumkin.",
    "Add up the permissions per class: owner rwx = 4 + 2 + 1 = 7, group r-x = 4 + 1 = 5, others --- = 0. Result: `chmod 750 script.sh`. The symbolic form is right too: `chmod u=rwx,g=rx,o= script.sh`. Without execute (x), `./script.sh` fails with “Permission denied”. Giving scripts 777 is dangerous: anyone could edit it and get commands run under your name.",
  ),
  o4: t(
    '`grep -c "Failed password" /var/log/auth.log` — `-c` mos qatorlarni chiqarmasdan, ularning sonini chiqaradi. `grep "Failed password" /var/log/auth.log | wc -l` ham to‘g‘ri: `wc -l` qatorlarni sanaydi. Ibora orasida probel borligi uchun qo‘shtirnoq shart — aks holda grep `password` ni fayl nomi deb tushunadi. auth.log da SSH kirish urinishlari yoziladi; muvaffaqiyatsiz parollarning keskin ko‘payishi brute-force hujum belgisi. Faylni o‘qish odatda `sudo` talab qiladi.',
    '`grep -c "Failed password" /var/log/auth.log` — `-c` prints the number of matching lines instead of the lines. `grep "Failed password" /var/log/auth.log | wc -l` is right too: `wc -l` counts lines. The quotes are required because the phrase contains a space — without them grep takes `password` as a file name. auth.log records SSH login attempts; a sudden rise in failed passwords is the sign of a brute-force attack. Reading the file usually needs `sudo`.',
  ),
  o5: t(
    "/20 = 255.255.240.0. Birinchi ikki oktet to‘liq tarmoqqa tegishli (172.16), uchinchi oktetda esa blok o‘lchami 256 − 240 = 16. 45 qaysi blokda? ⌊45 / 16⌋ × 16 = 32, ya’ni 32–47 oralig‘i. Tarmoq manzili: 172.16.32.0 (to‘rtinchi oktet 0). Bu tarmoq 172.16.32.0 dan 172.16.47.255 gacha davom etadi — broadcast 172.16.47.255. Xato ko‘pincha oxirgi oktetni (130) hisoblashga urinishdan keladi: /20 da u to‘liq host qismida.",
    "/20 = 255.255.240.0. The first two octets are all network (172.16), and in the third octet the block size is 256 − 240 = 16. Which block holds 45? ⌊45 / 16⌋ × 16 = 32, the 32–47 range. Network address: 172.16.32.0 (fourth octet 0). The network runs from 172.16.32.0 to 172.16.47.255 — the broadcast is 172.16.47.255. The usual mistake is working on the last octet (130): in a /20 it is entirely host bits.",
  ),
  o6: t(
    "/27 — oxirgi oktetda blok o‘lchami 32: 0–31, 32–63, 64–95, 96–127… 77 uchinchi blokda (64–95). Broadcast — blokning oxirgi manzili: 192.168.1.95. Tarmoq manzili 192.168.1.64, hostlar .65 – .94. Broadcast manzilga yuborilgan paket tarmoqdagi barcha qurilmalarga yetadi, shuning uchun uni hech qaysi qurilmaga berib bo‘lmaydi.",
    "A /27 has a block size of 32 in the last octet: 0–31, 32–63, 64–95, 96–127… 77 falls in the third block (64–95). The broadcast is the block’s last address: 192.168.1.95. The network address is 192.168.1.64 and the hosts .65 – .94. A packet sent to the broadcast address reaches every device on the network, so it can’t be assigned to any one device.",
  ),
  o7: t(
    "Ikki qoida: 1) har bir guruhdagi boshidagi nollar tashlanadi (0db8 → db8, 0042 → 42, 0000 → 0); 2) ketma-ket bir yoki bir nechta nol guruhlar `::` bilan almashtiriladi, lekin `::` butun manzilda faqat bir marta ishlatiladi (aks holda nechta guruh tushib qolgani noma’lum bo‘ladi). 2001:0db8:0000:0000:0000:ff00:0042:8329 → 2001:db8:0:0:0:ff00:42:8329 → 2001:db8::ff00:42:8329. Guruh ichidagi oxirgi nollar (ff00) tashlanmaydi. Kichik harf bilan yozish tavsiya etiladi.",
    "Two rules: 1) drop leading zeros in each group (0db8 → db8, 0042 → 42, 0000 → 0); 2) replace one run of consecutive zero groups with `::`, which may appear only once in an address (otherwise you couldn’t tell how many groups were dropped). 2001:0db8:0000:0000:0000:ff00:0042:8329 → 2001:db8:0:0:0:ff00:42:8329 → 2001:db8::ff00:42:8329. Trailing zeros inside a group (ff00) stay. Lower case is recommended.",
  ),
  o8: t(
    "Kerak: 2^h − 2 ≥ 1000. 2^9 − 2 = 510 — yetmaydi; 2^10 − 2 = 1022 — yetadi. Demak host qismi 10 bit, prefiks 32 − 10 = /22 (maska 255.255.252.0). /23 da atigi 510 host bor, /21 esa 2046 host bilan ishlaydi, lekin keraksiz katta va manzillarni isrof qiladi. Tarmoq rejalashtirishda doim «talabni qondiradigan eng kichik blok» tanlanadi.",
    "Needed: 2^h − 2 ≥ 1000. 2^9 − 2 = 510 — not enough; 2^10 − 2 = 1022 — enough. So 10 host bits and a prefix of 32 − 10 = /22 (mask 255.255.252.0). A /23 has only 510 hosts, and a /21 would work with 2046 but is needlessly large and wastes addresses. Network planning always picks the smallest block that meets the need.",
  ),
  o9: t(
    "`sudo ss -tlnp | grep 8080` — `ss` soketlarni ko‘rsatadi: `-t` TCP, `-l` faqat tinglayotganlar, `-n` port raqamlarini nomga aylantirmaydi, `-p` jarayon nomi va PID ni ko‘rsatadi (boshqa foydalanuvchilarning jarayonlari uchun `sudo` kerak). `lsof -i :8080`, eski `netstat -tlnp` yoki `fuser 8080/tcp` ham to‘g‘ri. Port band («address already in use») xatosini tuzatishda yoki serverda notanish xizmat ochiq portda tinglayotganini aniqlashda aynan shu buyruq ishlatiladi.",
    "`sudo ss -tlnp | grep 8080` — `ss` lists sockets: `-t` TCP, `-l` listening only, `-n` numeric ports, `-p` the process name and PID (seeing other users’ processes needs `sudo`). `lsof -i :8080`, the older `netstat -tlnp` or `fuser 8080/tcp` are right too. This is the command for fixing “address already in use”, or for finding an unknown service listening on an open port of a server.",
  ),
  o10: t(
    '`find . -name "*.log" -mtime +7 -delete` — `.` joriy papkadan boshlab ichki papkalarni ham ko‘rib chiqadi, `-name "*.log"` .log fayllarni tanlaydi (qo‘shtirnoq shart), `-mtime +7` 7 kundan eskilarni qoldiradi, `-delete` ularni o‘chiradi. `-exec rm {} \\;` (har bir fayl uchun alohida) yoki `-exec rm {} +` (bir yo‘la) ham to‘g‘ri. Xavfsiz amaliyot: avval `-delete` siz ishga tushirib, ro‘yxatni tekshiring, keyin qo‘shing. Bunday buyruq odatda cron orqali loglar diskni to‘ldirmasligi uchun ishlatiladi.',
    '`find . -name "*.log" -mtime +7 -delete` — `.` starts at the current directory and goes into subdirectories, `-name "*.log"` picks .log files (the quotes are required), `-mtime +7` keeps those older than 7 days and `-delete` removes them. `-exec rm {} \\;` (one file at a time) or `-exec rm {} +` (all at once) are right too. Safe practice: run it without `-delete` first, check the list, then add it. Commands like this usually run from cron so logs don’t fill the disk.',
  ),
};
