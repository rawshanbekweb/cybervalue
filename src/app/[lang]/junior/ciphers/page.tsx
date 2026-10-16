import { CipherRoom } from "@/components/playground/junior/ciphers/CipherRoom";
import { JuniorLogin } from "@/components/playground/junior/JuniorLogin";
import { AcademyShell } from "@/components/playground/junior/AcademyShell";
import { getJuniorMember } from "@/lib/junior/session";
import { metadata } from "@/lib/seo";

export const generateMetadata = () =>
  metadata(
    "The Cipher Room",
    "Ten ciphers from history with interactive visual explanations, stories and homework: Atbash, the Spartan scytale, Polybius, Caesar, Al-Kindi's frequency analysis, Vigenère, pigpen, Morse code, the Enigma machine and public-key key exchange.",
    "/junior/ciphers",
  );

export default async function CipherRoomPage() {
  if (!(await getJuniorMember())) return <JuniorLogin />;
  return (
    <AcademyShell>
      <CipherRoom />
    </AcademyShell>
  );
}
