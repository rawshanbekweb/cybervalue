'use strict';

// Each diagram starts with a question and advances only at the teacher's pace.
const foundationFlows = {
  '01': [
    [['CLIENT', 'SERVER'], 'Client xizmat so‘raydi. Server xizmat ko‘rsatadi. Avval doskada faqat shu ikki rolni chizing.'],
    [['CLIENT', 'IP → SERVER'], 'Serverni qanday topamiz? IP — tarmoqdagi manzillash va yo‘naltirish uchun kerak.'],
    [['CLIENT', 'example.com', 'SERVER'], 'IPni odam qanday eslab qoladi? Odam uchun qulay domen nomidan foydalanamiz.'],
    [['example.com', 'DNS LOOKUP', 'IP manzil'], 'Domenning IP manzilini qanday topamiz? DNSdan so‘raymiz. Bu alohida nom yechish jarayoni.']
  ],
  '02': [
    [['CLIENT', 'request →', 'SERVER'], 'Browser sahifa yoki ma’lumotni so‘raydi: bu request.'],
    [['CLIENT', '← response', 'SERVER'], 'Server natijani qaytaradi: bu response.'],
    [['WEB APP (client)', 'request →', 'DATABASE (server)'], 'Web application browserga server, databasega murojaat qilganda esa client rolida bo‘lishi mumkin.']
  ],
  '05': [
    [['QURILMA', 'Wi-Fi / Ethernet', 'UY TARMOG‘I'], 'Qurilma avval lokal tarmoqqa ulanadi. Mobil internetda ulanish operator tarmog‘i orqali bo‘ladi.'],
    [['QURILMA', 'DHCP', 'IP + sozlamalar'], 'DHCP IPv4 manzil, subnet mask, default gateway va DNS resolver kabi sozlamalarni avtomatik berishi mumkin.'],
    [['QURILMA', 'DEFAULT GATEWAY', 'BOSHQA TARMOQ'], 'Uzoq manzilga paket yuborishda qurilma routing jadvaliga qaraydi; odatdagi uy tarmog‘ida keyingi qadam routerdir.']
  ],
  '09': [
    [['CLIENT', 'RECURSIVE RESOLVER'], 'Client example.com uchun so‘rov yuboradi. Resolver cache’da yaroqli javob bo‘lsa, uni darhol qaytarishi mumkin.'],
    [['RESOLVER', 'ROOT', '.com serverlari'], 'Cache’da kerakli ma’lumot bo‘lmasa, resolver root serverdan .com zonasiga yo‘llanma oladi.'],
    [['RESOLVER', '.com TLD', 'example.com NS'], 'TLD server domenning authoritative serverlariga yo‘llanma beradi.'],
    [['RESOLVER', 'AUTHORITATIVE', 'DNS JAVOBI'], 'Authoritative server o‘zi mas’ul bo‘lgan zonaning yozuvlari bilan javob beradi.'],
    [['RESOLVER / CACHE', 'CLIENT', 'IP MANZIL'], 'Resolver javobni clientga qaytaradi. TTL yozuvdan cache’da qancha vaqt foydalanish mumkinligini bildiradi.']
  ],
  '12': [
    [['APPLICATION DATA'], 'Ilova xabari: masalan, HTTP request.'],
    [['TCP HEADER', 'APPLICATION DATA'], 'Transport qatlami: TCP segment yoki UDP datagram. Headerda portlar kabi boshqaruv ma’lumotlari bor.'],
    [['IP HEADER', 'TRANSPORT + DATA'], 'Internet qatlami: IP paket. Header source va destination IP kabi ma’lumotlarni olib yuradi.'],
    [['LINK HEADER', 'IP PACKET', 'LINK TRAILER'], 'Link qatlami: masalan, Ethernet frame. IP paket lokal link orqali shu qobiqda uzatiladi.']
  ],
  '13': [
    [['CLIENT', '192.168.1.1 kimda?', 'LOKAL TARMOQ'], 'ARP request lokal tarmoqqa broadcast qilinadi. Uzoq serverga yuborishda odatda gatewayning MAC manzili kerak bo‘ladi.'],
    [['GATEWAY', 'ARP REPLY', 'CLIENT'], '192.168.1.1 interfeysi o‘z MAC manzilini javobda bildiradi.'],
    [['CLIENT / ARP CACHE', 'FRAME →', 'GATEWAY MAC'], 'Client natijani vaqtincha saqlaydi va frameni gatewayga yuboradi. IP paketdagi destination esa uzoq server manzili bo‘lib qoladi.']
  ],
  '15': [
    [['CLIENT', 'SYN →', 'SERVER'], '1. Client TCP ulanishini boshlash uchun SYN yuboradi.'],
    [['CLIENT', '← SYN-ACK', 'SERVER'], '2. Server SYN-ACK bilan javob beradi.'],
    [['CLIENT', 'ACK →', 'SERVER'], '3. Client ACK yuboradi. Odatdagi three-way handshake yakunlanadi.']
  ]
};

