// Story scenes for the video lessons: an illustrated café with Ali and
// Jasur, a postcard read by everyone on the way, a quiz card and Kibi's
// own scene. Like the other scenes they are drawn from progress p alone.
import { Kibi, type Mood } from "./Kibi";

const clamp = (x: number) => Math.min(1, Math.max(0, x));
const seg = (p: number, a: number, b: number) => clamp((p - a) / (b - a));
const ease = (x: number) => 1 - (1 - x) ** 3;
const lerp = (a: number, b: number, x: number) => a + (b - a) * x;

/** A seated person at a laptop. `typing` (0…1) moves the hands. */
function Person({
  x,
  y,
  hood,
  skin = "#d9a066",
  hair = "#2b1d14",
  cap = false,
  typing = 0,
  face = "calm",
  name,
}: {
  x: number;
  y: number;
  hood: string;
  skin?: string;
  hair?: string;
  cap?: boolean;
  typing?: number;
  face?: "calm" | "smile" | "grin" | "confused" | "shock";
  name: string;
}) {
  const tap = Math.sin(typing * 60) * 4 * (typing > 0 && typing < 1 ? 1 : 0);
  return (
    <g transform={`translate(${x} ${y}) scale(1.25)`}>
      {/* body */}
      <path d="M-70 210q0-90 70-100q70 10 70 100z" fill={hood} />
      <path
        d="M-22 112q22 18 44 0"
        stroke="#00000033"
        strokeWidth="6"
        fill="none"
      />
      {/* head */}
      <circle cx="0" cy="58" r="48" fill={skin} />
      {cap ? (
        <path d="M-50 50q0-58 50-58t50 58q-50-18-100 0z" fill={hood} />
      ) : (
        <path
          d="M-48 46q2-50 48-52 50 2 48 52-12-26-48-26-36 0-48 26z"
          fill={hair}
        />
      )}
      {cap && <path d="M-60 52q60-30 120 0l-8 10q-52-22-104 0z" fill="#111" />}
      {/* face */}
      <g fill="#2b1d14">
        {face === "shock" ? (
          <>
            <circle cx="-16" cy="58" r="7" />
            <circle cx="16" cy="58" r="7" />
            <ellipse cx="0" cy="84" rx="8" ry="10" />
          </>
        ) : (
          <>
            <circle cx="-16" cy="58" r="5" />
            <circle cx="16" cy="58" r="5" />
          </>
        )}
      </g>
      {face === "smile" && (
        <path
          d="M-14 78q14 12 28 0"
          stroke="#2b1d14"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
        />
      )}
      {face === "grin" && (
        <path
          d="M-18 76q18 18 36 0z"
          fill="#fff"
          stroke="#2b1d14"
          strokeWidth="3"
        />
      )}
      {face === "confused" && (
        <path
          d="M-12 82q6-6 12 0t12 0"
          stroke="#2b1d14"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
        />
      )}
      {face === "calm" && (
        <path
          d="M-10 80h20"
          stroke="#2b1d14"
          strokeWidth="4"
          strokeLinecap="round"
        />
      )}
      {/* arms reaching to the keyboard */}
      <path
        d={`M-56 150q20 40 46 ${48 + tap}`}
        stroke={hood}
        strokeWidth="26"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d={`M56 150q-20 40 -46 ${48 - tap}`}
        stroke={hood}
        strokeWidth="26"
        fill="none"
        strokeLinecap="round"
      />
      <text
        x="0"
        y="-12"
        textAnchor="middle"
        fontFamily="Inter, Arial, sans-serif"
        fontWeight="700"
        fontSize="30"
        fill="#fff"
      >
        {name}
      </text>
    </g>
  );
}

