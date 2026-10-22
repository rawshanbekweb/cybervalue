# CTF’ga birinchi qadam: metodika va vositalar

Cybervalue Akademiyasi · CTF · 1.0-versiya

CTF (Capture the Flag) — xavfsizlik bo‘yicha musobaqa. Har bir topshiriqda yashirin **flag** bor, odatda `CV{...}` ko‘rinishida. Uni topib yuborsangiz — ball olasiz. Bu qo‘llanma birinchi CTF’ingizda nimadan boshlashni ko‘rsatadi.

---

## 1. CTF turlari

| Tur                  | Ta’rifi                                                              | Akademiyada                                   |
| -------------------- | -------------------------------------------------------------------- | --------------------------------------------- |
| **Jeopardy**         | Mavzular bo‘yicha alohida topshiriqlar: web, kripto, forensika, ...  | 00:17 CTF, o‘quvchi kabinetidagi CTF’lar      |
| **Attack–Defense**   | Jamoalar o‘z serverini himoya qiladi va boshqalarnikiga hujum qiladi | Build & Defend — soddalashtirilgan ko‘rinishi |
| **Hikoyaviy tergov** | Bitta hikoya ichida bosqichma-bosqich dalillar                       | 00:17 — So‘nggi signal                        |

### Jeopardy toifalari

| Toifa              | Nima qilasiz                                         | Boshlang‘ich vositalar         |
| ------------------ | ---------------------------------------------------- | ------------------------------ |
| **Web**            | Sayt manbasini, cookie’larni, so‘rovlarni o‘rganasiz | Brauzer DevTools (F12), `curl` |
| **Kripto**         | Kodlash va shifrlarni ochasiz                        | CyberChef, Python              |
| **Forensika**      | Log, fayl, tarmoq yozuvidan dalil topasiz            | `grep`, `strings`, Wireshark   |
| **OSINT**          | Ochiq ma’lumotlardan javob topasiz                   | Qidiruv tizimlari, xaritalar   |
| **Steganografiya** | Rasm yoki audioda yashirilgan ma’lumot               | `exiftool`, `binwalk`          |
| **Misc**           | Mantiq va boshqa har xil                             | Diqqat va sabr                 |

---

## 2. Har bir topshiriqda 6 qadam

1. **Shartni ikki marta o‘qing.** Sarlavha va hikoyadagi so‘zlar ko‘pincha maslahat: “eski”, “zaxira”, “teskari”, “yashirin”.
2. **Nimaga egasiz?** Fayl, havola, matn? Ro‘yxat qiling.
3. **Eng oddiy narsadan boshlang.** Sahifa manbasi (`Ctrl+U`), HTML izohlar, `robots.txt`, fayl metama’lumotlari.
4. **Qiymatni taniy oling.** U qanday ko‘rinishda? (pastdagi jadvalga qarang)
5. **Har bir urinishni yozib boring.** Nima sinadingiz, nima chiqdi — 20 daqiqadan keyin unutasiz.
6. **Tiqilib qoldingizmi?** Ortga qayting: biror narsani o‘tkazib yuborgansiz. Maslahatdan foydalanishdan uyalmang.

---

## 3. Qiymatni tanish

| Ko‘rinishi                                       | Ehtimol           | Qanday ochiladi                                 |
| ------------------------------------------------ | ----------------- | ----------------------------------------------- |
| `Q1Z7ZmxhZ30=` — harf, raqam, `+ /`, oxirida `=` | **Base64**        | `echo '...' \| base64 -d`                       |
| `43567b666c61677d` — faqat `0-9a-f`              | **Hex**           | `echo '...' \| xxd -r -p`                       |
| `PI{synt}` — harflar siljigan, `CV{` → `PI{`     | **ROT13 / Sezar** | CyberChef: ROT13                                |
| `}galf{VC`                                       | **Teskari**       | `echo '...' \| rev`                             |
| `CV%7Bflag%7D`                                   | **URL kodlash**   | CyberChef: URL Decode                           |
| `01000011 01010110`                              | **Ikkilik**       | CyberChef: From Binary                          |
| `-.-. ...-`                                      | **Morze**         | CyberChef: From Morse Code                      |
| 32 hex belgi                                     | MD5 hash          | Ochilmaydi; faqat taxmin bilan solishtirish     |
| 64 hex belgi                                     | SHA-256 hash      | Ochilmaydi                                      |
| `$2b$12$...`                                     | bcrypt hash       | Ochilmaydi, juda sekin                          |
| `eyJ...` uch qism nuqta bilan                    | **JWT**           | Har bir qismi base64url — jwt.io yoki CyberChef |

