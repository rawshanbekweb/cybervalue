# Parollar va ikki bosqichli himoya: amaliy qo‘llanma

Cybervalue Akademiyasi · Kiberxavfsizlik asoslari · 1.0-versiya

Bu qo‘llanma o‘quvchi, o‘qituvchi va oddiy foydalanuvchi uchun. Maqsad — akkauntlaringizni bugunoq himoyalash: kuchli parol, parol menejeri va ikki bosqichli tekshiruv (MFA).

---

## 1. Parolni nima “buzadi”?

Hujumchi parolingizni deyarli hech qachon “o‘ylab topmaydi”. U quyidagi usullardan birini ishlatadi:

| Usul                         | Qanday ishlaydi                                                                       | Nimadan himoya qiladi                                        |
| ---------------------------- | ------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| **Lug‘at hujumi**            | Mashhur parollar ro‘yxatini (`123456`, `qwerty`, `parol2024`) birma-bir sinaydi       | Uzun va kutilmagan parol                                     |
| **Brute force**              | Barcha kombinatsiyalarni ketma-ket sinaydi                                            | Uzunlik: har bir qo‘shimcha belgi vaqtni ko‘p marta oshiradi |
| **Credential stuffing**      | Boshqa saytdan sizib chiqqan email + parolni sizning boshqa akkauntlaringizda sinaydi | Har bir sayt uchun **alohida** parol                         |
| **Fishing**                  | Soxta sahifa yasab, parolni o‘zingizga kiritadi                                       | MFA, ayniqsa passkey yoki xavfsizlik kaliti                  |
| **Josus dastur (keylogger)** | Kompyuteringizda bosilgan tugmalarni yozib oladi                                      | Yangilangan tizim, antivirus, MFA                            |

Asosiy xulosa: **bitta parolni ko‘p joyda ishlatish — eng katta xavf.** Bitta sayt buzilsa, hammasi ochiladi.

---

## 2. Yaxshi parol qanday bo‘ladi

**Uzunlik murakkablikdan muhimroq.** `P@ssw0rd!` qisqa va mashhur shablon — lug‘atlarda bor. `daraxt-yomg‘ir-velosiped-choynak` esa uzun, eslab qolish oson va taxmin qilish juda qiyin.

Qoidalar:

1. Kamida **12–16 belgi**, muhim akkauntlar uchun undan ham uzun.
2. **Parol ibora (passphrase):** 4–5 ta tasodifiy, bir-biriga bog‘liq bo‘lmagan so‘z.
3. Ism, tug‘ilgan sana, telefon raqami, sevimli jamoa — **ishlatmang**. Ular ijtimoiy tarmoqlaringizda ko‘rinib turadi.
4. Har bir sayt uchun **alohida parol**.
5. Parolni faqat sizib chiqqan yoki shubha tug‘ilganda almashtiring; har oy majburan almashtirish odatda yomonroq parollarga olib keladi.

### Tez taqqoslash

| Parol                                    | Baho       | Sabab                                                         |
| ---------------------------------------- | ---------- | ------------------------------------------------------------- |
| `123456`                                 | Juda yomon | Eng mashhur parollar ro‘yxatida birinchi                      |
| `Aziza2009`                              | Yomon      | Ism + yil — birinchi sinaladigan shablon                      |
| `P@ssw0rd!`                              | Yomon      | Harflar belgiga almashtirilgan mashhur so‘z — lug‘atlarda bor |
| `kG7#q`                                  | Yomon      | Murakkab, lekin juda qisqa                                    |
| `tog‘-qalam-quyosh-marvarid-7`           | Yaxshi     | Uzun, tasodifiy so‘zlar                                       |
| Parol menejeri yaratgan 20 belgili parol | A’lo       | Tasodifiy va uzun, eslab qolish shart emas                    |

---

## 3. Parol menejeri

Parol menejeri — barcha parollaringizni shifrlangan holda saqlaydigan dastur. Siz faqat **bitta asosiy parolni** eslab qolasiz.

Afzalliklari:

- Har bir sayt uchun uzun, tasodifiy parol yaratadi.
- Parolni faqat **haqiqiy saytda** avtomatik to‘ldiradi — soxta (fishing) saytda to‘ldirmaydi. Bu o‘zi ogohlantirish belgisi!
- Qaysi parollar takrorlangan yoki sizib chiqqanini ko‘rsatadi.

Nimalarga e’tibor berish kerak:

- **Asosiy parol** — eng kuchli parolingiz bo‘lsin va uni hech qayerda takrorlamang.
- Parol menejeri akkauntiga albatta **MFA** yoqing.
- Brauzerning o‘rnatilgan parol saqlagichi ham parol menejeri hisoblanadi — telefon yoki kompyuteringiz qulflangan bo‘lsa, oddiy foydalanuvchi uchun yaxshi boshlanish.

