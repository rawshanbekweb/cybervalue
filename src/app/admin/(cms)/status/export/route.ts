import { getSession } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { getDb } from "@/lib/db";
import { exportData, markExport } from "@/lib/system";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// A JSON copy of the learning data and content, downloaded by the admin.
export async function GET() {
  const headers = { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" };
  const session = await getSession();
  if (!session) return new Response("Unauthorized", { status: 401, headers });
  const db = getDb();
  if (!db) return new Response("Unavailable", { status: 503, headers });
  const data = await exportData(db);
  await markExport(db);
  await audit("data.export", session.user.id, "json");
  const date = data.exportedAt.slice(0, 10);
  return new Response(
    JSON.stringify(data, (_key, value) =>
      typeof value === "bigint" ? value.toString() : value,
    ),
    {
      headers: {
        ...headers,
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="cybervalue-export-${date}.json"`,
      },
    },
  );
}
