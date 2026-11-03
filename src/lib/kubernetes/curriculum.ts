// Academy Intermediate · Cloud security, module 5: Kubernetes basics.
// The lessons use ./tools.ts: eight cluster settings to call safe or risky.
import type { CommonWidget, Lesson, Text } from "../anim-lab/types";

export type Widget = CommonWidget | { type: "manifest" };

export const PROGRESS_KEY = "cybervalue:kubernetes:progress:v1";

const t = (uz: string, en: string): Text => ({ uz, en });

const WORKLOADS = t("Ish yuklari", "Workloads");
const CLUSTER = t("Klaster", "The cluster");

export const LESSONS: Lesson<Widget>[] = [
  {
    id: 1,
    group: WORKLOADS,
    title: t("Kubernetes nima", "What Kubernetes is"),
    minutes: 5,
    intro: t(
      "Kubernetes ko‘plab konteynerlarni bir nechta serverda (node) boshqaradi. Eng kichik birlik — pod: bitta yoki bir nechta konteyner. Deployment podlar sonini ushlab turadi, Service ularga doimiy manzil beradi. Hammasi API server orqali boshqariladi: kubectl, CI va klaster ichidagi dasturlar ham unga murojaat qiladi. Shuning uchun API serverga kim nima qila olishi — klaster xavfsizligining markazi.",
      "Kubernetes runs many containers across several servers (nodes). The smallest unit is a pod: one or more containers. A Deployment keeps the right number of pods running, and a Service gives them a stable address. Everything is managed through the API server: kubectl, CI and programs inside the cluster all talk to it. So who may do what on the API server is the heart of cluster security.",
    ),
    analogy: t(
      "Port: kemalar (node), konteynerlar (pod) va hammasini boshqaradigan dispetcher minorasi (API server).",
      "A port: ships (nodes), containers (pods), and the control tower that directs them all (the API server).",
    ),
    theory: [
      t(
        "Klaster holati etcd bazasida saqlanadi — u ham himoyalanishi kerak.",
        "The cluster’s state lives in the etcd database, which needs protecting too.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t("Pod — eng kichik birlik.", "A pod is the smallest unit."),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Kubernetes’dagi eng kichik ishga tushiriladigan birlik?",
            "The smallest unit Kubernetes runs?",
          ),
          options: [
            t("Pod", "A pod"),
            t("Node", "A node"),
            t("Namespace", "A namespace"),
          ],
          answer: 0,
          explain: t(
            "Pod ichida bir yoki bir nechta konteyner bo‘ladi.",
            "A pod holds one or more containers.",
          ),
        },
        {
          ask: t(
            "Klasterni boshqarishning yagona kirish nuqtasi?",
            "The single entry point for managing the cluster?",
          ),
          options: [
            t("API server", "The API server"),
            t("Har bir node’ning SSH’i", "Each node’s SSH"),
            t("Docker Hub", "Docker Hub"),
          ],
          answer: 0,
          explain: t(
            "Unga kirish huquqlari RBAC bilan cheklanadi.",
            "Access to it is limited with RBAC.",
          ),
        },
      ],
    },
  },
  {
    id: 2,
    group: WORKLOADS,
    title: t("Pod xavfsizligi", "Pod security"),
    minutes: 6,
    intro: t(
      "Pod’ning securityContext’i konteyner qanday huquqlar bilan ishlashini belgilaydi: `runAsNonRoot`, `readOnlyRootFilesystem`, `allowPrivilegeEscalation: false` va capability’larni olib tashlash. Kubernetes’ning Pod Security Standards uch darajani beradi: privileged (cheklovsiz), baseline (eng xavfli narsalar taqiqlangan) va restricted (eng qat’iy). Namespace’ga `restricted` belgisini qo‘ysangiz, xavfli podlar umuman yaratilmaydi.",
      "A pod’s securityContext sets the rights its containers run with: `runAsNonRoot`, `readOnlyRootFilesystem`, `allowPrivilegeEscalation: false` and dropping capabilities. Kubernetes’ Pod Security Standards give three levels: privileged (no limits), baseline (the most dangerous things blocked) and restricted (the strictest). Label a namespace `restricted` and risky pods are never created at all.",
    ),
    analogy: t(
      "Bino qoidalari: har xonaga kirish ruxsati alohida, qoidaga to‘g‘ri kelmagan mehmon kirmaydi.",
      "Building rules: each room has its own access, and a guest who breaks the rules isn’t let in.",
    ),
    theory: [
      t(
        "Resurs cheklovlari (limits) bitta podning butun node’ni to‘xtatib qo‘yishidan saqlaydi.",
        "Resource limits stop one pod from starving the whole node.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t("restricted — eng qat’iy.", "restricted is the strictest."),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Pod Security Standards’ning eng qat’iy darajasi?",
            "The strictest Pod Security Standards level?",
          ),
          options: [
            t("restricted", "restricted"),
            t("baseline", "baseline"),
            t("privileged", "privileged"),
          ],
          answer: 0,
          explain: t(
            "Ilovalar uchun maqsad — restricted.",
            "For applications, aim for restricted.",
          ),
        },
        {
          ask: t(
            "runAsNonRoot: true nima qiladi?",
            "What does runAsNonRoot: true do?",
          ),
          options: [
            t(
              "Root bo‘lib ishga tushadigan konteynerni to‘xtatadi",
              "Stops a container that would start as root",
            ),
            t("Podni o‘chiradi", "Deletes the pod"),
            t("Tarmoqni yopadi", "Closes the network"),
          ],
          answer: 0,
          explain: t(
            "Obrazda USER bo‘lmasa, pod ishga tushmaydi.",
            "Without a USER in the image, the pod won’t start.",
          ),
        },
      ],
    },
  },
  {
    id: 3,
    group: WORKLOADS,
    title: t("Manifestni tekshirish", "Reviewing a manifest"),
    minutes: 8,
    intro: t(
      "Quyida kompaniya ilovasining Deployment va RoleBinding’idan sakkizta sozlama. Ularning to‘rttasi xavfli. Har birini o‘qing: pod xostga qanchalik yaqin, qanday huquqlar bilan ishlaydi va uning ServiceAccount’i nima qila oladi?",
      "Below are eight settings from a company app’s Deployment and RoleBinding. Four of them are risky. Read each one: how close does the pod get to the host, which rights does it run with, and what can its ServiceAccount do?",
    ),
    analogy: t(
      "Shartnomani imzolashdan oldin har bir bandni o‘qish.",
      "Reading every clause before signing a contract.",
    ),
    theory: [
      t(
        "kube-score, Kubescape va Checkov kabi vositalar manifestlarni avtomatik tekshiradi.",
        "Tools like kube-score, Kubescape and Checkov check manifests automatically.",
      ),
    ],
    task: t(
      "Har bir sozlama xavfsizmi yoki xavflimi?",
      "Is each setting safe or risky?",
    ),
    hint: t(
      "Xostga yaqinlik va ortiqcha huquq.",
      "Closeness to the host, and rights it doesn’t need.",
    ),
    widget: { type: "manifest" },
  },
  {
    id: 4,
    group: CLUSTER,
    title: t("RBAC", "RBAC"),
    minutes: 6,
    intro: t(
      "RBAC — rolga asoslangan kirish: Role (yoki butun klaster uchun ClusterRole) qaysi resursda qaysi amal (get, list, create, delete) mumkinligini aytadi, RoleBinding esa uni foydalanuvchi yoki ServiceAccount’ga beradi. Har bir pod o‘z ServiceAccount’i tokeniga ega, shuning uchun podga kerakmas huquq bermang: alohida ServiceAccount, faqat kerakli Role va API kerak bo‘lmasa `automountServiceAccountToken: false`. cluster-admin faqat bir nechta odam uchun.",
      "RBAC is role-based access: a Role (or a ClusterRole for the whole cluster) says which actions (get, list, create, delete) are allowed on which resources, and a RoleBinding grants it to a user or a ServiceAccount. Every pod carries its ServiceAccount’s token, so don’t give a pod rights it doesn’t need: its own ServiceAccount, only the Role it needs, and `automountServiceAccountToken: false` if it never calls the API. cluster-admin is for a handful of people only.",
    ),
    analogy: t(
      "Xodim kartasi faqat o‘z bo‘limi eshiklarini ochadi.",
      "A staff card opens only the doors of its own department.",
    ),
    theory: [
      t(
        "`kubectl auth can-i --list --as=…` kimning nima qila olishini ko‘rsatadi.",
        "`kubectl auth can-i --list --as=…` shows what someone can do.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t(
      "Eng kam huquq, alohida ServiceAccount.",
      "Least privilege, its own ServiceAccount.",
    ),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Role’ni ServiceAccount’ga nima bog‘laydi?",
            "What grants a Role to a ServiceAccount?",
          ),
          options: [
            t("RoleBinding", "A RoleBinding"),
            t("Service", "A Service"),
            t("ConfigMap", "A ConfigMap"),
          ],
          answer: 0,
          explain: t(
            "Butun klaster uchun — ClusterRoleBinding.",
            "For the whole cluster, a ClusterRoleBinding.",
          ),
        },
        {
          ask: t(
            "Pod API serverga umuman murojaat qilmaydi. Nima qilasiz?",
            "A pod never calls the API server. What do you do?",
          ),
          options: [
            t(
              "automountServiceAccountToken: false",
              "automountServiceAccountToken: false",
            ),
            t("Unga cluster-admin beraman", "Give it cluster-admin"),
            t("Hech narsa", "Nothing"),
          ],
          answer: 0,
          explain: t(
            "Token bo‘lmasa, o‘g‘irlanadigan narsa ham yo‘q.",
            "No token means nothing to steal.",
          ),
        },
        {
          ask: t(
            "Qaysi huquq ayniqsa xavfli?",
            "Which permission is especially dangerous?",
          ),
          options: [
            t(
              "Barcha namespace’larda secrets’ni o‘qish",
              "Reading secrets in every namespace",
            ),
            t("O‘z podlari loglarini o‘qish", "Reading its own pods’ logs"),
            t("O‘z ConfigMap’ini o‘qish", "Reading its own ConfigMap"),
          ],
          answer: 0,
          explain: t(
            "Bu barcha ilovalarning parol va kalitlarini beradi.",
            "That hands over every app’s passwords and keys.",
          ),
        },
      ],
    },
  },
  {
    id: 5,
    group: CLUSTER,
    title: t("Network policy", "Network policies"),
    minutes: 6,
    intro: t(
      "Sukut bo‘yicha Kubernetes’da har bir pod istalgan boshqa podga ulana oladi. Bitta pod buzilsa, hujumchi klaster bo‘ylab erkin yuradi. NetworkPolicy buni cheklaydi: avval namespace uchun “default deny”, keyin faqat kerakli yo‘llar — masalan frontend → api → database. Policy ishlashi uchun klaster tarmoq plagini (CNI, masalan Calico yoki Cilium) uni qo‘llab-quvvatlashi kerak. Har bir yo‘lni to‘g‘ri guruhga ajrating.",
      "By default, every pod in Kubernetes can connect to every other pod. If one pod is compromised, the attacker moves freely across the cluster. NetworkPolicies limit that: first a “default deny” for the namespace, then only the paths needed — for example frontend → api → database. For policies to work, the cluster’s network plugin (the CNI, such as Calico or Cilium) must support them. Sort each habit into the right group.",
    ),
    analogy: t(
      "Ofisda har bir xona ochiq bo‘lishi o‘rniga, faqat kerakli eshiklar uchun kalit.",
      "Instead of every office room being open, keys only for the doors people need.",
    ),
    theory: [
      t(
        "Chiquvchi trafikni (egress) ham cheklang: database podi internetga chiqmasligi kerak.",
        "Limit outgoing traffic (egress) too: a database pod has no reason to reach the internet.",
      ),
    ],
    task: t("Odatlarni ajrating.", "Sort the habits."),
    hint: t(
      "Avval hammasini yopish, keyin keraklisini ochish.",
      "Close everything first, then open what’s needed.",
    ),
    widget: {
      type: "sort",
      buckets: [
        { id: "safe", label: t("Xavfsiz", "Safe") },
        { id: "risky", label: t("Xavfli", "Risky") },
      ],
      items: [
        {
          label: t(
            "Namespace uchun default deny",
            "Default deny for the namespace",
          ),
          bucket: "safe",
        },
        {
          label: t(
            "Faqat api → database ruxsati",
            "Allowing only api → database",
          ),
          bucket: "safe",
        },
        {
          label: t("Hech qanday NetworkPolicy yo‘q", "No NetworkPolicy at all"),
          bucket: "risky",
        },
        {
          label: t(
            "Database podiga internetga chiqish ruxsati",
            "Letting the database pod reach the internet",
          ),
          bucket: "risky",
        },
        {
          label: t("Egress’ni ham cheklash", "Limiting egress too"),
          bucket: "safe",
        },
        {
          label: t(
            "Hamma podlarga hostNetwork: true",
            "hostNetwork: true on every pod",
          ),
          bucket: "risky",
        },
      ],
    },
  },
  {
    id: 6,
    group: CLUSTER,
    title: t("Kubernetes Secrets", "Kubernetes Secrets"),
    minutes: 5,
    intro: t(
      "Kubernetes Secret obyektidagi qiymat sukut bo‘yicha faqat base64 bilan kodlangan — bu shifrlash emas, uni har kim ochadi. Shuning uchun: etcd’da shifrlashni (encryption at rest) yoqing, secrets’ni o‘qish huquqini RBAC bilan qattiq cheklang, Secret’larni Git’ga oddiy holda qo‘ymang va iloji bo‘lsa tashqi sirlar omboridan (Vault, bulut Secrets Manager) External Secrets yoki CSI driver orqali oling.",
      "The value in a Kubernetes Secret is, by default, only base64-encoded — that isn’t encryption, and anyone can decode it. So: switch on encryption at rest for etcd, restrict who can read secrets tightly with RBAC, never commit plain Secrets to Git, and where possible pull them from an external secret store (Vault, a cloud Secrets Manager) through External Secrets or a CSI driver.",
    ),
    analogy: t(
      "Konvertga solingan xat — yopiq ko‘rinadi, lekin qulflangan emas.",
      "A letter in an envelope looks closed, but it isn’t locked.",
    ),
    theory: [
      t(
        "Sealed Secrets yoki SOPS shifrlangan Secret’larni Git’da saqlashga imkon beradi.",
        "Sealed Secrets or SOPS let you keep encrypted Secrets in Git.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t("base64 — shifr emas.", "base64 isn’t encryption."),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Secret’dagi base64 qiymat himoyalanganmi?",
            "Is a base64 value in a Secret protected?",
          ),
          options: [
            t("Yo‘q, u faqat kodlangan", "No, it is only encoded"),
            t("Ha, AES bilan shifrlangan", "Yes, it is AES-encrypted"),
            t("Ha, uni ochib bo‘lmaydi", "Yes, it can’t be decoded"),
          ],
          answer: 0,
          explain: t(
            "`base64 -d` uni bir zumda ochadi.",
            "`base64 -d` decodes it instantly.",
          ),
        },
        {
          ask: t(
            "Secret’larni saqlashning eng yaxshi yo‘li?",
            "The best way to keep Secrets?",
          ),
          options: [
            t(
              "Tashqi sirlar omboridan olish va etcd shifrlash",
              "Pull from an external store, and encrypt etcd",
            ),
            t("Git’da oddiy YAML", "Plain YAML in Git"),
            t("Obraz ichida", "Inside the image"),
          ],
          answer: 0,
          explain: t(
            "Va o‘qish huquqini RBAC bilan cheklash.",
            "And restrict reading with RBAC.",
          ),
        },
      ],
    },
  },
  {
    id: 7,
    group: CLUSTER,
    title: t("Klasterni himoyalash", "Protecting the cluster"),
    minutes: 5,
    intro: t(
      "Klasterning o‘zi ham qarovni talab qiladi. API serverni internetga ochiq qoldirmang (yoki faqat ruxsat etilgan IP’lardan), Kubernetes versiyasini yangilab boring, audit loglarni yoqing va ularni kuzating, node’larni minimal OS bilan ishlating. Boshqariladigan xizmatlar (EKS, AKS, GKE) control plane’ni provayderga beradi — lekin ish yuklari, RBAC va tarmoq siyosatlari hali ham sizning vazifangiz.",
      "The cluster itself needs care too. Don’t leave the API server open to the internet (or allow only approved IPs), keep the Kubernetes version up to date, switch on audit logs and watch them, and run nodes on a minimal OS. Managed services (EKS, AKS, GKE) hand the control plane to the provider — but workloads, RBAC and network policies are still your job.",
    ),
    analogy: t(
      "Umumiy javobgarlik: bino egasi tom va devorga qaraydi, siz esa o‘z xonangiz eshigiga.",
      "Shared responsibility: the landlord looks after the roof and walls; you lock your own door.",
    ),
    theory: [
      t(
        "CIS Kubernetes Benchmark va kube-bench klaster sozlamalarini tekshiradi.",
        "The CIS Kubernetes Benchmark and kube-bench check cluster settings.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t(
      "Yopiq API, yangi versiya, audit loglar.",
      "A closed API, a current version, audit logs.",
    ),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Boshqariladigan klasterda (EKS) RBAC kimning vazifasi?",
            "On a managed cluster (EKS), whose job is RBAC?",
          ),
          options: [
            t("Sizniki", "Yours"),
            t("Faqat provayderniki", "Only the provider’s"),
            t("Hech kimniki", "No one’s"),
          ],
          answer: 0,
          explain: t(
            "Provayder control plane’ni boshqaradi, ichidagini — siz.",
            "The provider runs the control plane; what’s inside is yours.",
          ),
        },
        {
          ask: t(
            "Kim nima qilganini qayerdan bilasiz?",
            "Where do you find out who did what?",
          ),
          options: [
            t(
              "API server audit loglaridan",
              "From the API server’s audit logs",
            ),
            t("Pod nomlaridan", "From pod names"),
            t("Obraz teglaridan", "From image tags"),
          ],
          answer: 0,
          explain: t(
            "Har bir API so‘rov audit logda yoziladi.",
            "Every API request is written to the audit log.",
          ),
        },
      ],
    },
  },
  {
    id: 8,
    group: CLUSTER,
    title: t("Yakuniy savollar", "Final questions"),
    minutes: 5,
    intro: t(
      "Kubernetes xavfsizligi qatlamlardan iborat: restricted podlar (root’siz, privileged’siz, xost resurslarisiz), har bir ilova uchun eng kam huquqli ServiceAccount, default deny tarmoq siyosatlari, shifrlangan va tashqaridan olinadigan sirlar, yopiq API server va audit loglar. Bu Cloud security yo‘nalishining oxirgi moduli.",
      "Kubernetes security comes in layers: restricted pods (no root, no privileged, no host resources), a least-privilege ServiceAccount for each app, default-deny network policies, encrypted secrets pulled from outside, a closed API server and audit logs. This is the last module of the Cloud security track.",
    ),
    analogy: t(
      "Qal’a: devor, darvoza, qorovul va har bir xonaning o‘z kaliti.",
      "A castle: walls, a gate, guards, and a key for every room.",
    ),
    theory: [
      t(
        "Har bir yangi manifestni CI’da avtomatik tekshiring.",
        "Check every new manifest automatically in CI.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t(
      "Restricted, eng kam huquq, default deny.",
      "Restricted, least privilege, default deny.",
    ),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Sukut bo‘yicha podlar bir-biriga ulana oladimi?",
            "By default, can pods connect to each other?",
          ),
          options: [
            t("Ha, hammasi hammaga", "Yes, all to all"),
            t("Yo‘q, hech biri", "No, none can"),
            t("Faqat bir namespace ichida", "Only within one namespace"),
          ],
          answer: 0,
          explain: t(
            "Shuning uchun default deny NetworkPolicy kerak.",
            "That’s why you need a default-deny NetworkPolicy.",
          ),
        },
        {
          ask: t("Qaysi sozlama eng xavfsiz?", "Which setting is the safest?"),
          options: [
            t("runAsNonRoot: true", "runAsNonRoot: true"),
            t("privileged: true", "privileged: true"),
            t("hostNetwork: true", "hostNetwork: true"),
          ],
          answer: 0,
          explain: t(
            "Qolgan ikkitasi podni xostga yaqinlashtiradi.",
            "The other two bring the pod closer to the host.",
          ),
        },
      ],
    },
  },
];
