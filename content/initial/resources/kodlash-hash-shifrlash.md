# Kodlash, hash va shifrlash: farqi va qachon nima ishlatiladi

Cybervalue Akademiyasi · Kriptografiya asoslari · 1.0-versiya

“Shifrlangan” degan so‘z ko‘p joyda noto‘g‘ri ishlatiladi. Bu qo‘llanma uchta tushunchani farqlashni o‘rgatadi — kripto testi va kripto lab uchun asosiy tayyorgarlik.

---

## 1. Bir qarashda

|                       | Kodlash (encoding)                   | Hash                                   | Shifrlash (encryption) |
| --------------------- | ------------------------------------ | -------------------------------------- | ---------------------- |
| **Maqsadi**           | Ma’lumotni boshqa formatga o‘tkazish | “Barmoq izi” olish                     | Ma’lumotni yashirish   |
| **Kalit kerakmi**     | Yo‘q                                 | Yo‘q                                   | **Ha**                 |
| **Orqaga ochiladimi** | Ha, har kim ochadi                   | **Yo‘q**, bir tomonlama                | Faqat kalit egasi      |
| **Natija uzunligi**   | Kirishga bog‘liq                     | Doim bir xil                           | Kirishga bog‘liq       |
| **Misollar**          | Base64, hex, URL kodlash             | SHA-256, bcrypt, Argon2                | AES, ChaCha20, RSA     |
| **Himoya qiladimi**   | **Yo‘q**                             | Yaxlitlikni tekshiradi, parol saqlaydi | Maxfiylikni            |

**Asosiy qoida:** kodlash — xavfsizlik emas. Base64 bilan “yashirilgan” parol ochiq yozilgan parol bilan bir xil.

---

## 2. Kodlash

Kodlash ma’lumotni **tashish yoki saqlash qulay** formatga o‘tkazadi. Uning hech qanday siri yo‘q — algoritm hammaga ma’lum va kalit kerak emas.

| Kodlash       | Misol: `CV`                             | Qayerda ishlatiladi                             |
| ------------- | --------------------------------------- | ----------------------------------------------- |
| Base64        | `Q1Y=`                                  | Email ilovalari, rasmni matn ichida berish, JWT |
| Hex           | `4356`                                  | Hash natijalarini ko‘rsatish, xotira manzillari |
| URL kodlash   | `%43%56` (odatda faqat maxsus belgilar) | URL’dagi bo‘sh joy (`%20`), `&`, `?`            |
| ASCII / UTF-8 | `67 86`                                 | Har qanday matn kompyuterda                     |

```sh
echo -n 'salom' | base64        # c2Fsb20=
echo 'c2Fsb20=' | base64 -d     # salom
echo -n 'salom' | xxd -p        # 73616c6f6d
```

---

## 3. Hash

Hash funksiyasi istalgan uzunlikdagi ma’lumotdan **qisqa, belgilangan uzunlikdagi** “barmoq izi” yasaydi.

```sh
echo -n 'salom' | sha256sum
# 038f270ca678c66f5bf393f958e8eebcf98b049e5a0d32a69cabf46b576cabbf — har safar bir xil
echo -n 'Salom' | sha256sum
# 441f71d48aacacdc18293201da2bfda40a421c4f93d8e509fcd2d0440b007b46 — bitta harf hammasini o‘zgartirdi
```

Xususiyatlari:

1. **Bir tomonlama** — hashdan asl matnni hisoblab bo‘lmaydi.
2. **Deterministik** — bir xil kirish → bir xil natija.
3. **Ko‘chki effekti** — kichik o‘zgarish natijani butunlay o‘zgartiradi.
4. **To‘qnashuvga chidamli** — bir xil hashli ikki xil matn topish amalda imkonsiz.

### Qayerda ishlatiladi

- **Fayl yaxlitligi:** yuklab olingan dastur hashi sayt ko‘rsatganiga teng bo‘lsa — fayl o‘zgarmagan.
- **Parol saqlash:** server parolni emas, uning hashini saqlaydi.
- **Raqamli imzo** va blokcheyn.

### Parol uchun maxsus hash

SHA-256 juda **tez** — bu fayllar uchun yaxshi, parollar uchun yomon: hujumchi soniyasiga milliardlab taxminni sinaydi. Parollar uchun ataylab **sekin** va **tuzli** algoritmlar ishlatiladi:

| Algoritm         | Holati                                                                 |
| ---------------- | ---------------------------------------------------------------------- |
| MD5, SHA-1       | **Ishlatmang** — buzilgan va juda tez                                  |
| SHA-256 (tuzsiz) | Parol uchun **ishlatmang** — tez, bir xil parollar bir xil hash beradi |
| **bcrypt**       | Yaxshi, keng tarqalgan (`$2b$12$...`)                                  |
| **scrypt**       | Yaxshi, xotira talab qiladi                                            |
| **Argon2id**     | Hozirgi tavsiya                                                        |

