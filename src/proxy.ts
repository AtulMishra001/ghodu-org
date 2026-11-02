import { NextResponse, type NextRequest } from "next/server";
import { blogIdExists, resolveBlogSlug, type BlogRoute } from "@/lib/server/blog-routing";
import { SESSION_COOKIE, SESSION_PATH, verifySession } from "@/lib/server/session";

// Slug of the prerendered "not found" post page, and the id of its admin twin.
const MISSING = "__not-found";

/**
 * Answers with a route's not-found page and a real 404. A rewrite can't do this:
 * its status is lost when the target page re-renders, so the page is fetched and
 * re-sent instead. This only runs for URLs that don't exist.
 */
async function answer404(path: string, request: NextRequest) {
  try {
    const cookie = request.headers.get("cookie");
    const page = await fetch(new URL(path, request.nextUrl.origin), { cache: "no-store", headers: cookie ? { cookie } : {} });
    return new NextResponse(page.body, { status: 404, headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store", "X-Robots-Tag": "noindex" } });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}

// Blog pages stream, so only here can a URL still answer with a real 301 or 404.
async function blogs(request: NextRequest, pathname: string) {
  if (pathname === "/blogs/page/1") return NextResponse.redirect(new URL("/blogs", request.url), 301);
  const match = pathname.match(/^\/blogs\/category\/([^/]+)\/page\/1$/);
  if (match) return NextResponse.redirect(new URL(`/blogs/category/${match[1]}`, request.url), 301);
  if (pathname.split("/").length !== 3) return NextResponse.next();

  // Link prefetches don't need the lookup; the navigation that follows gets it.
  if (request.headers.has("next-router-prefetch")) return NextResponse.next();

  const slug = pathname.slice("/blogs/".length);
  if (slug === MISSING) return NextResponse.next(); // answer404's own request
  let route: BlogRoute;
  try {
    route = await resolveBlogSlug(slug);
  } catch (err) {
    // Database down: let the page render its own fallback rather than fail here.
    console.error("[proxy] blog lookup failed:", err instanceof Error ? err.message : err);
    return NextResponse.next();
  }
  if (route.kind === "moved") return NextResponse.redirect(new URL(`/blogs/${route.slug}`, request.url), 301);
  if (route.kind === "missing") return answer404(`/blogs/${MISSING}`, request);
  return NextResponse.next();
}

// Early redirect for the admin area. This is a convenience, not the security
// boundary: every admin page and server action checks the session itself.
export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  if (pathname.startsWith("/blogs")) return blogs(request, pathname);

  const session = await verifySession(request.cookies.get(SESSION_COOKIE)?.value);
  const onLogin = pathname === "/admin/login";

  if (!session && !onLogin) {
    const url = new URL("/admin/login", request.url);
    url.searchParams.set("next", pathname + search);
    const res = NextResponse.redirect(url);
    if (request.cookies.has(SESSION_COOKIE)) res.cookies.set(SESSION_COOKIE, "", { path: SESSION_PATH, maxAge: 0 }); // expired or tampered
    return res;
  }
  if (session && onLogin) return NextResponse.redirect(new URL("/admin", request.url));

  const edit = pathname.match(/^\/admin\/blogs\/edit\/([^/]+)$/);
  if (edit && edit[1] !== MISSING && !request.headers.has("next-router-prefetch")) {
    const exists = await blogIdExists(edit[1]).catch(() => true);
    if (!exists) return answer404(`/admin/blogs/edit/${MISSING}`, request);
  }

  const res = NextResponse.next();
  res.headers.set("X-Robots-Tag", "noindex, nofollow");
  res.headers.set("Cache-Control", "private, no-store");
  return res;
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/blogs/:slug", "/blogs/page/1", "/blogs/category/:category/page/1"],
};
