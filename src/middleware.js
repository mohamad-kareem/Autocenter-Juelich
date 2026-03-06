import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

export async function middleware(request) {
  const token = request.cookies.get("token")?.value;
  const { pathname, origin } = request.nextUrl;

  const decoded = token ? await verifyToken(token) : null;

  const isLoginPage = pathname.startsWith("/login");
  const isDashboardPage = pathname.startsWith("/dashboard");
  const isSecretVisitorsPage = pathname.startsWith("/secret-visitors");

  const isAdminOnlyPage =
    pathname.startsWith("/dashboard/register") ||
    pathname.startsWith("/dashboard/zeiterfassung") ||
    pathname.startsWith("/api/auth/register") ||
    pathname.startsWith("/api/time/records") ||
    pathname.startsWith("/secret-visitors");

  if (isDashboardPage && !decoded) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isAdminOnlyPage && decoded?.role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (isLoginPage && decoded) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  const shouldSkipTracking =
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/visitors") ||
    pathname === "/favicon.ico" ||
    /\.(png|jpg|jpeg|svg|webp|gif|ico|css|js)$/.test(pathname);

  if (!shouldSkipTracking) {
    try {
      fetch(`${origin}/api/visitor-log`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          cookie: request.headers.get("cookie") || "",
        },
        body: JSON.stringify({
          page: pathname,
        }),
      }).catch(() => {});
    } catch (error) {
      console.error("TRACKING_MIDDLEWARE_ERROR:", error);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/login",
    "/",
    "/dashboard/:path*",
    "/secret-visitors",
    "/api/auth/register",
    "/api/time/:path*",
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
