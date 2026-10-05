export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/mongodb";
import User from "@/app/models/User";
import { signToken, verifyToken } from "@/lib/auth";

const PASSWORD_RULE = /^(?=.*[!@#$%^&*()_\-+=[\]{};':"\\|,.<>/?`~]).{6,}$/;

async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  return token ? await verifyToken(token) : null;
}

/** GET /api/profile – own profile */
export async function GET() {
  const current = await getCurrentUser();
  if (!current?.userId) {
    return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  }

  try {
    await dbConnect();
    const user = await User.findById(current.userId).select("-password").lean();
    if (!user) return NextResponse.json({ error: "Benutzer nicht gefunden." }, { status: 404 });

    return NextResponse.json({
      user: {
        id: String(user._id),
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    console.error("PROFILE_GET_ERROR:", err?.message || err);
    return NextResponse.json({ error: "Profil konnte nicht geladen werden." }, { status: 500 });
  }
}

/** PATCH /api/profile – change own name / e-mail / password */
export async function PATCH(req) {
  const current = await getCurrentUser();
  if (!current?.userId) {
    return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
  }

  // The login e-mail is fixed – only the name and the password can be changed here.
  const name = typeof body?.name === "string" ? body.name.trim().slice(0, 80) : null;
  const newPassword = typeof body?.newPassword === "string" ? body.newPassword.trim() : "";
  const currentPassword = typeof body?.currentPassword === "string" ? body.currentPassword : "";

  if (name !== null && name.length < 2) {
    return NextResponse.json({ error: "Der Name muss mindestens 2 Zeichen haben." }, { status: 400 });
  }
  if (newPassword && !PASSWORD_RULE.test(newPassword)) {
    return NextResponse.json(
      { error: "Das neue Passwort braucht mindestens 6 Zeichen und ein Sonderzeichen." },
      { status: 400 },
    );
  }

  try {
    await dbConnect();
    const user = await User.findById(current.userId);
    if (!user) return NextResponse.json({ error: "Benutzer nicht gefunden." }, { status: 404 });

    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ error: "Bitte das aktuelle Passwort eingeben." }, { status: 400 });
      }
      const matches = await bcrypt.compare(currentPassword, user.password);
      if (!matches) {
        return NextResponse.json({ error: "Das aktuelle Passwort ist falsch." }, { status: 400 });
      }
    }

    if (name !== null) user.name = name;
    if (newPassword) user.password = await bcrypt.hash(newPassword, 10);

    await user.save();

    // Refresh the session cookie so the new name/e-mail is shown everywhere
    const token = await signToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
    });

    const response = NextResponse.json({
      ok: true,
      user: { id: String(user._id), name: user.name, email: user.email, role: user.role },
    });

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (err) {
    console.error("PROFILE_PATCH_ERROR:", err?.message || err);
    return NextResponse.json({ error: "Profil konnte nicht gespeichert werden." }, { status: 500 });
  }
}
