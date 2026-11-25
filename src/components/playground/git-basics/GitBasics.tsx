"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, GitBranch } from "lucide-react";
import { videoHref } from "@/lib/video-lessons";
import { useT } from "../network-lab/use-t";
import {
  AnimLab,
  CommonWidgetView,
  type WidgetProps,
} from "../anim-lab/AnimLab";
import {
  LESSONS,
  PROGRESS_KEY,
  type Entry,
  type Goal,
  type Log,
  type Widget,
} from "@/lib/git-basics/curriculum";
import {
  ancestors,
  fileStatus,
  run,
  type Commit,
  type State,
} from "@/lib/git-basics/sim";
import "../bash-basics/bash-basics.css";
import "./git-basics.css";

// Academy · Git & GitHub: commits, branches, merges and pull requests,
// typed into a pretend terminal that runs a small Git in the browser.
export function GitBasics() {
  const { t } = useT();
  return (
    <AnimLab
      lessons={LESSONS}
      progressKey={PROGRESS_KEY}
      checkpoints={["git-1"]}
      video={videoHref("git")}
      eyebrow={t("DEVELOPER TOOLS · ANIMATED")}
      title={t("Git and GitHub.")}
      subtitle={t("Version control from the first commit to a pull request.")}
      description={t(
        "Save your work as commits, experiment safely on branches, resolve a merge conflict, push to GitHub, work with a team and keep secrets out of history — in a Git that runs right in the browser.",
      )}
      badge={t("GIT / GITHUB")}
      icon={<GitBranch size={22} />}
      renderWidget={(widget: Widget, props) =>
        widget.type === "git" ? (
          <GitWidget widget={widget} {...props} />
        ) : (
          <CommonWidgetView widget={widget} {...props} />
        )
      }
    />
  );
}

