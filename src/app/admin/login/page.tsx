import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { LoginForm } from "./login-form";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; changed?: string }>;
}) {
  const session = await getSession();
  if (session) redirect("/admin");
  const { next, changed } = await searchParams;
  return (
    <div className="container admin-auth-page">
      <span className="eyebrow">CyberValue admin</span>
      <h1>Sign in</h1>
      <p className="muted">Private area. Not for public use.</p>
      {changed === "1" && (
        <p role="status">Password changed. Sign in with your new password.</p>
      )}
      <LoginForm next={next} />
    </div>
  );
}
