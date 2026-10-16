import { CipherRoom } from "@/components/playground/junior/ciphers/CipherRoom";
import { metadata } from "@/lib/seo";

export const generateMetadata = () =>
  metadata(
    "The Cipher Room",
    "Nine ciphers from history with interactive visual explanations, stories and homework: Atbash, the Spartan scytale, Polybius, Caesar, Al-Kindi's frequency analysis, pigpen, Vigenère, Morse code and public-key key exchange.",
    "/playground/junior/ciphers",
  );

export default function CipherRoomPage() {
  return <CipherRoom />;
}
