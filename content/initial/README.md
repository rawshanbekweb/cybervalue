# CyberValue boshlang‘ich kontenti

Ingliz tilidagi 11 ta material: 3 loyiha tavsifi, 2 laboratoriya yo‘riqnomasi,
3 o‘quv maqolasi va 3 yuklab olinadigan Markdown qo‘llanmasi.

Loyiha tavsiflari mavjud repozitoriyga asoslangan. Laboratoriya yozuvlari ichki
o‘quv muhitining ishlashi va mashq tartibini tushuntiradi. CTF ishtiroki, sovrinlar,
mijoz natijalari yoki tashqi tizimlardagi topilmalar haqida da’volar qo‘shilmagan.
Maqolalarning manbalari matn va `research.references` maydonida berilgan.

```powershell
npx tsx scripts/populate-content.ts --validate-only
npx tsx scripts/populate-content.ts --publish
```

Production bazasiga kiritishda `.env.production.local` fayliga `DATABASE_URL`
va `SITE_URL` yozing. Bu fayl Git orqali yuborilmaydi. PowerShell orqali:

```powershell
$env:DOTENV_CONFIG_PATH = '.env.production.local'
npx tsx scripts/populate-content.ts --publish
Remove-Item Env:DOTENV_CONFIG_PATH
```

`--publish` bo‘lmasa yangi yozuvlar draft holatida yaratiladi. Nashr sanasi import
paytida belgilanadi. Mavjud sluglar o‘zgartirilmaydi; avval draft sifatida
kiritilgan materiallarni admin paneldan nashr qiling. Import sozlangan
`DATABASE_URL` bazasiga yozadi va avtomatik deploy jarayoniga ulanmagan.

Fayllar `StoredFile` jadvaliga yuklanadi, shuning uchun ular lokal diskka bog‘liq
emas. Keyingi tahrirlar admin panel orqali qilinadi. Jarayon uzilsa, ayni buyruqni
qayta bajarish mavjud yozuvlarni saqlagan holda qolganlarini kiritadi.

Ommaviy sahifalar ISR orqali yangilanadi. Bu paket lokal bazaga import qilinsa,
alohida production bazasi o‘z-o‘zidan to‘ldirilmaydi.
