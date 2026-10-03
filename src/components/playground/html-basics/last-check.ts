export type Checked = {
  lessonId: number;
  code: string;
  results: { label: string; pass: boolean }[];
};

// Switching language swaps the prerendered `[lang]` tree and remounts the
// lesson; keeping the last check result outside React lets it survive that.
// It is client-only and resets on a full page load.
let last: Checked | null = null;

export const getLastCheck = () => last;
export const setLastCheck = (value: Checked | null) => {
  last = value;
};
