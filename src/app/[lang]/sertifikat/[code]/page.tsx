import { BadgeCheck, CircleX } from "lucide-react";
import { getDb } from "@/lib/db";
import { getLocale, getTranslator } from "@/lib/i18n/server";
import { metadata } from "@/lib/seo";
import {
  CERTIFICATE_PATH,
  formatCertificateCode,
  parseCertificateCode,
} from "@/lib/student/certificate";
import { levelText } from "@/lib/student/results";

// Opened from the QR code on a printed certificate. Rendered on request and
// cached briefly, so a revoked certificate shows as invalid within a minute.
export const revalidate = 60;

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/sertifikat/[code]">) {
  const { code } = await params;
  return metadata(
    "Certificate check",
    "Confirms a Cybervalue course certificate.",
    `${CERTIFICATE_PATH}/${code}`,
    true,
  );
}

async function findCertificate(raw: string) {
  const code = parseCertificateCode(decodeURIComponent(raw));
  if (!code) return null;
  return (
    (await getDb()?.studentCertificate.findUnique({ where: { code } })) ?? null
  );
}

export default async function CertificateCheckPage({
  params,
}: PageProps<"/[lang]/sertifikat/[code]">) {
  const t = await getTranslator();
  const locale = await getLocale();
  const certificate = await findCertificate((await params).code);
  const date = (value: Date) =>
    new Intl.DateTimeFormat(locale === "uz" ? "uz-UZ" : "en-GB", {
      dateStyle: "long",
      timeZone: "Asia/Tashkent",
    }).format(value);

  if (!certificate || certificate.revokedAt)
    return (
      <div className="container certificate-check">
        <p className="certificate-status certificate-status-bad">
          <CircleX size={20} aria-hidden="true" />
          {certificate
            ? t("This certificate has been revoked")
            : t("No certificate with this code")}
        </p>
        <h1>{t("Not a valid certificate.")}</h1>
        <p>
          {certificate
            ? t(
                "Cybervalue issued this certificate, but it is no longer valid since {date}.",
                { date: date(certificate.revokedAt!) },
              )
            : t(
                "Check that the code matches the one printed under the QR code. If it does, the certificate was not issued by Cybervalue.",
              )}
        </p>
      </div>
    );

  return (
    <div className="container certificate-check">
      <p className="certificate-status certificate-status-ok">
        <BadgeCheck size={20} aria-hidden="true" />
        {t("Valid certificate")}
      </p>
      <h1>{certificate.name}</h1>
      <dl className="certificate-facts">
        <div>
          <dt>{t("Course")}</dt>
          <dd>{certificate.title}</dd>
        </div>
        {certificate.level && (
          <div>
            <dt>{t("Level")}</dt>
            <dd>{levelText(certificate.level, t)}</dd>
          </div>
        )}
        <div>
          <dt>{t("Issued")}</dt>
          <dd>{date(certificate.issuedAt)}</dd>
        </div>
        <div>
          <dt>{t("Code")}</dt>
          <dd className="certificate-code">
            {formatCertificateCode(certificate.code)}
          </dd>
        </div>
      </dl>
      <p className="muted">
        {t(
          "The name, course and date above must match the printed certificate.",
        )}
      </p>
    </div>
  );
}
