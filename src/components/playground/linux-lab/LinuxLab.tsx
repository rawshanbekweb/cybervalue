"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  ChevronRight,
  Circle,
  Download,
  FileText,
  Folder,
  Play,
  RotateCcw,
  Search,
  Terminal,
  X,
} from "lucide-react";
import { useLocale } from "@/components/locale-provider";
import { useHashLessonId } from "../useHashLessonId";
import { useLocalStorageState } from "../useLocalStorageState";
import { COMMANDS, complete, execute, HOME } from "@/lib/linux/engine";
import {
  checks,
  COMMAND_NOTES,
  LESSONS,
  type Lesson,
  type Text,
} from "@/lib/linux/curriculum";
import {
  EMPTY_PROGRESS,
  EMPTY_SESSION,
  PROGRESS_KEY,
  restoreProgress,
  restoreSession,
  type Session,
} from "@/lib/linux/storage";
import "./linux-lab.css";

function download(name: string, text: string) {
  const url = URL.createObjectURL(
    new Blob([text], { type: "text/plain;charset=utf-8" }),
  );
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function LinuxLab() {
  const locale = useLocale();
  const t = (uz: string, en: string) => (locale === "uz" ? uz : en);
  const [id, setId] = useHashLessonId(LESSONS.length);
  const [sandbox, setSandbox] = useState(false);
  const [rawProgress, setProgress] = useLocalStorageState<unknown>(
    PROGRESS_KEY,
    EMPTY_PROGRESS,
  );
  const progress = restoreProgress(rawProgress, LESSONS.length);
  const done = Object.keys(progress).length;
  const lesson = LESSONS[id - 1];
  const select = (next: number) => {
    setSandbox(false);
    setId(next);
  };
  return (
    <div className="linux-lab">
      <Link className="lx-back" href="/playground">
        <ArrowLeft size={15} /> {t("Laboratoriyalar", "Playground")}
      </Link>
      <header className="lx-hero">
        <div>
          <span className="eyebrow">
            <span className="status-dot" />{" "}
            {t("AMALIY LINUX KURSI", "HANDS-ON LINUX COURSE")}
          </span>
          <h1>
            {t("Linuxni tushuning.", "Understand Linux.")}
            <br />
            <span>
              {t("Buyruq bilan sinab ko‘ring.", "Try it in the terminal.")}
            </span>
          </h1>
          <p>
            {t(
              "Buyruqni o‘qing, terminalda bajaring, natijasini tushuning. Birinchi katalogdan mustaqil jurnal auditigacha.",
              "Read a command, run it and understand the result. From your first directory to an independent log audit.",
            )}
          </p>
        </div>
        <div className="lx-course-card">
          <div>
            <Terminal size={22} />
            <strong>LINUX / LAB</strong>
            <span className="lx-live">{t("Brauzerda", "In your browser")}</span>
          </div>
          <p>
            {LESSONS.length} {t("amaliy dars", "practical lessons")}{" "}
            <span>·</span> {Object.keys(COMMANDS).length}{" "}
            {t("buyruq", "commands")}
          </p>
          <label htmlFor="lx-progress">
            {t("O‘zlashtirish", "Your progress")}{" "}
            <strong>
              {done}/{LESSONS.length}
            </strong>
          </label>
          <progress id="lx-progress" value={done} max={LESSONS.length} />
          <small>
            {t(
              "Natijalar shu brauzerda saqlanadi. Qurilmalar orasida sinxronlanmaydi.",
              "Progress is saved in this browser and does not sync across devices.",
            )}
          </small>
        </div>
      </header>
      <div className="lx-notice">
        <Terminal size={16} />
        <p>
          {t(
            "O‘quv simulyatori: virtual fayllar va cheklangan shell. Haqiqiy server, paket o‘rnatish, skript bajarish va internet so‘rovlari yo‘q. Har bir dars o‘z muhitiga ega.",
            "Teaching simulator: virtual files and a limited shell. No real server, package installation, script execution or internet requests. Each lesson has its own environment.",
          )}
        </p>
      </div>
      <div className="lx-layout">
        <aside className="lx-sidebar">
          <div className="lx-sidebar-title">
            <BookOpen size={16} />
            <h2>{t("O‘quv yo‘li", "Learning path")}</h2>
          </div>
          <nav aria-label={t("Linux darslari", "Linux lessons")}>
            {LESSONS.map((item, index) => (
              <div key={item.id}>
                {(index === 0 ||
                  item.group.en !== LESSONS[index - 1].group.en) && (
                  <h3>{item.group[locale]}</h3>
                )}
                <a
                  href={`#lesson/${item.id}`}
                  className={!sandbox && item.id === id ? "active" : ""}
                  aria-current={!sandbox && item.id === id ? "step" : undefined}
                  onClick={() => setSandbox(false)}
                >
                  <span className={progress[item.id] ? "lx-done" : "lx-number"}>
                    {progress[item.id] ? (
                      <Check
                        size={14}
                        aria-label={t("Bajarilgan", "Completed")}
                      />
                    ) : (
                      String(item.id).padStart(2, "0")
                    )}
                  </span>
                  <span>{item.title[locale]}</span>
                </a>
              </div>
            ))}
          </nav>
          <button
            className={`lx-sandbox ${sandbox ? "active" : ""}`}
            onClick={() => setSandbox(true)}
          >
            <Terminal size={17} />
            {t("Erkin mashq", "Free practice")}
            <ArrowRight size={15} />
          </button>
          <p className="lx-sidebar-note">
            {t(
              "Istalgan darsdan boshlang. Misollar buyruq satriga qo‘yiladi; bajarish uchun Enter bosing.",
              "Start with any lesson. Examples fill the command line; press Enter to run them.",
            )}
          </p>
        </aside>
        <Workspace
          key={sandbox ? "sandbox" : id}
          lesson={sandbox ? undefined : lesson}
          completed={!!progress[id]}
          onComplete={() => setProgress({ ...progress, [id]: true })}
          onReset={() => {
            const next = { ...progress };
            delete next[id];
            setProgress(next);
          }}
          onNext={() => select(Math.min(id + 1, LESSONS.length))}
        />
      </div>
    </div>
  );
}

function Workspace({
  lesson,
  completed,
  onComplete,
  onReset,
  onNext,
}: {
  lesson?: Lesson;
  completed: boolean;
  onComplete: () => void;
  onReset: () => void;
  onNext: () => void;
}) {
  const locale = useLocale();
  const t = (uz: string, en: string) => (locale === "uz" ? uz : en);
  const text = (value: Text) => value[locale];
  const key = `cybervalue:linux:session:${lesson?.id ?? "sandbox"}:v1`;
  const [raw, setRaw] = useLocalStorageState<unknown>(key, EMPTY_SESSION);
  const session = useMemo(() => restoreSession(raw), [raw]);
  const [feedback, setFeedback] = useState<"pass" | "fail" | null>(null);
  const [storageIssue, setStorageIssue] = useState(false);
  const [tab, setTab] = useState<"files" | "commands">("files");
  const [query, setQuery] = useState("");
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [historyIndex, setHistoryIndex] = useState<number | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);
  const draftBeforeHistory = useRef("");
  const requirements = lesson
    ? checks(lesson, session.shell, session.events)
    : [];
  const save = (next: Session) => {
    setRaw(next);
    try {
      setStorageIssue(
        window.localStorage.getItem(key) !== JSON.stringify(next),
      );
    } catch {
      setStorageIssue(true);
    }
  };
  useEffect(() => {
    if (outputRef.current)
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
  }, [session.transcript.length]);
  const insert = (value: string) => {
    save({ ...session, draft: value });
    setHistoryIndex(null);
    setSuggestions([]);
    inputRef.current?.focus();
  };
  const run = () => {
    if (!session.draft.trim()) return;
    const result = execute(session.shell, session.draft);
    const transcript = result.clear
      ? []
      : [
          ...session.transcript,
          {
            input: session.draft,
            output: result.output,
            cwd: session.shell.cwd,
            code: result.code,
          },
        ].slice(-80);
    save({
      ...session,
      shell: result.shell,
      events: [...session.events, ...result.events].slice(-200),
      transcript,
      draft: "",
    });
    setFeedback(null);
    setHistoryIndex(null);
    setSuggestions([]);
    inputRef.current?.focus();
  };
  const onKey = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowUp" || event.key === "ArrowDown") {
      event.preventDefault();
      const history = session.shell.history;
      if (!history.length) return;
      if (historyIndex === null) draftBeforeHistory.current = session.draft;
      const next =
        event.key === "ArrowUp"
          ? Math.max(0, (historyIndex ?? history.length) - 1)
          : Math.min(history.length, (historyIndex ?? history.length) + 1);
      setHistoryIndex(next);
      save({ ...session, draft: history[next] ?? draftBeforeHistory.current });
    }
    if (event.key === "Tab") {
      // Only consume Tab when a completion exists; otherwise keyboard focus can leave.
      const matches = complete(session.shell, session.draft);
      if (matches.length && !event.shiftKey && session.draft) {
        event.preventDefault();
        setSuggestions(matches);
        if (matches.length === 1)
          insert(session.draft.replace(/[^\s]*$/, matches[0]));
      }
    }
    if (event.ctrlKey && event.key.toLowerCase() === "l") {
      event.preventDefault();
      save({ ...session, transcript: [] });
    }
    if (event.ctrlKey && event.key.toLowerCase() === "c") {
      event.preventDefault();
      insert("");
    }
  };
  const reset = () => {
    if (
      !window.confirm(
        t(
          "Shu mashq fayllari, buyruqlar tarixi va natijasini boshlang‘ich holatga qaytarasizmi?",
          "Reset this exercise's files, command history and completion?",
        ),
      )
    )
      return;
    save(structuredClone(EMPTY_SESSION));
    if (lesson) onReset();
    setFeedback(null);
    setSelectedFile(null);
    setHistoryIndex(null);
    setSuggestions([]);
  };
  const check = () => {
    const passed =
      requirements.every((r) => r.passed) &&
      session.answer === lesson?.quiz.answer;
    setFeedback(passed ? "pass" : "fail");
    if (passed) onComplete();
  };
  const file = selectedFile ? session.shell.files[selectedFile] : undefined;
  const commandList = Object.entries(COMMANDS).filter(([name, syntax]) =>
    `${name} ${syntax} ${COMMAND_NOTES[name]?.[locale]}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  return (
    <div className="lx-workspace">
      <header className="lx-lesson-header">
        <div>
          <span className="eyebrow">
            {lesson
              ? `${t("DARS", "LESSON")} ${String(lesson.id).padStart(2, "0")} / ${LESSONS.length} · ${lesson.minutes} ${t("daqiqa", "min")}`
              : t("MUSTAQIL TAJRIBA", "YOUR OWN EXPERIMENTS")}
          </span>
          <h2>
            {lesson
              ? text(lesson.title)
              : t("Erkin terminal maydoni", "Free terminal practice")}
          </h2>
        </div>
        {completed && lesson && (
          <span className="lx-complete-badge">
            <Check size={15} />
            {t("Bajarilgan", "Completed")}
          </span>
        )}
      </header>
      {storageIssue && (
        <p className="lx-storage-warning" role="status">
          {t(
            "Brauzerga saqlab bo‘lmadi. Ishingiz hozirgi oynada davom etadi; yopishdan oldin hisobotni yuklab oling.",
            "Could not save to this browser. You can continue in this window; export your report before closing it.",
          )}
        </p>
      )}
      <div className="lx-practice-grid">
        <section
          className="lx-instructions"
          aria-label={t("Dars va topshiriq", "Lesson and task")}
        >
          {lesson ? (
            <>
              <p className="lx-intro">{text(lesson.intro)}</p>
              <details className="lx-theory" open>
                <summary>
                  <BookOpen size={16} />
                  {t("Avval tushunib oling", "Understand first")}
                </summary>
                <div>
                  {lesson.theory.map((paragraph, i) => (
                    <p key={i}>{text(paragraph)}</p>
                  ))}
                </div>
              </details>
              <h3>{t("Buyruqni sinab ko‘ring", "Try a command")}</h3>
              <div className="lx-examples">
                {lesson.examples.map((example) => (
                  <button
                    key={example.code}
                    onClick={() => insert(example.code)}
                    title={t(
                      "Buyruq satriga qo‘yish",
                      "Insert into command line",
                    )}
                  >
                    <div>
                      <code>{example.code}</code>
                      <ChevronRight size={16} />
                    </div>
                    <span>{text(example.explanation)}</span>
                  </button>
                ))}
              </div>
              <section className="lx-task" aria-labelledby="lx-task-title">
                <span className="eyebrow">
                  {t("ENDI SIZNING NAVBATINGIZ", "YOUR TURN")}
                </span>
                <h3 id="lx-task-title">
                  {t("Amaliy topshiriq", "Practical task")}
                </h3>
                <p>{text(lesson.task)}</p>
                <ul>
                  {requirements.map((r, i) => (
                    <li key={i} className={r.passed ? "passed" : ""}>
                      {r.passed ? <Check size={16} /> : <Circle size={14} />}
                      <span>{text(r.label)}</span>
                      <span className="visually-hidden">
                        {r.passed
                          ? t("Bajarildi", "Passed")
                          : t("Hali bajarilmadi", "Not passed yet")}
                      </span>
                    </li>
                  ))}
                </ul>
                <details className="lx-hint">
                  <summary>{t("Yordam kerakmi?", "Need a hint?")}</summary>
                  <p>
                    {t(
                      "Har bir buyruqni alohida bajaring. Muhitni o‘zgartirib yuborgan bo‘lsangiz, mashqni qayta boshlang.",
                      "Run each command separately. If you have changed the starting files, reset the exercise first.",
                    )}
                  </p>
                  {lesson.hint.map((hint, index) => (
                    <button
                      key={`${index}-${hint}`}
                      onClick={() => insert(hint)}
                    >
                      <code>{hint}</code>
                      <ChevronRight size={14} />
                    </button>
                  ))}
                </details>
              </section>
              <fieldset className="lx-quiz">
                <legend>
                  {t("O‘zingizni tekshiring", "Check your understanding")}
                </legend>
                <p>{text(lesson.quiz.question)}</p>
                {lesson.quiz.choices.map((choice, index) => (
                  <label key={index}>
                    <input
                      type="radio"
                      name="linux-quiz"
                      value={index}
                      checked={session.answer === index}
                      onChange={() => {
                        save({ ...session, answer: index });
                        setFeedback(null);
                      }}
                    />
                    <span>{text(choice)}</span>
                  </label>
                ))}
                {session.answer !== null && (
                  <p
                    className={
                      session.answer === lesson.quiz.answer
                        ? "lx-quiz-correct"
                        : "lx-quiz-wrong"
                    }
                    role="status"
                  >
                    {session.answer === lesson.quiz.answer
                      ? t("To‘g‘ri. ", "Correct. ") +
                        text(lesson.quiz.explanation)
                      : t(
                          "Yana o‘ylab ko‘ring. Izohni yuqoridagi nazariyadan topasiz.",
                          "Try again. Review the explanation in the theory above.",
                        )}
                  </p>
                )}
              </fieldset>
              <button className="lx-primary lx-check" onClick={check}>
                <Check size={17} />
                {t("Natijani tekshirish", "Check result")}
              </button>
              <div aria-live="polite" className="lx-feedback">
                {feedback === "fail" && (
                  <p>
                    {t(
                      "Hali tugamadi: belgilanmagan amallarni bajaring va savolga to‘g‘ri javob bering.",
                      "Not finished: complete the unchecked tasks and answer the question correctly.",
                    )}
                  </p>
                )}
                {feedback === "pass" && (
                  <p className="passed">
                    {t("Ajoyib, dars bajarildi!", "Lesson completed!")}
                  </p>
                )}
              </div>
              {feedback === "pass" && lesson.id < LESSONS.length && (
                <button className="lx-next" onClick={onNext}>
                  {t("Keyingi dars", "Next lesson")}
                  <ArrowRight size={16} />
                </button>
              )}
              {feedback === "pass" && lesson.id === LESSONS.length && (
                <p className="lx-finish">
                  {t(
                    "Yakuniy audit bajarildi. Qolgan darslarni ham tekshiring yoki erkin terminalda mustaqil mashq qiling.",
                    "Final audit completed. Review any remaining lessons or experiment in free practice.",
                  )}
                </p>
              )}
            </>
          ) : (
            <>
              <span className="eyebrow">
                {t("O‘Z TEZLIGINGIZDA", "AT YOUR OWN PACE")}
              </span>
              <h3>
                {t(
                  "G‘oyangizni buyruqqa aylantiring",
                  "Turn an idea into a command",
                )}
              </h3>
              <p>
                {t(
                  "Bu terminal darslardan alohida saqlanadi. Fayllar yarating, oqimlarni ulang va natijani tekshiring. help mavjud buyruqlarni ko‘rsatadi.",
                  "This terminal is saved separately from the lessons. Create files, connect streams and inspect the results. Use help to list commands.",
                )}
              </p>
              <div className="lx-examples">
                {[
                  "help",
                  "ls -la",
                  "tree",
                  "cat logs/auth.log | grep -F ERROR | wc -l",
                ].map((code) => (
                  <button key={code} onClick={() => insert(code)}>
                    <code>{code}</code>
                    <ChevronRight size={16} />
                  </button>
                ))}
              </div>
              <div className="lx-filesystem">
                <h3>{t("Linux kataloglari", "Linux directories")}</h3>
                <pre>
                  {
                    "/\n├── etc        → configuration\n├── home\n│   └── student → ~\n├── tmp        → temporary\n└── var\n    └── log    → logs"
                  }
                </pre>
                <p>
                  {t(
                    "Yozish uchun /home/student va /tmp kataloglaridan foydalaning. Tizim fayllari o‘quv namunalaridir.",
                    "Write inside /home/student and /tmp. System files are teaching fixtures.",
                  )}
                </p>
              </div>
            </>
          )}
        </section>
        <div className="lx-tools">
          <section
            className="lx-terminal"
            aria-label={t("Linux terminali", "Linux terminal")}
          >
            <div className="lx-terminal-bar">
              <span className="lx-window-dots" aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
              <span>student@linux-lab</span>
              <span className="lx-terminal-tag">
                {t("SIMULYATOR", "SIMULATOR")}
              </span>
            </div>
            <div
              className="lx-output"
              ref={outputRef}
              tabIndex={0}
              role="log"
              aria-label={t("Terminal natijalari", "Terminal output")}
              aria-live="polite"
              aria-relevant="additions"
            >
              <div className="lx-welcome">
                <strong>CyberValue Linux Lab</strong>
                <p>
                  {t(
                    "Boshlash uchun buyruq kiriting. Yordam: help",
                    "Enter a command to start. For help: help",
                  )}
                </p>
              </div>
              {session.transcript.map((line, i) => (
                <div className="lx-entry" key={i}>
                  <div className="lx-echo">
                    <span>{line.cwd.replace(HOME, "~")} $</span> {line.input}
                  </div>
                  {line.output && (
                    <pre className={line.code !== 0 ? "lx-command-error" : ""}>
                      {line.output}
                    </pre>
                  )}
                  <span className="lx-exit">exit {line.code}</span>
                </div>
              ))}
            </div>
            <form
              className="lx-command-form"
              onSubmit={(event) => {
                event.preventDefault();
                run();
              }}
            >
              <label htmlFor="lx-command" className="lx-prompt">
                <span className="visually-hidden">
                  {t("Terminal buyrug‘i", "Terminal command")}
                </span>
                <span aria-hidden="true">
                  {session.shell.cwd.replace(HOME, "~")} $
                </span>
              </label>
              <input
                id="lx-command"
                ref={inputRef}
                value={session.draft}
                maxLength={2000}
                onChange={(event) => {
                  save({ ...session, draft: event.target.value });
                  setHistoryIndex(null);
                  setSuggestions([]);
                }}
                onKeyDown={onKey}
                autoComplete="off"
                autoCapitalize="off"
                spellCheck={false}
                placeholder={t("buyruq kiriting…", "enter a command…")}
                aria-describedby="lx-shortcuts"
              />
              <button
                type="submit"
                aria-label={t("Buyruqni bajarish", "Run command")}
                title={t("Buyruqni bajarish", "Run command")}
              >
                <Play size={17} />
              </button>
            </form>
            {suggestions.length > 1 && (
              <div className="lx-suggestions" role="status">
                {suggestions.map((item) => (
                  <button
                    key={item}
                    onClick={() =>
                      insert(session.draft.replace(/[^\s]*$/, item))
                    }
                  >
                    {item}
                  </button>
                ))}
              </div>
            )}
            <div className="lx-terminal-footer" id="lx-shortcuts">
              Enter ↵ <span>↑ ↓ {t("tarix", "history")}</span>
              <span>Tab {t("to‘ldirish", "complete")}</span>
              <span>Ctrl+L {t("tozalash", "clear")}</span>
            </div>
          </section>
          <div className="lx-tools-actions">
            <button onClick={reset}>
              <RotateCcw size={14} />
              {t("Mashqni qayta boshlash", "Reset exercise")}
            </button>
            <button
              onClick={() =>
                download(
                  `linux-${lesson?.id ?? "practice"}-report.txt`,
                  `${lesson ? text(lesson.title) : "Linux practice"}\n${requirements.map((r) => `${r.passed ? "[x]" : "[ ]"} ${text(r.label)}`).join("\n")}\n\n${session.transcript.map((line) => `${line.cwd} $ ${line.input}\n${line.output}[exit ${line.code}]`).join("\n\n")}`,
                )
              }
            >
              <Download size={14} />
              {t("Hisobotni yuklab olish", "Export report")}
            </button>
          </div>
          <section className="lx-inspector">
            <div
              className="lx-tabs"
              role="tablist"
              aria-label={t("Terminal yordamchilari", "Terminal tools")}
            >
              <button
                id="lx-files-tab"
                role="tab"
                aria-selected={tab === "files"}
                aria-controls="lx-files-panel"
                onClick={() => setTab("files")}
              >
                <Folder size={15} />
                {t("Fayllar", "Files")}
              </button>
              <button
                id="lx-commands-tab"
                role="tab"
                aria-selected={tab === "commands"}
                aria-controls="lx-commands-panel"
                onClick={() => setTab("commands")}
              >
                <BookOpen size={15} />
                {t("Buyruqlar qo‘llanmasi", "Command reference")}
              </button>
            </div>
            {tab === "files" ? (
              <div
                id="lx-files-panel"
                role="tabpanel"
                aria-labelledby="lx-files-tab"
              >
                <p className="lx-inspector-help">
                  {t(
                    "Virtual fayl holatini ko‘ring. O‘qish ruxsati bo‘lmagan fayl mazmuni ochilmaydi.",
                    "Inspect virtual files. Files without read permission cannot be opened.",
                  )}
                </p>
                <div className="lx-file-list">
                  {Object.entries(session.shell.files)
                    .filter(
                      ([path]) =>
                        path === HOME ||
                        path.startsWith(HOME + "/") ||
                        path.startsWith("/tmp/"),
                    )
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([path, entry]) => (
                      <button
                        key={path}
                        onClick={() => setSelectedFile(path)}
                        className={selectedFile === path ? "selected" : ""}
                      >
                        {entry.kind === "dir" ? (
                          <Folder size={14} />
                        ) : (
                          <FileText size={14} />
                        )}
                        <span>
                          {path.replace(HOME, "~")}
                          {entry.kind === "dir" ? "/" : ""}
                        </span>
                        <code>{entry.mode.toString(8).padStart(3, "0")}</code>
                      </button>
                    ))}
                </div>
                {selectedFile && file && (
                  <div className="lx-file-preview">
                    <div>
                      <code>{selectedFile.replace(HOME, "~")}</code>
                      <button
                        onClick={() => setSelectedFile(null)}
                        aria-label={t(
                          "Fayl ko‘rinishini yopish",
                          "Close file preview",
                        )}
                      >
                        <X size={15} />
                      </button>
                    </div>
                    {file.kind === "dir" ? (
                      <p>
                        {t(
                          "Katalog. Ichiga o‘tish uchun cd buyrug‘idan foydalaning.",
                          "Directory. Use cd to enter it.",
                        )}
                      </p>
                    ) : (
                      <>
                        <pre>
                          {execute(
                            session.shell,
                            `cat '${selectedFile.replace(/'/g, "'\\''")}'`,
                          ).output || t("Bo‘sh fayl", "Empty file")}
                        </pre>
                        <button
                          onClick={() => {
                            const result = execute(
                              session.shell,
                              `cat '${selectedFile.replace(/'/g, "'\\''")}'`,
                            );
                            if (result.code === 0)
                              download(
                                selectedFile.split("/").at(-1)!,
                                result.output,
                              );
                          }}
                          disabled={
                            execute(
                              session.shell,
                              `cat '${selectedFile.replace(/'/g, "'\\''")}'`,
                            ).code !== 0
                          }
                        >
                          <Download size={14} />
                          {t("Faylni yuklab olish", "Download file")}
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div
                id="lx-commands-panel"
                role="tabpanel"
                aria-labelledby="lx-commands-tab"
              >
                <label className="lx-search">
                  <Search size={15} />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={t(
                      "Buyruq yoki vazifa bo‘yicha qidirish",
                      "Search by command or purpose",
                    )}
                    aria-label={t("Buyruqlarni qidirish", "Search commands")}
                  />
                </label>
                <div className="lx-command-list">
                  {commandList.length === 0 && (
                    <p>{t("Buyruq topilmadi.", "No commands found.")}</p>
                  )}
                  {commandList.map(([name, syntax]) => (
                    <article key={name}>
                      <div>
                        <strong>{name}</strong>
                        <button onClick={() => insert(`help ${name}`)}>
                          {t("Sintaksis", "Syntax")}
                          <ChevronRight size={13} />
                        </button>
                      </div>
                      <code>{syntax}</code>
                      <p>
                        {COMMAND_NOTES[name] ? text(COMMAND_NOTES[name]) : ""}
                      </p>
                    </article>
                  ))}
                </div>
              </div>
            )}
          </section>
          <details className="lx-limits">
            <summary>
              {t(
                "Terminal imkoniyatlari va chegaralari",
                "Terminal capabilities and limits",
              )}
            </summary>
            <p>
              {t(
                "Qo‘llanadi: |, >, >>, <, &&, ;, tirnoqlar, o‘zgaruvchilar, mutlaq va nisbiy yo‘llar. Barcha fayllar student ga tegishli. Ruxsatlarning egaga tegishli bitlari tekshiriladi.",
                "Supported: |, >, >>, <, &&, ;, quotes, variables, absolute and relative paths. All files belong to student. Owner permission bits are checked.",
              )}
            </p>
            <p>
              {t(
                "To‘liq Bash emas: regex, umumiy wildcard, skriptlar, sudo, tarmoq, paketlar, interaktiv muharrirlar va fon jarayonlari yo‘q. ps va kill oldindan berilgan virtual jarayonlar bilan ishlaydi. Fayl vaqt belgilari modellashtirilmagan. Ayrim chiqish formatlari soddalashtirilgan.",
                "Not full Bash: no regex, general wildcards, scripts, sudo, networking, packages, interactive editors or background jobs. ps and kill use predefined virtual processes. File timestamps are not modelled. Some output formats are simplified.",
              )}
            </p>
            <p>
              {t(
                "Chegaralar: 250 fayl/katalog, faylga 32 000 belgi, buyruqqa 2 000 belgi. Tarixning oxirgi 100 buyrug‘i va ekranning 80 yozuvi saqlanadi.",
                "Limits: 250 files/directories, 32,000 characters per file, 2,000 per command. The last 100 commands and 80 screen entries are retained.",
              )}
            </p>
            <div className="lx-sources">
              <a
                href="https://www.gnu.org/software/coreutils/manual/html_node/index.html"
                target="_blank"
                rel="noreferrer"
              >
                GNU Coreutils ↗
              </a>
              <a
                href="https://www.gnu.org/software/bash/manual/"
                target="_blank"
                rel="noreferrer"
              >
                GNU Bash ↗
              </a>
              <a
                href="https://www.gnu.org/software/grep/manual/grep.html"
                target="_blank"
                rel="noreferrer"
              >
                GNU grep ↗
              </a>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}
