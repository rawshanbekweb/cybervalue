import { requireSection } from "@/lib/site-config-server";
import { getJuniorMember } from "@/lib/junior/session";
import { restoreJuniorProgress } from "@/lib/junior/progress";
import { JuniorStoreProvider } from "@/components/playground/junior/store";
import { JuniorMessages } from "@/components/i18n/junior-messages";

// Signed-in members get their saved progress for every academy page.
export default async function JuniorLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await requireSection("junior");
  const member = await getJuniorMember();
  if (!member) return <JuniorMessages>{children}</JuniorMessages>;
  return (
    <JuniorMessages>
      <JuniorStoreProvider
        member={{ name: member.name, group: member.group }}
        initial={restoreJuniorProgress(member.progress)}
      >
        {children}
      </JuniorStoreProvider>
    </JuniorMessages>
  );
}
