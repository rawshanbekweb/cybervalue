'use strict';

function detailedLessons() {
  const units = [];
  const add = (topic, title, lead, points, example, question, answer, note) =>
    units.push({topic, title, lead, points, example, question, answer, note});
  const flow = (...items) => ({kind:'flow', items});
  const rows = (heads, ...items) => ({kind:'table', heads, items});
  const code = text => ({kind:'code', text});

  // 01: Linux nima
  add('01', 'Windows va Linux arxitekturasi farqi',
    'Windows grafik muhit atrofida qurilgan, Linux esa yadro va terminal ustida.',
    [['Grafik muhit (GUI)', 'Linux da GUI ixtiyoriy. Serverlarda u umuman o\'rnatilmaydi, faqat terminal qoladi.'], ['Hamma narsa fayl', 'Linux da qurilmalar, jarayonlar va tarmoq interfeyslari ham fayl sifatida o\'qiladi.']],
    rows(['XUSUSIYAT', 'WINDOWS', 'LINUX'], ['Asosiy boshqaruv', 'GUI, Control Panel', 'Terminal, fayllar'], ['Qurilmalar', 'C:\\, D:\\ disklar', '/dev/sda fayllari']),
    'Linux serverda nima uchun grafik ekran ishlatilmaydi?', 'Resurslarni tejash va masofadan SSH orqali matnli boshqarish qulayligi uchun.',
    'Terminal shunchaki qora oyna emas, butun tizimni to\'liq boshqarish interfeysi ekanligini tushuntiring.');

  add('01', 'Shell va Yadro (Kernel) qanday gaplashadi?',
    'Foydalanuvchi to\'g\'ridan-to\'g\'ri yadroga buyruq bera olmaydi, buning uchun Shell (Bash/Zsh) vositachi bo\'ladi.',
    [['Shell tarjimon sifatida', 'Siz "ls" deb yozganingizda, shell bu matnni tushunib, yadroga C tilidagi tizim chaqiruvini (system call) yuboradi.'], ['Yadro apparatni boshqaradi', 'Yadro CPU dan vaqt so\'raydi va diskdan fayl ro\'yxatini o\'qiydi.']],
    flow('Siz "ls" yozasiz', 'Shell (Bash) buni tarjima qiladi', 'Yadro (Kernel) CPU/Diskka murojaat qiladi', 'Natija yana ekranga qaytadi'),
    'Agar bash (shell) ishdan chiqsa, yadro ishlashda davom etadimi?', 'Ha, yadro ishlashda davom etadi. Dasturlar va fon xizmatlari o\'z ishini bajaraveradi, faqat siz buyruq bera olmaysiz.',
    'System call tushunchasini juda yengil tushuntirib o\'ting.');

  // 02: Nima uchun Linux
  add('02', 'Open Source nima degani?',
    'Open source — dastur manba kodi hammaga ochiq bo\'lib, uni o\'rganish va o\'zgartirish mumkin.',
    [['Tekinmi?', 'Ko\'pincha tekin, lekin asosiy ma\'nosi — kodning ochiqligida. Enterprise versiyalar pullik bo\'lishi mumkin.'], ['Xavfsizlik', 'Minglab dasturchilar kodni ko\'rib xatolarni topadi, yashirin "qopqonlar" qo\'yish qiyin.']],
    flow('Dasturchi yadro yozadi', 'Kod ommaga e\'lon qilinadi', 'Hamjamiyat tekshiradi va yaxshilaydi', 'Yangi distro yaratiladi'),
    'Nima uchun banklar ochiq kodli Linux serverlardan foydalanadi?', 'Chunki ular kodni o\'zlari tekshirib chiqishlari, sozlashlari va unga to\'liq ishonishlari mumkin.',
    'Open source = xavfsiz emas degan afsonani bekor qiling. Kod ochiqligi xavfsizlikni kuchaytiradi.');

  add('02', 'Linux qayerlarda yashiringan?',
    'Siz uni ko\'rmasangiz ham, u har kuni hayotingizda qatnashadi.',
    [['Smartfonlarda', 'Android to\'liq Linux yadrosi ustida ishlaydi.'], ['Uy jihozlarida', 'Aqlli muzlatgichlar, Wi-Fi routerlar, televizorlar ichida Linux o\'rnatilgan.'], ['Avtomobillarda', 'Zamonaviy mashinalarning multimedia tizimlari (masalan Tesla) Linux da ishlaydi.']],
    rows(['QURILMA', 'LINUX ROLI'], ['Wi-Fi Router', 'Trafikni yo\'naltirish va firewall'], ['Android telefon', 'Ilovalarni boshqarish, xotira ajratish'], ['Bulutli server (AWS)', 'Veb-saytlarni hosting qilish']),
    'Nega bu qurilmalarga Windows emas, Linux o\'rnatiladi?', 'Chunki Linux ni bepul tarzda juda mitti va resurs talab qilmaydigan (minimal) holatga keltirib kesib olish mumkin.',
    'O\'quvchilarga Linux faqat hakerlar uchun degan stereotipni sindirishga yordam bering.');

  // 03: Distrobyutsiyalar
  add('03', 'Distro: Yadro bir xil, kiyim boshqa',
    'Barcha Linux distrolari asosi (kernel) bir xil, farqi dasturlar va sozlamalarda.',
    [['Ubuntu / Debian', 'apt paket menejeri. Juda ko\'p o\'quv qo\'llanmalarga ega. Boshlanish uchun ideal.'], ['RHEL / CentOS', 'dnf / yum. Korporativ serverlar uchun qattiq sinovdan o\'tgan.'], ['Kali / Parrot', 'Kiberxavfsizlik uchun. Yuzlab hakerlik dasturlari avvaldan o\'rnatilgan bo\'ladi.']],
    rows(['DISTRO', 'MENEJER', 'QACHON TANLASH KERAK?'], ['Ubuntu', 'apt', 'Yangi boshlaganda, veb server uchun'], ['Rocky Linux', 'dnf', 'Korxona va bank serverlarida'], ['Kali Linux', 'apt', 'Faqat xavfsizlik sinovlari uchun']),
    'O\'rganishni boshlash uchun nima uchun Kali tavsiya etilmaydi?', 'Kali doimiy ishlash yoki kod yozish uchun optimallashtirilmagan, u root bilan ishlaydi va o\'quvchini xato qilishga undaydi. Ubuntu yaxshiroq.',
    'Kali faqat asboblar qutisi ekanligini, operatsion tizim arxitekturasini o\'rganish uchun Ubuntu/Debian afzalligini uqtiring.');

  // 04: Fayl tizimi
  add('04', '/etc va /var papkalari mo\'jizasi',
    '/etc faqat sozlamalar saqlaydi, /var esa vaqt o\'tishi bilan o\'zgarib boruvchi fayllarni.',
    [['/etc', 'Tizim va dasturlar konfiguratsiyasi. Masalan, veb server portini shu yerdan o\'zgartirasiz.'], ['/var', 'Log fayllar, keshlar, ma\'lumotlar bazasi. O\'lchami doim o\'zgarib turadi.']],
    rows(['PAPKA', 'ICHI NIMA?', 'O\'ZGARADIMI?'], ['/etc/ssh', 'SSH server sozlamalari', 'Kamdan kam (Qo\'lda)'], ['/var/log', 'Tizim xatolik jurnali', 'Har soniyada (Avtomatik)']),
    'Dastur xato ishlashni boshlasa, qaysi papkaga qaraysiz?', '/var/log papkasidagi tegishli log fayllarga qaraladi.',
    'Konfiguratsiya va o\'zgaruvchi holat alohida saqlanishini tushuntiring.');

  add('04', '~ (Tilda) va uy papkasi',
    'Tilda belgisi (~) doimo siz hozir kirgan foydalanuvchining uy papkasini bildiradi.',
    [['Foydalanuvchi qafasi', '/home/ali — bu Ali ismli foydalanuvchining "shaxsiy hududi".'], ['Tezkor o\'tish', 'cd ~ yozsangiz, qayerda bo\'lishingizdan qat\'iy nazar uy papkaga qaytasiz.']],
    code('$ whoami\nali\n$ cd ~\n$ pwd\n/home/ali'),
    'root foydalanuvchisining uy papkasi qayerda?', 'root foydalanuvchisining papkasi /home/root emas, balki /root deb ataladi.',
    'Har doim papka tushunchasini to\'liq yo\'l (/home/user) va nisbiy yo\'l (~) orqali solishtiring.');

  add('04', '/dev va /proc sirlari',
    'Linuxda hamma narsa fayl degan qoidaning amaliy isboti.',
    [['/dev (Qurilmalar)', 'Qattiq disklar (/dev/sda), veb-kamera yoki sichqoncha shu yerda maxsus fayl sifatida namoyon bo\'ladi.'], ['/proc (Jarayonlar)', 'RAM va ishlayotgan dasturlar haqidagi ma\'lumotlar go\'yoki matnli fayllar ko\'rinishida yashaydi. Haqiqiy diskda joy olmaydi.']],
    code('$ cat /proc/meminfo\nMemTotal:        8012340 kB\nMemFree:         1203400 kB\n\n$ ls -l /dev/sda\nbrw-rw---- 1 root disk 8, 0 /dev/sda'),
    'Nima uchun /proc ichidagi fayllarni nano orqali o\'zgartirib bo\'lmaydi?', 'Ular faqat virtual o\'qish uchun mo\'ljallangan tizim oynasidir, haqiqiy fayllar emas.',
    '/proc ni ko\'zgu, /dev ni eshik deb tasavvur qilishlariga yordam bering.');

  // 05: Terminal buyruqlari
  add('05', 'Nisbiy va mutlaq (absolute/relative) yo\'llar',
    'Mutlaq yo\'l doim / (ildiz) dan boshlanadi. Nisbiy yo\'l esa siz turgan joydan hisoblanadi.',
    [['Mutlaq (Absolute)', '/var/log/syslog — qayerda turishingizdan qat\'iy nazar aniq manzil.'], ['Nisbiy (Relative)', 'log/syslog — hozirgi papkadan boshlab qidiriladi. / (slesh) bilan boshlanmaydi.']],
    rows(['TURGAN JOY', 'BUYRUQ', 'QAYERGA BORILDI?'], ['/home/ali', 'cd /etc', '/etc (Mutlaq)'], ['/home/ali', 'cd Desktop', '/home/ali/Desktop (Nisbiy)']),
    '/home/ali papkasida turib "cd etc" (sleshsiz) deb yozsangiz nima bo\'ladi?', 'Xato beradi (agar ali papkasida etc nomli papka bo\'lmasa), chunki u nisbiy qidiradi.',
    'Nuqta (.) va ikki nuqta (..) nisbiy yo\'l belgisi ekanligini mashq orqali ko\'rsating.');

  add('05', 'Fayl va papkalarni xavfsiz o\'chirish (rm)',
    'rm buyrug\'i faylni "Korzina"ga tashlamaydi. U faylni butunlay yo\'q qiladi.',
    [['rm fayl.txt', 'Bitta faylni o\'chiradi.'], ['rm -r papka', 'Papkani va uning ichidagi hamma narsani (recursive) o\'chiradi.']],
    code('$ ls\nmalumot.txt  loyiha_papka\n$ rm malumot.txt\n$ rm -r loyiha_papka'),
    'rm -rf / buyrug\'i nega xavfli?', 'U butun tizimning bosh (ildiz) papkasidan boshlab hamma narsani majburan o\'chiradi. OS ishdan chiqadi.',
    'Sistemani tozalashda rm buyrug\'iga ehtiyotkor bo\'lishni qat\'iy tayinlang.');

  // 06: Qidiruv va tahrirlash
  add('06', 'Faylga yozish: > va >> farqi',
    'Matnni faylga yo\'naltirish terminalning kuchli tomonlaridan biridir.',
    [['> (Qayta yozish)', 'Fayl ichidagi eski ma\'lumotni o\'chirib, o\'rniga yangisini yozadi.'], ['>> (Qo\'shish)', 'Fayl oxiriga ma\'lumotni qo\'shadi, eski matn saqlanib qoladi.']],
    rows(['BUYRUQ', 'NATIJA'], ['echo "A" > fayl', 'Fayl ichida faqat "A" bo\'ladi'], ['echo "B" >> fayl', 'Fayl ichida "A" va pastdan "B" bo\'ladi']),
    'Log faylga ma\'lumot yozmoqchisiz. Qaysi belgidan foydalanasiz?', '>> belgisi orqali, chunki log faylga faqat qo\'shimcha qilinishi kerak, eskilari o\'chirilmasligi shart.',
    'Kichik xato katta muammoga (loglarni tasodifan > bilan o\'chirib yuborishga) olib kelishini tushuntiring.');

  add('06', 'find buyrug\'ining yashirin kuchi',
    'find shunchaki nom qidirmaydi, u vaqt, hajm va tur bo\'yicha qidirishi mumkin.',
    [['Hajm bo\'yicha', 'find / -size +1G (1 GB dan katta fayllarni qidiradi)'], ['Vaqt bo\'yicha', 'find . -mtime -7 (oxirgi 7 kunda o\'zgartirilgan fayllarni qidiradi)']],
    code('$ find /var/log -name "*.log" -mtime -3\n/var/log/syslog\n/var/log/auth.log\n\n# 50MB dan katta fayllar\n$ find /home -size +50M'),
    'Server diskida joy qolmadi. Qanday qilib eng katta fayllarni topish mumkin?', 'find / -size +500M buyrug\'i orqali yarim gigabaytdan katta fayllarni topish mumkin.',
    'find va grep farqi: find tashqi ko\'rinish (nom, hajm), grep esa ichki mazmun qidiradi.');

  // 07: Ruxsatlar
  add('07', 'Octal ruxsatlar: chmod 755 siri',
    'Ruxsatlarni harf (rwx) o\'rniga raqamlar orqali tez hisoblash mumkin.',
    [['Matematika', 'Read (r) = 4, Write (w) = 2, Execute (x) = 1.'], ['Yig\'indi', 'Agar o\'qish va yozish kerak bo\'lsa: 4 + 2 = 6 (rw-). Barchasi kerak bo\'lsa: 4 + 2 + 1 = 7 (rwx).']],
    rows(['KIMGA?', 'RUXSAT', 'HISOB'], ['Egasi (User)', 'r w x', '4+2+1 = 7'], ['Guruh (Group)', 'r - x', '4+0+1 = 5'], ['Boshqalar (Others)', 'r - x', '4+0+1 = 5']),
    'chmod 400 nima degani?', 'Faqat egasi o\'qiy oladi (r--). Guruh va boshqalar hech narsa qila olmaydi. Bu SSH maxfiy kalitlar uchun ishlatiladi.',
    'Xavfsizlik nuqtai nazaridan fayllarga minimum kerakli ruxsat (Least Privilege) berish tamoyilini yoritib bering.');

  add('07', 'Kataloglar uchun Execute (x) nimani bildiradi?',
    'Fayl uchun execute — uni dastur kabi ishga tushirish. Katalog uchun esa ma\'nosi butunlay boshqacha.',
    [['O\'qish (r)', 'Katalog ichidagi fayllar ro\'yxatini (ls) ko\'rish mumkin.'], ['Bajarish (x)', 'Katalog ichiga kirish (cd) va undagi fayllarni o\'qish/yozish ruxsatiga ega bo\'lish.'], ['Yozish (w)', 'Katalogda fayl yaratish yoki o\'chirish (lekin x ruxsati bo\'lishi shart).']],
    rows(['RUXSAT', 'QILA OLADI', 'QILA OLMAYDI'], ['Katalogda faqat r', 'ls (ro\'yxat ko\'rish)', 'cd qila olmaydi, faylni o\'qiy olmaydi'], ['Katalogda r va x', 'ls, cd, faylni cat', 'Fayl yarata/o\'chira olmaydi']),
    'Agar papkada (x) ruxsati olingan bo\'lsa, u yerdagi hamma fayllar (r) bo\'lsa ham o\'qiladimi?', 'Yo\'q, katalog ichiga kirib (x) bo\'lmagani uchun ichidagi fayllarga umuman yetib bo\'lmaydi.',
    'Katalog uchun x bu "kirish/o\'tish eshigi" ekanligini aytib bering.');

  // 08: Sudo va foydalanuvchilar
  add('08', 'su va sudo farqi',
    'Ikkisi ham ruxsatlarni oshiradi, lekin turli yondashuv bilan.',
    [['su (substitute user)', 'Butunlay root (yoki boshqa user) profiliga o\'tib olish. Siz endi u odamsiz.'], ['sudo (superuser do)', 'Faqat bitta navbatdagi buyruqni superuser nomidan bajarish, profilingiz o\'zgarmaydi.']],
    code('$ su -\nPassword: \nroot@server:~# \n\n$ sudo apt update\n[sudo] password for ali:'),
    'Nima uchun su o\'rniga sudo ishlatish xavfsizroq?', 'Sudo orqali faqat bitta buyruq bajariladi va bu loglarda kim qachon bajargani qayd etiladi. Auditoriya va xavfsizlik uchun qulay.',
    'Serverlarda root bilan bevosita kirish nima uchun bloklanishini tushuntiring.');

  add('08', '/etc/passwd va /etc/shadow sirlari',
    'Foydalanuvchilar va parollar qayerda va qanday saqlanadi?',
    [['/etc/passwd', 'Barcha foydalanuvchilar ro\'yxati. Parol o\'rniga "x" yozilgan. Hamma o\'qiy oladi.'], ['/etc/shadow', 'Haqiqiy parollar shifrlangan (hash qilingan) holda saqlanadi. Faqat root o\'qiy oladi.']],
    code('$ cat /etc/passwd | grep ali\nali:x:1000:1000::/home/ali:/bin/bash\n\n$ sudo cat /etc/shadow | grep ali\nali:$6$aBcDeF...:18000:0:99999:7:::'),
    'Nima uchun parol to\'g\'ridan-to\'g\'ri /etc/passwd faylida saqlanmaydi?', 'Chunki /etc/passwd faylini har qanday dastur o\'qiy olishi kerak (masalan, ls kimning fayli ekanini bilishi uchun), parollar esa sir bo\'lishi shart.',
    'Parol haqiqiy matn emas, uning HASH ko\'rinishi saqlanishiga alohida urg\'u bering.');

  // 09: Paketlar
  add('09', 'Apt qayerdan yuklaydi?',
    'Apt paketlarni shunchaki internetdan qidirmaydi, u "omborxona" (repository) ro\'yxatidan izlaydi.',
    [['/etc/apt/sources.list', 'Bu faylda rasmiy Ubuntu/Debian omborxonalari URL manzillari saqlanadi.'], ['PPA', 'Agar dastur rasmiy omborda bo\'lmasa, shaxsiy paket arxivlari (PPA) qo\'shish mumkin.']],
    code('$ cat /etc/apt/sources.list\ndeb http://archive.ubuntu.com/ubuntu focal main\n\n$ sudo add-apt-repository ppa:ondrej/php\n$ sudo apt update'),
    'Nima uchun paket o\'rnatishdan oldin doim "apt update" qilish tavsiya qilinadi?', '"update" yangi dastur yuklamaydi, u shunchaki omborlardan dasturlarning so\'nggi versiyalari va manzillari ro\'yxatini yangilaydi (katalogni yangilaydi).',
    'apt update (ro\'yxatni yangilash) va apt upgrade (dasturni yangilash) farqiga to\'xtaling.');

  // 10: Loglar
  add('10', 'journalctl va xizmatlarni kuzatish',
    'Zamonaviy Linux larda barcha loglarni markaziy systemd-journald yig\'adi.',
    [['Aniq qidiruv', 'grep yordamida izlash shart emas. journalctl xizmat nomi va vaqt bo\'yicha filtrlash imkonini beradi.'], ['Vaqt oraliqlari', '--since "1 hour ago" kabi buyruqlar yordamida qidiruvni toraytirish mumkin.']],
    rows(['BUYRUQ', 'QANDAY LOGLAR?'], ['journalctl -u nginx', 'Faqat nginx web-serveriga tegishli'], ['journalctl -f', 'So\'nggi loglarni real vaqtda kuzatish'], ['journalctl --since today', 'Bugungi barcha voqealar']),
    'Agar nginx ishlamay qolsa, xatoni topishning eng tez yo\'li qanday?', 'journalctl -u nginx --since "10 minutes ago" kabi buyruq bilan faqat uning xatolarini tekshirish.',
    'Eski /var/log/messages va yangi journalctl yondashuvi orasidagi o\'tish haqida qisqacha aytib bering.');

  // 11: Jarayonlar
  add('11', 'Zombi va Yetim (Orphan) jarayonlar',
    'Jarayonlar oila kabi ishlaydi: Ota jarayon bolalarini yaratadi va ularning o\'limini (natijasini) kutadi.',
    [['Zombi (Zombie)', 'Bola jarayon o\'z ishini tugatgan, lekin ota jarayon uning holatini o\'qimagan. U ishlamayapti, lekin jadvalda joy eplayapti.'], ['Yetim (Orphan)', 'Bola jarayon ishlayotgan paytda ota jarayon o\'lib qolsa, tizimdagi eng bosh jarayon (init/systemd) uni o\'z qaramog\'iga oladi.']],
    rows(['HOLAT', 'BELGISI (STAT)', 'ISHLAYAPTIMI?'], ['Running', 'R', 'Ha'], ['Sleeping', 'S', 'Kutishda (xotirada)'], ['Zombie', 'Z', 'Yo\'q, o\'lik qoldiq']),
    'Zombi jarayonni "kill -9" orqali o\'ldirsa bo\'ladimi?', 'Yo\'q, zombi allaqachon o\'lik. Uni yo\'qotish uchun uning ota jarayoniga (PPID) kill yuborish kerak.',
    'Jarayonlar daraxti (pstree) tushunchasini vizual tushuntiring.');

  // 12: Xizmatlar
  add('12', 'Systemd Unit fayllari siri',
    'Xizmatlar shunchaki sehrli ishga tushmaydi, ularni ishga tushirish qoidalari matn faylida saqlanadi.',
    [['.service fayli', '/etc/systemd/system/ yoki /lib/systemd/system/ ichida joylashadi.'], ['Tarkibi', 'Dastur qayerda ekanligi (ExecStart), kim nomidan ishlashi (User) va o\'chib qolsa nima qilish kerakligi (Restart).']],
    code('[Unit]\nDescription=Mening Node.js ilovam\n\n[Service]\nUser=ali\nExecStart=/usr/bin/node /home/ali/app.js\nRestart=always\n\n[Install]\nWantedBy=multi-user.target'),
    'Restart=always nimani anglatadi?', 'Agar dastur kutilmaganda xatolik bilan yopilsa (crash), tizim uni avtomatik ravishda qayta ishga tushiradi.',
    'Systemd yordamida o\'z skriptlarini doimiy ishlaydigan xizmatga aylantirish osonligini tushuntiring.');

  // 13: Cron
  add('13', 'Cron va Systemd Timers farqi',
    'Rejali vazifalar uchun cron klassik, ammo yagona variant emas.',
    [['Cron', 'Oddiy matn qoidalari, sozlash juda oson. Ammo kompyuter o\'chib qolgan paytda vaqt o\'tib ketsa, keyin bajarmaydi.'], ['Systemd Timer', 'Zamonaviy, loglari journalctl ga tushadi, va agar tizim o\'chib qolgan bo\'lsa, yoqilganda o\'tkazib yuborilgan vazifani bajarish (catch-up) funksiyasi bor.']],
    rows(['XUSUSIYAT', 'CRON', 'SYSTEMD TIMER'], ['Sintaksis', '* * * * * (Juda oson)', 'Unit fayl + Timer fayl'], ['Log kuzatish', '/var/log/syslog dan qidirish', 'journalctl -u orqali qulay'], ['O\'tkazib yuborilganlar', 'Unutiladi', 'Persistent rejimi (Bajariladi)']),
    'Boshlang\'ich qaysi biridan foydalangani ma\'qul?', 'Oddiy ishlar (log tozalash, oddiy backup) uchun cron ancha qulay. Kattaroq infratuzilmada Systemd timers xavfsizroq.',
    'Cron sintaksisi yodlab qolinmaydigan bo\'lsa, "crontab guru" kabi saytlardan foydalanishni maslahat bering.');

  // 14: Tarmoq TCP/UDP
  add('14', 'TCP vs UDP: Konvert va Ochiq xat',
    'Ikkisi ham transport qatlami, ammo ishonchlilik darajasi ikki xil.',
    [['TCP (Ishonchli)', 'Xabar borganini tekshiradi, tartib bilan yetkazadi (3-way handshake). Veb (HTTP) va fayllar uchun.'], ['UDP (Tezkor)', 'Shunchaki yuboradi, tekshirmaydi. O\'yinlar, video zaryad va DNS uchun ishlatiladi.']],
    rows(['XUSUSIYAT', 'TCP', 'UDP'], ['Ulanish (Handshake)', 'Bor (SYN, SYN-ACK, ACK)', 'Yo\'q (To\'g\'ridan-to\'g\'ri)'], ['Kafolat', 'Tushib qolsa qayta yuboradi', 'Kafolat yo\'q'], ['Tezlik', 'Sekinroq', 'Tezroq']),
    'Nima uchun video qo\'ng\'iroqlar ko\'pincha UDP da ishlaydi?', 'Chunki videoda 1-2 kadr (paket) yo\'qolib qolsa, tasvir biroz qotadi va davom etadi. TCP kabi to\'xtab qolib o\'sha kadrni qayta so\'rash videoni juda sekinlashtirardi.',
    'TCP dagi 3 bosqichli qo\'l siqishuvni (3-way handshake) do\'stiga qo\'ng\'iroq qilishga o\'xshating (Alo?! Eshitilyaptimi? Ha, gapiraver).');

  // 15: Tarmoq interfeyslari
  add('15', 'Loopback interfeysi (127.0.0.1) nima?',
    'Bu hech qachon kompyuterdan tashqariga chiqmaydigan "ichki" tarmoq manzilidir.',
    [['Maqsadi', 'Xuddi shu kompyuterning o\'zidagi ikki dastur (masalan Frontend va Backend) internetga chiqmasdan tezkor va xavfsiz bog\'lanishi uchun.'], ['Xavfsizlik', 'Agar ma\'lumotlar bazasi faqat 127.0.0.1 ni eshitsa, tashqaridan (xakerlar) unga umuman ulanib bo\'lmaydi.']],
    code('$ ping 127.0.0.1\n64 bytes from 127.0.0.1: icmp_seq=1 ttl=64 time=0.012 ms\n# Vaqt aqlbovar qilmas darajada qisqa, chunki simlarga chiqmaydi.'),
    'Localhost va 127.0.0.1 bir xilmi?', 'Ha, /etc/hosts faylida localhost so\'zi avtomatik ravishda 127.0.0.1 manziliga burib (map qilib) qo\'yilgan.',
    'Dasturlashda "Serverni localhost:3000 da ishga tushirish" nima ma\'no anglatishini tushuntiring.');

  // 16: Diagnostika
  add('16', 'Ping aslidai qanday ishlaydi? (ICMP)',
    'Ping bu HTTP emas, TCP ham emas. U alohida maxsus diagnostika protokoli (ICMP).',
    [['ECHO REQUEST', 'Men sendan ovoz kutyapman. Tirikmisan?'], ['ECHO REPLY', 'Ha, men shu yerdaman.'], ['TTL (Time to Live)', 'Paket adashib tarmoqda abadiy aylanib yurmasligi uchun berilgan qadamlar soni (routerdan o\'tganda 1 ga kamayadi).']],
    rows(['NATIJA', 'MA\'NOSI'], ['time=12ms', 'Yaxshi ulanish va tezkor javob'], ['Request timeout', 'Server o\'chiq yoki ping so\'rovlarini firewall orqali bloklagan'], ['Destination Host Unreachable', 'Sizning routeringiz yo\'l topa olmadi (marshrut yo\'q)']),
    'Agar ping javob bermasa, server yuz foiz o\'chiq deganimi?', 'Yo\'q, ko\'plab zamonaviy serverlar va xavfsizlik devorlari xavfsizlik (DDoS ning oldini olish) maqsadida ICMP echo so\'rovlarini umuman e\'tiborsiz qoldiradi (bloklaydi).',
    'Ping dan server ishlashini tekshirish uchun emas, tarmoq ochiqligini tekshirish uchun foydalanish kerakligini ta\'kidlang.');

  // 17: Firewall
  add('17', 'Stateful va Stateless firewall farqi',
    'Zamonaviy firewall lar aqlli (stateful). Ular ulanish holatini eslab qolishadi.',
    [['Stateless (Eski)', 'Har bir paketni alohida ko\'rib chiqadi. Ichkaridan tashqariga so\'rov ketsa, tashqaridan kelayotgan javobni "bu keluvchi trafik-ku" deb bloklab qo\'yishi mumkin (agar javob uchun ham qoida yozilmasa).'], ['Stateful (Zamonaviy)', 'Agar siz serverdan turib biror saytga (masalan Google ga) kirsangiz, u bu "siz boshlagan suhbat" ekanligini eslab qoladi va Googledan qaytgan javobni bloklamaydi. iptables va ufw aynan stateful hisoblanadi.']],
    flow('SERVER -> "update" so\'rovi (Port 80) ketyapti', 'UFW: "Suhbat ochildi, eslab qoldim"', 'UPDATE SERVER -> Javob qaytyapti', 'UFW: "Bu tanish suhbat, o\'tkazamiz"'),
    'Agar UFW da barcha kiruvchi trafikni (Incoming = Deny) bloklab qo\'ysam, serverim internetdan yangilanishlarni (apt update) yuklab ololmaydimi?', 'Bemalol yuklab oladi. Chunki so\'rovni siz boshladingiz (Outgoing = Allow), UFW uning javobini stateful bo\'lgani uchun kirishga qo\'yib yuboradi.',
    'Boshlang\'ich sozlama sifatida doim "Incoming=Deny, Outgoing=Allow" qilinishi sababini yoriting.');

  // 18: Ochiq portlar
  add('18', 'LISTEN, ESTABLISHED va TIME_WAIT',
    'ss yoki netstat buyrug\'ini berganingizda, portlarning har xil holatlarini ko\'rasiz.',
    [['LISTEN', 'Xizmat (masalan nginx) ishlayapti va kimdir unga ulanishini kutmoqda (eshitmoqda).'], ['ESTABLISHED', 'Siz va server o\'rtasida hozir ayni paytda faol muloqot ketmoqda. Data almashilyapti.'], ['TIME_WAIT', 'Ulanish tugatildi, lekin paketlar yo\'lda qolib ketgan bo\'lishi ehtimoli uchun port bir necha soniya "dam olayapti".']],
    rows(['HOLAT', 'XAVF DARAJASI', 'MA\'NO'], ['LISTEN', 'Potensial xavf (Agar eshik xato ochilgan bo\'lsa)', 'Server hushyor turibdi'], ['ESTABLISHED', 'Kuzatish kerak (Begona IP lar bormi?)', 'Faol suhbat'], ['TIME_WAIT', 'Xavfsiz', 'Yopilgan suhbat qoldig\'i']),
    'Nima uchun "0.0.0.0:80" va "127.0.0.1:3306" orasida katta xavfsizlik farqi bor?', '0.0.0.0 butun dunyo uchun internetga eshik ochadi (veb-serverlar uchun zarur). 127.0.0.1 esa faqat serverning o\'z ichidan eshitadi (ma\'lumotlar bazasi uchun ideal himoya).',
    'Barcha ma\'lumotlar bazalari faqat 127.0.0.1 ga bog\'lanishi (bind) kerakligini xavfsizlik qoidasi sifatida aytib o\'ting.');

  // 19: SSH va kalitlar
  add('19', 'Asimmetrik shifrlash (Ochiq va Maxfiy kalit)',
    'Nima uchun parol o\'rniga uzun matnli kalitlar ishlatamiz? Bu qanday ishlaydi?',
    [['Matematik qulf (Maxfiy kalit)', 'Bu sizning kompyuteringizda qoladigan, hech kimga berilmaydigan fayl (id_rsa). U orqali shifrlangan narsalarni o\'qiysiz va o\'zingiz ekanligingizni isbotlaysiz.'], ['Ochiq kalit (Public key)', 'Bu qulfning ochiq nusxasi (.pub). Uni istalgan serverga berishingiz mumkin. Server shifrlangan masalani yuboradi, uni faqat sizning maxfiy kalitingiz yecha oladi.']],
    flow('SERVER ochiq kalitingiz bilan matematik jumboq (shifr) yaratadi', 'Sizga yuboradi (Parolingiz qanaqa demaydi)', 'Siz maxfiy kalit bilan yechib javobni berasiz', 'SERVER ulanishga ruxsat beradi'),
    'Agar ochiq kalitim (.pub) xakerlar qo\'liga tushib qolsa, ular mening serverimga kira oladimi?', 'Yo\'q, ochiq kalit faqat shifrlash (qulflash) uchun xizmat qiladi. Qulfni ochish (kirish) uchun ularda sizdagi maxfiy kalit bo\'lishi kerak.',
    'Ushbu texnologiya butun internetdagi HTTPS va kriptovalyutalar asosi ekanligini ta\'kidlang.');

  // 20: SSH sirlari
  add('20', 'SSH Port Forwarding (Tunneling)',
    'SSH shunchaki terminalga emas, xavfsiz tunnelga aylanishi ham mumkin.',
    [['Tunnel', 'Siz kofe-shopning ochiq va xatarli Wi-Fi tarmog\'ida turib, SSH orqali o\'z serveringizga xavfsiz "quvur" tortasiz.'], ['Lokal Forwarding (-L)', 'Serverdagi bloklangan 3306 (MySQL) portini SSH quvuri orqali o\'zingizning lokal localhost:3306 portingizga olib kelasiz.']],
    code('# Serverdagi 3306 ni o\'zimning kompyuterimning 8888-portiga ulash\n$ ssh -L 8888:127.0.0.1:3306 ali@192.168.1.10\n\n# Endi o\'zimning PC dagi 8888 ga ulanishim serverdagi DB ga tushadi'),
    'Bu xakerlik usulimi?', 'Buni hakerlar ham (pivoting uchun), system administratorlar ham (xavfsiz boshqaruv uchun) har kuni ishlatadilar.',
    'Tunnel — portni internetga ochmasdan, ichkaridagi xizmatlarga xavfsiz yo\'l topishning ajoyib usulidir.');

  // 21: Kiberxavfsizlik asoslari
  add('21', 'DDoS hujumlar va Limitlar',
    'Server ishlayotgan bo\'lsa ham, uni to\'lib-toshib ketguncha so\'rovlar bilan cho\'ktirish mumkin (DDoS).',
    [['Tarmoq darajasi (L3/L4)', 'Juda katta hajmda paketlar yuborib server internet kanalini to\'ldirib tashlash (Bunga qarshi Cloudflare kabi CDN lar yordam beradi).'], ['Ilova darajasi (L7)', 'Web serverga ketma-ket murakkab bazaga murojaat qiladigan login so\'rovlarini yuborib CPU/RAM ni 100% ga chiqarish.']],
    rows(['HIMOYA VOSITASI', 'QANDAY YORDAM BERADI?'], ['fail2ban', 'Ko\'p marta noto\'g\'ri parol tergan IP ni avtomat bloklaydi'], ['Rate limiting (Nginx)', 'Bir IP dan sekuntiga 10 tadan ko\'p so\'rovni rad etadi (HTTP 429)'], ['Cloudflare WAF', 'Yomon va shubhali trafikni serverga yetib kelmasidan to\'xtatadi']),
    'Agar bitta xaker uyidagi kompyuterdan DDoS hujum qilsa, server tushib qoladimi?', 'Bitta kompyuter qilgan hujum DoS (Denial of Service) deyiladi, uni IP orqali oson bloklash mumkin. DDoS dagi birinchi D - "Distributed", ya\'ni butun dunyodagi minglab zararlangan kompyuterlardan (Botnet) bir vaqtda qilinadigan hujum.',
    'Xavfsizlik bitta dastur o\'rnatish emas, ko\'p qatlamli yondashuv ekanligini xulosa qiling.');

  // QO'SHIMCHA 6 TA SLAYD (Jami 60+ ga yetkazish uchun)
  // 05: Terminal (history)
  add('05', 'Terminal xotirasi (history va !)',
    'Buyruqlarni qayta-qayta yozib o\'tirmaslik uchun tarix va tezkor chaqiruvlardan foydalaning.',
    [['history', 'Siz yozgan oxirgi minglab buyruqlar ro\'yxatini raqamlangan holda chiqaradi.'], ['!raqam', '!154 yozsangiz, tarixning 154-qatoridagi buyruqni aynan takrorlaydi.'], ['!! (ikkita undov)', 'Eng oxirgi yozgan buyrug\'ingizni qaytaradi. Ko\'pincha "sudo !!" sifatida unutilgan sudo ni qo\'shish uchun ishlatiladi.']],
    code('$ apt update\nE: Could not open lock file - Permission denied\n$ sudo !!\n# Tizim buni "sudo apt update" deb tushunadi va bajaradi.'),
    'Ctrl+R klaviatura yorlig\'i nima uchun ishlatiladi?', 'Terminalda eski buyruqlarni matn bo\'yicha qidirish (Reverse Search) uchun. Eng ko\'p vaqt tejaydigan usullardan biri.',
    'Terminalda sichqoncha bilan nusxa ko\'chirishdan ko\'ra tarix va yorliqlardan foydalanish ancha professional ekanligini ta\'kidlang.');

  // 09: Paketlar (PPA)
  add('09', 'PPA xavflari (Personal Package Archives)',
    'Nima uchun har qanday saytdan ko\'rgan PPA ni terminalga kiritish xavfli?',
    [['Rasmiy emas', 'PPA dagi dasturlar Ubuntu yadro jamoasi tomonidan tekshirilmaydi. Uni istalgan shaxs, jumladan haker ham yaratgan bo\'lishi mumkin.'], ['Root ruxsati', 'Paket o\'rnatilayotganda pre-install skriptlar root huquqida ishlaydi, u tizimga virus yozib ketishi mumkin.']],
    flow('Siz apt install bajarmoqchisiz', 'Qaysidir notanish PPA ni (add-apt-repository) qo\'shasiz', 'Unga to\'liq ishonch bildirasiz', 'Xaker serveringizga kirish yo\'lini yaratadi'),
    'Agar kerakli dastur rasmiy omborda (repo) bo\'lmasa nima qilish kerak?', 'Ishonchli va ommabop dasturchilarning (masalan Docker, Nginx) o\'z rasmiy repolaridan foydalanish yoki iloj qadar Flatpak/Snap (izolyatsiyalangan) paketlardan foydalanish ma\'qul.',
    'Paketlarni ko\'r-ko\'rona internetdan topib o\'rnatish Windows dagi har qanday .exe ni yuklab olishdan ham xavfli ekanligini ayting.');

  // 11: Jarayonlar (Orqa fon)
  add('11', 'Jarayonlarni orqa fonga yashirish (&, bg, fg)',
    'Bitta terminal oynasida bir nechta dasturni bir vaqtda ishlatish sirlari.',
    [['& (Ampersand)', 'Buyruq oxiriga & qo\'ysangiz, u orqa fonda (background) ishga tushadi va terminalingizni band qilmaydi.'], ['Ctrl+Z va bg', 'Ishlayotgan jarayonni (masalan nano) Ctrl+Z bilan to\'xtatib turib, bg orqali orqa fonga o\'tkazish mumkin.'], ['fg (Foreground)', 'Orqa fondagi dasturni yana oldinga, sizning ekraningizga olib chiqadi.']],
    code('$ ping 8.8.8.8 > natija.txt &\n[1] 1425\n# Terminal ochiq qoldi. Ping esa fonda ketyapti.\n\n$ fg 1\n# Ping yana ekranga chiqdi.'),
    'Orqa fonda ishlayotgan jarayonni to\'xtatish (o\'ldirish) qanday bajariladi?', 'Avval fg orqali oldinga chaqirib Ctrl+C bosiladi yoki ps orqali PID topilib kill qilinadi.',
    'Serverlarda uzun ishlaydigan (masalan arxivlash) vazifalarni qanday qilib yopilib ketmasdan orqa fonda qoldirishni (tmux/screen) ko\'rsatib o\'ting.');

  // 15: IPv4 / IPv6
  add('15', 'ip addr dagi inet va inet6',
    'Nima uchun har bir qurilmada IP manzillar formati ikki xil ko\'rinadi?',
    [['IPv4 (inet)', 'Eski, hamma biladigan format (192.168.x.x). Manzillar jami 4.3 milliardta bo\'lib, tugab qolgan.'], ['IPv6 (inet6)', 'Yangi format, g\'ayritabiiy harf va sonlar (fe80::...). Manzillar shu qadar ko\'pki, har bir qum zarrasiga alohida IP berish mumkin.']],
    rows(['XUSUSIYAT', 'IPv4', 'IPv6'], ['Format', '192.168.1.1', '2001:0db8:85a3::8a2e:0370:7334'], ['Hajmi', '32 bit', '128 bit'], ['Ehtiyoj', 'NAT kerak bo\'ladi', 'NAT umuman kerak emas']),
    'Mening IPv4 manzilim (192.168.1.10) qanday qilib butun dunyoga ko\'rinadi?', 'U butun dunyoga umuman ko\'rinmaydi. U faqat uyingiz (yoki ofisingiz) ichida ishlaydi (Local/Private IP). Routeringiz uning ustidan bitta Public (umumiy) IP orqali niqoblaydi (NAT).',
    'Private (Lokal) va Public (Global) IP orasidagi farqni sodda misolda (ichki hovli va tashqi ko\'cha) tushuntiring.');

  // 17: NAT
  add('17', 'NAT (Network Address Translation) — Router siri',
    'Qanday qilib uydagi 10 ta qurilma internetga bitta IP orqali chiqadi?',
    [['Tarjimon', 'Uyingizdagi qurilmalar (192.168.x.x) to\'g\'ridan-to\'g\'ri internetga ulana olmaydi. Router ularning barcha xatlarini o\'z nomi (Public IP) bilan internetga yuboradi.'], ['Qaytgan javob', 'Javob kelganda, router xotirasiga (NAT table) qarab, bu xat qaysi telefon yoki kompyuterga tegishliligini topib olib kiritib yuboradi.']],
    flow('Sizning telefoningiz (192.168.1.5)', 'Routeringiz (Public IP: 94.20.x.x) "Bu mendan" deb o\'zgartiradi', 'Google Server (Javob qaytaradi)', 'Router qaysi qurilmaga tegishli ekanligini bilib, sizga uzatadi'),
    'Serverlarda nima uchun NAT ko\'pincha ishlatilmaydi?', 'Veb-serverlar butun dunyodan tashrif buyuruvchilarni to\'g\'ridan-to\'g\'ri qabul qilishi uchun uchinchi shaxslarsiz (real Public IP bilan) ishlashi kerak.',
    'Port Forwarding (kirish eshigini ochish) aynan shu NAT ning ichidan tashqariga tuynuk ochish ekanligini ayting.');

  // 21: Fail2ban
  add('21', 'Fail2ban qanday qilib xakerlarni bloklaydi?',
    'Bu dastur siz uxlab yotganingizda ham serveringizni himoya qiladigan eng oddiy va kuchli robot.',
    [['1. Log o\'qish', 'U sekundma-sekund /var/log/auth.log kabi jurnallarni tekshirib turadi.'], ['2. Qoidabuzarni topish', 'Agar bitta IP manzil ketma-ket 5 marta xato parol tersa, uni tutib oladi.'], ['3. Devor o\'rnatish', 'U IP manzilni darhol iptables/ufw ga yuborib, 10 daqiqaga (yoki butunlay) bloklab qo\'yadi.']],
    rows(['QADAM', 'FAIL2BAN AMALI', 'HAKER HOLATI'], ['1-xato parol', 'Logga yozildi. Fail2ban: 1', 'Yana urinib ko\'radi'], ['5-xato parol', 'Fail2ban limitga yetdi.', 'Bloklandi (Banned)'], ['Keyingi so\'rov', 'Iptables orqali rad etiladi', 'Timeout (Ulanib bo\'lmayapti)']),
    'Nima uchun fail2ban bo\'lsa ham SSH da parol o\'rniga kalit ishlatish tavsiya qilinadi?', 'Fail2ban 5 marta urinishga ruxsat beradi. Agar xakerning lug\'atidagi 3-parol to\'g\'ri chiqib qolsachi? Kalit tizimida esa parolni topib kirish degan narsa mutlaqo imkonsiz.',
    'Xavfsizlik qatlamlari — kalit asosiy eshikni himoya qiladi, fail2ban esa tinmay taqillatayotganlarni haydab yuboradi.');

  return units;
}

