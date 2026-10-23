# Veb dasturchi uchun xavfsiz kod cheklisti

Cybervalue Akademiyasi · Veb xavfsizlik · 1.0-versiya

Loyihani topshirishdan yoki joylashtirishdan oldin shu ro‘yxatdan o‘ting. Har bir band OWASP Top 10’dagi xavflardan biriga qarshi. Kod misollari JavaScript (Node.js) va SQL’da, lekin g‘oya har qanday tilda bir xil.

---

## 1. Kiritilgan ma’lumot

- [ ] Har bir kiritishni **serverda** tekshiraman: turi, uzunligi, formati. Brauzerdagi tekshiruv — faqat qulaylik uchun.
- [ ] “Ruxsat etilganlar ro‘yxati” (allowlist) bilan tekshiraman: `^[a-z0-9_-]{3,30}$` — “taqiqlanganlar ro‘yxati”dan ishonchliroq.
- [ ] Fayl yuklashda: kengaytma **va** haqiqiy turini tekshiraman, hajmini cheklayman, faylga yangi tasodifiy nom beraman, uni ishga tushirib bo‘lmaydigan joyda saqlayman.

## 2. Ma’lumotlar bazasi

- [ ] **Faqat parametrli so‘rovlar.** Hech qachon satrlarni qo‘shib SQL yasamayman.

```js
// Yomon — SQL in’ektsiya
db.query(`SELECT * FROM users WHERE email = '${email}'`);

// Yaxshi — ma’lumot buyruqdan alohida
db.query("SELECT * FROM users WHERE email = $1", [email]);
```

- [ ] Bazaga ulanadigan foydalanuvchida faqat kerakli huquqlar bor (masalan, `DROP` yo‘q).
- [ ] ORM ishlatsam ham, “xom” (raw) so‘rovlarda parametrlardan foydalanaman.

## 3. Sahifaga chiqarish (XSS)

- [ ] Foydalanuvchi matnini HTML’ga **ekranlab** chiqaraman. Zamonaviy freymvorklar (React, Vue) buni o‘zi qiladi — `dangerouslySetInnerHTML`, `v-html` dan qochaman.
- [ ] JavaScript’da `innerHTML` o‘rniga `textContent`.

```js
el.innerHTML = comment; // Yomon: <img src=x onerror=...> ishga tushadi
el.textContent = comment; // Yaxshi: matn sifatida ko‘rinadi
```

- [ ] Foydalanuvchi bergan havolalarda faqat `http:` va `https:` sxemasiga ruxsat beraman (`javascript:` — yo‘q).
- [ ] **Content-Security-Policy** sarlavhasini o‘rnatganman.

## 4. Autentifikatsiya

- [ ] Parollarni **Argon2id, bcrypt yoki scrypt** bilan saqlayman. MD5, SHA-1 va tuzsiz SHA-256 — yo‘q.
- [ ] Login urinishlari cheklangan (rate limit).
- [ ] Xato xabari bir xil: “Email yoki parol noto‘g‘ri” — qaysi biri xatoligini aytmayman.
- [ ] Mashhur va sizib chiqqan parollarni rad etaman; kamida 12 belgi.
- [ ] MFA imkoniyati bor, admin akkauntlarda majburiy.
- [ ] Parolni tiklash havolasi bir martalik, qisqa muddatli va tasodifiy.

## 5. Sessiya va cookie

- [ ] Sessiya cookie’si: `Secure; HttpOnly; SameSite=Lax`.
- [ ] Login’dan keyin **yangi** sessiya ID beraman (session fixation’ga qarshi).
- [ ] Chiqishda (logout) sessiyani serverda o‘chiraman.
- [ ] Sessiya ID’si URL’da emas, faqat cookie’da.
- [ ] Holatni o‘zgartiradigan so‘rovlar (`POST`, `PUT`, `DELETE`) CSRF’dan himoyalangan: `SameSite` cookie, CSRF token yoki `Origin` tekshiruvi.

## 6. Kirish nazorati

- [ ] Har bir API so‘rovida: **kim** so‘rayapti va **shu obyektga** huquqi bormi?

```js
// Yomon — har kim istalgan buyurtmani oladi (IDOR)
const order = await Order.findById(req.params.id);

// Yaxshi — faqat o‘z buyurtmasi
const order = await Order.findOne({ id: req.params.id, userId: req.user.id });
if (!order) return res.status(404).end();
```

- [ ] Admin sahifalari serverda tekshiriladi, faqat menyuda yashirilmaydi.
- [ ] Narx, chegirma, balans kabi qiymatlarni serverda hisoblayman — brauzer yuborganiga ishonmayman.

## 7. Maxfiy ma’lumotlar

- [ ] API kalitlari, parollar, tokenlar **kodda emas**, muhit o‘zgaruvchilarida (`.env`).
- [ ] `.env` fayli `.gitignore` da. Git tarixiga tushib qolgan kalitni darhol **almashtiraman** — o‘chirish yetarli emas.
- [ ] Brauzerga yuboriladigan kodda (frontend) maxfiy kalit yo‘q.
- [ ] Loglarda parol, token va karta raqamlari yo‘q.

## 8. Xatolar va loglar

- [ ] Foydalanuvchiga umumiy xato xabari, tafsilotlar (stack trace) faqat server logida.
- [ ] Production’da debug rejimi o‘chirilgan.
- [ ] Login, ruxsat rad etilishi va muhim o‘zgarishlar logga yoziladi.

## 9. Sozlamalar va bog‘liqliklar

- [ ] Hamma joyda HTTPS; HTTP so‘rovlar HTTPS’ga yo‘naltiriladi; HSTS yoqilgan.
- [ ] Xavfsizlik sarlavhalari: `Content-Security-Policy`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `frame-ancestors`.
- [ ] `npm audit` (yoki tilingizdagi muqobili) ogohlantirishlari ko‘rib chiqilgan.
- [ ] Ishlatilmaydigan kutubxonalar va endpoint’lar olib tashlangan.
- [ ] Standart admin parollari o‘zgartirilgan, test akkauntlari o‘chirilgan.
- [ ] Serverda `.git`, zaxira fayllar (`.bak`, `.old`, `.zip`) ochiq emas.

## 10. Tashqi so‘rovlar

- [ ] Foydalanuvchi bergan URL’ga server so‘rov yuborsa — ruxsat etilgan domenlar ro‘yxati bor, ichki manzillar (`localhost`, `10.x`, `169.254.169.254`) rad etiladi (SSRF).
- [ ] Webhook’lar imzo bilan tekshiriladi va qayta yuborilgan (replay) so‘rovlar rad etiladi.

---

## Topshirishdan oldin 5 daqiqa

1. Har bir forma maydoniga `'"><script>alert(1)</script>` yozib ko‘ring — matn sifatida ko‘rinishi kerak.
2. Login’ga `' OR '1'='1` kiriting — xato yoki “noto‘g‘ri parol” chiqishi kerak.
3. Boshqa foydalanuvchining ID’sini URL’ga qo‘yib ko‘ring — 403 yoki 404 chiqishi kerak.
4. Tizimdan chiqing va “Orqaga” tugmasini bosing — maxfiy sahifa ochilmasligi kerak.
5. `git log -p | grep -i "password\|secret\|api_key"` — tarixda kalit qolmaganini tekshiring.

**Eslatma:** bu sinovlarni faqat **o‘zingizning** loyihangizda yoki akademiyaning o‘quv tizimlarida bajaring.
