import { ProgressSync } from "@/components/playground/ProgressSync";
import { CryptoBasics } from "@/components/playground/crypto-basics/CryptoBasics";
import { requireSection } from "@/lib/site-config-server";
import { metadata } from "@/lib/seo";

export const generateMetadata = () =>
  metadata(
    "Cryptography basics · animated lab",
    "Encoding, hashing and encryption told apart: forge a Base64 cookie, watch one letter scramble a hash, salt a leaked table, run a dictionary attack, flip XOR bits and sign a message.",
    "/akademiya/crypto",
  );

export default async function CryptoPage() {
  await requireSection("academy", "crypto");
  return (
    <>
      <ProgressSync lab="crypto" />
      <CryptoBasics />
    </>
  );
}
