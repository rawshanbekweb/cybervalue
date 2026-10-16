import { getHomePortrait } from "@/lib/home-portrait";
import { allowRequest } from "@/lib/rate-limit";
import bundled from "@/components/portrait-points.json";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// The home page portrait's particle points: the one an admin uploaded, or the
// bundled default. The page links it with ?v=<upload time>, so a versioned URL
// can be cached for good; a bare one is only cached briefly.
export async function GET(request: Request) {
  if (!allowRequest("portrait-read", Date.now(), 300, 60_000))
    return new Response("Try again shortly.", {
      status: 429,
      headers: { "Cache-Control": "no-store" },
    });
  const custom = await getHomePortrait();
  const versioned = new URL(request.url).searchParams.has("v");
  return Response.json(custom?.data ?? bundled, {
    headers: {
      "Cache-Control":
        custom && versioned
          ? "public, max-age=31536000, immutable"
          : "public, max-age=60, s-maxage=60",
    },
  });
}
