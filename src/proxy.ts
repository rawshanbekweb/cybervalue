import { NextResponse, type NextRequest } from "next/server";
import { isLocale, localeCookie, resolveLocale } from "@/lib/i18n";

// Visitors keep unprefixed URLs (/about). The language cookie only picks which
// prerendered copy (/uz/about or /en/about) answers, so pages stay static.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const url = request.nextUrl.clone();

  // Direct /uz/... or /en/... requests would duplicate content; use one URL.
  const first = pathname.split("/")[1];
  if (isLocale(first)) {
    url.pathname = pathname.slice(first.length + 1) || "/";
    return NextResponse.redirect(url, 308);
  }

  const locale = resolveLocale(request.cookies.get(localeCookie)?.value);
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  const response = NextResponse.rewrite(url);
  response.headers.append("Vary", "Cookie");
  return response;
}

export const config = {
  // Skip route handlers, the private CMS and student area, framework
  // internals and any path with a file extension (public assets, robots.txt,
  // sitemap.xml, icons).
  matcher: ["/((?!api/|admin|student|downloads/|media/|_next/|.*[.].*).*)"],
};
