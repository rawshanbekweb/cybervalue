# Bash cheat-sheet: buyruqlar va ilk skriptlar

Cybervalue Akademiyasi · Linux · 1.0-versiya

Linux asoslari va Bash asoslari laboratoriyalari uchun yordamchi varaq. Har bir buyruqni avval o‘quv terminalida yoki o‘zingizning kompyuteringizda sinab ko‘ring.

---

## 1. Fayl tizimida harakatlanish

| Buyruq           | Vazifasi                                           |
| ---------------- | -------------------------------------------------- |
| `pwd`            | Hozir qaysi papkadaman                             |
| `ls` / `ls -la`  | Fayllar ro‘yxati / yashirinlari va huquqlari bilan |
| `cd papka`       | Papkaga kirish                                     |
| `cd ..`          | Bir pog‘ona yuqoriga                               |
| `cd ~` yoki `cd` | Uy papkasiga                                       |
| `cd -`           | Oldingi papkaga qaytish                            |
| `tree -L 2`      | Papka tuzilishi (o‘rnatilgan bo‘lsa)               |

**Yo‘llar:** `/etc/passwd` — absolyut (ildizdan), `../logs/app.log` — nisbiy (hozirgi joydan). `.` — hozirgi papka, `~` — uy papkasi.

---

## 2. Fayllar bilan ishlash

| Buyruq                                | Vazifasi                                               |
| ------------------------------------- | ------------------------------------------------------ |
| `touch fayl.txt`                      | Bo‘sh fayl yaratish                                    |
| `mkdir -p a/b/c`                      | Ichma-ich papkalar yaratish                            |
| `cp manba nusxa`                      | Nusxalash (`-r` — papka bilan)                         |
| `mv eski yangi`                       | Ko‘chirish yoki nomini o‘zgartirish                    |
| `rm fayl`                             | O‘chirish — **qaytarib bo‘lmaydi**, savat yo‘q         |
| `rm -r papka`                         | Papkani ichidagilari bilan o‘chirish — ehtiyot bo‘ling |
| `cat fayl`                            | Butun faylni chiqarish                                 |
| `less fayl`                           | Sahifalab o‘qish (`q` — chiqish, `/so‘z` — qidirish)   |
| `head -n 20 fayl` / `tail -n 20 fayl` | Boshidan / oxiridan 20 qator                           |
| `tail -f /var/log/syslog`             | Logni jonli kuzatish                                   |
| `wc -l fayl`                          | Qatorlar soni                                          |

---

## 3. Qidirish va filtrlash

| Buyruq                              | Vazifasi                                                                     |
| ----------------------------------- | ---------------------------------------------------------------------------- |
| `grep "Failed" auth.log`            | Matnli qatorlarni topish                                                     |
| `grep -i` / `-v` / `-c` / `-n`      | Katta-kichik harfga qaramay / mos kelmaydiganlar / soni / qator raqami bilan |
| `grep -r "parol" .`                 | Papka ichida rekursiv qidirish                                               |
| `find / -name "*.conf" 2>/dev/null` | Nomi bo‘yicha fayl topish (xatolarni yashirib)                               |
| `find . -type f -mtime -1`          | Oxirgi 24 soatda o‘zgargan fayllar                                           |
| `sort` / `uniq -c`                  | Saralash / takrorlarni sanash                                                |
| `cut -d: -f1 /etc/passwd`           | `:` bilan ajratilgan 1-ustun                                                 |
| `awk '{print $1}'`                  | Bo‘shliq bilan ajratilgan 1-ustun                                            |

### Quvur (`|`) — buyruqlarni zanjir qilish

```sh
# auth.log’da muvaffaqiyatsiz kirishlar eng ko‘p bo‘lgan 5 ta IP:
grep "Failed password" auth.log | awk '{print $(NF-3)}' | sort | uniq -c | sort -rn | head -5
```

Ustun raqami log formatiga bog‘liq — avval `head` bilan bir necha qatorni ko‘rib, qaysi ustunda IP turganini aniqlang.

### Yo‘naltirish

| Belgi         | Ma’nosi                                         |
| ------------- | ----------------------------------------------- |
| `>`           | Natijani faylga yozish (eskisini **o‘chiradi**) |
| `>>`          | Fayl oxiriga qo‘shish                           |
| `2>`          | Xatolarni faylga yozish                         |
| `2>/dev/null` | Xatolarni tashlab yuborish                      |
| `&>`          | Natija va xatolarni birga                       |

---

## 4. Huquqlar

```
-rwxr-x---  1 ali  dev  1024  okt 22  skript.sh
 │└┬┘└┬┘└┬┘
 │ │  │  └─ boshqalar (others): ---
 │ │  └──── guruh (group):      r-x
 │ └─────── egasi (user):       rwx
 └───────── turi: - fayl, d papka, l havola
```

| Harf | Raqam | Faylda          | Papkada                   |
| ---- | ----- | --------------- | ------------------------- |
| `r`  | 4     | o‘qish          | ro‘yxatni ko‘rish         |
| `w`  | 2     | yozish          | ichida yaratish/o‘chirish |
| `x`  | 1     | ishga tushirish | ichiga kirish             |

| Buyruq                 | Natija                              |
| ---------------------- | ----------------------------------- |
| `chmod 755 skript.sh`  | `rwxr-xr-x`                         |
| `chmod 600 maxfiy.key` | `rw-------` — faqat egasi           |
| `chmod +x skript.sh`   | Ishga tushirish huquqini qo‘shish   |
| `chown ali:dev fayl`   | Egasi va guruhini o‘zgartirish      |
| `sudo buyruq`          | Administrator huquqi bilan bajarish |

