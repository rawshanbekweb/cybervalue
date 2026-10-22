# IPv4 subnetting jadvali va tez hisoblash

Cybervalue Akademiyasi · Tarmoqlar · 1.0-versiya

IP manzillash laboratoriyasi bilan birga ishlatish uchun. Chop etib, test va mashqlarda yoningizda tuting.

---

## 1. Bit og‘irliklari

Har bir oktet — 8 bit, 0 dan 255 gacha.

| Bit              | 1   | 2   | 3   | 4   | 5   | 6   | 7   | 8   |
| ---------------- | --- | --- | --- | --- | --- | --- | --- | --- |
| Og‘irlik         | 128 | 64  | 32  | 16  | 8   | 4   | 2   | 1   |
| Chapdan yig‘indi | 128 | 192 | 224 | 240 | 248 | 252 | 254 | 255 |

“Chapdan yig‘indi” qatori — mask oktetida bo‘lishi mumkin bo‘lgan **barcha** qiymatlar: 0, 128, 192, 224, 240, 248, 252, 254, 255.

**Misol:** `200` = 128 + 64 + 8 → `11001000`.

---

## 2. Asosiy jadval

| Prefiks | Mask            | Blok hajmi*     | Manzillar  | Foydalanish mumkin bo‘lgan hostlar                |
| ------- | --------------- | --------------- | ---------- | ------------------------------------------------- |
| /8      | 255.0.0.0       | 256 (1-oktetda) | 16 777 216 | 16 777 214                                        |
| /16     | 255.255.0.0     | 256 (2-oktetda) | 65 536     | 65 534                                            |
| /20     | 255.255.240.0   | 16 (3-oktetda)  | 4 096      | 4 094                                             |
| /21     | 255.255.248.0   | 8 (3-oktetda)   | 2 048      | 2 046                                             |
| /22     | 255.255.252.0   | 4 (3-oktetda)   | 1 024      | 1 022                                             |
| /23     | 255.255.254.0   | 2 (3-oktetda)   | 512        | 510                                               |
| /24     | 255.255.255.0   | 256             | 256        | 254                                               |
| /25     | 255.255.255.128 | 128             | 128        | 126                                               |
| /26     | 255.255.255.192 | 64              | 64         | 62                                                |
| /27     | 255.255.255.224 | 32              | 32         | 30                                                |
| /28     | 255.255.255.240 | 16              | 16         | 14                                                |
| /29     | 255.255.255.248 | 8               | 8          | 6                                                 |
| /30     | 255.255.255.252 | 4               | 4          | 2                                                 |
| /31     | 255.255.255.254 | 2               | 2          | 2 (faqat ikki router orasidagi ulanish, RFC 3021) |
| /32     | 255.255.255.255 | 1               | 1          | 1 (bitta qurilma)                                 |

\* **Blok hajmi** = 256 − mask oktetining qiymati, “qiziq” oktetda (mask 255 ham, 0 ham bo‘lmagan oktetda).

**Formula:** hostlar = 2^(32 − prefiks) − 2. Ikkitasi band: **tarmoq manzili** (blok boshi) va **broadcast** (blok oxiri).

---

## 3. Tez hisoblash: blok usuli

**Savol:** `192.168.10.77/27` — tarmoq, broadcast va hostlar oralig‘i?

1. `/27` → mask `255.255.255.224` → blok hajmi **256 − 224 = 32**.
2. Bloklar: 0, 32, **64**, 96, 128, ... — 77 qaysi blokda? **64–95**.
3. Tarmoq manzili: **192.168.10.64**
4. Broadcast: **192.168.10.95**
5. Hostlar: **192.168.10.65 – 192.168.10.94** (30 ta)

**Savol:** `10.4.37.200/22` — tarmoq va broadcast?

1. `/22` → mask `255.255.252.0`, “qiziq” oktet — uchinchisi, blok hajmi **4**.
2. Uchinchi oktetdagi bloklar: ..., 32, **36**, 40 — 37 blok **36–39** da.
3. Tarmoq: **10.4.36.0**, broadcast: **10.4.39.255**, hostlar: 10.4.36.1 – 10.4.39.254.

---

## 4. Ikki manzil bir tarmoqdami?

