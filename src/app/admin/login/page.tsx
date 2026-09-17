import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { LoginForm } from "./login-form";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const session = await getSession();
  if (session) redirect("/admin");
  const { next } = await searchParams;
  return (
    <div className="container admin-auth-page">
      <span className="eyebrow">CyberValue admin</span>
      <h1>Sign in</h1>
      <p className="muted">Private area. Not for public use.</p>
      <LoginForm next={next} />
    </div>
  );
}
