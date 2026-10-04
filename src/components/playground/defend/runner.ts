"use client";

import { armInput, buildDocument, newNonce } from "@/lib/defend/harness";
import type { RunReport, Scenario } from "@/lib/defend/scenarios";

const TIMEOUT_MS = 2500;

const empty = (patch: Partial<RunReport>): RunReport => ({
  fired: [],
  threw: null,
  timedOut: false,
  returned: null,
  text: "",
  html: "",
  links: [],
  marks: [],
  styles: [],
  ...patch,
});

// Runs one case in a fresh, invisible sandbox and resolves with its report.
// Only messages from that exact frame carrying its nonce are accepted.
export function runCase(
  code: string,
  scenario: Scenario,
  input: unknown,
): Promise<RunReport> {
  return new Promise((resolve) => {
    const nonce = newNonce();
    const frame = document.createElement("iframe");
    frame.setAttribute("sandbox", "allow-scripts");
    frame.setAttribute("aria-hidden", "true");
    frame.tabIndex = -1;
    frame.title = "attack sandbox";
    Object.assign(frame.style, {
      position: "fixed",
      left: "-10000px",
      top: "0",
      width: "480px",
      height: "320px",
      border: "0",
    });
    let settled = false;
    const finish = (report: RunReport) => {
      if (settled) return;
      settled = true;
      window.removeEventListener("message", onMessage);
      clearTimeout(timer);
      frame.remove();
      resolve(report);
    };
    const onMessage = (event: MessageEvent) => {
      if (event.source !== frame.contentWindow) return;
      const data = event.data as { channel?: string; report?: RunReport };
      if (data?.channel !== nonce || !data.report) return;
      finish(empty(data.report));
    };
    const timer = setTimeout(
      () =>
        finish(
          empty({
            timedOut: true,
            threw: "No result in time: the code may never finish.",
          }),
        ),
      TIMEOUT_MS,
    );
    window.addEventListener("message", onMessage);
    frame.srcdoc = buildDocument(code, scenario, armInput(input, nonce), nonce);
    document.body.append(frame);
  });
}

// The visible preview uses benign sample data and the same isolation.
export const previewDocument = (code: string, scenario: Scenario) =>
  buildDocument(code, scenario, scenario.sample, newNonce());
