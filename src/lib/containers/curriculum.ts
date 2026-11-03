// Academy Intermediate · Cloud security, module 4: Containers.
// The lessons use ./tools.ts: a Dockerfile to review line by line.
import type { CommonWidget, Lesson, Text } from "../anim-lab/types";

export type Widget = CommonWidget | { type: "dockerfile" };

export const PROGRESS_KEY = "cybervalue:containers:progress:v1";

const t = (uz: string, en: string): Text => ({ uz, en });

const IMAGES = t("Obrazlar", "Images");
const RUNTIME = t("Ishga tushirish", "Running");

export const LESSONS: Lesson<Widget>[] = [
  {
    id: 1,
    group: IMAGES,
    title: t("Konteyner nima", "What a container is"),
    minutes: 5,
    intro: t(
      "Konteyner — ilova va unga kerak bo‘lgan hamma narsa (kutubxonalar, sozlamalar) bitta paketda. U virtual mashinadan yengil: o‘z operatsion tizim yadrosi yo‘q, xost yadrosini boshqa konteynerlar bilan bo‘lishadi. Obraz (image) — tayyor shablon; konteyner — shu obrazdan ishga tushgan nusxa. Docker obrazni Dockerfile’dan quradi.",
      "A container is an app plus everything it needs (libraries, settings) in one package. It is lighter than a virtual machine: it has no kernel of its own and shares the host’s kernel with other containers. An image is the ready-made template; a container is a running copy of that image. Docker builds images from a Dockerfile.",
    ),
    analogy: t(
      "Obraz — retsept va tayyor muzlatilgan taom; konteyner — isitilib dasturxonga qo‘yilgan porsiya.",
      "The image is a frozen ready meal; a container is one portion heated up and served.",
    ),
    theory: [
      t(
        "Yadro umumiy bo‘lgani uchun konteyner chegarasi VM chegarasidan zaifroq.",
        "Because the kernel is shared, a container boundary is weaker than a VM’s.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t(
      "Obraz — shablon, konteyner — nusxa.",
      "Image is the template, container the copy.",
    ),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Konteyner va virtual mashinaning asosiy farqi?",
            "The main difference between a container and a VM?",
          ),
          options: [
            t(
              "Konteyner xost yadrosini bo‘lishadi",
              "A container shares the host kernel",
            ),
            t("Konteyner har doim sekinroq", "A container is always slower"),
            t("VM’da ilova ishlamaydi", "Apps can’t run in a VM"),
          ],
          answer: 0,
          explain: t(
            "Shuning uchun yengil, lekin ajratish zaifroq.",
            "That’s why it is light, but the isolation is weaker.",
          ),
        },
        {
          ask: t(
            "Docker obrazni nimadan quradi?",
            "What does Docker build an image from?",
          ),
          options: [
            t("Dockerfile", "A Dockerfile"),
            t("package.json", "package.json"),
            t("README", "A README"),
          ],
          answer: 0,
          explain: t(
            "Har bir ko‘rsatma (FROM, COPY, RUN…) qatlam qo‘shadi.",
            "Each instruction (FROM, COPY, RUN…) adds a layer.",
          ),
        },
      ],
    },
  },
  {
    id: 2,
    group: IMAGES,
    title: t("Qatlamlar va bazaviy obraz", "Layers and base images"),
    minutes: 6,
    intro: t(
      "Obraz qatlamlardan iborat va har bir qatlam saqlanib qoladi. Agar bir qatlamda faylni qo‘shib, keyingisida o‘chirsangiz, u baribir obraz ichida qoladi — `docker history` yoki obrazni ochish bilan topiladi. Bazaviy obraz (FROM) hamma narsaning poydevori: kichik obraz (alpine, distroless, slim) kamroq paket, demak kamroq zaiflik. `latest` o‘rniga aniq versiya, eng yaxshisi digest (sha256) ishlatiladi.",
      "An image is made of layers, and every layer is kept. Add a file in one layer and delete it in the next, and it is still inside the image — `docker history` or unpacking the image finds it. The base image (FROM) is the foundation of everything: a small image (alpine, distroless, slim) has fewer packages, so fewer vulnerabilities. Use an exact version instead of `latest` — best of all a digest (sha256).",
    ),
    analogy: t(
      "Qatlamlar — shaffof plyonkalar: ustiga yangisini qo‘ysangiz, pastdagisi yo‘qolmaydi.",
      "Layers are transparent sheets: lay a new one on top and the one below doesn’t disappear.",
    ),
    theory: [
      t(
        "Multi-stage build: quriladigan vositalar birinchi bosqichda qoladi, yakuniy obrazga faqat natija o‘tadi.",
        "Multi-stage builds keep build tools in the first stage; only the result goes into the final image.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t("Qatlamlar o‘chmaydi.", "Layers never go away."),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Bir qatlamda .env qo‘shilib, keyingisida o‘chirildi. U obrazda bormi?",
            "A .env is added in one layer and deleted in the next. Is it in the image?",
          ),
          options: [
            t(
              "Ha, oldingi qatlamda qoladi",
              "Yes, it stays in the earlier layer",
            ),
            t("Yo‘q, butunlay o‘chdi", "No, it is gone completely"),
            t("Faqat Windows’da", "Only on Windows"),
          ],
          answer: 0,
          explain: t(
            "Sir umuman obrazga tushmasligi kerak.",
            "A secret must never enter the image at all.",
          ),
        },
        {
          ask: t(
            "Qaysi FROM eng ishonchli?",
            "Which FROM is the most reliable?",
          ),
          options: [
            t("node:22-alpine@sha256:…", "node:22-alpine@sha256:…"),
            t("node:latest", "node:latest"),
            t("node", "node"),
          ],
          answer: 0,
          explain: t(
            "Digest har safar aynan bir xil obrazni beradi.",
            "A digest gives exactly the same image every time.",
          ),
        },
        {
          ask: t(
            "Multi-stage build nima uchun foydali?",
            "Why is a multi-stage build useful?",
          ),
          options: [
            t(
              "Yakuniy obrazda kompilyator va vositalar qolmaydi",
              "Compilers and tools stay out of the final image",
            ),
            t("Obraz kattaroq bo‘ladi", "The image gets bigger"),
            t("Sirlarni saqlaydi", "It stores secrets"),
          ],
          answer: 0,
          explain: t(
            "Kamroq narsa — kamroq hujum yuzasi.",
            "Less inside means less attack surface.",
          ),
        },
      ],
    },
  },
  {
    id: 3,
    group: IMAGES,
    title: t("Dockerfile’ni ko‘rib chiqish", "Reviewing a Dockerfile"),
    minutes: 8,
    intro: t(
      "Quyida kompaniya ilovasining Dockerfile’i. Sakkiz qatordan to‘rttasi xavfli. Har bir qatorni o‘qing: bazaviy obraz qanday tanlangan, obrazga nima nusxalanadi, sir qayerda va ilova kim nomidan ishlaydi?",
      "Below is the Dockerfile for a company’s app. Four of its eight lines are risky. Read each line: how is the base image chosen, what is copied into the image, where is the secret, and which user does the app run as?",
    ),
    analogy: t(
      "Kod review kabi, faqat obraz uchun.",
      "Like a code review, but for the image.",
    ),
    theory: [
      t(
        "hadolint kabi linterlar Dockerfile xatolarini avtomatik topadi.",
        "Linters such as hadolint find Dockerfile mistakes automatically.",
      ),
    ],
    task: t("Xavfli qatorlarni belgilang.", "Tick the risky lines."),
    hint: t(
      "Versiya, nusxalanadigan fayllar, sir va foydalanuvchi.",
      "The version, the files copied, the secret and the user.",
    ),
    widget: { type: "dockerfile" },
  },
  {
    id: 4,
    group: RUNTIME,
    title: t("Root’siz va eng kam huquq", "Non-root and least privilege"),
    minutes: 6,
    intro: t(
      "Konteyner ichidagi root xost bilan bir xil foydalanuvchi raqamiga (UID 0) ega. Shuning uchun ilova oddiy foydalanuvchi nomidan ishlashi kerak (`USER node`). Ishga tushirishda ham huquqlarni kesing: `--privileged` ishlatmang, `/var/run/docker.sock`ni konteynerga ulamang (bu xostni to‘liq boshqarish demak), Linux capability’larni `--cap-drop ALL` bilan olib tashlang va fayl tizimini `--read-only` qiling.",
      "Root inside a container has the same user number as root on the host (UID 0). So the app should run as an ordinary user (`USER node`). Cut privileges at run time too: don’t use `--privileged`, don’t mount `/var/run/docker.sock` into the container (that means full control of the host), drop Linux capabilities with `--cap-drop ALL`, and make the filesystem `--read-only`.",
    ),
    analogy: t(
      "Mehmonxona xodimiga faqat o‘z qavatining kaliti beriladi, bosh kalit emas.",
      "A hotel cleaner gets the key to their floor, not the master key.",
    ),
    theory: [
      t(
        "Rootless Docker yoki Podman demonning o‘zini ham oddiy foydalanuvchi sifatida ishga tushiradi.",
        "Rootless Docker or Podman run the daemon itself as an ordinary user.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t(
      "Kerak bo‘lmagan huquqni bermang.",
      "Don’t grant what isn’t needed.",
    ),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Ilova konteynerda kim nomidan ishlashi kerak?",
            "Which user should the app run as in the container?",
          ),
          options: [
            t(
              "Oddiy, root bo‘lmagan foydalanuvchi",
              "An ordinary, non-root user",
            ),
            t("root", "root"),
            t("Farqi yo‘q", "It doesn’t matter"),
          ],
          answer: 0,
          explain: t(
            "Zaiflik bo‘lsa ham hujumchining huquqi cheklangan.",
            "Even if there’s a flaw, the attacker’s rights are limited.",
          ),
        },
        {
          ask: t(
            "Nega docker.sock’ni konteynerga ulash xavfli?",
            "Why is mounting docker.sock into a container dangerous?",
          ),
          options: [
            t(
              "Konteyner xostdagi Docker’ni to‘liq boshqara oladi",
              "The container can fully control Docker on the host",
            ),
            t("Disk to‘lib qoladi", "The disk fills up"),
            t("Internet sekinlashadi", "The internet slows down"),
          ],
          answer: 0,
          explain: t(
            "Bu amalda xostda root bo‘lish bilan teng.",
            "In practice that equals root on the host.",
          ),
        },
        {
          ask: t(
            "Qaysi bayroq huquqlarni kamaytiradi?",
            "Which flag reduces privileges?",
          ),
          options: [
            t("--cap-drop ALL", "--cap-drop ALL"),
            t("--privileged", "--privileged"),
            t("--net host", "--net host"),
          ],
          answer: 0,
          explain: t(
            "Kerakli capability’ni keyin alohida qo‘shasiz.",
            "Add back the one capability you need, if any.",
          ),
        },
      ],
    },
  },
  {
    id: 5,
    group: RUNTIME,
    title: t("Xavfsiz va xavfli odatlar", "Safe and risky habits"),
    minutes: 5,
    intro: t(
      "Konteyner xavfsizligi obraz qurilishidan ishga tushirishgacha davom etadi. Har bir odatni to‘g‘ri guruhga ajrating.",
      "Container security runs from building the image to running it. Sort each habit into the right group.",
    ),
    analogy: t(
      "Yaxshi oshxona: toza masalliq, toza idish, toza qo‘l.",
      "A good kitchen: clean ingredients, clean dishes, clean hands.",
    ),
    theory: [
      t(
        "CIS Docker Benchmark shu odatlarning to‘liq ro‘yxatini beradi.",
        "The CIS Docker Benchmark lists these habits in full.",
      ),
    ],
    task: t("Odatlarni ajrating.", "Sort the habits."),
    hint: t(
      "Kamroq huquq, kamroq narsa, aniq versiya.",
      "Fewer rights, less inside, exact versions.",
    ),
    widget: {
      type: "sort",
      buckets: [
        { id: "safe", label: t("Xavfsiz", "Safe") },
        { id: "risky", label: t("Xavfli", "Risky") },
      ],
      items: [
        { label: t("USER node", "USER node"), bucket: "safe" },
        {
          label: t("docker run --privileged", "docker run --privileged"),
          bucket: "risky",
        },
        {
          label: t(".dockerignore fayli", "A .dockerignore file"),
          bucket: "safe",
        },
        {
          label: t(
            "Parolni ENV bilan obrazga yozish",
            "Baking a password in with ENV",
          ),
          bucket: "risky",
        },
        {
          label: t("Distroless bazaviy obraz", "A distroless base image"),
          bucket: "safe",
        },
        {
          label: t(
            "docker.sock’ni konteynerga ulash",
            "Mounting docker.sock into a container",
          ),
          bucket: "risky",
        },
      ],
    },
  },
  {
    id: 6,
    group: RUNTIME,
    title: t("Obrazlarni skanerlash", "Scanning images"),
    minutes: 6,
    intro: t(
      "Bazaviy obraz va kutubxonalarda vaqt o‘tishi bilan yangi zaifliklar (CVE) topiladi. Trivy, Grype yoki registry’ning o‘z skaneri obrazdagi paketlarni ma’lum CVE’lar bazasi bilan solishtiradi. Skanerni CI’ga qo‘ying: jiddiy (critical/high) zaiflik bo‘lsa, quruvchi to‘xtasin. Eski obrazlarni ham qayta skanerlang va bazaviy obraz yangilanganda qayta quring — kod o‘zgarmasa ham.",
      "New vulnerabilities (CVEs) are found in base images and libraries over time. Trivy, Grype or the registry’s own scanner compare the packages in an image against a database of known CVEs. Put the scanner in CI: if there is a critical or high finding, the build stops. Rescan old images too, and rebuild when the base image is updated — even if your code hasn’t changed.",
    ),
    analogy: t(
      "Oziq-ovqat yaroqlilik muddati: bugun yaxshi bo‘lgan narsa ertaga eskiradi.",
      "Food has a use-by date: what’s fine today goes off later.",
    ),
    theory: [
      t(
        "SBOM (dasturiy tarkib ro‘yxati) yangi CVE chiqqanda qaysi obrazlar ta’sirlanganini tez ko‘rsatadi.",
        "An SBOM (software bill of materials) shows quickly which images a new CVE affects.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t("Skaner — CI’da va muntazam.", "Scan in CI, and regularly."),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Obraz skaneri nimani topadi?",
            "What does an image scanner find?",
          ),
          options: [
            t(
              "Paketlardagi ma’lum zaifliklar (CVE)",
              "Known vulnerabilities (CVEs) in packages",
            ),
            t("Ilovadagi har qanday xato", "Every bug in the app"),
            t("Foydalanuvchi parollarini", "Users’ passwords"),
          ],
          answer: 0,
          explain: t(
            "U ma’lum zaifliklar bazasi bilan solishtiradi.",
            "It compares against a database of known flaws.",
          ),
        },
        {
          ask: t(
            "Kod o‘zgarmagan, lekin bazaviy obraz yangilandi. Nima qilasiz?",
            "Your code hasn’t changed but the base image was updated. What do you do?",
          ),
          options: [
            t("Obrazni qayta quraman", "Rebuild the image"),
            t("Hech narsa", "Nothing"),
            t("Skanerni o‘chiraman", "Turn off the scanner"),
          ],
          answer: 0,
          explain: t(
            "Yangi baza — tuzatilgan zaifliklar.",
            "A new base means fixed vulnerabilities.",
          ),
        },
        {
          ask: t(
            "CI’da critical zaiflik topildi. To‘g‘ri xatti-harakat?",
            "CI finds a critical vulnerability. The right behaviour?",
          ),
          options: [
            t("Quruvchi to‘xtaydi", "The build stops"),
            t("Baribir deploy qilinadi", "Deploy anyway"),
            t("Ogohlantirish yashiriladi", "Hide the warning"),
          ],
          answer: 0,
          explain: t(
            "Tuzatilgan yoki asoslab qabul qilingan bo‘lishi kerak.",
            "It must be fixed, or accepted with a reason.",
          ),
        },
      ],
    },
  },
  {
    id: 7,
    group: RUNTIME,
    title: t("Registry va imzolar", "Registries and signing"),
    minutes: 5,
    intro: t(
      "Obraz qayerdan kelganini bilish kerak. Faqat ishonchli registry’lardan (rasmiy obrazlar yoki kompaniyaning o‘z registry’si) foydalaning, registry’ni yopiq qiling va unga push qilish huquqini cheklang. Cosign kabi vositalar obrazni imzolaydi; klaster faqat imzolangan obrazlarni ishga tushirishi mumkin. Registry’dagi obrazlarda ham sir bo‘lmasligi kerak — ular ko‘p joyga tarqaladi.",
      "You need to know where an image came from. Use only trusted registries (official images or the company’s own registry), keep the registry private and limit who can push to it. Tools like Cosign sign images, and a cluster can be set to run only signed images. Images in the registry must not contain secrets either — they spread to many places.",
    ),
    analogy: t(
      "Dorixonadan muhrlangan dori olasiz, ko‘chadagi noma’lum sotuvchidan emas.",
      "You buy sealed medicine from a pharmacy, not from an unknown street seller.",
    ),
    theory: [
      t(
        "Nomga o‘xshash obrazlar (typosquatting) Docker Hub’da uchrab turadi: nomni diqqat bilan tekshiring.",
        "Look-alike image names (typosquatting) turn up on Docker Hub: check names carefully.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t("Ishonchli manba va imzo.", "A trusted source and a signature."),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Obraz imzosi nimani isbotlaydi?",
            "What does an image signature prove?",
          ),
          options: [
            t(
              "Obrazni kim qurgani va o‘zgarmaganini",
              "Who built the image and that it wasn’t changed",
            ),
            t("Obrazda zaiflik yo‘qligini", "That it has no vulnerabilities"),
            t("Obraz tezligini", "How fast it is"),
          ],
          answer: 0,
          explain: t(
            "Imzo — kelib chiqish, skaner — zaifliklar.",
            "A signature is about origin; scanning is about flaws.",
          ),
        },
        {
          ask: t(
            "Kompaniya registry’siga kim push qila olishi kerak?",
            "Who should be able to push to the company registry?",
          ),
          options: [
            t("Faqat CI pipeline", "Only the CI pipeline"),
            t("Internetdagi har kim", "Anyone on the internet"),
            t("Barcha xodimlar", "Every employee"),
          ],
          answer: 0,
          explain: t(
            "Obrazlar faqat tekshirilgan yo‘ldan keladi.",
            "Images arrive only by the checked path.",
          ),
        },
      ],
    },
  },
  {
    id: 8,
    group: RUNTIME,
    title: t("Yakuniy savollar", "Final questions"),
    minutes: 5,
    intro: t(
      "Xavfsiz konteyner: kichik va aniq versiyali bazaviy obraz, ichida sir yo‘q, root bo‘lmagan foydalanuvchi, kesilgan huquqlar, CI’da skanerlash va imzolangan obrazlar. Keyingi modul — Kubernetes: konteynerlar ko‘p bo‘lganda ularni qanday boshqarish va himoya qilish.",
      "A safe container: a small, pinned base image, no secrets inside, a non-root user, trimmed privileges, scanning in CI and signed images. Next module: Kubernetes — how to run and protect containers when there are many of them.",
    ),
    analogy: t(
      "Yaxshi qadoqlangan posilka: kerakli narsa, muhr va qabul qiluvchining aniq manzili.",
      "A well-packed parcel: only what’s needed, a seal, and a clear address.",
    ),
    theory: [
      t(
        "Har bir yangi Dockerfile’ni shu ro‘yxat bo‘yicha tekshiring.",
        "Check every new Dockerfile against this list.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t(
      "Kichik, sirsiz, root’siz, skanerlangan.",
      "Small, secret-free, non-root, scanned.",
    ),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Konteynerga API kalit qanday beriladi?",
            "How should an API key reach a container?",
          ),
          options: [
            t(
              "Ishga tushganda sirlar omboridan",
              "From the secret store at run time",
            ),
            t("Dockerfile’dagi ENV orqali", "Through ENV in the Dockerfile"),
            t("Obrazdagi faylda", "In a file inside the image"),
          ],
          answer: 0,
          explain: t(
            "Obraz sirsiz bo‘ladi va hamma joyda bir xil.",
            "The image stays secret-free and the same everywhere.",
          ),
        },
        {
          ask: t("Qaysi juftlik eng xavfsiz?", "Which pair is the safest?"),
          options: [
            t("USER node va --read-only", "USER node and --read-only"),
            t("USER root va --privileged", "USER root and --privileged"),
            t("latest va --net host", "latest and --net host"),
          ],
          answer: 0,
          explain: t(
            "Oddiy foydalanuvchi va o‘zgarmas fayl tizimi.",
            "An ordinary user and an unchangeable filesystem.",
          ),
        },
      ],
    },
  },
];