function Goals({ goals, log }: { goals: Goal[]; log: Log }) {
  const { t, text } = useT();
  return (
    <ul className="bb-goals" aria-label={t("Goals")}>
      {goals.map((goal, i) => {
        const met = goal.check(log);
        return (
          <li key={i} className={met ? "met" : ""}>
            <span className="bb-goal-mark" aria-hidden="true">
              {met ? <Check size={13} /> : i + 1}
            </span>
            {text(goal.label)}
            <span className="visually-hidden">
              {met ? t("done") : t("not yet")}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

/** Colours a line of Git output the way a real terminal would. */
function tone(line: string) {
  if (/^\+(?!\+\+)/.test(line)) return "gb-add";
  if (/^-(?!--)/.test(line)) return "gb-del";
  if (/^(<{7}|={7}|>{7})/.test(line)) return "gb-marker";
  if (/^\t(new file|modified|deleted|both modified):/.test(line))
    return line.includes("both") ? "gb-del" : "gb-staged";
  if (/^\t\S/.test(line)) return "gb-del";
  if (/^(commit [0-9a-f]{7}|[0-9a-f]{7} )/.test(line)) return "gb-hash";
  if (/^(CONFLICT|error|fatal|hint| ! \[rejected\])/.test(line))
    return "gb-warn";
  return "";
}

function promptFor(state: State) {
  const branch = state.repo ? ` (${state.repo.head})` : "";
  return `~/loyiha${branch}$`;
}

/** The pretend terminal with the three areas, the graph and GitHub. */
function GitWidget({
  widget,
  onSolved,
}: { widget: Extract<Widget, { type: "git" }> } & WidgetProps) {
  const { t } = useT();
  const [log, setLog] = useState<Log>({ state: widget.start, entries: [] });
  const [line, setLine] = useState("");
  const [recall, setRecall] = useState(-1);
  const screen = useRef<HTMLDivElement>(null);
  useEffect(() => {
    screen.current?.scrollTo({ top: screen.current.scrollHeight });
  }, [log]);
  const submit = () => {
    const command = line.trim();
    if (!command) return;
    if (command === "clear") {
      setLog({ ...log, entries: [] });
      setLine("");
      return;
    }
    const result = run(command, log.state);
    const entry: Entry = {
      command,
      output: result.output,
      error: result.error,
    };
    const next = { state: result.state, entries: [...log.entries, entry] };
    setLog(next);
    setLine("");
    setRecall(-1);
    if (widget.goals.every((g) => g.check(next))) onSolved(true);
  };
  const commands = log.entries.map((e) => e.command);
  const prompt = promptFor(log.state);
  return (
    <div className="nl-card bb-shell gb-lab">
      <div
        className="bb-screen gb-screen"
        ref={screen}
        tabIndex={0}
        aria-label={t("Terminal output")}
        aria-live="polite"
      >
        {log.entries.length === 0 && (
          <p className="bb-dim">
            {t("Type a command and press Enter. Try: git status")}
          </p>
        )}
        {log.entries.map((entry, i) => (
          <div key={i} className="bb-entry al-appear">
            <div>
              <span className="bb-prompt">$</span> {entry.command}
            </div>
            {entry.output.map((out, j) => (
              <div key={j} className={tone(out)}>
                {out || " "}
              </div>
            ))}
            {entry.error && <div className="bb-error">{entry.error}</div>}
          </div>
        ))}
      </div>
      <form
        className="bb-input"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <label htmlFor="gb-line" className="bb-prompt gb-prompt">
          {prompt}
        </label>
        <input
          id="gb-line"
          value={line}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          autoComplete="off"
          maxLength={400}
          onChange={(e) => setLine(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "ArrowUp" && commands.length) {
              e.preventDefault();
              const at =
                recall < 0 ? commands.length - 1 : Math.max(0, recall - 1);
              setRecall(at);
              setLine(commands[at]);
            }
          }}
        />
        <button type="submit" className="nl-primary">
          {t("Run")}
        </button>
      </form>
      <div className="gb-tips" aria-label={t("Commands to try")}>
        {widget.tips.map((tip) => (
          <button
            key={tip}
            type="button"
            className="gb-tip"
            onClick={() => setLine(tip)}
          >
            {tip}
          </button>
        ))}
      </div>
      <Areas state={log.state} />
      <Graph state={log.state} />
      <GitHubPanel state={log.state} />
      <Goals goals={widget.goals} log={log} />
    </div>
  );
}

/** Working folder, staging area and the last commit, side by side. */
function Areas({ state }: { state: State }) {
  const { t } = useT();
  if (!state.repo)
    return (
      <div className="gb-areas gb-norepo">
        <span className="gb-area-title">{t("Working folder")}</span>
        <div className="gb-files">
          {Object.keys(state.files)
            .sort()
            .map((f) => (
              <span key={f} className="gb-file">
                {f}
              </span>
            ))}
        </div>
        <p className="al-muted">
          {t("This folder is not a repository yet. Run git init.")}
        </p>
      </div>
    );
  const repo = state.repo;
  const status = fileStatus(state);
  const headId = repo.branches[repo.head];
  const headCommit = headId ? repo.commits[headId] : null;
  const changed = new Set([
    ...status.unstaged.map((s) => s.path),
    ...status.untracked,
  ]);
  return (
    <div className="gb-areas" aria-label={t("The three areas")}>
      <section>
        <span className="gb-area-title">1 · {t("Working folder")}</span>
        <div className="gb-files">
          {Object.keys(state.files)
            .sort()
            .map((f) => (
              <span
                key={f}
                className={`gb-file${status.untracked.includes(f) ? " is-new" : changed.has(f) ? " is-changed" : ""}${f === ".env" ? " is-secret" : ""}`}
                title={
                  status.untracked.includes(f)
                    ? t("untracked")
                    : changed.has(f)
                      ? t("modified")
                      : t("unchanged")
                }
              >
                {f}
              </span>
            ))}
        </div>
      </section>
      <span className="gb-arrow" aria-hidden="true">
        git add →
      </span>
      <section>
        <span className="gb-area-title">2 · {t("Staging area")}</span>
        <div className="gb-files">
          {status.staged.length === 0 ? (
            <span className="al-muted">{t("empty")}</span>
          ) : (
            status.staged.map((s) => (
              <span key={s.path} className="gb-file is-staged">
                {s.path}
              </span>
            ))
          )}
        </div>
      </section>
      <span className="gb-arrow" aria-hidden="true">
        git commit →
      </span>
      <section>
        <span className="gb-area-title">3 · {t("Repository")}</span>
        {headCommit ? (
          <div className="gb-files">
            <span className="gb-commit-chip">
              <b>{headCommit.id}</b> {headCommit.message}
            </span>
          </div>
        ) : (
          <span className="al-muted">{t("No commits yet")}</span>
        )}
      </section>
    </div>
  );
}

// Lane names sit in a left gutter; commits are spaced so labels fit.
const GUTTER = 96;
const STEP = 100;
const TOP = 58;
const LANE = 62;

const LANE_COLORS = [
  "#8052ff",
  "#2fbf8f",
  "#ffb829",
  "#4cc9f0",
  "#ff6b6b",
  "#c77dff",
];

/** The commit graph: one lane per branch, newest on the right. */
function Graph({ state }: { state: State }) {
  const { t } = useT();
  const repo = state.repo;
  const scroller = useRef<HTMLDivElement>(null);
  // Keep the newest commit (and HEAD) in view as the graph grows.
  useEffect(() => {
    const el = scroller.current;
    if (el) el.scrollLeft = el.scrollWidth;
  }, [state]);
  const layout = useMemo(() => {
    if (!repo) return null;
    const all = Object.values(repo.commits).sort((a, b) => a.n - b.n);
    // Only commits some branch (or origin/…) can reach.
    const tips = [
      ...Object.values(repo.branches),
      ...Object.values(state.tracking),
    ];
    const reach = new Set<string>();
    for (const tip of tips)
      for (const id of ancestors(repo.commits, tip)) reach.add(id);
    const shown = all.filter((c) => reach.has(c.id)).slice(-12);
    const lanes: string[] = ["main"];
    for (const c of shown) if (!lanes.includes(c.lane)) lanes.push(c.lane);
    const x = new Map<string, number>();
    shown.forEach((c, i) => x.set(c.id, GUTTER + i * STEP));
    return { shown, lanes, x };
  }, [repo, state.tracking]);
  if (!repo || !layout || layout.shown.length === 0)
    return (
      <div className="gb-graph gb-graph-empty">
        <span className="gb-area-title">{t("Commit graph")}</span>
        <p className="al-muted">{t("Commits will appear here.")}</p>
      </div>
    );
  const { shown, lanes, x } = layout;
  const laneOf = (c: Commit) => lanes.indexOf(c.lane);
  const y = (c: Commit) => TOP + laneOf(c) * LANE;
  const width = Math.max(320, GUTTER + shown.length * STEP + 40);
  const height = TOP + (lanes.length - 1) * LANE + 34;
  const byId = new Map(shown.map((c) => [c.id, c]));
  const labels = new Map<string, string[]>();
  for (const [b, id] of Object.entries(repo.branches))
    labels.set(id, [
      ...(labels.get(id) ?? []),
      b === repo.head ? `HEAD → ${b}` : b,
    ]);
  for (const [b, id] of Object.entries(state.tracking))
    labels.set(id, [...(labels.get(id) ?? []), `origin/${b}`]);
  return (
    <div className="gb-graph">
      <span className="gb-area-title">{t("Commit graph")}</span>
      <div className="gb-graph-scroll" tabIndex={0} ref={scroller}>
        <svg
          width={width}
          height={height}
          role="img"
          aria-label={shown
            .map((c) => `${c.id} ${c.message} (${c.lane})`)
            .join(", ")}
        >
          {lanes.map((lane, i) => (
            <text
              key={lane}
              x={4}
              y={TOP + i * LANE + 4}
              className="gb-lane-name"
              fill={LANE_COLORS[i % LANE_COLORS.length]}
            >
              {lane}
            </text>
          ))}
          {shown.flatMap((c) =>
            c.parents
              .map((p) => byId.get(p))
              .filter((p): p is Commit => Boolean(p))
              .map((p) => {
                const x1 = x.get(p.id)!;
                const y1 = y(p);
                const x2 = x.get(c.id)!;
                const y2 = y(c);
                const mid = (x1 + x2) / 2;
                return (
                  <path
                    key={`${p.id}-${c.id}`}
                    className="gb-edge"
                    pathLength={1}
                    d={`M${x1},${y1} C${mid},${y1} ${mid},${y2} ${x2},${y2}`}
                    stroke={
                      LANE_COLORS[
                        laneOf(y1 === y2 ? c : y2 > y1 ? c : p) %
                          LANE_COLORS.length
                      ]
                    }
                  />
                );
              }),
          )}
          {shown.map((c) => {
            const isHead = repo.branches[repo.head] === c.id;
            const tags = labels.get(c.id) ?? [];
            return (
              <g key={c.id} transform={`translate(${x.get(c.id)},${y(c)})`}>
                <g className="gb-node">
                  <title>{`${c.id} — ${c.message} (${c.author})`}</title>
                  <circle
                    r={isHead ? 11 : 9}
                    fill={LANE_COLORS[laneOf(c) % LANE_COLORS.length]}
                    className={isHead ? "gb-head" : undefined}
                  />
                  {c.parents.length > 1 && <circle r={4} fill="#0b0b10" />}
                  <text y={26} textAnchor="middle" className="gb-hash-text">
                    {c.id.slice(0, 5)}
                  </text>
                  {tags.map((tag, i) => (
                    <text
                      key={tag}
                      y={-18 - i * 14}
                      textAnchor="middle"
                      className={`gb-tag${tag.startsWith("origin/") ? " is-remote" : tag.startsWith("HEAD") ? " is-head" : ""}`}
                    >
                      {tag}
                    </text>
                  ))}
                </g>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

/** What is on "GitHub": the origin repository and how far apart we are. */
function GitHubPanel({ state }: { state: State }) {
  const { t } = useT();
  const remote = state.origin ?? Object.values(state.github)[0];
  if (!remote) return null;
  const repo = state.repo;
  const local = repo?.branches[repo.head];
  const theirs = repo ? remote.branches[repo.head] : undefined;
  let ahead = 0;
  let behind = 0;
  if (repo && local) {
    const mine = ancestors(repo.commits, local);
    const all = { ...repo.commits, ...remote.commits };
    const up = theirs ? ancestors(all, theirs) : new Set<string>();
    ahead = [...mine].filter((c) => !up.has(c)).length;
    behind = [...up].filter((c) => !mine.has(c)).length;
  }
  const count = Object.keys(remote.commits).length;
  return (
    <div className="gb-github" aria-label="GitHub">
      <span className="gb-area-title">GitHub</span>
      <code className="gb-url">{remote.url}</code>
      <span className="gb-gh-stats">
        {count === 0
          ? t("Empty repository")
          : t("{count} commits · branches: {branches}", {
              count,
              branches: Object.keys(remote.branches).join(", "),
            })}
      </span>
      {state.origin && repo && local && (
        <span className={`gb-sync${ahead || behind ? " is-off" : " is-ok"}`}>
          {ahead === 0 && behind === 0
            ? t("In sync with GitHub")
            : [
                ahead ? t("{count} to push ↑", { count: ahead }) : "",
                behind ? t("{count} to pull ↓", { count: behind }) : "",
              ]
                .filter(Boolean)
                .join(" · ")}
        </span>
      )}
      {!state.origin && (
        <span className="al-muted">
          {t("Not connected yet (git remote add / git clone)")}
        </span>
      )}
    </div>
  );
}
