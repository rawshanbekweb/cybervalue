"use client";

// The code box of the Kids labs: line numbers that flag problem lines (and
// the line running now), Ctrl+Enter to run, and Enter that keeps the indent
// and opens one after a line ending in ":", so blocks are easy to type.
export function CodeEditor({
  label,
  value,
  onChange,
  onRun,
  onFocus,
  bad,
  active = 0,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onRun: () => void;
  onFocus?: () => void;
  bad: Set<number>;
  /** The line being run, highlighted in the gutter; 0 for none. */
  active?: number;
}) {
  const lineCount = value.split("\n").length;
  return (
    <div className="kids-editor">
      <ol className="kids-gutter" aria-hidden="true">
        {Array.from({ length: lineCount }, (_, i) => (
          <li
            key={i}
            className={
              active === i + 1 ? "active" : bad.has(i + 1) ? "bad" : ""
            }
          >
            {i + 1}
          </li>
        ))}
      </ol>
      <textarea
        aria-label={label}
        value={value}
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
        rows={Math.max(lineCount, 9)}
        onChange={(e) => onChange(e.target.value.slice(0, 4000))}
        onFocus={onFocus}
        onKeyDown={(e) => {
          if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
            onRun();
            return;
          }
          if (e.key !== "Enter" || e.shiftKey) return;
          const area = e.currentTarget;
          const at = area.selectionStart;
          const line = area.value.slice(
            area.value.lastIndexOf("\n", at - 1) + 1,
            at,
          );
          const indent =
            (/^[ \t]*/.exec(line)?.[0] ?? "") +
            (/:\s*$/.test(line) ? "    " : "");
          if (!indent) return;
          e.preventDefault();
          // Edit the box itself so the caret moves with the text at once;
          // setting it later lets fast typing land before the indent.
          area.setRangeText(`\n${indent}`, at, area.selectionEnd, "end");
          onChange(area.value.slice(0, 4000));
        }}
      />
    </div>
  );
}
