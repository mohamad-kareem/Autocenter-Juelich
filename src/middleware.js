import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

export async function middleware(request) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  const decoded = token ? await verifyToken(token) : null;

  const isLoginPage = pathname.startsWith("/login");
  const isDashboardPage = pathname.startsWith("/dashboard");
  const isAdminOnlyPage =
    pathname.startsWith("/dashboard/register") ||
    pathname.startsWith("/dashboard/zeiterfassung") ||
    pathname.startsWith("/api/auth/register") ||
    pathname.startsWith("/api/time/records");

  if (isDashboardPage && !decoded) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isAdminOnlyPage && decoded?.role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (isLoginPage && decoded) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/login",
    "/dashboard/:path*",
    "/api/auth/register",
    "/api/time/:path*",
  ],
};
