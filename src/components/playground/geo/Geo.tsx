"use client";

import { useState } from "react";
import { MapPin, ShieldCheck } from "lucide-react";
import { useT } from "../network-lab/use-t";
import {
  AnimLab,
  CommonWidgetView,
  type WidgetProps,
} from "../anim-lab/AnimLab";
import { LESSONS, PROGRESS_KEY, type Widget } from "@/lib/geo/curriculum";
import {
  CITIES,
  CITY_NAMES,
  CLUES,
  HITS,
  reverseRight,
  sceneRight,
  VERDICTS,
  type City,
  type Verdict,
} from "@/lib/geo/tools";
import "../http-basics/http-basics.css";
import "../crypto-basics/crypto-basics.css";
import "../untrusted-input/untrusted-input.css";
import "../browser-risks/browser-risks.css";
import "../access-control/access-control.css";
import "./geo.css";

// Academy Intermediate · Images and location: date a recycled photo and
// place a street scene.
export function Geo() {
  const { t } = useT();
  return (
    <AnimLab
      lessons={LESSONS}
      progressKey={PROGRESS_KEY}
      eyebrow={t("OSINT · MODULE 4")}
      title={t("Images and location.")}
      subtitle={t("Every photo is a witness. Question it.")}
      description={t(
        "Use reverse image search well, expose a years-old photo passed off as today’s, tell strong location clues from weak ones, read a street scene to the right city, work out the time from shadows and weather, treat metadata as a claim and refuse to locate private people.",
      )}
      badge={t("GEO / LAB")}
      icon={<MapPin size={22} />}
      checkpoints={["geo-1"]}
      back={{ href: "/intermediate", label: "Academy Intermediate" }}
      renderWidget={(widget: Widget, props) => {
        switch (widget.type) {
          case "reverse":
            return <ReverseWidget {...props} />;
          case "scene":
            return <SceneWidget {...props} />;
          default:
            return <CommonWidgetView widget={widget} {...props} />;
        }
      }}
    />
  );
}

/** Reverse-search hits; pick the original and judge the claim. */
function ReverseWidget({ onSolved }: WidgetProps) {
  const { t, text } = useT();
  const [byDate, setByDate] = useState(false);
  const [pick, setPick] = useState<string | null>(null);
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const hits = byDate
    ? [...HITS].sort((a, b) => a.date.localeCompare(b.date))
    : HITS;
  const choose = (p: string | null, v: Verdict | null) => {
    setPick(p);
    setVerdict(v);
    onSolved(reverseRight(p, v));
  };
  const label: Record<Verdict, string> = {
    today: t("The photo is from today"),
    old: t("An old photo, reused"),
  };
  return (
    <div className="nl-card cb-card">
      <label className="ui-switch">
        <input
          type="checkbox"
          checked={byDate}
          onChange={(e) => setByDate(e.target.checked)}
        />
        {t("Oldest first")}
      </label>
      <fieldset className="ge-hits">
        <legend>{t("Matches for the photo: which is the original?")}</legend>
        {hits.map((h) => (
          <label key={h.id} className={`ge-hit${pick === h.id ? " on" : ""}`}>
            <input
              type="radio"
              name="ge-hit"
              checked={pick === h.id}
              onChange={() => choose(h.id, verdict)}
            />
            <span className="ge-hit-body">
              <code>{h.date}</code> <code>{h.site}</code>
              <span className="ge-caption">{text(h.caption)}</span>
            </span>
          </label>
        ))}
      </fieldset>
      <fieldset className="br-modes">
        <legend>{t("Verdict on “the city flooded today”")}</legend>
        {VERDICTS.map((v) => (
          <label key={v} className={`br-mode${verdict === v ? " on" : ""}`}>
            <input
              type="radio"
              name="ge-verdict"
              checked={verdict === v}
              onChange={() => choose(pick, v)}
            />
            {label[v]}
          </label>
        ))}
      </fieldset>
      {pick && verdict && (
        <p
          className={reverseRight(pick, verdict) ? "nl-pass" : "nl-fail"}
          aria-live="polite"
        >
          {reverseRight(pick, verdict) ? (
            <>
              <ShieldCheck size={15} aria-hidden="true" />{" "}
              {t(
                "The agency published it in April 2019 with the photographer’s name. Yesterday’s posts recycled it: false.",
              )}
            </>
          ) : (
            t("Sort by date and look at who published it first.")
          )}
        </p>
      )}
    </div>
  );
}

