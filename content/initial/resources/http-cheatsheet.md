# HTTP cheat-sheet: metodlar, holat kodlari va sarlavhalar

Cybervalue Akademiyasi · Veb asoslari · 1.0-versiya

Brauzer va server HTTP tilida gaplashadi. Bu varaq HTTP asoslari, HTTPS va HTTP chuqurroq laboratoriyalarini yonma-yon o‘rganish uchun.

---

## 1. So‘rov va javob tuzilishi

```http
GET /search?q=kitob HTTP/1.1          ← so‘rov qatori: metod, yo‘l, versiya
Host: shop.example.uz                 ← sarlavhalar (headers)
User-Agent: Mozilla/5.0
Accept: text/html
Cookie: session=4f9a...
                                      ← bo‘sh qator
                                      ← tana (body), GET da odatda bo‘sh
```

```http
HTTP/1.1 200 OK                       ← holat qatori: versiya, kod, izoh
Content-Type: text/html; charset=utf-8
Content-Length: 5120
Set-Cookie: theme=dark; Path=/; SameSite=Lax

<!doctype html>...                    ← tana
```

**URL qismlari:** `https://shop.example.uz:443/search?q=kitob#natijalar`

| Qism           | Qiymat            | Serverga boradimi         |
| -------------- | ----------------- | ------------------------- |
| Sxema          | `https`           | Ulanish turi              |
| Host           | `shop.example.uz` | Ha, `Host` sarlavhasida   |
| Port           | `443`             | Ulanish uchun ishlatiladi |
| Yo‘l (path)    | `/search`         | Ha                        |
| So‘rov (query) | `q=kitob`         | Ha                        |
| Fragment       | `#natijalar`      | **Yo‘q**, faqat brauzerda |

---

## 2. Metodlar

| Metod     | Vazifasi                                                            | Xavfsiz* | Idempotent** |
| --------- | ------------------------------------------------------------------- | -------- | ------------ |
| `GET`     | Ma’lumotni o‘qish                                                   | Ha       | Ha           |
| `HEAD`    | GET kabi, lekin tanasiz (faqat sarlavhalar)                         | Ha       | Ha           |
| `POST`    | Yangi narsa yaratish, forma yuborish                                | Yo‘q     | Yo‘q         |
| `PUT`     | Resursni to‘liq almashtirish                                        | Yo‘q     | Ha           |
| `PATCH`   | Resursning bir qismini o‘zgartirish                                 | Yo‘q     | Odatda yo‘q  |
| `DELETE`  | O‘chirish                                                           | Yo‘q     | Ha           |
| `OPTIONS` | Qaysi metodlar ruxsat etilganini so‘rash (CORS oldindan tekshiruvi) | Ha       | Ha           |

\* **Xavfsiz** — serverdagi ma’lumotni o‘zgartirmaydi.

\*\* **Idempotent** — bir xil so‘rovni ko‘p marta yuborish bir marta yuborish bilan bir xil natija beradi.

**Xavfsizlik eslatmasi:** `GET` so‘rovi bilan ma’lumot o‘zgartirmang (masalan, `GET /delete?id=5`). Bunday havolani rasm yoki boshqa sayt orqali yashirincha chaqirish oson. Parol va maxfiy ma’lumotni query’ga emas, `POST` tanasiga qo‘ying — query brauzer tarixida va server loglarida qoladi.

---

## 3. Holat kodlari

| Oila    | Ma’nosi               | Eslab qolish          |
| ------- | --------------------- | --------------------- |
| **1xx** | Ma’lumot, davom eting | “Kuting...”           |
| **2xx** | Muvaffaqiyat          | “Mana, oling”         |
| **3xx** | Yo‘naltirish          | “Boshqa joyga boring” |
| **4xx** | Mijoz xatosi          | “Siz xato qildingiz”  |
| **5xx** | Server xatosi         | “Men xato qildim”     |

### Eng ko‘p uchraydiganlar

| Kod           | Nomi                       | Qachon                                                |
| ------------- | -------------------------- | ----------------------------------------------------- |
| `200`         | OK                         | So‘rov bajarildi                                      |
| `201`         | Created                    | Yangi resurs yaratildi (odatda POST’dan keyin)        |
| `204`         | No Content                 | Bajarildi, lekin tana yo‘q (masalan, DELETE)          |
| `301`         | Moved Permanently          | Manzil butunlay o‘zgargan                             |
| `302` / `307` | Found / Temporary Redirect | Vaqtinchalik yo‘naltirish (masalan, login’dan keyin)  |
| `304`         | Not Modified               | Brauzer keshidagi nusxa hali yangi                    |
| `308`         | Permanent Redirect         | Butunlay o‘zgargan, metod saqlanadi                   |
| `400`         | Bad Request                | So‘rov noto‘g‘ri tuzilgan                             |
| `401`         | Unauthorized               | **Kim ekaningiz noma’lum** — tizimga kiring           |
| `403`         | Forbidden                  | **Kimligingiz ma’lum, lekin ruxsat yo‘q**             |
| `404`         | Not Found                  | Bunday resurs yo‘q                                    |
| `405`         | Method Not Allowed         | Bu manzil bu metodni qabul qilmaydi                   |
| `409`         | Conflict                   | Holat ziddiyati (masalan, bunday nom band)            |
| `429`         | Too Many Requests          | Juda ko‘p so‘rov — kuting (rate limit)                |
| `500`         | Internal Server Error      | Serverdagi kutilmagan xato                            |
| `502`         | Bad Gateway                | Oraliq server orqadagi serverdan noto‘g‘ri javob oldi |
| `503`         | Service Unavailable        | Server vaqtincha ishlamayapti yoki band               |
| `504`         | Gateway Timeout            | Orqadagi server javob bermadi                         |

