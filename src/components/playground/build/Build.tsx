"use client";

import { useState } from "react";
import { Binary, ShieldCheck } from "lucide-react";
import { useT } from "../network-lab/use-t";
import {
  AnimLab,
  CommonWidgetView,
  type WidgetProps,
} from "../anim-lab/AnimLab";
import { LESSONS, PROGRESS_KEY, type Widget } from "@/lib/build/curriculum";
import {
  ARTIFACTS,
  PARTS,
  SECTION_NAMES,
  SECTIONS,
  sectionsRight,
  STAGE_NAMES,
  STAGES,
  stagesRight,
  type Section,
  type SectionPicks,
  type Stage,
  type StagePicks,
} from "@/lib/build/tools";
import "../http-basics/http-basics.css";
import "../crypto-basics/crypto-basics.css";
import "../securecode/securecode.css";

// Academy Intermediate · How programs are built: name the stage behind each
// file, then place a program's parts in their sections.
export function Build() {
  const { t } = useT();
  return (
    <AnimLab
      lessons={LESSONS}
      progressKey={PROGRESS_KEY}
      eyebrow={t("REVERSE · MODULE 1")}
      title={t("How programs are built.")}
      subtitle={t("From source code to the bytes a processor runs.")}
      description={t(
        "Follow source code through the preprocessor, compiler, assembler and linker, tell ELF from PE from Mach-O, place a program’s parts in .text, .rodata, .data and .bss, read the header and entry point, compare static and dynamic linking and see what stripping removes.",
      )}
      badge={t("BINARY / LAB")}
      icon={<Binary size={22} />}
      checkpoints={["build-1"]}
      back={{ href: "/intermediate", label: "Academy Intermediate" }}
      renderWidget={(widget: Widget, props) => {
        switch (widget.type) {
          case "stages":
            return <StagesWidget {...props} />;
          case "sections":
            return <SectionsWidget {...props} />;
          default:
            return <CommonWidgetView widget={widget} {...props} />;
        }
      }}
    />
  );
}

/** Five files from `gcc -save-temps`; name the stage that made each. */
function StagesWidget({ onSolved }: WidgetProps) {
  const { t, text } = useT();
  const [picks, setPicks] = useState<StagePicks>({});
  const right = ARTIFACTS.filter((a) => picks[a.file] === a.stage).length;
  return (
    <div className="nl-card cb-card">
      <p className="cb-out">
        <code>$ gcc -save-temps hello.c -o hello</code>
      </p>
      <ol className="sc-lines">
        {ARTIFACTS.map((a) => {
          const c = picks[a.file];
          return (
            <li key={a.file} className="sc-line">
              <label className="cb-field">
                <span>
                  <code>{a.file}</code> — {text(a.what)}
                </span>
                <select
                  value={c ?? ""}
                  onChange={(e) => {
                    const next = {
                      ...picks,
                      [a.file]: e.target.value as Stage,
                    };
                    setPicks(next);
                    onSolved(stagesRight(next));
                  }}
                >
                  <option value="">{t("Choose a stage")}</option>
                  {STAGES.map((s) => (
                    <option key={s} value={s}>
                      {text(STAGE_NAMES[s])}
                    </option>
                  ))}
                </select>
              </label>
              {c && (
                <span className={c === a.stage ? "sd-ok" : "sd-bad"}>
                  {c === a.stage ? t("That’s it") : t("Not this one")}
                </span>
              )}
            </li>
          );
        })}
      </ol>
      <p className="cb-label">
        {t("Right calls: {n} of {total}", {
          n: right,
          total: ARTIFACTS.length,
        })}
      </p>
      {stagesRight(picks) && (
        <p className="nl-pass" aria-live="polite">
          <ShieldCheck size={15} aria-hidden="true" />{" "}
          {t(
            "Source, expanded source, assembly, object file, program: one command, four tools.",
          )}
        </p>
      )}
    </div>
  );
}

/** Parts of hello.c; choose the ELF section each lands in. */
function SectionsWidget({ onSolved }: WidgetProps) {
  const { t, text } = useT();
  const [picks, setPicks] = useState<SectionPicks>({});
  const right = PARTS.filter((p) => picks[p.code] === p.section).length;
  return (
    <div className="nl-card cb-card">
      <ol className="sc-lines">
        {PARTS.map((p) => {
          const c = picks[p.code];
          return (
            <li key={p.code} className="sc-line">
              <label className="cb-field">
                <code>{p.code}</code>
                <select
                  value={c ?? ""}
                  onChange={(e) => {
                    const next = {
                      ...picks,
                      [p.code]: e.target.value as Section,
                    };
                    setPicks(next);
                    onSolved(sectionsRight(next));
                  }}
                >
                  <option value="">{t("Choose a section")}</option>
                  {SECTIONS.map((s) => (
                    <option key={s} value={s}>
                      {text(SECTION_NAMES[s])}
                    </option>
                  ))}
                </select>
              </label>
              {c && (
                <span className={c === p.section ? "sd-ok" : "sd-bad"}>
                  {c === p.section ? text(p.why) : t("Not this one")}
                </span>
              )}
            </li>
          );
        })}
      </ol>
      <p className="cb-label">
        {t("Right calls: {n} of {total}", { n: right, total: PARTS.length })}
      </p>
      {sectionsRight(picks) && (
        <p className="nl-pass" aria-live="polite">
          <ShieldCheck size={15} aria-hidden="true" />{" "}
          {t(
            "Code in .text, the message in .rodata, the counter in .data and the empty buffer in .bss — the map every disassembler shows.",
          )}
        </p>
      )}
    </div>
  );
}
