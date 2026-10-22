# Kiberxavfsizlik lug‘ati: o‘zbekcha–inglizcha

Cybervalue Akademiyasi · Kiberxavfsizlik asoslari · 1.0-versiya

Darslarda, maqolalarda va xalqaro manbalarda uchraydigan asosiy atamalar. Inglizcha nomi qavs ichida — chunki qidiruv va hujjatlarda aynan shunday uchraydi.

---

## Asosiy tushunchalar

| Atama                  | Inglizcha        | Ma’nosi                                                                  |
| ---------------------- | ---------------- | ------------------------------------------------------------------------ |
| **CIA uchligi**        | CIA triad        | Xavfsizlikning uch maqsadi: maxfiylik, yaxlitlik, foydalanish imkoniyati |
| Maxfiylik              | Confidentiality  | Ma’lumotni faqat ruxsati borlar ko‘radi                                  |
| Yaxlitlik              | Integrity        | Ma’lumot ruxsatsiz o‘zgartirilmaydi                                      |
| Foydalanish imkoniyati | Availability     | Tizim kerak bo‘lganda ishlaydi                                           |
| Zaiflik                | Vulnerability    | Tizimdagi kamchilik, undan foydalanib zarar yetkazish mumkin             |
| Tahdid                 | Threat           | Zarar yetkazishi mumkin bo‘lgan narsa yoki shaxs                         |
| Xavf                   | Risk             | Tahdid zaiflikdan foydalanish ehtimoli × zarar hajmi                     |
| Ekspluatatsiya         | Exploit          | Zaiflikdan foydalanadigan kod yoki usul                                  |
| Hujum yuzasi           | Attack surface   | Tizimga hujum qilish mumkin bo‘lgan barcha nuqtalar                      |
| Eng kam imtiyoz        | Least privilege  | Har kimga faqat ishiga kerakli huquqni berish                            |
| Ko‘p qatlamli himoya   | Defense in depth | Bitta emas, bir nechta himoya qatlami                                    |
| Nol ishonch            | Zero trust       | Hech kimga avtomatik ishonmaslik, har bir so‘rovni tekshirish            |
| Hodisa                 | Incident         | Xavfsizlik buzilgan yoki buzilgan bo‘lishi mumkin bo‘lgan voqea          |

## Kirish va identifikatsiya

| Atama                           | Inglizcha        | Ma’nosi                                               |
| ------------------------------- | ---------------- | ----------------------------------------------------- |
| Autentifikatsiya                | Authentication   | “Siz kimsiz?” — shaxsni tasdiqlash                    |
| Avtorizatsiya                   | Authorization    | “Sizga nima mumkin?” — ruxsatni tekshirish            |
| Ko‘p bosqichli autentifikatsiya | MFA / 2FA        | Paroldan tashqari yana bir isbot                      |
| Bir martalik parol              | OTP              | Bir marta ishlaydigan kod                             |
| Sessiya                         | Session          | Tizimga kirgandan keyin sizni “eslab qoladigan” holat |
| Token                           | Token            | Kirish huquqini bildiruvchi qator (masalan, JWT)      |
| Parol menejeri                  | Password manager | Parollarni shifrlab saqlaydigan dastur                |
| Passkey                         | Passkey          | Parolsiz, fishingga chidamli kirish usuli             |

## Hujum turlari

| Atama                        | Inglizcha                | Ma’nosi                                                      |
| ---------------------------- | ------------------------ | ------------------------------------------------------------ |
| Fishing                      | Phishing                 | Aldov xabar orqali parol yoki ma’lumot olish                 |
| Nishonli fishing             | Spear phishing           | Aniq bir odamga moslab tayyorlangan fishing                  |
| Ijtimoiy muhandislik         | Social engineering       | Texnika emas, odamni aldash                                  |
| Zararli dastur               | Malware                  | Zarar yetkazuvchi har qanday dastur                          |
| To‘lov talab qiluvchi dastur | Ransomware               | Fayllarni shifrlab, pul talab qiladi                         |
| Troyan                       | Trojan                   | Foydali dastur niqobidagi zararli dastur                     |
| Josus dastur                 | Spyware                  | Yashirincha ma’lumot yig‘adi                                 |
| Klaviatura josusi            | Keylogger                | Bosilgan tugmalarni yozib oladi                              |
| Botnet                       | Botnet                   | Hujumchi boshqaradigan zararlangan qurilmalar tarmog‘i       |
| Xizmatdan voz kechish hujumi | DoS / DDoS               | Tizimni so‘rovlar bilan to‘ldirib ishdan chiqarish           |
| O‘rtadagi odam               | Man-in-the-middle (MITM) | Ikki tomon orasidagi aloqani tinglash yoki o‘zgartirish      |
| Brute force                  | Brute force              | Barcha variantlarni ketma-ket sinash                         |
| Lug‘at hujumi                | Dictionary attack        | Mashhur parollar ro‘yxatini sinash                           |
| Credential stuffing          | Credential stuffing      | Sizib chiqqan login-parollarni boshqa saytlarda sinash       |
| Nol kunlik zaiflik           | Zero-day                 | Ishlab chiqaruvchiga hali noma’lum yoki tuzatilmagan zaiflik |

## Veb xavfsizlik

