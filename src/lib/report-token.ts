// Parent report links: /report/<24 base64url characters>.
export const isReportToken = (value: string) =>
  /^[A-Za-z0-9_-]{24}$/.test(value);

export const reportPath = (token: string) => `/report/${token}`;
