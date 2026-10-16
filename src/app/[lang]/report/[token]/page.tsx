import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getLocale, getTranslator } from "@/lib/i18n/server";
import { getDb } from "@/lib/db";
import { findReport } from "@/lib/reports";
import { ReportView } from "@/components/report/report-view";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslator();
  // A private page: never indexed, never sent as a referrer.
  return {
    title: t("Progress report"),
    robots: { index: false, follow: false },
    referrer: "no-referrer",
  };
}

export default async function ReportPage({
  params,
}: PageProps<"/[lang]/report/[token]">) {
  const { token } = await params;
  const db = getDb();
  if (!db) notFound();
  const report = await findReport(db, token);
  if (!report) notFound();
  const t = await getTranslator();
  const locale = await getLocale();
  return <ReportView report={report} t={t} locale={locale} />;
}
