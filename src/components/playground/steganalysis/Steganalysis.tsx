"use client";

import { useState } from "react";
import { ScanSearch, ShieldCheck } from "lucide-react";
import { useT } from "../network-lab/use-t";
import {
  AnimLab,
  CommonWidgetView,
  type WidgetProps,
} from "../anim-lab/AnimLab";
import {
  LESSONS,
  PROGRESS_KEY,
  type Widget,
} from "@/lib/steganalysis/curriculum";
import {
  FROM,
  GUILTY,
  PHOTO_A,
  PHOTO_B,
  pairSpread,
  THRESHOLD,
} from "@/lib/steganalysis/tools";
import "../http-basics/http-basics.css";
import "../crypto-basics/crypto-basics.css";
import "../untrusted-input/untrusted-input.css";
import "../browser-risks/browser-risks.css";
import "../access-control/access-control.css";
import "./steganalysis.css";

// Academy Intermediate · Steganalysis: spot the even pairs LSB embedding
// leaves in a histogram.
export function Steganalysis() {
  const { t } = useT();
  return (
    <AnimLab
      lessons={LESSONS}
      progressKey={PROGRESS_KEY}
      eyebrow={t("STEGANOGRAPHY · MODULE 5")}
      title={t("Steganalysis.")}
      subtitle={t("Proving something is hidden, before you can read it.")}
      description={t(
        "Sort strong signs of hiding from ordinary quirks, spot the even value pairs LSB embedding leaves in a histogram, learn what statistical tests can and can’t say, pick the right tool for each suspect file, and read zsteg output.",
      )}
      badge={t("STEGO / LAB")}
      icon={<ScanSearch size={22} />}
      checkpoints={["steganalysis-1"]}
      back={{ href: "/intermediate", label: "Academy Intermediate" }}
      renderWidget={(widget: Widget, props) =>
        widget.type === "pairs" ? (
          <PairsWidget {...props} />
        ) : (
          <CommonWidgetView widget={widget} {...props} />
        )
      }
    />
  );
}

/** Bars for pixel values FROM…FROM+15, coloured by pair. */
function Histogram({ data, label }: { data: number[]; label: string }) {
  const max = Math.max(...data);
  const w = 16;
  const h = 120;
  return (
    <svg
      viewBox={`0 0 ${data.length * w} ${h + 16}`}
      className="sa-hist"
      role="img"
      aria-label={label}
    >
      {data.map((v, i) => {
        const bar = (v / max) * h;
        return (
          <g key={i}>
            <rect
              x={i * w + 2}
              y={h - bar}
              width={w - 4}
              height={bar}
              className={Math.floor(i / 2) % 2 ? "sa-b" : "sa-a"}
            />
            {i % 2 === 0 && (
              <text
                x={i * w + w}
                y={h + 12}
                textAnchor="middle"
                className="sa-tick"
              >
                {FROM + i}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

/** Two photos' histograms; which one carries LSB data? */
function PairsWidget({ onSolved }: WidgetProps) {
  const { t } = useT();
  const [measure, setMeasure] = useState(false);
  const [pick, setPick] = useState<"a" | "b" | null>(null);
  const photos = [
    { id: "a" as const, name: "beach.png", data: PHOTO_A },
    { id: "b" as const, name: "mountain.png", data: PHOTO_B },
  ];
  return (
    <div className="nl-card cb-card">
      <div className="sa-pair">
        {photos.map((p) => (
          <figure key={p.id}>
            <Histogram
              data={p.data}
              label={t("Histogram of {name}, values {from} to {to}", {
                name: p.name,
                from: FROM,
                to: FROM + p.data.length - 1,
              })}
            />
            <figcaption>
              <code>{p.name}</code>
              {measure && (
                <span
                  className={
                    pairSpread(p.data) < THRESHOLD ? "sa-low" : "sa-ok"
                  }
                >
                  {" "}
                  ·{" "}
                  {t("pair spread {spread}", {
                    spread: pairSpread(p.data).toFixed(3),
                  })}
                </span>
              )}
            </figcaption>
          </figure>
        ))}
      </div>
      <p className="cb-label">
        {t("Bars of one colour are a pair: 2k and 2k+1.")}
      </p>
      <label className="ui-switch">
        <input
          type="checkbox"
          checked={measure}
          onChange={(e) => setMeasure(e.target.checked)}
        />
        {t("Measure how much each pair differs")}
      </label>
      <fieldset className="br-modes">
        <legend>{t("Which photo carries data in its LSBs?")}</legend>
        {photos.map((p) => (
          <label key={p.id} className={`br-mode${pick === p.id ? " on" : ""}`}>
            <input
              type="radio"
              name="sa-pick"
              checked={pick === p.id}
              onChange={() => {
                setPick(p.id);
                onSolved(p.id === GUILTY);
              }}
            />
            <code>{p.name}</code>
          </label>
        ))}
      </fieldset>
      {pick && (
        <p
          className={pick === GUILTY ? "nl-pass" : "nl-fail"}
          aria-live="polite"
        >
          {pick === GUILTY ? (
            <>
              <ShieldCheck size={15} aria-hidden="true" />{" "}
              {t(
                "Its pairs are near-equal steps — too even for chance. That is the chi-square signal.",
              )}
            </>
          ) : (
            t(
              "This one’s pairs differ freely, as a natural photo’s do. Look at the other.",
            )
          )}
        </p>
      )}
    </div>
  );
}
