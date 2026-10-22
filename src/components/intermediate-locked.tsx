import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getTranslator } from "@/lib/i18n/server";
import type { IntermediateAccess } from "@/lib/intermediate/access";
import { IntermediateAccessCard } from "@/components/intermediate-access";
import "@/components/learning.css";
import "@/components/intermediate.css";

// What an Intermediate lab shows to someone it is not open to yet.
export async function IntermediateLocked({
  access,
  path,
}: {
  access: Extract<IntermediateAccess, { open: false }>;
  path: string;
}) {
  const t = await getTranslator();
  return (
    <div className="container page-content">
      <Link className="text-link" href="/intermediate">
        <ArrowLeft size={16} aria-hidden="true" /> {t("Intermediate roadmap")}
      </Link>
      <header className="page-header learning-header">
        <span className="eyebrow">
          <span className="status-dot" /> ACADEMY INTERMEDIATE
        </span>
        <h1>{t("This lab is part of Intermediate.")}</h1>
      </header>
      <IntermediateAccessCard access={access} t={t} path={path} />
    </div>
  );
}
