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

  // 02: Nima uchun Linux
  add('02', 'Open Source nima degani?',
    'Open source — dastur manba kodi hammaga ochiq bo\'lib, uni o\'rganish va o\'zgartirish mumkin.',
    [['Tekinmi?', 'Ko\'pincha tekin, lekin asosiy ma\'nosi — kodning ochiqligida. Enterprise versiyalar pullik bo\'lishi mumkin.'], ['Xavfsizlik', 'Minglab dasturchilar kodni ko\'rib xatolarni topadi, yashirin "qopqonlar" qo\'yish qiyin.']],
    flow('Dasturchi yadro yozadi', 'Kod ommaga e\'lon qilinadi', 'Hamjamiyat tekshiradi va yaxshilaydi', 'Yangi distro yaratiladi'),
    'Nima uchun banklar ochiq kodli Linux serverlardan foydalanadi?', 'Chunki ular kodni o\'zlari tekshirib chiqishlari, sozlashlari va unga to\'liq ishonishlari mumkin.',
    'Open source = xavfsiz emas degan afsonani bekor qiling. Kod ochiqligi xavfsizlikni kuchaytiradi.');

  // 04: Fayl tizimi
  add('04', '/etc va /var papkalari mo\'jizasi',
    '/etc faqat sozlamalar saqlaydi, /var esa vaqt o\'tishi bilan o\'zgarib boruvchi fayllarni.',
    [['/etc', 'Tizim va dasturlar konfiguratsiyasi. Masalan, web server portini shu yerdan o\'zgartirasiz.'], ['/var', 'Log fayllar, keshlar, ma\'lumotlar bazasi fayllari. O\'lchami doim o\'zgarib turadi.']],
    rows(['PAPKA', 'ICHI NIMA?', 'O\'ZGARADIMI?'], ['/etc/ssh', 'SSH server sozlamalari', 'Kamdan kam'], ['/var/log', 'Tizim xatolik jurnali', 'Har soniyada']),
    'Dastur xato ishlashni boshlasa, qaysi papkaga qaraysiz?', '/var/log papkasidagi tegishli log fayllarga qaraladi.',
    'Konfiguratsiya va o\'zgaruvchi holat alohida saqlanishini tushuntiring.');

  add('04', '~ (Tilda) va uy papkasi',
    'Tilda belgisi (~) doimo siz hozir kirgan foydalanuvchining uy papkasini bildiradi.',
    [['Foydalanuvchi qafasi', '/home/ali — bu Ali ismli foydalanuvchining "shaxsiy hududi".'], ['Tezkor o\'tish', 'cd ~ yozsangiz, qayerda bo\'lishingizdan qat\'iy nazar uy papkaga qaytasiz.']],
    code('$ whoami\nali\n$ cd ~\n$ pwd\n/home/ali'),
    'root foydalanuvchisining uy papkasi qayerda?', 'root foydalanuvchisining papkasi /home/root emas, balki /root deb ataladi.',
    'Har doim papka tushunchasini to\'liq yo\'l (/home/user) va nisbiy yo\'l (~) orqali solishtiring.');

  // 05: Terminal buyruqlari
  add('05', 'Nisbiy va mutlaq (absolute/relative) yo\'llar',
    'Mutlaq yo\'l doim / (ildiz) dan boshlanadi. Nisbiy yo\'l esa siz turgan joydan hisoblanadi.',
    [['Mutlaq (Absolute)', '/var/log/syslog — qayerda turishingizdan qat\'iy nazar aniq manzil.'], ['Nisbiy (Relative)', 'log/syslog — hozirgi papkadan boshlab qidiriladi. / (slesh) bilan boshlanmaydi.']],
    rows(['TURGAN JOY', 'BUYRUQ', 'QAYERGA BORILDI?'], ['/home/ali', 'cd /etc', '/etc (Mutlaq)'], ['/home/ali', 'cd Desktop', '/home/ali/Desktop (Nisbiy)']),
    '/home/ali papkasida turib "cd etc" (sleshsiz) deb yozsangiz nima bo\'ladi?', 'Xato beradi (agar ali papkasida etc nomli papka bo\'lmasa), chunki nisbiy qidiradi.',
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

  // 07: Ruxsatlar
  add('07', 'Octal ruxsatlar: chmod 755 siri',
    'Ruxsatlarni harf (rwx) o\'rniga raqamlar orqali tez hisoblash mumkin.',
    [['Matematika', 'Read (r) = 4, Write (w) = 2, Execute (x) = 1.'], ['Yig\'indi', 'Agar o\'qish va yozish kerak bo\'lsa: 4 + 2 = 6 (rw-). Barchasi kerak bo\'lsa: 4 + 2 + 1 = 7 (rwx).']],
    rows(['KIMGA?', 'RUXSAT', 'HISOB'], ['Egasi (User)', 'r w x', '4+2+1 = 7'], ['Guruh (Group)', 'r - x', '4+0+1 = 5'], ['Boshqalar (Others)', 'r - x', '4+0+1 = 5']),
    'chmod 400 nima degani?', 'Faqat egasi o\'qiy oladi (r--). Guruh va boshqalar hech narsa qila olmaydi. Bu maxfiy kalitlar uchun ishlatiladi.',
    'Xavfsizlik nuqtai nazaridan fayllarga minimum kerakli ruxsat (Least Privilege) berish tamoyilini yoritib bering.');

  // 08: Sudo
  add('08', 'su va sudo farqi',
    'Ikkisi ham ruxsatlarni oshiradi, lekin turli yondashuv bilan.',
    [['su (substitute user)', 'Butunlay root (yoki boshqa user) profiliga o\'tib olish. Siz endi u odamsiz.'], ['sudo (superuser do)', 'Faqat bitta navbatdagi buyruqni superuser nomidan bajarish, profilingiz o\'zgarmaydi.']],
    code('$ su -\nPassword: \nroot@server:~# \n\n$ sudo apt update\n[sudo] password for ali:'),
    'Nima uchun su o\'rniga sudo ishlatish xavfsizroq?', 'Sudo orqali faqat bitta buyruq bajariladi va bu loglarda kim qachon bajargani qayd etiladi. Auditoriya va xavfsizlik uchun qulay.',
    'Serverlarda root bilan bevosita kirish nima uchun bloklanishini tushuntiring.');

  // 14: TCP/IP
  add('14', 'OSI Mnemonikasi',
    'Yetti qatlamni eslab qolish texnikasi.',
    [['Please', 'Physical (Kabel, signal)'], ['Do Not Throw', 'Data Link (MAC), Network (IP), Transport (Port)'], ['Sausage Pizza Away', 'Session, Presentation, Application (HTTP, xabar)']],
    flow('1. Physical', '2. Data Link', '3. Network', '4. Transport', '... 7. Application'),
    'Pochta jo\'natishda IP manzil konvert ustidagi manzil bo\'lsa, port nima?', 'Port uydagi xona raqami yoki xatni kim (qaysi oila a\'zosi) qabul qilib olishi kerakligini bildiradi.',
    'Nazariya amaliyotda qayerda ishlatilishini tushuntiring: muammo portdami (4-qatlam) yoki ulanishdami (1-qatlam).');

  add('14', 'IP va MAC manzillar: Ular nima uchun 2 ta?',
    'MAC manzil mahalliydir (lokal), IP manzil global (tarmoqlararo).',
    [['MAC (Data Link)', 'Zavoddan tarmoq kartasiga yozilgan. U faqat bitta WiFi yoki simli tarmoq ichida ishlaydi.'], ['IP (Network)', 'Siz qaysi Wi-Fi ga ulansangiz shunga mos manzil olasiz. Bu internetda paket yo\'nalishini topish uchun kerak.']],
    rows(['TURLAR', 'MANZIL FORMATI', 'VAZIFA'], ['MAC', 'A4:5E:60:B1:2C:3D', 'Lokal interfeysni topish'], ['IP (IPv4)', '192.168.1.10', 'Boshqa tarmoqlarga marshrutlash']),
    'Maktubingiz Toshkentdan Nyu-Yorkka ketyapti. Konvertdagi IP manzil Nyu-Yorkniki. Konvertdagi MAC manzilchi?', 'MAC manzil doimiy o\'zgarib boradi (kompyuteringizdan routerga, u yerdan provayder routeriga). IP manzil o\'zgarmaydi.',
    'Encapsulation mavzusidagi konvert qoplamalari yechilib qayta kiydirilishini chizib ko\'rsating.');

  // 16: Wireshark / Diagnostika
  add('16', 'Wireshark nima uchun hakerlar va adminlar quroli?',
    'U orqali tarmoqdagi barcha "ko\'rinmas" xabarlar oqimini to\'liq o\'qish mumkin.',
    [['Packet Sniffing', 'Tarmoq kartasidan o\'tayotgan har bir paketni tutib olish.'], ['Shifrlanmagan ma\'lumotlar', 'Agar HTTP orqali parol yuborilsa, Wireshark uni oddiy matn ko\'rinishida ushlab qolishi mumkin.']],
    rows(['QATLAM', 'WIRESHARK KO\'RSATADI'], ['Frame', 'Paket uzunligi va vaqti'], ['Ethernet', 'Source va Dest MAC'], ['IPv4', 'Source va Dest IP'], ['TCP', 'Portlar va Handshake (SYN/ACK)']),
    'Nimaga HTTP o\'rniga HTTPS ishlatish kerakligini Wireshark orqali qanday isbotlash mumkin?', 'HTTP trafik tutib olinganda parol aniq ko\'rinadi, HTTPS trafikda esa faqat ma\'nosiz shifrlangan baytlar oqimi ko\'rinadi.',
    'Paket analizatori faqat o\'z tarmog\'ida qonuniy ishlatilishi kerakligini ta\'kidlang.');

  // 17: Nmap
  add('17', 'Nmap portlarni qanday topadi?',
    'U har bir xonaga (portga) "Taq-taq" qilib chiqadi va javobni kutadi.',
    [['Ochiq (Open)', 'Xizmat ishlayapti va ulanishni qabul qildi (SYN-ACK keldi).'], ['Yopiq (Closed)', 'Eshik yopiq, u yerda hech qanday dastur yo\'q (RST keldi).'], ['Filtrlangan (Filtered)', 'Firewall so\'rovni bloklab qo\'ydi, javob umuman kelmadi.']],
    flow('NMAP so\'rov yuboradi (SYN)', 'SERVER javob qaytaradi', 'Open (SYN-ACK) / Closed (RST) / Filtered (Javobsiz)'),
    'Nima uchun begona serverni Nmap qilish qonunga zid bo\'lishi mumkin?', 'Chunki bu "uyning hamma eshiklarini qulflangan-qulflanmaganligini tekshirib chiqish" bilan barobar. Bu ruxsatsiz razvedka (recon) hisoblanadi.',
    'Nmap ni har doim lokal tarmoqda (localhost) xavfsiz mashq qilish kerakligini ogohlantiring.');

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