---

## 4. Ikki bosqichli himoya (MFA / 2FA)

MFA — paroldan tashqari **yana bir isbot** so‘rash. Isbot uch xil bo‘ladi:

- **Siz biladigan narsa:** parol, PIN.
- **Sizda bor narsa:** telefon, autentifikator ilovasi, xavfsizlik kaliti.
- **Siz o‘zingiz:** barmoq izi, yuz.

Parol sizib chiqsa ham, hujumchida ikkinchi omil bo‘lmaydi.

### MFA turlari — kuchsizdan kuchliga

| Tur                                         | Kuchi    | Izoh                                                                                                |
| ------------------------------------------- | -------- | --------------------------------------------------------------------------------------------------- |
| SMS kod                                     | O‘rtacha | SIM-karta almashtirish (SIM swap) va fishingga zaif, lekin MFA yo‘qligidan ancha yaxshi             |
| Email kod                                   | O‘rtacha | Email akkauntingiz qanchalik himoyalangan bo‘lsa, shunchalik kuchli                                 |
| Autentifikator ilovasi (TOTP, 6 xonali kod) | Yaxshi   | Har 30 soniyada yangi kod; internet shart emas. Lekin fishing sahifa kodni ham so‘rab olishi mumkin |
| Push-tasdiqlash                             | Yaxshi   | “Siz kiryapsizmi?” — **o‘zingiz kirmayotgan bo‘lsangiz, hech qachon “Ha” bosmang**                  |
| Passkey yoki xavfsizlik kaliti (FIDO2)      | A’lo     | Kalit faqat haqiqiy saytda ishlaydi — fishingga chidamli                                            |

### Zaxira kodlar

MFA yoqilganda sayt odatda 8–10 ta **zaxira kod** beradi. Telefoningiz yo‘qolsa, faqat shular bilan kira olasiz.

- Ularni qog‘ozga yozib, xavfsiz joyda saqlang yoki parol menejeriga qo‘ying.
- Har bir kod bir marta ishlaydi.

---

## 5. Qaysi akkauntlardan boshlash kerak

Vaqt kam bo‘lsa, shu tartibda himoyalang:

1. **Asosiy email** — boshqa barcha akkauntlarning paroli shu orqali tiklanadi.
2. **Telefon akkaunti** (Google yoki Apple ID).
3. **Bank va to‘lov ilovalari.**
4. **Ijtimoiy tarmoqlar va messenjerlar** (Telegram uchun “Ikki bosqichli tasdiqlash” parolini yoqing).
5. **Ish yoki o‘qish akkauntlari.**

---

## 6. Parolim sizib chiqqan bo‘lsa nima qilaman?

1. **Darhol o‘sha saytda parolni almashtiring.**
2. Shu parol ishlatilgan **barcha boshqa saytlarda** ham almashtiring.
3. MFA yoqilmagan bo‘lsa — yoqing.
4. Akkauntdagi **faol seanslarni** tekshiring va begonalarini o‘chiring (“Barcha qurilmalardan chiqish”).
5. Email akkauntingizda yo‘naltirish (forwarding) qoidalari qo‘shilmaganini tekshiring — hujumchilar xatlaringizni jim nusxalab olish uchun shunday qiladi.
6. O‘quv muassasasi yoki ish akkaunti bo‘lsa — **o‘qituvchi yoki IT bo‘limiga xabar bering.**

---

## 7. Mashq: 15 daqiqalik tekshiruv

Quyidagi ro‘yxatni bajaring va belgilang:

- [ ] Asosiy emailda MFA yoqilgan.
- [ ] Asosiy email paroli boshqa hech qayerda ishlatilmaydi.
- [ ] Telegramda ikki bosqichli tasdiqlash paroli o‘rnatilgan.
- [ ] Parol menejeri (yoki brauzer saqlagichi) o‘rnatilgan va qulflangan.
- [ ] Zaxira kodlar xavfsiz joyda saqlangan.
- [ ] Eng muhim 5 akkauntning parollari bir-biridan farq qiladi.
- [ ] Telefon ekrani PIN yoki biometrik bilan qulflanadi.

**Muhim:** bu mashqni faqat **o‘z** akkauntlaringizda bajaring. Boshqa birovning akkauntiga uning ruxsatisiz kirishga urinish qonunga zid.

---

## Qisqacha eslatma

> Uzun parol · har bir sayt uchun alohida · parol menejeri · hamma joyda MFA · zaxira kodlar xavfsiz joyda · so‘ramagan tasdiqlashga hech qachon “Ha” bosmang.
