"use client";

import { useState } from "react";
import { MapPin, ShieldCheck, Skull, Tags } from "lucide-react";
import { useT } from "../network-lab/use-t";
import {
  AnimLab,
  CommonWidgetView,
  type WidgetProps,
} from "../anim-lab/AnimLab";
import { LESSONS, PROGRESS_KEY, type Widget } from "@/lib/metadata/curriculum";
import {
  CITIES,
  EXIF,
  LAT,
  LON,
  nearest,
  stripSolved,
  TAGS,
  toDecimal,
} from "@/lib/metadata/tools";
import "../http-basics/http-basics.css";
import "../crypto-basics/crypto-basics.css";
import "../untrusted-input/untrusted-input.css";
import "../browser-risks/browser-risks.css";
import "../access-control/access-control.css";
import "../evidence/evidence.css";
import "./metadata.css";

// Academy Intermediate · Metadata: locate a photo from its EXIF, and strip
// what is personal before publishing.
export function Metadata() {
  const { t } = useT();
  return (
    <AnimLab
      lessons={LESSONS}
      progressKey={PROGRESS_KEY}
      eyebrow={t("STEGANOGRAPHY · MODULE 3")}
      title={t("Metadata.")}
      subtitle={t("The file says more about you than its content does.")}
      description={t(
        "See what EXIF gives away, find the city a photo was taken in from its GPS tags, read a document’s author and template path, and strip the personal fields before publishing without breaking the picture.",
      )}
      badge={t("EXIF / LAB")}
      icon={<Tags size={22} />}
      checkpoints={["metadata-1"]}
      back={{ href: "/intermediate", label: "Academy Intermediate" }}
      renderWidget={(widget: Widget, props) => {
        switch (widget.type) {
          case "exif":
            return <ExifWidget {...props} />;
          case "strip":
            return <StripWidget {...props} />;
          default:
            return <CommonWidgetView widget={widget} {...props} />;
        }
      }}
    />
  );
}

/** The photo's EXIF; convert the GPS and pick the city. */
function ExifWidget({ onSolved }: WidgetProps) {
  const { t, text } = useT();
  const [converted, setConverted] = useState(false);
  const [city, setCity] = useState<string | null>(null);
  const right = nearest().id;
  return (
    <div className="nl-card cb-card">
      <pre className="al-code md-exif" tabIndex={0}>
        {"$ exiftool IMG_4417.jpg\n" +
          EXIF.map(([k, v]) => `${k.padEnd(22)}: ${v}`).join("\n")}
      </pre>
      <button
        type="button"
        className="nl-primary"
        onClick={() => setConverted(true)}
      >
        {t("Convert the GPS to decimal degrees")}
      </button>
      {converted && (
        <p className="cb-out" aria-live="polite">
          <MapPin size={14} aria-hidden="true" /> {toDecimal(LAT).toFixed(4)},{" "}
          {toDecimal(LON).toFixed(4)}
        </p>
      )}
      <fieldset className="br-modes">
        <legend>{t("Where was it taken?")}</legend>
        {CITIES.map((c) => (
          <label key={c.id} className={`br-mode${city === c.id ? " on" : ""}`}>
            <input
              type="radio"
              name="md-city"
              checked={city === c.id}
              onChange={() => {
                setCity(c.id);
                onSolved(c.id === right);
              }}
            />
            {text(c.name)}{" "}
            <small className="md-coord">
              {c.lat.toFixed(2)}, {c.lon.toFixed(2)}
            </small>
          </label>
        ))}
      </fieldset>
      {city && (
        <p
          className={city === right ? "nl-pass" : "nl-fail"}
          aria-live="polite"
        >
          {city === right
            ? t(
                "Samarkand, right by the Registan — and the Artist tag says who took it.",
              )
            : t("Too far away: compare the decimal degrees again.")}
        </p>
      )}
    </div>
  );
}

/** Tick the tags to remove before the photo goes on a website. */
function StripWidget({ onSolved }: WidgetProps) {
  const { t } = useT();
  const [removed, setRemoved] = useState<string[]>([]);
  const kept = TAGS.filter((tag) => tag.private && !removed.includes(tag.name));
  const broken = TAGS.filter(
    (tag) => tag.display && removed.includes(tag.name),
  );
  return (
    <div className="nl-card cb-card">
      <fieldset className="ev-steps">
        <legend>{t("Remove before publishing:")}</legend>
        {TAGS.map((tag) => (
          <label key={tag.name} className="ui-switch">
            <input
              type="checkbox"
              checked={removed.includes(tag.name)}
              onChange={(e) => {
                const next = e.target.checked
                  ? [...removed, tag.name]
                  : removed.filter((x) => x !== tag.name);
                setRemoved(next);
                onSolved(stripSolved(next));
              }}
            />
            <code>{tag.name}</code>
          </label>
        ))}
      </fieldset>
      <p className="cb-out">
        <code>
          exiftool{" "}
          {removed.length
            ? TAGS.filter((tag) => removed.includes(tag.name))
                .map((tag) => tag.flag)
                .join(" ")
            : "…"}{" "}
          IMG_4417.jpg
        </code>
      </p>
      <div
        aria-live="polite"
        className={`ac-reply ${stripSolved(removed) ? "ok" : "bad"}`}
      >
        {stripSolved(removed) ? (
          <p className="nl-pass">
            <ShieldCheck size={15} aria-hidden="true" />{" "}
            {t(
              "Nothing personal left, and the photo still shows upright in true colour.",
            )}
          </p>
        ) : (
          <>
            {kept.length > 0 && (
              <p className="nl-fail">
                <Skull size={15} aria-hidden="true" />{" "}
                {t("Still gives away: {tags}", {
                  tags: kept.map((tag) => tag.name).join(", "),
                })}
              </p>
            )}
            {broken.length > 0 && (
              <p className="nl-fail">
                <Skull size={15} aria-hidden="true" />{" "}
                {t("Removing {tags} breaks how the photo displays.", {
                  tags: broken.map((tag) => tag.name).join(", "),
                })}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
