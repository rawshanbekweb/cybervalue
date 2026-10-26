// Kibi, the Cybervalue helper robot who hosts the video lessons. Drawn as
// SVG from a few numbers so every frame is reproducible: `mood` sets the
// face, `talk` (0…1) opens the mouth, `t` (seconds) drives blinking and a
// gentle bob.

import type { Mood } from "@/lib/video-lessons/types";

export type { Mood };

export function Kibi({
  mood = "talk",
  talk = 0,
  t = 0,
  className,
}: {
  mood?: Mood;
  talk?: number;
  t?: number;
  className?: string;
}) {
  const bob = Math.sin(t * 2.2) * 4;
  // A blink of about 0.15 s every four seconds.
  const blink = t % 4 > 3.85 ? 0.15 : 1;
  const eyeH = (mood === "shock" ? 22 : mood === "happy" ? 6 : 16) * blink;
  const mouthOpen = Math.max(0, Math.min(1, talk));
  const light = 0.55 + 0.45 * Math.sin(t * 5);
  return (
    <svg viewBox="0 0 220 260" className={className} aria-hidden="true">
      <g transform={`translate(0 ${bob})`}>
        {/* antenna */}
        <line
          x1="110"
          y1="22"
          x2="110"
          y2="48"
          stroke="#9cc3ee"
          strokeWidth="5"
        />
        <circle cx="110" cy="18" r="10" fill="#ffb829" opacity={light} />
        <circle cx="110" cy="18" r="16" fill="#ffb829" opacity={light * 0.25} />
        {/* head */}
        <rect x="30" y="46" width="160" height="120" rx="38" fill="#3b8be0" />
        <rect
          x="30"
          y="46"
          width="160"
          height="60"
          rx="38"
          fill="#5aa2ee"
          opacity="0.5"
        />
        <rect x="46" y="62" width="128" height="88" rx="26" fill="#0b1a2b" />
        {/* ears */}
        <rect x="16" y="88" width="16" height="36" rx="7" fill="#2a6fc0" />
        <rect x="188" y="88" width="16" height="36" rx="7" fill="#2a6fc0" />
        {/* eyes */}
        {mood === "happy" ? (
          <g stroke="#7fe3ff" strokeWidth="7" fill="none" strokeLinecap="round">
            <path d="M68 104q12-14 24 0" />
            <path d="M128 104q12-14 24 0" />
          </g>
        ) : mood === "wink" ? (
          <g>
            <rect
              x="70"
              y="92"
              width="20"
              height={eyeH}
              rx="9"
              fill="#7fe3ff"
            />
            <path
              d="M128 102h24"
              stroke="#7fe3ff"
              strokeWidth="7"
              strokeLinecap="round"
            />
          </g>
        ) : (
          <g fill="#7fe3ff">
            <rect x="70" y={100 - eyeH / 2} width="20" height={eyeH} rx="9" />
            <rect x="130" y={100 - eyeH / 2} width="20" height={eyeH} rx="9" />
          </g>
        )}
        {mood === "think" && (
          <path
            d="M126 82l26-6"
            stroke="#7fe3ff"
            strokeWidth="5"
            strokeLinecap="round"
          />
        )}
        {mood === "sad" && (
          <g stroke="#7fe3ff" strokeWidth="5" strokeLinecap="round">
            <path d="M66 84l24 6" />
            <path d="M154 84l-24 6" />
          </g>
        )}
        {/* mouth */}
        {mood === "shock" ? (
          <ellipse
            cx="110"
            cy="132"
            rx="10"
            ry={8 + mouthOpen * 6}
            fill="#7fe3ff"
          />
        ) : mood === "sad" && mouthOpen < 0.1 ? (
          <path
            d="M94 138q16-12 32 0"
            stroke="#7fe3ff"
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
          />
        ) : mouthOpen > 0.08 ? (
          <rect
            x={94 - mouthOpen * 4}
            y={128 - mouthOpen * 4}
            width={32 + mouthOpen * 8}
            height={6 + mouthOpen * 16}
            rx="7"
            fill="#7fe3ff"
          />
        ) : (
          <path
            d="M92 128q18 14 36 0"
            stroke="#7fe3ff"
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
          />
        )}
        {/* cheeks */}
        <circle cx="62" cy="128" r="7" fill="#ff8fb1" opacity="0.35" />
        <circle cx="158" cy="128" r="7" fill="#ff8fb1" opacity="0.35" />
        {/* body */}
        <rect
          x="58"
          y="172"
          width="104"
          height="72"
          rx="26"
          fill="#132e4d"
          stroke="#3b8be0"
          strokeWidth="4"
        />
        <path
          d="M110 186l22 11v20l-22 22-22-22v-20z"
          fill="#0b1a2b"
          stroke="#9cc3ee"
          strokeWidth="3"
        />
        <text
          x="110"
          y="218"
          textAnchor="middle"
          fontFamily="Inter, Arial, sans-serif"
          fontWeight="800"
          fontSize="18"
          fill="#eaf2fb"
        >
          CV
        </text>
        {/* arms */}
        <rect
          x="30"
          y="182"
          width="22"
          height="50"
          rx="11"
          fill="#3b8be0"
          transform={`rotate(${mood === "happy" ? 35 : 12 + Math.sin(t * 2) * 4} 41 186)`}
        />
        <rect
          x="168"
          y="182"
          width="22"
          height="50"
          rx="11"
          fill="#3b8be0"
          transform={`rotate(${mood === "think" ? -150 : mood === "happy" ? -35 : -12 - Math.sin(t * 2) * 4} 179 186)`}
        />
      </g>
    </svg>
  );
}
