import { ProgressSync } from "@/components/playground/ProgressSync";
import { CodeReview } from "@/components/playground/codereview/CodeReview";
import { IntermediateLocked } from "@/components/intermediate-locked";
import { intermediateAccess } from "@/lib/intermediate/access";
import { requireSection } from "@/lib/site-config-server";
import { metadata } from "@/lib/seo";

export const generateMetadata = () =>
  metadata(
    "Secure code review · Academy Intermediate",
    "See what people find that tools miss, review with a security checklist, flag four problems in a pull request, write comments an author can act on, rate findings by impact and likelihood and decide when to approve.",
    "/intermediate/codereview",
  );

export default async function CodeReviewPage() {
  await requireSection("intermediate", "codereview");
  const access = await intermediateAccess();
  if (!access.open)
    return (
      <IntermediateLocked access={access} path="/intermediate/codereview" />
    );
  return (
    <>
      <ProgressSync lab="codereview" />
      <CodeReview />
    </>
  );
}
