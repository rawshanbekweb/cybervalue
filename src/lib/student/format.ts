// Browser-safe: shared by the admin code list and the login placeholder.
export const formatAccessCode = (code: string) =>
  code.match(/.{1,4}/g)!.join("-");
