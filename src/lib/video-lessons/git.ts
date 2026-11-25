import type { VideoLesson } from "./types";

// Video lesson for the Git & GitHub lab, narrated in Uzbek: Ali loses a day
// of work, Kibi shows him Git, and together they go from the first commit
// to a pull request and a leaked password.
export const GIT_VIDEO: VideoLesson = {
  id: "git",
  title: "Git va GitHub",
  href: "/akademiya/git",
  chapters: [
    {
      title: "Yo‘qolgan kod",
      scenes: [
        {
          say: "Ali bir hafta davomida do‘kon sayti ustida ishladi. Kecha kechqurun u bitta “kichik” o‘zgarish kiritdi va sayt umuman ochilmay qoldi. Qaysi qatorni o‘zgartirganini esa eslay olmayapti.",
          visual: { kind: "3d", shot: "nightserver", stage: 0 },
          host: { mood: "shock" },
          sfx: [{ at: 0.2, name: "alarm" }],
        },
        {
          say: "Uning papkasida shunday fayllar bor: sayt, sayt-yangi, sayt-yakuniy, sayt-yakuniy-rostdan. Qaysi biri ishlagan edi? Hech kim bilmaydi. Tanish holatmi?",
          visual: {
            kind: "terminal",
            lines: [
              { cmd: "ls" },
              {
                out: "sayt/  sayt-yangi/  sayt-yakuniy/  sayt-yakuniy-rostdan/",
              },
              { out: "sayt-yakuniy-rostdan-v2.zip" },
            ],
          },
          host: { mood: "sad" },
        },
        {
          say: "Salom, men Kibi! Bugun Ali bilan birga dasturchilarning eng muhim quroli — Git’ni o‘rganamiz. Keyin GitHub orqali jamoa bilan ishlashni va kodda sirlarni qanday saqlamaslik kerakligini ko‘ramiz.",
          visual: {
            kind: "host",
            title: "Git va GitHub",
            subtitle: "Commit, tarmoqlar, merge, GitHub va xavfsizlik",
            mood: "happy",
          },
          sfx: [{ at: 0.05, name: "magic" }],
        },
      ],
    },
    {
      title: "Git nima?",
      scenes: [
        {
          say: "Git — versiyalarni boshqarish tizimi. U loyihangizning har bir holatini saqlab boradi: kim, qachon va nimani o‘zgartirganini. Xohlagan paytda istalgan eski holatga qaytish mumkin.",
          visual: {
            kind: "analogy",
            icon: "book",
            heading: "O‘yindagi saqlash nuqtalari",
            text: "Har bir commit — saqlash nuqtasi. Xato qilsangiz, oxirgi yaxshi nuqtadan davom etasiz.",
          },
        },
        {
          say: "Git’ni 2005-yilda Linus Torvalds yaratgan — Linux yadrosini yozgan o‘sha odam. Bugun deyarli barcha dasturchilar Git ishlatadi. Rasmiy sayti git-scm.com: u yerdan Git’ni yuklab olasiz va bepul “Pro Git” kitobini o‘qiysiz.",
          visual: {
            kind: "photo",
            src: "/lessons/git/scm-home.webp",
            caption: "git-scm.com — Git’ning rasmiy sayti",
          },
        },
        {
          say: "Git va GitHub — har xil narsalar. Git kompyuteringizda ishlaydi va internet talab qilmaydi. GitHub esa Git repozitoriylarini bulutda saqlaydigan veb-xizmat: u yerda kodni ulashasiz va jamoa bilan ishlaysiz.",
          visual: {
            kind: "points",
            heading: "Git ≠ GitHub",
            items: [
              "Git — kompyuteringizdagi dastur, internetsiz ishlaydi",
              "GitHub — repozitoriylar saqlanadigan veb-xizmat",
              "GitLab va Bitbucket — GitHub’ga o‘xshash xizmatlar",
            ],
          },
        },
      ],
    },
    {
      title: "Birinchi commit",
      scenes: [
        {
          say: "Avval Git’ga kimligimizni aytamiz, chunki har bir commitda muallif yoziladi. Keyin git init buyrug‘i papkani repozitoriyga aylantiradi: ichida yashirin .git papkasi paydo bo‘ladi va butun tarix o‘sha yerda saqlanadi.",
          visual: {
            kind: "terminal",
            lines: [
              { cmd: 'git config --global user.name "Ali"' },
              { cmd: 'git config --global user.email "ali@example.uz"' },
              { cmd: "git init" },
              { out: "Initialized empty Git repository in ~/sayt/.git/" },
            ],
          },
          sfx: [{ at: 0.3, name: "type" }],
        },
        {
          say: "Git’da fayl uch joyda bo‘ladi. Ishchi papka — siz tahrir qiladigan joy. Staging — keyingi suratga tayyorlangan o‘zgarishlar. Repozitoriy — saqlangan suratlar, ya’ni commitlar. git add faylni staging’ga qo‘yadi, git commit esa suratga oladi.",
          visual: {
            kind: "areas",
            files: ["index.html", "style.css"],
            message: "Birinchi sahifa",
          },
          sfx: [
            { at: 0.3, name: "whoosh" },
            { at: 0.65, name: "pop" },
          ],
        },
        {
          say: "Mana haqiqiy terminal. git status avval faylni “Untracked”, ya’ni kuzatilmayotgan deb ko‘rsatadi. git add va git commit’dan keyin esa “working tree clean” deydi — hamma narsa saqlandi.",
          visual: {
            kind: "photo",
            src: "/lessons/git/terminal-first.webp",
            caption: "Haqiqiy Git: init, status, add va commit",
          },
        },
        {
          say: "Commit xabari muhim. “o‘zgarish” yoki “asdf” deb yozmang. Nima qilinganini qisqa ayting: “Kirish formasi qo‘shildi”, “Parol tekshiruvi tuzatildi”. Bir yildan keyin aynan shu xabarlar sizni qutqaradi.",
          visual: {
            kind: "points",
            heading: "Yaxshi commit xabari",
            items: [
              "✓ Kirish formasi qo‘shildi",
              "✓ Parol tekshiruvi tuzatildi",
              "✗ o‘zgarish",
              "✗ asdf",
            ],
          },
        },
        {
          say: "Savol: git add nima qiladi? Javobni o‘ylab ko‘ring.",
          visual: {
            kind: "quiz",
            question: "git add nima qiladi?",
            options: [
              "Faylni GitHub’ga yuboradi",
              "O‘zgarishni staging’ga qo‘yadi",
              "Commitni o‘chiradi",
            ],
            answer: 1,
          },
          hold: 6,
          host: { mood: "think" },
        },
      ],
    },
    {
      title: "Tarixni o‘qish",
      scenes: [
        {
          say: "Endi Alining muammosiga qaytamiz. Git bilan u qaysi o‘zgarish saytni buzganini bir zumda topadi. git log barcha commitlar ro‘yxatini ko‘rsatadi, git diff esa aynan qaysi qatorlar o‘zgarganini.",
          visual: {
            kind: "terminal",
            lines: [
              { cmd: "git log --oneline" },
              { out: "c81bdd0 Footer qo‘shildi" },
              { out: "8944bb0 Dizayn qo‘shildi" },
              { out: "e96c687 Birinchi sahifa" },
            ],
          },
        },
        {
          say: "git diff’da qizil qatorlar o‘chirilgan, yashillari qo‘shilgan. Ali bir qarashda ko‘rdi: ma’lumotlar bazasi manzili xato yozilgan ekan. Endi bitta qatorni tuzatish kifoya.",
          visual: {
            kind: "photo",
            src: "/lessons/git/terminal-diff.webp",
            caption: "git diff: “−” qizil — o‘chirildi, “+” yashil — qo‘shildi",
          },
        },
      ],
    },
    {
      title: "Tarmoqlar",
      scenes: [
        {
          say: "Ali saytga kirish sahifasini qo‘shmoqchi. Lekin ishlab turgan saytni buzib qo‘yishdan qo‘rqadi. Buning uchun Git’da tarmoqlar bor. Tarmoq — loyihaning alohida ish yo‘nalishi.",
          visual: {
            kind: "analogy",
            icon: "switch",
            heading: "Qoralama nusxa",
            text: "main — asl kitob. Tarmoq — qoralama. Qoralamada bemalol yozasiz, yoqsa — asl kitobga qo‘shasiz.",
          },
        },
        {
          say: "git switch -c login — “login” tarmog‘ini yaratadi va unga o‘tkazadi. Ali u yerda ikkita commit qiladi. Bu vaqtda main tarmog‘i tegmasdan turadi. Grafikda kuzating: yangi yo‘l ajralib chiqyapti.",
          visual: {
            kind: "gitgraph",
            heading: "git switch -c login",
            lanes: ["main", "login"],
            commits: [
              { id: "e96c687", lane: 0, parents: [] },
              { id: "8944bb0", lane: 0, parents: ["e96c687"], tags: ["main"] },
              { id: "00919a6", lane: 1, parents: ["8944bb0"] },
              {
                id: "c58aecf",
                lane: 1,
                parents: ["00919a6"],
                tags: ["HEAD → login"],
              },
            ],
          },
          sfx: [{ at: 0.5, name: "pop" }],
        },
        {
          say: "Tarmoq aslida juda yengil narsa: u shunchaki bitta commitga ko‘rsatuvchi nom. HEAD esa “hozir qayerdaman” degan ko‘rsatkich. Shuning uchun Git’da tarmoq ochish bir zumda bo‘ladi.",
          visual: {
            kind: "photo",
            src: "/lessons/git/scm-branching.webp",
            caption:
              "“Pro Git” kitobidan: commit — loyihaning surati va oldingi commitga ko‘rsatkich",
          },
        },
      ],
    },
    {
      title: "Merge va konflikt",
      scenes: [
        {
          say: "Kirish sahifasi tayyor. Endi uni main’ga qo‘shamiz: git switch main, keyin git merge login. Bu orada main’da ham yangi commit bo‘lgani uchun Git ikki ota-onali “merge commit” yaratadi.",
          visual: {
            kind: "gitgraph",
            heading: "git merge login",
            lanes: ["main", "login"],
            commits: [
              { id: "e96c687", lane: 0, parents: [] },
              { id: "8944bb0", lane: 0, parents: ["e96c687"] },
              { id: "00919a6", lane: 1, parents: ["8944bb0"] },
              { id: "c58aecf", lane: 1, parents: ["00919a6"], tags: ["login"] },
              { id: "c81bdd0", lane: 0, parents: ["8944bb0"] },
              {
                id: "c2b13c6",
                lane: 0,
                parents: ["c81bdd0", "c58aecf"],
                tags: ["HEAD → main"],
              },
            ],
          },
          sfx: [{ at: 0.75, name: "ding" }],
        },
        {
          say: "Lekin ba’zan ikki tarmoq bitta qatorni turlicha o‘zgartiradi. Masalan, bir tarmoqda narx yuz yigirma ming, boshqasida sakson ming. Git qaysi biri to‘g‘ri ekanini bilmaydi va to‘xtaydi. Bu — konflikt.",
          visual: {
            kind: "photo",
            src: "/lessons/git/terminal-conflict.webp",
            caption:
              "Haqiqiy merge konflikti: <<<<<<<, ======= va >>>>>>> belgilari",
          },
          host: { mood: "shock" },
          sfx: [{ at: 0.4, name: "alarm" }],
        },
        {
          say: "Qo‘rqmang, bu xato emas — savol. Faylni ochasiz, to‘g‘ri narxni qoldirasiz va belgilarni o‘chirasiz. Keyin git add va git commit. Agar adashib qolsangiz, git merge --abort hammasini avvalgi holatiga qaytaradi.",
          visual: {
            kind: "terminal",
            lines: [
              { cmd: 'echo "Narx: 90 000 so‘m" > narx.txt' },
              { cmd: "git add narx.txt" },
              { cmd: 'git commit -m "Narx kelishildi"' },
              { out: "[main 4f1a2b3] Narx kelishildi" },
            ],
          },
          host: { mood: "happy" },
        },
        {
          say: "Savol: konfliktni hal qilgandan keyin qaysi buyruqlar kerak?",
          visual: {
            kind: "quiz",
            question: "Konflikt hal qilindi. Keyin nima?",
            options: [
              "git add va git commit",
              "git push --force",
              "Repozitoriyni o‘chirish",
            ],
            answer: 0,
          },
          hold: 6,
          host: { mood: "think" },
        },
      ],
    },
    {
      title: "GitHub va jamoa",
      scenes: [
        {
          say: "Ali endi loyihani GitHub’ga yuklaydi. U GitHub’da bo‘sh repozitoriy ochadi, keyin manzilni “origin” nomi bilan qo‘shadi va git push bilan commitlarni yuboradi. Kompyuter buzilsa ham, endi kod yo‘qolmaydi.",
          visual: {
            kind: "exchange",
            left: "Alining kompyuteri",
            right: "GitHub",
            steps: [
              {
                dir: "right",
                label: "git push",
                note: "Commitlar GitHub’ga yuboriladi",
              },
              {
                dir: "left",
                label: "git pull",
                note: "Jamoadoshlarning o‘zgarishlari olinadi",
              },
              {
                dir: "left",
                label: "git clone",
                note: "Butun loyiha tarixi bilan ko‘chiriladi",
              },
            ],
          },
          sfx: [{ at: 0.3, name: "whoosh" }],
        },
        {
          say: "Muhim: GitHub endi Git uchun parolni qabul qilmaydi. HTTPS orqali shaxsiy kirish tokeni yoki SSH kalit ishlatiladi. Tokenni hech qachon kodga yozmang va hech kimga bermang.",
          visual: {
            kind: "terminal",
            lines: [
              { cmd: "git remote add origin https://github.com/ali/sayt.git" },
              { cmd: "git push -u origin main" },
              { out: " * [new branch]      main -> main" },
            ],
          },
        },
        {
          say: "Alining jamoadoshi Vali ham shu loyihada ishlaydi. Agar Vali birinchi bo‘lib push qilsa, Alining push’i rad etiladi: “fetch first”. Yechim oddiy: avval git pull bilan Valining ishini olasiz, keyin o‘zingiznikini yuborasiz. Hech qachon push --force bilan boshqalar ishini o‘chirmang.",
          visual: {
            kind: "terminal",
            lines: [
              { cmd: "git push" },
              { out: " ! [rejected]   main -> main (fetch first)" },
              { cmd: "git pull" },
              { cmd: "git push" },
              { out: "   c2b13c6..9d4e8f1  main -> main" },
            ],
          },
        },
        {
          say: "Begona loyihaga hissa qo‘shish uchun fork va Pull Request bor. Fork — loyihaning sizdagi nusxasi. Unda tuzatish kiritib, egasiga “qo‘shib qo‘yasizmi?” deb so‘rov yuborasiz. Bu Pull Request. U yerda testlar ishlaydi va boshqa odam kodingizni tekshiradi.",
          visual: {
            kind: "points",
            heading: "Pull Request yo‘li",
            items: [
              "Fork → git clone",
              "Yangi tarmoq → commit → git push",
              "Pull Request ochish",
              "Review va testlar → Merge",
            ],
          },
        },
      ],
    },
    {
      title: "Sirlar va xavfsizlik",
      scenes: [
        {
          say: "Endi eng xavfli xato. Ali parol yozilgan .env faylini commit qilib, GitHub’ga yubordi. Keyin xatosini sezib, faylni o‘chirdi. Muammo hal bo‘ldimi? Yo‘q!",
          visual: { kind: "warning" },
          host: { mood: "shock" },
          sfx: [{ at: 0.1, name: "alarm" }],
        },
        {
          say: "Git tarixni unutmaydi. git show eski commitdagi faylni bemalol chiqarib beradi. Botlar esa ochiq repozitoriylarni bir necha soniyada skanerlab, parol va kalitlarni topadi.",
          visual: {
            kind: "photo",
            src: "/lessons/git/terminal-secret.webp",
            caption:
              "Fayl o‘chirilgan, lekin git show uni tarixdan chiqarib beradi",
          },
        },
        {
          say: "Qoidalarni eslab qoling. Sirlarni .env faylida saqlang va uni .gitignore’ga yozing. Agar sir baribir sizib chiqsa — avval kalitni bekor qilib, yangisini oling. GitHub akkauntida ikki bosqichli autentifikatsiyani yoqing va iloji bo‘lsa commitlaringizni imzolang.",
          visual: {
            kind: "points",
            heading: "Xavfsiz Git",
            items: [
              ".env — .gitignore ichida",
              "Sir sizsa — darhol kalitni almashtirish",
              "GitHub’da 2FA va Push protection",
              "Imzolangan commitlar va kod ko‘rib chiqish",
            ],
          },
        },
        {
          say: "Oxirgi savol: parol yozilgan fayl commit qilinib, keyin o‘chirildi. Parol xavfsizmi?",
          visual: {
            kind: "quiz",
            question:
              "Commit qilingan parol fayli o‘chirildi. Parol xavfsizmi?",
            options: [
              "Ha, fayl o‘chirildi",
              "Yo‘q — u tarixda qoladi, parolni almashtirish kerak",
              "Ha, agar repozitoriy kichik bo‘lsa",
            ],
            answer: 1,
          },
          hold: 6,
          host: { mood: "think" },
        },
        {
          say: "Ajoyib! Bugun Git bilan commit qilishni, tarixni o‘qishni, tarmoqlarda ishlashni, konfliktni hal qilishni, GitHub’ga yuklashni va sirlarni himoya qilishni o‘rgandik. Endi laboratoriyaga o‘ting: brauzerdagi haqiqiy Git terminalida hammasini o‘zingiz bajarib ko‘ring!",
          visual: {
            kind: "host",
            title: "Endi o‘zingiz sinab ko‘ring",
            subtitle: "Akademiya → Git va GitHub laboratoriyasi",
            mood: "wink",
          },
          sfx: [{ at: 0.1, name: "ding" }],
        },
      ],
    },
  ],
};
