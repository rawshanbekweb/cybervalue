// How a Junior or Kids access code is shown: XXXX-XXXX. Kept apart from
// codes.ts, which needs node:crypto, so browser components can import it
// without pulling a crypto polyfill into the page.
export const formatJuniorCode = (code: string) =>
  `${code.slice(0, 4)}-${code.slice(4)}`;
