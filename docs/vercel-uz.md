# CyberValue loyihasini Vercel'ga joylash

Loyihani kontentsiz joylab, keyin `/admin` orqali maqolalar, loyihalar va lab yozuvlarini qo'shish mumkin. Kontent va admin akkaunt PostgreSQL bazasida saqlanadi, shuning uchun qayta deploy ularni o'chirmaydi. Baza zaxira nusxalarini hosting provayderida sozlang.

## 1. GitHub va Vercel

1. Ushbu o'zgarishlarni `https://github.com/rawshanbekweb/cybervalue` repositoriyangizga commit va push qiling.
2. [Vercel](https://vercel.com/new) hisobingizda **Add New → Project** orqali shu repositoriyni import qiling.
3. Framework: **Next.js**, Root Directory: loyiha ildizi. Node.js: **24.x** (`package.json` belgilaydi).
4. Build Command: **`npm run vercel-build`** (`vercel.json` belgilaydi). Install Command va Output Directory standart holatda qolsin.

`.env` faylini GitHub'ga yubormang. Kompyuteringizdagi `localhost` yoki `127.0.0.1` bazasiga Vercel ulana olmaydi.

## 2. PostgreSQL bazasi

Vercel Marketplace orqali [Neon PostgreSQL](https://vercel.com/marketplace/neon) bazasini yarating yoki mavjud tashqi PostgreSQL bazangizni ishlating. Baza hududiga yaqin Vercel Function Region tanlang.

Loyiha **Settings → Environment Variables** bo'limida quyidagilarni **Production** muhiti uchun kiriting:

| Nomi                                                          | Qiymati                                                                          |
| ------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `DATABASE_URL`                                                | Provayder bergan `postgresql://...` ulanish manzili; TLS parametrlarini saqlang  |
| `SITE_URL`                                                    | Loyihangizning doimiy HTTPS manzili, masalan `https://sizning-loyiha.vercel.app` |
| `SITE_INDEXABLE`                                              | Dastlab `false`; sayt tayyor bo'lganda `true`                                    |
| `GITHUB_URL`, `LINKEDIN_URL`, `TELEGRAM_URL`, `INSTAGRAM_URL` | Ixtiyoriy haqiqiy HTTPS profil havolalari                                        |

`DATABASE_URL` maxfiy qiymat: uni chatga yuborish shart emas. Integratsiya boshqa nomdagi o'zgaruvchi yaratsa, ushbu loyiha uchun uning qiymatini `DATABASE_URL` sifatida ham kiriting. Prisma Accelerate `prisma://` manzili emas, PostgreSQL ulanish manzili kerak.

Preview muhiti uchun alohida baza yoki Neon database branch ishlating. Production bazasini Preview'ga ulamang: har deploy o'z bazasiga migratsiyalarni qo'llaydi. Bazasi yo'q Preview build muvaffaqiyatsiz tugashi kutiladi.

## 3. Deploy

**Deploy** tugmasini bosing. Build avval Prisma Client'ni yaratadi, keyin bazaga repodagi migratsiyalarni qo'llaydi va Next.js'ni build qiladi. Baza jadvalini qo'lda yaratish kerak emas.

Agar loyiha bazani ulashdan oldin yaratilgan bo'lsa va ilk build xato bilan tugasa, bazani va environment variables'ni sozlab **Redeploy** qiling. Birinchi deploy'dan keyin Vercel bergan doimiy domenni `SITE_URL` bilan solishtiring. `SITE_URL` o'zgarsa, yana deploy qiling.

## 4. Admin akkaunt yaratish

Kompyuteringizdagi Git'ga kiritilmaydigan `.env` faylida `DATABASE_URL`ni aynan Production bazasining manziliga almashtiring. Terminalda loyiha ichida:

```powershell
npm.cmd run db:generate
npm.cmd run db:deploy
npm.cmd run admin:create-user -- --email siz@example.com
```

Email o'rniga o'zingiznikini yozing. Terminal parol so'raydi; kamida 12 belgi kiriting. Ushbu buyruq bitta egasi akkauntini yaratadi yoki mavjud egasi email/parolini yangilaydi.

Keyin `https://sizning-domeningiz/admin` manziliga kiring. Yozuv yarating, avval Draft sifatida saqlang, tayyor bo'lganda Published holatini va hozirgi yoki o'tgan nashr sanasini tanlang. Bu yozuvlar bazada saqlanadi; har yangi maqola uchun GitHub'ga push qilish kerak emas.

## 5. PDF, ZIP va rasmlar

Hozirgi admin panel matn va ma'lumotlarni boshqaradi, lekin yangi fayl yuklash tugmasi yo'q. Resource yozuvi yaratishning o'zi faylni serverga yuklamaydi.

- Rasmlar hozir `public/images/` orqali deploy bilan keladi.
- Yuklab olinadigan fayllar `content/private/downloads/` orqali keladi. Bu papka Git'dan chiqarilgan, shuning uchun GitHub importi lokal fayllarni Vercel'ga yubormaydi.
- Download funksiyasi build vaqtida mavjud fayllarni o'z paketiga qo'shishga sozlangan. Ularni ishonchli build bosqichida alohida yetkazish kerak.
- Sayt ishlayotgan paytda admin paneldan fayllar yuklash uchun private object storage va upload funksiyasini alohida qo'shish kerak. Vercel server diskini doimiy fayl ombori sifatida ishlatib bo'lmaydi.

## 6. Tekshirish

Deploy'dan keyin bosh sahifa, `/admin`, bir yangi maqolaning nashri va `/sitemap.xml`ni tekshiring. `SITE_URL` doimiy domeningizga mos bo'lsin. Qidiruv tizimlarida ko'rinishga tayyor bo'lgach, Production uchun `SITE_INDEXABLE=true` qilib redeploy qiling.

Web Security Lab mashqlarining vaqtinchalik holati hozir server jarayoni xotirasida saqlanadi. Vercel yangi instance ochganda yoki instance almashganda mashq sessiyasi tiklanishi mumkin; izchil ko'p bosqichli mashqlar uchun umumiy holat saqlash yechimi hali kerak. Admin sessiyalari esa PostgreSQL'da saqlanadi.

Rasmiy manbalar: [Vercel build](https://vercel.com/docs/builds), [Node.js versiyasi](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions), [funksiyada fayllar](https://vercel.com/kb/guide/how-can-i-use-files-in-serverless-functions).
