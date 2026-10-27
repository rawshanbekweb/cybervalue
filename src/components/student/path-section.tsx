import Link from "next/link";
import { ArrowRight, Award, Check, Lock, Sparkles } from "lucide-react";
import type { CheckpointMeta } from "@/lib/checkpoints/meta";
import { formatCertificateCode } from "@/lib/student/certificate";
import type { LabId } from "@/lib/lab-progress";

type T = (source: string, values?: Record<string, string | number>) => string;

export type PathLab = {
  id: LabId;
  title: { uz: string; en: string };
  /** Catalog category, translated by the caller's dictionary. */
  category: string;
  href: string;
  done: number;
  total: number;
  checkpoints: (CheckpointMeta & { best?: number })[];
  /** The certificate this lab leads to, once issued. */
  certificate: string | null;
  /** Whether the lab has a certificate at all. */
  awards: boolean;
};

export type PathExtra = { href: string; title: string };

// The student's way through the labs: every lab open at their level, with
// its lessons, checkpoints and certificate in one card, in the order they
// are meant to be taken.
export function PathSection({
  labs,
  intermediate,
  intermediateOpen,
  extras,
  next,
  t,
  locale,
}: {
  labs: PathLab[];
  intermediate: PathLab[];
  intermediateOpen: boolean;
  extras: PathExtra[];
  /** The lab the next-step card points to, highlighted here too. */
  next: LabId | null;
  t: T;
  locale: "uz" | "en";
}) {
  const finished = labs.filter((l) => l.done >= l.total).length;
  return (
    <section id="path" className="student-section" aria-labelledby="path-title">
      <div className="student-section-head">
        <h2 id="path-title" className="student-section-title">
          {t("My path")}
        </h2>
        <p className="student-quiet">
          {t(
            "Each lab ends with a checkpoint; finishing both earns a certificate. {done} of {total} labs finished.",
            { done: finished, total: labs.length },
          )}
        </p>
      </div>
      <ol className="student-path">
        {labs.map((lab) => (
          <LabCard
            key={lab.id}
            lab={lab}
            next={lab.id === next}
            t={t}
            locale={locale}
          />
        ))}
      </ol>

      <h3 className="student-path-group">{t("Academy Intermediate")}</h3>
      {intermediateOpen ? (
        <ol className="student-path">
          {intermediate.map((lab) => (
            <LabCard
              key={lab.id}
              lab={lab}
              next={lab.id === next}
              t={t}
              locale={locale}
            />
          ))}
        </ol>
      ) : (
        <p className="student-path-locked">
          <Lock size={16} aria-hidden="true" />
          <span>
            {t(
              "The next level: web application security in depth. It opens when your teacher places you at the Intermediate level, usually after the beginner labs and the entrance test.",
            )}{" "}
            <Link href="/intermediate" className="student-ghost">
              {t("See the roadmap")} →
            </Link>
          </span>
        </p>
      )}

      {extras.length > 0 && (
        <>
          <h3 className="student-path-group">{t("More practice")}</h3>
          <ul className="student-path-extras">
            {extras.map((extra) => (
              <li key={extra.href}>
                <a href={extra.href}>
                  {t(extra.title)} <ArrowRight size={14} aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}

function LabCard({
  lab,
  next,
  t,
  locale,
}: {
  lab: PathLab;
  next: boolean;
  t: T;
  locale: "uz" | "en";
}) {
  const complete = lab.done >= lab.total;
  const action =
    lab.done === 0 ? t("Start") : complete ? t("Review") : t("Continue");
  return (
    <li
      className={`student-path-card${complete ? " done" : ""}${next ? " next" : ""}`}
    >
      <div className="student-path-top">
        <span className="student-field-label">{lab.category}</span>
        {next && (
          <span className="student-pill on">
            <Sparkles size={12} aria-hidden="true" /> {t("Next step")}
          </span>
        )}
        {complete && !next && (
          <span className="student-pill on">
            <Check size={12} aria-hidden="true" /> {t("Done")}
          </span>
        )}
      </div>
      <strong className="student-path-title">{lab.title[locale]}</strong>
      <div
        className="student-meter student-meter-sm"
        role="progressbar"
        aria-label={t("Lessons of {lab}", { lab: lab.title[locale] })}
        aria-valuemin={0}
        aria-valuemax={lab.total}
        aria-valuenow={lab.done}
      >
        <span style={{ width: `${(lab.done / lab.total) * 100}%` }} />
      </div>
      <span className="student-quiet">
        {t("{done} of {total} lessons", { done: lab.done, total: lab.total })}
      </span>
      {lab.checkpoints.length > 0 && (
        <ul className="student-path-checks">
          {lab.checkpoints.map((c) => {
            const passed = c.best !== undefined && c.best >= c.pass;
            return (
              <li key={c.id}>
                <a href={c.href}>
                  {c.title[locale]}
                  <span className={`student-pill${passed ? " on" : ""}`}>
                    {c.best === undefined
                      ? t("Not taken")
                      : passed
                        ? t("Passed · {percent}%", { percent: c.best })
                        : t("Best {percent}%", { percent: c.best })}
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      )}
      <div className="student-path-foot">
        {lab.certificate ? (
          <Link
            href={`/student/certificate/${formatCertificateCode(lab.certificate)}`}
            className="student-path-cert"
          >
            <Award size={15} aria-hidden="true" /> {t("Certificate")}
          </Link>
        ) : lab.awards ? (
          <span className="student-quiet student-path-cert-hint">
            <Award size={14} aria-hidden="true" />{" "}
            {t("Certificate: lessons + checkpoint")}
          </span>
        ) : (
          <span />
        )}
        <a href={lab.href} className="student-path-go">
          {action} <ArrowRight size={14} aria-hidden="true" />
        </a>
      </div>
    </li>
  );
}
