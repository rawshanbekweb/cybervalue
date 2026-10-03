# Linux va Tarmoq Asoslari: To'liq Boshlang'ich Darslik

Ushbu darslik ikki katta bo'limdan iborat:

1. **Linux fayl tizimi va asosiy buyruqlar**
2. **OSI/TCP-IP modellari, portlar, Wireshark va Nmap bilan birinchi tanishuv**

Har bir mavzu nazariya va amaliy mashq bilan beriladi. Terminalni ochib, misollarni birma-bir o'zingiz bajarib borishingiz tavsiya etiladi.

---

## QISM 1. Linux fayl tizimi va asosiy buyruqlar

### 1.1. Linux fayl tizimi qanday tuzilgan?

Windows'dan farqli o'laroq, Linux'da `C:\`, `D:\` kabi disklar yo'q. Bitta yagona ildiz (root) papka bor — u `/` belgisi bilan ko'rsatiladi. Barcha disklar, USB, tarmoq papkalari shu `/` ichiga "ulanadi" (mount qilinadi).

```text
/
├── bin      → asosiy dasturlarning bajariluvchi fayllari (ls, cp, cat...)
├── boot     → tizim yuklanishi uchun fayllar (kernel, GRUB)
├── dev      → qurilmalar (device) fayllari, masalan /dev/sda — disk
├── etc      → tizim va dasturlarning konfiguratsiya fayllari
├── home     → oddiy foydalanuvchilarning shaxsiy papkalari (/home/ali)
├── lib      → dasturlar uchun kutubxonalar (library)
├── media    → avtomatik ulangan USB, DVD va h.k.
├── mnt      → qo'lda ulangan (mount) disklar/tarmoq papkalari
├── opt      → qo'shimcha o'rnatilgan dasturlar
├── proc     → ishlayotgan jarayonlar haqida virtual ma'lumot
├── root     → root foydalanuvchining (administratorning) shaxsiy papkasi
├── sbin     → administrator uchun tizim buyruqlari
├── tmp      → vaqtinchalik fayllar (qayta yuklanganda tozalanadi)
├── usr      → foydalanuvchi dasturlari va ularning fayllari
└── var      → o'zgaruvchan ma'lumotlar: loglar, keshlar, navbatlar
```