Ikkala IP’ni mask bilan **AND** qiling: natijalar teng bo‘lsa — bir tarmoq.

|     | IP           | Mask /26        | Tarmoq       |
| --- | ------------ | --------------- | ------------ |
| A   | 192.168.1.50 | 255.255.255.192 | 192.168.1.0  |
| B   | 192.168.1.70 | 255.255.255.192 | 192.168.1.64 |

Natijalar har xil → **boshqa-boshqa tarmoq**. A dan B ga paket **default gateway** orqali boradi.

Tezroq yo‘l: blok hajmi 64 → bloklar 0–63 va 64–127. 50 va 70 boshqa bloklarda.

---

## 5. Kerakli o‘lchamni tanlash

“N ta qurilma uchun eng kichik subnet” — hostlar ustunidan N dan katta yoki teng birinchi qiymatni toping.

| Kerak                      | Tanlang        | Sabab    |
| -------------------------- | -------------- | -------- |
| 2 router orasidagi ulanish | /30 (yoki /31) | 2 host   |
| 5 ta kamera                | /29            | 6 host   |
| 25 kishilik sinf           | /27            | 30 host  |
| 50 ta noutbuk              | /26            | 62 host  |
| 200 ta qurilma             | /24            | 254 host |
| 300 ta qurilma             | /23            | 510 host |

Kelajakdagi o‘sish uchun odatda bir pog‘ona kattaroq zaxira qoldiriladi.

---

## 6. Maxsus manzillar

| Diapazon                                            | Vazifasi                                                          |
| --------------------------------------------------- | ----------------------------------------------------------------- |
| `10.0.0.0/8`                                        | Xususiy (private) tarmoq                                          |
| `172.16.0.0/12`                                     | Xususiy tarmoq (172.16.0.0 – 172.31.255.255)                      |
| `192.168.0.0/16`                                    | Xususiy tarmoq (uy va ofis routerlari)                            |
| `127.0.0.0/8`                                       | Loopback — kompyuterning o‘zi (`127.0.0.1`)                       |
| `169.254.0.0/16`                                    | Link-local: DHCP javob bermaganda qurilma o‘ziga beradigan manzil |
| `100.64.0.0/10`                                     | Provayderning umumiy NAT’i (CGNAT)                                |
| `0.0.0.0/0`                                         | Default route — “qolgan barcha manzillar”                         |
| `192.0.2.0/24`, `198.51.100.0/24`, `203.0.113.0/24` | Hujjat va misollar uchun ajratilgan                               |

Xususiy manzillar internetda yo‘naltirilmaydi; internetga NAT orqali chiqiladi.

---

## 7. Nosozlikni topish tartibi

1. **IP** to‘g‘rimi? `169.254.x.x` bo‘lsa — DHCP ishlamayapti.
2. **Mask** tarmoqdagi boshqalar bilan bir xilmi?
3. **Gateway** shu tarmoq ichidami va u yerda router bormi?
4. **DNS** ishlayaptimi? IP bo‘yicha ping o‘tib, nom bo‘yicha o‘tmasa — muammo DNS’da.
5. Ikki qurilmada bir xil IP yo‘qmi (IP to‘qnashuvi)?

```sh
ipconfig            # Windows: IP, mask, gateway
ip addr; ip route   # Linux
ping 192.168.1.1    # gateway javob beradimi
ping 8.8.8.8        # internetga IP orqali chiqish
nslookup cybervalue.uz   # DNS
tracert / traceroute 8.8.8.8   # paket qayerda to‘xtaydi
```

---

## 8. Mashq

1. `172.16.5.130/25` — tarmoq va broadcast?
2. `192.168.0.14/28` va `192.168.0.17/28` bir tarmoqdami?
3. 60 ta qurilma uchun eng kichik subnet?
4. `10.10.10.10/30` dagi ikkinchi foydalanish mumkin bo‘lgan host?

<details>
<summary>Javoblar</summary>

1. Blok 128 → 128–255. Tarmoq `172.16.5.128`, broadcast `172.16.5.255`.
2. Blok 16 → 0–15 va 16–31. **Yo‘q**, boshqa tarmoqlar.
3. **/26** (62 host).
4. Blok 4 → 8–11. Hostlar .9 va .10 → ikkinchisi **10.10.10.10**.

</details>