| Atama                                    | Inglizcha                     | Ma’nosi                                                      |
| ---------------------------------------- | ----------------------------- | ------------------------------------------------------------ |
| SQL in’ektsiya                           | SQL injection (SQLi)          | Kiritilgan matn SQL buyrug‘iga aylanib qoladi                |
| Saytlararo skript                        | Cross-site scripting (XSS)    | Sahifaga begona JavaScript joylashtiriladi                   |
| Saytlararo so‘rov soxtalashtirish        | CSRF                          | Foydalanuvchi nomidan u bilmagan so‘rov yuboriladi           |
| To‘g‘ridan-to‘g‘ri obyektga havola       | IDOR                          | ID ni o‘zgartirib, birovning ma’lumotini ochish              |
| Server tomonidagi so‘rov soxtalashtirish | SSRF                          | Serverni ichki manzilga so‘rov yuborishga majburlash         |
| Bir xil manba siyosati                   | Same-origin policy            | Brauzer boshqa saytning ma’lumotini JavaScript’ga o‘qitmaydi |
| CORS                                     | Cross-Origin Resource Sharing | Server boshqa saytga ruxsat beradigan qoidalar               |
| Kontent xavfsizlik siyosati              | Content Security Policy (CSP) | Qaysi skript va manbalar yuklanishini cheklaydi              |
| Ekranlash                                | Escaping                      | Maxsus belgilarni xavfsiz ko‘rinishga o‘tkazish              |
| Parametrli so‘rov                        | Prepared statement            | Buyruq va ma’lumotni ajratib yuborish                        |

## Kriptografiya

| Atama                | Inglizcha                  | Ma’nosi                                                                 |
| -------------------- | -------------------------- | ----------------------------------------------------------------------- |
| Kodlash              | Encoding                   | Ma’lumot ko‘rinishini o‘zgartirish, **kalitsiz** ochiladi (base64, hex) |
| Shifrlash            | Encryption                 | Faqat **kalit** bilan ochiladigan ko‘rinishga o‘tkazish                 |
| Simmetrik shifrlash  | Symmetric encryption       | Bitta kalit bilan shifrlanadi va ochiladi (AES)                         |
| Asimmetrik shifrlash | Asymmetric encryption      | Ochiq va yopiq kalitlar juftligi (RSA, ECC)                             |
| Hash                 | Hash                       | Bir tomonlama “barmoq izi”, orqaga ochilmaydi (SHA-256)                 |
| Tuz                  | Salt                       | Parol hashiga qo‘shiladigan tasodifiy qiymat                            |
| Raqamli imzo         | Digital signature          | Kim yuborganini va o‘zgarmaganini isbotlaydi                            |
| Sertifikat           | Certificate                | Sayt kalitining egasi kimligini tasdiqlovchi hujjat                     |
| Sertifikat markazi   | Certificate Authority (CA) | Sertifikatlarni imzolovchi ishonchli tashkilot                          |
| TLS                  | Transport Layer Security   | HTTPS ortidagi shifrlash protokoli                                      |

## Tarmoq

| Atama              | Inglizcha               | Ma’nosi                                                            |
| ------------------ | ----------------------- | ------------------------------------------------------------------ |
| IP manzil          | IP address              | Tarmoqdagi qurilma manzili                                         |
| Subnet mask        | Subnet mask             | Manzilning qaysi qismi tarmoqni bildirishini ko‘rsatadi            |
| Shlyuz             | Default gateway         | Boshqa tarmoqqa chiqish eshigi (router)                            |
| DNS                | Domain Name System      | Domen nomini IP manzilga aylantiradi                               |
| DHCP               | DHCP                    | Qurilmalarga avtomatik IP beradi                                   |
| NAT                | NAT                     | Ko‘p xususiy manzilni bitta ommaviy manzilga almashtiradi          |
| Port               | Port                    | Bitta qurilmadagi xizmat raqami (80 — HTTP, 443 — HTTPS, 22 — SSH) |
| Tarmoqlararo ekran | Firewall                | Trafikni qoidalar bo‘yicha o‘tkazadi yoki to‘xtatadi               |
| VPN                | Virtual Private Network | Shifrlangan tunnel orqali ulanish                                  |

## Himoya va tergov

| Atama                             | Inglizcha                     | Ma’nosi                                                  |
| --------------------------------- | ----------------------------- | -------------------------------------------------------- |
| Zaiflikni tuzatish                | Patch                         | Xatoni yopuvchi yangilanish                              |
| Kirish testi                      | Penetration testing (pentest) | **Ruxsat bilan** tizimga hujum qilib zaifliklarni topish |
| Qizil jamoa                       | Red team                      | Hujumchini taqlid qiluvchi jamoa                         |
| Ko‘k jamoa                        | Blue team                     | Himoya qiluvchi jamoa                                    |
| Xavfsizlik operatsiyalari markazi | SOC                           | Tahdidlarni kecha-kunduz kuzatuvchi bo‘lim               |
| SIEM                              | SIEM                          | Loglarni yig‘ib, tahlil qiluvchi tizim                   |
| Kompromat belgisi                 | Indicator of compromise (IOC) | Buzilganlik belgisi: shubhali IP, fayl hashi, domen      |
| Raqamli kriminalistika            | Digital forensics             | Raqamli dalillarni to‘plash va tahlil qilish             |
| Ochiq manbalardan razvedka        | OSINT                         | Ochiq ma’lumotlardan ma’lumot yig‘ish                    |
| Zaxira nusxa                      | Backup                        | Ma’lumotning tiklash uchun saqlangan nusxasi             |
| CTF                               | Capture the Flag              | “Bayroqni qo‘lga kiriting” — xavfsizlik musobaqasi       |
| Mas’uliyatli oshkor qilish        | Responsible disclosure        | Topilgan zaiflikni avval egasiga maxfiy xabar qilish     |

---

**Etika eslatmasi:** “xaker” so‘zi o‘zi yomon emas. Farq — **ruxsatda**. Ruxsat bilan sinovchi — mutaxassis, ruxsatsiz kiruvchi — huquqbuzar.
