'use strict';

// Short teaching units are inserted directly after their parent topic.
function detailedLessons() {
  const units = [];
  const add = (topic, title, lead, points, example, question, answer, note) =>
    units.push({topic, title, lead, points, example, question, answer, note});
  const flow = (...items) => ({kind:'flow', items});
  const rows = (heads, ...items) => ({kind:'table', heads, items});
  const code = text => ({kind:'code', text});

  add('01', 'Butun dars davomida bitta misol',
    'Tasavvur qiling: noutbukda https://example.com/login manzilini ochdingiz. Har yangi terminni shu voqeaga bog‘laymiz.',
    [['Nima istaymiz?', 'Login sahifasini olish. Bu foydalanuvchining maqsadi; tarmoqning vazifasi kerakli xabarlarni yetkazish.'], ['Kimlar qatnashadi?', 'Browser so‘raydi, server javob beradi. Ular orasidagi tarmoq xabarlarni tashiydi.'], ['Nimani tushuntira olish kerak?', 'Server qanday topildi, so‘rov qanday bordi va natija qanday sahifaga aylandi?']],
    flow('FOYDALANUVCHI: login sahifasi kerak', 'BROWSER: resursni so‘rayman', 'SERVER: javobni tayyorlayman', 'BROWSER: sahifani ko‘rsataman'),
    '“Sayt ochildi” deganda faqat bitta kompyuter ishladimi?', 'Yo‘q. Client, server va ular orasidagi tarmoq hamkorlik qildi. Keyingi slaydlarda shu hamkorlikni qismlarga ajratamiz.',
    'O‘quvchidan oxirgi ochgan saytini aytishini so‘rang. Texnik terminlarsiz, nimani so‘ragani va nima olganini tushuntirsin. Keyin request va response nomlarini qo‘shing.');

  add('02', 'Request ichida nima so‘raladi?',
    'Client “menga hamma narsani yubor” demaydi. U ma’lum resurs yoki amal uchun tushunarli xabar yuboradi.',
    [['Resurs', 'Masalan, /login — login sahifasi, /logo.svg — rasm. Server qaysi resurs kerakligini bilishi lozim.'], ['Qo‘shimcha ma’lumot', 'Client qaysi turdagi javobni qabul qilishi yoki kim sifatida murojaat qilayotganini bildira oladi.'], ['Natija', 'Server kontent qaytaradi yoki nega bera olmaganini bildiradi. Javob har doim sahifa bo‘lavermaydi.']],
    rows(['CLIENT SO‘ROVI', 'SERVERNING MUMKIN JAVOBI'], ['/login sahifasini ber', 'HTML hujjat'], ['/logo.svg rasmini ber', 'Rasm fayli'], ['/missing resursini ber', '404: resurs topilmadi']),
    'Response doim HTML bo‘ladimi?', 'Yo‘q. JSON, rasm, fayl, xato holati yoki bodysiz javob ham bo‘lishi mumkin.',
    'Avval “kutubxonadan aniq kitobni so‘rash” misolini ayting. So‘ng analogiyaning chegarasini belgilang: tarmoqdagi request kelishilgan protokol formatida yoziladi.');
  add('02', 'Bitta dasturda ikki rol',
    'Client va server nomi kompyuterning kuchiga emas, aynan shu aloqada nima qilayotganiga bog‘liq.',
    [['Browser → web application', 'Browser ma’lumot so‘raydi. Application bu aloqada server rolini bajaradi.'], ['Application → database', 'Application profilni olish uchun bazaga so‘rov yuboradi. Endi application client rolida.'], ['Natijani yig‘ish', 'Database natijasi applicationga, tayyor web javobi browserga qaytadi. Browser odatda bazaga bevosita ulanmaydi.']],
    flow('BROWSER — client', 'WEB APPLICATION — browser uchun server', 'WEB APPLICATION — database uchun client', 'DATABASE — ma’lumot xizmatini beradi'),
    'Noutbuk server bo‘la oladimi?', 'Ha. Agar undagi dastur boshqa clientlarning so‘rovlariga xizmat qilsa, shu aloqada serverdir.',
    'Doskada application yoniga ikki xil rol yozing. Strelkani almashtirish rolni qanday o‘zgartirishini so‘rang. Sxema so‘rovlar bog‘liqligini ko‘rsatadi.');

  add('03', 'Internet bor, lekin Web ishlamayapti',
    'Bitta xizmatdagi muammo butun Internet ishlamayotganini anglatmaydi.',
    [['Turli xizmatlar', 'Email, SSH va Web bir tarmoqdan foydalanishi mumkin, lekin ularning serverlari va protokollari boshqa.'], ['Bitta sayt muammosi', 'Faqat bitta sayt ochilmasa, uning serveri yoki nomini topish bilan bog‘liq muammo bo‘lishi mumkin.'], ['Dalil yig‘ish', '“Nima ishlayapti, nima ishlamayapti?” savoli muammoni toraytiradi. Bir belgi bilan yakuniy xulosa qilmang.']],
    rows(['KUZATUV', 'NIMANI BILAMIZ?'], ['Bitta sayt ochilmaydi', 'Barcha xizmatlar ishdan chiqqani isbotlanmadi.'], ['Lokal printer ishlaydi', 'Mahalliy aloqa bor; Internet haqida hali bilmaymiz.'], ['Boshqa sayt ochiladi', 'Kamida shu saytga web aloqa ishlayapti.']),
    'Wi-Fi belgisi chiqsa, barcha saytlar ochilishi shartmi?', 'Yo‘q. Lokal ulanish, Internetga yo‘l, DNS va web xizmatining ishlashi — alohida tekshiriladigan narsalar.',
    'Diagnostikani taxmin bilan dalilni ajratish mashqi sifatida bering. Bu slayd keyingi gateway va DNS mavzulariga savol tayyorlaydi.');

  add('04', 'Uy routeri ichida nimalar bor?',
    'Uyda “router” deb ataladigan bitta qutida ko‘pincha bir nechta vazifa birlashtirilgan.',
    [['Access point', 'Wi-Fi qurilmalarini lokal tarmoqqa ulaydi. Bu simsiz kirish nuqtasi.'], ['Switch', 'Ethernet orqali bir lokal tarmoqdagi qurilmalar orasida framelarni uzatadi.'], ['Router', 'Turli IP tarmoqlari orasida paket yo‘lini tanlaydi. Internet provayderi — ISP — tashqi ulanishni beradi.']],
    rows(['VAZIFA', 'ODDIY SAVOL'], ['Access point', 'Simsiz qurilma LANga qanday qo‘shiladi?'], ['Switch', 'LAN ichida frame qayerga boradi?'], ['Router', 'Boshqa tarmoqqa paket qanday chiqadi?']),
    'Access point va router aynan bitta tushunchami?', 'Yo‘q. Ular turli vazifalar. Uy qurilmasi ikkalasini ham bajarishi mumkin.',
    'Qutining tashqi ko‘rinishi bilan tarmoq rolini aralashtirmang. Alohida switch va access pointlar ishlatiladigan maktab tarmog‘ini misol qiling.');

  add('05', 'DHCP: sozlamalar qanday olinadi?',
    'Yangi qurilma tarmoqqa qo‘shilganda IPv4 sozlamalarini avtomatik olishining odatdagi ketma-ketligi bor.',
    [['Topish va taklif', 'Client DHCP serverni izlaydi. Server foydalanish mumkin bo‘lgan konfiguratsiyani taklif qiladi.'], ['So‘rash va tasdiqlash', 'Client tanlangan taklifni so‘raydi; server tasdiqlaydi. Bu odatda DORA deb eslab qolinadi.'], ['Lease', 'Manzil ma’lum muddatga beriladi. Client uni yangilashi kerak; IP doimiy qolishi shart emas.']],
    flow('DISCOVER — DHCP server bormi?', 'OFFER — mana konfiguratsiya taklifi', 'REQUEST — shu taklifni so‘rayman', 'ACK — sozlamalar tasdiqlandi'),
    'DHCP sayt nomini IPga aylantiradimi?', 'Yo‘q. DHCP tarmoq sozlamalarini beradi. Domen ma’lumotini DNS topadi; DHCP esa DNS resolver manzilini ham berishi mumkin.',
    'Bu IPv4 uchun odatdagi dastlabki almashinuv. Lease yangilanishida barcha to‘rt qadam aynan takrorlanmaydi. DHCP server ko‘pincha uy routerida ishlaydi, ammo alohida ham bo‘lishi mumkin.');
  add('05', 'To‘rtta sozlamani birga o‘qiymiz',
    'IPning o‘zi yetarli tushuntirish emas. Qurilma lokal tarmoq chegarasi, chiqish yo‘li va resolverni ham bilishi kerak.',
    [['IP + prefix', '192.168.1.25/24 — qurilmaning manzili va lokal tarmoq prefixi.'], ['Default gateway', '192.168.1.1 — boshqa tarmoqqa chiqish uchun odatdagi keyingi router.'], ['DNS resolver', 'Domen bo‘yicha so‘rov yuboriladigan xizmat manzili. Uyda u gateway bilan bir IPda bo‘lishi ham mumkin.']],
    code('IP address : 192.168.1.25\nMask       : 255.255.255.0\nGateway    : 192.168.1.1\nDNS        : 192.168.1.1'),
    'Gateway va DNS manzili bir xil bo‘lsa, vazifasi ham bir xilmi?', 'Yo‘q. Bitta qurilma paket yo‘naltirishni ham, DNS so‘rovlariga xizmat qilishni ham bajarishi mumkin.',
    'Har bir qatorni yopib: “Bu qator bo‘lmasa nimani bilmay qolamiz?” deb so‘rang. Bular o‘quv misoli, foydalanuvchi kompyuterining haqiqiy sozlamalari emas.');

  add('06', 'IPv4: 32 bit qayerdan keladi?',
    'Bit 0 yoki 1 bo‘lishi mumkin. IPv4 manzil to‘rtta 8 bitli qismdan — oktetlardan — tashkil topadi.',
    [['8 bit — 256 kombinatsiya', 'Eng kichik qiymat 00000000 = 0, eng kattasi 11111111 = 255. Shuning uchun bitta qism 256 bo‘la olmaydi.'], ['4 × 8 = 32', '192.168.1.25 yozuvi ikkilik manzilni odam o‘qishi qulay ko‘rinishda ifodalaydi.'], ['Nuqta nima qiladi?', 'Nuqtalar to‘rtta oktetni ajratadi. Ular manzilning alohida bitlari emas.']],
    rows(['O‘NLIK', 'IKKILIK / 8 BIT'], ['192', '11000000'], ['168', '10101000'], ['1', '00000001'], ['25', '00011001']),
    '192.168.1.300 to‘g‘ri IPv4 manzilmi?', 'Yo‘q. Oxirgi qism 255dan katta. Har oktet 0–255 oralig‘ida bo‘lishi kerak.',
    'Binar hisoblashni chuqurlashtirish shart emas. Avval to‘rtta katak va har katak ichida sakkizta bit chizing. Shu poydevor /24ni tushunishga xizmat qiladi.');
  add('06', '/24: qaysi qism tarmoqniki?',
    'Prefix uzunligi chapdan nechta bit tarmoq qismini belgilashini ko‘rsatadi. /24 misolida uchta to‘liq oktet.',
    [['Tarmoq qismi', '192.168.1.25/24 uchun dastlabki 24 bit — 192.168.1. Qolgan 8 bit host qismi.'], ['Maska bilan yozish', '24 ta 1 va 8 ta 0: 255.255.255.0. Maska shu bit chegarasini boshqa ko‘rinishda ifodalaydi.'], ['Bir subnetdagi misollar', '192.168.1.25/24 va 192.168.1.90/24 bir tarmoqda. 192.168.2.90/24 boshqa tarmoqda.']],
    code('192.168.1.25/24\nNETWORK: 192.168.1.0/24\nMASK:    255.255.255.0\n\n192.168.1.90  -> shu /24\n192.168.2.90  -> boshqa /24'),
    '/24 manzilda 24 ta kompyuter bo‘lishi mumkin deganimi?', 'Yo‘q. 24 — tarmoq prefixidagi bitlar soni. Host qismida 8 bit, ya’ni 256 xil kombinatsiya qoladi.',
    'Oddiy /24 subnetda tarmoq va broadcast manzillari hostlarga berilmaydi; odatda 254 host manzili qoladi. Bu formulani /31 kabi alohida holatlarga umumlashtirmang.');
  add('06', 'Prefix o‘zgarsa, chegara ham o‘zgaradi',
    'Subnet faqat nuqtaga qarab ajratilmaydi. Prefix chegarasi oktet ichidan ham o‘tishi mumkin.',
    [['/25 misoli', '32 − 25 = 7 host biti. 2⁷ = 128 manzil kombinatsiyasi. /24 ikkita /25ga ajraladi.'], ['Birinchi yarmi', '192.168.1.0/25: .0–.127. Odatdagi host manzillari .1–.126.'], ['Ikkinchi yarmi', '192.168.1.128/25: .128–.255. Odatdagi host manzillari .129–.254.']],
    rows(['MANZIL', 'TEGISHLI /25'], ['192.168.1.25', '192.168.1.0/25'], ['192.168.1.90', '192.168.1.0/25'], ['192.168.1.200', '192.168.1.128/25']),
    '.25/25 va .200/25 dastlabki uch okteti bir xil. Ular bir subnetdami?', 'Yo‘q. /25 chegarasi to‘rtinchi oktetning bir bitini ham tarmoq qismiga oladi. Ular ikki xil /25 subnetga tegishli.',
    'IPv6 ham prefixdan foydalanadi, lekin 128 bitli manzil va boshqa lokal mexanizmlarga ega. IPv4 broadcast qoidasini IPv6ga ko‘chirmang.');

  add('07', 'NAT javobni qaysi qurilmaga beradi?',
    'Ikki noutbuk bir tashqi IPdan foydalansa ham, router ularning aloqalarini ajrata olishi kerak.',
    [['Ichki aloqa', '192.168.1.10:51524 serverga ulanmoqda. Ikkinchi clientning manzili boshqa.'], ['Translyatsiya jadvali', 'NAPT/PAT manzil bilan birga portni ham moslashtiradi. Tashqi tomonda aloqalar turli portlar bilan ajratilishi mumkin.'], ['Javob qaytishi', 'Router saqlangan moslik bo‘yicha destinationni ichki IP va portga qayta o‘giradi.']],
    rows(['ICHKI ENDPOINT', 'TASHQI MOSLIK / TCP'], ['192.168.1.10:51524', '203.0.113.10:62001'], ['192.168.1.11:51524', '203.0.113.10:62002']),
    'Ikki clientda source port bir xil bo‘lsa, aloqalar darhol aralashib ketadimi?', 'Yo‘q. Ichki IPlar farq qiladi; router tashqi mosliklarni ham ajratadi. Jadval bu jarayonning soddalashtirilgan ko‘rinishi.',
    'Port mavzusi keyin ochiladi: hozir uni aloqa raqami deb tanishtiring. 203.0.113.10 — hujjatlashtirish uchun misol, haqiqiy public Internet endpointi emas.');
  add('07', 'Private, public va ruxsat — uch savol',
    'Manzilning turi xizmatga kirish mumkinligini yolg‘iz o‘zi belgilamaydi.',
    [['Private', 'Ichki tarmoqlar uchun ajratilgan diapazon. Turli uylarda bir xil 192.168.1.10 ishlatilishi mumkin.'], ['Public', 'Global yo‘naltirish uchun ishlatiladigan manzil. Unda qaysi xizmat tinglayotgani alohida savol.'], ['Firewall', 'Qaysi trafik o‘tishi mumkinligini qoida bilan boshqaradi. NATning vazifasi esa translyatsiya.']],
    rows(['SAVOL', 'TUSHUNCHA'], ['Manzil qaysi doirada ishlatiladi?', 'Private / public'], ['Manzil qanday almashtiriladi?', 'NAT'], ['Trafikka ruxsat bormi?', 'Firewall']),
    'Public IP bor serverning barcha portlari ochiqmi?', 'Yo‘q. Xizmat ishlamasligi, faqat ayrim interfeysda tinglashi yoki firewall uni bloklashi mumkin.',
    'NAT, shifrlash va firewallni alohida uch ustunga yozing. O‘quvchidan har birining hal qiladigan muammosini aytishini so‘rang.');

  add('08', 'Domen, host va subdomainni ajratamiz',
    'api.example.com va admin.example.com o‘xshash nomlar, lekin turli xizmatlarni ko‘rsatishi mumkin.',
    [['Nom qismlari', 'com — TLD. example.com — shu misoldagi domen. api.example.com — uning ostidagi nom.'], ['Bir server, ko‘p nom', 'Bir IP manzilda bir nechta web sayt joylashishi mumkin. Domenlar soni serverlar soniga teng emas.'], ['Bir nom, ko‘p server', 'Bitta nom bir nechta IPga yechilishi mumkin. Bu trafikni taqsimlash yoki mavjudlikka yordam beradi.']],
    rows(['NOM', 'MISOLDAGI ROL'], ['www.example.com', 'Asosiy web sahifalar'], ['api.example.com', 'Dasturlar uchun API'], ['admin.example.com', 'Boshqaruv interfeysi']),
    'admin subdomaini nomining o‘zi kirishni himoyalaydimi?', 'Yo‘q. Nom xizmatni belgilaydi, lekin autentifikatsiya va ruxsat tekshiruvlarini almashtirmaydi.',
    'api, admin va www odat bo‘yicha qo‘yiladigan nomlar, majburiy standart vazifalar emas. Misol nomlarini haqiqiy mavjud xizmat sifatida talqin qilmang.');
  add('08', 'URL: port, query va fragment',
    'URL faqat domen emas. Uning turli qismlaridan browser va server turlicha foydalanadi.',
    [['Scheme + host + port', 'https://example.com:8443 — HTTPS orqali shu hostning 8443 portiga murojaat. Port yozilmasa, sxemaning odatdagi porti qo‘llanadi.'], ['Path + query', '/search?q=network — resurs yo‘li va unga yuboriladigan query parametri. Ularning ma’nosini application belgilaydi.'], ['Fragment', '#results — odatda browser ichidagi joy yoki holat. Fragment HTTP request targetiga qo‘shilmaydi.']],
    code('https://example.com:8443/search?q=network#results\n\nscheme   https\nhost     example.com\nport     8443\npath     /search\nquery    q=network\nfragment results'),
    'Server HTTP requestda #resultsni oladimi?', 'Yo‘q. Browser fragmentni request targetiga yubormaydi. Shu URL uchun target odatda /search?q=network bo‘ladi.',
    'https uchun odatdagi port 443, http uchun 80. Query ichiga maxfiy ma’lumot qo‘yishni tavsiya qilmang: URL history va loglarda saqlanishi mumkin.');

  add('09', 'Resolver va authoritative: kim nimani biladi?',
    'DNSdagi hamma server bir xil vazifani bajarmaydi. Bir tomon izlaydi, boshqa tomon o‘z zonasi haqidagi javobni beradi.',
    [['Client resolverdan so‘raydi', '“example.com uchun A yozuvi kerak.” Client odatda ierarxiyani o‘zi boshidan kezmaydi.'], ['Resolver izlaydi', 'Cache yoki boshqa DNS serverlardan ma’lumot olib, clientga yakuniy javob qaytarishga harakat qiladi.'], ['Authoritative javob beradi', 'U o‘zi mas’ul zonadagi yozuvlar uchun vakolatli manba. Butun Internetdagi barcha nomlarni saqlamaydi.']],
    rows(['ROL', 'BILIM / VAZIFA'], ['Recursive resolver', 'Client uchun izlash va cache'], ['Root / TLD', 'Keyingi zonaga yo‘llanma'], ['Authoritative server', 'O‘z zonasi yozuvlari']),
    'Root server har bir saytning yakuniy IPsini qaytaradimi?', 'Odatda yo‘q. U tegishli TLD serverlariga yo‘llanma beradi; resolver izlashni davom ettiradi.',
    '“Yo‘llanma” bilan “yakuniy record”ni ikki rangda belgilang. Cache’da oraliq ma’lumot bor bo‘lsa rootga qaytish kerak bo‘lmasligi mumkin.');
  add('09', 'Cache va TTL: javobni qachongacha eslaymiz?',
    'Bir xil DNS so‘rovini har safar barcha serverlarga yuborish vaqt va resurs sarflaydi. Cache takroriy ishni kamaytiradi.',
    [['Yozuv olindi', 'Masalan, resolver A yozuvini TTL 300 soniya bilan oldi. U vaqtincha qayta ishlatilishi mumkin.'], ['Vaqt o‘tdi', '120 soniyadan keyin odatda 180 soniya yaroqlilik vaqti qoladi. TTL har foydalanishda boshidan boshlanmaydi.'], ['Yangilanish', 'Muddati tugagach, odatdagi holatda yangi DNS ma’lumoti so‘raladi. Turli cache’lar yangilanishni turli vaqtda ko‘rishi mumkin.']],
    rows(['VAQT', 'CACHE HOLATI'], ['0 s', 'TTL = 300 s'], ['120 s', 'Taxminan 180 s qoldi'], ['300 s', 'Odatda yangilash kerak']),
    'Domen IPsi o‘zgarsa, hamma client shu zahoti yangisini ko‘radimi?', 'Shart emas. Eski yozuv cache’da yaroqli bo‘lib turgan client yoki resolver undan foydalanishi mumkin.',
    'TTL — DNS yozuvining cache vaqti. IP paketidagi TTL boshqa vazifani bajaradi. Ayrim resolverlarda eskirgan yozuvni vaqtincha berish mexanizmi ham bor; bu yerda oddiy holat o‘rgatiladi.');
  add('09', 'DNS javobi keldi. Endi nima bo‘ladi?',
    'Nomni topish bilan sayt kontentini olish — ikkita alohida almashinuv.',
    [['Birinchi almashinuv', 'Browser yoki OS resolver orqali example.com uchun mos manzilni oladi.'], ['Ikkinchi almashinuv', 'Client tanlangan IPdagi web xizmatiga ulanadi. HTTP request shu aloqa orqali boradi.'], ['Muhim ajratish', 'DNS server odatda web sahifa kontentini clientga uzatuvchi vositachi emas.']],
    code('1. BROWSER -> RESOLVER\n   example.com uchun IP?\n   <- 203.0.113.10\n\n2. BROWSER -> 203.0.113.10:443\n   TLS + HTTP request\n   <- HTTP response'),
    'DNS ishladi. Bu web server ham ishlayotganini isbotlaydimi?', 'Yo‘q. Manzil topildi, xolos. Routing, transport ulanishi, TLS yoki application bosqichida muammo bo‘lishi mumkin.',
    'DNSni asosiy client-server chizig‘ining yon shoxi qilib chizing. IP misoli faqat hujjatlar uchun ajratilgan.');

  add('10', 'Qaysi vazifa uchun qaysi DNS record?',
    'DNSdan aniq yozuv turi so‘raladi. Web IPsi, email yo‘nalishi va zona serverlari bir xil ma’lumot emas.',
    [['Web manzili', 'A IPv4ni, AAAA IPv6ni beradi. CNAME bo‘lsa, u boshqa nomni ko‘rsatadi va shu nomning yozuvi ham kerak bo‘lishi mumkin.'], ['Email', 'MX emailni qabul qiluvchi server nomlarini ko‘rsatadi. U web sahifaning pathini belgilamaydi.'], ['Zona va matn', 'NS DNS serverlarini, TXT turli matnli qiymatlarni beradi. TXT yozuvi bajariladigan dastur emas.']],
    rows(['EHTIYOJ', 'RECORD'], ['IPv4ga ulanish', 'A'], ['IPv6ga ulanish', 'AAAA'], ['Nom uchun alias', 'CNAME'], ['Email serveri', 'MX'], ['IPdan nom izlash', 'PTR']),
    'CNAME qiymati 203.0.113.10 bo‘lishi kerakmi?', 'Yo‘q. CNAME boshqa domen nomiga ishora qiladi. IPv4 qiymati A yozuviga tegishli.',
    'Record turini yodlatishdan oldin ehtiyojni ayting. O‘quvchi mos turini tanlasin, keyin nima uchun boshqasi emasligini tushuntirsin.');

  add('11', 'Lokal manzilmi yoki uzoq manzilmi?',
    'Qurilma paketni kimga berishni routing jadvali orqali aniqlaydi. Odatdagi uy misolida ikkita yo‘lni ajratamiz.',
    [['Lokal destination', '192.168.1.25/24 dan 192.168.1.90ga yuborish shu lokal tarmoq orqali bo‘ladi.'], ['Uzoq destination', '203.0.113.10 lokal /24 ichida emas. Aniqroq route bo‘lmasa, paket default gatewayga beriladi.'], ['Gateway yangi manzil emas', 'Gateway — keyingi qadam. Paketning yakuniy destination IPsi serverniki bo‘lib qoladi; NAT alohida holat.']],
    rows(['DESTINATION', 'KEYINGI QADAM'], ['192.168.1.90', 'Lokal interfeys; shu hostning MACi'], ['203.0.113.10', '192.168.1.1 gateway; gateway MACi']),
    'Uzoq serverga yuborishda ARP bilan server MACi topiladimi?', 'Yo‘q. Lokal linkda keyingi routerga yuborish uchun gatewayning MAC manzili kerak.',
    'Buni ARP mavzusi bilan yana bog‘lang. Routing jadvalida bundan aniqroq yo‘l bo‘lishi mumkin; jadvaldagi default yo‘l faqat aniqroq mos yo‘l yo‘qligida ishlatiladi.');
  add('11', 'Routing: eng aniq mos yo‘l',
    'Bir IPga bir nechta route mos kelsa, router odatda eng uzun prefixli yo‘lni tanlaydi.',
    [['Keng yo‘l', '0.0.0.0/0 barcha IPv4 destinationlarga mos. U eng umumiy variant.'], ['Tor yo‘l', '10.0.0.0/8 faqat shu katta manzil oralig‘iga mos. /16 undan ham aniqroq.'], ['Tanlash', '10.20.5.8 uchun /0, /8 va 10.20.0.0/16 mos tushsa, /16 tanlanadi.']],
    rows(['DESTINATION PREFIX', 'NEXT HOP'], ['10.20.0.0/16', 'Router B ← shu misolda tanlanadi'], ['10.0.0.0/8', 'Router A'], ['0.0.0.0/0', 'ISP gateway']),
    '10.30.5.8 uchun jadvaldagi /16 mos keladimi?', 'Yo‘q. U 10.20.0.0/16 ichida emas. Berilgan jadvalda 10.0.0.0/8 eng uzun mos prefix bo‘ladi.',
    'Prefix uzunligini tezlik yoki router masofasi deb talqin qilmang. Bir xil prefixga tegishli yo‘llar orasidagi tanlovda boshqa routing mezonlari ham bo‘ladi.');

  add('12', 'Paket va frame: qaysi qobiq almashadi?',
    'Router lokal linkdan kelgan frameni ochadi, IP paketni tekshiradi va keyingi link uchun yangi qobiq tayyorlaydi.',
    [['Link qobig‘i', 'Ethernet source va destination MAC manzillari aynan shu linkdagi yuboruvchi va keyingi qabul qiluvchiga tegishli.'], ['IP qatlami', 'Oddiy routingda source va destination IP saqlanadi. IPv4 TTL kamayadi; NAT bo‘lsa manzil ham o‘zgarishi mumkin.'], ['Ilova xabari', 'Bir HTTP xabari bir nechta segment yoki paketda tashilishi mumkin. Xabar chegarasi paket chegarasiga teng emas.']],
    flow('LINK 1: client MAC → gateway MAC', 'ROUTER: frame ochiladi, IP yo‘li tanlanadi', 'LINK 2: yangi link qobig‘i', 'OXIRGI HOST: qatlamlar ochilib, data ilovaga beriladi'),
    'Bitta Ethernet frame butun Internet bo‘ylab o‘zgarmay boradimi?', 'Yo‘q. Routerlar orasidagi linklarda yangi link qobig‘i ishlatiladi. Har bir link Ethernet bo‘lishi ham shart emas.',
    'Konvert analogiyasida tashqi qobiqni almashtiring, ichkaridagi IP paketni saqlang. Keyin TTL va NAT tufayli paketning ayrim maydonlari ham o‘zgarishini ayting.');

  add('13', 'ARP cache: har safar so‘rash kerakmi?',
    'Qurilma yaqinda topgan IP–MAC mosliklarini vaqtincha saqlashi mumkin.',
    [['Cache tekshiriladi', 'Gateway uchun yaroqli moslik bo‘lsa, undan foydalanish mumkin.'], ['Moslik yo‘q', 'Client lokal IPv4 linkda ARP request yuboradi va javobdan MACni oladi.'], ['Moslik doimiy emas', 'Qurilma almashishi yoki cache yozuvi eskirishi mumkin. OS kerak bo‘lganda uni yangilaydi.']],
    rows(['IPv4', 'MAC / TA’LIMIY MISOL'], ['192.168.1.1', '02:00:00:00:01:01'], ['192.168.1.90', '02:00:00:00:01:5A']),
    'DNS cache bilan ARP cache bir xil narsani saqlaydimi?', 'Yo‘q. DNS nomga tegishli recordlarni saqlaydi; ARP cache lokal IPv4–MAC mosliklarini saqlaydi.',
    'IPv6 ARP ishlatmaydi; Neighbor Discoverydan foydalanadi. DNS, ARP va routing jadvalini uchta alohida ro‘yxat qilib ko‘rsatish foydali.');

  add('14', 'Bitta requestni to‘rtta qatlamda ko‘ramiz',
    'Qatlamlar bir-birining vazifasini takrorlamaydi. Har biri boshqa savolga javob beradi.',
    [['Application va transport', 'HTTP nima so‘ralganini ifodalaydi. TCP portlar, tartib va bayt oqimi bilan ishlaydi.'], ['Internet va link', 'IP tarmoqlararo destinationni, link esa yaqin qo‘shniga uzatishni ta’minlaydi.'], ['Qabul qiluvchi tomonda', 'Link → IP → transport → application tartibida ma’lumot yuqori qatlamga beriladi.']],
    rows(['QATLAM', 'SAVOL'], ['HTTP / Application', 'Qaysi resurs kerak?'], ['TCP / Transport', 'Qaysi endpointlar va qanday bayt oqimi?'], ['IP / Internet', 'Qaysi IP destination?'], ['Ethernet / Link', 'Shu linkda qaysi MACga?']),
    'HTTP path orqali router paketning next hopini tanlaydimi?', 'Oddiy IP routingda yo‘q. Router yo‘lni destination IPga mos routing ma’lumoti orqali tanlaydi.',
    'Bu misolda HTTPning TLS himoyasi alohida ko‘rsatilmagan. TCP/IP modelidagi qatlamlar mas’uliyatni tushuntirish vositasi, dastur ichidagi qat’iy to‘rtta modul degani emas.');

  add('15', 'TCP: yo‘qolgan ma’lumot bilan nima bo‘ladi?',
    'TCP ilovaga tartibli bayt oqimini taqdim qiladi. Buning uchun tartib raqamlari, tasdiqlar va qayta uzatishdan foydalanadi.',
    [['Sequence', 'Yuborilgan baytlarning oqimdagi o‘rnini bildiradi. Qabul qiluvchi kelgan bo‘laklarni tartibga soladi.'], ['ACK', 'Qabul qilingan ma’lumot haqida tasdiq qaytadi. Tasdiqlanmagan data zarur bo‘lsa qayta uzatiladi.'], ['Kafolatning chegarasi', 'Aloqa butunlay uzilsa, TCP cheksiz mo‘jiza qilmaydi. Ilova timeout yoki ulanish xatosini ko‘rishi mumkin.']],
    flow('DATA 1 → yetib keldi', 'DATA 2 → yo‘qoldi', 'DATA 3 → oldinroq yetib keldi', 'TCP → yetishmagan data qayta uzatiladi', 'ILOVA → tartibli bayt oqimini oladi'),
    'Paketlar yo‘lda almashib kelsa, TCP ilovaga ularni shu tartibsiz holatda beradimi?', 'Yo‘q. TCP bayt oqimini tartibga soladi. Yetishmagan baytlar keyingi dataning ilovaga berilishini kutdirishi mumkin.',
    'DATA 1/2/3 pedagogik bo‘laklar: haqiqiy TCP sequence raqamlari baytlar bo‘yicha. TCP xabar chegaralarini saqlaydigan protokol emas.');
  add('15', 'UDP: kamroq mexanizm, boshqa ehtiyoj',
    'UDP datagram yuboradi. Yetkazish, qayta uzatish va tartibni UDPning o‘zi TCP kabi boshqarmaydi.',
    [['Mustaqil datagram', 'Har bir yuborish alohida transport birligi. TCPdagi uch qadamli ulanishni avval bajarish talab qilinmaydi.'], ['Ilova tanlovi', 'Ilova yo‘qolgan datani qayta so‘rashi yoki kechikkan datani keraksiz deb bilishi mumkin.'], ['Real-time misol', 'Jonli ovozda juda kech kelgan bo‘lakning foydasi kamayadi. Lekin har real-time dastur faqat UDP ishlatadi degani emas.']],
    rows(['HOLAT', 'ILOVA QARORI BO‘LISHI MUMKIN'], ['DNS javobi kelmadi', 'So‘rovni qayta yuborish'], ['Ovoz bo‘lagi kechikdi', 'Uni tashlab, keyingi bo‘lakni ijro etish'], ['Ishonchli transport kerak', 'UDP ustiga qo‘shimcha protokol qurish']),
    'UDP “doim tezroq va yaxshiroq” deganimi?', 'Yo‘q. Natija tarmoq va ilova ehtiyojiga bog‘liq. Kamroq transport mexanizmi har vazifa uchun afzallik emas.',
    'TCP va UDPni yaxshi-yomon deb baholamang. Ilovaning tartib, kechikish va yo‘qotishga munosabati asosida taqqoslang.');
  add('15', 'HTTP/3: Web ham UDPdan foydalana oladi',
    '“Web doim TCP ishlatadi” qoidasi yetarli emas. HTTPning turli versiyalari turli transportdan foydalanadi.',
    [['HTTP/1.1 va HTTP/2', 'Odatdagi HTTPS ulanishida TCP ustida TLS orqali ishlaydi. Darsdagi asosiy handshake sxemasi shu yo‘lga tegishli.'], ['HTTP/3', 'QUIC orqali ishlaydi. QUIC UDP ustida transport va himoyalash mexanizmlarini ta’minlaydi.'], ['UDP bilan cheklanmaydi', 'QUIC UDPning ustiga ishonchlilik va oqimlarni boshqarish mexanizmlarini qo‘shadi. HTTP/3 tartibsiz data berishi shart emas.']],
    rows(['WEB VARIANTI', 'SODDALASHTIRILGAN QATLAMLAR'], ['HTTPS / HTTP/1.1, HTTP/2', 'HTTP → TLS → TCP → IP'], ['HTTP/3', 'HTTP → QUIC (TLS 1.3 bilan) → UDP → IP']),
    'UDP kafolat bermasa, HTTP/3 qanday ishonchli ishlaydi?', 'Kerakli ishonchlilik mexanizmlari QUICda amalga oshiriladi. UDP ostki tashuvchi bo‘lib qoladi.',
    'Bu qo‘shimcha farqni ko‘rsatadi; QUICning barcha tafsilotlarini shu darsda ochish shart emas. Keyingi TCP/TLS ssenariylarida qaysi variant ko‘rsatilayotganini eslatib turing.');

  add('16', 'IP uy manzili bo‘lsa, port nima?',
    'Bir server bir vaqtning o‘zida web, SSH va boshqa xizmatlarni taklif qilishi mumkin. Port transport ichida ularni ajratadi.',
    [['IP: qaysi hostga?', '203.0.113.10 — misoldagi server manzili. Faqat IP qaysi xizmat kerakligini to‘liq aytmaydi.'], ['Port: qaysi xizmatga?', 'TCP 443 ko‘pincha HTTPS, TCP 22 esa SSH uchun ishlatiladi. Xizmat boshqa portga ham sozlanishi mumkin.'], ['Tinglovchi dastur', 'OS kelgan transport ma’lumotini mos socketga yo‘naltiradi. Portda dastur tinglamasa, kerakli xizmat javob bermaydi.']],
    rows(['ENDPOINT / TCP', 'ODATDAGI XIZMAT'], ['203.0.113.10:443', 'HTTPS'], ['203.0.113.10:22', 'SSH'], ['203.0.113.10:8080', 'Sozlangan boshqa web xizmat bo‘lishi mumkin']),
    '443 portni ko‘rsak, saytning barcha xavfsizlik talablari bajarilganmi?', 'Yo‘q. Port raqami xizmat yoki xavfsizlikning isboti emas. Protokol va application xatti-harakati alohida tekshiriladi.',
    'Uy/xona analogiyasi tushuntirish uchun; port fizik eshik emas. TCP 53 va UDP 53 alohida transport nomlar maydonlariga tegishli.');
  add('16', 'Socket va ulanishni qanday ajratamiz?',
    'Client bir serverga ko‘p ulanish ochishi mumkin. Har bir TCP ulanishining ikki tomondagi IP va portlari bor.',
    [['Client porti', 'OS odatda vaqtinchalik source port tanlaydi. Misolda 51524 va 51525 — ikkita ulanish.'], ['Server porti', 'Ikkalasi ham bir serverning 443 portiga borishi mumkin. Source qiymatlari ularni ajratadi.'], ['Socket', 'Dastur OS orqali aloqa qilish uchun socketdan foydalanadi. Endpoint — aloqa tomonining manzili; socket esa dasturiy abstraksiya.']],
    rows(['SOURCE / TCP', 'DESTINATION / TCP'], ['192.168.1.25:51524', '203.0.113.10:443'], ['192.168.1.25:51525', '203.0.113.10:443']),
    'Server porti ikkala ulanishda 443. Bu bitta ulanish deganimi?', 'Yo‘q. Source portlar boshqa. TCP kontekstida source IP/port va destination IP/port juftliklari ulanishni ajratadi.',
    'Bitta browser tab doim bitta TCP ulanishga teng emas. Browser ulanishlarni qayta ishlatishi yoki bir nechtasini ochishi mumkin. NAT jadvali mavzusi bilan bog‘lang.');

  add('17', 'Statik fayl va dinamik javob',
    'Server ba’zan tayyor faylni beradi, ba’zan requestga qarab javobni hisoblaydi.',
    [['Statik resurs', 'Masalan, logo.svg yoki style.css serverda tayyor turadi. Uni qaytarish uchun har safar databasega borish shart emas.'], ['Dinamik resurs', '/profile javobi qaysi foydalanuvchi kirganiga bog‘liq bo‘lishi mumkin. Application identifikatsiya va ruxsatni tekshiradi.'], ['Bir sahifada ikkalasi', 'Profil sahifasi dinamik JSON bilan birga statik CSS, JS va rasmlarni ham yuklashi mumkin.']],
    rows(['REQUEST', 'SODDALASHTIRILGAN YO‘L'], ['GET /logo.svg', 'Web server → tayyor fayl'], ['GET /profile', 'Application → ruxsat → zarur bo‘lsa DB'], ['GET /style.css', 'Cache yoki statik fayl']),
    'Har request majburiy ravishda databasega boradimi?', 'Yo‘q. Tayyor fayl, cache yoki hisoblangan javob bilan ham tugashi mumkin.',
    'Dinamik degani animatsiyali degani emas. Bu yerda javobning request yoki holatga qarab hosil bo‘lishi nazarda tutilgan.');
  add('17', 'Reverse proxy nega oldinda turadi?',
    'Client uchun bitta kirish nuqtasi ortida bir nechta backend dastur ishlashi mumkin.',
    [['Qabul qilish', 'Reverse proxy tashqi requestni qabul qiladi. U TLS ulanishini yakunlovchi nuqta bo‘lishi mumkin.'], ['Yo‘naltirish', '/api so‘rovi API backendga, boshqa path esa web backendga yuborilishi mumkin.'], ['Vazifalarni ajratish', 'Proxy trafikni taqsimlashi mumkin. Foydalanuvchining ma’lumotga ruxsatini tekshirish baribir application vazifasi bo‘lishi mumkin.']],
    rows(['PROXYGA KELGAN REQUEST', 'YO‘NALTIRISH VARIANTI'], ['/api/products', 'API backend'], ['/', 'Web backend'], ['/login', 'Web backend']),
    'Reverse proxy bo‘lsa, backend ruxsat tekshiruvini olib tashlaymizmi?', 'Yo‘q. Qaysi foydalanuvchi qaysi resursga kira olishini server tomonda ishonchli tekshirish zarur.',
    'Oxirgi ikki qator ketma-ket chaqiruvlar emas, yo‘naltirish variantlari. Clientdan proxygacha HTTPS bo‘lishi proxy-backend aloqasi ham shifrlanganini avtomatik anglatmaydi.');

  add('18', 'HTTP requestni satrma-satr o‘qiymiz',
    'Bu HTTP/1.1 misoli. Birinchi satr amal va resursni, keyingi satrlar qo‘shimcha metadata’ni bildiradi.',
    [['Request line', 'GET — olish amali. /products?limit=2 — target. HTTP/1.1 — xabar formati versiyasi.'], ['Headerlar', 'Host — qaysi hostga murojaat. Accept — client qaysi javob formatini qabul qilishini bildiradi.'], ['Bo‘sh satr va body', 'Bo‘sh satr header qismini tugatadi. Bu GET misolida body yo‘q; boshqa requestlarda bo‘lishi mumkin.']],
    code('GET /products?limit=2 HTTP/1.1\nHost: example.com\nAccept: application/json\n\n'),
    'limit=2 headerga tegishlimi?', 'Yo‘q. U request targetidagi query parametridir. Uning qanday ishlatilishini application belgilaydi.',
    'Request line, header va body uchun uchta rang ishlating. HTTP/2 va HTTP/3 tarmoqda bu matn formatida uzatilmaydi, ammo method va header kabi semantikalar saqlanadi.');
  add('18', 'HTTP response: holat va mazmun',
    'Server javobida “nima bo‘ldi?” va “qanday ma’lumot keldi?” degan savollar alohida ifodalanadi.',
    [['Status line', '200 OK — request muvaffaqiyatli bajarilganini bildiradi. Bu content turini aytmaydi.'], ['Content-Type', 'application/json — body JSON ko‘rinishida ekanini bildiradi. HTML bo‘lsa odatda text/html.'], ['Body', 'Javobning o‘zi. Misolda JSON obyekt qaytgan. Ba’zi responselarda body bo‘lmaydi.']],
    code('HTTP/1.1 200 OK\nContent-Type: application/json\nContent-Length: 11\n\n{"count":2}'),
    '200 OK kelishi body albatta HTML deganimi?', 'Yo‘q. Status muvaffaqiyatni bildiradi. Format Content-Type va body bilan aniqlanadi.',
    'Misoldagi ASCII body 11 bayt; ko‘rsatilgan Content-Length shunga mos. Bodyga qo‘shimcha newline qo‘shilsa, baytlar soni ham o‘zgaradi.');

  add('19', 'Metodni foydalanuvchi amaliga bog‘laymiz',
    'Metodlar server bilan kelishilgan semantikani beradi. Server ularni to‘g‘ri amalga oshirishi kerak.',
    [['O‘qish', 'GET /products — ro‘yxatni olish. Odatda ma’lumot o‘qish foydalanuvchi holatini o‘zgartiruvchi amal bo‘lmasligi kerak.'], ['Yaratish va yangilash', 'POST /orders — buyurtma yaratish; PATCH /profile — profilning ayrim maydonlarini o‘zgartirish misoli.'], ['Ruxsat', 'Client DELETE yubora olgani uning o‘chirishga haqqi borligini anglatmaydi. Server foydalanuvchi va resurs ruxsatini tekshiradi.']],
    rows(['MAQSAD', 'MISOL'], ['Mahsulotlarni ko‘rish', 'GET /products'], ['Buyurtma yaratish', 'POST /orders'], ['Profil nomini o‘zgartirish', 'PATCH /profile'], ['O‘z buyurtmasini bekor qilish', 'DELETE /orders/42 — API qoidalariga qarab']),
    'POST ishlatsak, yuborilgan ma’lumot shifrlanadimi?', 'Metodning o‘zi shifrlamaydi. Aloqa himoyasi uchun HTTPS/TLS kerak; server esa input va ruxsatni tekshiradi.',
    'API dizayni misoli sifatida bering. Har endpointning haqiqiy semantikasini o‘sha xizmat belgilaydi. DELETE qayta yuborilganda javob kodi o‘zgarishi mumkin; idempotentlik bir xil response degani emas.');

  add('20', 'Xatoni status orqali toraytiramiz',
    'Status kod muammo sinfini bildiradi, ammo uning to‘liq sababini yolg‘iz o‘zi tushuntirmaydi.',
    [['401 va 403', '401: autentifikatsiya kerak yoki yaroqsiz. 403: server requestni tushundi, lekin bajarishga ruxsat bermadi.'], ['404', 'So‘ralgan resurs topilmadi yoki mavjudligi oshkor qilinmayapti. Bu Internet uzildi degani emas.'], ['500 va 503', '500 — serverdagi umumiy ichki xato. 503 — xizmat vaqtincha mavjud emas, masalan yuklama yoki texnik ish.']],
    rows(['VAZIYAT', 'MUMKIN STATUS'], ['Session yaroqsiz', '401'], ['Resursga kirish rad etildi', '403'], ['Path mavjud emas', '404'], ['Application ichki xatosi', '500']),
    '404 olgan bo‘lsak, hech qanday HTTP javob bo‘lmaganmi?', 'Aksincha: HTTP javobi kelgan va unda 404 holati ko‘rsatilgan. Uni server yoki yo‘ldagi proxy qaytargan bo‘lishi mumkin.',
    'Statusdan xulosa chiqarayotganda “mumkin” so‘zini ishlating. Aniq sabab uchun response tafsilotlari va server loglari kerak bo‘lishi mumkin.');

  add('21', 'Cookie qayerda, session qayerda?',
    'Serverda saqlanadigan session modelida browser odatda sessionning o‘zini emas, uni topish uchun identifikatorni olib yuradi.',
    [['Login', 'Server kiritilgan ma’lumotni tekshiradi va session yaratadi. Session ID taxmin qilish qiyin bo‘lishi kerak.'], ['Browserdagi cookie', 'Set-Cookie javob headeri orqali session ID browserga beriladi. Keyingi mos requestga Cookie qo‘shiladi.'], ['Serverdagi holat', 'Server IDga tegishli foydalanuvchini topadi. Session muddati va bekor qilingan-qilinmaganini tekshiradi.']],
    rows(['BROWSERDA', 'SERVERDA'], ['Cookie: sid=demo123', 'demo123 → user 42'], ['Keyingi requestda sid yuboriladi', 'Session va ruxsat tekshiriladi'], ['Cookie o‘chishi mumkin', 'Session ham bekor qilinishi kerak']),
    'Cookie ichida foydalanuvchining parolini saqlash kerakmi?', 'Yo‘q. Ushbu modelda browser session identifikatorini saqlaydi. Namuna ID ta’limiy; haqiqiy ID yetarlicha tasodifiy bo‘lishi kerak.',
    'Cookie va sessionni ikkita quti qilib chizing. Logout faqat browser cookieni o‘chirishi bilan cheklanmasligi, tegishli server holati ham bekor qilinishi kerakligini ayting.');
  add('21', 'Cookie atributlari nimani boshqaradi?',
    'Cookie xavfsizligi bitta parametrga bog‘liq emas. Atributlar turli vazifalarni bajaradi.',
    [['Secure', 'Odatda cookieni HTTPS kabi himoyalangan ulanish orqali yuborishga cheklaydi.'], ['HttpOnly', 'JavaScriptning document.cookie orqali ushbu cookieni o‘qishini cheklaydi. Bu barcha XSS oqibatlarini yo‘qotmaydi.'], ['SameSite', 'Cookiening boshqa saytdan kelgan requestlarda yuborilishini boshqaradi. Mos qiymat foydalanuvchi oqimiga qarab tanlanadi.']],
    code('Set-Cookie: sid=demo123;\n  Path=/;\n  Secure;\n  HttpOnly;\n  SameSite=Lax'),
    'HttpOnly bo‘lsa, browser cookieni serverga umuman yubormaydimi?', 'Yuboradi: tegishli requestlarda cookie ishlatiladi. HttpOnly asosan client JavaScriptining uni o‘qishiga ta’sir qiladi.',
    'Kod o‘qish qulayligi uchun bir necha satrda; amalda bu bitta Set-Cookie header qiymati. Atributlar applicationdagi ruxsat va input tekshiruvlarini almashtirmaydi.');

  add('22', 'TLS sertifikati nimani isbotlaydi?',
    'Browser faqat shifrlashni emas, kim bilan gaplashayotganini tekshirishni ham bajaradi.',
    [['Domen mosligi', 'Sertifikatdagi nom so‘ralgan hostga mos kelishi kerak. Boshqa domen sertifikati yetarli emas.'], ['Ishonch va muddat', 'Browser sertifikat zanjiri va amal qilish muddatini tekshiradi. Ishonchli zanjir sertifikatdagi identifikatsiyani tekshirishga yordam beradi.'], ['Kalit kelishuvi', 'Handshake davomida tomonlar kanal kalitlarini hosil qiladi. Server tegishli maxfiy kalitga egaligini ko‘rsatadi.']],
    flow('HOST: example.com', 'CERTIFICATE: domen + public key', 'TEKSHIRISH: nom, ishonch zanjiri, muddat', 'TLS KALITLARI: himoyalangan kanal'),
    'Sertifikat borligi sayt egasi halol ekanini kafolatlaydimi?', 'Yo‘q. TLS transportdagi identifikatsiya va himoyaga xizmat qiladi. Saytning biznesi yoki application mantiqini kafolatlamaydi.',
    'Public key bilan session kalitini bitta narsa deb tushuntirmang. Ushbu sxema umumiy vazifalarni ko‘rsatadi; TLS versiyasiga qarab handshake tafsilotlari farq qiladi.');
  add('22', 'HTTPS nimani yashiradi, nimani hal qilmaydi?',
    'HTTPS HTTP xabarining mazmunini transportda himoyalaydi. Client va TLSni yakunlovchi server esa mazmunni ko‘ra oladi.',
    [['Himoyalangan qism', 'HTTP path, headerlar va body TLS kanalida shifrlanadi. Yo‘ldagi oddiy kuzatuvchi ularni ochiq matnda o‘qiy olmaydi.'], ['Qoladigan kuzatuvlar', 'IP manzillar, trafik hajmi va vaqt kabi metadata ko‘rinishi mumkin. Domenning yashirinligi DNS va TLS sozlamalariga ham bog‘liq.'], ['Application masalasi', 'Noto‘g‘ri ruxsat tekshiruvi, zararli inputni qayta ishlash yoki oshkor loglarni HTTPS o‘zi tuzatmaydi.']],
    rows(['SAVOL', 'HIMOYA QAYERDA?'], ['Yo‘lda HTTP body o‘qilmasin', 'TLS'], ['Boshqa user profili ochilmasin', 'Serverdagi access control'], ['Maxfiy qiymat logga tushmasin', 'Application va logging siyosati']),
    'HTTPS ichida parol yuborilsa, server ham uni ko‘ra olmaydimi?', 'Server TLSni ochadi va requestni qayta ishlaydi. HTTPS yo‘ldagi himoya; endpointdagi ishlov berish va saqlash alohida masala.',
    '“HTTPS hamma narsani yashiradi” degan jumladan saqlaning. Sertifikat tekshiruvi bilan web dastur xavfsizligini alohida savol sifatida ushlang.');

  add('23', 'Bitta sahifa — ko‘p request',
    'HTML sahifaning boshlanishi bo‘lishi mumkin. Undagi havolalar browserni boshqa resurslarni so‘rashga olib keladi.',
    [['Birinchi HTML', 'Browser HTMLni o‘qib, CSS, JavaScript va rasmlarga ishoralarni ko‘radi.'], ['Qo‘shimcha resurslar', 'Har biri alohida HTTP requestga sabab bo‘lishi mumkin. Cache bo‘lsa tarmoq so‘rovi kerak bo‘lmasligi mumkin.'], ['Bir vaqtda ish', 'Browser ayrim yuklash va parse ishlarini parallel bajaradi; hammasi bitta uzun navbat emas.']],
    rows(['RESURS', 'VAZIFA'], ['/index.html', 'Sahifa strukturasi'], ['/style.css', 'Uslublar'], ['/app.js', 'Dastur xatti-harakati'], ['/logo.svg', 'Rasm'], ['/api/profile', 'Zarur bo‘lsa keyingi data']),
    'HTML keldi. Barcha rasm va skriptlar ham kelgan deb ayta olamizmi?', 'Yo‘q. Ular alohida yuklanishi, cache’dan olinishi yoki xato berishi mumkin.',
    'DevTools Network oynasida bitta navigatsiyada bir nechta qator paydo bo‘lishini ko‘rsating. Ushbu lokal taqdimot misollarida haqiqiy API chaqiruvlari bajarilmaydi.');
  add('23', 'HTMLdan ekrandagi piksellargacha',
    'Browser kelgan matnni bevosita rasm qilib qo‘ymaydi. Strukturani va uslublarni hisoblab, ko‘rinishni chizadi.',
    [['DOM va uslublar', 'HTMLdan elementlar daraxti hosil bo‘ladi. CSS qoidalari qaysi element qanday ko‘rinishini belgilaydi.'], ['Layout', 'Elementlarning o‘lchami va joylashuvi hisoblanadi. Masalan, sarlavha qaysi kenglikka sig‘ishi aniqlanadi.'], ['Paint va compositing', 'Ko‘rinish chiziladi va qatlamlar birlashtiriladi. JavaScript DOM yoki uslubni o‘zgartirsa, ayrim ishlar qayta bajarilishi mumkin.']],
    flow('HTML → DOM', 'CSS → uslublarni hisoblash', 'LAYOUT → o‘lcham va joy', 'PAINT / COMPOSITE → ekrandagi natija'),
    'Sahifa yuklangandan keyin DOM o‘zgara oladimi?', 'Ha. JavaScript yangi element qo‘shishi, matn yoki uslubni yangilashi mumkin; browser tegishli ko‘rinishni qayta hisoblaydi.',
    'DOM bilan HTML faylni aynan tenglashtirmang: DOM browserdagi joriy obyektlar tuzilmasi. Render jarayoni haqiqiy browserda optimallashtirishlar bilan bajariladi.');

  add('24', 'Birinchi tashrif va keyingi tashrif',
    'Har safar sayt ochilganda barcha bosqichlar noldan takrorlanishi shart emas.',
    [['DNS qayta ishlatilishi', 'Yaroqli cache javobi bo‘lsa, nom uchun uzoq izlash kerak bo‘lmaydi.'], ['Ulanish qayta ishlatilishi', 'Mavjud mos ulanish orqali yangi request yuborilishi mumkin. Har resursga yangi TCP handshake shart emas.'], ['Kontent cache’i', 'Saqlangan resurs yaroqli bo‘lsa, undan foydalaniladi. Ba’zan serverga shartli request bilan yangiligi tekshiriladi.']],
    rows(['BOSQICH', 'QAYTA FOYDALANISH IMKONI'], ['DNS', 'Yaroqli record cache’i'], ['Transport', 'Mavjud mos ulanish'], ['HTTP resurs', 'Cache’dagi nusxa yoki revalidation']),
    'Ikkinchi tashrif doim tezroqmi?', 'Kafolat yo‘q. Cache muddati tugashi, resurs o‘zgarishi yoki tarmoq holati yomonlashishi mumkin. Qayta foydalanish faqat imkoniyat beradi.',
    'DNS cache, HTTP cache va connection reuse uch xil mexanizm. Barchasini “browser eslab qoldi” degan bitta noaniq tushunchaga birlashtirmang.');
  add('24', 'Sayt ochilmadi: qaysi bosqichgacha bordik?',
    'Diagnostika uchun butun tizimni taxmin qilish o‘rniga, oxirgi muvaffaqiyatli bosqichni aniqlaymiz.',
    [['Manzil va aloqa', 'Nom topildimi? Server bilan transport ulanishi bo‘ldimi? Bu ikki savol bir xil emas.'], ['TLS va HTTP', 'Sertifikat tekshiruvi o‘tdimi? HTTP status keldimi? Status kelsa, kamida HTTP darajasidagi javob bor.'], ['Sahifa ichida', 'HTML keldi, lekin rasm yoki data yo‘qmi? Muammo qo‘shimcha resurs yoki browserdagi kodda bo‘lishi mumkin.']],
    rows(['BELGI', 'KEYINGI TEKSHIRUV'], ['Nom yechilmadi', 'DNS va lokal ulanish'], ['Ulanish timeout', 'Yo‘l, firewall, xizmat mavjudligi'], ['Sertifikat xatosi', 'Host, muddat, ishonch'], ['HTTP 500', 'Server/application tafsilotlari'], ['Sahifa bor, rasm yo‘q', 'Rasm requesti va path']),
    'Timeout ko‘rsak, server o‘chgan deb aniq ayta olamizmi?', 'Yo‘q. Tarmoq yo‘li, filtr, yuklama yoki boshqa sabab ham bo‘lishi mumkin. Belgilar sababni toraytiradi, yakka o‘zi isbotlamaydi.',
    'Amaliy mashq: uchta taxmin va har birini tekshirish uchun bittadan dalil yozdiring. O‘zingizga tegishli yoki ruxsat berilgan test muhitidan foydalaning.');

  add('25', 'Authentication va authorization',
    '“Kim kirdi?” bilan “Unga nima mumkin?” — ikki alohida tekshiruv.',
    [['Authentication', 'Foydalanuvchi kimligini aniqlash. Masalan, login yoki mavjud session orqali.'], ['Authorization', 'Shu foydalanuvchining aynan shu amal va resursga ruxsatini tekshirish.'], ['Har requestdagi qaror', 'User 42 tizimga kirgani user 43ning ma’lumotini ko‘rishga haqqi borligini anglatmaydi.']],
    rows(['REQUEST', 'SERVER SAVOLI'], ['GET /profile/42', 'Kim yubordi?'], ['GET /profile/43', 'Shu profilga ruxsati bormi?'], ['DELETE /orders/7', 'Shu buyurtmani o‘chira oladimi?']),
    'Login muvaffaqiyatli bo‘lsa, barcha endpointlarga ruxsat beriladimi?', 'Yo‘q. Har amal uchun tegishli ruxsatlar va resursga egalik kabi qoidalar serverda tekshiriladi.',
    'Tasavvuriy ikki foydalanuvchi orqali muhokama qiling. Frontenddagi tugmani yashirish serverdagi authorization o‘rnini bosmasligini ko‘rsating.');
  add('25', 'Clientdan kelgan ma’lumotga ishonamizmi?',
    'Browserdagi interfeys foydalanuvchiga qulaylik beradi. Server esa kelgan qiymatlarni mustaqil tekshirishi kerak.',
    [['Format va chegara', 'Miqdor sonmi, manfiy emasmi, ruxsat etilgan oralig‘dami? Majburiy maydonlar bormi?'], ['Biznes qoidasi', 'Mahsulot narxini client yuborgan qiymatdan ko‘r-ko‘rona olmaslik kerak. Server ishonchli manbadan hisoblaydi.'], ['Xavfsiz ishlov', 'Database so‘rovlari parametr bilan beriladi; chiqish ma’lumoti ishlatiladigan kontekstga mos kodlanadi.']],
    rows(['CLIENTDAN KELDI', 'SERVER QARORI'], ['quantity = -5', 'Validatsiya: qabul qilinadimi?'], ['price = 1', 'Narxni ishonchli manbadan olish'], ['userId = 43', 'Session userining ruxsatini tekshirish']),
    'Frontend tekshiruvi bo‘lsa, backend tekshiruvi ortiqchami?', 'Yo‘q. Clientni o‘zgartirish yoki requestni boshqa dasturdan yuborish mumkin. Server o‘z qoidalarini mustaqil qo‘llashi kerak.',
    'Validatsiya, parametrli database so‘rovi va kontekstga mos output encoding turli vazifalar. Ularni bitta “inputni tozalash” iborasi bilan almashtirmang.');

  return units;
}

