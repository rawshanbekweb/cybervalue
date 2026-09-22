# HTML Basics: o‘quvchilarni baholash

## O‘qituvchi uchun

1. `/admin/assessments` sahifasiga kiring. Sinov nomi, vaqt (15–120 daqiqa, standart 45) va `ID | Ism Familiya` ko‘rinishidagi ro‘yxatni kiriting. Bitta sinovda 200 nafargacha o‘quvchi bo‘lishi mumkin.
2. Shaxsiy kodlarni yarating va darhol TXT faylini yuklab oling. Kodlar ochiq ko‘rinishda bazaga saqlanmaydi va keyin qayta ko‘rsatilmaydi. Har bir kodni faqat o‘z egasiga bering; umumiy ro‘yxatni o‘quvchilarga tarqatmang.
3. O‘quvchilar `/playground/html-basics/assessment` sahifasiga (HTML Basics ichidagi havola orqali ham) kiradi. Kodni tekshirish vaqtni boshlamaydi. Ism, vaqt va qoidalarni tekshirib, “Sinovni boshlash”ni bosganda urinish boshlanadi.
4. Natijalar sahifasida o‘quvchini tanlang. Uning HTML kodi, test javoblari, izohlari, har bir amaliy mezon uchun ball va kuzatuv qaydlari ko‘rinadi.
5. Ikkita izohni 0–10 ball bilan baholang va fikr-mulohaza yozing. Shundan keyin /100 yakuniy baho hosil bo‘ladi. CSV orqali sinf natijalarini yuklab olish mumkin.
6. “Yangi kirishlarni yopish” hali boshlamagan kodlarni bloklaydi. Boshlangan urinishning muddati o‘zgarmaydi.

Bir o‘quvchi ID si bitta sinovda bir marta kiritiladi. Bir xil o‘quvchiga turli ID/kod berish bilan bu qoidani chetlab o‘tmang. Har bir yangi sinov alohida baholash hisoblanadi. Kod egasining shaxsini o‘qituvchi tekshiradi.

## Topshiriq va baholash

V1 topshiriq HTML Basics darslari 1–12 ga asoslangan. O‘quvchi shoshilib tayyorlangan tadbir sahifasini tuzatadi va yangi buyurtma talablarini bajaradi. Uchta variantda voqea, jadval ma’lumoti, savol/variantlar tartibi farq qiladi; mezonlar bir xil.

- 6 ta vaziyatli savol: har biri 5 ball, jami 30.
- 12 ta amaliy talab: har biri 5 ball, jami 60. Talab ichidagi barcha shartlar bajarilishi kerak. HTML haqiqiy parser bilan serverda tekshiriladi; shunchaki comment ichiga teg nomlarini yozish yetmaydi.
- 2 ta izoh: har biri 5 ball. Aniqlik 0–2, sabab/foydalanuvchiga ta’sir 0–2, o‘z kodidan misol 0–1. Bu qism qo‘lda baholanadi; avtomatik dastlabki ball /90 ko‘rsatiladi.

Faol kod, CSS, yashirish va ruxsat berilmagan resurs ishlatilsa amaliy qism 0 bo‘ladi. Bu qoida boshlashdan oldin ko‘rsatiladi. Test va qo‘lda baholanadigan izohlar alohida qoladi. Ko‘rinish oynasi ball bermaydi va faol skript, forma yoki havolalarni bajarmaydi. Server avtomatik tekshiradigan tavsif/izoh uzunligi mazmun sifatini to‘liq baholamaydi: o‘qituvchi kod va izohlarni ham ko‘rib chiqishi kerak.

## Urinish va cheklovlar

Kirish kodi kriptografik tasodifiy, bazada SHA-256 xeshi saqlanadi. Boshlanganda kod atomik ravishda ishlatiladi va alohida HttpOnly sessiya cookie si yaratiladi. Parallel boshlash so‘rovlari yangi urinish ocholmaydi. Urinishni boshqa brauzerda qayta ochish yoki cookie o‘chirilgandan keyin tiklash imkoniyati yo‘q. Shu kompyuter/brauzerda sahifani yangilash saqlangan urinishni davom ettiradi. Topshirgandan so‘ng umumiy kompyuterda “Keyingi o‘quvchi” orqali boshqa kodni ishlatish mumkin.

Muddat serverda belgilanadi. Brauzer soatini o‘zgartirish, sahifani yopish yoki tarmoqni uzish qo‘shimcha vaqt bermaydi. Avtomatik saqlash tahrirdan taxminan 0,9 soniya keyin, shuningdek har 10 soniyada ishlaydi. Server muddati o‘tgandan keyingi yangi kod/javoblar rad etiladi va oxirgi qabul qilingan nusxa baholanadi. Sahifa yopiq bo‘lsa, yakuniy ball keyingi o‘quvchi yoki o‘qituvchi so‘rovida hisoblanadi; deadline baribir o‘zgarmaydi. Natijalar sahifasini yangilang. Bir vaqtda ikkita tab yozsa, versiya to‘qnashuvi xabar bilan bloklanadi.

Paste, drop va baholash oynasidan copy UI da o‘chirilgan. Brauzer qo‘llasa boshlashda to‘liq ekran so‘raladi. Tab yashirilishi, paste/drop va to‘liq ekrandan chiqish soni ko‘rinadigan tarzda qayd etiladi, lekin avtomatik ball kamaytirilmaydi. Brauzer cheklovlari va qaydlari foydalanuvchi tomonidan chetlab o‘tilishi mumkin; boshqa qurilma, AI yoki tashqi yordamni ishonchli aniqlamaydi. O‘qituvchi nazorati zarur. Hech qanday kamera, mikrofon yoki ekran yozuvi olinmaydi.

Test javob kalitlari faqat server modullarida, o‘quvchi API javoblari/client bundle’ida yo‘q. Ochiq manba repozitoriy bo‘lsa kalitlar kodni o‘qigan shaxsdan maxfiy emas; sinov nazorati o‘rnini bosa olmaydi. V1 topshiriqni faol sinovlar vaqtida o‘zgartirmang; keyingi katta o‘zgarishda versiyalangan topshiriq/tekshiruvchi qo‘shing.

## Ishga tushirish va tekshirish

Yangi bazaga yoki deploy oldidan `npm run db:deploy` bajarilishi zarur (`vercel-build` buni bajaradi). Yangi jadvallar: `HtmlExam`, `HtmlCandidate`. Baho, kod va ismlar faqat admin yoki tegishli urinish sessiyasiga ko‘rinadi; eksport `no-store`, admin autentifikatsiyasi bilan himoyalangan. Natijalar avtomatik o‘chirilmaydi; maktabingizning saqlash muddatini belgilang.

```sh
npm run db:deploy
npm run build
npm test
npm run test:assessment
```

`test:assessment` faqat `127.0.0.1` dagi lokal test bazasini qabul qiladi. Vaqtinchalik admin/sinov yaratadi, brauzerda to‘liq jarayon hamda parallel so‘rovlar va muddati o‘tgan yozuvlarni tekshiradi, oxirida o‘z ma’lumotlarini o‘chiradi. Ishlayotgan eski server bo‘lsa, avval uni to‘xtating: Playwright mavjud 3000-portdagi serverni qayta ishlatadi.
