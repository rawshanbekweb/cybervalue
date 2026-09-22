import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { collections } from "@/lib/site";
import { logoutAction } from "../actions";

export default async function AdminCmsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await requireAdmin();
  return (
    <div className="admin-shell container">
      <aside className="admin-sidebar">
        <Link href="/admin" className="admin-brand">
          cybervalue admin
        </Link>
        <nav className="admin-nav">
          <Link href="/admin">Dashboard</Link>
          {Object.entries(collections).map(([key, value]) => (
            <Link key={key} href={`/admin/${key}`}>
              {value.title}
            </Link>
          ))}
          <Link href="/admin/files">File library</Link>
          <Link href="/admin/account">Account settings</Link>
        </nav>
        <div className="admin-sidebar-footer">
          <span className="muted">{session.user.email}</span>
          <form action={logoutAction}>
            <button type="submit" className="button button-secondary">
              Log out
            </button>
          </form>
        </div>
      </aside>
      <main className="admin-content">{children}</main>
    </div>
  );
}