/** A laptop seen from behind the screen, with what the screen shows. */
function Laptop({
  x,
  y,
  children,
  glow = "#3b8be0",
}: {
  x: number;
  y: number;
  children?: React.ReactNode;
  glow?: string;
}) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect
        x="-120"
        y="-150"
        width="240"
        height="160"
        rx="12"
        fill="#1c2230"
        stroke={glow}
        strokeWidth="4"
      />
      <rect x="-108" y="-138" width="216" height="136" rx="6" fill="#0d1117" />
      <g>{children}</g>
      <rect x="-150" y="10" width="300" height="16" rx="6" fill="#2b3240" />
    </g>
  );
}

function Cafe({ children }: { children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 1600 900" className="vl-story" aria-hidden="true">
      <defs>
        <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2a1f2e" />
          <stop offset="1" stopColor="#1a1420" />
        </linearGradient>
        <linearGradient id="win" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#24406b" />
          <stop offset="1" stopColor="#5b3f78" />
        </linearGradient>
      </defs>
      <rect width="1600" height="900" fill="url(#wall)" />
      {/* window with a night city */}
      <rect x="560" y="70" width="480" height="300" rx="18" fill="url(#win)" />
      <g fill="#0f1830">
        <rect x="580" y="230" width="60" height="140" />
        <rect x="650" y="190" width="80" height="180" />
        <rect x="740" y="250" width="50" height="120" />
        <rect x="800" y="170" width="90" height="200" />
        <rect x="900" y="220" width="60" height="150" />
        <rect x="970" y="200" width="60" height="170" />
      </g>
      <g fill="#ffd56b" opacity="0.7">
        <rect x="670" y="210" width="10" height="12" />
        <rect x="700" y="250" width="10" height="12" />
        <rect x="820" y="200" width="10" height="12" />
        <rect x="850" y="260" width="10" height="12" />
        <rect x="990" y="230" width="10" height="12" />
      </g>
      <rect
        x="560"
        y="70"
        width="480"
        height="300"
        rx="18"
        fill="none"
        stroke="#3a2e40"
        strokeWidth="14"
      />
      {/* lamps */}
      {[300, 1300].map((lx) => (
        <g key={lx}>
          <line x1={lx} y1="0" x2={lx} y2="90" stroke="#555" strokeWidth="4" />
          <path d={`M${lx - 50} 130q50-60 100 0z`} fill="#ffb829" />
          <ellipse
            cx={lx}
            cy="200"
            rx="200"
            ry="90"
            fill="#ffb829"
            opacity="0.07"
          />
        </g>
      ))}
      {/* counter and coffee machine */}
      <rect x="0" y="600" width="1600" height="300" fill="#2e2219" />
      <rect x="0" y="590" width="1600" height="20" fill="#4a3526" />
      <g transform="translate(1440 440)">
        <rect x="-60" y="0" width="120" height="150" rx="14" fill="#8a8f99" />
        <rect x="-40" y="20" width="80" height="40" rx="8" fill="#2b3240" />
        <rect x="-14" y="80" width="28" height="40" fill="#5c3b26" />
      </g>
      {/* plant */}
      <g transform="translate(120 520)">
        <rect x="-30" y="40" width="60" height="70" rx="10" fill="#a35a3a" />
        <path
          d="M0 40q-60-60-20-120q10 60 20 120zM0 40q60-60 20-120q-10 60-20 120zM0 40q-10-80 0-140q10 60 0 140z"
          fill="#2fbf8f"
        />
      </g>
      {children}
    </svg>
  );
}

