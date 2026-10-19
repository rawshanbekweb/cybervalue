"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useActionState, useId } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  Bot,
  CalendarCheck,
  CalendarDays,
  Code2,
  Crown,
  Flame,
  GitBranch,
  KeyRound,
  Lock,
  LogOut,
  Rocket,
  ShieldCheck,
  Sparkles,
  Terminal,
  Trophy,
  Unlock,
  Worm,
} from "lucide-react";
import { useT } from "../playground/network-lab/use-t";
import {
  GAME_IDS,
  gameOpen,
  GAMES,
  missionKey,
  type GameId,
} from "@/lib/kids/games";
import type { Text } from "@/lib/kids/lang";
import { DAILY_XP, type BadgeId, type DailyTask } from "@/lib/kids/extras";
import { CERTIFICATE_XP, kidsLevel, LEVELS } from "@/lib/kids/progress";
import { kidsLoginAction, kidsLogoutAction } from "@/app/[lang]/kids/actions";
import "./kids.css";

const ICONS: Record<GameId, typeof Rocket> = {
  kosmos: Rocket,
  robot: Bot,
  ilon: Worm,
  qorovul: ShieldCheck,
};

const BADGE_ICONS: Record<string, typeof Rocket> = {
  first: Sparkles,
  rules: GitBranch,
  developer: Unlock,
  passwords: KeyRound,
  terminal: Terminal,
  record: Trophy,
  streak3: Flame,
  streak7: CalendarCheck,
};

const STEPS = [
  {
    icon: Code2,
    uz: "O‘yin kodini ko‘rasiz: tezlik, hayotlar, ranglar…",
    en: "You see the game's code: speed, lives, colours…",
  },
  {
    icon: Sparkles,
    uz: "Bitta sonni o‘zgartirasiz va o‘yin darhol o‘zgaradi",
    en: "You change one number and the game changes at once",
  },
  {
    icon: Terminal,
    uz: "Maxfiy terminalda chit-kodlarni topasiz",
    en: "You find cheat codes in the secret terminal",
  },
  {
    icon: Trophy,
    uz: "Topshiriqlarni bajarib, xaker darajalariga ko‘tarilasiz",
    en: "You finish missions and climb the hacker levels",
  },
];

// The front door: children enter with the code their teacher gave them.
export function KidsLogin() {
  const { t, text } = useT();
  const id = useId();
  const pathname = usePathname();
  const [state, action, pending] = useActionState(kidsLoginAction, undefined);
  return (
    <div className="kids container">
      <Link className="kids-back" href="/">
        <ArrowLeft size={16} aria-hidden="true" /> {t("Home")}
      </Link>
      <section className="kids-hero">
        <div>
          <p className="kids-eyebrow">Academy Kids · 7–10</p>
          <h1>
            {t("Become a game hacker.")}{" "}
            <span>{t("Change the code and the game obeys you.")}</span>
          </h1>
          <ul className="kids-steps">
            {STEPS.map(({ icon: Icon, ...step }) => (
              <li key={step.en}>
                <Icon size={20} aria-hidden="true" />
                {text(step)}
              </li>
            ))}
          </ul>
        </div>
        <form action={action} className="kids-login" aria-labelledby={id}>
          <h2 id={id}>{t("Enter your code")}</h2>
          <p>
            {t("Your teacher gives you the code. It has 8 letters and digits.")}
          </p>
          <input type="hidden" name="next" value={pathname} />
          <label htmlFor={`${id}-code`} className="visually-hidden">
            {t("Access code")}
          </label>
          <input
            id={`${id}-code`}
            name="code"
            required
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            placeholder="XXXX-XXXX"
            maxLength={12}
          />
          {state?.error && (
            <p role="alert" className="kids-error">
              {t(state.error)}
            </p>
          )}
          <button type="submit" className="kids-button" disabled={pending}>
            {t("Let's play")} <ArrowRight size={18} aria-hidden="true" />
          </button>
        </form>
      </section>
      <section className="kids-games" aria-label={t("Games")}>
        {GAME_IDS.map((gameId) => {
          const Icon = ICONS[gameId];
          return (
            <article key={gameId} className={`kids-game-card kids-${gameId}`}>
              <Icon size={34} aria-hidden="true" />
              <h2>{text(GAMES[gameId].title)}</h2>
              <p>{text(GAMES[gameId].tagline)}</p>
              <p className="kids-muted">
                {t("{count} missions", {
                  count: GAMES[gameId].missions.length,
                })}
              </p>
            </article>
          );
        })}
      </section>
    </div>
  );
}