> **Eslab qoling:**
>
> - `/home/<foydalanuvchi_nomi>` — sizning shaxsiy ish papkangiz (Windows'dagi `C:\Users\Ism` kabi);
> - `/etc` — deyarli har qanday dasturni sozlashda shu papkaga kirasiz;
> - `/var/log` — muammo yuzaga kelganda birinchi qaraladigan joy (log fayllar).

### 1.2. Navigatsiya buyruqlari

`pwd` — qayerda turganingizni ko'rsatadi

```bash
pwd
# /home/ali
```

`ls` — papka ichidagilarni ko'rsatadi

```bash
ls              # oddiy ro'yxat
ls -l           # batafsil (ruxsatlar, egasi, hajmi, sanasi)
ls -a           # yashirin fayllarni ham ko'rsatadi
ls -la          # ikkalasi birga
ls -lh          # hajmni odam o'qiy oladigan formatda (KB, MB, GB)
```

`cd` — papkalar orasida yurish (change directory)

```bash
cd Hujjatlar     # Hujjatlar papkasiga kirish
cd ..            # bir daraja yuqoriga chiqish
cd ../..         # ikki daraja yuqoriga
cd ~             # to'g'ridan-to'g'ri uy papkangizga (/home/siz)
cd /             # root papkaga
cd -             # oldingi turgan papkangizga qaytish
```

### 1.3. Fayl va papkalar bilan ishlash

`mkdir` — yangi papka yaratish

```bash
mkdir loyiha                    # bitta papka
mkdir -p loyiha/src/utils       # ichma-ich papkalar bir zumda (-p = parents)
```

`touch` — bo'sh fayl yaratish

```bash
touch malumot.txt
```

`rm` / `rmdir` — o'chirish

```bash
rm malumot.txt        # faylni o'chirish
rmdir bosh_papka      # FAQAT bo'sh papkani o'chiradi
rm -r loyiha          # papkani ichidagilar bilan o'chirish (recursive)
rm -rf loyiha         # majburiy, so'ramasdan o'chirish — EHTIYOT BO'LING!
```

> **DIQQAT:** `rm -rf` juda xavfli buyruq — o'chirilgan fayl "Savat"ga (Recycle Bin) tushmaydi, butunlay yo'qoladi. Buyruqni bosishdan oldin yo'lni (path) ikki marta tekshiring.

`cp` — nusxa ko'chirish

```bash
cp fayl.txt fayl_zaxira.txt         # faylni nusxalash
cp -r loyiha/ loyiha_zaxira/        # butun papkani nusxalash
```

`mv` — ko'chirish yoki nomini o'zgartirish

```bash
mv fayl.txt Hujjatlar/          # faylni boshqa papkaga ko'chirish
mv eski_nom.txt yangi_nom.txt   # faylni qayta nomlash
```

### 1.4. Fayl mazmunini ko'rish

`cat` — faylni to'liq ekranga chiqarish

```bash
cat malumot.txt
```

`less` — katta fayllarni sahifalab o'qish (chiqish uchun `q` bosing)

```bash
less katta_fayl.log
```

`head` / `tail` — faylning boshi yoki oxirini ko'rish

```bash
head -n 10 fayl.log      # birinchi 10 qator
tail -n 10 fayl.log      # oxirgi 10 qator
tail -f fayl.log         # faylga real vaqtda qo'shilayotgan qatorlarni kuzatish
```

### 1.5. Qidiruv buyruqlari

`find` — fayl/papka nomi bo'yicha qidirish

```bash
find /home -name "*.txt"          # /home ichida barcha .txt fayllarni topish
find . -type d -name "loyiha"     # joriy papkadan boshlab "loyiha" nomli papkani izlash
```

`grep` — fayl ichidagi matn (satr) bo'yicha qidirish

```bash
grep "xato" server.log            # "xato" so'zi bor qatorlarni ko'rsatadi
grep -i "xato" server.log         # katta-kichik harfga qaramasdan
grep -r "TODO" ./loyiha           # papka ichidagi barcha fayllardan qidirish
```

### 1.6. Ruxsatlar haqida qisqacha

```bash
ls -l fayl.txt
# -rw-r--r-- 1 ali ali 1024 Avg 29 12:00 fayl.txt
```

`rwx` — o'qish (read), yozish (write), bajarish (execute). Uch guruhga tegishli: egasi / guruh / boshqalar.

```bash
chmod +x skript.sh      # bajarish huquqini qo'shish
chmod 755 skript.sh     # egasi: rwx, guruh: r-x, boshqalar: r-x
chown ali:ali fayl.txt  # faylning egasi va guruhini o'zgartirish
```

### 1.7. Amaliy mashq — Qism 1

Terminalni oching va quyidagilarni ketma-ket bajaring:

```bash
cd ~
mkdir -p mashq/papka1/papka2
cd mashq
touch fayl1.txt fayl2.txt
echo "Bu birinchi qator" > fayl1.txt
echo "Bu ikkinchi qator" >> fayl1.txt
cat fayl1.txt
ls -la
cp fayl1.txt fayl1_zaxira.txt
mv fayl2.txt papka1/
find . -name "*.txt"
grep "birinchi" fayl1.txt
```

> **SAVOL O'ZINGIZGA:** `>` va `>>` orasidagi farqni angladingizmi?
> (`>` faylni qayta yozadi, `>>` oxiriga qo'shadi.)
> Buni sinab ko'ring: `echo "Uchinchi" > fayl1.txt` deb yozib, `cat fayl1.txt` bilan tekshiring.

---

## QISM 2. OSI va TCP/IP modellari, portlar

### 2.1. Nega umuman "model" kerak?

Internet — bu millionlab turli qurilma (kompyuter, telefon, router) bir-biri bilan gaplashadigan tizim. Ular normal ishlashi uchun umumiy qoidalar (protokollar) kerak. OSI va TCP/IP — bu qoidalarni tushunish uchun tuzilgan qatlamli modellar.

### 2.2. OSI modeli (7 qatlam)

| #   | Qatlam                  | Vazifasi                                 | Misol                 |
| --- | ----------------------- | ---------------------------------------- | --------------------- |
| 7   | Application (Ilova)     | Foydalanuvchi bilan bevosita ishlaydi    | HTTP, FTP, DNS        |
| 6   | Presentation (Taqdimot) | Ma'lumotni shifrlash/formatlash          | SSL/TLS, JPEG         |
| 5   | Session (Sessiya)       | Aloqani boshlash/tugatish                | Login sessiyalari     |
| 4   | Transport (Tashish)     | Ma'lumotni ishonchli yetkazish, portlar  | TCP, UDP              |
| 3   | Network (Tarmoq)        | Manzillash va yo'nalish topish (routing) | IP, ICMP              |
| 2   | Data Link (Kanal)       | Bir qurilmadan qo'shnisiga uzatish       | Ethernet, Wi-Fi (MAC) |
| 1   | Physical (Jismoniy)     | Elektr signal, kabel, radio to'lqin      | Kabel, optik tola     |

> **Eslab qolish uchun mnemonika (pastdan yuqoriga):** Physical → Data Link → Network → Transport → Session → Presentation → Application — _"Please Do Not Throw Sausage Pizza Away"_.

### 2.3. TCP/IP modeli (4 qatlam) — amalda ishlatiladigani

OSI ko'proq o'qitish uchun nazariy model. Amalda internet TCP/IP modeli asosida ishlaydi:

| TCP/IP qatlami | OSI'dagi mos qatlamlar               | Misol protokollar          |
| -------------- | ------------------------------------ | -------------------------- |
| Application    | Application + Presentation + Session | HTTP, HTTPS, DNS, SSH, FTP |
| Transport      | Transport                            | TCP, UDP                   |
| Internet       | Network                              | IP, ICMP                   |
| Network Access | Data Link + Physical                 | Ethernet, Wi-Fi            |

### 2.4. Paket qanday yuboriladi? (Encapsulation)

Tasavvur qiling: siz do'stingizga xat yubormoqchisiz.

- **Application qatlami:** Xat matnini yozasiz ("Salom, qalaysan?") — bu sizning ma'lumotingiz (data).
- **Transport qatlami (TCP):** Xatni konvertga solasiz va konvertga "1-varaq, 2-varaqdan" deb raqam qo'yasiz — bu port raqami va ketma-ketlik ma'lumoti qo'shiladi. Endi bu **segment**.
- **Internet qatlami (IP):** Konvertga jo'natuvchi va qabul qiluvchi manzilini (IP manzil) yozasiz. Endi bu **paket**.
- **Network Access qatlami:** Konvertni pochta mashinasiga (Ethernet/Wi-Fi orqali, MAC manzil bilan) yuklaysiz. Endi bu **freym (frame)**.
- Freym jismoniy kanal (kabel/havo) orqali jo'natiladi.

Qabul qiluvchi tomonda bu jarayon teskari tartibda (decapsulation) — konvertlar birma-bir ochilib, oxirida asl xat o'qiladi.

```text
Sizning ma'lumotingiz
  + TCP sarlavha (port)         -> Segment
  + IP sarlavha (IP manzil)     -> Paket
  + Ethernet sarlavha (MAC)     -> Freym
  -> jismoniy kanal orqali yuboriladi
```

### 2.5. IP manzil vs MAC manzil

| Xususiyat        | IP manzil                                   | MAC manzil                                           |
| ---------------- | ------------------------------------------- | ---------------------------------------------------- |
| **Nima uchun**   | Internet bo'ylab qayerga yetkazishni bilish | Lokal tarmoqda qaysi qurilmaga yetkazishni bilish    |
| **Misol**        | 192.168.1.10                                | A4:5E:60:B1:2C:3D                                    |
| **O'zgaradimi?** | Ha, tarmoqqa qarab o'zgaradi                | Yo'q, tarmoq kartasiga "kuydirilgan" (odatda doimiy) |
| **Solishtirish** | Uy manzili (shahar, ko'cha)                 | Uyning eshik raqami                                  |

### 2.6. TCP vs UDP

| Xususiyat              | TCP                                                              | UDP                                        |
| ---------------------- | ---------------------------------------------------------------- | ------------------------------------------ |
| **Ishonchlilik**       | Yuqori — yetib borganini tasdiqlaydi, xato bo'lsa qayta yuboradi | Yo'q — "otib yuboradi", tasdiq kutmaydi    |
| **Tezlik**             | Sekinroq (qo'shimcha tekshiruvlar tufayli)                       | Tezroq                                     |
| **Ulanish**            | Avval "qo'l siqishuv" (3-way handshake) qiladi                   | Ulanishsiz, to'g'ridan-to'g'ri yuboradi    |
| **Qachon ishlatiladi** | Veb-sayt (HTTP), fayl yuklash, email                             | Video/audio striming, onlayn o'yinlar, DNS |

### 2.7. Portlar nima?

**IP manzil** — qaysi kompyuterga borishini ko'rsatadi. **Port** esa — o'sha kompyuterdagi qaysi dasturga/xizmatga borishini ko'rsatadi.

> Analogiya: IP manzil — bu ko'p qavatli bino manzili. Port — o'sha binodagi xona raqami.

Eng ko'p ishlatiladigan (well-known) portlar:

| Port  | Protokol/Xizmat                         |
| ----- | --------------------------------------- |
| 20/21 | FTP (fayl uzatish)                      |
| 22    | SSH (masofadan xavfsiz boshqarish)      |
| 23    | Telnet (eski, shifrsiz)                 |
| 25    | SMTP (email yuborish)                   |
| 53    | DNS (domen nomlarini IP'ga aylantirish) |
| 80    | HTTP (veb-sayt, shifrlanmagan)          |
| 443   | HTTPS (veb-sayt, shifrlangan)           |
| 3306  | MySQL (ma'lumotlar bazasi)              |
| 3389  | RDP (Windows masofaviy ish stoli)       |

Portlar `0–65535` oralig'ida bo'ladi:

- `0–1023` — "well-known" (tizim xizmatlari uchun ajratilgan)
- `1024–49151` — ro'yxatga olingan
- `49152–65535` — dinamik/vaqtinchalik.

### 2.8. Wireshark bilan birinchi tanishuv

**Wireshark** — tarmoqdagi paketlarni "ushlab", ichini ko'rish imkonini beruvchi dastur (packet sniffer). U orqali OSI qatlamlarini jonli ko'rish mumkin.

O'rnatish (Ubuntu/Debian):

```bash
sudo apt update
sudo apt install wireshark
```

**Ishlatish tartibi:**

1. Wireshark'ni oching (administrator huquqi kerak bo'lishi mumkin).
2. Tarmoq interfeysini tanlang (masalan `eth0` yoki `wlan0`).
3. "Start capturing" tugmasini bosing — paketlar oqib kela boshlaydi.
4. Filtrlar yordamida faqat kerakli trafikni ko'rasiz:

```bash
http                    # faqat HTTP trafik
tcp.port == 443         # 443-portdagi trafik (HTTPS)
ip.addr == 192.168.1.1  # shu IP bilan bog'liq barcha paketlar
dns                     # faqat DNS so'rovlari
```

Har bir paketni bosganda, pastki oynada uning qatlamlari ko'rinadi: `Frame → Ethernet → IP → TCP/UDP → Application data` — xuddi yuqorida gaplashgan encapsulation'ning o'zi, lekin jonli ko'rinishda!

> **MASLAHAT:** Birinchi mashq: brauzeringizda biror sayt oching va Wireshark'da "http" yoki "tls" filtri bilan qanday paketlar ketayotganini kuzating.

### 2.9. Nmap bilan birinchi tanishuv

**Nmap** (Network Mapper) — tarmoqdagi qurilmalarni topish, ularda qaysi portlar ochiqligini va qaysi xizmatlar ishlab turganini aniqlash uchun ishlatiladigan vosita.

> **DIQQAT:** Nmap'ni faqat o'zingizga tegishli tarmoqda yoki skanerlashga ruxsat berilgan tizimlarda ishlating (masalan, o'zingizning kompyuteringiz, uy routeringiz, yoki maxsus o'quv platformalari — TryHackMe, HackTheBox kabi). Ruxsatsiz begona tarmoq yoki serverni skanerlash ko'plab davlatlarda qonunga xilof hisoblanadi.

O'rnatish:

```bash
sudo apt install nmap
```

Asosiy buyruqlar:

```bash
nmap 192.168.1.1              # oddiy skan — ochiq portlarni ko'rsatadi
nmap localhost                # o'z kompyuteringizni skanerlash (xavfsiz mashq uchun)
nmap -sV 192.168.1.1          # xizmat va versiyani aniqlash
```

**`nmap -sV` nima qiladi?**

- `-s` — skan turi (scan)
- `V` — Version detection (versiyani aniqlash)

Oddiy nmap faqat "22-port ochiq" deydi. `-sV` esa qo'shimcha so'rovlar yuborib, "22-port ochiq, u yerda OpenSSH 8.9 ishlayapti" kabi aniqroq ma'lumot beradi.

Natija taxminan shunday ko'rinadi:

```text
PORT     STATE  SERVICE  VERSION
22/tcp   open   ssh      OpenSSH 8.9p1
80/tcp   open   http     nginx 1.24.0
443/tcp  open   https    nginx 1.24.0
```

Ko'proq foydali parametrlar:

```bash
nmap -p 1-1000 192.168.1.1     # faqat 1-1000 oralig'idagi portlarni tekshirish
nmap -p 80,443 192.168.1.1     # faqat ko'rsatilgan portlarni tekshirish
nmap -A 192.168.1.1            # to'liq aniqlash (OS, versiya, skript, traceroute)
nmap -sn 192.168.1.0/24        # tarmoqdagi qaysi qurilmalar "tirik" (yoqiq) ekanini topish, portlarsiz
```

### 2.10. Amaliy mashq — Qism 2

- **Wireshark:** Dasturni oching, `wlan0` yoki `eth0` interfeysida capture boshlang. Brauzerda example.com saytini oching. Filtrga "http or tls" yozing va nechta paket ketganini, IP manzillarni ko'ring.
- **Nmap:** Faqat o'zingizning kompyuteringizda sinab ko'ring:
  ```bash
  nmap -sV localhost
  ```
  Natijada qanday portlar ochiq ekanini va ularda qanday xizmatlar ishlayotganini yozib qo'ying.
- **Birlashtirib ko'rish:** Wireshark'ni yoqib turgan holda, boshqa terminalda `nmap -sV localhost` buyrug'ini ishga tushiring va Wireshark'da qanday paketlar oqib o'tayotganini kuzating — bu sizga nmap "orqa fonda" nima qilayotganini jonli ko'rsatadi.

---

### Keyingi qadamlar

Ushbu ikki mavzuni mustahkamlagandan so'ng, quyidagi yo'nalishlarda davom etishingiz mumkin:

- **Linux:** foydalanuvchi va guruhlarni boshqarish (`useradd`, `passwd`), jarayonlar (`ps`, `top`, `kill`), paket menejerlari (`apt`, `dpkg`)
- **Tarmoq:** subnetting va IP manzillash, `ping`/`traceroute`/`netstat`/`ss` buyruqlari, firewall (`ufw`, `iptables`)
- **Xavfsizlik:** Nmap'ning boshqa skan turlari (`-sS`, `-sU`), TryHackMe yoki HackTheBox'dagi qonuniy o'quv laboratoriyalari

> Har bir mavzuni terminalda qo'lda sinab ko'rish — eng samarali o'rganish usuli. Omad!
