export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { MONITOR_COOKIE, checkMonitorLogin, monitorCredentials, signMonitorToken } from "@/lib/monitor";

/** POST /api/monitor/login – { name, pass } */
export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
  }

  if (!monitorCredentials()) {
    return NextResponse.json({ error: "Zugang ist nicht eingerichtet." }, { status: 503 });
  }

  if (!checkMonitorLogin(String(body?.name || ""), String(body?.pass || ""))) {
    await new Promise((r) => setTimeout(r, 600)); // slow down guessing
    return NextResponse.json({ error: "Name oder Passwort falsch." }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(MONITOR_COOKIE, await signMonitorToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
  return res;
}

/** DELETE /api/monitor/login – logout */
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(MONITOR_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
