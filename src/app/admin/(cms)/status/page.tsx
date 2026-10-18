import Link from "next/link";
import { getAdminLocale, getAdminTranslator } from "@/lib/i18n/server";
import { requireOwner } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { site } from "@/lib/site";
import { siteIndexable } from "@/lib/site-config-server";
import { telegramConfig } from "@/lib/telegram/api";
import { formatDue } from "@/lib/student/assignments";
import { CRON_KEY, databaseInfo, EXPORT_KEY, stampOf } from "@/lib/system";

const DAY = 86_400_000;

type Check = { label: string; ok: boolean; note: string };

export default async function AdminStatusPage() {
  const t = await getAdminTranslator();
  const locale = await getAdminLocale();
  await requireOwner("/admin/status");
  const db = getDb();
  const now = new Date().getTime();
  let database: {
    ms: number;
    size: string;
    version: string;
    migrations: number;
    latest: string;
    failed: number;
  } | null = null;
  let counts: [string, number][] = [];
  let cron: Date | null = null;
  let exported: Date | null = null;
  let errors = 0;
  if (db) {
    try {
      database = await databaseInfo(db);
      const [students, juniors, materials, submissions, certificates, games] =
        await Promise.all([
          db.student.count(),
          db.juniorMember.count(),
          db.studentMaterial.count(),
          db.studentSubmission.count(),
          db.studentCertificate.count(),
          db.liveGame.count(),
        ]);
      counts = [
        ["Students", students],
        ["Academy Junior", juniors],
        ["Student materials", materials],
        ["Submissions", submissions],
        ["Certificates", certificates],
        ["Live quiz", games],
      ];
      [cron, exported, errors] = await Promise.all([
        stampOf(db, CRON_KEY),
        stampOf(db, EXPORT_KEY),
        db.errorEvent.count({
          where: { resolvedAt: null, lastAt: { gte: new Date(now - DAY) } },
        }),
      ]);
    } catch {
      database = null;
    }
  }
  const indexable = await siteIndexable();
  const https = site.url.startsWith("https://");
  const checks: Check[] = [
    {
      label: t("Database"),
      ok: Boolean(database) && database!.failed === 0,
      note: database
        ? t("Connected in {ms} ms · PostgreSQL {version} · {size}", {
            ms: database.ms,
            version: database.version,
            size: database.size,
          })
        : t("Not reachable. Check DATABASE_URL."),
    },
    {
      label: t("Migrations"),
      ok: Boolean(database) && database!.failed === 0,
      note: database
        ? t("{count} applied, latest {name}", {
            count: database.migrations,
            name: database.latest,
          }) +
          (database.failed
            ? ` · ${t("{count} unfinished", { count: database.failed })}`
            : "")
        : "—",
    },
    {
      label: "AUTH_SECRET",
      ok: Boolean(process.env.AUTH_SECRET),
      note: process.env.AUTH_SECRET
        ? t("Set: two-factor sign-in is available.")
        : t(
            "Not set: two-factor sign-in is off and keys fall back to DATABASE_URL.",
          ),
    },
    {
      label: "SITE_URL",
      ok: https,
      note: https ? site.url : t("Not HTTPS: {url}", { url: site.url }),
    },
    {
      label: t("Search engines"),
      ok: indexable,
      note: indexable
        ? t("The site can be indexed.")
        : t("Indexing is off in Site settings."),
    },
    {
      label: "Telegram",
      ok: Boolean(telegramConfig()),
      note: telegramConfig()
        ? t("Bot configured.")
        : t("Not configured; see Admin → Telegram."),
    },
    {
      label: t("Daily job"),
      ok: Boolean(cron && now - cron.getTime() < 2 * DAY),
      note: cron
        ? t("Last run {date}", { date: formatDue(cron, locale) })
        : process.env.CRON_SECRET
          ? t("Has not run yet. It runs every morning at 09:05.")
          : t("CRON_SECRET is not set, so reminders and checks do not run."),
    },
    {
      label: t("Errors, last 24 hours"),
      ok: errors === 0,
      note: errors ? t("{count} open", { count: errors }) : t("None"),
    },
    {
      label: t("Data export"),
      ok: Boolean(exported && now - exported.getTime() < 30 * DAY),
      note: exported
        ? t("Last downloaded {date}", { date: formatDue(exported, locale) })
        : t("Never downloaded."),
    },
  ];
  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>{t("System status")}</h1>
          <p className="muted">
            {t(
              "Database, configuration, the daily job, errors and backups at a glance.",
            )}
          </p>
        </div>
      </div>
      <ul className="admin-checks">
        {checks.map((c) => (
          <li key={c.label}>
            <span className={`admin-chip ${c.ok ? "ok" : "warn"}`}>
              {c.ok ? t("OK") : t("Check")}
            </span>
            <strong>{c.label}</strong>
            <span className="muted">{c.note}</span>
          </li>
        ))}
      </ul>
      {errors > 0 && (
        <p>
          <Link href="/admin/errors">{t("Open the error list")}</Link>
        </p>
      )}

      {counts.length > 0 && (
        <div className="admin-cards">
          {counts.map(([label, value]) => (
            <div key={label} className="admin-card">
              <span className="eyebrow">{t(label)}</span>
              <strong>{value}</strong>
            </div>
          ))}
        </div>
      )}

      <h2>{t("Backups")}</h2>
      <p>
        {t(
          "Neon keeps the database history and can restore it to any moment inside the plan’s window (Neon console → Branches → Restore). Download a copy of the data here as well, at least once a month, and keep it somewhere safe.",
        )}
      </p>
      <a href="/admin/status/export" className="button button-primary" download>
        {t("Download data (JSON)")}
      </a>
      <p className="muted">
        {t(
          "The file holds students, materials, results, certificates, Junior members and site content. Admin passwords, sessions and uploaded file contents are not included.",
        )}
      </p>
    </div>
  );
}
