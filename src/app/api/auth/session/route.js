export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

/**
 * GET /api/auth/session
 * Lightweight session check for the public navbar: reads the JWT only,
 * no database round-trip. Returns { user: null } when not logged in.
 */
export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) {
    return NextResponse.json({ user: null }, { headers: { "Cache-Control": "no-store" } });
  }

  const decoded = await verifyToken(token);
  if (!decoded?.userId) {
    return NextResponse.json({ user: null }, { headers: { "Cache-Control": "no-store" } });
  }

  return NextResponse.json(
    {
      user: {
        name: decoded.name || "",
        email: decoded.email || "",
        role: decoded.role || "user",
      },
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
