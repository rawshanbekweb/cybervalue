// Number grouping that renders identically on the server and in every browser.
// `toLocaleString("uz-UZ")` depends on each engine's ICU data (Node groups with
// a space, some browsers with a comma), which breaks hydration.
export function formatCount(value: number, locale: "uz" | "en") {
  return String(Math.trunc(value)).replace(
    /\B(?=(\d{3})+(?!\d))/g,
    locale === "uz" ? " " : ",",
  );
}
