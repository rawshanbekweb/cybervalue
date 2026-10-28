"use client";

import { useState } from "react";
import { LockKeyhole, ShieldCheck, Skull } from "lucide-react";
import { useT } from "../network-lab/use-t";
import {
  AnimLab,
  CommonWidgetView,
  type WidgetProps,
} from "../anim-lab/AnimLab";
import { LESSONS, PROGRESS_KEY, type Widget } from "@/lib/symmetric/curriculum";
import {
  encrypt,
  encryptPicture,
  hex,
  KEY,
  MSG_A,
  nonceReuse,
  PAYMENT,
  PICTURE,
  repeatedBlocks,
  tamper,
  type Mode,
} from "@/lib/symmetric/tools";
import "../http-basics/http-basics.css";
import "../crypto-basics/crypto-basics.css";
import "../untrusted-input/untrusted-input.css";
import "../browser-risks/browser-risks.css";
import "../access-control/access-control.css";
import "./symmetric.css";

// Academy Intermediate · Symmetric encryption: modes, nonces and tags on a
// toy block cipher that behaves the way AES does in each mode.
export function Symmetric() {
  const { t } = useT();
  return (
    <AnimLab
      lessons={LESSONS}
      progressKey={PROGRESS_KEY}
      eyebrow={t("CRYPTOGRAPHY · MODULE 2")}
      title={t("Symmetric encryption.")}
      subtitle={t("A strong cipher, used the right way.")}
      description={t(
        "See a padlock picture show through ECB and vanish under CBC and CTR, read a secret message because a nonce was used twice, and stop a changed payment with an authentication tag.",
      )}
      badge={t("AES / LAB")}
      icon={<LockKeyhole size={22} />}
      checkpoints={["symmetric-1"]}
      back={{ href: "/intermediate", label: "Academy Intermediate" }}
      renderWidget={(widget: Widget, props) => {
        switch (widget.type) {
          case "ecb":
            return <EcbWidget {...props} />;
          case "nonce":
            return <NonceWidget {...props} />;
          case "tamper":
            return <TamperWidget {...props} />;
          default:
            return <CommonWidgetView widget={widget} {...props} />;
        }
      }}
    />
  );
}

function Pixels({
  grid,
  label,
  cipher,
}: {
  grid: number[][];
  label: string;
  cipher?: boolean;
}) {
  return (
    <figure className="sy-figure">
      <div
        className={`sy-pixels${cipher ? " cipher" : ""}`}
        role="img"
        aria-label={label}
      >
        {grid.flat().map((c, i) => (
          <span key={i} className={`c${c}`} />
        ))}
      </div>
      <figcaption>{label}</figcaption>
    </figure>
  );
}

/** The padlock picture under ECB, CBC and CTR. */
function EcbWidget({ onSolved }: WidgetProps) {
  const { t } = useT();
  const [mode, setMode] = useState<Mode>("ecb");
  const repeated = repeatedBlocks(encrypt(PICTURE.flat(), KEY, mode, 7));
  return (
    <div className="nl-card cb-card">
      <fieldset className="br-modes">
        <legend>{t("Mode")}</legend>
        {(["ecb", "cbc", "ctr"] as const).map((m) => (
          <label key={m} className={`br-mode${mode === m ? " on" : ""}`}>
            <input
              type="radio"
              name="sy-mode"
              checked={mode === m}
              onChange={() => {
                setMode(m);
                onSolved(m !== "ecb");
              }}
            />
            <code>{m.toUpperCase()}</code>
          </label>
        ))}
      </fieldset>
      <div className="sy-pair">
        <Pixels grid={PICTURE} label={t("The picture")} />
        <Pixels
          grid={encryptPicture(mode, KEY)}
          label={t("Encrypted with {mode}", { mode: mode.toUpperCase() })}
          cipher
        />
      </div>
      <p aria-live="polite" className={repeated > 0 ? "nl-fail" : "nl-pass"}>
        {repeated > 0 ? (
          <Skull size={15} aria-hidden="true" />
        ) : (
          <ShieldCheck size={15} aria-hidden="true" />
        )}{" "}
        {repeated > 0
          ? t(
              "{count} encrypted blocks repeat others: the outline shows through.",
              { count: repeated },
            )
          : t("No encrypted block repeats: the picture is hidden.")}
      </p>
    </div>
  );
}

/** Two messages in CTR, with one nonce or a fresh one each. */
function NonceWidget({ onSolved }: WidgetProps) {
  const { t } = useT();
  const [fresh, setFresh] = useState(false);
  const r = nonceReuse(fresh);
  return (
    <div className="nl-card cb-card">
      <label className="ui-switch">
        <input
          type="checkbox"
          checked={fresh}
          onChange={(e) => {
            setFresh(e.target.checked);
            onSolved(e.target.checked);
          }}
        />
        {t("A fresh nonce for each message")}
      </label>
      <pre className="ui-query" tabIndex={0}>
        {`A  nonce=1  ${hex(r.a)}\nB  nonce=${fresh ? 2 : 1}  ${hex(r.b)}`}
      </pre>
      <div className="cb-grid">
        <div>
          <span className="cb-label">
            {t("Message A (public, the attacker knows it)")}
          </span>
          <p className="sy-msg">{MSG_A}</p>
        </div>
        <div>
          <span className="cb-label">
            {t("A ⊕ B ⊕ message A gives the attacker")}
          </span>
          <p className={`sy-msg ${r.leaked ? "bad" : "ok"}`} aria-live="polite">
            {r.recovered}
          </p>
        </div>
      </div>
      {r.leaked ? (
        <p className="nl-fail">
          <Skull size={15} aria-hidden="true" />{" "}
          {t("The keystream repeated, so message B is read without the key.")}
        </p>
      ) : (
        <p className="nl-pass">
          <ShieldCheck size={15} aria-hidden="true" />{" "}
          {t(
            "Different keystreams: the result is noise, message B stays secret.",
          )}
        </p>
      )}
    </div>
  );
}

/** A payment in CTR, changed by flipping bits, with or without a tag. */
function TamperWidget({ onSolved }: WidgetProps) {
  const { t } = useT();
  const [tagged, setTagged] = useState(false);
  const r = tamper(tagged);
  return (
    <div className="nl-card cb-card">
      <label className="ui-switch">
        <input
          type="checkbox"
          checked={tagged}
          onChange={(e) => {
            setTagged(e.target.checked);
            onSolved(e.target.checked);
          }}
        />
        {t("Add an authentication tag (AES-GCM)")}
      </label>
      <div className="cb-grid">
        <div>
          <span className="cb-label">{t("The customer sends")}</span>
          <p className="sy-msg">{PAYMENT}</p>
        </div>
        <div>
          <span className="cb-label">
            {t("On the way, the attacker flips bits under “1”")}
          </span>
          <code className="sy-hex">{hex(r.forged)}</code>
        </div>
      </div>
      <div
        aria-live="polite"
        className={`ac-reply ${r.accepted ? "bad" : "ok"}`}
      >
        <strong>{t("The bank")}</strong>
        {r.accepted ? (
          <>
            <p className="sy-msg bad">{r.read}</p>
            <p className="nl-fail">
              <Skull size={15} aria-hidden="true" />{" "}
              {t(
                "Accepted: the sum changed without the key, and nobody noticed.",
              )}
            </p>
          </>
        ) : (
          <p className="nl-pass">
            <ShieldCheck size={15} aria-hidden="true" />{" "}
            {t("Refused: the tag does not match, the message was changed.")}
          </p>
        )}
      </div>
    </div>
  );
}
