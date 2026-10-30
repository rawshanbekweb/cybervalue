"use client";

import { useState } from "react";
import { Search as SearchIcon, ShieldCheck } from "lucide-react";
import { useT } from "../network-lab/use-t";
import {
  AnimLab,
  CommonWidgetView,
  type WidgetProps,
} from "../anim-lab/AnimLab";
import { LESSONS, PROGRESS_KEY, type Widget } from "@/lib/search/curriculum";
import { DOCS, found, search, TARGET } from "@/lib/search/tools";
import "../http-basics/http-basics.css";
import "../crypto-basics/crypto-basics.css";
import "../untrusted-input/untrusted-input.css";
import "../browser-risks/browser-risks.css";
import "../access-control/access-control.css";
import "./search.css";

// Academy Intermediate · OSINT search technique: narrow a query with real
// operators until one exposed file is left.
export function SearchTechnique() {
  const { t } = useT();
  return (
    <AnimLab
      lessons={LESSONS}
      progressKey={PROGRESS_KEY}
      eyebrow={t("OSINT · MODULE 2")}
      title={t("Search technique.")}
      subtitle={t("Ask the engine precisely, then check what it says.")}
      description={t(
        "Learn what search engines miss, read and write site:, filetype:, intitle:, quoted and minus operators, narrow a search to one leaked file, date archived pages, judge sources, insist on independent confirmation and search in local languages and scripts.",
      )}
      badge={t("DORK / LAB")}
      icon={<SearchIcon size={22} />}
      checkpoints={["search-1"]}
      back={{ href: "/intermediate", label: "Academy Intermediate" }}
      renderWidget={(widget: Widget, props) =>
        widget.type === "operators" ? (
          <OperatorsWidget {...props} />
        ) : (
          <CommonWidgetView widget={widget} {...props} />
        )
      }
    />
  );
}

/** A search box over twelve pages; narrow it to the one target. */
function OperatorsWidget({ onSolved }: WidgetProps) {
  const { t } = useT();
  const [query, setQuery] = useState('"price list"');
  const results = search(query);
  const done = found(query);
  return (
    <div className="nl-card cb-card">
      <label className="cb-field">
        {t("Search")}
        <input
          value={query}
          maxLength={160}
          spellCheck={false}
          autoCapitalize="off"
          autoComplete="off"
          onChange={(e) => {
            setQuery(e.target.value);
            onSolved(found(e.target.value));
          }}
        />
      </label>
      <p className="cb-label" aria-live="polite">
        {t("{n} of {total} pages", { n: results.length, total: DOCS.length })}
      </p>
      <ol className="sr-results">
        {results.map((d) => (
          <li
            key={d.url}
            className={`sr-result${done && d.url === TARGET ? " hit" : ""}`}
          >
            <span className="sr-title">{d.title}</span>
            <code className="sr-url">{d.url}</code>
            <span className="sr-text">{d.text}</span>
          </li>
        ))}
      </ol>
      {done && (
        <p className="nl-pass" aria-live="polite">
          <ShieldCheck size={15} aria-hidden="true" />{" "}
          {t(
            "One result: the internal price list is public. Record the address and time, don’t share the file, and tell the client now.",
          )}
        </p>
      )}
    </div>
  );
}
