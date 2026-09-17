import { metadata as buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const generateMetadata = () =>
  buildMetadata("Admin", "Private administration area.", "/admin", true);

export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <div className="admin-root">{children}</div>;
}
