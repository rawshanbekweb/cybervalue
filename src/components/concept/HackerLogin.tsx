"use client";

import { useState, useRef, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff, ShieldCheck, ArrowLeft, Cpu } from "lucide-react";
import { MatrixRain } from "./MatrixRain";
import { useBootSequence } from "./useBootSequence";
import "./hacker-theme.css";
import "./hacker-login.css";

const BOOT_LINES = [
  "> establishing secure channel...",
  "> handshake complete (tls 1.3)",
  "> loading operator profile...",
  "> awaiting credentials_",
];

const AUTH_LINES = [
  "> verifying operator id...",
  "> checking passphrase entropy...",
  "> session token issued",
  "> ACCESS GRANTED",
];

type Phase = "idle" | "authenticating" | "granted";

export function HackerLogin() {
  const { renderedLines, complete } = useBootSequence(BOOT_LINES, 16, 260);
  const [phase, setPhase] = useState<Phase>("idle");
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const authTimers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const [authLines, setAuthLines] = useState<string[]>([]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;
    setPhase("authenticating");
    setAuthLines([]);
    authTimers.current.forEach(clearTimeout);
    authTimers.current = [];
    AUTH_LINES.forEach((line, i) => {
      const t = setTimeout(
        () => {
          setAuthLines((prev) => [...prev, line]);
          if (i === AUTH_LINES.length - 1) {
            setTimeout(() => setPhase("granted"), 500);
          }
        },
        450 + i * 480,
      );
      authTimers.current.push(t);
    });
  };

  const reset = () => {
    authTimers.current.forEach(clearTimeout);
    setUsername("");
    setPassword("");
    setAuthLines([]);
    setPhase("idle");
  };

  return (
    <div className="hk hk-login">
      <div className="hk-login-visual">
        <Image
          src="/concept/hacker-hero.jpg"
          alt="Hooded operator working across a multi-monitor security console"
          fill
          priority
          sizes="(max-width: 900px) 100vw, 50vw"
          className="hk-login-img"
        />
        <div className="hk-login-scrim" />
        <MatrixRain className="hk-rain" />
        <div className="hk-scanlines" />
        <span className="hk-scanbeam" aria-hidden="true" />
        <div className="hk-login-visual-copy">
          <span className="hk-noise-badge">
            <i />
            identity verification
          </span>
          <h2 className="hk-glitch" data-text="WHO GOES THERE?">
            WHO GOES THERE?
          </h2>
          <p>
            Every session is logged, sandboxed, and reviewed. This one just
            isn&rsquo;t real.
          </p>
        </div>
      </div>

      <div className="hk-login-panel">
        <Link href="/" className="hk-back-link">
          <ArrowLeft size={13} /> back to console home
        </Link>

        <div className="hk-terminal">
          <div className="hk-feed-bar">
            <span className="hk-dot hk-dot-red" />
            <span className="hk-dot hk-dot-amber" />
            <span className="hk-dot hk-dot-green" />
            <span className="hk-feed-title">root@cybervalue: ~/login</span>
          </div>

          <div className="hk-terminal-body">
            <div className="hk-boot-log">
              {renderedLines.map((line, i) => (
                <div key={i}>{line}</div>
              ))}
              {!complete && <span className="hk-caret" />}
            </div>

            {complete && phase === "idle" && (
              <form className="hk-form" onSubmit={handleSubmit}>
                <label>
                  <span>operator id</span>
                  <div className="hk-input-row">
                    <span className="hk-prompt">&gt;</span>
                    <input
                      type="text"
                      autoComplete="off"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="ali"
                      required
                    />
                  </div>
                </label>
                <label>
                  <span>passphrase</span>
                  <div className="hk-input-row">
                    <span className="hk-prompt">&gt;</span>
                    <input
                      type={showPassword ? "text" : "password"}
                      autoComplete="off"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      className="hk-eye-toggle"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={
                        showPassword ? "Hide passphrase" : "Show passphrase"
                      }
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </label>
                <label className="hk-remember">
                  <input type="checkbox" defaultChecked />
                  <span>persist session on this node</span>
                </label>
                <button type="submit" className="hk-btn hk-btn-solid hk-submit">
                  Authenticate <Cpu size={14} />
                </button>
              </form>
            )}

            {(phase === "authenticating" || phase === "granted") && (
              <div className="hk-auth-log">
                {authLines.map((line, i) => (
                  <div
                    key={i}
                    className={
                      line.includes("GRANTED") ? "hk-line-granted" : undefined
                    }
                  >
                    {line}
                  </div>
                ))}
              </div>
            )}

            {phase === "granted" && (
              <div className="hk-granted-panel">
                <ShieldCheck size={22} />
                <p>
                  Session initialized for operator &ldquo;{username}&rdquo;.
                </p>
                <button type="button" className="hk-btn" onClick={reset}>
                  Disconnect &amp; try again
                </button>
              </div>
            )}
          </div>
        </div>

        <p className="hk-disclaimer">
          Concept UI only — this form does not authenticate against a real
          system and no data is transmitted or stored anywhere.
        </p>
      </div>
    </div>
  );
}