**CyberChef** (gchq.github.io/CyberChef) — “oshxona”: chapdan amallarni sudrab olib kelasiz. **“Magic”** amali ko‘p kodlashlarni o‘zi taniydi.

Ko‘p qatlamli kodlash ham bo‘ladi: base64 ichida hex, uning ichida ROT13. Har bir qatlamdan keyin yana “bu nima?” deb so‘rang.

---

## 4. Web topshiriqlari uchun ro‘yxat

- [ ] Sahifa manbasi: HTML izohlar `<!-- -->`, yashirin maydonlar `type="hidden"`.
- [ ] `robots.txt`, `sitemap.xml`, `.well-known/`.
- [ ] DevTools → **Application**: cookie, localStorage — qiymatlar kodlanganmi?
- [ ] DevTools → **Network**: qaysi API’lar chaqiriladi, javobda ortiqcha ma’lumot bormi?
- [ ] URL parametrlari: `?id=5` ni `6` ga o‘zgartirsa nima bo‘ladi (faqat CTF serverida!)?
- [ ] JavaScript fayllari: izohlar, API kalitlari, yashirin yo‘llar.
- [ ] Javob sarlavhalari: `curl -i URL`.

## 5. Forensika uchun ro‘yxat

```sh
file noma’lum.bin               # fayl turi (kengaytmaga ishonmang)
strings fayl | grep -i cv{      # fayl ichidagi o‘qiladigan satrlar
exiftool rasm.jpg               # metama’lumot: muallif, sana, GPS
grep -E "Failed|Accepted" auth.log | head
awk '{print $1}' access.log | sort | uniq -c | sort -rn | head   # eng faol IP
```

Log tergovida **vaqt chizig‘i** tuzing: birinchi shubhali hodisa qachon, keyin nima bo‘ldi, hujumchi qaysi IP’dan kelgan.

---

## 6. Flagni yuborish

- Formatni aniq saqlang: katta-kichik harf, qavslar — `CV{...}`.
- Bo‘sh joy va qator oxiri belgisi ko‘chib qolmasin.
- Akademiyadagi CTF’larda **har bir o‘quvchining flagi boshqacha**. Do‘stingizning flagi sizda ishlamaydi va o‘qituvchi buni ko‘radi.
- Fayllarda **soxta flaglar** (decoy) bo‘ladi. “Qaysi biri haqiqiy?” — shartni qayta o‘qing.

---

## 7. Qoidalar va etika

1. **Faqat musobaqa doirasidagi tizimlarga** hujum qiling. Tashkilotchining serveri, boshqa ishtirokchilar va real saytlar — taqiqlangan.
2. Flaglarni boshqalarga bermang — bu sizning o‘rganishingizni ham buzadi.
3. Yechimni topgach, **write-up** yozing: nima qildingiz va nimani o‘rgandingiz. Bu eng yaxshi o‘rganish usuli va portfolio uchun ham foydali.
4. Real tizimda zaiflik topsangiz — uni ishlatmang, egasiga mas’uliyatli oshkor qilish tartibida xabar bering.

---

## 8. Keyingi qadamlar

- Akademiyadagi **00:17 CTF** — beshta topshiriqli hikoya.
- O‘quvchi kabinetidagi CTF’lar: DNS zonasi, HTTP izi, auth.log, server auditi.
- Mashq uchun ochiq platformalar: picoCTF (boshlovchilar uchun), OverTheWire Bandit (Linux), TryHackMe.

**Eng muhimi:** CTF’da yutish emas, har bir topshiriqdan bitta yangi narsa o‘rganish muhim.
