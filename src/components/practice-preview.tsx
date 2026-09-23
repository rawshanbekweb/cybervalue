"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, CheckCircle2, Play, Terminal } from "lucide-react";

const examples = [
  {
    label: "Build",
    file: "index.html",
    language: "HTML",
    code: [
      "<main>",
      "  <h1>Build with intention.</h1>",
      "  <p>Every great system starts",
      "     with a solid foundation.</p>",
      "  <button>Start exploring</button>",
      "</main>",
    ],
    result:
      "A heading, a paragraph, and a button. See how structure becomes an interface in the HTML editor.",
    href: "/playground/html-basics#lesson/1",
    link: "Open HTML editor",
  },
  {
    label: "Investigate",
    file: "request.http",
    language: "HTTP",
    code: [
      "GET /api/lab/health HTTP/1.1",
      "Host: localhost",
      "Accept: application/json",
      "",
      "# Trace the request.",
      "# Understand the response.",
    ],
    result:
      "A request has a method, a path, and headers. Explore real requests and responses in the HTTP lessons.",
    href: "/playground/web-security-lab#lesson/7",
    link: "Explore HTTP lessons",
  },
  {
    label: "Defend",
    file: "authorization.ts",
    language: "PSEUDOCODE",
    code: [
      "const resource = findById(id);",
      "",
      "if (resource.ownerId !== user.id) {",
      "  return forbidden();",
      "}",
      "return resource;",
    ],
    result:
      "Knowing a resource ID is not permission to access it. Check ownership on the server for every request.",
    href: "/playground/web-security-lab#lesson/26",
    link: "Explore access control",
  },
];

export function PracticePreview() {
  const [selected, setSelected] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const example = examples[selected];
  return (
    <div className="practice-preview">
      <div className="preview-titlebar">
        <span className="preview-dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span>cybervalue / workspace</span>
        <Terminal size={14} />
      </div>
      <div className="preview-tabs" role="group" aria-label="Practice preview">
        {examples.map((item, index) => (
          <button
            key={item.label}
            aria-pressed={selected === index}
            onClick={() => {
              setSelected(index);
              setShowResult(false);
            }}
          >
            <span>0{index + 1}</span>
            {item.label}
          </button>
        ))}
      </div>
      <div className="preview-file">
        <span>{example.file}</span>
        <span>{example.language}</span>
      </div>
      <pre className="preview-code">
        <code>
          {example.code.map((line, index) => (
            <span key={index}>
              <span className="preview-line-number" aria-hidden="true">
                {index + 1}
              </span>
              {line || " "}
            </span>
          ))}
        </code>
      </pre>
      <div className="preview-action">
        <span>Interactive learning preview</span>
        <button
          onClick={() => setShowResult(!showResult)}
          aria-expanded={showResult}
          aria-controls="preview-result"
        >
          <Play size={12} />
          {showResult ? "Hide insight" : "Show insight"}
        </button>
      </div>
      <div id="preview-result" className="preview-result" hidden={!showResult}>
        <CheckCircle2 size={17} />
        <p>{example.result}</p>
      </div>
      <Link className="preview-link" href={example.href}>
        {example.link}
        <ArrowUpRight size={15} />
      </Link>
    </div>
  );
}
