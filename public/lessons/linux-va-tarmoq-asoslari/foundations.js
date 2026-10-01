'use strict';

// Step-by-step diagrams for Linux & Networking foundations
const foundationFlows = {
  '01': [
    [['FOYDALANUVCHI', 'TERMINAL'], 'Linux bilan muloqot: terminal orqali matnli buyruqlar yuborilib, natija ko\'rsatiladi.'],
    [['BUYRUQ', 'SHELL (bash)', 'YADRO'], 'Shell buyruqni tahlil qiladi va Linux yadrosi kerakli amalni bajaradi.'],
    [['YADRO', 'APPARAT (CPU, RAM, Disk)'], 'Yadro apparat resurslarini boshqaradi va dasturlarga xizmat qiladi.'],
    [['DASTUR', 'TIZIM CHAQIRUVI', 'YADRO', 'APPARAT'], 'Dasturlar bevosita apparatga emas, yadro orqali murojaat qiladi.']
  ],
  '04': [
    [['/', 'Ildiz (root) katalog'], '/— butun fayl tizimining boshlang\'ich nuqtasi.'],
    [['/', '/home · /etc · /var · /usr'], 'Asosiy kataloglar: /home — foydalanuvchilar, /etc — sozlamalar, /var — o\'zgaruvchan ma\'lumotlar.'],
    [['~', '/home/username'], '~ belgisi joriy foydalanuvchining uy katalogi: /home/username.'],
    [['/etc', '/etc/passwd · /etc/hosts · /etc/ssh'], '/etc — tizim sozlamalari: foydalanuvchilar, hosts va SSH konfiguratsiyasi.']
  ],
  '07': [
    [['ls -la'], 'ls — katalog mazmunini ko\'rsatadi. -l uzun format, -a yashirin fayllarni ham ko\'rsatadi.'],
    [['-rw-r--r-- 1 ali ali 1024 ...', 'fayl.txt'], 'Birinchi belgi: - fayl, d katalog. Keyingi uchta belgi: egasining ruxsati.'],
    [['rwx → 7', 'rw- → 6', 'r-x → 5', 'r-- → 4'], 'Ruxsat bitlari: r=4, w=2, x=1. chmod 644 → egasi rw-, guruh va boshqalar r--.'],
    [['chmod 755 fayl', 'chown ali:ali fayl'], 'chmod — ruxsatni o\'zgartirish, chown — egalikni o\'zgartirish.']
  ],
  '11': [
    [['ps aux'], 'ps aux — barcha ishlaydigan jarayonlarni ko\'rsatadi.'],
    [['PID', 'PPID', 'STAT'], 'PID — jarayon ID, PPID — ota-jarayon ID, STAT — holat (R=ishlayapti, S=uxlayapti).'],
    [['kill PID', 'kill -9 PID'], 'kill — jarayonga signal yuboradi. -9 (SIGKILL) — majburiy to\'xtatish.'],
    [['top / htop'], 'top va htop — real vaqtda CPU va RAM foydalanishini ko\'rsatadi.']
  ],
  '15': [
    [['ip addr show'], 'ip addr — tarmoq interfeyslari va IP manzillarini ko\'rsatadi.'],
    [['eth0', 'lo', 'wlan0'], 'eth0 — simli, wlan0 — simsiz, lo — loopback (127.0.0.1) interfeyslari.'],
    [['ip route show'], 'ip route — routing jadvalini ko\'rsatadi. default — default gateway.'],
    [['ping 8.8.8.8', 'ICMP ECHO REQUEST / REPLY'], 'ping — ICMP echo request yuboradi. TTL va javob vaqtini ko\'rsatadi.']
  ],
  '19': [
    [['ssh user@host'], 'SSH — Secure Shell. Masofaviy serverga xavfsiz ulanish.'],
    [['HANDSHAKE', 'KEY EXCHANGE', 'HIMOYALANGAN KANAL'], 'SSH ulanishida kalitlar almashinadi va shifrlangan kanal yaratiladi.'],
    [['~/.ssh/id_rsa', '~/.ssh/id_rsa.pub'], 'Kalit juftligi: shaxsiy kalit (id_rsa) va ochiq kalit (id_rsa.pub).'],
    [['~/.ssh/authorized_keys'], 'Server ochiq kalitni saqlab, ulanishda tekshiradi. Parol kerak bo\'lmaydi.']
  ]
};

function foundationDiagram(n, label) {
  return panel(label, `<div class="foundation-diagram" id="foundationDiagram"></div><p class="board-description" id="foundationDescription" aria-live="polite"></p><div class="step-controls"><button class="small-button" data-action="step-back" aria-label="Oldingi bosqich">←</button><button class="small-button" data-action="step-next">Keyingi bosqich →</button><button class="small-button" data-action="step-reset" aria-label="Boshidan ko'rsatish">↺</button><span class="step-text" id="stepCounter">01 / ${foundationFlows[n].length}</span></div>`, 'BOSQICHMA-BOSQICH');
}

function updateFoundationStep(n, index) {
  const [nodes, description] = foundationFlows[n][index];
  document.getElementById('foundationDiagram').innerHTML = nodes.map((node, i) => `${i ? '<span class="board-arrow" aria-hidden="true">→</span>' : ''}<span class="board-node">${esc(node)}</span>`).join('');
  document.getElementById('foundationDescription').textContent = description;
}