/** The Wi-Fi router on the wall, broadcasting when `wave` > 0. */
function Router({ wave }: { wave: number }) {
  return (
    <g transform="translate(800 470)">
      <rect x="-70" y="-24" width="140" height="48" rx="12" fill="#e7ecf3" />
      <circle cx="-40" cy="0" r="6" fill={wave > 0 ? "#2fbf8f" : "#999"} />
      <circle cx="-20" cy="0" r="6" fill="#2fbf8f" />
      <line
        x1="-50"
        y1="-24"
        x2="-60"
        y2="-80"
        stroke="#e7ecf3"
        strokeWidth="8"
        strokeLinecap="round"
      />
      <line
        x1="50"
        y1="-24"
        x2="60"
        y2="-80"
        stroke="#e7ecf3"
        strokeWidth="8"
        strokeLinecap="round"
      />
      {[0, 1, 2].map((i) => {
        const r = ((wave * 3 + i / 3) % 1) * 220;
        return (
          <circle
            key={i}
            cx="0"
            cy="0"
            r={r}
            fill="none"
            stroke="#7fe3ff"
            strokeWidth="5"
            opacity={wave > 0 ? (1 - r / 220) * 0.8 : 0}
          />
        );
      })}
      <text
        x="0"
        y="60"
        textAnchor="middle"
        fontSize="24"
        fill="#fff"
        fontFamily="Inter, Arial, sans-serif"
      >
        Kafe_Free_WiFi
      </text>
    </g>
  );
}

function Packet({
  x,
  y,
  locked,
  label,
}: {
  x: number;
  y: number;
  locked: boolean;
  label: string;
}) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect
        x="-90"
        y="-34"
        width="180"
        height="68"
        rx="14"
        fill={locked ? "#2fbf8f" : "#ffb829"}
        stroke="#fff"
        strokeWidth="3"
      />
      <text
        x="0"
        y="10"
        textAnchor="middle"
        fontFamily="Cascadia Code, Consolas, monospace"
        fontSize="26"
        fontWeight="700"
        fill="#1b1b1f"
      >
        {locked ? "TLS ▓▓▓▓" : label}
      </text>
    </g>
  );
}

const PASSWORD = "Qwerty-2026";
const GARBLE = "x9#Kq2!vR7@pZ4&mW8$tL1";

/**
 * The café story. intro: Ali logs in, happily. attack: the password flies
 * through the router and lands on Jasur's screen. secure: the same with
 * HTTPS — Jasur gets only noise.
 */
