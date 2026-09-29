# Web qanday ishlaydi?

HTML, CSS va JavaScriptda yaratilgan o‘zbekcha interaktiv taqdimot. 30 asosiy mavzu, 44 batafsil tushuntirish slaydi va kirish: jami 75 ta slayd. Qo‘shimcha slaydlar tegishli mavzuning darhol ortidan keladi: masalan, 06 → 06.1 → 06.2 → 06.3 → 07.

Har bir qo‘shimcha slayd bitta savolni uch kichik tushuntirishga ajratadi, jadval, sxema yoki xabar misolini beradi va ochiladigan javobli tekshiruv savoli bilan tugaydi. O‘qituvchi izohlari analogiyalarning chegarasi va qo‘shimcha tushuntirishlarni saqlaydi. Subnet, DHCP, NAT, DNS cache, routing, TCP/UDP, socket, HTTP, session, TLS, rendering va xavfsizlik alohida misollar bilan kengaytirilgan.

## Ishga tushirish

`index.html` faylini Chrome, Edge yoki Firefox brauzerida oching. Build, npm yoki server talab qilinmaydi. Tizim shriftlari ishlatiladi; tashqi fayllar yuklanmaydi va taqdimotning barcha funksiyalari lokal ishlaydi.

## Boshqaruv

- `←` / `→` yoki `Page Up` / `Page Down`: oldingi / keyingi slayd.
- `Home` / `End`: birinchi / oxirgi slayd.
- `Space`: animatsiyani pauza qilish / davom ettirish.
- `M`: mundarija.
- `N`: o‘qituvchi izohi.
- `F`: to‘liq ekran; browser ruxsat bermasa `F11`.
- `Esc`: mundarija yoki izohni yopish.

HTTP request/response yorliqlari, metodlar, status kodlari va security kartalari bosiladi. Session va browser jarayonlari 4,5 soniyada keyingi bosqichga o‘tadi, ularni tugmalar bilan ham boshqarish mumkin. 1–15-mavzulardagi 7 ta bosqichli sxema va doska sxemasi o‘qituvchi boshqarishi uchun qo‘lda ochiladi. Qisqartmalar lug‘atida qidiruv, 26 ta savolda yashirin javoblar, mustaqil vazifada esa saqlanadigan 10 bandli checklist mavjud.

Mundarija beshta bo‘limga ajratilgan. Qidiruv mavzu, tushuntirish va izohlar bo‘yicha ishlaydi. Qo‘shimcha slayddagi “Javob va tushuntirish” qatori bosilganda javob ochiladi; slaydga qayta kirganda yana yopiq turadi.

Mavzuga bog‘langan fragmentlar: `#topic-06` — IP mavzusi, `#topic-06.2` — /24 tushuntirishi, `#topic-16` — portlar, `#topic-30` — yakun. Navigatsiya shu havolalarni yaratadi, shuning uchun oldingi joylarga yangi slayd qo‘shilsa ham mavzu havolasi saqlanadi. `#1`–`#75` tartib raqamlari ham ishlaydi, ammo eski nusxadagi raqamlar hozir boshqa slaydga mos kelishi mumkin. Brauzerda harakatni kamaytirish sozlangan bo‘lsa, animatsiyalar o‘chiriladi va jarayonlarni avtomatik ijro etish boshlanmaydi.

## Fayllar

- `index.html` — taqdimot qobig‘i.
- `styles.css` — dizayn, responsive ko‘rinish, animatsiyalar.
- `foundations.js` — 1–15-mavzular, networking sxemalari va o‘qituvchi izohlari.
- `details.js` — 44 batafsil slayd, misollar va ochiladigan javobli savollar; asosiy mavzular orasiga joylashtirish.
- `app.js` — mazmun, sxemalar va interaktiv boshqaruv.

Misollar ta’limiy: server IPsi hujjatlashtirish uchun ajratilgan manzil. HTTPS sxemalari TCP asosidagi HTTPni ko‘rsatadi; HTTP/3 uchun QUIC/UDP farqi izohlangan. DNS, IP, port va protokollar fizik qurilmalar ketma-ketligi sifatida talqin qilinmasligi uchun slayd va o‘qituvchi izohlarida tushuntirishlar berilgan.

DNS resolver, ierarxiya va cache izohlari uchun [RFC 1034](https://www.rfc-editor.org/info/rfc1034/), TCPning tartibli bayt oqimi va ulanish mexanizmlari uchun [RFC 9293](https://www.rfc-editor.org/info/rfc9293/) tayanch manbalardir.

DHCP almashinuvi: [RFC 2131](https://www.rfc-editor.org/info/rfc2131/). Cookie atributlari: [MDN — Using HTTP cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Cookies). Browserning DOM, layout va chizish jarayoni: [MDN — How browsers work](https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/How_browsers_work).
