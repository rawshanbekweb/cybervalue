'use strict';

const icons = {
  browser: '<rect x="3" y="4" width="26" height="23" rx="3"/><path d="M3 11h26M7 8h1m3 0h1M11 17l-4 3 4 3m10-6 4 3-4 3"/>',
  server: '<rect x="5" y="3" width="22" height="11" rx="2"/><rect x="5" y="18" width="22" height="11" rx="2"/><path d="M10 8h1m4 0h7M10 23h1m4 0h7"/>',
  globe: '<circle cx="16" cy="16" r="13"/><ellipse cx="16" cy="16" rx="6" ry="13"/><path d="M3 16h26M6 8h20M6 24h20"/>',
  database: '<ellipse cx="16" cy="7" rx="11" ry="4"/><path d="M5 7v18c0 5 22 5 22 0V7M5 16c0 5 22 5 22 0"/>',
  lock: '<rect x="6" y="14" width="20" height="15" rx="3"/><path d="M10 14V9a6 6 0 0112 0v5M16 20v4"/>',
  app: '<rect x="4" y="4" width="24" height="24" rx="5"/><path d="M12 11l-5 5 5 5m8-10 5 5-5 5m-3-12-2 16"/>',
  dns: '<circle cx="16" cy="7" r="4"/><rect x="2" y="23" width="8" height="6" rx="1"/><rect x="22" y="23" width="8" height="6" rx="1"/><path d="M16 11v7M6 23v-5h20v5"/>'
};
const icon = name => `<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] || icons.globe}</svg>`;
const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const callout = (title, body, warning = false) => `<div class="callout${warning ? ' warning' : ''}"><strong>${title}</strong>${body}</div>`;
const table = (heads, rows) => `<table class="data-table"><thead><tr>${heads.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.map(row => `<tr>${row.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
const panel = (label, body, right = 'LIVE DIAGRAM') => `<div class="panel dark-panel grid-bg"><div class="panel-label"><span>${label}</span><span>${right}</span></div>${body}</div>`;
const point = (n, title, text) => `<div class="numbered"><span>${n}</span><div><h3>${title}</h3><p>${text}</p></div></div>`;
const layout = (left, right) => `<div class="slide-layout"><div class="slide-copy">${left}</div><div>${right}</div></div>`;
const heading = (title, lead, hero = false) => `<h1${hero ? ' class="hero-title"' : ''}>${title}</h1><p class="lead">${lead}</p>`;
const stack = items => `<div class="stack">${items.map((item, i) => `${i ? `<div class="stack-arrow" style="--i:${i}"><span>↓</span></div>` : ''}<div class="stack-node reveal" style="--i:${i}">${icon(item[0])}<div><strong>${item[1]}</strong><small>${item[2]}</small></div></div>`).join('')}</div>`;

const methods = [
  ['GET', 'Ma’lumot olish', '/products', 'Server mahsulotlar ro‘yxatini qaytaradi.'],
  ['POST', 'Yaratish yoki amal boshlash', '/login', 'Server yuborilgan login ma’lumotlarini tekshiradi.'],
  ['PUT', 'Resursni to‘liq almashtirish', '/users/10', 'Resursning to‘liq yangi ko‘rinishi yuboriladi.'],
  ['PATCH', 'Qisman yangilash', '/users/10', 'Masalan, faqat profil nomi o‘zgartiriladi.'],
  ['DELETE', 'Resursni o‘chirish', '/users/10', 'Server ruxsatni tekshirib, resursni o‘chiradi.'],
  ['HEAD', 'GET kabi, javob bodysisiz', '/', 'Resursning faqat javob headerlari olinadi.']
];
const statuses = [
  ['1xx', 'Informational', 'Jarayon haqida axborot', '100, 101', '100 Continue — client request bodysini yuborishni davom ettirishi mumkin.'],
  ['2xx', 'Success', 'Request muvaffaqiyatli bajarildi', '200, 201, 204', '200 OK — muvaffaqiyat. 201 Created — resurs yaratildi. 204 No Content — javob bodysi yo‘q.'],
  ['3xx', 'Redirection', 'Yo‘naltirish va cache bilan ishlash', '301, 302, 304', '301/302 — boshqa manzilga yo‘naltirish. 304 Not Modified — cachedagi nusxadan foydalanish mumkin.'],
  ['4xx', 'Client / request error', 'Request yoki ruxsat bilan bog‘liq muammo', '400, 401, 403, 404', '400 — noto‘g‘ri request. 401 — autentifikatsiya talab qilinadi yoki yaroqsiz. 403 — ruxsat berilmadi. 404 — resurs topilmadi.'],
  ['5xx', 'Server error', 'Server requestni bajara olmadi', '500, 502, 503', '500 — ichki xato. 502 — gateway upstreamdan yaroqsiz javob oldi. 503 — xizmat vaqtincha mavjud emas.']
];
const journey = [
  ['User / Browser', 'Foydalanuvchi URLni kiritadi. Browser sxema, domen, port va pathni ajratadi.'],
  ['DNS', 'Browser yoki OS cache va resolver orqali domenning DNS ma’lumotini izlaydi.'],
  ['IP manzil', 'Ulanish uchun mos IPv4 yoki IPv6 manzil tanlanadi.'],
  ['Routing', 'Paketlar lokal tarmoq, gateway, ISP va boshqa routerlar orqali serverga boradi.'],
  ['TCP', 'TCP ishlatilganda client va server SYN → SYN-ACK → ACK orqali ulanish o‘rnatadi.'],
  ['TLS', 'Sertifikat tekshiriladi, kalitlar kelishiladi va himoyalangan kanal yaratiladi.'],
  ['HTTP request', 'Browser /login resursi uchun request yuboradi. HTTPSda HTTP xabari himoyalangan kanal ichida ketadi.'],
  ['Web server', 'Web server yoki reverse proxy requestni qabul qiladi va kerakli backendga uzatishi mumkin.'],
  ['Application', 'Ilova routing, autentifikatsiya, ruxsat va biznes mantiqni bajaradi.'],
  ['Database', 'Zarur bo‘lsa application ma’lumotlarni bazadan oladi yoki bazaga yozadi.'],
  ['HTTP response', 'Server status code, headerlar va kerak bo‘lsa body bilan javob qaytaradi.'],
  ['Rendering', 'Browser HTMLni parse qiladi, DOM yaratadi; CSS, JS va rasmlarni yuklab, sahifani ko‘rsatadi.']
];
const browserSteps = [
  ['URL', 'Browser URLni tahlil qiladi: https — sxema, example.com — domen, /login — path.'],
  ['DNS → IP', 'DNS cache tekshiriladi. Kerak bo‘lsa resolverdan so‘raladi va mos IP manzil olinadi.'],
  ['Ulanish', 'Routing orqali serverga yo‘l topiladi. Bu misolda TCP ulanishi va TLS handshake bajariladi.'],
  ['HTTP', 'Request serverga boradi. Server yoki application uni qayta ishlab, response qaytaradi.'],
  ['DOM + resurslar', 'HTML parse qilinadi va DOM tuziladi. CSS, JavaScript, rasm va boshqa resurslar so‘ralishi mumkin.'],
  ['Render', 'Browser uslublarni hisoblaydi, layoutni aniqlaydi va piksellarni ekranga chizadi.']
];
const security = [
  ['DNS / Domain', 'Attack surface · subdomainlar', 'Qaysi subdomainlar tashqariga ochiq va ularning DNS konfiguratsiyasi to‘g‘rimi?'],
  ['IP / Network', 'Exposure · segmentation', 'Qaysi tarmoq xizmatlariga internetdan ulanish mumkin? Ichki segmentlar qanday ajratilgan?'],
  ['Port', 'Service discovery', 'Qaysi port ochiq, unda qanday xizmat ishlaydi va u tashqariga ochiq bo‘lishi kerakmi?'],
  ['HTTP', 'Input validation · authentication', 'Server yuborilgan inputni qanday tekshiradi? Requestni kim yuborayotganini qanday aniqlaydi?'],
  ['Cookie / Session', 'Session lifecycle · cookie flags', 'Session muddati qanday? Cookie uchun Secure, HttpOnly va SameSite mos sozlanganmi?'],
  ['Web application', 'Access control · XSS · injection', 'Bir foydalanuvchi boshqa foydalanuvchining ma’lumotiga kira oladimi? Kiritilgan ma’lumot xavfsiz qayta ishlanadimi?'],
  ['Database', 'Data exposure · access control', 'So‘rovlar parametr bilan bajariladimi? Application databasega faqat zarur ruxsatlar bilan ulanadimi?'],
  ['HTTPS / TLS', 'Transport security', 'Sertifikat yaroqlimi, domen bilan mosmi va TLS konfiguratsiyasi to‘g‘rimi?']
];
const glossary = [
  ['API','Application Programming Interface','Dasturlar o‘zaro murojaat qiladigan interfeys.'],
  ['ARP','Address Resolution Protocol','Lokal IPv4 tarmog‘ida IPdan MACni aniqlashga yordam beradi.'],
  ['CDN','Content Delivery Network','Kontentni tarqoq nuqtalardan yetkazadi.'],
  ['CIDR','Classless Inter-Domain Routing','IP prefixlarini /24 kabi ifodalash usuli.'],
  ['CSS','Cascading Style Sheets','Web sahifaning ko‘rinishi va uslubi.'],
  ['DB','Database','Ma’lumotlar bazasi.'],
  ['DBMS','Database Management System','Ma’lumotlar bazasini boshqarish tizimi.'],
  ['DHCP','Dynamic Host Configuration Protocol','Tarmoq konfiguratsiyasini avtomatik berishga yordam beradi.'],
  ['DNS','Domain Name System','Domen nomlari tizimi.'],
  ['DOM','Document Object Model','Browserdagi hujjat obyektlari modeli.'],
  ['FQDN','Fully Qualified Domain Name','To‘liq ko‘rsatilgan domen nomi.'],
  ['HTTP','Hypertext Transfer Protocol','Web xabar almashish protokoli.'],
  ['HTTPS','HTTP Secure','TLS orqali himoyalangan HTTP.'],
  ['ICMP','Internet Control Message Protocol','Tarmoq nazorat va diagnostika xabarlari.'],
  ['IP','Internet Protocol','Manzillash va paket yo‘naltirish protokoli.'],
  ['ISP','Internet Service Provider','Internet xizmatini taqdim qiluvchi provayder.'],
  ['LAN','Local Area Network','Mahalliy tarmoq.'],
  ['MAC','Media Access Control','Lokal link interfeys manzili bilan bog‘liq tushuncha.'],
  ['NAT','Network Address Translation','IP manzillarni translyatsiya qilish.'],
  ['OSI','Open Systems Interconnection','7 qatlamli konseptual networking modeli.'],
  ['TCP','Transmission Control Protocol','Ulanishga asoslangan transport protokoli.'],
  ['TLS','Transport Layer Security','Tarmoq aloqasini kriptografik himoyalash protokoli.'],
  ['TTL','Time To Live','DNSda cache muddati; IPda paket hayotini cheklovchi qiymat.'],
  ['UDP','User Datagram Protocol','Ulanishsiz transport protokoli.'],
  ['URL','Uniform Resource Locator','Resurs manzilini ifodalovchi format.'],
  ['WWW','World Wide Web','Internet ustidagi web resurslar tizimi.'],
  ['SSH','Secure Shell','Masofaviy xavfsiz ulanish protokoli.'],
  ['SQL','Structured Query Language','Relatsion database bilan ishlash tili.']
];
const boardStages = [
  [['CLIENT','SERVER'],'Boshlanish: client so‘rov yuboradi, server xizmat ko‘rsatadi. Bular qurilma turi emas, rollardir.'],
  [['CLIENT','INTERNET','SERVER'],'Internet — client va server o‘rtasidagi o‘zaro bog‘langan tarmoqlar.'],
  [['CLIENT','ROUTER','ISP','INTERNET','SERVER'],'Router paketlarni keyingi tugunga yuboradi. ISP internetga ulanishni ta’minlaydi.'],
  [['CLIENT','ROUTER','INTERNET','IP → SERVER'],'IP manzil paketning qaysi manzilga yetib borishini ko‘rsatadi.'],
  [['USER','BROWSER','example.com','DNS → IP','SERVER'],'DNS nomni IPga moslashtirishga yordam beradi. DNS server kontent requestining doimiy vositachisi emas.'],
  [['CLIENT','IP:443','SERVER'],'Port transport protokoli doirasida xizmatni ajratadi. 443 odatda HTTPS uchun ishlatiladi.'],
  [['CLIENT','TCP','TLS','HTTP REQUEST','WEB SERVER'],'TCP ulanishni ta’minlaydi, TLS kanalni himoyalaydi, HTTP xabar almashish qoidalarini belgilaydi.'],
  [['WEB SERVER','WEB APPLICATION','DATABASE'],'Web server requestni qabul qiladi. Application biznes mantiqni bajaradi, database ma’lumot saqlaydi.'],
  [['USER','BROWSER','DNS → IP','ROUTING','TCP','TLS','HTTP','WEB SERVER','APPLICATION','DATABASE','RESPONSE → BROWSER'],'Yakuniy konseptual sxema. Bu tushunchalar jarayondagi rollarni ko‘rsatadi; ularning hammasi alohida qurilma emas.']
];
const questions = [
  ['Tarmoq','Client va serverni qurilmaga emas, rolga qarab qanday tushuntirasiz?','Client xizmat so‘raydi, server xizmat ko‘rsatadi. Bitta qurilma turli aloqalarda ikkala rolni ham bajarishi mumkin.'],
  ['Tarmoq','Internet va WWW o‘rtasidagi farq nima?','Internet — tarmoqlar infratuzilmasi. WWW — shu infratuzilma ustida HTTP(S) bilan ishlovchi resurslar tizimi.'],
  ['Tarmoq','IP manzil nima uchun kerak?','Tarmoq interfeyslarini manzillash va paketlarni kerakli tarmoqqa yo‘naltirish uchun.'],
  ['Tarmoq','IPv4 32 bit degani nima?','IPv4 manzil 32 ta ikkilik bitdan tuziladi. U odatda har biri 8 bit bo‘lgan to‘rtta o‘nlik son bilan yoziladi.'],
  ['Tarmoq','/24 nimani bildiradi?','32 bitli IPv4 manzilining dastlabki 24 biti tarmoq prefixi ekanini bildiradi. Qolgan 8 bit manzilning host qismidir.'],
  ['Tarmoq','Private va public IP o‘rtasidagi farq nima?','Private diapazonlar ichki tarmoqlar uchun ajratilgan va global internetda odatda marshrutlanmaydi. Public manzillar global manzillashda ishlatiladi; public IP xizmat albatta ochiq degani emas.'],
  ['Tarmoq','NAT nima qiladi? Nima qilmaydi?','NAT IP manzillarni, ayrim turlari portlarni ham translyatsiya qiladi. U shifrlashni yoki application xavfsizligini ta’minlamaydi.'],
  ['DNS va routing','Nega domen IPning o‘zi emas?','Domen — nom. DNS yozuvlari uni bir yoki bir nechta IP bilan bog‘lashi mumkin; bu moslik o‘zgarishi mumkin.'],
  ['DNS va routing','Resolver va authoritative DNS server farqi nima?','Resolver client uchun javobni izlaydi va cache qiladi. Authoritative server o‘zi mas’ul DNS zona yozuvlari bo‘yicha javob beradi.'],
  ['DNS va routing','DNS cache va TTL nima uchun kerak?','Cache takroriy so‘rovlar vaqtini va yukini kamaytiradi. TTL yozuvni qayta tekshirmasdan qancha saqlash mumkinligini belgilaydi.'],
  ['DNS va routing','Router routing table’dan qanday foydalanadi?','Destination IPga mos eng uzun prefixni tanlab, paketning next hop va chiqish interfeysini aniqlaydi.'],
  ['DNS va routing','Paket va frame o‘rtasidagi farq nima?','IP paket tarmoq qatlamining birligi. Frame lokal link qatlamining birligi bo‘lib, IP paketni o‘z ichida olib yurishi mumkin.'],
  ['DNS va routing','MAC va IP vazifalari qanday farq qiladi?','MAC lokal linkda interfeysga frame yetkazishda, IP tarmoqlar orasida paketlarni yo‘naltirishda ishlatiladi.'],
  ['DNS va routing','ARP lokal IPv4 tarmog‘ida nima uchun kerak?','Ma’lum lokal IPv4 manzilga mos MACni aniqlaydi. Uzoq server uchun odatda gatewayning MAC manzili aniqlanadi.'],
  ['Transport','TCP handshake nima?','Odatdagi boshlanish SYN → SYN-ACK → ACK almashinuvi bo‘lib, tomonlar ulanish holati va boshlang‘ich sequence raqamlarini kelishadi.'],
  ['Transport','TCP va UDPning asosiy farqi nima?','TCP ulanish holati, tartibli bayt oqimi va qayta uzatishni ta’minlaydi. UDP datagram yuboradi; yetkazish va tartib kafolatlarini o‘zi bermaydi.'],
  ['Transport','IP va port birgalikda qanday ma’no beradi?','Transport protokoli kontekstida aloqa endpointini ifodalaydi. TCP ulanishi source va destination IP/port juftliklari bilan ajratiladi.'],
  ['Web','HTTP requestning asosiy qismlari nimalar?','HTTP/1.1 misolida: request line (method, target, versiya), headerlar, bo‘sh satr va ixtiyoriy body.'],
  ['Web','GET va POSTni maqsad jihatidan farqlang.','GET resurs ko‘rinishini olish uchun; POST ma’lumotni resursga qayta ishlash uchun yuboradi, yaratish yoki amalni boshlashi mumkin.'],
  ['Web','401 va 403 farqi nima?','401 — mos autentifikatsiya yetishmaydi yoki yaroqsiz. 403 — server requestni tushundi, lekin bajarishga ruxsat bermadi.'],
  ['Web','Cookie va session bir xilmi?','Yo‘q. Cookie browser saqlaydigan va mos requestlarda yuboradigan ma’lumot. Serverdagi session holatiga bog‘lanish uchun cookie ichida session ID bo‘lishi mumkin.'],
  ['Web','HTTPS saytning o‘zi xavfsizligini anglatadimi?','Yo‘q. U transport kanalini himoyalaydi. XSS, injection, IDOR va biznes mantiq xatolari ilovada qolishi mumkin.'],
  ['Web','TLS sertifikatining vazifasi nima?','Domen nomi va public key orasidagi tasdiqlangan bog‘lanishni beradi. Browser ishonch zanjiri, domen mosligi va amal muddatini tekshiradi.'],
  ['Web','Web server va web application farqi nima?','Web server HTTP requestni qabul qilish, statik kontent yoki proxy vazifasini bajaradi. Application biznes mantiq va foydalanuvchi amallarini bajaradi.'],
  ['Web','Browser HTMLni olgandan keyin nima qiladi?','HTMLni parse qilib DOM yaratadi, bog‘langan resurslarni yuklaydi, uslublar va layoutni hisoblab sahifani chizadi.'],
  ['Web','Qaysi nuqtalarda security muammolari paydo bo‘ladi?','Client, DNS, tarmoq, TLS, HTTP, autentifikatsiya, ruxsat, session, server, application, database va konfiguratsiyada.']
];
const checks = ['Client va Serverni rol orqali tushuntira olaman.','Internet va Web farqini tushuntira olaman.','Domen → DNS → IP munosabatini tushuntira olaman.','Private / Public IP va NATni tushuntira olaman.','Port nima uchun kerakligini tushuntira olaman.','TCP va UDPni farqlay olaman.','HTTP request / response tuzilishini tushuntira olaman.','HTTPS va TLSni tushuntira olaman.','Web server, application va database farqini tushuntira olaman.','Butun jarayonni doskada boshidan oxirigacha chiza olaman.'];

function networkArt() {
  return `<div class="panel dark-panel grid-bg network-art"><div class="panel-label"><span>BIR REQUESTNING SAYOHATI</span><span>● JONLI</span></div><div class="network-orbit"><div class="orbit-ring"></div><div class="orbit-ring outer"></div><svg class="network-wires" viewBox="0 0 450 300" preserveAspectRatio="none" aria-hidden="true"><path class="wire" d="M70 65L225 150L385 78M100 250L225 150L375 250"/><path class="packet-line" d="M70 65L225 150L385 78M100 250L225 150L375 250"/></svg><div class="network-center">${icon('globe')}<small>INTERNET</small></div><div class="network-node node-browser">${icon('browser')}<div>Browser<small>Request yuboradi</small></div></div><div class="network-node node-server">${icon('server')}<div>Web server<small>Javob qaytaradi</small></div></div><div class="network-node node-dns">${icon('dns')}<div>DNS<small>Nom → IP</small></div></div><div class="network-node node-db">${icon('database')}<div>Database<small>Ma’lumot saqlaydi</small></div></div></div><div class="art-caption"><span class="live-dot"></span> Bir sahifa. Bir nechta tizim. Bitta umumiy jarayon.</div></div>`;
}
function journeyPanel(type) {
  const data = type === 'browser' ? browserSteps : journey;
  return panel(type === 'browser' ? 'SAHIFA YUKLANISHI' : 'END-TO-END / REQUEST LIFECYCLE', `<div class="url-bar">⌑ &nbsp; https://example.com/login</div><div class="journey-grid" data-journey="${type}">${data.map((x,i) => `<button class="journey-step${i === 0 ? ' active' : ''}" data-step="${i}" aria-pressed="${i === 0}"><span>${String(i+1).padStart(2,'0')} ${i < data.length-1 ? '→' : '✓'}</span><strong>${x[0]}</strong></button>`).join('')}</div><div class="journey-description" id="journeyDescription">${data[0][1]}</div><div class="step-controls"><button class="small-button" data-action="step-back" aria-label="Oldingi bosqich">←</button><button class="small-button" data-action="step-next">Keyingi bosqich →</button><span class="step-text" id="stepCounter">01 / ${data.length}</span></div>`);
}

const slides = expandLessons([
  { n:'00', title:'Web qanday ishlaydi?', category:'BOSHLANISH', tag:'Interaktiv taqdimot', foot:'Tushunchadan jarayonga. Jarayondan xavfsizlikka.', notes:'Bu taqdimot darsning barcha 1–30-mavzularini qamrab oladi. Client va serverdan boshlang, keyin savollar orqali yangi tushunchalarni kiriting. O‘ng va chap strelka slayd almashtiradi. Animatsiyalarni pauza qilish, sxema tugunlarini bosish va o‘qituvchi izohlarini ochish mumkin. DNS va database tugunlari kirishdagi konseptual xaritada tasvirlangan.', render:() => layout(heading('Web qanday<br><span class="accent">ishlaydi?</span>','Browserdagi bitta manzildan — server, application va databasegacha bo‘lgan sayohat.',true)+`<div class="intro-pills"><span class="pill">${slides.length} ta slayd</span><span class="pill">30 ta mavzu</span><span class="pill">Animatsion sxemalar</span><span class="pill">Amaliy savollar</span></div><button class="start-button" data-action="next">Darsni boshlash <span>↗</span></button><p class="tiny-note">TO‘LIQ DARS &nbsp; / &nbsp; NETWORKING + WEB ASOSLARI</p>`,networkArt()) },
  ...foundationSlides(),
  { n:'16', title:'Port, Socket va Endpoint', category:'TARMOQ ASOSLARI', tag:'Transport qatlami', foot:'IP qayerga ulanishni, port esa qaysi xizmatga murojaat qilishni ajratishga yordam beradi.', notes:'Portlar 0–65535 oralig‘ida. TCP va UDP portlarining nomlar maydoni alohida. Socket — OSdagi aloqa abstraksiyasi; soddalashtirilganda endpoint deyiladi. Bir protokol doirasidagi TCP ulanishini source IP, source port, destination IP va destination port ajratadi. 51524 — misoldagi vaqtinchalik client porti. DNS TCP va UDPdan foydalanishi mumkin. Server IPsi hujjatlar uchun ajratilgan misol manzilidir.', render:() => layout(heading('Manzil bor.<br><span class="accent">Qaysi xizmat?</span>','Port — transport protokoli doirasida xizmatlarni ajratishga yordam beruvchi 0–65535 oralig‘idagi raqam.')+table(['PORT','XIZMAT','TO‘LIQ NOMI'],[['<span class="port-number">22</span>','SSH','Secure Shell'],['<span class="port-number">53</span>','DNS','Domain Name System'],['<span class="port-number">80</span>','HTTP','Hypertext Transfer Protocol'],['<span class="port-number">443</span>','HTTPS','TLS bilan himoyalangan HTTP']]),panel('SOCKET / ALOQA ENDPOINTI',`<div class="diagram-row"><div class="endpoint">${icon('browser')}<strong>CLIENT</strong><code>192.168.1.10</code><code style="color:#d3f785">:51524</code></div><div class="connection"><span>TCP</span></div><div class="endpoint">${icon('server')}<strong>SERVER</strong><code>203.0.113.10</code><code style="color:#d3f785">:443</code></div></div><div class="diagram-foot"><span>Source IP + port</span><span>Destination IP + port</span></div><div class="secure-data">IP + PORT → ENDPOINT</div><p class="art-caption">51524 — clientning vaqtinchalik (ephemeral) porti.</p>`)+callout('SOCKET NIMA?','Soddalashtirib: tarmoq aloqa endpointi. TCP ulanishi ikki tomondagi IP va port qiymatlari bilan ajratiladi.')) },
  { n:'17', title:'Web server, Application va Database', category:'WEB ARXITEKTURA', tag:'Rollar va mas’uliyat', foot:'Har bir komponentning vazifasini ajrating — keyin xavfsizlik chegaralarini ko‘rish osonlashadi.', notes:'Web server statik faylni bevosita qaytarishi yoki backendga proxy qilishi mumkin. Reverse proxy TLS termination, routing va load balancingni bajarishi mumkin. Har bir request databasega bormaydi. Bir dastur bir nechta rolni bajarishi ham mumkin. Zaifliklar clientdan databasegacha va konfiguratsiyada paydo bo‘ladi.', render:() => layout(heading('Sahifa ortidagi<br><span class="accent">uchta qatlam.</span>','So‘rovni qabul qilish, biznes mantiqni bajarish va ma’lumotni saqlash — turli vazifalar.')+`<div class="mini-list">${point('01','Web server / Reverse proxy','HTTP(S) requestni qabul qiladi, statik fayl beradi yoki backendga yo‘naltiradi.')}${point('02','Web application','Login, profil, qidiruv, buyurtma va ruxsatlarni boshqaradi.')}${point('03','Database','Application uchun kerakli ma’lumotlarni saqlaydi va qaytaradi.')}</div>`+callout('REVERSE PROXY','Routing, load balancing va TLS termination vazifalarini ham bajarishi mumkin.'),panel('REQUESTNING ICHKI YO‘LI',stack([['browser','BROWSER','HTTP(S) request'],['server','WEB SERVER / REVERSE PROXY','Qabul qilish va yo‘naltirish'],['app','WEB APPLICATION','Biznes mantiq'],['database','DATABASE','Zarur bo‘lsa o‘qish / yozish']])) ) },
  { n:'18', title:'HTTP Request va Response', category:'HTTP ASOSLARI', tag:'Xabar tuzilishi', foot:'Quyidagi matn ko‘rinishidagi misol HTTP/1.1 uchun. HTTP/2 va HTTP/3 xabarlarni boshqacha kodlaydi.', notes:'HTTP — Hypertext Transfer Protocol. Request line method, target va versiyadan tuziladi. Bo‘sh satr headerlarni bodydan ajratadi. Request va responseda body har doim bo‘lavermaydi. Response misolidagi ASCII body 18 bayt, Content-Length shunga mos. Host HTTP/1.1 so‘rovlarida talab qilinadi.', render:() => layout(heading('So‘rov ketadi.<br><span class="accent">Javob qaytadi.</span>','HTTP — web client va server o‘rtasida xabar almashish protokoli.')+table(['QISM','VAZIFASI'],[['Method','So‘ralayotgan amal turi.'],['Path','Murojaat qilinayotgan resurs.'],['Headers','Xabar haqidagi metadata.'],['Body','Yuborilayotgan ma’lumot; ixtiyoriy.'],['Status code','Javobning holati.']]),panel('HTTP / XABAR INSPEKTORI',`<div class="tabs" role="tablist" aria-label="HTTP xabari"><button class="tab active" role="tab" aria-selected="true" data-http="request">↗ Request</button><button class="tab" role="tab" aria-selected="false" data-http="response">↙ Response</button></div><pre class="code-window" id="httpCode"></pre><p class="code-caption" id="httpCaption"></p>`,'HTTP/1.1')) },
  { n:'19', title:'HTTP metodlari', category:'HTTP ASOSLARI', tag:'Interaktiv misollar', foot:'Metodni bosing — uning odatdagi maqsadi va request misolini ko‘ring.', notes:'Metod nomi server implementatsiyasi xavfsizligini kafolatlamaydi. GET odatda server holatini o‘zgartirmaydigan o‘qish amallari uchun ishlatiladi. POST faqat yaratish bilan cheklanmaydi. PUT to‘liq almashtirishni anglatadi va ayrim holatda resurs yaratishi ham mumkin. HEAD responseda body qaytarmaydi.', render:() => layout(heading('Nima qilmoqchisiz?<br><span class="accent">Metod aytadi.</span>','Olish, yaratish, yangilash yoki o‘chirish. HTTP metodlari requestning maqsadini bildiradi.')+callout('SECURITY NUQTASI','POST ishlatilgani request avtomatik xavfsiz degani emas. Xavfsizlik inputni tekshirish, ruxsat va serverning qayta ishlash mantiqiga bog‘liq.',true),`<div class="method-grid">${methods.map((m,i)=>`<button class="method-card${i===0?' active':''}" data-method="${i}" aria-pressed="${i===0}"><strong>${m[0]}</strong><p>${m[1]}</p><code>${m[0]} ${m[2]}</code></button>`).join('')}</div><div class="method-preview" id="methodPreview"></div>`) },
  { n:'20', title:'HTTP status kodlari', category:'HTTP ASOSLARI', tag:'Server javobi', foot:'Status sinfini tanlang va misollarning ma’nosini oching.', notes:'4xx doim inson client xato qildi degani emas, requestga tegishli rad etish ham bo‘lishi mumkin. 403 holatida foydalanuvchi autentifikatsiyadan o‘tgan bo‘lishi shart emas. 304 odatdagi URL redirect emas, shartli request va cache bilan bog‘liq javob.', render:() => layout(heading('Request natijasi —<br><span class="accent">uchta raqam.</span>','Status code server requestni qanday yakunlaganini bildiradi. Birinchi raqam uning sinfini ko‘rsatadi.')+callout('401 VA 403','<b>401:</b> autentifikatsiya kerak yoki yaroqsiz.<br><b>403:</b> server requestni tushundi, lekin ruxsat bermadi.'),`<div class="status-list">${statuses.map((s,i)=>`<button class="status-row${i===1?' active':''}" data-status="${i}" aria-pressed="${i===1}"><span class="status-code">${s[0]}</span><span><strong>${s[1]}</strong><small>${s[2]}</small></span><span class="status-examples">${s[3]}</span></button>`).join('')}</div><div class="selected-detail" id="statusDetail">${statuses[1][4]}</div>`) },
  { n:'21', title:'Header, Cookie va Session', category:'HOLAT VA IDENTIFIKATSIYA', tag:'Session lifecycle', foot:'Cookie — browserdagi ma’lumot. Session — foydalanuvchi bilan bog‘liq holatni boshqarish.', notes:'Bu sxema serverda saqlanadigan session modelini ko‘rsatadi; boshqa arxitekturalar ham mavjud. Server Set-Cookie yuboradi. Browser keyingi mos requestga Cookie headerini qo‘shadi. Session ID serverdagi holatni topishga yordam beradi. Cookie ichida parol saqlash kerak degan xulosa chiqarmang.', render:() => layout(heading('Server sizni<br><span class="accent">qanday eslaydi?</span>','HTTP xabarlari alohida. Header, cookie va session requestlarni kerakli kontekst bilan bog‘laydi.')+`<div class="mini-list">${point('01','Header','Host, User-Agent, Accept, Content-Type, Authorization kabi metadata.')}${point('02','Cookie','Browser saqlab, tegishli keyingi requestlarda yuborishi mumkin bo‘lgan kichik ma’lumot.')}${point('03','Session','Ushbu misolda serverda foydalanuvchiga tegishli holatni saqlash mexanizmi.')}</div>`,panel('LOGIN → KEYINGI REQUEST',`<div class="session-flow">${[['LOGIN','Server ma’lumotlarni tekshiradi va session yaratadi.'],['SET-COOKIE','Browser session ID saqlangan cookieni oladi.'],['COOKIE','Keyingi requestda browser cookieni yuboradi.'],['SESSION TOPILDI','Server session ID orqali holatni topadi.']].map((x,i)=>`<div class="session-card${i===0?' active':''}" data-session="${i}"><div class="step-number">0${i+1} ↗</div><h3>${x[0]}</h3><p>${x[1]}</p></div>`).join('')}</div><div class="step-controls"><button class="small-button" data-action="step-next">Keyingi bosqich →</button><span class="step-text" id="stepCounter">01 / 4</span></div>`)) },
  { n:'22', title:'HTTPS va TLS', category:'TRANSPORT XAVFSIZLIGI', tag:'Himoyalangan kanal', foot:'HTTPS aloqa kanalini himoyalaydi. Application xavfsizligi alohida masala.', notes:'TLS — Transport Layer Security. Browser server sertifikatining ishonch zanjiri, domen mosligi va amal muddatini tekshiradi. Sertifikat public keyni identifikatsiya bilan bog‘laydi. Kalit kelishuvi orqali kanal uchun kalitlar hosil qilinadi. HTTPS application ichidagi XSS, SQL injection yoki IDORni o‘z-o‘zidan tuzatmaydi.', render:() => layout(heading('Ochiq internet.<br><span class="accent">Himoyalangan aloqa.</span>','HTTPS — HTTPning TLS orqali himoyalangan ko‘rinishi. TLS: Transport Layer Security.')+`<div class="security-grid"><div class="security-feature"><strong>Confidentiality</strong><p>Begona tomon mazmunni o‘qishidan himoya.</p></div><div class="security-feature"><strong>Integrity</strong><p>Yo‘ldagi o‘zgartirishni aniqlash.</p></div><div class="security-feature"><strong>Authentication</strong><p>Server identifikatsiyasini tekshirish.</p></div></div>`+callout('JUDA MUHIM','HTTPS borligi saytning o‘zi xavfsizligini anglatmaydi. XSS, SQL injection yoki IDOR kabi zaifliklar qolishi mumkin.',true),panel('TLS / ISHONCH VA SHIFRLASH',`<div class="tls-lock">${icon('lock')}</div>${stack([['browser','BROWSER','TLS handshake boshlanadi'],['lock','CERTIFICATE + KEY AGREEMENT','Domen, ishonch zanjiri va public key'],['server','SECURE CHANNEL','Himoyalangan kanalda HTTP data']])}<div class="secure-data">HTTP + TLS = HTTPS</div>`)) },
  { n:'23', title:'Browser sahifani qanday yuklaydi?', category:'BROWSER ICHIDA', tag:'Bosqichma-bosqich', foot:'Sxema TCP asosidagi HTTPSni ko‘rsatadi. HTTP/3 esa UDP ustidagi QUICdan foydalanadi.', notes:'DNS, ulanish va resurslar cache tufayli qayta ishlatilishi mumkin; har bir navigatsiya bularni boshidan takrorlamaydi. Berilgan 11 bosqich bu slaydda 6 guruhga jamlangan. Browser HTMLni olayotganda ham parse va boshqa resurslarni yuklashni boshlashi mumkin. Tarmoqdagi yo‘l va rendering qat’iy bir chiziqli navbat emas.', render:() => layout(heading('URLdan<br><span class="accent">piksellargacha.</span>','Sahifa birdan paydo bo‘lmaydi. Browser manzilni topadi, resurslarni oladi va ko‘rinishni yaratadi.')+`<div class="render-blocks">${[['HTML','HyperText Markup Language','Sahifaning strukturasi.'],['DOM','Document Object Model','Hujjat obyektlari daraxti.'],['CSS','Cascading Style Sheets','Ko‘rinish va layout.'],['JS','JavaScript','Interaktivlik va xatti-harakat.']].map(x=>`<div class="render-block"><b>${x[0]}</b><small>${x[1]}</small><p>${x[2]}</p></div>`).join('')}</div>`,journeyPanel('browser')) },
  { n:'24', title:'To‘liq end-to-end ssenariy', category:'HAMMASINI BIRLASHTIRAMIZ', tag:'12 bosqich', foot:'Istalgan bosqichni bosing. Animatsiyani pauza qilib har bir qadamni alohida tushuntiring.', notes:'Bu TCP asosidagi HTTPS uchun konseptual ssenariy. DNS orqali aniqlangan IP bilan serverga ulaniladi; HTTP request DNS server orqali o‘tmaydi. Routing faqat ulanishdan avval emas, paketlar almashinuvi davomida ham ishlaydi. Databasega murojaat zaruratga bog‘liq. Real tizimda CDN, cache, proxy va boshqa qatlamlar bo‘lishi mumkin.', render:() => layout(heading('Bitta URL.<br><span class="accent">Butun ekotizim.</span>','Foydalanuvchi https://example.com/login manzilini ochadi. Endi har bir komponentni umumiy jarayonda kuzatamiz.')+`<div class="mini-list">${point('01–04','Manzil va yo‘l','Browser → DNS → IP → routing.')}${point('05–07','Ulanish va xabar','TCP → TLS → HTTP request.')}${point('08–12','Qayta ishlash va natija','Web server → application → database → response → rendering.')}</div>`+callout('O‘ZINGIZNI TEKSHIRING','Har bir tugunni ko‘rsatib: “Bu nima qiladi va keyingi qadamga nima beradi?” deb izohlang.'),journeyPanel('full')) },
  { n:'25', title:'Web Application Security', category:'SECURITY BILAN BOG‘LASH', tag:'Pentester fikrlashi', foot:'Savolni komponentga bog‘lang. Tekshiruvni faqat ruxsat berilgan tizimlarda bajaring.', notes:'Maqsad tayyor hujumni bajarish emas, tizim chegaralari va ishonch munosabatlarini tushunish. Authentication kimligini aniqlash, authorization esa aynan qaysi amal yoki ma’lumotga ruxsati borligini tekshirishdir. Bir xil xatolik bir nechta qatlamga ta’sir qilishi mumkin.', render:() => `<div class="full-width">${heading('“Sayt ochildi” — <span class="accent">savollar endi boshlanadi.</span>','Komponentni tanlang. Uning ortidagi xavfsizlik savolini ko‘ring.')}<div class="wide-layout"><div class="security-map">${security.map((s,i)=>`<button class="security-item${i===0?' active':''}" data-security="${i}" aria-pressed="${i===0}"><strong>${s[0]}</strong><small>${s[1]}</small></button>`).join('')}</div>${panel('PENTESTER SAVOLI',`<div class="eyebrow" style="color:#d3f785" id="securityLabel">${security[0][0]}</div><p class="security-question" id="securityQuestion">${security[0][2]}</p><div class="art-caption">Qaysi manzil? Qaysi port? Kimga qanday ruxsat?</div>`,'?')}</div></div>` },
  { n:'26', title:'Qisqartmalar lug‘ati', category:'TEZKOR MA’LUMOTNOMA', tag:'28 ta atama', foot:'Qisqartma, to‘liq nom yoki ma’no bo‘yicha qidiring.', notes:'Lug‘at berilgan barcha 28 qisqartmani o‘z ichiga oladi. TTL DNSda cache vaqti bo‘lsa, IP sarlavhasida boshqa ma’noda ishlatiladi. Bir xil qisqartma kontekstga qarab talqin qilinadi. Qidiruv lokal ishlaydi va tarmoqqa ma’lumot yubormaydi.', render:() => `<div class="full-width">${heading('Atamalarni <span class="accent">bir joyga yig‘amiz.</span>','To‘liq nomni yodlashdan oldin, uning jarayondagi vazifasini tushuning.')}<label class="sr-only" for="glossarySearch">Lug‘atdan qidirish</label><input class="search-box" id="glossarySearch" type="search" placeholder="Atamani qidiring… masalan, DNS yoki tarmoq" autocomplete="off"><div class="glossary" id="glossaryGrid"></div><div class="tiny-note" id="glossaryCount" aria-live="polite"></div></div>` },
  { n:'27', title:'Doskada chiziladigan sxema', category:'BIRGA CHIZAMIZ', tag:'9 qadam', foot:'Sxema tushunchalar munosabatini ko‘rsatadi: DNS, IP va port alohida tranzit qurilmalar emas.', notes:'Har bir qadamda eski sxemaga bitta yangi tushuncha qo‘shing. To‘liq sxema fizik paket yo‘li emas: DNS — nom yechimi, IP va port — manzil qismlari, TCP/TLS/HTTP esa protokollar. Finaldagi database request uchun zarur bo‘lgan holatni bildiradi.', render:() => layout(heading('Oddiy chiziqdan<br><span class="accent">to‘liq modelgacha.</span>','Doskani ikki roldan boshlang. Har safar “Bu qanday sodir bo‘ladi?” degan savol bilan keyingi tushunchani qo‘shing.')+`<div class="mini-list">${point('01','Client va Server','Avval rollarni tushuntiring.')}${point('02','Tarmoq, manzil va xizmat','Internet, router, ISP, DNS, IP va portni qo‘shing.')}${point('03','Protokollar va application','TCP, TLS, HTTP, backend va javobni ulang.')}</div>`,panel('INTERAKTIV DOSKA',`<div class="board" id="board"></div><div class="board-description" id="boardDescription"></div><div class="step-controls"><button class="small-button" data-action="step-back" aria-label="Oldingi qadam">←</button><button class="small-button" data-action="step-next">Keyingi qadam →</button><button class="small-button" data-action="step-reset" aria-label="Sxemani boshidan boshlash">↺</button><span class="step-text" id="stepCounter">01 / 9</span></div>`,'CHIZING →')) },
  { n:'28', title:'Chuqur savollar', category:'BILIMNI MUSTAHKAMLASH', tag:'26 ta savol', foot:'Avval o‘zingiz javob bering, keyin izoh bilan solishtiring.', notes:'Savollar o‘qituvchi boshchiligidagi muhokama yoki mustaqil takrorlash uchun. Ular darsning birinchi qismidagi networking mavzularini ham takrorlaydi. Kategoriyani tanlash savollar to‘plamini o‘zgartiradi. Javobni ochish va keyingi savol tugmalari bilan ishlang.', render:() => layout(heading('Tushundingizmi?<br><span class="accent">Tushuntirib bering.</span>','Yodlangan ta’rifdan ko‘ra, jarayonni o‘z so‘zlaringiz bilan tushuntirish kuchliroq.')+`<div class="question-categories">${['Barchasi','Tarmoq','DNS va routing','Transport','Web'].map((c,i)=>`<button data-category="${c}" class="${i===0?'active':''}" aria-pressed="${i===0}">${c}</button>`).join('')}</div>`+callout('MUHOKAMA USULI','Bitta misol keltiring, sxemada joyini ko‘rsating va u ishlamasa nima sodir bo‘lishini ayting.'),panel('SAVOL KARTOCHKASI',`<div class="question-card" style="padding:0"><span class="eyebrow" style="color:#a6bb91" id="questionPosition"></span><h2 id="questionTitle"></h2><div class="answer" id="questionAnswer" hidden></div></div><div class="step-controls"><button class="small-button" data-action="answer" aria-expanded="false">Javobni ko‘rish</button><button class="small-button" data-action="question-next">Keyingi savol →</button></div>`,'O‘YLAB KO‘RING')) },
  { n:'29', title:'Mustaqil vazifa', category:'AMALIY MUSTAHKAMLASH', tag:'3 ta vazifa', foot:'Belgilar shu browserda saqlanadi. Har bir tushunchani misol bilan ayta olsangiz belgilang.', notes:'1-vazifa: USER → BROWSER → DNS → IP → ROUTER → ISP → SERVER → PORT → HTTPS → WEB APP → DATABASE → RESPONSE tushunchalarini sxemaga joylang va strelkalarni izohlang. Ularni yagona fizik yo‘l deb qabul qilmang: portni server yoniga, DNSni alohida so‘rov shoxi sifatida chizish aniqroq. 2-vazifa: 10 atamani bir jarayonda izohlang. 3-vazifa: 5 nuqtaga xavfsizlik savoli yozing.', render:() => `<div class="full-width">${heading('Endi navbat <span class="accent">sizga.</span>','Sxemani mustaqil chizing, terminlarni jarayonga joylang va xavfsizlik savollarini bering.')}<div class="wide-layout"><div><div class="assignment"><strong>01 / Sxemani qayta chizish</strong><p>USER, BROWSER, DNS, IP, ROUTER, ISP, SERVER, PORT, HTTPS, WEB APP, DATABASE va RESPONSE tushunchalarini ulang. Har bir strelka nimani anglatishini yozing.</p></div><div class="assignment"><strong>02 / Terminni jarayonga joylash</strong><p>IP, DNS, Router, Port, TCP, TLS, HTTP, Web Server, Web Application va Databaseni bitta umumiy jarayonda izohlang.</p></div><div class="assignment"><strong>03 / Security ko‘zi bilan qarash</strong><p>Yakuniy sxemadagi 5 ta nuqtani tanlang. Har biriga kamida bitta xavfsizlik savoli yozing.</p></div></div>${panel('O‘ZINI TEKSHIRISH',`<div class="checklist">${checks.map((c,i)=>`<label><input type="checkbox" data-check="${i}"><span>${c}</span></label>`).join('')}</div><div class="check-progress" id="checkProgress"></div>`,'✓')}</div></div>` },
  { n:'30', title:'Yakuniy xulosa', category:'KEYINGI BOSQICHGA TAYYOR', tag:'Dars yakuni', foot:'Endi “sayt qanday ishlaydi?” savoliga umumiy sxema bilan javob bera olasiz.', notes:'Darsni uchta tayanch savol bilan yakunlang: serverni qanday topamiz, u bilan qanday gaplashamiz, requestni kim qayta ishlaydi? Keyingi mavzular: networking va portlar, HTTP, browser va web application xavfsizligi. Kerak bo‘lsa mundarijadan istalgan bo‘limga qayting.', render:() => `<div class="full-width">${heading('Bo‘laklar birlashdi.<br><span class="accent">Endi sizda to‘liq xarita bor.</span>','Client va serverdan boshlangan yo‘l browserdan databasegacha bo‘lgan yagona modelga aylandi.')}<div class="summary-grid"><div class="summary-card reveal" style="--i:0"><div class="large-number">01</div><h3>Topamiz va ulanamiz</h3><p>Domen → DNS → IP<br>Router, ISP va routing<br>TCP / UDP va portlar</p></div><div class="summary-card reveal" style="--i:1"><div class="large-number">02</div><h3>Xabar almashamiz</h3><p>HTTP request / response<br>Metodlar va status kodlari<br>Header, cookie, session, TLS</p></div><div class="summary-card reveal" style="--i:2"><div class="large-number">03</div><h3>Ishlaymiz va tekshiramiz</h3><p>Web server → application → DB<br>Browser rendering<br>Har qatlamda security savollari</p></div></div><div class="final-banner"><div><h3>Keyingi darslarga ko‘prik ↗</h3><p>Networking va portlar → HTTP → Browser va Web Application Security</p></div><button data-action="restart">Boshidan ko‘rish ↺</button></div></div>` }
]);

// The offline ZIP has no site to return to.
if (location.protocol === 'http:' || location.protocol === 'https:') {
  document.querySelector('.resource-return').hidden = false;
}

function indexFromHash() {
  const hash = location.hash.slice(1);
  if (hash.startsWith('topic-')) {
    const index = slides.findIndex(s => s.n === hash.slice(6));
    return index < 0 ? 0 : index;
  }
  return Math.max(0, Math.min(slides.length-1, (parseInt(hash,10)||1)-1));
}
let current = indexFromHash();
let playing = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let step = 0;
let timer = null;
let questionCategory = 'Barchasi';
let questionIndex = 0;
let checked = [];
try { const saved = JSON.parse(localStorage.getItem('web-asoslar-checks') || '[]'); if (Array.isArray(saved)) checked = saved.filter(x=>Number.isInteger(x) && x>=0 && x<checks.length); } catch (_) { /* Storage can be unavailable for local files. */ }
const $ = id => document.getElementById(id);

function render() {
  clearInterval(timer);
  step = 0;
  const s = slides[current];
  $('slide').innerHTML = `<article class="slide-content${s.topic?' detail-slide':''}"><div class="slide-topline"><span class="eyebrow">${s.n === '00' ? 'WEB ASOSLARI' : s.n + ' / ' + s.category}</span><span class="topic-tag">${s.tag}</span></div>${s.render()}<div class="slide-footer">${s.foot}</div></article>`;
  $('railNav').innerHTML = slides.map((x,i)=>`<button class="rail-item${i===current?' active':''}" data-go="${i}" aria-label="${x.n}: ${x.title}" ${i===current?'aria-current="step"':''} title="${x.title}">${x.n==='00'?'↗':x.n}</button>`).join('');
  renderContents();
  $('counter').innerHTML = `${String(current+1).padStart(2,'0')} <span>/ ${slides.length}</span>`;
  $('progress').style.width = `${(current+1)/slides.length*100}%`;
  $('prevButton').disabled = current === 0;
  $('nextButton').disabled = current === slides.length-1;
  $('notesText').textContent = s.notes;
  $('announcement').textContent = `${current+1} / ${slides.length}. ${s.title}`;
  document.title = `${s.title} — Web asoslari`;
  if (s.n==='18') setHttp('request');
  if (s.n==='19') setMethod(0);
  if (s.n==='26') filterGlossary('');
  if (s.n==='27' || foundationFlows[s.n]) updateStep();
  if (s.n==='28') { questionCategory='Barchasi'; questionIndex=0; updateQuestion(); }
  if (s.n==='29') { document.querySelectorAll('[data-check]').forEach(el=>el.checked=checked.includes(Number(el.dataset.check))); updateChecks(); }
  const activeRailItem = $('railNav').querySelector('[aria-current]');
  if (activeRailItem) $('railNav').scrollTop = activeRailItem.offsetTop - $('railNav').offsetTop - $('railNav').clientHeight / 2 + activeRailItem.clientHeight / 2;
  syncPlayback();
  startTimer();
}
function go(index) {
  const next = Math.max(0, Math.min(slides.length-1, index));
  if(next===current) return;
  current=next;
  try { history.replaceState(null,'',`#topic-${slides[current].n}`); } catch (_) { location.hash=`topic-${slides[current].n}`; }
  render();
  $('slide').focus({preventScroll:true});
  window.scrollTo({top:0,behavior:'instant'});
}
function syncPlayback() {
  document.body.classList.toggle('paused',!playing);
  $('playButton').innerHTML = `${playing?'Ⅱ':'▷'} <span>${playing?'Animatsiya':'Davom ettirish'}</span>`;
  $('playButton').setAttribute('aria-pressed',String(playing));
  $('playButton').title = playing ? 'Animatsiyani pauza qilish (Space)' : 'Animatsiyani davom ettirish (Space)';
}
function togglePlayback() { playing=!playing; syncPlayback(); startTimer(); }
function stepCount() { return foundationFlows[slides[current].n]?.length || ({'21':4,'23':6,'24':12,'27':9})[slides[current].n]||0; }
function startTimer() {
  clearInterval(timer);
  // The board is deliberately manual so a teacher controls its pace.
  if (playing && !document.hidden && ['21','23','24'].includes(slides[current].n)) timer=setInterval(()=>advanceStep(1,false),4500);
}
function advanceStep(delta, manual = true) {
  const count=stepCount();
  if (!count) return;
  step=(step+delta+count)%count;
  updateStep();
  if(manual) startTimer();
}
function updateStep() {
  const n=slides[current].n;
  if (foundationFlows[n]) updateFoundationStep(n, step);
  if(n==='21') document.querySelectorAll('[data-session]').forEach((e,i)=>e.classList.toggle('active',i===step));
  if(n==='23'||n==='24') {
    const data=n==='23'?browserSteps:journey;
    document.querySelectorAll('[data-step]').forEach((e,i)=>{e.classList.toggle('active',i===step);e.setAttribute('aria-pressed',String(i===step));});
    $('journeyDescription').textContent=data[step][1];
  }
  if(n==='27') {
    $('board').innerHTML=boardStages[step][0].map((x,i)=>`${i?'<span class="board-arrow">→</span>':''}<span class="board-node">${x}</span>`).join('');
    $('boardDescription').textContent=boardStages[step][1];
  }
  if($('stepCounter')) $('stepCounter').textContent=`${String(step+1).padStart(2,'0')} / ${stepCount()}`;
}
function setHttp(type) {
  document.querySelectorAll('[data-http]').forEach(el=>{const active=el.dataset.http===type;el.classList.toggle('active',active);el.setAttribute('aria-selected',String(active));});
  $('httpCode').innerHTML = type==='request' ? '<span class="code-green">GET</span> /login <span class="code-gray">HTTP/1.1</span>\n<span class="code-blue">Host:</span> example.com\n<span class="code-blue">User-Agent:</span> Browser\n<span class="code-blue">Accept:</span> text/html\n\n<span class="code-gray">← bo‘sh satr; bu requestda body yo‘q</span>' : '<span class="code-gray">HTTP/1.1</span> <span class="code-green">200 OK</span>\n<span class="code-blue">Content-Type:</span> text/html\n<span class="code-blue">Content-Length:</span> 18\n\n<span class="code-orange">&lt;html&gt;Salom&lt;/html&gt;</span>';
  $('httpCaption').textContent=type==='request'?'REQUEST LINE → HEADERS → BO‘SH SATR → ixtiyoriy BODY':'STATUS LINE → HEADERS → BO‘SH SATR → ixtiyoriy BODY';
}
function setMethod(i) {
  document.querySelectorAll('[data-method]').forEach((el,j)=>{el.classList.toggle('active',i===j);el.setAttribute('aria-pressed',String(i===j));});
  const m=methods[i];
  $('methodPreview').innerHTML=`${m[0]} ${m[2]} HTTP/1.1<br><span class="code-gray" style="font:11px 'DM Sans',Arial,sans-serif">${m[3]}</span>`;
}
function filterGlossary(query) {
  const items=glossary.filter(g=>g.join(' ').toLocaleLowerCase().includes(query.toLocaleLowerCase().trim()));
  $('glossaryGrid').innerHTML=items.length?items.map(g=>`<div class="glossary-item"><b>${g[0]}</b><small>${g[1]}</small><p>${g[2]}</p></div>`).join(''):'<p class="lead">Atama topilmadi. Boshqa so‘z bilan qidiring.</p>';
  $('glossaryCount').textContent=`${items.length} / ${glossary.length} ta atama`;
}
function updateQuestion() {
  const pool=questions.filter(q=>questionCategory==='Barchasi'||q[0]===questionCategory);
  questionIndex=(questionIndex+pool.length)%pool.length;
  const q=pool[questionIndex];
  $('questionPosition').textContent=`${q[0].toUpperCase()} / ${String(questionIndex+1).padStart(2,'0')} — ${pool.length}`;
  $('questionTitle').textContent=q[1];
  $('questionAnswer').textContent=q[2];
  $('questionAnswer').hidden=true;
  const button=document.querySelector('[data-action="answer"]');
  button.textContent='Javobni ko‘rish';button.setAttribute('aria-expanded','false');
}
function updateChecks() {
  $('checkProgress').textContent=`${checked.length} / ${checks.length} ta ko‘nikma ${checked.length===checks.length?'— ajoyib, keyingi bosqichga tayyorsiz!':'belgilandi'}`;
  try { localStorage.setItem('web-asoslar-checks',JSON.stringify(checked)); } catch (_) { /* The checklist remains usable without storage. */ }
}
function toggleNotes(force) {
  const show=typeof force==='boolean'?force:$('notesPanel').hidden;
  $('notesPanel').hidden=!show;
  $('notesButton').setAttribute('aria-expanded',String(show));
}
function renderContents() {
  const normalize = text => text.toLocaleLowerCase().replace(/[‘’ʼ']/g, '');
  const query = normalize($('contentsSearch').value.trim());
  const groups = [
    ['Boshlanish va tarmoq', 0, 5],
    ['IP, domen va DNS', 6, 10],
    ['Routing, qatlamlar va transport', 11, 16],
    ['Web, HTTP va browser', 17, 24],
    ['Xavfsizlik va mustahkamlash', 25, 30]
  ];
  let count = 0;
  $('contentsGrid').innerHTML = groups.map(([label, from, to]) => {
    const items = slides.map((s,i)=>({s,i})).filter(({s}) => {
      const topic = parseInt(s.n, 10);
      return topic >= from && topic <= to && normalize(`${s.n} ${s.title} ${s.notes} ${s.searchText || ''}`).includes(query);
    });
    count += items.length;
    if (!items.length) return '';
    return `<section class="contents-group"><h3>${label}</h3><div>${items.map(({s,i})=>`<button class="contents-item${i===current?' active':''}${s.topic?' contents-child':''}" data-go="${i}" ${i===current?'aria-current="step"':''}><b>${s.n==='00'?'↗':s.n}</b><span>${s.title}</span></button>`).join('')}</div></section>`;
  }).join('') || '<p>Hech narsa topilmadi. Boshqa so‘z bilan qidiring.</p>';
  $('contentsCount').textContent = `${count} / ${slides.length} ta slayd · 30 asosiy mavzu`;
}
function openContents() { $('contentsSearch').value=''; renderContents(); $('contentsDialog').showModal(); $('contentsSearch').focus(); }
async function fullscreen() {
  try { if(document.fullscreenElement) await document.exitFullscreen(); else await document.documentElement.requestFullscreen(); }
  catch (_) { $('announcement').textContent='To‘liq ekran bu browserda mavjud emas. Browserning F11 tugmasidan foydalaning.'; }
}

document.addEventListener('click', event=>{
  const button=event.target.closest('button');
  if(!button) return;
  if(button.dataset.go!==undefined){$('contentsDialog').close();go(Number(button.dataset.go));return;}
  if(button.dataset.http) setHttp(button.dataset.http);
  if(button.dataset.method!==undefined) setMethod(Number(button.dataset.method));
  if(button.dataset.status!==undefined){ const i=Number(button.dataset.status);document.querySelectorAll('[data-status]').forEach((e,j)=>{e.classList.toggle('active',i===j);e.setAttribute('aria-pressed',String(i===j));});$('statusDetail').textContent=statuses[i][4]; }
  if(button.dataset.step!==undefined){step=Number(button.dataset.step);updateStep();startTimer();}
  if(button.dataset.security!==undefined){const i=Number(button.dataset.security);document.querySelectorAll('[data-security]').forEach((e,j)=>{e.classList.toggle('active',i===j);e.setAttribute('aria-pressed',String(i===j));});$('securityLabel').textContent=security[i][0];$('securityQuestion').textContent=security[i][2];}
  if(button.dataset.category){questionCategory=button.dataset.category;questionIndex=0;document.querySelectorAll('[data-category]').forEach(e=>{const active=e===button;e.classList.toggle('active',active);e.setAttribute('aria-pressed',String(active));});updateQuestion();}
  switch(button.dataset.action){
    case 'next':go(current+1);break;
    case 'restart':go(0);break;
    case 'step-next':advanceStep(1);break;
    case 'step-back':advanceStep(-1);break;
    case 'step-reset':step=0;updateStep();break;
    case 'answer':$('questionAnswer').hidden=!$('questionAnswer').hidden;button.textContent=$('questionAnswer').hidden?'Javobni ko‘rish':'Javobni yashirish';button.setAttribute('aria-expanded',String(!$('questionAnswer').hidden));break;
    case 'question-next':questionIndex++;updateQuestion();break;
  }
});
$('nextButton').addEventListener('click',()=>go(current+1));
$('prevButton').addEventListener('click',()=>go(current-1));
$('playButton').addEventListener('click',togglePlayback);
$('contentsButton').addEventListener('click',openContents);
$('closeContents').addEventListener('click',()=>$('contentsDialog').close());
$('contentsDialog').addEventListener('click',e=>{if(e.target===$('contentsDialog')){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.target.close();}});
$('notesButton').addEventListener('click',()=>toggleNotes());
$('closeNotes').addEventListener('click',()=>toggleNotes(false));
$('fullscreenButton').addEventListener('click',fullscreen);
document.addEventListener('input',e=>{if(e.target.id==='glossarySearch')filterGlossary(e.target.value);if(e.target.id==='contentsSearch')renderContents();});
document.addEventListener('change',e=>{if(e.target.matches('[data-check]')){const i=Number(e.target.dataset.check);checked=checked.filter(x=>x!==i);if(e.target.checked)checked.push(i);updateChecks();}});
document.addEventListener('keydown',e=>{
  if(e.target.matches('input,textarea,select')||e.ctrlKey||e.metaKey||e.altKey) return;
  if($('contentsDialog').open) return;
  if(e.code==='Space'&&e.target.closest('button,a,summary')) return;
  switch(e.key){
    case 'ArrowRight':case 'PageDown':e.preventDefault();go(current+1);break;
    case 'ArrowLeft':case 'PageUp':e.preventDefault();go(current-1);break;
    case 'Home':e.preventDefault();go(0);break;
    case 'End':e.preventDefault();go(slides.length-1);break;
    case ' ':e.preventDefault();togglePlayback();break;
    case 'f':case 'F':fullscreen();break;
    case 'm':case 'M':openContents();break;
    case 'n':case 'N':toggleNotes();break;
    case 'Escape':toggleNotes(false);break;
  }
});
window.addEventListener('hashchange',()=>go(indexFromHash()));
document.addEventListener('visibilitychange',startTimer);
render();