export function CafeScene({
  mode,
  p,
}: {
  mode: "intro" | "attack" | "secure";
  p: number;
}) {
  const typed = mode === "intro" ? seg(p, 0.2, 0.8) : seg(p, 0, 0.25);
  const chars = Math.round(typed * PASSWORD.length);
  const toRouter = seg(p, 0.28, 0.45);
  const toJasur = seg(p, 0.5, 0.7);
  const caught = mode !== "intro" && p > 0.7;
  const secure = mode === "secure";
  const showJasur = mode !== "intro" || p > 0.85;
  let px = lerp(400, 800, ease(toRouter));
  let py = lerp(560, 470, ease(toRouter)) - Math.sin(toRouter * Math.PI) * 120;
  if (toJasur > 0) {
    px = lerp(800, 1200, ease(toJasur));
    py = lerp(470, 560, ease(toJasur)) - Math.sin(toJasur * Math.PI) * 120;
  }
  const flying = mode !== "intro" && toRouter > 0 && toJasur < 1;
  return (
    <Cafe>
      <Router wave={mode !== "intro" && p > 0.45 && p < 0.75 ? p : 0} />
      {/* Ali */}
      <rect x="230" y="640" width="340" height="24" rx="8" fill="#6b4a33" />
      <Person
        x={400}
        y={300}
        hood="#3b8be0"
        name="Ali"
        typing={typed}
        face={caught && !secure ? "calm" : "smile"}
      />
      <Laptop x={400} y={630}>
        <text
          x="0"
          y="-104"
          textAnchor="middle"
          fontSize="18"
          fill="#9cc3ee"
          fontFamily="Inter, Arial, sans-serif"
        >
          {secure ? "https://bank.uz" : "http://bank.uz"}
        </text>
        <rect x="-90" y="-84" width="180" height="30" rx="6" fill="#1f2937" />
        <text
          x="-80"
          y="-63"
          fontSize="18"
          fill="#fff"
          fontFamily="Inter, Arial, sans-serif"
        >
          ali
        </text>
        <rect x="-90" y="-46" width="180" height="30" rx="6" fill="#1f2937" />
        <text
          x="-80"
          y="-25"
          fontSize="20"
          fill="#fff"
          fontFamily="Inter, Arial, sans-serif"
        >
          {"•".repeat(chars)}
        </text>
      </Laptop>
      {/* Jasur */}
      {showJasur && (
        <g opacity={mode === "intro" ? seg(p, 0.85, 1) : 1}>
          <rect
            x="1030"
            y="640"
            width="340"
            height="24"
            rx="8"
            fill="#6b4a33"
          />
          <Person
            x={1200}
            y={300}
            hood="#2b2b33"
            skin="#c98d55"
            cap
            name="Jasur"
            face={caught ? (secure ? "confused" : "grin") : "calm"}
          />
          <Laptop
            x={1200}
            y={630}
            glow={caught ? (secure ? "#9cc3ee" : "#ff4d4d") : "#555"}
          >
            <text
              x="-96"
              y="-110"
              fontSize="16"
              fill="#2fbf8f"
              fontFamily="Cascadia Code, Consolas, monospace"
            >
              $ sniff wlan0
            </text>
            {caught &&
              (secure ? (
                <text
                  x="-96"
                  y="-70"
                  fontSize="18"
                  fill="#9cc3ee"
                  fontFamily="Cascadia Code, Consolas, monospace"
                >
                  {GARBLE}
                </text>
              ) : (
                <>
                  <text
                    x="-96"
                    y="-80"
                    fontSize="18"
                    fill="#ff8b8b"
                    fontFamily="Cascadia Code, Consolas, monospace"
                  >
                    user=ali
                  </text>
                  <text
                    x="-96"
                    y="-50"
                    fontSize="18"
                    fill="#ff8b8b"
                    fontFamily="Cascadia Code, Consolas, monospace"
                  >
                    pass={PASSWORD}
                  </text>
                </>
              ))}
          </Laptop>
          {caught && (
            <g transform="translate(1290 330)" opacity={seg(p, 0.72, 0.8)}>
              <rect
                x="-10"
                y="-50"
                width="190"
                height="70"
                rx="18"
                fill="#fff"
              />
              <text
                x="85"
                y="-5"
                textAnchor="middle"
                fontSize="30"
                fontWeight="800"
                fill={secure ? "#3b8be0" : "#d22"}
                fontFamily="Inter, Arial, sans-serif"
              >
                {secure ? "???" : "Topildi!"}
              </text>
            </g>
          )}
        </g>
      )}
      {flying && <Packet x={px} y={py} locked={secure} label="pass=…" />}
      {caught && !secure && (
        <rect
          width="1600"
          height="900"
          fill="#ff0000"
          opacity={0.12 * Math.abs(Math.sin(p * 40))}
        />
      )}
    </Cafe>
  );
}