**Tuz (salt)** — har bir parolga qo‘shiladigan tasodifiy qiymat. Ikki odamning paroli bir xil bo‘lsa ham, hashlari har xil chiqadi va oldindan hisoblangan jadvallar (rainbow tables) ishlamaydi.

“Hashni buzish” — hashni ochish emas, balki **taxmin qilingan parollarni** hashlab, natijani solishtirish. Shuning uchun kuchsiz parol eng yaxshi hash bilan ham tez topiladi.

---

## 4. Shifrlash

Shifrlash ma’lumotni **kalit** bilan o‘qib bo‘lmaydigan ko‘rinishga o‘tkazadi. Kalitsiz — tasodifiy baytlar.

### Simmetrik shifrlash

Bitta kalit bilan shifrlanadi va ochiladi.

- **AES** (AES-128, AES-256) — eng keng tarqalgan; diskni shifrlash, Wi-Fi (WPA2/WPA3), HTTPS ichidagi trafik.
- Tez, lekin muammo: kalitni boshqa tomonga **qanday xavfsiz yetkazish?**

### Asimmetrik shifrlash

Ikki kalit: **ochiq kalit** (hammaga beriladi) va **yopiq kalit** (faqat egasida).

- Ochiq kalit bilan shifrlangan xabarni faqat yopiq kalit ochadi.
- Yopiq kalit bilan **imzolangan** xabarni har kim ochiq kalit bilan tekshiradi — bu **raqamli imzo**.
- RSA, ECC (elliptik egri chiziqlar).
- Sekin, shuning uchun odatda faqat simmetrik kalitni almashish uchun ishlatiladi.

### HTTPS ikkalasini birlashtiradi

1. Brauzer sertifikat orqali saytning **ochiq kalitini** oladi va uni sertifikat markazi imzosi bilan tekshiradi.
2. Ikki tomon asimmetrik usul bilan umumiy **seans kalitini** kelishib oladi.
3. Qolgan barcha trafik **simmetrik** (AES yoki ChaCha20) shifrlanadi.

---

## 5. Qaysi birini qachon ishlatish kerak

| Vazifa                                            | To‘g‘ri tanlov                           | Noto‘g‘ri tanlov           |
| ------------------------------------------------- | ---------------------------------------- | -------------------------- |
| Foydalanuvchi parolini saqlash                    | Argon2id / bcrypt                        | Base64, AES, oddiy SHA-256 |
| API kalitini bazada saqlash (keyin kerak bo‘ladi) | AES bilan shifrlash, kalit alohida joyda | Base64                     |
| Yuklab olingan faylni tekshirish                  | SHA-256                                  | MD5                        |
| Rasmni JSON ichida yuborish                       | Base64                                   | —                          |
| Xabarni faqat qabul qiluvchi o‘qishi              | Shifrlash (TLS, end-to-end)              | Kodlash                    |
| Xabar o‘zgarmaganini va kim yuborganini isbotlash | Raqamli imzo                             | Hash yolg‘iz o‘zi          |

---

## 6. Tanib olish bo‘yicha mashq

Har bir qiymat — kodlash, hash yoki shifrmi?

1. `aGVsbG8gd29ybGQ=`
2. `5d41402abc4b2a76b9719d911017c592`
3. `$2b$12$KIX1Jx3h0J0v8u5Q5QJx9eS2Y6M3sR7t1a9b2c3d4e5f6g7h8i9j0`
4. `U2FsdGVkX1+abc123...` (OpenSSL chiqishi)
5. `68656c6c6f`

<details>
<summary>Javoblar</summary>

1. **Base64 kodlash** → `hello world`.
2. **MD5 hash** (32 hex belgi) — `hello` so‘zining MD5’i. Ochilmaydi, lekin mashhur so‘zlar ro‘yxatda bor — MD5 parol uchun yaroqsiz.
3. **bcrypt hash** — `$2b$`, xarajat 12.
4. **Shifr** — `U2FsdGVkX1` = base64 ko‘rinishidagi “Salted__”, OpenSSL shifrlash belgisi. Kalitsiz ochilmaydi.
5. **Hex kodlash** → `hello`.

</details>

---

## Qisqacha eslatma

> Kodlash — kalitsiz ochiladi. Hash — umuman ochilmaydi. Shifrlash — faqat kalit bilan ochiladi. Parollar uchun — sekin, tuzli hash.
