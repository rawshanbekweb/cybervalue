"use client";

import { useState } from "react";
import { Container, ShieldCheck } from "lucide-react";
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
} from "@/lib/containers/curriculum";
import { DOCKERFILE, dockerfileRight } from "@/lib/containers/tools";
import "../http-basics/http-basics.css";
import "../crypto-basics/crypto-basics.css";
import "../securecode/securecode.css";
import "../supplychain/supplychain.css";

// Academy Intermediate · Containers: find the four risky lines in a
// Dockerfile.
export function Containers() {
  const { t } = useT();
  return (
    <AnimLab
      lessons={LESSONS}
      progressKey={PROGRESS_KEY}
      eyebrow={t("CLOUD · MODULE 4")}
      title={t("Containers.")}
      subtitle={t("Small images, no secrets inside, never root.")}
      description={t(
        "Learn what containers and images are, why layers never forget, review a Dockerfile for four risky lines, run as a non-root user with trimmed privileges, scan images for known vulnerabilities and use only trusted, signed images.",
      )}
      badge={t("DOCKER / LAB")}
      icon={<Container size={22} />}
      checkpoints={["containers-1"]}
      back={{ href: "/intermediate", label: "Academy Intermediate" }}
      renderWidget={(widget: Widget, props) => {
        switch (widget.type) {
          case "dockerfile":
            return <DockerfileWidget {...props} />;
          default:
            return <CommonWidgetView widget={widget} {...props} />;
        }
      }}
    />
  );
}

/** Eight Dockerfile lines; tick the risky ones. */
function DockerfileWidget({ onSolved }: WidgetProps) {
  const { t, text } = useT();
  const [picked, setPicked] = useState<number[]>([]);
  const solved = dockerfileRight(picked);
  const toggle = (i: number, on: boolean) => {
    const next = on ? [...picked, i] : picked.filter((n) => n !== i);
    setPicked(next);
    onSolved(dockerfileRight(next));
  };
  return (
    <div className="nl-card cb-card">
      <ol className="sc-lines">
        {DOCKERFILE.map((line, i) => (
          <li key={i} className="sc-line">
            <label>
              <input
                type="checkbox"
                aria-label={t("Line {n} is risky", { n: i + 1 })}
                checked={picked.includes(i)}
                onChange={(e) => toggle(i, e.target.checked)}
              />{" "}
              <code className="sc-code">{line.code}</code>
            </label>
            {solved && (
              <span className={line.risky ? "sd-bad" : "sd-ok"}>
                {text(line.why)}
                {line.fix && (
                  <>
                    {" "}
                    → <code>{line.fix}</code>
                  </>
                )}
              </span>
            )}
          </li>
        ))}
      </ol>
      {solved && (
        <p className="nl-pass" aria-live="polite">
          <ShieldCheck size={15} aria-hidden="true" />{" "}
          {t(
            "Four risky lines: an unpinned base image, copying everything, a secret baked into a layer and running as root.",
          )}
        </p>
      )}
    </div>
  );
}
