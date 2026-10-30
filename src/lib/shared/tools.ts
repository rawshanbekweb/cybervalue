// Academy Intermediate · Shared responsibility: who looks after each layer
// of a system under IaaS, PaaS and SaaS. Simplified to two owners per row;
// real contracts spell out the shared middle in more detail.
import type { Text } from "../anim-lab/types";

const t = (uz: string, en: string): Text => ({ uz, en });

export const MODELS = ["iaas", "paas", "saas"] as const;
export type Model = (typeof MODELS)[number];

export const MODEL_NAMES: Record<Model, Text> = {
  iaas: t(
    "IaaS — virtual server (masalan, EC2)",
    "IaaS — a virtual server (e.g. EC2)",
  ),
  paas: t(
    "PaaS — boshqariladigan platforma (masalan, App Engine)",
    "PaaS — a managed platform (e.g. App Engine)",
  ),
  saas: t(
    "SaaS — tayyor xizmat (masalan, Google Workspace)",
    "SaaS — a finished service (e.g. Google Workspace)",
  ),
};

export type Owner = "provider" | "customer";

export type Layer = { id: string; name: Text; owner: Record<Model, Owner> };

export const LAYERS: Layer[] = [
  {
    id: "building",
    name: t(
      "Ma’lumotlar markazi binosi va qo‘riqlash",
      "The data centre building and guards",
    ),
    owner: { iaas: "provider", paas: "provider", saas: "provider" },
  },
  {
    id: "hardware",
    name: t("Serverlar va virtualizatsiya", "Servers and virtualisation"),
    owner: { iaas: "provider", paas: "provider", saas: "provider" },
  },
  {
    id: "os",
    name: t("Operatsion tizim yangilanishlari", "Operating system patches"),
    owner: { iaas: "customer", paas: "provider", saas: "provider" },
  },
  {
    id: "network",
    name: t(
      "Firewall va tarmoq qoidalari (security groups)",
      "Firewall and network rules (security groups)",
    ),
    owner: { iaas: "customer", paas: "customer", saas: "provider" },
  },
  {
    id: "app",
    name: t("Ilova kodi", "The application code"),
    owner: { iaas: "customer", paas: "customer", saas: "provider" },
  },
  {
    id: "data",
    name: t(
      "Ma’lumotlar va kim kirishi (foydalanuvchilar, MFA)",
      "The data and who gets in (users, MFA)",
    ),
    owner: { iaas: "customer", paas: "customer", saas: "customer" },
  },
];

export type Calls = Partial<Record<string, Owner>>;

export const splitRight = (model: Model, calls: Calls) =>
  LAYERS.every((l) => calls[l.id] === l.owner[model]);

/** How many layers the customer looks after under a model. */
export const customerShare = (model: Model) =>
  LAYERS.filter((l) => l.owner[model] === "customer").length;
