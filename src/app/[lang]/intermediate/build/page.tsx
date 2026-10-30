import { ProgressSync } from "@/components/playground/ProgressSync";
import { Build } from "@/components/playground/build/Build";
import { IntermediateLocked } from "@/components/intermediate-locked";
import { intermediateAccess } from "@/lib/intermediate/access";
import { requireSection } from "@/lib/site-config-server";
import { metadata } from "@/lib/seo";

export const generateMetadata = () =>
  metadata(
    "How programs are built · Academy Intermediate",
    "Follow source code through the preprocessor, compiler, assembler and linker, tell ELF from PE from Mach-O, place a program’s parts in their sections, read the header, compare static and dynamic linking and see what stripping removes.",
    "/intermediate/build",
  );

export default async function BuildPage() {
  await requireSection("intermediate", "build");
  const access = await intermediateAccess();
  if (!access.open)
    return <IntermediateLocked access={access} path="/intermediate/build" />;
  return (
    <>
      <ProgressSync lab="build" />
      <Build />
    </>
  );
}
