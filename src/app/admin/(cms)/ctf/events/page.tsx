import Link from "next/link";
import { getAdminLocale, getAdminTranslator } from "@/lib/i18n/server";
import { requireOwner } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { phaseOf } from "@/lib/challenges/scoring";
import { formatWhen } from "@/lib/challenges/view";
import { EventFields, Outcome } from "@/components/admin/ctf-forms";
import { createEventAction } from "../actions";

export async function generateMetadata() {
  const t = await getAdminTranslator();
  return { title: t("CTF competitions") };
}

export default async function CtfEventsPage({
  searchParams,
}: PageProps<"/admin/ctf/events">) {
  await requireOwner("/admin/ctf/events");
  const t = await getAdminTranslator();
  const locale = await getAdminLocale();
  const events =
    (await getDb()?.ctfEvent.findMany({
      orderBy: { startsAt: "desc" },
      select: {
        id: true,
        slug: true,
        title: true,
        startsAt: true,
        endsAt: true,
        published: true,
        _count: { select: { challenges: true, entrants: true } },
      },
    })) ?? [];
  const phase = {
    upcoming: t("Upcoming"),
    running: t("Running"),
    ended: t("Finished"),
  };
  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>{t("CTF competitions")}</h1>
          <p className="muted">
            {t(
              "Competitions at /challenges. Create one, add challenges with flags, files and hints, then publish it.",
            )}
          </p>
        </div>
        <Link href="/admin/ctf/players" className="button button-secondary">
          {t("CTF players")}
        </Link>
      </div>
      <Outcome query={await searchParams} />
      {events.length > 0 && (
        <div className="admin-table-wrap">
          <table className="admin-table" tabIndex={0}>
            <thead>
              <tr>
                <th scope="col">{t("Title")}</th>
                <th scope="col">{t("Status")}</th>
                <th scope="col">{t("Starts")}</th>
                <th scope="col">{t("Challenges")}</th>
                <th scope="col">{t("Entrants")}</th>
              </tr>
            </thead>
            <tbody>
              {events.map((e) => (
                <tr key={e.id}>
                  <td>
                    <Link href={`/admin/ctf/events/${e.id}`}>{e.title}</Link>
                    <div className="admin-cell-detail">
                      /challenges/{e.slug}
                    </div>
                  </td>
                  <td>
                    {phase[phaseOf(e)]}
                    {!e.published && ` · ${t("Draft")}`}
                  </td>
                  <td>{formatWhen(e.startsAt, locale)}</td>
                  <td>{e._count.challenges}</td>
                  <td>{e._count.entrants}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <section className="admin-panel">
        <h2>{t("New competition")}</h2>
        <form action={createEventAction} className="admin-form">
          <EventFields />
          <button type="submit" className="button">
            {t("Create")}
          </button>
        </form>
      </section>
    </div>
  );
}
