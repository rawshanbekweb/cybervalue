"use client";

import { useEffect, useRef, useState } from "react";
import { Image as ImageIcon, ShieldCheck } from "lucide-react";
import { useT } from "../network-lab/use-t";
import {
  AnimLab,
  CommonWidgetView,
  type WidgetProps,
} from "../anim-lab/AnimLab";
import { LESSONS, PROGRESS_KEY, type Widget } from "@/lib/lsb/curriculum";
import {
  BASE,
  bits8,
  bitsToText,
  CHANNELS,
  flipRed,
  HEIGHT,
  invisible,
  lowBits,
  MESSAGE,
  picture,
  plane,
  ROW,
  WIDTH,
  wordRight,
  type Channel,
  type Rgb,
} from "@/lib/lsb/tools";
import "../http-basics/http-basics.css";
import "../crypto-basics/crypto-basics.css";
import "../untrusted-input/untrusted-input.css";
import "../browser-risks/browser-risks.css";
import "../access-control/access-control.css";
import "./lsb.css";

// Academy Intermediate · Steganography inside images: one bit of a colour,
// a message in red LSBs, and bit planes.
export function Lsb() {
  const { t } = useT();
  return (
    <AnimLab
      lessons={LESSONS}
      progressKey={PROGRESS_KEY}
      eyebrow={t("STEGANOGRAPHY · MODULE 2")}
      title={t("Inside images.")}
      subtitle={t("The lowest bit of a colour is a message nobody sees.")}
      description={t(
        "See which bit of a colour can change unseen, read a message out of the red LSBs of a row of pixels, work out how much a picture can carry, and find a word in an image by looking at one bit plane at a time.",
      )}
      badge={t("LSB / LAB")}
      icon={<ImageIcon size={22} />}
      checkpoints={["lsb-1"]}
      back={{ href: "/intermediate", label: "Academy Intermediate" }}
      renderWidget={(widget: Widget, props) => {
        switch (widget.type) {
          case "flip":
            return <FlipWidget {...props} />;
          case "row":
            return <RowWidget {...props} />;
          case "planes":
            return <PlanesWidget {...props} />;
          default:
            return <CommonWidgetView widget={widget} {...props} />;
        }
      }}
    />
  );
}

const css = ([r, g, b]: Rgb) => `rgb(${r}, ${g}, ${b})`;

/** Flip one bit of the red channel and compare the colours. */
function FlipWidget({ onSolved }: WidgetProps) {
  const { t } = useT();
  const [bit, setBit] = useState(7);
  const { after, change } = flipRed(bit);
  return (
    <div className="nl-card cb-card">
      <fieldset className="br-modes">
        <legend>
          {t("Bit of the red channel to flip (7 = MSB, 0 = LSB)")}
        </legend>
        {[7, 6, 5, 4, 3, 2, 1, 0].map((b) => (
          <label key={b} className={`br-mode${bit === b ? " on" : ""}`}>
            <input
              type="radio"
              name="ls-bit"
              checked={bit === b}
              onChange={() => {
                setBit(b);
                onSolved(invisible(b));
              }}
            />
            {b}
          </label>
        ))}
      </fieldset>
      <div className="ls-pair">
        <figure>
          <span className="ls-swatch" style={{ background: css(BASE) }} />
          <figcaption>
            {t("Before")}: <code>{BASE[0]}</code> ={" "}
            <code>{bits8(BASE[0])}</code>
          </figcaption>
        </figure>
        <figure>
          <span className="ls-swatch" style={{ background: css(after) }} />
          <figcaption>
            {t("After")}: <code>{after[0]}</code> ={" "}
            <code>{bits8(after[0])}</code>
          </figcaption>
        </figure>
      </div>
      <p className={invisible(bit) ? "nl-pass" : "cb-out"} aria-live="polite">
        {invisible(bit)
          ? t(
              "Off by {n}: the two colours look the same. This is where a message can hide.",
              {
                n: change,
              },
            )
          : t("Off by {n} steps: you can see the difference.", { n: change })}
      </p>
    </div>
  );
}