function expandLessons(baseSlides) {
  const units = detailedLessons();
  return baseSlides.flatMap(base => {
    const children = units.filter(unit => unit.topic === base.n);
    if (!children.length) return [base];
    return [base, ...children.map((unit, i) => ({
      n:`${base.n}.${i+1}`, topic:base.n, title:unit.title, category:base.category,
      tag:`Batafsil ${i+1} / ${children.length}`,
      foot:`${base.n}-mavzu · ${base.title}`,
      notes:unit.note, searchText:[unit.lead, ...unit.points.flat(), unit.question, unit.answer].join(' '),
      render:() => {
        const h = `<h1 class="hero-title" style="font-size:2.5rem">${unit.title}</h1><p class="lead">${unit.lead}</p>`;
        const p = `<div class="detail-points">${unit.points.map((pt,j)=>`<div class="numbered"><span>${String(j+1).padStart(2,'0')}</span><div><h3>${pt[0]}</h3><p>${pt[1]}</p></div></div>`).join('')}</div>`;
        let ex = '';
        if (unit.example.kind === 'table') ex = `<div class="detail-table"><table class="data-table"><thead><tr>${unit.example.heads.map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody>${unit.example.items.map(row=>`<tr>${row.map(c=>`<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
        else if (unit.example.kind === 'code') ex = `<pre class="detail-code code-window" style="font-size:0.85rem">${unit.example.text}</pre>`;
        else ex = `<ol class="detail-flow">${unit.example.items.map(item=>`<li>${item}</li>`).join('')}</ol>`;
        
        return `<div class="slide-layout"><div class="slide-copy">${h}${p}</div><div><div class="panel dark-panel grid-bg"><div class="panel-label"><span>BATAFSIL</span></div>${ex}</div><div class="lesson-check" style="margin-top:2rem"><span class="eyebrow" style="color:var(--accent)">O'ZINGIZNI TEKSHIRING</span><p><strong>${unit.question}</strong></p><details style="margin-top:0.5rem"><summary style="cursor:pointer;color:var(--text-light)">Javob va tushuntirishni ko'rish</summary><p style="margin-top:0.5rem;padding-left:1rem;border-left:2px solid var(--accent)">${unit.answer}</p></details></div></div></div>`;
      }
    }))];
  });
}
