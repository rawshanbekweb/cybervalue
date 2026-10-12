import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import QRCode from "qrcode";
import { getAdminLocale, getAdminTranslator } from "@/lib/i18n/server";
import { getDb } from "@/lib/db";
import { site } from "@/lib/site";
import { requireStudent } from "@/lib/student/session";
import {
  certificateUrl,
  formatCertificateCode,
  parseCertificateCode,
} from "@/lib/student/certificate";
import { levelText } from "@/lib/student/results";
import { PrintButton } from "@/components/student/print-button";

export async function generateMetadata() {
  const t = await getAdminTranslator();
  return { title: t("Certificate") };
}

// The student's own, valid certificate, laid out for printing. The QR code
// opens the public verification page.
export default async function StudentCertificatePage({
  params,
}: PageProps<"/student/certificate/[code]">) {
  const student = await requireStudent();
  const code = parseCertificateCode((await params).code);
  if (!code) notFound();
  const certificate = await getDb()?.studentCertificate.findFirst({
    where: { code, studentId: student.id, revokedAt: null },
  });
  if (!certificate) notFound();
  const t = await getAdminTranslator();
  const locale = await getAdminLocale();
  const url = certificateUrl(site.url, certificate.code);
  const svg = await QRCode.toString(url, { type: "svg", margin: 0 });
  const qr = `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
  const date = new Intl.DateTimeFormat(locale === "uz" ? "uz-UZ" : "en-GB", {
    dateStyle: "long",
    timeZone: "Asia/Tashkent",
  }).format(certificate.issuedAt);

  return (
    <article className="student-certificate-page">
      <div className="student-certificate-actions">
        <Link href="/student" className="student-ghost student-back">
          <ArrowLeft size={16} aria-hidden="true" />
          {t("All materials")}
        </Link>
        <PrintButton label={t("Print or save as PDF")} />
      </div>
      <section className="student-certificate" aria-label={t("Certificate")}>
        <p className="student-label">{t("Certificate")}</p>
        <p className="student-certificate-lead">{t("This certifies that")}</p>
        <h1 className="student-certificate-name">{certificate.name}</h1>
        <p className="student-certificate-lead">
          {t("has completed the course")}
        </p>
        <p className="student-certificate-title">{certificate.title}</p>
        {certificate.level && (
          <p className="student-certificate-meta">
            {t("Level: {level}", { level: levelText(certificate.level, t) })}
          </p>
        )}
        <div className="student-certificate-foot">
          <div>
            <p className="student-certificate-meta">{date}</p>
            <p className="student-certificate-meta">CyberValue</p>
            <p className="student-certificate-code">
              {formatCertificateCode(certificate.code)}
            </p>
          </div>
          <figure className="student-certificate-qr">
            {/* eslint-disable-next-line @next/next/no-img-element -- an inline SVG data URI */}
            <img src={qr} alt="" width={132} height={132} />
            <figcaption>{t("Scan to verify")}</figcaption>
          </figure>
        </div>
      </section>
    </article>
  );
}