// The signed-in start page: level, both games and how far the child got.
export function KidsHub({
  name,
  xp,
  done,
  best,
  group,
  ranking,
  daily,
  badges,
}: {
  name: string;
  xp: number;
  done: string[];
  best: Record<GameId, number>;
  group: string;
  daily: { task: DailyTask; done: boolean; streak: number };
  badges: { id: BadgeId; title: Text; about: Text; earned: boolean }[];
  ranking: { name: string; xp: number; me: boolean }[];
}) {
  const { t, text } = useT();
  const level = kidsLevel(xp);
  const span = level.next ? level.next.xp - level.level.xp : 1;
  const into = level.next ? xp - level.level.xp : 1;
  return (
    <div className="kids container">
      <div className="kids-lab-top">
        <p className="kids-eyebrow">Academy Kids</p>
        <form action={kidsLogoutAction}>
          <button type="submit" className="kids-link">
            <LogOut size={16} aria-hidden="true" /> {t("Log out")}
          </button>
        </form>
      </div>
      <section className="kids-player">
        <div>
          <h1>{t("Hi, {name}!", { name })}</h1>
          <p>
            {t("Your level:")} <strong>{text(level.level.title)}</strong> · {xp}{" "}
            XP
          </p>
        </div>
        <div className="kids-level">
          <div
            className="kids-meter"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={span}
            aria-valuenow={into}
            aria-label={t("Progress to the next level")}
          >
            <span style={{ width: `${Math.round((into / span) * 100)}%` }} />
          </div>
          <p className="kids-muted">
            {level.next
              ? t("{xp} XP to “{title}”", {
                  xp: level.next.xp - xp,
                  title: text(level.next.title),
                })
              : t("The highest level. Legendary!")}
          </p>
        </div>
        <ol className="kids-ladder" aria-label={t("Hacker levels")}>
          {LEVELS.map((step, i) => (
            <li key={step.xp} className={i <= level.index ? "reached" : ""}>
              {text(step.title)}
            </li>
          ))}
        </ol>
      </section>
      <section
        className={`kids-daily ${daily.done ? "done" : ""}`}
        aria-labelledby="kids-daily"
      >
        <CalendarDays size={28} aria-hidden="true" />
        <div>
          <h2 id="kids-daily">{t("Task of the day")}</h2>
          <p>
            {daily.done
              ? t("Done for today! Come back tomorrow for a new task.")
              : text(daily.task.title)}
          </p>
          <p className="kids-muted">
            <Flame size={16} aria-hidden="true" />{" "}
            {t("Streak: {days} days", { days: daily.streak })} · +{DAILY_XP} XP
          </p>
        </div>
        {!daily.done && (
          <Link className="kids-button" href={`/kids/${daily.task.game}`}>
            {t("Do it")} <ArrowRight size={18} aria-hidden="true" />
          </Link>
        )}
      </section>
      <section className="kids-games" aria-label={t("Games")}>
        {GAME_IDS.map((gameId) => {
          const game = GAMES[gameId];
          const Icon = ICONS[gameId];
          const finished = game.missions.filter((m) =>
            done.includes(missionKey(gameId, m.id)),
          ).length;
          if (!gameOpen(game, new Set(done)))
            return (
              <div key={gameId} className="kids-game-card kids-locked">
                <Lock size={34} aria-hidden="true" />
                <h2>{text(game.title)}</h2>
                <p>{text(game.tagline)}</p>
                <p className="kids-muted">
                  {t("Opens when you finish the settings stage of “{game}”.", {
                    game: text(GAMES[game.after!].title),
                  })}
                </p>
              </div>
            );
          return (
            <Link
              key={gameId}
              href={`/kids/${gameId}`}
              className={`kids-game-card kids-${gameId}`}
            >
              <Icon size={34} aria-hidden="true" />
              <h2>{text(game.title)}</h2>
              <p>{text(game.tagline)}</p>
              <div className="kids-meter" aria-hidden="true">
                <span
                  style={{
                    width: `${Math.round((finished / game.missions.length) * 100)}%`,
                  }}
                />
              </div>
              <p className="kids-muted">
                {t("{done} of {total} missions", {
                  done: finished,
                  total: game.missions.length,
                })}
                {best[gameId] > 0 &&
                  ` · ${t("best score {score}", { score: best[gameId] })}`}
              </p>
              <span className="kids-button">
                {finished ? t("Continue") : t("Start")}{" "}
                <ArrowRight size={18} aria-hidden="true" />
              </span>
            </Link>
          );
        })}
      </section>
      <section className="kids-badges" aria-labelledby="kids-badges">
        <h2 id="kids-badges">
          <Award size={20} aria-hidden="true" /> {t("Badges")}{" "}
          <span className="kids-muted">
            {t("{done} of {total}", {
              done: badges.filter((b) => b.earned).length,
              total: badges.length,
            })}
          </span>
        </h2>
        <ul>
          {badges.map((b) => {
            const Icon = b.id.startsWith("master:")
              ? Crown
              : (BADGE_ICONS[b.id] ?? Award);
            return (
              <li key={b.id} className={b.earned ? "earned" : ""}>
                <span className="kids-badge-icon" aria-hidden="true">
                  {b.earned ? <Icon size={22} /> : <Lock size={18} />}
                </span>
                <span className="kids-badge-text">
                  <strong>{text(b.title)}</strong>
                  <span className="kids-muted">{text(b.about)}</span>
                </span>
                <span className="visually-hidden">
                  {b.earned ? t("Earned") : t("Not earned yet")}
                </span>
              </li>
            );
          })}
        </ul>
      </section>
      <div className="kids-extras">
        {ranking.length > 0 && (
          <section className="kids-ranking" aria-labelledby="kids-ranking">
            <h2 id="kids-ranking">
              <Trophy size={20} aria-hidden="true" />{" "}
              {t("Top hackers of group {group}", { group })}
            </h2>
            <ol>
              {ranking.map((row, i) => (
                <li key={i} className={row.me ? "me" : ""}>
                  <span className="kids-ranking-place">{i + 1}</span>
                  <span>
                    {row.name}
                    {row.me && ` (${t("you")})`}
                  </span>
                  <span className="kids-mission-xp">{row.xp} XP</span>
                </li>
              ))}
            </ol>
          </section>
        )}
        <section className="kids-cert-card" aria-labelledby="kids-cert">
          <h2 id="kids-cert">
            <Award size={20} aria-hidden="true" /> {t("Certificate")}
          </h2>
          {xp >= CERTIFICATE_XP ? (
            <>
              <p>{t("You earned the “Game hacker” certificate!")}</p>
              <Link className="kids-button" href="/kids/sertifikat">
                {t("Open my certificate")}
              </Link>
            </>
          ) : (
            <p>
              {t(
                "Reach {xp} XP to earn the “Game hacker” certificate. {left} XP to go!",
                { xp: CERTIFICATE_XP, left: CERTIFICATE_XP - xp },
              )}
            </p>
          )}
        </section>
      </div>
    </div>
  );
}

// A game that is not open yet, opened by its address.
export function GameLocked({ gameId }: { gameId: GameId }) {
  const { t, text } = useT();
  const game = GAMES[gameId];
  return (
    <div className="kids container">
      <Link className="kids-back" href="/kids">
        <ArrowLeft size={16} aria-hidden="true" /> {t("All games")}
      </Link>
      <section className="kids-cert-card kids-locked-page">
        <Lock size={34} aria-hidden="true" />
        <h1>{text(game.title)}</h1>
        <p>
          {t("Opens when you finish the settings stage of “{game}”.", {
            game: text(GAMES[game.after!].title),
          })}
        </p>
        <Link className="kids-button" href={`/kids/${game.after}`}>
          {text(GAMES[game.after!].title)}{" "}
          <ArrowRight size={18} aria-hidden="true" />
        </Link>
      </section>
    </div>
  );
}
