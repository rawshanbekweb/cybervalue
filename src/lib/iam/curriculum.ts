// Academy Intermediate · Cloud security, module 2: IAM. The lessons use
// ./tools.ts: an AWS-style policy evaluated on six requests.
import type { CommonWidget, Lesson, Text } from "../anim-lab/types";

export type Widget = CommonWidget | { type: "evaluate" };

export const PROGRESS_KEY = "cybervalue:iam:progress:v1";

const t = (uz: string, en: string): Text => ({ uz, en });

const POLICIES = t("Siyosatlar", "Policies");
const PRACTICE = t("Amalda", "In practice");

export const LESSONS: Lesson<Widget>[] = [
  {
    id: 1,
    group: POLICIES,
    title: t("Kimlar bor", "Who is there"),
    minutes: 5,
    intro: t(
      "IAM (Identity and Access Management) ikki savolga javob beradi: kim (identity) va u nima qila oladi (permissions). Bulutda “kim” faqat odamlar emas. Foydalanuvchilar — odamlar; guruhlar — bir xil huquqli odamlar to‘plami; rollar — vaqtinchalik olinadigan huquqlar to‘plami, ko‘pincha dastur va serverlar uchun; xizmat hisoblari (service accounts) — CI pipeline yoki ilova kabi odam bo‘lmagan ishchilar.",
      "IAM (Identity and Access Management) answers two questions: who (the identity) and what they may do (the permissions). In the cloud, “who” isn’t only people. Users are people; groups are sets of people with the same rights; roles are bundles of rights taken on temporarily, often by programs and servers; service accounts are non-human workers such as a CI pipeline or an app.",
    ),
    analogy: t(
      "Ofis binosi: xodim kartasi, bo‘lim kartasi va kun bo‘yi amal qiladigan mehmon kartasi.",
      "An office building: a staff badge, a department badge and a visitor pass good for one day.",
    ),
    theory: [
      t(
        "Huquqlar odamlarga emas, guruh va rollarga beriladi.",
        "Rights go to groups and roles, not to individuals.",
      ),
    ],
    task: t(
      "Bu odammi yoki odam bo‘lmagan ishchi?",
      "Is this a person or a non-human worker?",
    ),
    hint: t("Klaviaturada kim o‘tiradi?", "Who sits at the keyboard?"),
    widget: {
      type: "sort",
      buckets: [
        { id: "human", label: t("Odam", "A person") },
        {
          id: "workload",
          label: t("Dastur yoki xizmat", "A program or service"),
        },
      ],
      items: [
        { label: t("Dasturchi Aziza", "Aziza, a developer"), bucket: "human" },
        {
          label: t(
            "Har kecha deploy qiladigan CI pipeline",
            "The CI pipeline that deploys nightly",
          ),
          bucket: "workload",
        },
        {
          label: t(
            "S3 dan rasm o‘qiydigan EC2 serveri",
            "An EC2 server that reads images from S3",
          ),
          bucket: "workload",
        },
        {
          label: t("Hisobchi Bekzod", "Bekzod, an accountant"),
          bucket: "human",
        },
        {
          label: t(
            "Navbatdagi xabarlarni qayta ishlaydigan Lambda funksiyasi",
            "A Lambda function processing queued messages",
          ),
          bucket: "workload",
        },
      ],
    },
  },
  {
    id: 2,
    group: POLICIES,
    title: t("Siyosat qanday o‘qiladi", "Reading a policy"),
    minutes: 6,
    intro: t(
      "AWS siyosati — JSON hujjat, bayonotlar (statements) ro‘yxati. Har bir bayonotda: Effect (Allow yoki Deny), Action (masalan, `s3:GetObject`; `*` — har qanday) va Resource (ARN, masalan `arn:aws:s3:::bucket/*`). Uch qoida: sukut bo‘yicha hammasi taqiqlangan (implicit deny); mos kelgan Allow ruxsat beradi; mos kelgan aniq Deny esa har qanday Allow’dan ustun.",
      "An AWS policy is a JSON document: a list of statements. Each has an Effect (Allow or Deny), an Action (such as `s3:GetObject`; `*` means any) and a Resource (an ARN, such as `arn:aws:s3:::bucket/*`). Three rules: everything is denied by default (implicit deny); a matching Allow grants access; a matching explicit Deny beats any Allow.",
    ),
    analogy: t(
      "Klub qoidasi: ro‘yxatda bo‘lmasang — kirmaysan; ro‘yxatda bo‘lsang — kirasan; qora ro‘yxatda bo‘lsang — hech qachon.",
      "A club: not on the list, you don’t get in; on the list, you do; on the blacklist, never.",
    ),
    theory: [
      t(
        "`bucket/*` — bucket ichidagi obyektlar; `bucket` ning o‘zi (ro‘yxatlash uchun) — alohida resurs.",
        "`bucket/*` is the objects inside; `bucket` itself (for listing) is a separate resource.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t("Deny — har doim g‘olib.", "Deny always wins."),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Hech qaysi bayonot so‘rovga mos kelmadi. Natija?",
            "No statement matches a request. The result?",
          ),
          options: [
            t("Rad etiladi (implicit deny)", "Denied (implicit deny)"),
            t("Ruxsat beriladi", "Allowed"),
            t("Administrator so‘raladi", "An administrator is asked"),
          ],
          answer: 0,
          explain: t(
            "Ruxsat faqat aniq berilganda bor.",
            "Access exists only where it is granted.",
          ),
        },
        {
          ask: t(
            "Bitta so‘rovga Allow ham, Deny ham mos keldi. Natija?",
            "One request matches both an Allow and a Deny. The result?",
          ),
          options: [
            t("Rad etiladi", "Denied"),
            t("Ruxsat beriladi", "Allowed"),
            t("Birinchi yozilgani ishlaydi", "Whichever comes first"),
          ],
          answer: 0,
          explain: t(
            "Aniq Deny tartibdan qat’i nazar ustun.",
            "An explicit Deny wins whatever the order.",
          ),
        },
      ],
    },
  },
  {
    id: 3,
    group: POLICIES,
    title: t("So‘rovlarni baholash", "Evaluating requests"),
    minutes: 9,
    intro: t(
      "Quyida `reporter` foydalanuvchisining siyosati va u yuborgan oltita so‘rov. Uch qoidani qo‘llang va har bir so‘rov o‘tadimi yoki yo‘qmi, hal qiling. Keyin sabab ko‘rinadi: ruxsat, sukut bo‘yicha rad yoki aniq Deny.",
      "Below are the policy of the user `reporter` and six requests it made. Apply the three rules and decide whether each request goes through. The reason appears afterwards: allowed, denied by default or explicitly denied.",
    ),
    analogy: t(
      "Qorovul ro‘yxatni har safar boshidan oxirigacha o‘qiydi.",
      "A guard reads the whole list every single time.",
    ),
    theory: [
      t(
        "AWS’da IAM Policy Simulator aynan shu tekshiruvni bajaradi.",
        "On AWS, the IAM Policy Simulator does exactly this check.",
      ),
    ],
    task: t("Har bir so‘rovga ruxsat bormi?", "Is each request allowed?"),
    hint: t(
      "Avval Deny’ni, keyin Allow’ni tekshiring; hech biri bo‘lmasa — rad.",
      "Check for a Deny, then an Allow; neither means denied.",
    ),
    widget: { type: "evaluate" },
  },
  {
    id: 4,
    group: POLICIES,
    title: t("Eng kam huquq", "Least privilege"),
    minutes: 6,
    intro: t(
      '`"Action": "*", "Resource": "*"` — eng tez yoziladigan va eng xavfli siyosat: kalit sizsa, hujumchi butun hisobni oladi. Eng kam huquq — faqat kerakli harakat, faqat kerakli resursga, iloji bo‘lsa shart bilan (masalan, faqat kompaniya IP manzilidan yoki faqat MFA bilan). Boshlang‘ich siyosatni kichik qiling va kerak bo‘lganda kengaytiring — aksincha emas.',
      '`"Action": "*", "Resource": "*"` is the quickest policy to write and the most dangerous: if the key leaks, the attacker gets the whole account. Least privilege means only the needed action, on only the needed resource, with conditions where possible (only from the office IP, say, or only with MFA). Start small and widen when needed — never the other way round.',
    ),
    analogy: t(
      "Santexnikka butun uy kalitini emas, faqat hammom kalitini berish.",
      "Giving the plumber the bathroom key, not the keys to the whole house.",
    ),
    theory: [
      t(
        "Provayderning tayyor “AdministratorAccess” siyosati — faqat bir nechta admin uchun.",
        "The provider’s ready-made “AdministratorAccess” policy is for a handful of admins only.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t("Eng tor siyosat.", "The narrowest policy."),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Ilova faqat `acme-uploads` bucket’iga fayl yozishi kerak. Qaysi siyosat to‘g‘ri?",
            "An app only needs to write files to the `acme-uploads` bucket. Which policy fits?",
          ),
          options: [
            t(
              "Allow s3:PutObject on arn:aws:s3:::acme-uploads/*",
              "Allow s3:PutObject on arn:aws:s3:::acme-uploads/*",
            ),
            t("Allow s3:* on *", "Allow s3:* on *"),
            t("Allow * on *", "Allow * on *"),
          ],
          answer: 0,
          explain: t("Bitta harakat, bitta bucket.", "One action, one bucket."),
        },
        {
          ask: t(
            "Nega “hammasiga ruxsat” bilan boshlab, keyin toraytirish yomon?",
            "Why is starting with “allow everything” and narrowing later a bad idea?",
          ),
          options: [
            t(
              "“Keyin” ko‘pincha hech qachon kelmaydi va ortiqcha huquq qoladi",
              "“Later” rarely comes, so the extra rights stay",
            ),
            t("Siyosat ishlamaydi", "The policy won’t work"),
            t("Qimmatroq", "It costs more"),
          ],
          answer: 0,
          explain: t(
            "Kichikdan boshlab, kerak bo‘lganda kengaytiring.",
            "Start small and widen when needed.",
          ),
        },
      ],
    },
  },
  {
    id: 5,
    group: PRACTICE,
    title: t("Rollar va vaqtinchalik kalitlar", "Roles and temporary keys"),
    minutes: 6,
    intro: t(
      "Uzoq muddatli kirish kalitlari (access key) — kodga, noutbukka yoki GitHub’ga tushib qolishi mumkin bo‘lgan parollar. Yaxshisi — rollar: EC2 serveri yoki Lambda rolni oladi va provayder unga bir necha soatda o‘zi almashadigan vaqtinchalik kalit beradi. CI pipeline uchun OIDC: GitHub Actions bulutga kalitsiz, qisqa muddatli token bilan kiradi. Saqlanmagan kalit sizmaydi.",
      "Long-lived access keys are passwords that can end up in code, on a laptop or on GitHub. Roles are better: an EC2 server or a Lambda assumes a role, and the provider hands it temporary keys that rotate every few hours. For CI pipelines there is OIDC: GitHub Actions signs in to the cloud with a short-lived token and no stored key. A key that is never stored can’t leak.",
    ),
    analogy: t(
      "Doimiy kalit o‘rniga har kuni yangilanadigan mehmon kartasi.",
      "A visitor pass renewed every day instead of a permanent key.",
    ),
    theory: [
      t(
        "Agar uzoq muddatli kalit majburiy bo‘lsa: uni sirlar omborida saqlang va 90 kunda almashtiring.",
        "If a long-lived key is unavoidable: keep it in a secret store and rotate it every 90 days.",
      ),
    ],
    task: t("Bu yaxshi amaliyotmi yoki xavfli?", "Good practice or risky?"),
    hint: t(
      "Vaqtinchalik va saqlanmagan — yaxshi.",
      "Temporary and unstored is good.",
    ),
    widget: {
      type: "sort",
      buckets: [
        { id: "good", label: t("Yaxshi", "Good") },
        { id: "risky", label: t("Xavfli", "Risky") },
      ],
      items: [
        {
          label: t(
            "EC2 serveriga IAM roli biriktirish",
            "Attaching an IAM role to an EC2 server",
          ),
          bucket: "good",
        },
        {
          label: t(
            "Access key’ni ilova kodiga yozish",
            "Writing an access key into the app’s code",
          ),
          bucket: "risky",
        },
        {
          label: t(
            "GitHub Actions uchun OIDC bilan kirish",
            "Signing GitHub Actions in with OIDC",
          ),
          bucket: "good",
        },
        {
          label: t(
            "Uch yildan beri almashtirilmagan kirish kaliti",
            "An access key not rotated for three years",
          ),
          bucket: "risky",
        },
        {
          label: t(
            "Bitta kalitni butun jamoa bilan bo‘lishish",
            "Sharing one key across the whole team",
          ),
          bucket: "risky",
        },
      ],
    },
  },
  {
    id: 6,
    group: PRACTICE,
    title: t("Root hisob", "The root account"),
    minutes: 5,
    intro: t(
      "Bulut hisobining root (egasi) foydalanuvchisi hamma narsani qila oladi va uni hech qanday siyosat cheklamaydi. Shuning uchun: unga kuchli parol va xavfsizlik kaliti bilan MFA qo‘yiladi, kirish kalitlari umuman yaratilmaydi va u kundalik ishda ishlatilmaydi. Favqulodda (“break-glass”) holatlar uchun alohida admin hisob ham bo‘lishi mumkin — uning har bir kirishi ogohlantirish bilan kuzatiladi.",
      "A cloud account’s root (owner) user can do anything, and no policy can limit it. So: it gets a strong password and MFA with a security key, it has no access keys at all, and it isn’t used for daily work. There may also be a separate “break-glass” admin account for emergencies — every sign-in to it raises an alert.",
    ),
    analogy: t(
      "Bosh kalit seyfda yotadi; uni olish — jurnalga yoziladi va hammaga ma’lum qilinadi.",
      "The master key sits in a safe; taking it out is logged and everyone is told.",
    ),
    theory: [
      t(
        "AWS Organizations’da SCP siyosatlari hatto ichki hisoblardagi root’ni ham cheklaydi.",
        "In AWS Organizations, SCPs can restrict even the root user of member accounts.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t("Root — faqat favqulodda.", "Root is for emergencies only."),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Root hisob uchun to‘g‘ri amaliyot?",
            "The right practice for the root account?",
          ),
          options: [
            t(
              "MFA, kirish kalitlari yo‘q, kundalik ishda ishlatilmaydi",
              "MFA, no access keys, not used day to day",
            ),
            t(
              "Root kalitlari bilan CI pipeline ishlatish",
              "Running the CI pipeline with root keys",
            ),
            t(
              "Parolni jamoa chatida saqlash",
              "Keeping the password in the team chat",
            ),
          ],
          answer: 0,
          explain: t(
            "Root’ni hech qanday siyosat to‘xtatmaydi.",
            "No policy can stop root.",
          ),
        },
        {
          ask: t(
            "Root hisobga kirildi, lekin hech kim rejalashtirmagan edi. Nima qilasiz?",
            "Someone signed in as root and nobody planned it. What do you do?",
          ),
          options: [
            t(
              "Darhol hodisa sifatida tekshiring",
              "Treat it as an incident right away",
            ),
            t("E’tiborsiz qoldiring", "Ignore it"),
            t("Ertaga qarab chiqing", "Look at it tomorrow"),
          ],
          answer: 0,
          explain: t(
            "Root kirishi — eng muhim ogohlantirishlardan biri.",
            "A root sign-in is one of the most important alerts.",
          ),
        },
      ],
    },
  },
  {
    id: 7,
    group: PRACTICE,
    title: t("Huquqlarni qayta ko‘rib chiqish", "Reviewing access"),
    minutes: 5,
    intro: t(
      "Huquqlar vaqt o‘tib to‘planadi: odamlar bo‘lim almashtiradi, loyihalar tugaydi, lekin ruxsatlar qoladi. Muntazam (masalan, har chorakda) tekshiruv: 90 kundan beri ishlatilmagan huquq va kalitlarni olib tashlash, ishdan ketganlarni o‘chirish va tashqi hisoblarga berilgan kirishni ko‘rib chiqish. IAM Access Analyzer va “last accessed” ma’lumotlari qaysi huquq hech qachon ishlatilmaganini ko‘rsatadi.",
      "Rights pile up over time: people change teams, projects end, but the permissions stay. A regular review — every quarter, say — removes rights and keys unused for 90 days, deletes leavers and checks access granted to outside accounts. IAM Access Analyzer and “last accessed” data show which permissions have never been used.",
    ),
    analogy: t(
      "Yil oxirida ofis kalitlarini yig‘ib, kimda nima borligini tekshirish.",
      "Collecting the office keys at year end and checking who holds what.",
    ),
    theory: [
      t(
        "Ishdan ketish jarayoniga bulut hisoblarini o‘chirishni qo‘shing.",
        "Put cloud account removal on the leaver checklist.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t("Ishlatilmagan — olib tashlanadi.", "Unused means removed."),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Kalit 200 kundan beri ishlatilmagan. Nima qilinadi?",
            "A key hasn’t been used for 200 days. What happens to it?",
          ),
          options: [
            t("O‘chiriladi", "It is deleted"),
            t("Kerak bo‘lib qolar deb qoldiriladi", "It stays, just in case"),
            t("Uning huquqlari kengaytiriladi", "Its rights are widened"),
          ],
          answer: 0,
          explain: t(
            "Ishlatilmaydigan kalit — faqat xavf.",
            "An unused key is pure risk.",
          ),
        },
        {
          ask: t(
            "Qaysi huquq hech qachon ishlatilmaganini nima ko‘rsatadi?",
            "What shows which permissions have never been used?",
          ),
          options: [
            t(
              "“Last accessed” ma’lumotlari va IAM Access Analyzer",
              "“Last accessed” data and IAM Access Analyzer",
            ),
            t("Xarajatlar hisoboti", "The billing report"),
            t("Hech narsa", "Nothing"),
          ],
          answer: 0,
          explain: t(
            "Shunga qarab siyosatni toraytirasiz.",
            "Use it to narrow the policy.",
          ),
        },
      ],
    },
  },
  {
    id: 8,
    group: PRACTICE,
    title: t("Yakuniy savollar", "Final questions"),
    minutes: 5,
    intro: t(
      "IAM — bulut xavfsizligining yuragi: deyarli har bir buzilish “kimdadir keragidan ko‘p huquq bor edi” bilan tugaydi. Sukut bo‘yicha rad, eng kam huquq, saqlanmaydigan vaqtinchalik kalitlar, himoyalangan root va muntazam tekshiruv — beshta odat.",
      "IAM is the heart of cloud security: almost every breach ends with “someone had more rights than they needed”. Deny by default, least privilege, temporary keys that are never stored, a protected root and regular reviews — five habits.",
    ),
    analogy: t(
      "Kalitlar to‘plami qanchalik kichik bo‘lsa, yo‘qotish shunchalik kam zarar.",
      "The smaller the bunch of keys, the less losing it costs.",
    ),
    theory: [
      t(
        "Keyingi modul: ma’lumotlar qayerda yotadi va sirlar qanday saqlanadi.",
        "Next module: where data lives and how secrets are kept.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t("Besh odat.", "Five habits."),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Siyosatda Allow s3:* on bucket/* va Deny s3:* on bucket/secret/* bor. bucket/secret/a.txt ni o‘qish?",
            "A policy has Allow s3:* on bucket/* and Deny s3:* on bucket/secret/*. Reading bucket/secret/a.txt?",
          ),
          options: [
            t("Rad etiladi", "Denied"),
            t("Ruxsat beriladi", "Allowed"),
            t("Bilib bo‘lmaydi", "Can’t tell"),
          ],
          answer: 0,
          explain: t("Aniq Deny — g‘olib.", "The explicit Deny wins."),
        },
        {
          ask: t(
            "Server bulut xizmatiga qanday kirishi kerak?",
            "How should a server reach a cloud service?",
          ),
          options: [
            t(
              "Biriktirilgan rol va vaqtinchalik kalitlar bilan",
              "Through an attached role and temporary keys",
            ),
            t(
              "Faylda saqlangan doimiy kalit bilan",
              "With a permanent key saved in a file",
            ),
            t("Root kalitlari bilan", "With root keys"),
          ],
          answer: 0,
          explain: t(
            "Saqlanmagan kalit sizmaydi.",
            "A key that isn’t stored can’t leak.",
          ),
        },
      ],
    },
  },
];