function foundationSlides() {
  const ask = text => callout('KEYINGI SAVOL', text);
  const route = nodes => `<div class="route-diagram">${nodes.map((node, i) => `${i ? '<span class="board-arrow" aria-hidden="true">↓</span>' : ''}<div class="route-node">${node}</div>`).join('')}</div>`;
  return [
    {
      n:'01', title:'Linux nima va qanday ishlaydi?', category:'BOSHLANISH', tag:'Yadro / Shell / Terminal',
      foot:'Linux — yadro. GNU/Linux — to\'liq operatsion tizim. Terminal ular bilan muloqot vositasi.',
      notes:'Terminal, shell va yadro tushunchalarini ajrating. Bash — ko\'p tarqalgan shell. Yadro apparat bilan muloqot qiladi; shell esa foydalanuvchi bilan. Buyruq satri — grafik muhitsiz ishlaydigan muhim ko\'nikma.',
      render:() => layout(heading('Bitta buyruq.<br><span class="accent">Butun tizim.</span>','Terminal orqali yozgan har bir buyruq shell, yadro va apparat bilan muloqotni boshlaydi.') + `<div class="mini-list">${point('01','Terminal','Matnli interfeysda buyruq yoziladigan muhit.')}${point('02','Shell (bash)','Buyruqni tahlil qilib, yadro bilan muloqot qiladigan dastur.')}${point('03','Yadro (Kernel)','Apparat resurslarini boshqaruvchi Linux ning asosiy qismi.')}</div>`, foundationDiagram('01', 'BUYRUQDAN APPARATGACHA'))
    },
    {
      n:'02', title:'Nima uchun Linux?', category:'BOSHLANISH', tag:'Server / Tarmoq / Xavfsizlik',
      foot:'Linux — server, tarmoq jihozlari, bulut infratuzilmasi va kiberxavfsizlikda asosiy platforma.',
      notes:'Internet serverlarining aksariyati Linux-da ishlaydi. Kiberxavfsizlik sohasidagi ko\'plab vositalar Linux-da yaratilgan. Android ham Linux yadrosi asosida qurilgan. Bu dars amaliy ko\'nikmaga yo\'naltirilgan.',
      render:() => layout(heading('Nima uchun<br><span class="accent">Linux?</span>','Server va tarmoq sohasida Linux bilimi — zaruriy ko\'nikma.') + table(['SOHa','LINUX QAYERDA?'],[['Web serverlar','Apache, Nginx — asosan Linux'],['Bulut','AWS, GCP, Azure — Linux VM\'lar'],['Tarmoq','Router, switch firmwarelari'],['Kiberxavfsizlik','Kali Linux, penetration testing']]) + ask('Linux-da ishlash uchun eng muhim narsa nima?'), panel('LINUX TARQALISHI', `<div class="internet-cloud"><div class="internet-title">${icon('server')}<strong>LINUX</strong></div><div class="service-grid">${['WEB SERVERLAR','BULUT','ANDROID','KALI LINUX'].map(x=>`<div class="route-node">${x}</div>`).join('')}</div><p class="art-caption">Bitta yadro. Yuzlab tarqatmalar.</p></div>`))
    },
    {
      n:'03', title:'Distrobyutsiya nima?', category:'LINUX TUSHUNCHALARI', tag:'Ubuntu / Debian / Kali',
      foot:'Distro = Linux yadro + GNU vositalar + paket menejeri + sozlamalar to\'plami.',
      notes:'Ubuntu — boshlang\'ichlar uchun qulay. Debian — barqaror. Kali — kiberxavfsizlik uchun maxsus. CentOS/RHEL — korxona uchun. Bu darsda Ubuntu/Debian asosidagi buyruqlar ishlatiladi.',
      render:() => layout(heading('Bir yadro.<br><span class="accent">Ko\'p tarqatmalar.</span>','Har bir distro bir xil Linux yadrosi ustiga qurilgan, ammo paket menejeri, maqsadi va sozlamalari farq qiladi.') + table(['DISTRO','XUSUSIYAT','MAQSAD'],[['Ubuntu','apt, GUI, qulay','Boshlash, server'],['Debian','apt, barqaror','Server, server'],['Kali','apt, xavfsizlik vositalari','Pentest'],['Alpine','apk, minimal','Container, bulut'],['RHEL/Rocky','dnf, korxona','Korporativ']]) + callout('BU DARSDA','Ubuntu va Debian asosidagi buyruqlar ishlatiladi. `apt` paket menejeri.'), panel('DISTRO TANLASH', route(['YADRONI TANLAYMIZ → Linux','PAKET MENEJER → apt / dnf / pacman','MAQSAD → Server / Desktop / Pentest','TARQATMA → Ubuntu / Kali / Arch'])))
    },
    {
      n:'04', title:'Fayl tizimi ierarxiyasi', category:'FAYL TIZIMI', tag:'FHS / Kataloglar',
      foot:'FHS — Filesystem Hierarchy Standard. Linux\'da hamma narsa fayldir.',
      notes:'/proc — jarayon axboroti, /sys — qurilma ma\'lumoti, /dev — qurilma fayllari. /tmp — vaqtinchalik. /boot — yuklash fayllari. Foydalanuvchi ko\'pincha faqat /home/username katalogiga to\'liq ruxsatga ega.',
      render:() => layout(heading('Hamma narsa<br><span class="accent">fayldir.</span>','Linux\'da qurilmalar, jarayonlar va konfiguratsiyalar ham fayl sifatida taqdim etiladi.') + `<div class="mini-list">${point('/','Ildiz katalog','Butun fayl tizimining boshlanish nuqtasi.')}${point('/home','Foydalanuvchilar','Har bir foydalanuvchining shaxsiy katalogi.')}${point('/etc','Sozlamalar','Tizim konfiguratsiya fayllari.')}${point('/var','O\'zgaruvchan','Log fayllar, cache, ma\'lumotlar bazasi.')}</div>`, foundationDiagram('04', 'KATALOG TUZILISHI'))
    },
    {
      n:'05', title:'Terminal asosiy buyruqlari', category:'TERMINAL', tag:'ls / cd / pwd / cat',
      foot:'Bu buyruqlar — har qanday Linux tizimida ishlash uchun zarur minimum.',
      notes:'pwd — joriy yo\'lni ko\'rsatadi. cd ~ — uy katalogiga, cd .. — yuqoriga. man buyruq — qo\'llanma. Tab — avtomatik to\'ldirish. Ctrl+C — bekor qilish, Ctrl+D — yopish.',
      render:() => `<div class="full-width">${heading('Terminalda<br><span class="accent">birinchi qadamlar.</span>','Bu 6 ta buyruqni bilsangiz, Linux\'da mo\'ljal ola olasiz.')}<div class="wide-layout"><div>${table(['BUYRUQ','NIMA QILADI','MISOL'],[['pwd','Joriy katalogni ko\'rsatadi','pwd → /home/ali'],['ls','Katalog mazmunini ko\'rsatadi','ls -la'],['cd','Katalogni almashtiradi','cd /etc'],['cat','Fayl mazmunini ko\'rsatadi','cat /etc/hosts'],['mkdir','Yangi katalog yaratadi','mkdir loyiha'],['touch','Bo\'sh fayl yaratadi','touch fayl.txt']])}</div>${panel('TERMINAL / BIRINCHI DARS',`<pre class="code-window"><span class="code-gray"># Qaerda turibmiz?</span>\n<span class="code-green">$</span> pwd\n/home/ali\n\n<span class="code-gray"># Nima bor?</span>\n<span class="code-green">$</span> ls -la\ntotal 24\ndrwxr-xr-x  ali ali  4096 ...\n-rw-r--r--  ali ali  1024 fayl.txt\n\n<span class="code-gray"># Faylni o'qiymiz</span>\n<span class="code-green">$</span> cat fayl.txt</pre>`)}</div></div>`
    },
    {
      n:'06', title:'Matn tahrirlash va qidiruv', category:'TERMINAL', tag:'nano / grep / find',
      foot:'grep — matn qidiruv. find — fayl qidiruv. nano — yengilgina muharrir.',
      notes:'vim ham ko\'p ishlatiladigan muharrir, ammo o\'rganish qiyinroq. grep -r — rekursiv qidiruv. find . -name "*.log" — barcha log fayllarni topish. | (pipe) — buyruq chiqishini boshqa buyruqqa uzatadi.',
      render:() => layout(heading('Qidirish va<br><span class="accent">tahrirlash.</span>','grep matn topadi, find fayl topadi, nano fayl tahrirlaydi.') + `<div class="mini-list">${point('grep','Matn qidirish','grep "xato" /var/log/syslog')}${point('find','Fayl qidirish','find /var/log -name "*.log"')}${point('nano','Matn muharriri','nano /etc/hosts')}${point('|','Pipe','ls -la | grep ".txt"')}</div>` + callout('PIPE — KUCHLI VOSITA','Buyruq natijasini boshqa buyruqqa uzating: cat fayl.txt | grep "xato" | sort | uniq'), panel('GREP VA FIND',`<pre class="code-window"><span class="code-gray"># "error" so'zini topamiz</span>\n<span class="code-green">$</span> grep -r "error" /var/log/\n/var/log/syslog:Oct 1 error...\n\n<span class="code-gray"># Log fayllarni topamiz</span>\n<span class="code-green">$</span> find /var -name "*.log"\n/var/log/syslog\n/var/log/auth.log</pre>`))
    },
    {
      n:'07', title:'Ruxsatlar (Permissions)', category:'FAYL TIZIMI', tag:'chmod / chown / rwx',
      foot:'Ruxsatlar: egasi, guruh, boshqalar. r=o\'qish, w=yozish, x=bajarish.',
      notes:'ls -la chiqishidagi birinchi belgi: - (fayl), d (katalog), l (havola). chmod 755 = rwxr-xr-x. Katalog uchun x — kirish ruxsati. SUID, SGID va sticky bit — murakkabroq mavzular.',
      render:() => layout(heading('Kim nima<br><span class="accent">qila oladi?</span>','Linux ruxsatlari: egasi, guruh va boshqalar uchun o\'qish, yozish, bajarish.') + table(['BIT','QIYMAT','MA\'NO'],[['r','4','O\'qish (read)'],['w','2','Yozish (write)'],['x','1','Bajarish (execute)'],['-','0','Ruxsat yo\'q']]) + callout('chmod HISOBLASH','chmod 644: ega → rw- (6), guruh → r-- (4), boshqalar → r-- (4)'), foundationDiagram('07', 'RUXSAT TUZILISHI'))
    },
    {
      n:'08', title:'Foydalanuvchi va sudoers', category:'FAYL TIZIMI', tag:'sudo / su / useradd',
      foot:'root — to\'liq ruxsatli superuser. sudo — vaqtincha root huquqi bilan buyruq bajarish.',
      notes:'sudo -i — root shelliga kirish. visudo — /etc/sudoers faylini xavfsiz tahrirlash. whoami — joriy foydalanuvchini ko\'rsatadi. id — foydalanuvchi va guruh IDlarini ko\'rsatadi.',
      render:() => layout(heading('Kim.<br><span class="accent">Qanday ruxsat.</span>','Odatdagi foydalanuvchi cheklangan ruxsatlarga ega. sudo kerakli amalni root sifatida bajaradi.') + `<div class="mini-list">${point('whoami','Joriy foydalanuvchi','whoami → ali')}${point('sudo','Root huquqi','sudo apt update')}${point('su -','Foydalanuvchi almashtirish','su - ali')}${point('useradd','Yangi foydalanuvchi','sudo useradd -m yangi')}</div>` + callout('XAVFSIZLIK','Root sifatida doimiy ishlamang. sudo orqali faqat kerakli amalni bajaring.',true), panel('FOYDALANUVCHI TIZIMI',`<pre class="code-window"><span class="code-gray"># Kim ekanligimizni tekshiramiz</span>\n<span class="code-green">$</span> whoami\nali\n<span class="code-green">$</span> id\nuid=1000(ali) gid=1000(ali) groups=1000(ali),27(sudo)\n\n<span class="code-gray"># Tizim yangilash (root kerak)</span>\n<span class="code-green">$</span> sudo apt update</pre>`))
    },
    {
      n:'09', title:'Paket menejeri (apt)', category:'PAKETLAR', tag:'apt / dpkg / snap',
      foot:'apt — Debian/Ubuntu\'da paket o\'rnatish, yangilash va o\'chirish uchun.',
      notes:'apt va apt-get bir xil maqsad, apt interaktiv foydalanish uchun qulayroq. dpkg — past darajali paket menejeri. apt-cache search — paket qidiruv. Paket o\'rnatishdan oldin apt update bajaring.',
      render:() => `<div class="full-width">${heading('Dastur o\'rnatish<br><span class="accent">bir buyruq.</span>','apt paket menejeridan eng ko\'p ishlatiladigan buyruqlar.')}<div class="wide-layout"><div>${table(['BUYRUQ','NIMA QILADI'],[['sudo apt update','Paket ro\'yxatini yangilash'],['sudo apt upgrade','O\'rnatilgan paketlarni yangilash'],['sudo apt install PAKET','Paket o\'rnatish'],['sudo apt remove PAKET','Paketni o\'chirish'],['apt search KALIT','Paket qidirish'],['apt show PAKET','Paket haqida ma\'lumot']])}</div>${panel('APT / MISOL',`<pre class="code-window"><span class="code-gray"># Paket ro'yxatini yangilaymiz</span>\n<span class="code-green">$</span> sudo apt update\nHit:1 http://archive.ubuntu.com ...\n\n<span class="code-gray"># nmap o'rnatamiz</span>\n<span class="code-green">$</span> sudo apt install nmap\nReading package lists... Done\nSetting up nmap (7.80+...) ...\n\n<span class="code-gray"># Tekshiramiz</span>\n<span class="code-green">$</span> nmap --version\nNmap version 7.80 ...</pre>`)}</div></div>`
    },
    {
      n:'10', title:'Log fayllar va monitoring', category:'PAKETLAR', tag:'syslog / journalctl / tail',
      foot:'/var/log — tizim log fayllari. journalctl — systemd jurnal. tail -f — real vaqtda kuzatish.',
      notes:'auth.log — autentifikatsiya. syslog — umumiy tizim. /var/log/nginx/ — veb server. dmesg — yadro xabarlari. journalctl -u nginx — nginx xizmati jurnali. grep bilan filtrlash juda foydali.',
      render:() => layout(heading('Tizim nima<br><span class="accent">qilyapti?</span>','Log fayllar tizim faoliyatini qayd qiladi. Muammoni topish uchun birinchi tekshiriladigan joy.') + `<div class="mini-list">${point('/var/log/syslog','Umumiy jurnal','Tizim xabarlari.')}${point('/var/log/auth.log','Autentifikatsiya','Login, sudo, SSH urinishlari.')}${point('journalctl','Systemd jurnal','journalctl -f — real vaqt.')}${point('tail -f','Fayl oxiri','tail -f /var/log/syslog')}</div>`, panel('LOG / REAL VAQT',`<pre class="code-window"><span class="code-gray"># Oxirgi 20 satr</span>\n<span class="code-green">$</span> tail -n 20 /var/log/syslog\n\n<span class="code-gray"># Real vaqtda kuzatish</span>\n<span class="code-green">$</span> tail -f /var/log/auth.log\nOct 1 03:12:01 sshd: Accepted\n       publickey for ali...\n\n<span class="code-gray"># SSH urinishlarni topamiz</span>\n<span class="code-green">$</span> grep "Failed" /var/log/auth.log</pre>`))
    },
    {
      n:'11', title:'Jarayonlar (Processes)', category:'TIZIM BOSHQARUV', tag:'ps / top / kill / htop',
      foot:'PID — Process ID. Har bir jarayon o\'z PIDiga ega. kill signal yuboradi.',
      notes:'ps aux -- barcha foydalanuvchilar jarayonlari. kill -15 (SIGTERM) — to\'xtatishni so\'rash, kill -9 (SIGKILL) — majburan to\'xtatish. PPID — ota-jarayon. Zombie jarayon — tugagan lekin ota o\'qimagan.',
      render:() => layout(heading('Tizimda nima<br><span class="accent">ishlayapti?</span>','Jarayonlar — ishlaydigan dasturlar. ps, top, kill ularni ko\'rish va boshqarish uchun.') + table(['BUYRUQ','MAQSAD'],[['ps aux','Barcha jarayonlar ro\'yxati'],['top','Real vaqt: CPU va RAM'],['htop','top ning qulay versiyasi'],['kill PID','Jarayonga SIGTERM yuborish'],['kill -9 PID','Majburan to\'xtatish'],['pgrep nginx','nginx PIDini topish']]), foundationDiagram('11', 'JARAYON HOLATI'))
    },
    {
      n:'12', title:'Xizmatlar (Services)', category:'TIZIM BOSHQARUV', tag:'systemctl / systemd',
      foot:'systemd — zamonaviy Linux tizimlarida xizmatlarni boshqarish tizimi.',
      notes:'systemctl enable — tizim yuklanishida xizmatni ishga tushirish. disable — bekor qilish. service eski buyruq, systemctl hozirgi standart. Xizmat fayllari /etc/systemd/system/ da.',
      render:() => `<div class="full-width">${heading('Xizmatlar<br><span class="accent">boshqaruvi.</span>','systemctl orqali xizmatlarni boshqarish — server administratorining asosiy ko\'nikmasi.')}<div class="wide-layout"><div>${table(['BUYRUQ','MAQSAD'],[['systemctl status nginx','Holat tekshirish'],['systemctl start nginx','Ishga tushirish'],['systemctl stop nginx','To\'xtatish'],['systemctl restart nginx','Qayta ishga tushirish'],['systemctl enable nginx','Avtomatik ishga tushirish'],['systemctl disable nginx','Avtomatik o\'chirish'],['systemctl list-units','Barcha xizmatlar']])}</div>${panel('SYSTEMCTL / NGINX MISOLI',`<pre class="code-window"><span class="code-green">$</span> systemctl status nginx\n● nginx.service - A high performance web server\n   Loaded: loaded (/lib/systemd...)\n<span class="code-green">   Active: active (running)</span> since ...\n  Process: 1234 ExecStart=/usr/sbin/nginx\n Main PID: 1234 (nginx)\n\n<span class="code-gray"># Qayta ishga tushiramiz</span>\n<span class="code-green">$</span> sudo systemctl restart nginx</pre>`)}</div></div>`
    },
    {
      n:'13', title:'Crontab — rejalashtirilgan vazifalar', category:'TIZIM BOSHQARUV', tag:'cron / crontab -e',
      foot:'cron — vaqt jadvalida buyruq bajaradigan tizim. crontab -e — joriy foydalanuvchi jadvali.',
      notes:'crontab -l — ko\'rish, crontab -e — tahrirlash. /etc/cron.d/ — tizim cron fayllari. Cron sintaksisi: daqiqa soat kun-oy oy hafta-kuni. * — har, */5 — har 5 daqiqada. Joriy yo\'l cron uchun ko\'pincha /.',
      render:() => layout(heading('Avtomatik<br><span class="accent">vazifalar.</span>','cron belgilangan vaqtda buyruqlarni bajaradi. Backup, log tozalash, monitoring.') + `<div class="mini-list">${point('* * * * *','Har daqiqada','* * * * * /skript.sh')}${point('0 * * * *','Har soatda','0 * * * * /soatlik.sh')}${point('0 0 * * *','Har kuni yarim tunda','0 0 * * * /kunlik.sh')}${point('0 0 * * 0','Har yakshanba','Haftalik backup')}</div>` + callout('SINTAKSIS','MIN SOAT KUN OY HAFTA-KUNI buyruq'), panel('CRONTAB',`<pre class="code-window"><span class="code-gray"># Joriy jadvalni ko'ramiz</span>\n<span class="code-green">$</span> crontab -l\n\n<span class="code-gray"># Tahrirlash</span>\n<span class="code-green">$</span> crontab -e\n\n<span class="code-gray"># Har kuni 02:00 backup</span>\n0 2 * * * /home/ali/backup.sh\n\n<span class="code-gray"># Har soat log tozalash</span>\n0 * * * * find /tmp -mmin +60 -delete</pre>`))
    },
    {
      n:'14', title:'Tarmoq tushunchalari takrori', category:'TARMOQ ASOSLARI', tag:'IP / Port / Protokol',
      foot:'Bu slayd web-asoslari darsidagi tushunchalarni Linux kontekstida qayta ko\'rib chiqadi.',
      notes:'Bu slayd 1-darsni bilgan o\'quvchilar uchun. Bilmaganlar uchun qisqacha tushuntiring: IP — qurilma manzili, port — xizmat raqami, TCP — ishonchli transport. Keyingi slaydlarda Linux buyruqlari bilan amaliyot.',
      render:() => layout(heading('Tarmoq<br><span class="accent">asoslari takrori.</span>','IP manzil, port va protokol — Linux tarmoq buyruqlarini tushunish uchun zarur poydevor.') + table(['TUSHUNCHA','MA\'NO','MISOL'],[['IP manzil','Tarmoq interfeys manzili','192.168.1.25'],['Port','Xizmat raqami','22=SSH, 80=HTTP, 443=HTTPS'],['TCP','Ishonchli transport','Ulanishga asoslangan'],['UDP','Tezkor transport','DNS, shuningdek ayrim streaming']]) + callout('ESLATMA','ssh port 22, http port 80, https port 443 — standart portlar.'), panel('TARMOQ QATLAMLARI', route(['APPLICATION: SSH, HTTP, DNS','TRANSPORT: TCP / UDP','INTERNET: IP manzillash','LINK: Ethernet, Wi-Fi'])))
    },
    {
      n:'15', title:'Tarmoq interfeyslari', category:'TARMOQ BUYRUQLARI', tag:'ip / ifconfig / netstat',
      foot:'ip — zamonaviy tarmoq buyruqlari to\'plami. ifconfig — eski, ko\'p tizimlarda hali mavjud.',
      notes:'ip addr show — barcha interfeyslар va manzillar. lo (loopback) — 127.0.0.1, tizim ichki aloqa. ip link — interfeys holati. ip -s link — statistika.',
      render:() => layout(heading('Qurilmamizning<br><span class="accent">tarmoq holati.</span>','ip buyruqlari: manzillar, marshrutlash va statistikani ko\'rish.') + `<div class="mini-list">${point('ip addr show','IP manzillar','Barcha interfeyslар va manzillar.')}${point('ip route show','Routing jadval','default gateway va marshrutlar.')}${point('ip link show','Interfeys holati','UP/DOWN, MAC manzil.')}${point('ss -tulpn','Ochiq portlar','ss — socket statistikasi.')}</div>`, foundationDiagram('15', 'TARMOQ INTERFEYSLARI'))
    },
    {
      n:'16', title:'ping, traceroute va dig', category:'TARMOQ BUYRUQLARI', tag:'Diagnostika vositalari',
      foot:'ping — ulanish bormi? traceroute — yo\'l qayerdan o\'tmoqda? dig — DNS javob nima?',
      notes:'ping -c 4 — 4 ta paket yuboradi. traceroute ba\'zi hoplar * ko\'rsatishi mumkin (ICMP bloklangan). dig @8.8.8.8 — muayyan resolver orqali so\'rov. nslookup ham ishlatiladi, dig kuchliroq.',
      render:() => `<div class="full-width">${heading('Tarmoq<br><span class="accent">diagnostikasi.</span>','Muammoni toping: ping, traceroute va dig — birinchi tekshirish vositalari.')}<div class="wide-layout"><div>${table(['BUYRUQ','NIMA QILADI','MISOL'],[['ping','ICMP echo, ulanish tekshirish','ping -c 4 8.8.8.8'],['traceroute','Yo\'l bo\'yicha hoplarni ko\'rsatish','traceroute google.com'],['dig','DNS so\'rov va javob','dig A example.com'],['nmap','Port skaneri','nmap -sV 192.168.1.1'],['curl','HTTP so\'rov','curl -I https://example.com'],['wget','Fayl yuklash','wget https://example.com/f.zip']])}</div>${panel('DIAGNOSTIKA / MISOL',`<pre class="code-window"><span class="code-gray"># 8.8.8.8 ga ping</span>\n<span class="code-green">$</span> ping -c 4 8.8.8.8\n64 bytes from 8.8.8.8: icmp_seq=1\n  ttl=118 time=12.3 ms\n\n<span class="code-gray"># DNS so'rov</span>\n<span class="code-green">$</span> dig A google.com\n;; ANSWER SECTION:\ngoogle.com. 300 IN A 142.250.186.14\n\n<span class="code-gray"># Ochiq portlar</span>\n<span class="code-green">$</span> ss -tulpn | grep LISTEN</pre>`)}</div></div>`
    },
    {
      n:'17', title:'Firewall (ufw va iptables)', category:'TARMOQ XAVFSIZLIGI', tag:'ufw / iptables',
      foot:'ufw — foydalanuvchiga qulay firewall. iptables — past darajali, kuchliroq va murakkabdroq.',
      notes:'ufw default deny incoming, allow outgoing — xavfsiz boshlang\'ich. iptables -L — qoidalar ro\'yxati. ufw status verbose — holat. Firewall ochiq portlarni cheklaydi, ammo application zaifliklarini yopmaydi.',
      render:() => layout(heading('Kiruvchi<br><span class="accent">trafikni nazorat.</span>','Firewall qoidalari: qaysi portga kim ulanishi mumkin?') + table(['UFW BUYRUQ','MAQSAD'],[['sudo ufw enable','Faollashti\'rish'],['sudo ufw status','Holat ko\'rish'],['sudo ufw allow 22/tcp','SSH ruxsati'],['sudo ufw allow 80,443/tcp','Web ruxsati'],['sudo ufw deny 3306','MySQL bloklash'],['sudo ufw delete allow 80','Qoidani o\'chirish']]) + callout('MUHIM','Firewall serverga qo\'shimcha himoya qatlami, ammo to\'liq xavfsizlik emas.',true), panel('UFW QOIDALARI',`<pre class="code-window"><span class="code-green">$</span> sudo ufw status verbose\nStatus: active\n\nTo          Action  From\n--          ------  ----\n22/tcp      ALLOW   Anywhere\n80/tcp      ALLOW   Anywhere\n443/tcp     ALLOW   Anywhere\n3306        DENY    Anywhere\n\n<span class="code-gray"># Yangi qoida qo'shamiz</span>\n<span class="code-green">$</span> sudo ufw allow from 10.0.0.0/8 to any port 22</pre>`))
    },
    {
      n:'18', title:'Ochiq portlar va xizmatlar', category:'TARMOQ XAVFSIZLIGI', tag:'ss / nmap / netstat',
      foot:'ss — socket statistikasi. nmap — tarmoq port skaneri. Ochiq port = ulanish qabul qilinmoqda.',
      notes:'ss -tulpn — TCP/UDP, foydalanuvchi, jarayon va port. netstat — eski buyruq. nmap -sV — xizmat versiyasi. nmap faqat ruxsat berilgan tizimda ishlating. 0.0.0.0 — barcha interfeyslar, 127.0.0.1 — faqat local.',
      render:() => layout(heading('Qaysi portlar<br><span class="accent">ochiq?</span>','Ochiq portlar = potensial kirish nuqtalari. Faqat zarur portlar ochiq bo\'lsin.') + `<div class="mini-list">${point('ss -tulpn','Mahalliy','Serverda ochiq portlar va xizmatlar.')}${point('nmap -sV IP','Masofaviy','Masofaviy xost portlarini skanerlash.')}${point('LISTEN','Ulanish kutilmoqda','Port ochiq va so\'rov kutmoqda.')}${point('ESTABLISHED','Faol ulanish','Aktiv TCP ulanishi.')}</div>`, panel('OCHIQ PORTLAR',`<pre class="code-window"><span class="code-green">$</span> ss -tulpn\nNetid State  Recv-Q Send-Q\ntcp   LISTEN 0      128\n  0.0.0.0:22   0.0.0.0:*\n  users:(("sshd",pid=1234))\ntcp   LISTEN 0      511\n  0.0.0.0:80   0.0.0.0:*\n  users:(("nginx",pid=5678))\ntcp   LISTEN 0      511\n  127.0.0.1:3306 0.0.0.0:*\n  users:(("mysqld",pid=910))</pre>`))
    },
    {
      n:'19', title:'SSH — Xavfsiz masofaviy ulanish', category:'SSH VA KALIT BOSHQARUVI', tag:'ssh / scp / keygen',
      foot:'SSH — Secure Shell. Port 22. Kalit asosida autentifikatsiya paroldan xavfsizroq.',
      notes:'ssh-keygen -t ed25519 — zamonaviy va xavfsiz kalit turi. ssh-copy-id — ochiq kalitni serverga ko\'chirish. ~/.ssh/authorized_keys — server ochiq kalitlarni saqlaydi. StrictHostKeyChecking — birinchi ulanishda host kalitini saqlaydi.',
      render:() => layout(heading('Masofaviy<br><span class="accent">xavfsiz ulanish.</span>','SSH kalit asosida autentifikatsiya: parol o\'rniga kriptografik kalit juftligi.') + `<div class="mini-list">${point('Kalit yaratish','ssh-keygen -t ed25519','~/.ssh/id_ed25519 va .pub fayllari yaratiladi.')}${point('Serverga yuborish','ssh-copy-id user@server','Ochiq kalit serverga nusxalanadi.')}${point('Ulanish','ssh ali@192.168.1.10','Parolsiz kalit bilan kirish.')}${point('SCP','scp fayl.txt ali@server:~','SSH orqali fayl nusxalash.')}</div>`, foundationDiagram('19', 'SSH ULANISH JARAYONI'))
    },
    {
      n:'20', title:'SSH konfiguratsiyasi va xavfsizlik', category:'SSH VA KALIT BOSHQARUVI', tag:'sshd_config',
      foot:'/etc/ssh/sshd_config — SSH server konfiguratsiyasi. Har o\'zgarishdan keyin qayta ishga tushiring.',
      notes:'PermitRootLogin no — root bilan bevosita ulanishni bloklash. PasswordAuthentication no — parol asosida kirishni bloklash (kalit kerak). Port — standart 22 o\'rniga boshqa port. AllowUsers — faqat ruxsat berilgan foydalanuvchilar.',
      render:() => `<div class="full-width">${heading('SSH ni<br><span class="accent">qattiqlashtirish.</span>','Standart SSH konfiguratsiyasini xavfsizroq qilish uchun asosiy sozlamalar.')}<div class="wide-layout"><div>${table(['SOZLAMA','TAVSIYA','SABABI'],[['PermitRootLogin','no','Root hijob qilishni oldini olish'],['PasswordAuthentication','no','Brute force hujumini bloklash'],['MaxAuthTries','3','Urinishlar sonini cheklash'],['LoginGraceTime','30','Ulanish vaqtini cheklash'],['AllowUsers','ali bob','Faqat ma\'lum foydalanuvchilar'],['Port','2222 (ixtiyoriy)','Standart portni o\'zgartirish']])}</div>${panel('SSHD_CONFIG',`<pre class="code-window"><span class="code-gray"># /etc/ssh/sshd_config</span>\nPermitRootLogin <span class="code-orange">no</span>\nPasswordAuthentication <span class="code-orange">no</span>\nMaxAuthTries <span class="code-green">3</span>\nLoginGraceTime <span class="code-green">30</span>\nAllowUsers <span class="code-blue">ali bob</span>\n\n<span class="code-gray"># O'zgarishlarni qo'llaymiz</span>\n<span class="code-green">$</span> sudo systemctl restart sshd</pre>`)}</div></div>`
    },
    {
      n:'21', title:'Tarmoq xavfsizligiga nazar', category:'TARMOQ XAVFSIZLIGI', tag:'Attack surface',
      foot:'Ochiq port = potensial hujum nuqtasi. Faqat kerakli xizmatlarni ochiq qoldiring.',
      notes:'Rekon bosqichi: ochiq portlar, xizmat versiyalari, OS aniqlash. Brute force — parol taxminlash. SSH kalit bilan autentifikatsiya brute forceni qiyinlashtiradi. fail2ban — ortiqcha urinishlardan keyin IP bloklash.',
      render:() => `<div class="full-width">${heading('"Server ishlayapti" —<br><span class="accent">savollar endi boshlanadi.</span>','Linux server xavfsizligi — ko\'p qatlamli yondashuv.')}<div class="wide-layout"><div class="security-map">${[['Port 22 (SSH)','Brute force, zaif parol','Kalit auth, fail2ban, port o\'zgartirish'],['Port 80/443 (Web)','XSS, SQLi, misconfiguration','WAF, HTTPS, input validatsiya'],['Xizmat versiyalari','CVE zaifliklar','Muntazam yangilash'],['Foydalanuvchi ruxsatlari','Privilege escalation','Minimal ruxsat tamoyili'],['Log monitoring','Hujumni kech sezish','Centralized logging, SIEM'],['Firewall','Noto\'g\'ri qoidalar','Default deny, minimal allow']].map((s,i)=>`<button class="security-item${i===0?' active':''}" data-linux-security="${i}" aria-pressed="${i===0}"><strong>${s[0]}</strong><small>${s[1]}</small></button>`).join('')}</div>${panel('XAVFSIZLIK SAVOLLARI',`<div class="eyebrow" style="color:#d3f785" id="linuxSecLabel">${[['Port 22 (SSH)','Brute force, zaif parol','Kalit auth, fail2ban, port o\'zgartirish'],['Port 80/443 (Web)','XSS, SQLi, misconfiguration','WAF, HTTPS, input validatsiya'],['Xizmat versiyalari','CVE zaifliklar','Muntazam yangilash'],['Foydalanuvchi ruxsatlari','Privilege escalation','Minimal ruxsat tamoyili'],['Log monitoring','Hujumni kech sezish','Centralized logging, SIEM'],['Firewall','Noto\'g\'ri qoidalar','Default deny, minimal allow']][0][0]}</div><p class="security-question" id="linuxSecQuestion">${[['Port 22 (SSH)','Brute force, zaif parol','Kalit auth, fail2ban, port o\'zgartirish'],['Port 80/443 (Web)','XSS, SQLi, misconfiguration','WAF, HTTPS, input validatsiya'],['Xizmat versiyalari','CVE zaifliklar','Muntazam yangilash'],['Foydalanuvchi ruxsatlari','Privilege escalation','Minimal ruxsat tamoyili'],['Log monitoring','Hujumni kech sezish','Centralized logging, SIEM'],['Firewall','Noto\'g\'ri qoidalar','Default deny, minimal allow']][0][2]}</p>`,'?')}</div></div>`
    },
    {
      n:'22', title:'Qisqartmalar lug\'ati', category:'TEZKOR MA\'LUMOTNOMA', tag:'Linux & Tarmoq atamalari',
      foot:'Lug\'at: terminal, tarmoq va xavfsizlik atamalariga tezkor murojaat.',
      notes:'Lug\'at darsning barcha asosiy atamalarini o\'z ichiga oladi. Qidiruv lokal ishlaydi. TTL, PID, SSH, DNS kabi atamalar dars davomida ishlatiladi.',
      render:() => `<div class="full-width">${heading('Atamalarni <span class="accent">bir joyga yig\'amiz.</span>','To\'liq nomni yodlashdan oldin, uning vazifasini tushuning.')}<label class="sr-only" for="linuxGlossarySearch">Lug\'atdan qidirish</label><input class="search-box" id="linuxGlossarySearch" type="search" placeholder="Atamani qidiring… masalan, SSH yoki chmod" autocomplete="off"><div class="glossary" id="linuxGlossaryGrid"></div><div class="tiny-note" id="linuxGlossaryCount" aria-live="polite"></div></div>`
    },
    {
      n:'23', title:'Amaliy tekshiruv savollari', category:'BILIMNI MUSTAHKAMLASH', tag:'25 ta savol',
      foot:'Avval o\'zingiz javob bering, keyin izoh bilan solishtiring.',
      notes:'Savollar darsning barcha mavzularini qamrab oladi. Kategoriyani tanlash savol to\'plamini o\'zgartiradi.',
      render:() => layout(heading('Tushundingizmi?<br><span class="accent">Tushuntirib bering.</span>','Yodlangan ta\'rifdan ko\'ra, amalda bajara olish muhimroq.') + `<div class="question-categories">${['Barchasi','Terminal','Fayl tizimi','Tarmoq','SSH'].map((c,i)=>`<button data-linux-category="${c}" class="${i===0?'active':''}" aria-pressed="${i===0}">${c}</button>`).join('')}</div>` + callout('MUHOKAMA USULI','Buyruqni aytish bilan birga, nima uchun kerakligini ham izohlang.'), panel('SAVOL KARTOCHKASI',`<div class="question-card" style="padding:0"><span class="eyebrow" style="color:#a6bb91" id="linuxQuestionPosition"></span><h2 id="linuxQuestionTitle"></h2><div class="answer" id="linuxQuestionAnswer" hidden></div></div><div class="step-controls"><button class="small-button" data-action="linux-answer" aria-expanded="false">Javobni ko\'rish</button><button class="small-button" data-action="linux-question-next">Keyingi savol →</button></div>`,'O\'YLAB KO\'RING'))
    },
    {
      n:'24', title:'Mustaqil vazifa', category:'AMALIY MUSTAHKAMLASH', tag:'5 ta vazifa',
      foot:'Vazifalarni bajarish uchun terminal kirishi kerak. VM yoki WSL2 ishlatish mumkin.',
      notes:'Muqobil: CyberValue playground yoki online Linux terminal (bellard.org/jslinux). Vazifalarni tartib bilan bajaring: avval fayl tizimi, keyin tarmoq.',
      render:() => `<div class="full-width">${heading('Endi navbat <span class="accent">sizga.</span>','Amaliy mashq — bilimni mustahkamlashning eng samarali yo\'li.')}<div class="wide-layout"><div><div class="assignment"><strong>01 / Terminal asoslari</strong><p>Terminalda: pwd, ls -la, mkdir test, cd test, touch fayl.txt, cat fayl.txt. Har buyruqning natijasini yozing.</p></div><div class="assignment"><strong>02 / Ruxsatlar</strong><p>test.sh fayli yarating. chmod 755 bering. ls -la bilan tekshiring. chmod 600 ga o\'zgartiring. Farqni tushuntiring.</p></div><div class="assignment"><strong>03 / Jarayonlar</strong><p>ps aux ni ishga tushiring. Eng ko\'p CPU ishlatayotgan jarayonni toping. kill bilan to\'xtatishga harakat qiling (kerak emas — faqat PIDni aniqlang).</p></div><div class="assignment"><strong>04 / Tarmoq tekshiruvi</strong><p>ip addr show, ping -c 4 8.8.8.8, ss -tulpn buyruqlarini bajaring. Ochiq portlarni ro\'yxatlang.</p></div><div class="assignment"><strong>05 / SSH kalit</strong><p>ssh-keygen -t ed25519 bilan kalit juftligi yarating. ~/.ssh/ katalogini ko\'ring. Kalit ruxsatlarini tekshiring.</p></div></div>${panel('O\'ZINI TEKSHIRISH',`<div class="checklist" id="linuxChecklist">${linuxChecks.map((c,i)=>`<label><input type="checkbox" data-linux-check="${i}"><span>${c}</span></label>`).join('')}</div><div class="check-progress" id="linuxCheckProgress"></div>`,'✓')}</div></div>`
    },
    {
      n:'25', title:'Yakuniy xulosa', category:'KEYINGI BOSQICHGA TAYYOR', tag:'Dars yakuni',
      foot:'Endi "Linux serverda nima ishlayapti?" savoliga javob bera olasiz.',
      notes:'Darsni uchta tayanch savol bilan yakunlang: fayl tizimi qanday ishlaydi, xizmatlar qanday boshqariladi, tarmoq ulanishini qanday tekshirasiz? Keyingi mavzular: web server sozlash, Docker, monitoring tizimi.',
      render:() => `<div class="full-width">${heading('Bo\'laklar birlashdi.<br><span class="accent">Endi sizda Linux xaritasi bor.</span>','Terminaldan boshlab — tarmoq xavfsizligiga qadar.')}<div class="summary-grid"><div class="summary-card reveal" style="--i:0"><div class="large-number">01</div><h3>Tizim boshqaruvi</h3><p>Terminal, fayl tizimi<br>Ruxsatlar va foydalanuvchilar<br>Jarayonlar va xizmatlar</p></div><div class="summary-card reveal" style="--i:1"><div class="large-number">02</div><h3>Paketlar va log</h3><p>apt o\'rnatish / yangilash<br>Log fayllar va monitoring<br>cron va avtomatlashtirish</p></div><div class="summary-card reveal" style="--i:2"><div class="large-number">03</div><h3>Tarmoq va xavfsizlik</h3><p>ip, ping, dig, nmap<br>SSH va kalit autentifikatsiya<br>Firewall va port nazorati</p></div></div><div class="final-banner"><div><h3>Keyingi darslarga ko\'prik ↗</h3><p>Web server (Nginx) → Docker → CI/CD → Cloud → Kiberxavfsizlik amaliyoti</p></div><button data-action="restart">Boshidan ko\'rish ↺</button></div></div>`
    }
  ];
}