/** A drawn street with four hotspots, and the city to choose. */
function SceneWidget({ onSolved }: WidgetProps) {
  const { t, text } = useT();
  const [seen, setSeen] = useState<string[]>([]);
  const [open, setOpen] = useState<string | null>(null);
  const [city, setCity] = useState<City | null>(null);
  const reveal = (id: string) => {
    setOpen(id);
    const next = seen.includes(id) ? seen : [...seen, id];
    setSeen(next);
    onSolved(sceneRight(next, city));
  };
  const current = CLUES.find((c) => c.id === open);
  return (
    <div className="nl-card cb-card">
      <div className="ge-scene">
        <svg
          viewBox="0 0 400 240"
          role="img"
          aria-label={t(
            "A drawn street: a bakery sign, a blue dome, a car and traffic",
          )}
        >
          <rect width="400" height="240" fill="#1b2433" />
          <rect y="150" width="400" height="90" fill="#2a2a2e" />
          <rect y="186" width="400" height="3" fill="#d9d9d9" opacity="0.5" />
          <rect x="30" y="40" width="130" height="110" fill="#c9a77b" />
          <rect x="45" y="58" width="94" height="24" rx="3" fill="#0f5132" />
          <text
            x="92"
            y="75"
            textAnchor="middle"
            fontSize="13"
            fontWeight="700"
            fill="#ffffff"
          >
            NON UYI
          </text>
          <rect x="60" y="100" width="30" height="50" fill="#5b3a29" />
          <rect x="105" y="98" width="40" height="28" fill="#7fb0d6" />
          <rect x="250" y="70" width="100" height="80" fill="#d8c3a5" />
          <path d="M260 72 Q300 10 340 72 Z" fill="#1f6fb2" />
          <rect x="296" y="14" width="8" height="10" fill="#e0b84c" />
          <rect x="200" y="176" width="100" height="30" rx="8" fill="#e7e7e7" />
          <rect x="215" y="164" width="60" height="18" rx="6" fill="#bdbdbd" />
          <circle cx="220" cy="208" r="8" fill="#111" />
          <circle cx="282" cy="208" r="8" fill="#111" />
          <rect x="226" y="198" width="48" height="12" fill="#ffffff" />
          <text
            x="250"
            y="207.5"
            textAnchor="middle"
            fontSize="7"
            fontWeight="700"
            fill="#111"
          >
            01 A 123 BC
          </text>
          <path
            d="M320 196 L370 196 L370 190 L384 199 L370 208 L370 202 L320 202 Z"
            fill="#e0b84c"
          />
        </svg>
        {CLUES.map((c) => (
          <button
            key={c.id}
            type="button"
            className={`ge-spot${seen.includes(c.id) ? " seen" : ""}`}
            style={{
              left: `${(c.x / 400) * 100}%`,
              top: `${(c.y / 240) * 100}%`,
            }}
            aria-label={text(c.label)}
            aria-pressed={open === c.id}
            onClick={() => reveal(c.id)}
          >
            {CLUES.indexOf(c) + 1}
          </button>
        ))}
      </div>
      <p className="cb-label" aria-live="polite">
        {current ? (
          <>
            <b>{text(current.label)}:</b> {text(current.note)}
          </>
        ) : (
          t("Click the numbered spots to read each clue.")
        )}
      </p>
      <p className="cb-label">
        {t("Clues read: {n} of {total}", {
          n: seen.length,
          total: CLUES.length,
        })}
      </p>
      <fieldset className="br-modes">
        <legend>{t("Where was this taken?")}</legend>
        {CITIES.map((c) => (
          <label key={c} className={`br-mode${city === c ? " on" : ""}`}>
            <input
              type="radio"
              name="ge-city"
              checked={city === c}
              onChange={() => {
                setCity(c);
                onSolved(sceneRight(seen, c));
              }}
            />
            {text(CITY_NAMES[c])}
          </label>
        ))}
      </fieldset>
      {city &&
        (sceneRight(seen, city) ? (
          <p className="nl-pass" aria-live="polite">
            <ShieldCheck size={15} aria-hidden="true" />{" "}
            {t(
              "Uzbek in Latin script, a 01 plate and right-hand traffic: Tashkent. The dome alone could have been Samarkand or Bukhara.",
            )}
          </p>
        ) : (
          <p className="nl-fail" aria-live="polite">
            {seen.length < 3
              ? t("Read at least three clues before deciding.")
              : t("Look at the plate and the language on the sign again.")}
          </p>
        ))}
    </div>
  );
}
