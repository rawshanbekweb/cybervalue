// Academy Intermediate · Kubernetes basics: eight settings from an invented
// company's Deployment and RoleBinding, four of them risky.
import type { Text } from "../anim-lab/types";

const t = (uz: string, en: string): Text => ({ uz, en });

export type Setting = {
  code: string;
  risky: boolean;
  why: Text;
};

export const SETTINGS: Setting[] = [
  {
    code: "image: shop/api@sha256:9f2c…",
    risky: false,
    why: t("Digest bo‘yicha qotirilgan obraz.", "An image pinned by digest."),
  },
  {
    code: "securityContext.privileged: true",
    risky: true,
    why: t(
      "Privileged pod xost qurilmalari va yadrosiga deyarli to‘liq kiradi.",
      "A privileged pod gets near-full access to the host’s devices and kernel.",
    ),
  },
  {
    code: "securityContext.runAsNonRoot: true",
    risky: false,
    why: t(
      "Konteyner root bo‘lib ishga tushmaydi.",
      "The container can’t start as root.",
    ),
  },
  {
    code: "volumes: hostPath: { path: / }",
    risky: true,
    why: t(
      "Xostning butun fayl tizimi pod ichiga ulangan.",
      "The host’s whole filesystem is mounted into the pod.",
    ),
  },
  {
    code: "resources.limits: { cpu: 500m, memory: 256Mi }",
    risky: false,
    why: t(
      "Bitta pod butun node resursini yeb qo‘ya olmaydi.",
      "One pod can’t eat the whole node’s resources.",
    ),
  },
  {
    code: "RoleBinding: default ServiceAccount → cluster-admin",
    risky: true,
    why: t(
      "Poddagi har qanday kod butun klasterni boshqara oladi.",
      "Any code in the pod can control the whole cluster.",
    ),
  },
  {
    code: "securityContext.readOnlyRootFilesystem: true",
    risky: false,
    why: t(
      "Konteyner fayl tizimi o‘zgarmas.",
      "The container’s filesystem can’t be changed.",
    ),
  },
  {
    code: "hostNetwork: true",
    risky: true,
    why: t(
      "Pod xost tarmog‘ida ishlaydi va NetworkPolicy uni cheklamaydi.",
      "The pod sits on the host’s network and NetworkPolicies don’t limit it.",
    ),
  },
];

export type Calls = Record<number, boolean>;

/** Every setting called, and each call (risky or not) right. */
export const settingsRight = (calls: Calls) =>
  SETTINGS.every((s, i) => calls[i] === s.risky);
