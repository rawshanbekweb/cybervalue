"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronRight,
  Download,
  FileCode2,
  Flag,
  Fingerprint,
  Lightbulb,
  LockKeyhole,
  Radio,
  RotateCcw,
  Send,
  Terminal,
  UnlockKeyhole,
} from "lucide-react";
import {
  CHALLENGES,
  CHALLENGE_IDS,
  inspectPath,
  type Challenge,
  type ChallengeId,
} from "@/lib/ctf/catalog";
import {
  CTF_STORAGE_KEY,
  ctfScore,
  decodeSignal,
  restoreProgress,
  vaultUnlocked,
  type DecodeMode,
  type Entry,
} from "@/lib/ctf/progress";
import { useLocalStorageState } from "../useLocalStorageState";
import { downloadText } from "../security-lab/storage";
import "./ctf.css";

function subscribe(listener: () => void) {
  window.addEventListener("hashchange", listener);
  return () => window.removeEventListener("hashchange", listener);
}
function selectedChallenge(): ChallengeId {
  return (
    CHALLENGE_IDS.find((id) => window.location.hash === `#challenge/${id}`) ??
    "source"
  );
}

export function SignalCTF() {
  const selected = useSyncExternalStore(
    subscribe,
    selectedChallenge,
    () => "source" as ChallengeId,
  );
  const [stored, setStored] = useLocalStorageState<unknown>(
    CTF_STORAGE_KEY,
    null,
  );
  const progress = useMemo(() => restoreProgress(stored), [stored]);
  const [busy, setBusy] = useState(false);
  const [resetVersion, setResetVersion] = useState(0);
  const [feedback, setFeedback] = useState<{
    id: ChallengeId;
    ok: boolean;
    message: string;
  } | null>(null);
  const challenge = CHALLENGES.find((item) => item.id === selected)!;
  const solved = CHALLENGE_IDS.filter((id) => progress[id].proof).length;
  const unlocked = vaultUnlocked(progress);
  const complete = unlocked && !!progress.vault.proof;
  const score = ctfScore(progress);
  const update = (id: ChallengeId, patch: Partial<Entry>) =>
    setStored({ ...progress, [id]: { ...progress[id], ...patch } });

  async function submit(flag: string) {
    if (busy) return;
    setBusy(true);
    setFeedback(null);
    try {
      const response = await fetch("/api/ctf/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selected,
          flag,
          proofs: Object.fromEntries(
            CHALLENGE_IDS.map((id) => [id, progress[id].proof]),
          ),
        }),
        signal: AbortSignal.timeout(12000),
      });
      const data: unknown = await response.json();
      if (
        !data ||
        typeof data !== "object" ||
        !("message" in data) ||
        typeof data.message !== "string" ||
        !("ok" in data)
      )
        throw new Error("Invalid response");
      const result = data as {
        ok: boolean;
        message: string;
        proof?: string;
        fragment?: string;
      };
      if (
        response.ok &&
        result.ok &&
        typeof result.proof === "string" &&
        /^[a-f0-9]{64}$/.test(result.proof)
      ) {
        update(selected, {
          proof: result.proof,
          fragment: result.fragment ?? "",
          message: result.message,
        });
        setFeedback({
          id: selected,
          ok: true,
          message: "Flag qabul qilindi. Relay qayta ulandi.",
        });
      } else {
        setFeedback({ id: selected, ok: false, message: result.message });
      }
    } catch {
      setFeedback({
        id: selected,
        ok: false,
        message:
          "Server bilan aloqa bo‘lmadi. Flag saqlanib turibdi — qayta urinib ko‘ring.",
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="ctf-root" lang="uz">
      <div className="ctf-shell container">
        <div className="ctf-topline">
          <Link href="/playground">
            <ArrowLeft size={14} /> Playground
          </Link>
          <span>
            <span className="ctf-led" /> INTERAKTIV CTF / VOL. 01
          </span>
          <span className="ctf-session-label">
            NOVA STATION · TRAINING SIMULATION
          </span>
        </div>

        <header className="ctf-hero">
          <div className="ctf-hero-copy">
            <span className="ctf-eyebrow">OPERATION: SO‘NGGI SIGNAL</span>
            <h1>
              SUKUTNI
              <br />
              <span>BUZING.</span>
              <span className="ctf-title-dot" aria-hidden="true">
                _
              </span>
            </h1>
            <p>
              00:17. Stansiya jim bo‘lib qoldi. Besh tugun, yashirilgan izlar va
              yuborilmagan bitta xabar. Uni topa olasizmi?
            </p>
            <a className="ctf-button ctf-button-bright" href="#operation-board">
              {complete
                ? "Operatsiyani ko‘rish"
                : solved
                  ? "Tergovni davom ettirish"
                  : "Operatsiyani boshlash"}
              <ArrowDown size={17} />
            </a>
            <div className="ctf-hero-meta">
              <span>01—05 TOPSHIRIQ</span>
              <i />
              <span>25–40 DAQIQA</span>
              <i />
              <span>HISOB KERAK EMAS</span>
            </div>
          </div>
          <div
            className={`ctf-radar-card ${complete ? "is-restored" : ""}`}
            aria-label={
              complete
                ? "NOVA bilan aloqa tiklandi"
                : "NOVA: oxirgi aloqa 00:17"
            }
          >
            <div className="ctf-radar-top">
              <span>
                <Radio size={14} /> NOVA / RX—17
              </span>
              <span>{complete ? "ONLINE" : "SIGNAL LOST"}</span>
            </div>
            <div className="ctf-radar" aria-hidden="true">
              <div className="ctf-radar-grid" />
              <div className="ctf-radar-sweep" />
              <div className="ctf-radar-ring ring-one" />
              <div className="ctf-radar-ring ring-two" />
              <div className="ctf-radar-ring ring-three" />
              <span className="ctf-radar-cross horizontal" />
              <span className="ctf-radar-cross vertical" />
              <span className="ctf-blip blip-one" />
              <span className="ctf-blip blip-two" />
              <span className="ctf-blip blip-three" />
              <div className="ctf-radar-center">
                <Fingerprint size={39} strokeWidth={1} />
                <strong>{complete ? "00:18" : "00:17"}</strong>
                <span>
                  {complete ? "ALOQA TIKLANDI" : "OXIRGI ALOQA / UTC"}
                </span>
              </div>
              <span className="ctf-radar-coordinate">41° N / SECTOR 07</span>
            </div>
            <div className="ctf-radar-bottom">
              <span>
                {complete ? "TRANSMISSION RECEIVED" : "WAITING FOR AN OPERATOR"}
              </span>
              <span className="ctf-wave" aria-hidden="true">
                ▁▂▅▂▁▃▆▂▁
              </span>
            </div>
          </div>
        </header>

        <section className="ctf-metrics" aria-label="Operatsiya holati">
          <div>
            <span className="ctf-eyebrow">SIZNING BALLINGIZ</span>
            <strong>
              {String(score).padStart(3, "0")}
              <small> / 900</small>
            </strong>
          </div>
          <div>
            <span className="ctf-eyebrow">TIKLANGAN TUGUNLAR</span>
            <strong>
              {String(solved).padStart(2, "0")}
              <small> / 05</small>
            </strong>
          </div>
          <div className="ctf-progress-block">
            <label htmlFor="ctf-progress">
              SIGNALNI TIKLASH <span>{solved * 20}%</span>
            </label>
            <progress id="ctf-progress" max={5} value={solved} />
          </div>
          <div className="ctf-operator">
            <Fingerprint size={24} />
            <span>
              OPERATOR
              <strong>
                {complete ? "Aloqa tiklandi" : "Siz navbatchisiz"}
              </strong>
            </span>
          </div>
        </section>

        <section
          id="operation-board"
          className="ctf-board"
          aria-labelledby="ctf-board-title"
        >
          <div className="ctf-section-heading">
            <div>
              <span className="ctf-eyebrow">01 / OPERATSIYA XARITASI</span>
              <h2 id="ctf-board-title">Izdan signalgacha.</h2>
            </div>
            <p>
              Istalgan ochiq tugundan boshlang.
              <br />
              To‘rtta kalit yakuniy seyfni ochadi.
            </p>
          </div>
          <nav className="ctf-nodes" aria-label="CTF topshiriqlari">
            {CHALLENGES.map((item) => {
              const locked = item.id === "vault" && !unlocked;
              const done = !!progress[item.id].proof;
              return (
                <a
                  key={item.id}
                  href={`#challenge/${item.id}`}
                  aria-current={selected === item.id ? "step" : undefined}
                  className={`${done ? "is-solved" : ""} ${locked ? "is-locked" : ""}`}
                  onClick={(event) => {
                    if (busy) event.preventDefault();
                  }}
                >
                  <div className="ctf-node-top">
                    <span>{item.number}</span>
                    {done ? (
                      <Check size={17} aria-label="Topildi" />
                    ) : locked ? (
                      <LockKeyhole size={16} aria-label="Qulflangan" />
                    ) : (
                      <ArrowRight size={16} />
                    )}
                  </div>
                  <span className="ctf-node-category">{item.category}</span>
                  <h3>{item.title}</h3>
                  <div className="ctf-node-bottom">
                    <span>{item.points} PTS</span>
                    <span>
                      {done ? "TIKLANDI" : locked ? "QULFLANGAN" : "OCHIQ"}
                    </span>
                  </div>
                </a>
              );
            })}
          </nav>
        </section>

        <section className="ctf-workspace" aria-label="Tanlangan topshiriq">
          <aside className="ctf-brief">
            <div className="ctf-case-number">
              CASE / {challenge.number}
              <span>{challenge.difficulty}</span>
            </div>
            <h2>{challenge.title}</h2>
            <p className="ctf-teaser">{challenge.teaser}</p>
            <p>{challenge.brief}</p>
            <div className="ctf-objective">
              <Flag size={17} />
              <div>
                <h3>Vazifangiz</h3>
                <p>{challenge.objective}</p>
              </div>
            </div>
            <div className="ctf-case-meta">
              <span>{challenge.duration}</span>
              <span>
                {challenge.points - progress[selected].hints * 10} ball mavjud
              </span>
            </div>
            <div className="ctf-hints">
              <div>
                <Lightbulb size={16} />
                <h3>Bir oz yordam?</h3>
                <span>{progress[selected].hints}/3</span>
              </div>
              <p>
                Har bir ishora shu topshiriqdan 10 ball ayiradi. Xato urinishlar
                bepul.
              </p>
              <ol>
                {challenge.hints
                  .slice(0, progress[selected].hints)
                  .map((hint) => (
                    <li key={hint}>{hint}</li>
                  ))}
              </ol>
              <button
                className="ctf-button ctf-button-quiet"
                disabled={
                  busy ||
                  progress[selected].hints >= 3 ||
                  !!progress[selected].proof ||
                  (selected === "vault" && !unlocked)
                }
                onClick={() =>
                  update(selected, { hints: progress[selected].hints + 1 })
                }
              >
                {progress[selected].hints >= 3
                  ? "Barcha ishoralar ochilgan"
                  : progress[selected].proof
                    ? "Topshiriq yechilgan"
                    : "Ishorani ochish · −10 ball"}
                <ChevronRight size={15} />
              </button>
            </div>
            <div className="ctf-keyring">
              <span className="ctf-eyebrow">YIG‘ILGAN KALITLAR / 01 → 04</span>
              <div>
                {CHALLENGE_IDS.slice(0, 4).map((id, index) => (
                  <span key={id}>
                    <small>0{index + 1}</small>
                    <strong>{progress[id].fragment || "·"}</strong>
                  </span>
                ))}
              </div>
            </div>
          </aside>
          <div className="ctf-workbench">
            {selected === "vault" && !unlocked ? (
              <div className="ctf-locked-panel">
                <div>
                  <LockKeyhole size={36} strokeWidth={1.2} />
                </div>
                <span className="ctf-eyebrow">
                  FINAL TRANSMISSION / ENCRYPTED
                </span>
                <h2>Seyf hali jim.</h2>
                <p>
                  Avval 01–04 tugunlardan to‘rtta flagni toping. Har bir
                  tasdiqlangan flag kalitning bir harfini beradi.
                </p>
                <span>
                  {
                    CHALLENGE_IDS.slice(0, 4).filter((id) => progress[id].proof)
                      .length
                  }{" "}
                  / 4 kalit topildi
                </span>
                <a
                  href={`#challenge/${CHALLENGE_IDS.slice(0, 4).find((id) => !progress[id].proof) ?? "source"}`}
                  className="ctf-button ctf-button-bright"
                >
                  Ochiq tugunga qaytish <ArrowRight size={16} />
                </a>
              </div>
            ) : (
              <ChallengeWorkbench
                key={`${selected}:${resetVersion}`}
                challenge={challenge}
                entry={progress[selected]}
                busy={busy}
                feedback={feedback?.id === selected ? feedback : null}
                submit={submit}
                update={(patch) => update(selected, patch)}
              />
            )}
          </div>
        </section>

        {complete && (
          <section className="ctf-finale" aria-labelledby="ctf-finale-title">
            <span className="ctf-finale-icon">
              <Radio size={34} />
            </span>
            <div>
              <span className="ctf-eyebrow">
                TRANSMISSION RECEIVED / 00:18 UTC
              </span>
              <h2 id="ctf-finale-title">Kimdir hali ham tinglayapti.</h2>
              <p>{progress.vault.message}</p>
              <strong>Operatsiya yakunlandi. {score} / 900 ball.</strong>
            </div>
          </section>
        )}

        <footer className="ctf-footer">
          <div>
            <span className="ctf-eyebrow">SIZNING SHAXSIY TERGOVINGIZ</span>
            <p>
              Progress shu brauzerda saqlanadi. Bu mashq reyting yoki sertifikat
              bermaydi. Flagni tekshirish uchun internet kerak.
            </p>
          </div>
          <div>
            <button
              className="ctf-button ctf-button-quiet"
              onClick={() =>
                downloadText(
                  "nova-0017-report.md",
                  `# NOVA / 00:17 — So‘nggi signal\n\nBall: ${score}/900. Tugunlar: ${solved}/5.\n\n${CHALLENGES.map((item) => `## ${item.number}. ${item.title}\n\nHolat: ${progress[item.id].proof ? "Tiklandi" : "Ochiq"}. Ishoralar: ${progress[item.id].hints}/3.\n\n${progress[item.id].message}\n\nQaydlar: ${progress[item.id].notes || "Yozilmagan"}`).join("\n\n")}\n\nBu shaxsiy o‘quv qaydnomasi; musobaqa natijasi yoki sertifikat emas.\n`,
                )
              }
            >
              <Download size={15} /> Hisobot
            </button>
            <button
              className="ctf-button ctf-button-quiet"
              disabled={busy}
              onClick={() => {
                if (
                  window.confirm(
                    "Barcha CTF flaglari, ishoralar va qaydlar o‘chirilsinmi?",
                  )
                ) {
                  setStored(null);
                  setFeedback(null);
                  setResetVersion((version) => version + 1);
                  window.location.hash = "challenge/source";
                }
              }}
            >
              <RotateCcw size={15} /> Qayta boshlash
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}

function ChallengeWorkbench({
  challenge,
  entry,
  busy,
  feedback,
  submit,
  update,
}: {
  challenge: Challenge;
  entry: Entry;
  busy: boolean;
  feedback: { ok: boolean; message: string } | null;
  submit: (flag: string) => Promise<void>;
  update: (patch: Partial<Entry>) => void;
}) {
  const [flag, setFlag] = useState("");
  const [path, setPath] = useState("/robots.txt");
  const [response, setResponse] = useState<ReturnType<
    typeof inspectPath
  > | null>(null);
  const file = challenge.files[0];
  return (
    <>
      <section className="ctf-evidence" aria-labelledby="ctf-evidence-title">
        <div className="ctf-panel-bar">
          <span className="ctf-window-dots" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <h3 id="ctf-evidence-title">
            <FileCode2 size={14} />
            {file.name}
          </h3>
          <button
            aria-label="Dalil faylini yuklab olish"
            onClick={() =>
              downloadText(
                file.name.replace(/\.html$/, ".html.txt"),
                file.content,
                "text/plain",
              )
            }
          >
            <Download size={15} />
          </button>
        </div>
        <div className="ctf-evidence-label">
          <span>RECOVERED EVIDENCE</span>
          <span>READ ONLY / UTF-8</span>
        </div>
        <pre className="ctf-code" tabIndex={0} aria-label="Dalil matni">
          <code>
            {file.content.split("\n").map((line, index) => (
              <span
                key={index}
                className={`ctf-code-line ${line.trim().startsWith("<!--") ? "is-comment" : ""}`}
              >
                <span className="ctf-line-number" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span>{line || " "}</span>
              </span>
            ))}
          </code>
        </pre>
        <div className="ctf-evidence-foot">
          <span>
            <span className="ctf-led" /> DALIL YUKLANDI
          </span>
          <span>{file.content.split("\n").length} LINES</span>
        </div>
      </section>

      {challenge.id === "archive" && (
        <section className="ctf-tool" aria-labelledby="ctf-path-title">
          <h3 id="ctf-path-title">
            <Terminal size={16} /> Mahalliy yo‘l tekshiruvchisi
          </h3>
          <p>Bu o‘yin arxivi. Tashqi saytlarga so‘rov yuborilmaydi.</p>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              setResponse(inspectPath(path));
            }}
          >
            <label className="sr-only" htmlFor="ctf-path">
              Arxiv yo‘li
            </label>
            <span className="ctf-get" aria-hidden="true">
              GET
            </span>
            <input
              id="ctf-path"
              value={path}
              maxLength={160}
              onChange={(event) => setPath(event.target.value)}
              spellCheck={false}
            />
            <button className="ctf-button ctf-button-quiet" type="submit">
              Ochish <ArrowRight size={15} />
            </button>
          </form>
          {response && (
            <div role="status" className="ctf-path-response">
              <span>HTTP {response.status}</span>
              <pre>{response.body}</pre>
            </div>
          )}
        </section>
      )}
      <Decoder />
      <section className="ctf-submit-panel" aria-labelledby="ctf-submit-title">
        <div>
          <span className="ctf-eyebrow">
            {entry.proof ? "RELAY RESTORED" : "FLAG TOPDINGIZMI?"}
          </span>
          <h3 id="ctf-submit-title">
            {entry.proof ? "Yana bir tugun ulandi." : "Topilmani tasdiqlang."}
          </h3>
        </div>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void submit(flag);
          }}
        >
          <label className="sr-only" htmlFor="ctf-flag">
            Flag
          </label>
          <div className="ctf-flag-input">
            <Flag size={17} />
            <input
              id="ctf-flag"
              placeholder="CV{siz_topgan_flag}"
              value={flag}
              maxLength={160}
              required
              spellCheck={false}
              autoComplete="off"
              autoCapitalize="off"
              disabled={busy}
              onChange={(event) => setFlag(event.target.value)}
            />
          </div>
          <button
            className="ctf-button ctf-button-bright"
            disabled={busy}
            type="submit"
          >
            {busy
              ? "Tekshirilmoqda…"
              : entry.proof
                ? "Qayta tekshirish"
                : "Flagni yuborish"}
            <Send size={16} />
          </button>
        </form>
        <p className="ctf-submit-note">
          Format: CV{`{...}`} · Harflar registri muhim · Urinishlar ballni
          kamaytirmaydi
        </p>
        <p
          role="status"
          className={`ctf-feedback ${feedback?.ok ? "is-success" : ""}`}
        >
          {feedback?.message}
        </p>
      </section>
      {entry.proof && (
        <section className="ctf-debrief" aria-label="Topshiriq xulosasi">
          <div>
            <UnlockKeyhole size={19} />
            <h3>Signal ortidagi saboq</h3>
            {entry.fragment && <span>KALIT: {entry.fragment}</span>}
          </div>
          <p>{entry.message}</p>
          {challenge.id !== "vault" && (
            <a
              className="ctf-next"
              href={`#challenge/${CHALLENGE_IDS[CHALLENGE_IDS.indexOf(challenge.id) + 1]}`}
            >
              Keyingi tugun <ArrowRight size={15} />
            </a>
          )}
        </section>
      )}
      <details className="ctf-notes">
        <summary>
          Tergov daftari <span>SHU BRAUZERDA SAQLANADI</span>
        </summary>
        <label htmlFor="ctf-notes-input">
          Qanday iz topdingiz? Qanday xulosa chiqardingiz?
        </label>
        <textarea
          id="ctf-notes-input"
          rows={4}
          maxLength={3000}
          value={entry.notes}
          disabled={busy}
          onChange={(event) => update({ notes: event.target.value })}
          placeholder="Dalil → taxmin → tekshiruv → xulosa…"
        />
      </details>
    </>
  );
}

