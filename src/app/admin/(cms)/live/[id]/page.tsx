import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { requireAdmin } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { site } from "@/lib/site";
import { hostView } from "@/lib/live/data";
import { LiveHost } from "@/components/live/live-host";

export default async function LiveHostPage({
  params,
}: PageProps<"/admin/live/[id]">) {
  const { id } = await params;
  await requireAdmin(`/admin/live/${id}`);
  const db = getDb();
  if (!db) notFound();
  const view = await hostView(db, id);
  if (!view) notFound();
  const joinUrl = `${site.url.replace(/\/$/, "")}/live`;
  const svg = await QRCode.toString(`${joinUrl}?code=${view.code}`, {
    type: "svg",
    margin: 1,
    color: { dark: "#000000", light: "#ffffff" },
  });
  const qr = `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
  return (
    <LiveHost
      initial={view}
      joinUrl={joinUrl.replace(/^https?:\/\//, "")}
      qr={qr}
    />
  );
}
