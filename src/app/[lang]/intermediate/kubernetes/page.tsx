import { ProgressSync } from "@/components/playground/ProgressSync";
import { Kubernetes } from "@/components/playground/kubernetes/Kubernetes";
import { IntermediateLocked } from "@/components/intermediate-locked";
import { intermediateAccess } from "@/lib/intermediate/access";
import { requireSection } from "@/lib/site-config-server";
import { metadata } from "@/lib/seo";

export const generateMetadata = () =>
  metadata(
    "Kubernetes basics · Academy Intermediate",
    "Apply Pod Security Standards, review a manifest’s settings, keep RBAC to least privilege, limit traffic with network policies, protect Secrets and look after the cluster.",
    "/intermediate/kubernetes",
  );

export default async function KubernetesPage() {
  await requireSection("intermediate", "kubernetes");
  const access = await intermediateAccess();
  if (!access.open)
    return (
      <IntermediateLocked access={access} path="/intermediate/kubernetes" />
    );
  return (
    <>
      <ProgressSync lab="kubernetes" />
      <Kubernetes />
    </>
  );
}
