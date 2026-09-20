"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Counter } from "./Counter";
import { HackerOrbit } from "./HackerOrbit";
import { useTypewriter } from "./useTypewriter";
import "./hacker-theme.css";
import "./hacker-landing.css";

export function HackerLanding() {
  const { output, done } = useTypewriter(
    "BREACH THE ORDINARY. DEFEND WHAT MATTERS.",
    28,
    500,
  );

  return (
    <div className="hk hk-landing">
      <section className="hk-hero">
        <Image
          src="/concept/hacker-hero.jpg"
          alt="Hooded operator working across a multi-monitor security console"
          fill
          priority
          sizes="100vw"
          className="hk-hero-img"
        />
        <div className="hk-hero-scrim" />
        <div className="hk-vignette" />

        <div className="hk-hero-content container hk-hero-grid">
          <div className="hk-hero-copy-col">
            <span className="hk-noise-badge">
              <i />
              live intrusion monitor — sandboxed
            </span>

            <h1 className="hk-hero-title">
              <span className="hk-glitch" data-text="ACCESS THE MATRIX">
                ACCESS THE MATRIX
              </span>
            </h1>

            <p className="hk-typed">
              {output}
              {!done && <span className="hk-caret" />}
            </p>

            <p className="hk-hero-copy">
              A concept security-ops console: offensive research, live
              monitoring, and incident response, reimagined as one dark, glowing
              interface.
            </p>

            <div className="hk-hero-actions">
              <Link href="/concept/login" className="hk-btn hk-btn-solid">
                Enter the console <ArrowUpRight size={14} />
              </Link>
            </div>

            <div className="hk-stat-strip">
              <div>
                <strong>
                  <Counter target={18420} suffix="+" />
                </strong>
                <span>threats neutralized</span>
              </div>
              <div>
                <strong>
                  <Counter target={99} suffix=".98%" />
                </strong>
                <span>uptime, trailing 12mo</span>
              </div>
              <div>
                <strong>
                  <Counter target={4} suffix="min" />
                </strong>
                <span>median response time</span>
              </div>
              <div>
                <strong>
                  <Counter target={312} suffix="" />
                </strong>
                <span>nodes under watch</span>
              </div>
            </div>
            <span className="hk-stat-caption">
              {"// illustrative console metrics, not live data"}
            </span>
          </div>

          <div className="hk-orbit-col">
            <HackerOrbit />
          </div>
        </div>
      </section>
    </div>
  );
}