function expandLessons(baseSlides) {
  const units = detailedLessons();
  return baseSlides.flatMap(base => {
    const children = units.filter(unit => unit.topic === base.n);
    return [base, ...children.map((unit, i) => ({
      n:`${base.n}.${i+1}`, topic:base.n, title:unit.title, category:base.category,
      tag:`Batafsil ${i+1} / ${children.length}`,
      foot:`${base.n}-mavzu · ${base.title} · Avval tushuntiring, keyin javobni oching.`,
      notes:unit.note, searchText:[unit.lead, ...unit.points.flat(), unit.question, unit.answer].join(' '),
      render:() => layout(
        heading(esc(unit.title), esc(unit.lead)) + `<div class="detail-points">${unit.points.map((p,j)=>point(String(j+1).padStart(2,'0'),esc(p[0]),esc(p[1]))).join('')}</div>`,
        panel('MISOL ORQALI TUSHUNAMIZ', renderLessonExample(unit.example), 'KUZATING →') +
        `<div class="lesson-check"><span class="eyebrow">O‘ZINGIZNI TEKSHIRING</span><p>${esc(unit.question)}</p><details><summary>Javob va tushuntirish</summary><p>${esc(unit.answer)}</p></details></div>`
      )
    }))];
  });
}

function renderLessonExample(example) {
  if (example.kind === 'table') return `<div class="detail-table">${table(example.heads.map(esc), example.items.map(row=>row.map(esc)))}</div>`;
  if (example.kind === 'code') return `<pre class="detail-code">${esc(example.text)}</pre>`;
  return `<ol class="detail-flow">${example.items.map(item=>`<li>${esc(item)}</li>`).join('')}</ol>`;
}
