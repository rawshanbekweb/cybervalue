# OWASP Top 10: veb-ilovalardagi eng muhim xavflar

Cybervalue Akademiyasi · Veb xavfsizlik · 1.0-versiya

OWASP (Open Worldwide Application Security Project) — veb xavfsizlik bo‘yicha ochiq hamjamiyat. Uning **Top 10** ro‘yxati veb-ilovalardagi eng keng tarqalgan va xavfli xatolarni jamlaydi. Bu qo‘llanma OWASP Top 10:2021 tartibiga asoslangan va har bir bandni oddiy misol bilan tushuntiradi.

Har bir band uchun: **nima bu**, **misol**, **qanday himoyalanish**.

---

## A01. Buzilgan kirish nazorati (Broken Access Control)

**Nima bu:** foydalanuvchi o‘ziga ruxsat berilmagan narsani ko‘ra yoki o‘zgartira oladi.

**Misol:** `GET /api/orders/1043` sizning buyurtmangizni ko‘rsatadi. Raqamni `1044` ga o‘zgartirsangiz — boshqa odamning buyurtmasi ochiladi (IDOR). Yoki oddiy foydalanuvchi `/admin` sahifasiga to‘g‘ridan-to‘g‘ri kira oladi.

**Himoya:**

- Har bir so‘rovda **serverda** tekshiring: “bu foydalanuvchi aynan shu obyektga egami?”
- Sukut bo‘yicha taqiqlang (deny by default), keyin kerakli ruxsatni bering.
- Tugmani yashirish — himoya emas; API’ni to‘g‘ridan-to‘g‘ri chaqirish mumkin.

---

## A02. Kriptografik xatolar (Cryptographic Failures)

**Nima bu:** maxfiy ma’lumot himoyasiz uzatiladi yoki saqlanadi.

**Misol:** login sahifasi HTTP orqali ishlaydi; parollar bazada ochiq matnda yoki tuzsiz MD5 bilan saqlanadi; “shifrlangan” deb base64 ishlatiladi.

**Himoya:**

- Hamma joyda **HTTPS** va HSTS.
- Parollar uchun maxsus sekin hash: **Argon2id, bcrypt yoki scrypt** — tuz (salt) bilan.
- Kodlash (base64, hex) — shifrlash emas. Kalitlarni kodda saqlamang.

---

## A03. In’ektsiya (Injection)

**Nima bu:** foydalanuvchi kiritgan matn buyruqning bir qismiga aylanib qoladi — SQL, OS buyrug‘i, LDAP va hokazo. XSS ham shu guruhga kiradi.

**Misol:**

```sql
-- Kod: "SELECT * FROM users WHERE name = '" + ism + "'"
-- Kiritildi: ' OR '1'='1
SELECT * FROM users WHERE name = '' OR '1'='1'   -- barcha foydalanuvchilar
```

**Himoya:**

- **Parametrli so‘rovlar** (prepared statements) — ma’lumot va buyruq alohida.
- HTML’ga chiqarishda **kontekstga mos ekranlash** (escaping); `innerHTML` o‘rniga `textContent`.
- OS buyrug‘ini satrdan yig‘mang; argumentlar ro‘yxati bilan chaqiring.

---

## A04. Xavfsiz bo‘lmagan dizayn (Insecure Design)

**Nima bu:** xato kodda emas, **mantiqda**. Hech qanday himoya rejalashtirilmagan.

**Misol:** parolni tiklash uchun “Sevimli rangingiz?” savoli; chegirma kuponini cheksiz qayta ishlatish; savatdagi narxni brauzer yuboradi va server unga ishonadi.

**Himoya:**

- Loyihalashda “**buni qanday suiiste’mol qilish mumkin?**” deb so‘rang (threat modeling).
- Narx, chegirma, limitlarni **serverda** hisoblang.
- Muhim amallarga cheklov (rate limit) qo‘ying.

---

## A05. Noto‘g‘ri xavfsizlik sozlamalari (Security Misconfiguration)

**Nima bu:** standart parollar, ochiq qolgan admin panellar, keraksiz xizmatlar, batafsil xato xabarlari.

**Misol:** `admin/admin` bilan kiriladigan panel; xato sahifasida stack trace va bazaning nomi; ommaviy ochiq bulut ombori (S3 bucket); `/.git/` papkasi serverda ochiq.

**Himoya:**

- Standart parollarni o‘zgartiring, keraksiz funksiyalarni o‘chiring.
- Foydalanuvchiga umumiy xato xabari, tafsilotlar faqat logga.
- Xavfsizlik sarlavhalari (CSP, HSTS, `X-Content-Type-Options`).

---

## A06. Zaif va eskirgan komponentlar (Vulnerable and Outdated Components)

**Nima bu:** ilova ma’lum zaifligi bor kutubxona, freymvork yoki server versiyasini ishlatadi.