const HOPS = ["Ali", "Wi-Fi", "Provayder", "Internet", "bank.uz"];
/** A postcard passed hand to hand; everyone on the way reads it. */
export function PostcardScene({ p }: { p: number }) {
  const at = seg(p, 0.1, 0.85) * (HOPS.length - 1);
  const x = lerp(140, 1460, at / (HOPS.length - 1));
  return (
    <svg viewBox="0 0 1600 900" className="vl-story" aria-hidden="true">
      <rect width="1600" height="900" fill="#101a2c" />
      <line
        x1="140"
        y1="560"
        x2="1460"
        y2="560"
        stroke="#3b8be0"
        strokeWidth="6"
        strokeDasharray="18 14"
      />
      {HOPS.map((hop, i) => {
        const hx = lerp(140, 1460, i / (HOPS.length - 1));
        const read = i > 0 && i < HOPS.length - 1 && at >= i;
        return (
          <g key={hop} transform={`translate(${hx} 560)`}>
            <circle r="56" fill="#132e4d" stroke="#9cc3ee" strokeWidth="4" />
            <text
              y="110"
              textAnchor="middle"
              fontSize="34"
              fill="#fff"
              fontFamily="Inter, Arial, sans-serif"
            >
              {hop}
            </text>
            {read && (
              <g transform="translate(0 -120)">
                <ellipse rx="44" ry="26" fill="#fff" />
                <circle r="16" fill="#1b1b1f" />
                <text
                  y="-44"
                  textAnchor="middle"
                  fontSize="26"
                  fill="#ff8b8b"
                  fontFamily="Inter, Arial, sans-serif"
                >
                  o‘qidi!
                </text>
              </g>
            )}
          </g>
        );
      })}
      <g transform={`translate(${x} 340) rotate(${Math.sin(p * 20) * 4})`}>
        <rect
          x="-150"
          y="-90"
          width="300"
          height="180"
          rx="12"
          fill="#f4f1ea"
          stroke="#c9b48a"
          strokeWidth="4"
        />
        <rect x="80" y="-74" width="52" height="60" fill="#ff8b8b" />
        <text
          x="-130"
          y="-30"
          fontSize="26"
          fill="#1b1b1f"
          fontFamily="Inter, Arial, sans-serif"
        >
          HTTP otkritka
        </text>
        <text
          x="-130"
          y="20"
          fontSize="26"
          fill="#d22"
          fontFamily="Cascadia Code, Consolas, monospace"
        >
          user=ali
        </text>
        <text
          x="-130"
          y="56"
          fontSize="26"
          fill="#d22"
          fontFamily="Cascadia Code, Consolas, monospace"
        >
          pass={PASSWORD}
        </text>
      </g>
    </svg>
  );
}

/**
 * A question in the middle of the lesson. `chosen` is the viewer's answer
 * (null until they pick); in the MP4 the right one is revealed near the end.
 */
export function QuizScene({
  question,
  options,
  answer,
  p,
  chosen,
  onChoose,
  countdown,
}: {
  question: string;
  options: string[];
  answer: number;
  p: number;
  chosen: number | null;
  onChoose?: (i: number) => void;
  countdown: number | null;
}) {
  const reveal = chosen !== null;
  return (
    <div className="vl-quiz">
      <span className="vl-quiz-badge">SAVOL</span>
      <h3>{question}</h3>
      <div className="vl-quiz-options">
        {options.map((o, i) => {
          const state = !reveal
            ? ""
            : i === answer
              ? " right"
              : i === chosen
                ? " wrong"
                : " dim";
          return (
            <button
              key={o}
              type="button"
              className={`vl-quiz-option${state}`}
              disabled={reveal || !onChoose}
              onClick={(e) => {
                e.stopPropagation();
                onChoose?.(i);
              }}
              style={{ opacity: ease(seg(p, 0.08 + i * 0.08, 0.2 + i * 0.08)) }}
            >
              <span>{String.fromCharCode(65 + i)}</span>
              {o}
            </button>
          );
        })}
      </div>
      <p className="vl-quiz-foot" aria-live="polite">
        {reveal
          ? chosen === answer
            ? "To‘g‘ri! +10 XP"
            : "Afsus, to‘g‘ri javob yashil bilan belgilangan"
          : countdown !== null
            ? `Javobni tanlang… ${countdown}`
            : ""}
      </p>
    </div>
  );
}

/** Kibi in the middle of the stage, introducing the lesson. */
export function HostScene({
  title,
  subtitle,
  p,
  t,
  talk,
  mood,
}: {
  title: string;
  subtitle: string;
  p: number;
  t: number;
  talk: number;
  mood: Mood;
}) {
  return (
    <div className="vl-host">
      <Kibi className="vl-host-kibi" mood={mood} talk={talk} t={t} />
      <div style={{ opacity: ease(seg(p, 0.1, 0.3)) }}>
        <span className="vl-brand">CYBERVALUE · AKADEMIYA</span>
        <h2 className="vl-title">{title}</h2>
        <p className="vl-subtitle">{subtitle}</p>
      </div>
    </div>
  );
}