**Xavfsizlik:** `chmod 777` deyarli hech qachon to‘g‘ri yechim emas — bu “hamma hamma narsani qila oladi” degani. SSH kalitlari `600`, `.ssh` papkasi `700` bo‘lishi kerak.

---

## 5. Jarayonlar va tizim

| Buyruq                     | Vazifasi                        |
| -------------------------- | ------------------------------- |
| `ps aux`                   | Barcha jarayonlar               |
| `top` / `htop`             | Jonli monitoring                |
| `kill PID` / `kill -9 PID` | Jarayonni to‘xtatish / majburan |
| `df -h` / `du -sh *`       | Disk joyi / papkalar hajmi      |
| `free -h`                  | Xotira                          |
| `whoami` / `id`            | Men kimman / guruhlarim         |
| `uname -a`                 | Tizim haqida                    |
| `history`                  | Oldingi buyruqlar               |
| `man buyruq`               | Qo‘llanma (`q` — chiqish)       |

### Tarmoq

| Buyruq                 | Vazifasi                                        |
| ---------------------- | ----------------------------------------------- |
| `ip addr` / `ip route` | Manzillar / yo‘nalishlar                        |
| `ping -c 4 host`       | Ulanishni tekshirish                            |
| `ss -tulpn`            | Qaysi portlar ochiq va qaysi dastur tinglayapti |
| `curl -I URL`          | HTTP sarlavhalarini olish                       |
| `dig cybervalue.uz`    | DNS so‘rovi                                     |

---

## 6. Bash skript asoslari

```bash
#!/usr/bin/env bash
set -euo pipefail          # xatoda to‘xtash, e’lon qilinmagan o‘zgaruvchi — xato

ism="Aziza"                # = atrofida bo‘sh joy YO‘Q
echo "Salom, $ism!"
echo "Bugun: $(date +%F)"  # buyruq natijasini ishlatish
```

Ishga tushirish: `chmod +x salom.sh && ./salom.sh`

### O‘zgaruvchilar va argumentlar

| Yozuv      | Ma’nosi                                                                                                                        |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `$1`, `$2` | 1-, 2-argument                                                                                                                 |
| `$#`       | Argumentlar soni                                                                                                               |
| `$@`       | Barcha argumentlar                                                                                                             |
| `$?`       | Oxirgi buyruqning chiqish kodi (0 — muvaffaqiyat)                                                                              |
| `"$nom"`   | O‘zgaruvchini **doim qo‘shtirnoqda** yozing — bo‘sh joyli qiymatlar buzilmaydi. Nomida faqat lotin harfi, raqam va `_` bo‘ladi |

### Shart

```bash
if [[ -f "$1" ]]; then
  echo "Fayl bor"
elif [[ -d "$1" ]]; then
  echo "Bu papka"
else
  echo "Topilmadi" >&2
  exit 1
fi
```

| Tekshiruv                          | Ma’nosi                               |
| ---------------------------------- | ------------------------------------- |
| `-f fayl` / `-d papka` / `-e yo‘l` | Fayl / papka / har qanday narsa bormi |
| `-z "$s"` / `-n "$s"`              | Satr bo‘sh / bo‘sh emas               |
| `"$a" == "$b"`                     | Satrlar teng                          |
| `$a -eq $b`, `-lt`, `-gt`          | Sonlar: teng, kichik, katta           |

### Sikllar

```bash
for f in *.log; do
  echo "$f: $(wc -l < "$f") qator"
done

i=1
while (( i <= 5 )); do
  echo "Aylanish $i"
  (( i++ ))                # ++ unutilsa — cheksiz sikl!
done

while read -r qator; do
  echo "→ $qator"
done < ro‘yxat.txt
```

### Funksiya

```bash
tekshir() {
  local host="$1"
  if ping -c 1 -W 1 "$host" &>/dev/null; then
    echo "$host: ishlayapti"
  else
    echo "$host: javob yo‘q"
  fi
}
tekshir 192.168.1.1
```

---

## 7. Amaliy misol: kirish jurnalini tahlil qilish

```bash
#!/usr/bin/env bash
# Foydalanish: ./tahlil.sh auth.log
set -euo pipefail
log="${1:?Log faylini ko‘rsating}"

echo "Muvaffaqiyatsiz urinishlar: $(grep -c 'Failed password' "$log")"
echo "Muvaffaqiyatli kirishlar:  $(grep -c 'Accepted' "$log")"
echo "Eng faol 5 ta IP:"
grep 'Failed password' "$log" \
  | grep -oE '([0-9]{1,3}\.){3}[0-9]{1,3}' \
  | sort | uniq -c | sort -rn | head -5
```

---

## 8. Klaviatura yorliqlari

| Tugma               | Vazifasi                        |
| ------------------- | ------------------------------- |
| `Tab`               | Nomni avtomatik to‘ldirish      |
| `↑` / `↓`           | Oldingi buyruqlar               |
| `Ctrl+C`            | Ishlayotgan buyruqni to‘xtatish |
| `Ctrl+R`            | Tarixdan qidirish               |
| `Ctrl+L`            | Ekranni tozalash                |
| `Ctrl+A` / `Ctrl+E` | Qator boshiga / oxiriga         |

---

**Esda tuting:** internetdan ko‘chirilgan buyruqni, ayniqsa `sudo`, `rm -rf` yoki `curl ... | bash` bo‘lsa, nima qilishini tushunmaguningizcha ishga tushirmang.
