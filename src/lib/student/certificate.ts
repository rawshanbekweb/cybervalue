import { randomBytes } from "node:crypto";
import { ALPHABET, normalizeAccessCode } from "./access";
import { formatAccessCode } from "./format";

// Certificate codes are public (printed as a QR code), so they only need to be
// unguessable, not secret: 12 Crockford symbols carry 60 random bits.
const LENGTH = 12;

export function newCertificateCode() {
  return [...randomBytes(LENGTH)].map((byte) => ALPHABET[byte & 31]).join("");
}

// Accepts a code typed by hand, with dashes or look-alike letters.
export function parseCertificateCode(input: string) {
  const code = normalizeAccessCode(input);
  return code.length === LENGTH && [...code].every((c) => ALPHABET.includes(c))
    ? code
    : null;
}

export const formatCertificateCode = formatAccessCode;

export const CERTIFICATE_PATH = "/sertifikat";

export const certificateUrl = (origin: string, code: string) =>
  `${origin.replace(/\/$/, "")}${CERTIFICATE_PATH}/${formatCertificateCode(code)}`;

export const DEFAULT_CERTIFICATE_TITLE =
  "Kiberxavfsizlik va web ilovalar asoslari";