**401 va 403 farqi:** 401 — “sizni tanimayman”, 403 — “sizni taniyman, lekin mumkin emas”.

---

## 4. Muhim sarlavhalar

### So‘rov sarlavhalari

| Sarlavha        | Vazifasi                                                                   |
| --------------- | -------------------------------------------------------------------------- |
| `Host`          | Qaysi saytga (bitta serverda ko‘p sayt bo‘lishi mumkin)                    |
| `User-Agent`    | Brauzer yoki dastur nomi — **soxtalashtirish oson**, ishonmang             |
| `Accept`        | Qanday formatdagi javobni kutadi                                           |
| `Cookie`        | Brauzer saqlagan cookie’lar                                                |
| `Authorization` | Token yoki login ma’lumoti (`Bearer eyJ...`)                               |
| `Content-Type`  | Tananing formati (`application/json`, `application/x-www-form-urlencoded`) |
| `Origin`        | So‘rov qaysi saytdan kelgani (CORS va CSRF tekshiruvida)                   |
| `Referer`       | Oldingi sahifa manzili                                                     |

### Javob sarlavhalari

| Sarlavha        | Vazifasi                                                 |
| --------------- | -------------------------------------------------------- |
| `Content-Type`  | Javob formati                                            |
| `Location`      | 3xx yo‘naltirishda yangi manzil                          |
| `Set-Cookie`    | Brauzerga cookie saqlashni buyuradi                      |
| `Cache-Control` | Keshlash qoidalari (`no-store` — maxfiy sahifalar uchun) |

### Xavfsizlik sarlavhalari

| Sarlavha                                  | Namuna                                | Nimadan himoya qiladi                                       |
| ----------------------------------------- | ------------------------------------- | ----------------------------------------------------------- |
| `Strict-Transport-Security`               | `max-age=31536000; includeSubDomains` | Saytni faqat HTTPS orqali ochishga majbur qiladi            |
| `Content-Security-Policy`                 | `default-src 'self'`                  | XSS: begona skriptlarni bloklaydi                           |
| `X-Content-Type-Options`                  | `nosniff`                             | Brauzer fayl turini “taxmin qilmasligi”                     |
| `X-Frame-Options` / CSP `frame-ancestors` | `DENY`                                | Clickjacking: saytni boshqa sahifaga yashirin joylashtirish |
| `Referrer-Policy`                         | `strict-origin-when-cross-origin`     | Manzildagi maxfiy ma’lumot boshqa saytlarga ketmasligi      |
| `Permissions-Policy`                      | `camera=(), microphone=()`            | Kamera, mikrofon va boshqalarga keraksiz kirish             |

---

## 5. Cookie atributlari

```http
Set-Cookie: session=4f9a2c; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=3600
```

| Atribut               | Ma’nosi                                                                                 |
| --------------------- | --------------------------------------------------------------------------------------- |
| `Secure`              | Faqat HTTPS orqali yuboriladi                                                           |
| `HttpOnly`            | JavaScript (`document.cookie`) o‘qiy olmaydi — XSS’da sessiyani o‘g‘irlash qiyinlashadi |
| `SameSite=Lax`        | Boshqa saytdan kelgan ko‘p so‘rovlarda yuborilmaydi — CSRF’ga qarshi                    |
| `SameSite=Strict`     | Boshqa saytdan kelgan hech bir so‘rovda yuborilmaydi                                    |
| `SameSite=None`       | Har doim yuboriladi (faqat `Secure` bilan)                                              |
| `Path` / `Domain`     | Qaysi manzillarga yuboriladi                                                            |
| `Max-Age` / `Expires` | Qachon o‘chadi; ikkalasi bo‘lmasa — brauzer yopilguncha                                 |

Sessiya cookie’si uchun yaxshi standart: **`Secure; HttpOnly; SameSite=Lax`**.

---

## 6. Same-origin va CORS — bir qarashda

**Origin = sxema + host + port.** `https://shop.uz` va `https://shop.uz:8443` — **boshqa** origin; `https://shop.uz/a` va `https://shop.uz/b` — **bir xil**.

- Brauzer boshqa origin’dagi javobni JavaScript’ga **o‘qitmaydi** (same-origin policy).
- Server ruxsat bersa (`Access-Control-Allow-Origin: https://app.shop.uz`) — o‘qish mumkin.
- `Access-Control-Allow-Origin: *` bilan birga cookie yuborib bo‘lmaydi — bu ataylab qo‘yilgan cheklov.
- CORS **brauzer** qoidasi. U serverni himoya qilmaydi: `curl` uni umuman tekshirmaydi. Ruxsatni serverda doim alohida tekshiring.

---

## 7. Terminalda HTTP

```sh
curl -i https://example.com                 # javob sarlavhalari bilan
curl -I https://example.com                 # faqat sarlavhalar (HEAD)
curl -L http://example.com                  # yo‘naltirishlarga ergashish
curl -X POST -d 'user=ali&pass=...' URL     # forma yuborish
curl -H 'Accept: application/json' URL      # sarlavha qo‘shish
curl -v https://example.com                 # TLS va so‘rovning to‘liq jarayoni
```

Brauzerda: **F12 → Network (Tarmoq)** — har bir so‘rovning metodini, holat kodini va sarlavhalarini ko‘rasiz.

**Eslatma:** so‘rovlarni faqat o‘zingizga tegishli yoki ruxsat olingan saytlarga va akademiyaning o‘quv serverlariga yuboring.
