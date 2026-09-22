import { requireAdmin } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { AccountForms } from "@/components/admin/account-forms";

export default async function AccountPage() {
  const session = await requireAdmin("/admin/account");
  const count =
    (await getDb()?.session.count({
      where: { userId: session.user.id, expiresAt: { gt: new Date() } },
    })) ?? 0;
  return (
    <div className="admin-page">
      <h1>Account settings</h1>
      <p>
        {session.user.name} · {session.user.email}
      </p>
      <p className="muted">{count} active sessions</p>
      <AccountForms />
    </div>
  );
}
