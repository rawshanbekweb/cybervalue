import type { Translator } from "../i18n";

// Traces and expectations are stored in English in browser history, so
// variable lines are matched back to their message templates at render time.
const patterns: [RegExp, string, string[]][] = [
  [/^Identity: (\w+)$/, "Identity: {actor}", ["actor"]],
  [
    /^Price loaded from catalog: (.+) cents\.$/,
    "Price loaded from catalog: {price} cents.",
    ["price"],
  ],
  [
    /^Price trusted from request body: (.+) cents\.$/,
    "Price trusted from request body: {price} cents.",
    ["price"],
  ],
  [
    /^Coupon applied (\d+) time\(s\)\. Total: (.+) cents\.$/,
    "Coupon applied {count} time(s). Total: {total} cents.",
    ["count", "total"],
  ],
  [
    /^Fulfillment queued\. Deliveries created: (\d+)\.$/,
    "Fulfillment queued. Deliveries created: {count}.",
    ["count"],
  ],
  [/^201, total (.+)$/, "201, total {total}", ["total"]],
];

export function translateStep(t: Translator, text: string) {
  for (const [pattern, template, keys] of patterns) {
    const match = pattern.exec(text);
    if (match)
      return t(
        template,
        Object.fromEntries(keys.map((key, index) => [key, match[index + 1]])),
      );
  }
  return t(text);
}
