import { ProgressSync } from "@/components/playground/ProgressSync";
import { GitBasics } from "@/components/playground/git-basics/GitBasics";
import { requireSection } from "@/lib/site-config-server";
import { metadata } from "@/lib/seo";

export const generateMetadata = () =>
  metadata(
    "Git and GitHub · animated lab",
    "Version control from the first commit to a pull request: commits, branches, merge conflicts, pushing to GitHub, teamwork and keeping secrets out of history, in a Git that runs in the browser.",
    "/akademiya/git",
  );

export default async function GitPage() {
  await requireSection("academy", "git");
  return (
    <>
      <ProgressSync lab="git" />
      <GitBasics />
    </>
  );
}
