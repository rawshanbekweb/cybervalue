import { getJuniorMember } from "@/lib/junior/session";
import { restoreJuniorProgress } from "@/lib/junior/progress";
import { JuniorStoreProvider } from "@/components/playground/junior/store";

// Signed-in members get their saved progress for every academy page.
export default async function JuniorLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const member = await getJuniorMember();
  if (!member) return children;
  return (
    <JuniorStoreProvider
      member={{ name: member.name, group: member.group }}
      initial={restoreJuniorProgress(member.progress)}
    >
      {children}
    </JuniorStoreProvider>
  );
}