/** A row of pixels; read their red LSBs. */
function RowWidget({ onSolved }: WidgetProps) {
  const { t } = useT();
  const [show, setShow] = useState(false);
  const [answer, setAnswer] = useState("");
  const bits = lowBits(ROW);
  return (
    <div className="nl-card cb-card">
      <div className="ls-row" role="img" aria-label={t("A row of 24 pixels")}>
        {ROW.map((p, i) => (
          <span key={i} className="ls-px" style={{ background: css(p) }} />
        ))}
      </div>
      <label className="ui-switch">
        <input
          type="checkbox"
          checked={show}
          onChange={(e) => setShow(e.target.checked)}
        />
        {t("Show each pixel’s red value in binary")}
      </label>
      {show && (
        <div
          className="ls-table"
          tabIndex={0}
          role="region"
          aria-label={t("Red values")}
        >
          {ROW.map((p, i) => (
            <code key={i}>
              {bits8(p[0]).slice(0, 7)}
              <b>{bits8(p[0]).slice(7)}</b>
            </code>
          ))}
        </div>
      )}
      {show && (
        <pre className="al-code ls-bytes" tabIndex={0}>
          {bits
            .match(/.{8}/g)!
            .map((byte) => `${byte} → ${bitsToText(byte)}`)
            .join("\n")}
        </pre>
      )}
      <label className="cb-field">
        {t("The hidden message")}
        <input
          value={answer}
          maxLength={20}
          spellCheck={false}
          autoComplete="off"
          onChange={(e) => {
            setAnswer(e.target.value);
            onSolved(e.target.value.trim() === MESSAGE);
          }}
        />
      </label>
      {answer.trim() === MESSAGE && (
        <p className="nl-pass" aria-live="polite">
          <ShieldCheck size={15} aria-hidden="true" />{" "}
          {t(
            "24 pixels, 24 bits, 3 letters — and the row looks like plain sky.",
          )}
        </p>
      )}
    </div>
  );
}

const PIXELS = picture();

/** Paint either the picture or one of its bit planes onto a canvas. */
function Canvas({
  planeOf,
  label,
}: {
  planeOf: boolean[] | null;
  label: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    const img = ctx.createImageData(WIDTH, HEIGHT);
    PIXELS.forEach((p, i) => {
      const [r, g, b] = planeOf
        ? planeOf[i]
          ? [255, 255, 255]
          : [0, 0, 0]
        : p;
      img.data.set([r, g, b, 255], i * 4);
    });
    ctx.putImageData(img, 0, 0);
  }, [planeOf]);
  return (
    <canvas
      ref={ref}
      width={WIDTH}
      height={HEIGHT}
      className="ls-canvas"
      role="img"
      aria-label={label}
    />
  );
}

/** Pick a channel and a bit; the lowest blue plane shows a word. */
function PlanesWidget({ onSolved }: WidgetProps) {
  const { t } = useT();
  const [channel, setChannel] = useState<Channel>("r");
  const [bit, setBit] = useState(7);
  const [guess, setGuess] = useState("");
  const shown = plane(PIXELS, channel, bit);
  const name: Record<Channel, string> = {
    r: t("Red"),
    g: t("Green"),
    b: t("Blue"),
  };
  return (
    <div className="nl-card cb-card">
      <div className="ls-pair">
        <figure>
          <Canvas planeOf={null} label={t("The picture")} />
          <figcaption>{t("The picture")}</figcaption>
        </figure>
        <figure>
          <Canvas
            planeOf={shown}
            label={t("{channel}, bit {bit}", { channel: name[channel], bit })}
          />
          <figcaption>
            {t("{channel}, bit {bit}", { channel: name[channel], bit })}
          </figcaption>
        </figure>
      </div>
      <fieldset className="br-modes">
        <legend>{t("Channel")}</legend>
        {CHANNELS.map((c) => (
          <label key={c} className={`br-mode${channel === c ? " on" : ""}`}>
            <input
              type="radio"
              name="ls-channel"
              checked={channel === c}
              onChange={() => setChannel(c)}
            />
            {name[c]}
          </label>
        ))}
      </fieldset>
      <label className="cb-field">
        {t("Bit plane")} <strong>{bit}</strong>
        <input
          type="range"
          className="ls-range"
          min={0}
          max={7}
          value={bit}
          onChange={(e) => setBit(Number(e.target.value))}
        />
      </label>
      <label className="cb-field">
        {t("The hidden word")}
        <input
          value={guess}
          maxLength={20}
          spellCheck={false}
          autoComplete="off"
          onChange={(e) => {
            setGuess(e.target.value);
            onSolved(wordRight(e.target.value));
          }}
        />
      </label>
      {wordRight(guess) && (
        <p className="nl-pass" aria-live="polite">
          <ShieldCheck size={15} aria-hidden="true" />{" "}
          {t("Invisible in the picture, plain as day in blue bit 0.")}
        </p>
      )}
    </div>
  );
}
