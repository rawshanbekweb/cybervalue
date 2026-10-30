// Academy Intermediate · AppSec, module 3: Dependencies and supply chain.
// The lessons use ./tools.ts: a lockfile checked against advisories, and
// install commands with look-alike package names.
import type { CommonWidget, Lesson, Text } from "../anim-lab/types";

export type Widget = CommonWidget | { type: "audit" } | { type: "typo" };

export const PROGRESS_KEY = "cybervalue:supplychain:progress:v1";

const t = (uz: string, en: string): Text => ({ uz, en });

const DEPS = t("Kutubxonalar", "Dependencies");
const ATTACKS = t("Hujumlar", "Attacks");
const HABITS = t("Odatlar", "Habits");

export const LESSONS: Lesson<Widget>[] = [
  {
    id: 1,
    group: DEPS,
    title: t("Ilovangizda kimning kodi bor", "Whose code is in your app"),
    minutes: 6,
    intro: t(
      "Oddiy veb-ilovada siz yozgan kod ko‘pincha 10 foizdan kam: qolgani — kutubxonalar. package.json’da siz tanlagan to‘g‘ridan-to‘g‘ri (direct) kutubxonalar bor, ularning har biri esa o‘zining kutubxonalarini olib keladi — bular bilvosita (transitive). Bitta `npm install express` 60 dan ortiq paketni o‘rnatadi. Ularning har birining zaifligi — sizning zaifligingiz.",
      "In a typical web app, the code you wrote is often under 10 percent: the rest is libraries. package.json lists the direct dependencies you chose, and each of them brings its own — the transitive ones. A single `npm install express` installs more than 60 packages. A flaw in any of them is a flaw in your app.",
    ),
    analogy: t(
      "Restoran oshpazi: o‘zi pishiradi, lekin go‘sht, un va ziravorlarni boshqalar yetkazadi. Bitta buzuq yetkazib beruvchi — butun taom buziladi.",
      "A restaurant chef cooks, but others supply the meat, flour and spices. One bad supplier spoils the whole dish.",
    ),
    theory: [
      t(
        "`npm ls --all` yoki `npm explain <paket>` paket nega o‘rnatilganini ko‘rsatadi.",
        "`npm ls --all` or `npm explain <package>` shows why a package is installed.",
      ),
    ],
    task: t(
      "Har bir paket to‘g‘ridan-to‘g‘rimi yoki bilvositami?",
      "Is each package direct or transitive?",
    ),
    hint: t(
      "package.json’da siz yozgan — direct.",
      "What you wrote in package.json is direct.",
    ),
    widget: {
      type: "sort",
      buckets: [
        { id: "direct", label: t("To‘g‘ridan-to‘g‘ri", "Direct") },
        { id: "transitive", label: t("Bilvosita", "Transitive") },
      ],
      items: [
        {
          label: t(
            "package.json’dagi express",
            "express, listed in package.json",
          ),
          bucket: "direct",
        },
        {
          label: t(
            "package.json’dagi jsonwebtoken",
            "jsonwebtoken, listed in package.json",
          ),
          bucket: "direct",
        },
        {
          label: t(
            "express so‘rov satrini o‘qish uchun olib kelgan qs",
            "qs, which express pulls in to parse query strings",
          ),
          bucket: "transitive",
        },
        {
          label: t(
            "Test vositasi ichidagi minimist",
            "minimist, inside a test tool",
          ),
          bucket: "transitive",
        },
        {
          label: t(
            "Siz `npm install axios` bilan qo‘shgan axios",
            "axios, which you added with `npm install axios`",
          ),
          bucket: "direct",
        },
      ],
    },
  },
  {
    id: 2,
    group: DEPS,
    title: t("Versiyalar va lockfile", "Versions and the lockfile"),
    minutes: 7,
    intro: t(
      "Versiya raqami MAJOR.MINOR.PATCH (semver): PATCH — xato tuzatish, MINOR — yangi imkoniyat, MAJOR — mosligini buzadigan o‘zgarish. package.json’dagi `^4.17.0` “4.x.x dan 4.17.0 yoki yangirog‘i” degani, shuning uchun bugun va ertaga turli versiya o‘rnatilishi mumkin. Lockfile (package-lock.json) har bir paketning aniq versiyasi va xeshini yozib qo‘yadi: `npm ci` aynan shuni o‘rnatadi — har bir kompyuterda va CI’da bir xil.",
      "A version is MAJOR.MINOR.PATCH (semver): PATCH fixes bugs, MINOR adds features, MAJOR breaks compatibility. `^4.17.0` in package.json means “4.17.0 or any newer 4.x.x”, so today and tomorrow may install different versions. The lockfile (package-lock.json) records each package’s exact version and hash: `npm ci` installs exactly that — the same on every machine and in CI.",
    ),
    analogy: t(
      "Retsept “bir qoshiq shakar” desa, har kim har xil qoshiq oladi; lockfile — “12 gramm” deydi.",
      "A recipe saying “a spoon of sugar” gets different spoons; the lockfile says “12 grams”.",
    ),
    theory: [
      t(
        "Lockfile’ni har doim commit qiling; CI’da `npm install` emas, `npm ci` ishlating.",
        "Always commit the lockfile, and use `npm ci`, not `npm install`, in CI.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t(
      "Lockfile — aniq versiya va xesh.",
      "The lockfile holds exact versions and hashes.",
    ),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "4.17.15 → 4.17.21 qanday o‘zgarish?",
            "What kind of change is 4.17.15 → 4.17.21?",
          ),
          options: [
            t("PATCH: xato tuzatishlar", "PATCH: bug fixes"),
            t("MAJOR: moslik buziladi", "MAJOR: breaks compatibility"),
            t("MINOR: yangi imkoniyatlar", "MINOR: new features"),
          ],
          answer: 0,
          explain: t(
            "Faqat oxirgi raqam o‘zgargan.",
            "Only the last number changed.",
          ),
        },
        {
          ask: t(
            "CI’da qaysi buyruq lockfile’dagi aniq versiyalarni o‘rnatadi?",
            "Which command installs exactly the lockfile’s versions in CI?",
          ),
          options: [
            t("npm ci", "npm ci"),
            t("npm update", "npm update"),
            t("npm install --latest", "npm install --latest"),
          ],
          answer: 0,
          explain: t(
            "Lockfile package.json bilan mos kelmasa, `npm ci` xato beradi.",
            "`npm ci` fails if the lockfile doesn’t match package.json.",
          ),
        },
        {
          ask: t(
            "Lockfile’dagi `integrity` xeshi nima uchun?",
            "What is the `integrity` hash in the lockfile for?",
          ),
          options: [
            t(
              "Yuklangan paket o‘zgartirilmaganini tekshirish",
              "Checking the downloaded package wasn’t altered",
            ),
            t("Paketni shifrlash", "Encrypting the package"),
            t("Paketni tezroq yuklash", "Downloading it faster"),
          ],
          answer: 0,
          explain: t(
            "Xesh mos kelmasa, o‘rnatish to‘xtaydi.",
            "If the hash doesn’t match, the install stops.",
          ),
        },
      ],
    },
  },
  {
    id: 3,
    group: DEPS,
    title: t("Zaifliklarni topish", "Finding known flaws"),
    minutes: 10,
    intro: t(
      "SCA (Software Composition Analysis) vositalari — `npm audit`, Dependabot, Snyk, OSV-Scanner — lockfile’dagi har bir paketni ma’lum zaifliklar bazasi (GitHub Advisory, OSV, CVE) bilan solishtiradi. Har bir maslahat (advisory) qaysi versiyalar zaif ekanini va qaysi versiyada tuzatilganini aytadi. Quyida kichik ilovaning lockfile’i va beshta maslahat: versiyalarni o‘zingiz solishtiring.",
      "SCA (Software Composition Analysis) tools — `npm audit`, Dependabot, Snyk, OSV-Scanner — compare every package in the lockfile with databases of known flaws (GitHub Advisory, OSV, CVE). Each advisory says which versions are affected and which version fixes it. Below are a small app’s lockfile and five advisories: compare the versions yourself.",
    ),
    analogy: t(
      "Avtomobil ishlab chiqaruvchisi nuqsonli partiyani qaytarib olsa, raqamingiz o‘sha oraliqdami — shuni tekshirasiz.",
      "When a carmaker recalls a faulty batch, you check whether your serial number is in the range.",
    ),
    theory: [
      t(
        "Bilvosita paket ham hisobga kiradi: uni tuzatish uchun ko‘pincha uni olib kelgan paketni yangilaysiz.",
        "Transitive packages count too: fixing one often means updating the package that pulls it in.",
      ),
    ],
    task: t(
      "Zaif versiyada turgan paketlarni belgilang.",
      "Tick the packages that are on an affected version.",
    ),
    hint: t(
      "Versiya “tuzatilgan” versiyadan eskimi? Raqamlarni chapdan solishtiring.",
      "Is the version older than the fixed one? Compare the numbers from the left.",
    ),
    widget: { type: "audit" },
  },
  {
    id: 4,
    group: ATTACKS,
    title: t("O‘xshash nomlar", "Look-alike names"),
    minutes: 8,
    intro: t(
      "Typosquatting: hujumchi mashhur paketga o‘xshash nom bilan (bitta harf ortiq, harflar o‘rni almashgan, chiziqcha tushib qolgan) zararli paket chiqaradi va kimdir xato yozishini kutadi. Bunday paketlar ko‘pincha o‘rnatilishi bilanoq ishga tushadigan `postinstall` skripti orqali muhit o‘zgaruvchilari, SSH kalitlari yoki tokenlarni o‘g‘irlaydi. 2017-yilda `crossenv` (haqiqiysi `cross-env`) aynan shunday qilgan.",
      "Typosquatting: an attacker publishes a malicious package with a name like a popular one (an extra letter, swapped letters, a missing hyphen) and waits for someone’s typo. Such packages often steal environment variables, SSH keys or tokens through a `postinstall` script that runs the moment they are installed. In 2017 `crossenv` (the real one is `cross-env`) did exactly that.",
    ),
    analogy: t(
      "“paypa1.com” kabi soxta sayt — faqat bu safar u kodingizga kiradi.",
      "Like a fake “paypa1.com” site — except this one gets into your code.",
    ),
    theory: [
      t(
        "O‘rnatishdan oldin paket sahifasini, yuklab olishlar sonini, muallifni va repozitoriyani tekshiring.",
        "Before installing, check the package’s page, download count, maintainer and repository.",
      ),
    ],
    task: t(
      "Har bir buyruq haqiqiy paketnimi yoki o‘xshash nomnimi o‘rnatadi?",
      "Does each command install the real package or a look-alike?",
    ),
    hint: t(
      "Harflarni sekin, birma-bir o‘qing.",
      "Read the letters slowly, one by one.",
    ),
    widget: { type: "typo" },
  },
  {
    id: 5,
    group: ATTACKS,
    title: t("Buzilgan yetkazib berish", "A poisoned supply"),
    minutes: 7,
    intro: t(
      "Ba’zan nom to‘g‘ri, lekin paketning o‘zi buziladi: muallifning hisobi o‘g‘irlanadi (2018, event-stream), yangi “yordamchi” muallif zararli versiya chiqaradi (2024, xz-utils orqa eshigi) yoki ichki paket nomi ochiq registrda egallab olinadi (dependency confusion). Himoya — qatlamlar: lockfile va xeshlar, yangi versiyalarni darhol emas, ko‘rib chiqib olish, o‘rnatish skriptlarini cheklash (`npm ci --ignore-scripts`) va ichki paketlar uchun scope (`@kompaniya/…`).",
      "Sometimes the name is right but the package itself is compromised: a maintainer’s account is stolen (event-stream, 2018), a new “helpful” maintainer ships a malicious release (the xz-utils backdoor, 2024), or an internal package name is claimed on the public registry (dependency confusion). The defence is layers: the lockfile and hashes, taking new versions after review rather than at once, limiting install scripts (`npm ci --ignore-scripts`) and a scope for internal packages (`@company/…`).",
    ),
    analogy: t(
      "Ishonchli yetkazib beruvchining yuk mashinasini yo‘lda boshqa odam haydab ketsa ham, quti ustidagi yorliq bir xil ko‘rinadi.",
      "Even if someone else drives a trusted supplier’s lorry, the label on the box looks the same.",
    ),
    theory: [
      t(
        "Dependency confusion: registr ichki nomdagi kattaroq versiyani tanlab qo‘yishi mumkin.",
        "Dependency confusion: the registry may pick a higher version under the internal name.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t(
      "Yangi versiya — avtomatik ishonchli emas.",
      "A new release isn’t trusted automatically.",
    ),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Kompaniyaning ichki `billing-utils` paketi nomi ochiq npm’da 99.0.0 versiya bilan paydo bo‘ldi. Bu nima?",
            "Your company’s internal `billing-utils` name appears on public npm as version 99.0.0. What is it?",
          ),
          options: [
            t("Dependency confusion hujumi", "A dependency confusion attack"),
            t("Oddiy yangilanish", "A normal update"),
            t("Typosquatting", "Typosquatting"),
          ],
          answer: 0,
          explain: t(
            "Ichki paketlarni scope (`@kompaniya/billing-utils`) va ichki registr bilan himoyalang.",
            "Protect internal packages with a scope (`@company/billing-utils`) and an internal registry.",
          ),
        },
        {
          ask: t(
            "Paket o‘rnatilayotganda kod bajarishning eng ko‘p uchraydigan yo‘li?",
            "The most common way a package runs code during install?",
          ),
          options: [
            t("postinstall skripti", "A postinstall script"),
            t("README fayli", "The README file"),
            t("LICENSE fayli", "The LICENSE file"),
          ],
          answer: 0,
          explain: t(
            "`--ignore-scripts` ularni o‘chiradi; kerakli paketlarga alohida ruxsat beriladi.",
            "`--ignore-scripts` turns them off; the few that need them are allowed one by one.",
          ),
        },
      ],
    },
  },
  {
    id: 6,
    group: HABITS,
    title: t("SBOM", "The SBOM"),
    minutes: 6,
    intro: t(
      "SBOM (Software Bill of Materials) — ilova ichidagi barcha komponentlarning versiyasi, litsenziyasi va manbasi bilan ro‘yxati, odatda CycloneDX yoki SPDX formatida. Yangi zaiflik e’lon qilinganda (2021-yildagi Log4Shell kabi) SBOM “bu bizda bormi, qayerda?” degan savolga daqiqalarda javob beradi — usiz jamoalar haftalab qidirgan. Ko‘p davlat va yirik mijozlar endi SBOM talab qiladi.",
      "An SBOM (Software Bill of Materials) lists every component inside an application with its version, licence and source, usually in CycloneDX or SPDX format. When a new flaw is announced (like Log4Shell in 2021), an SBOM answers “do we have it, and where?” in minutes — teams without one searched for weeks. Many governments and large customers now require one.",
    ),
    analogy: t(
      "Oziq-ovqat qadog‘idagi tarkib ro‘yxati: allergiyangiz bo‘lsa, butun mahsulotni ochmaysiz.",
      "The ingredients list on food: with an allergy you don’t open every packet.",
    ),
    theory: [
      t(
        "SBOM har bir build bilan avtomatik yaratiladi, masalan `npm sbom --sbom-format cyclonedx`.",
        "An SBOM is generated with every build, e.g. `npm sbom --sbom-format cyclonedx`.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t("SBOM — tarkib ro‘yxati.", "An SBOM is an ingredients list."),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Log4Shell kabi yangi zaiflik chiqdi. SBOM nimaga yordam beradi?",
            "A new flaw like Log4Shell is announced. How does an SBOM help?",
          ),
          options: [
            t(
              "Qaysi ilovalarda o‘sha komponent borligini darhol topishga",
              "Finding at once which applications contain that component",
            ),
            t(
              "Zaiflikni avtomatik tuzatishga",
              "Fixing the flaw automatically",
            ),
            t("Hujumchini topishga", "Finding the attacker"),
          ],
          answer: 0,
          explain: t(
            "U tuzatmaydi, lekin qayerni tuzatishni aytadi.",
            "It doesn’t fix anything, but it tells you where to fix.",
          ),
        },
        {
          ask: t(
            "Qaysi biri SBOM formati?",
            "Which of these is an SBOM format?",
          ),
          options: [
            t("CycloneDX", "CycloneDX"),
            t("YAML", "YAML"),
            t("Markdown", "Markdown"),
          ],
          answer: 0,
          explain: t(
            "Ikkinchi keng tarqalgani — SPDX.",
            "The other common one is SPDX.",
          ),
        },
      ],
    },
  },
  {
    id: 7,
    group: HABITS,
    title: t("Xavfsiz yangilash", "Updating safely"),
    minutes: 6,
    intro: t(
      "Eski kutubxona — eng ko‘p uchraydigan zaiflik manbai, lekin har bir yangilashni ko‘r-ko‘rona olish ham xavfli. Yaxshi tartib: Dependabot yoki Renovate yangilanishlarni pull request sifatida taklif qiladi, CI testlari ishlaydi, kimdir o‘zgarishlar ro‘yxatini (changelog) ko‘rib chiqadi va keyin birlashtiradi. Xavfsizlik tuzatishlari tez, oddiy yangilanishlar esa muntazam — masalan haftada bir — olinadi. Kerak bo‘lmagan kutubxonani olib tashlash — eng yaxshi yangilash.",
      "Outdated libraries are the most common source of flaws, but blindly taking every update is risky too. A good routine: Dependabot or Renovate proposes updates as pull requests, CI runs the tests, someone reads the changelog, then it is merged. Security fixes go in fast; ordinary updates on a schedule, say weekly. Removing a library you don’t need is the best update of all.",
    ),
    analogy: t(
      "Mashinaga texnik xizmat: tormoz nosozligini darhol, moy almashtirishni jadval bo‘yicha.",
      "Car servicing: a brake fault at once, the oil change on schedule.",
    ),
    theory: [
      t(
        "Har bir yangi kutubxona — yangi xavf: qo‘shishdan oldin “bu bizga rostdan kerakmi?” deb so‘rang.",
        "Every new library is new risk: before adding one, ask “do we really need this?”.",
      ),
    ],
    task: t("Har bir holatda nima qilinadi?", "What do you do in each case?"),
    hint: t(
      "Xavfsizlik — darhol; qolgani — jadval bo‘yicha.",
      "Security now; the rest on schedule.",
    ),
    widget: {
      type: "sort",
      buckets: [
        { id: "now", label: t("Darhol yangilash", "Update now") },
        { id: "plan", label: t("Jadval bo‘yicha", "On schedule") },
        { id: "remove", label: t("Olib tashlash", "Remove it") },
      ],
      items: [
        {
          label: t(
            "Ishlatilayotgan paketda kritik zaiflik, tuzatish chiqqan",
            "A critical flaw in a package you use, with a fix out",
          ),
          bucket: "now",
        },
        {
          label: t(
            "Yangi MINOR versiya, xavfsizlik tuzatishlari yo‘q",
            "A new MINOR version with no security fixes",
          ),
          bucket: "plan",
        },
        {
          label: t(
            "Hech qayerda import qilinmagan eski kutubxona",
            "An old library that nothing imports any more",
          ),
          bucket: "remove",
        },
        {
          label: t(
            "Faol ishlatilayotgan JWT kutubxonasining imzo tekshiruvi zaifligi",
            "A signature-check flaw in the JWT library you rely on",
          ),
          bucket: "now",
        },
        {
          label: t(
            "Yangi MAJOR versiya, API o‘zgargan",
            "A new MAJOR version with API changes",
          ),
          bucket: "plan",
        },
        {
          label: t(
            "Bitta funksiya uchun qo‘shilgan, besh yildan beri yangilanmagan paket",
            "A package added for one function, unmaintained for five years",
          ),
          bucket: "remove",
        },
      ],
    },
  },
  {
    id: 8,
    group: HABITS,
    title: t("Yakuniy savollar", "Final questions"),
    minutes: 6,
    intro: t(
      "Ta’minot zanjiri xavfsizligi — bitta vosita emas, odatlar to‘plami: nima ishlatayotganingizni biling (lockfile, SBOM), ma’lum zaifliklarni avtomatik qidiring (SCA), nimani o‘rnatayotganingizni tekshiring (nomi, muallifi) va yangilashni tartibli qiling.",
      "Supply chain security isn’t one tool but a set of habits: know what you use (lockfile, SBOM), look for known flaws automatically (SCA), check what you install (name, maintainer) and update in an orderly way.",
    ),
    analogy: t(
      "Oshxona gigiyenasi: bitta qoida emas, har kungi odatlar.",
      "Kitchen hygiene: not one rule but everyday habits.",
    ),
    theory: [
      t(
        "Bu modul — AppSec’ning uchinchi qadami; keyingisi — avtomatik tekshiruvlar.",
        "This module is AppSec’s third step; next comes automated testing.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t("Bilish, tekshirish, yangilash.", "Know, check, update."),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "`npm audit` nimani tekshiradi?",
            "What does `npm audit` check?",
          ),
          options: [
            t(
              "O‘rnatilgan paketlarni ma’lum zaifliklar bazasi bilan",
              "Installed packages against a database of known flaws",
            ),
            t("Sizning kodingizdagi xatolarni", "Bugs in your own code"),
            t("Server sozlamalarini", "Server settings"),
          ],
          answer: 0,
          explain: t(
            "O‘z kodingiz uchun SAST kerak — keyingi modul.",
            "Your own code needs SAST — the next module.",
          ),
        },
        {
          ask: t(
            "Zaif paket bilvosita bo‘lsa, odatda nima qilinadi?",
            "If the affected package is transitive, what do you usually do?",
          ),
          options: [
            t(
              "Uni olib kelgan to‘g‘ridan-to‘g‘ri paketni yangilash",
              "Update the direct package that pulls it in",
            ),
            t("Hech narsa: u bizniki emas", "Nothing: it isn’t ours"),
            t(
              "node_modules’dagi faylni qo‘lda tahrirlash",
              "Edit its file in node_modules by hand",
            ),
          ],
          answer: 0,
          explain: t(
            "Kerak bo‘lsa `overrides` bilan versiyani majburlash mumkin.",
            "If needed, `overrides` can force the version.",
          ),
        },
      ],
    },
  },
];