function Decoder() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  function run(mode: DecodeMode) {
    try {
      setOutput(decodeSignal(input, mode));
      setError("");
    } catch (error) {
      setOutput("");
      setError(
        error instanceof Error ? error.message : "Matnni ochib bo‘lmadi.",
      );
    }
  }
  return (
    <details className="ctf-decoder">
      <summary>
        <span>
          <Terminal size={16} /> Operator asboblari
        </span>
        <span>
          BASE64 / ROT13 / HEX <ChevronRight size={14} />
        </span>
      </summary>
      <div className="ctf-decoder-body">
        <label htmlFor="ctf-decode-input">Kodlangan matn</label>
        <textarea
          id="ctf-decode-input"
          rows={3}
          maxLength={6000}
          value={input}
          onChange={(event) => {
            setInput(event.target.value);
            setOutput("");
            setError("");
          }}
          spellCheck={false}
        />
        <div className="ctf-decode-actions">
          {(["base64", "rot13", "hex"] as const).map((mode) => (
            <button
              key={mode}
              className="ctf-button ctf-button-quiet"
              onClick={() => run(mode)}
            >
              {mode.toUpperCase()} ochish
            </button>
          ))}
        </div>
        <div role="status">
          {error && <p className="ctf-feedback">{error}</p>}
          {output && (
            <>
              <pre className="ctf-decoded">{output}</pre>
              <button
                className="ctf-reuse"
                onClick={() => {
                  setInput(output);
                  setOutput("");
                }}
              >
                Natijani kirishga o‘tkazish <ArrowRight size={13} />
              </button>
            </>
          )}
        </div>
      </div>
    </details>
  );
}