**Misol:** 2021-yildagi Log4Shell — Log4j kutubxonasidagi bitta zaiflik millionlab tizimlarni xavf ostiga qo‘ydi.

**Himoya:**

- Bog‘liqliklar ro‘yxatini biling va muntazam yangilang (`npm audit`, Dependabot).
- Ishlatilmaydigan kutubxonalarni olib tashlang.
- Faqat rasmiy manbalardan o‘rnating.

---

## A07. Identifikatsiya va autentifikatsiya xatolari

**Nima bu:** login tizimi zaif: parolni taxmin qilish, sessiyani o‘g‘irlash yoki chetlab o‘tish mumkin.

**Misol:** cheksiz login urinishlari; `123456` paroliga ruxsat; chiqishdan keyin ham sessiya ishlayveradi; sessiya ID’si URL’da.

**Himoya:**

- **MFA**, urinishlarni cheklash, mashhur parollarni rad etish.
- Sessiya cookie’si: `Secure; HttpOnly; SameSite`, login’dan keyin yangi sessiya ID.
- Chiqishda sessiyani serverda o‘chiring.

---

## A08. Dastur va ma’lumot yaxlitligi xatolari

**Nima bu:** kod yoki ma’lumot tekshirilmasdan qabul qilinadi.

**Misol:** saytga begona CDN’dan skript butunlik tekshiruvisiz ulanadi; yangilanish imzosiz yuklab olinadi; serverga kelgan serializatsiya qilingan obyekt tekshirilmasdan ochiladi.

**Himoya:**

- Imzolangan yangilanishlar, `integrity` (SRI) atributi.
- Ishonchsiz ma’lumotni deserializatsiya qilmang yoki qat’iy sxema bilan tekshiring.
- CI/CD jarayonini himoyalang.

---

## A09. Log va monitoring kamchiliklari

**Nima bu:** hujum bo‘layotgani hech kimga ma’lum bo‘lmaydi.

**Misol:** 10 000 ta muvaffaqiyatsiz login urinishi qayd etilmagan; loglar faqat bitta serverda va hujumchi ularni o‘chirgan.

**Himoya:**

- Login, ruxsat rad etilishi va muhim amallarni qayd eting.
- Loglarni markazlashgan joyda saqlang, ogohlantirishlar sozlang.
- **Parol va tokenlarni logga yozmang.**

---

## A10. Server tomonidagi so‘rovni soxtalashtirish (SSRF)

**Nima bu:** server foydalanuvchi bergan manzilga so‘rov yuboradi va hujumchi uni ichki tizimlarga yo‘naltiradi.

**Misol:** “Rasmni URL orqali yuklash” funksiyasiga `http://169.254.169.254/` (bulut metama’lumot xizmati) yoki `http://localhost:8080/admin` beriladi.

**Himoya:**

- Ruxsat etilgan domenlar ro‘yxati (allowlist).
- Ichki va xususiy IP manzillarni rad eting — yo‘naltirishdan keyin ham tekshiring.
- Server chiqish trafigini tarmoq darajasida cheklang.

---

## Bir varaqda

| #   | Xavf             | Bir jumlada himoya                                             |
| --- | ---------------- | -------------------------------------------------------------- |
| A01 | Kirish nazorati  | Har bir obyekt uchun serverda egalikni tekshiring              |
| A02 | Kriptografiya    | HTTPS + Argon2/bcrypt, kodlash ≠ shifrlash                     |
| A03 | In’ektsiya       | Parametrli so‘rov, chiqishda ekranlash                         |
| A04 | Dizayn           | Suiiste’molni oldindan o‘ylang, qiymatlarni serverda hisoblang |
| A05 | Sozlamalar       | Standartlarni o‘zgartiring, ortiqchasini o‘chiring             |
| A06 | Komponentlar     | Yangilang, keraksizini olib tashlang                           |
| A07 | Autentifikatsiya | MFA, urinish cheklovi, xavfsiz sessiya                         |
| A08 | Yaxlitlik        | Imzo va butunlik tekshiruvi                                    |
| A09 | Monitoring       | Muhim hodisalarni qayd eting va kuzating                       |
| A10 | SSRF             | Manzillar allowlist’i, ichki IP’larni rad etish                |

---

## Akademiyada qayerda mashq qilasiz

- **Veb-xavfsizlik laboratoriyasi** — SQLi, XSS, IDOR, CSRF amalda (A01, A03, A07).
- **Build & Defend** — XSS’ga qarshi xavfsiz render yozish (A03).
- **Investigation missions** — kirish nazorati, to‘lov mantiqi, webhook takrorlash (A01, A04, A08).
- **HTTP chuqurroq (Intermediate)** — cookie, CORS va xavfsizlik sarlavhalari (A05, A07).

**Eslatma:** bu zaifliklarni faqat akademiyaning o‘quv tizimlarida yoki yozma ruxsat olingan ilovalarda sinang.

Manba: OWASP Top 10:2021 — owasp.org/Top10