function foundationDiagram(n, label) {
  return panel(label, `<div class="foundation-diagram" id="foundationDiagram"></div><p class="board-description" id="foundationDescription" aria-live="polite"></p><div class="step-controls"><button class="small-button" data-action="step-back" aria-label="Oldingi bosqich">←</button><button class="small-button" data-action="step-next">Keyingi bosqich →</button><button class="small-button" data-action="step-reset" aria-label="Boshidan ko‘rsatish">↺</button><span class="step-text" id="stepCounter">01 / ${foundationFlows[n].length}</span></div>`, 'BOSQICHMA-BOSQICH');
}

function updateFoundationStep(n, index) {
  const [nodes, description] = foundationFlows[n][index];
  document.getElementById('foundationDiagram').innerHTML = nodes.map((node, i) => `${i && !['02','15'].includes(n) ? '<span class="board-arrow" aria-hidden="true">→</span>' : ''}<span class="board-node">${esc(node)}</span>`).join('');
  document.getElementById('foundationDescription').textContent = description;
}

function foundationSlides() {
  const ask = text => callout('KEYINGI SAVOL', text);
  const route = nodes => `<div class="route-diagram">${nodes.map((node, i) => `${i ? '<span class="board-arrow" aria-hidden="true">↓</span>' : ''}<div class="route-node">${node}</div>`).join('')}</div>`;
  return [
    {
      n:'01', title:'Darsning asosiy g‘oyasi', category:'BOSHLANISH', tag:'Savoldan tushunchaga',
      foot:'Maqsad — terminlarni yodlash emas, Internetni bitta tizim sifatida tushunish.',
      notes:'Doskada avval faqat CLIENT → SERVER chizing. “Serverni qanday topamiz?” → IP. “IPni odam qanday eslab qoladi?” → domen. “Domenning IP manzilini qanday topamiz?” → DNS. Tugma orqali bir savoldan keyingisiga o‘ting. DNSni kontent requesti doim o‘tadigan vositachi sifatida chizmang.',
      render:() => layout(heading('Bitta chiziq.<br><span class="accent">Butun tizim.</span>','Har bir yangi tushuncha oldingi savolning javobidan kelib chiqadi.') + `<div class="mini-list">${point('01','Kuzating','Client va server o‘rtasida nima sodir bo‘ladi?')}${point('02','Savol bering','Serverni qanday topamiz va u bilan qanday gaplashamiz?')}${point('03','Sxemani kengaytiring','Yangi tushunchaning umumiy tizimdagi vazifasini ko‘rsating.')}</div>`, foundationDiagram('01','DOSKADAGI BIRINCHI CHIZIQ'))
    },
    {
      n:'02', title:'Client va Server', category:'TARMOQ ASOSLARI', tag:'Request / Response',
      foot:'Client va server — aloqa jarayonidagi rollar.',
      notes:'Client boshqa tizimdan xizmat, ma’lumot yoki amal bajarishni so‘raydi. Server buni taqdim qiladi. Browser odatda client. Server fizik kompyuter, virtual mashina yoki cloud infratuzilmasidagi tizim bo‘lishi mumkin. Bitta qurilma yoki dastur turli aloqalarda turli rolni bajaradi.',
      render:() => layout(heading('Kim so‘raydi?<br><span class="accent">Kim javob beradi?</span>','Browserda sayt ochganingizda browser serverdan sahifa yoki ma’lumot so‘raydi.') + `<div class="mini-list">${point('C','Client','Xizmat yoki ma’lumot so‘rayotgan tomon.')}${point('S','Server','Clientlarga xizmat yoki ma’lumot taqdim qiluvchi tizim.')}</div>` + callout('MUHIM FARQ','Bitta qurilma bir aloqada client, boshqa aloqada server bo‘lishi mumkin.'), foundationDiagram('02','IKKI TOMONLAMA ALOQA'))
    },
    {
      n:'03', title:'Internet va Web bir xil emas', category:'TARMOQ ASOSLARI', tag:'Infratuzilma va xizmat',
      foot:'Web — Internet ustida ishlaydigan xizmatlardan biri.',
      notes:'Internet o‘zaro bog‘langan tarmoqlar va qurilmalarning global tizimi. WWW — World Wide Web. Email, DNS va SSH ham shu infratuzilmadan foydalanadi. Website va web application chegarasi qat’iy emas: sayt interaktiv web dastur bo‘lishi mumkin.',
      render:() => layout(heading('Internet — tarmoq.<br><span class="accent">Web — xizmat.</span>','Yo‘l infratuzilmasi turli transportlarga xizmat qilganidek, Internet ham turli xizmatlarni tashiydi.') + table(['ATAMA','ODDIY MA’NO'],[['Internet','Global tarmoqlararo infratuzilma.'],['WWW','World Wide Web — web resurslar tizimi.'],['Website','Web sahifalar va resurslar to‘plami.'],['Web application','Interaktiv funksiyalarga ega web dastur.']]), panel('INTERNET ICHIDAGI XIZMATLAR',`<div class="internet-cloud"><div class="internet-title">${icon('globe')}<strong>INTERNET</strong></div><div class="service-grid">${['WWW / WEB','EMAIL','DNS','SSH'].map(x=>`<div class="route-node">${x}</div>`).join('')}</div><p class="art-caption">Bitta infratuzilma. Turli xizmatlar.</p></div>`) + ask('Bu global tizimning kichik bo‘lagi — uy tarmog‘i qanday tuzilgan?'))
    },
    {
      n:'04', title:'Network, LAN va WAN', category:'TARMOQ ASOSLARI', tag:'Mahalliydan globalga',
      foot:'Network — ma’lumot almashish uchun bog‘langan qurilmalar va ulanishlar tizimi.',
      notes:'LAN — Local Area Network: uy, ofis, laboratoriya. WAN — Wide Area Network: katta geografik hududdagi tarmoq. Uy routeri ko‘pincha router, Ethernet switch va Wi-Fi access point funksiyalarini birlashtiradi. Bu sxema soddalashtirilgan; Internet WAN tushunchasiga bitta sinonim emas.',
      render:() => layout(heading('Avval uy ichida.<br><span class="accent">Keyin dunyoga.</span>','Network qurilmalarni ma’lumot almashish uchun bog‘laydi.') + table(['TURI','TO‘LIQ NOMI','MISOL'],[['LAN','Local Area Network','Uy, ofis, laboratoriya.'],['WAN','Wide Area Network','Keng hududdagi tarmoq.']]) + ask('Telefon yoki noutbuk bu tarmoqqa qanday ulanadi?'), panel('UY TARMOG‘I / LAN',`<div class="device-branch"><span>PHONE</span><span>LAPTOP</span><span>PC</span></div>${route(['UY ROUTERI','ISP / INTERNET'])}<p class="art-caption">Qurilmalar → lokal tarmoq → router → tashqi tarmoq.</p>`))
    },
    {
      n:'05', title:'Qurilma Internetga qanday chiqadi?', category:'TARMOQ ASOSLARI', tag:'Ulanish va sozlamalar',
      foot:'Wi-Fi ulanishi borligi Internetga chiqish ham borligini kafolatlamaydi.',
      notes:'Wi-Fi simsiz lokal ulanish; Ethernet simli lokal tarmoq texnologiyasi. Mobil tarmoq ham Internetga chiqish yo‘li. Wi-Fi uchun “Wireless Fidelity” iborasi keng uchraydi, ammo bu protokolning rasmiy kengaytmasi sifatida yodlatilmasin; darsda vazifasini ayting. DHCP sozlamalarni avtomatik beradi; statik sozlash ham mumkin. Default gateway boshqa tarmoqlarga keyingi yo‘lni beradi.',
      render:() => layout(heading('Ulanish.<br><span class="accent">Sozlama. Yo‘l.</span>','Uy routeri qurilmalarni birlashtiradi va tashqi tarmoqqa chiqish yo‘lini beradi.') + table(['ATAMA','VAZIFASI'],[['Wi-Fi','Simsiz lokal tarmoq ulanishi.'],['Ethernet','Simli lokal tarmoq texnologiyasi.'],['DHCP','Dynamic Host Configuration Protocol — IP va boshqa sozlamalarni avtomatik berish.'],['Default gateway','Boshqa tarmoqlarga chiqishda keyingi yo‘naltiruvchi.']]), foundationDiagram('05','ULANISHDAN INTERNETGACHA'))
    },
    {
      n:'06', title:'IP manzil', category:'MANZILLASH', tag:'IPv4 / IPv6 / Prefix',
      foot:'IP — Internet Protocol. Manzillash va paketlarni tarmoqlar orasida yo‘naltirish.',
      notes:'IPv4 32 bit: to‘rtta 8 bitli qism, har biri 0–255. /24 dastlabki 24 bit prefix ekanini bildiradi; shu misolda qolgan 8 bit host qismi. 192.168.1.25/24 tarmog‘i 192.168.1.0/24, maskasi 255.255.255.0. IPv6 128 bitli manzillar maydoniga ega. 2001:db8::25 — hujjatlar uchun ajratilgan IPv6 misoli. Prefix uzunligi IP manzilning o‘zi bilan bir tushuncha emas.',
      render:() => layout(heading('Serverni qanday<br><span class="accent">topamiz?</span>','IP manzil tarmoq interfeysini manzillashda kerak. IPv4 va IPv6 manzil formatlari farq qiladi.') + table(['VERSIYA','UZUNLIK','MISOL'],[['IPv4','32 bit','192.168.1.25'],['IPv6','128 bit','2001:db8::25']]) + callout('IPv6 NIMA UCHUN?','IPv4ga nisbatan ancha katta manzil maydonini beradi.'),panel('IPv4 MANZILINI AJRATAMIZ',`<div class="ip-address"><span>192</span><i>.</i><span>168</span><i>.</i><span>1</span><i>.</i><span class="host-part">25</span><b>/24</b></div><div class="prefix-key"><span>Tarmoq prefixi · 24 bit</span><span>Host · 8 bit</span></div><div class="bit-bar"><span>NETWORK / 24</span><span>HOST / 8</span></div><div class="address-facts"><p>Subnet mask <code>255.255.255.0</code></p><p>Tarmoq <code>192.168.1.0/24</code></p><p>Har bir IPv4 qismi <code>0–255</code></p></div>`))
    },
    {
      n:'07', title:'Private IP, Public IP va NAT', category:'MANZILLASH', tag:'Ichki va tashqi manzil',
      foot:'NAT — Network Address Translation. Firewall esa trafikni qoidalar asosida nazorat qiladi.',
      notes:'Private diapazonlar: 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16. Public IP global Internetda yo‘naltiriladigan manzil, lekin xizmat ochiq degani emas. Ko‘p uy qurilmalari NATning portlarni ham translyatsiya qiluvchi turi (NAPT/PAT) yordamida bitta public IPni ulashadi. Sxemada tashqi IP sifatida hujjatlar uchun ajratilgan 203.0.113.10 ishlatilgan; u haqiqiy global manzil emas. NAT va firewallni tenglashtirmang.',
      render:() => layout(heading('Uyda ko‘p manzil.<br><span class="accent">Tashqarida bitta.</span>','Private IP ichki tarmoqda, public IP global Internetda manzillash uchun ishlatiladi.') + table(['PRIVATE DIAPAZON','PREFIX'],[['10.0.0.0 – 10.255.255.255','/8'],['172.16.0.0 – 172.31.255.255','/12'],['192.168.0.0 – 192.168.255.255','/16']]) + callout('NAT ≠ FIREWALL','NAT manzilni translyatsiya qiladi. Trafikka ruxsat berish yoki uni bloklash firewall qoidalariga bog‘liq.',true), panel('MANZIL TRANSLYATSIYASI',`<div class="device-branch mono"><span>192.168.1.10</span><span>192.168.1.11</span><span>192.168.1.12</span></div>${route(['NAT ROUTER','TASHQI IP · 203.0.113.10','INTERNET'])}<p class="art-caption">Tashqi IP — hujjatlashtirish uchun misol. Ko‘p clientli sxemada portlar ham translyatsiya qilinadi.</p>`))
    },
    {
      n:'08', title:'Domen nomi va URL', category:'NOMLASH', tag:'Odam uchun qulay manzil',
      foot:'Domen — nom. URL — resursga murojaat qilish manzili. IP — tarmoq manzili.',
      notes:'Domen IP manzilning o‘zi emas. URL — Uniform Resource Locator. Misolda https scheme, www.example.com host, /login path. example.com domeni ostida www, api, admin kabi subdomainlar bo‘lishi mumkin. URLda port, query va fragment ham qatnashishi mumkin; bu slaydda uchta asosiy qism ko‘rsatilgan.',
      render:() => layout(heading('Raqam o‘rniga<br><span class="accent">eslanadigan nom.</span>','example.com kabi domen nomlari odamlar uchun qulay nomlash tizimining bir qismidir.') + `<div class="mini-list">${point('01','Domen','example.com — IP manzilning o‘zi emas.')}${point('02','Subdomain','api.example.com yoki admin.example.com.')}${point('03','URL','Uniform Resource Locator — resursga qanday va qayerga murojaat qilishni ifodalaydi.')}</div>` + ask('Domenni bilamiz. Uning IP manzilini qanday topamiz?'), panel('URLNI QISMLARGA AJRATAMIZ',`<div class="url-parts"><div><code>https://</code><span>SCHEME</span><small>Qanday protokol?</small></div><div><code>www.example.com</code><span>HOST / DOMAIN</span><small>Qaysi host?</small></div><div><code>/login</code><span>PATH</span><small>Qaysi resurs?</small></div></div>${route(['example.com','api.example.com · admin.example.com'])}`))
    },
    {
      n:'09', title:'DNS — Domain Name System', category:'NOMLASH', tag:'Resolver / Cache / TTL',
      foot:'DNS — domenlarga bog‘liq tarmoq ma’lumotlarini topuvchi taqsimlangan tizim.',
      notes:'Recursive resolver client nomidan javob izlaydi. Cache’da javob yoki oraliq yo‘llanma bo‘lsa, barcha bosqichlar takrorlanmaydi. Root → TLD → authoritative — nomlash ierarxiyasi. TLD — Top-Level Domain. Authoritative server ma’lum zona uchun rasmiy ma’lumot beradi. TTL — Time To Live; odatda yozuvning cache’da yaroqlilik muddati (soniyalarda). Diagrammadagi qadamlar resolverning alohida so‘rovlari, HTTP kontentining yo‘li emas.',
      render:() => layout(heading('Nom bor.<br><span class="accent">IP qayerda?</span>','DNS domen nomi bilan bog‘liq yozuvlarni topishga yordam beradi.') + `<div class="mini-list">${point('01','Recursive resolver','Client nomidan javob izlaydi yoki cache’dan beradi.')}${point('02','Root → TLD → Authoritative','Masalan: root → .com → example.com zonasi.')}${point('03','Cache va TTL','Javob vaqtincha saqlanadi; TTL uning yaroqlilik vaqtini belgilaydi.')}</div>` + callout('IERARXIYA','<code>. → com → example.com → www.example.com</code>'), foundationDiagram('09','DNS LOOKUP / CACHE’DA JAVOB YO‘Q'))
    },
    {
      n:'10', title:'DNS recordlar', category:'NOMLASH', tag:'7 ta yozuv turi',
      foot:'DNS faqat “domen → bitta IP” emas. Bir nomga bir nechta yozuv va IP bog‘lanishi mumkin.',
      notes:'A — Address, IPv4. AAAA — IPv6 address record turi; bu nomning harflari alohida so‘zlar qisqartmasi emas. CNAME — Canonical Name: aliasdan boshqa nomga. MX — Mail Exchange, NS — Name Server, TXT — Text, PTR — Pointer. PTR reverse DNSda maxsus reverse zona ichida IPdan nomga moslikni bildiradi. Misollardagi manzillar hujjatlashtirish uchun ajratilgan.',
      render:() => `<div class="full-width">${heading('Bitta tizim.<br><span class="accent">Turli javoblar.</span>','Qanday ma’lumot kerakligiga qarab, DNS yozuvining turi tanlanadi.')}<div class="wide-layout"><div>${table(['RECORD','NOMI','VAZIFASI'],[['A','Address','IPv4 manzil.'],['AAAA','IPv6 Address','IPv6 manzil.'],['CNAME','Canonical Name','Boshqa domen nomiga alias.'],['MX','Mail Exchange','Email serverlari.'],['NS','Name Server','Zona uchun DNS serverlari.'],['TXT','Text','Matnli DNS ma’lumotlari.'],['PTR','Pointer','Reverse DNS: IPdan nomga.']])}</div>${panel('TA’LIMIY DNS JAVOBI',`<pre class="code-window"><span class="code-gray">; Bitta nom, ikkita IPv4</span>\nexample.com.  A  203.0.113.10\nexample.com.  A  203.0.113.11\n\n<span class="code-gray">; IPv6 manzili</span>\nexample.com.  AAAA  2001:db8::10\n\n<span class="code-gray">; Alias boshqa nomni ko‘rsatadi</span>\nwww.example.com.\n  CNAME  example.com.</pre><p class="code-caption">CNAME qiymati IP emas, domen nomidir.</p>`, 'RECORD TYPE')}</div></div>`
    },
    {
      n:'11', title:'Router va Routing', category:'PAKETNING YO‘LI', tag:'Next hop / Default route',
      foot:'0.0.0.0/0 — aniqroq mos yo‘l bo‘lmaganda ishlatiladigan IPv4 default route.',
      notes:'Router turli tarmoqlar orasida paketlarni yo‘naltiradi. Routing table destination prefixni next hop yoki chiqish interfeysi bilan bog‘laydi. Mos yo‘llardan eng uzun prefix tanlanadi. Hop bu yerda yo‘ldagi router qadamidir. Yo‘l dinamik o‘zgarishi, qaytish yo‘li esa boshqacha bo‘lishi mumkin.',
      render:() => layout(heading('Manzil ma’lum.<br><span class="accent">Qaysi yo‘ldan?</span>','Router paketni routing ma’lumotlari asosida keyingi yo‘naltiruvchi yoki interfeysga uzatadi.') + table(['DESTINATION','NEXT HOP / INTERFACE'],[['192.168.1.0/24','local'],['0.0.0.0/0','default route']]) + callout('HOP NIMA?','Paket yo‘lidagi har bir router qadami hop sifatida tasvirlanadi.'), panel('PAKETNING TARMOQLARARO YO‘LI',route(['CLIENT','ROUTER 1 · hop 1','ROUTER 2 · hop 2','ROUTER 3 · hop 3','SERVER'])))
    },
    {
      n:'12', title:'Paket nima?', category:'PAKETNING YO‘LI', tag:'Data / Segment / Packet / Frame',
      foot:'Header — boshqaruv qismi: manzil, protokol, uzunlik va boshqa metadata.',
      notes:'Ilova ma’lumoti protokol qatlamlariga o‘raladi: transportda TCP segment yoki UDP datagram, IPda paket, linkda frame. Sxema TCP/IP/Ethernet misolini soddalashtiradi; har bir ilova xabari aynan bitta paketga teng emas. Ethernet frame trailerga ham ega. Keyingi router link qobig‘ini almashtirishi mumkin.',
      render:() => layout(heading('Ma’lumot<br><span class="accent">qobiqlarga o‘raladi.</span>','Har bir qatlam ma’lumotni yetkazish uchun o‘z boshqaruv ma’lumotlarini qo‘shishi mumkin.') + table(['QATLAM','MA’LUMOT BIRLIGI'],[['Application','Data / xabar'],['Transport','Segment / datagram'],['Internet','IP packet'],['Link','Frame']]) + ask('Lokal linkda frame aynan qaysi interfeysga yuboriladi?'), foundationDiagram('12','ENCAPSULATION / QATLAMLAR'))
    },
    {
      n:'13', title:'MAC va ARP', category:'LOKAL TARMOQ', tag:'IP → MAC',
      foot:'IP va MAC bir-birining o‘rnini bosmaydi: ularning vazifasi va qo‘llanish doirasi farq qiladi.',
      notes:'MAC — Media Access Control. Ethernet kabi lokal linklarda interfeys manzili sifatida ishlatiladi. ARP — Address Resolution Protocol, IPv4 lokal tarmog‘ida IPga mos MACni aniqlaydi. ARP Internet bo‘ylab uzoq serverning MACini izlamaydi. IPv6 ARP o‘rniga Neighbor Discoverydan foydalanadi. MAC o‘zgarmas va dunyoda mutlaqo yagona qurilma identifikatori deb tushuntirmang.',
      render:() => layout(heading('IPni bilamiz.<br><span class="accent">MACni kim aytadi?</span>','ARP lokal IPv4 tarmog‘ida IP manzilga mos MAC manzilni topishga yordam beradi.') + `<div class="mini-list">${point('IP','Tarmoqlararo manzillash','Paketni kerakli tarmoqqa yo‘naltirish.')}${point('MAC','Media Access Control','Lokal linkda interfeysga frame yuborish.')}${point('ARP','Address Resolution Protocol','“192.168.1.1 kimda?” so‘roviga MAC bilan javob olish.')}</div>`, foundationDiagram('13','GATEWAY MAC MANZILINI TOPAMIZ'))
    },
    {
      n:'14', title:'TCP/IP modeli', category:'QATLAMLAR', tag:'TCP/IP va OSI',
      foot:'OSI — Open Systems Interconnection. 7 qatlamli konseptual model; TCP/IP bilan aynan bir xil emas.',
      notes:'TCP/IPning ushbu talqini 4 qatlamdan iborat: application, transport, internet, link. OSI 7 qatlamli: Application, Presentation, Session, Transport, Network, Data Link, Physical. Jadval soddalashtirilgan moslash, barcha protokollar uchun qat’iy tenglik emas. Maqsad vazifalar chegarasini ko‘rish.',
      render:() => `<div class="full-width">${heading('Har qatlamning <span class="accent">o‘z vazifasi bor.</span>','Bir xabar almashinuvi bir nechta qatlamning hamkorligi orqali bajariladi.')}<div class="wide-layout"><div>${table(['TCP/IP','MISOLLAR','ASOSIY VAZIFA'],[['Application','HTTP, DNS, SSH','Ilovalar foydalanadigan protokollar.'],['Transport','TCP, UDP','Portlar va end-to-end transport.'],['Internet','IP, ICMP','Manzillash va routing.'],['Link','Ethernet, Wi-Fi','Lokal link orqali frame almashish.']])}</div>${panel('OSI → TCP/IP / SODDALASHTIRILGAN',`<div class="model-map"><div><span>Application<br>Presentation<br>Session</span><b>→</b><strong>Application</strong></div><div><span>Transport</span><b>→</b><strong>Transport</strong></div><div><span>Network</span><b>→</b><strong>Internet</strong></div><div><span>Data Link<br>Physical</span><b>→</b><strong>Link</strong></div></div>`, '7 → 4')}</div></div>`
    },
    {
      n:'15', title:'TCP va UDP', category:'TRANSPORT', tag:'Ikki transport yondashuvi',
      foot:'Keyingi savol: bitta IPdagi turli xizmatlarni qanday ajratamiz? → Port.',
      notes:'TCP — Transmission Control Protocol: ulanishga asoslangan, tartibli bayt oqimi, yo‘qotishni aniqlash va qayta uzatish. Bu tarmoq uzilsa ham ma’lumot albatta yetadi degani emas. UDP — User Datagram Protocol: TCP kabi ulanish handshake’i va tartib/yetkazish kafolatlari yo‘q; ilova o‘z mexanizmlarini qurishi mumkin. DNS ham UDP, ham TCPdan foydalanadi. HTTP/3 QUIC orqali UDP ustida ishlaydi. Handshake odatdagi uch qadamli misol.',
      render:() => layout(heading('Ulanish va tartib.<br><span class="accent">Yoki datagram.</span>','TCP va UDP — turli ehtiyojlar uchun ishlatiladigan transport protokollari.') + table(['','TCP','UDP'],[['To‘liq nomi','Transmission Control Protocol','User Datagram Protocol'],['Aloqa','Connection-oriented','Connectionless'],['Mexanizmlar','Tartib, qayta uzatish','Minimal transport overhead'],['Misollar','Ko‘plab web aloqalari, SSH','DNS, ayrim real-time aloqalar']]) + callout('YODDA TUTING','UDP o‘zi yetkazilish va tartib kafolatini bermaydi. DNS TCPdan ham foydalanadi.'), foundationDiagram('15','TCP / THREE-WAY HANDSHAKE'))
    }
  ];
}
