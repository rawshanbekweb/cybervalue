import { env } from "@/lib/env";
import { site } from "@/lib/site";

// RFC 9116. Rebuilt daily so Expires always lies within the next year.
export const revalidate = 86400;

export function GET() {
  if (!env.SECURITY_CONTACT) return new Response("Not found", { status: 404 });
  const expires = new Date(Date.now() + 180 * 86_400_000);
  const body = [
    `Contact: ${env.SECURITY_CONTACT}`,
    `Expires: ${expires.toISOString().slice(0, 19)}Z`,
    "Preferred-Languages: uz, en",
    `Canonical: ${site.url}/.well-known/security.txt`,
    "",
  ].join("\n");
  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
