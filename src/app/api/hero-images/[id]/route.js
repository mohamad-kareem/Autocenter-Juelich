export const runtime = "nodejs";

import mongoose from "mongoose";
import dbConnect from "@/lib/mongodb";
import HeroImage from "@/app/models/HeroImage";
import { getAdminUser } from "@/lib/messages";
import { serializeHeroImage } from "@/lib/heroImages";

const isValidId = (id) => mongoose.Types.ObjectId.isValid(String(id || ""));

/** PATCH /api/hero-images/:id – { alt?, active?, sort? } */
export async function PATCH(req, { params }) {
  const admin = await getAdminUser();
  if (!admin) return Response.json({ error: "Nicht berechtigt." }, { status: 401 });

  const { id } = await params;
  if (!isValidId(id)) return Response.json({ error: "Ungültige ID." }, { status: 400 });

  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Ungültige Anfrage." }, { status: 400 });
  }

  const update = {};
  if (typeof body?.alt === "string") update.alt = body.alt.trim().slice(0, 160);
  if (typeof body?.active === "boolean") update.active = body.active;
  if (typeof body?.sort === "number" && Number.isFinite(body.sort)) update.sort = body.sort;

  if (!Object.keys(update).length) {
    return Response.json({ error: "Keine Änderungen übergeben." }, { status: 400 });
  }

  try {
    await dbConnect();
    const doc = await HeroImage.findByIdAndUpdate(id, update, { new: true }).select("-data").lean();
    if (!doc) return Response.json({ error: "Bild nicht gefunden." }, { status: 404 });
    return Response.json({ image: serializeHeroImage(doc) });
  } catch (err) {
    console.error("HERO_PATCH_ERROR:", err?.message || err);
    return Response.json({ error: "Änderung konnte nicht gespeichert werden." }, { status: 500 });
  }
}

/** DELETE /api/hero-images/:id */
export async function DELETE(req, { params }) {
  const admin = await getAdminUser();
  if (!admin) return Response.json({ error: "Nicht berechtigt." }, { status: 401 });

  const { id } = await params;
  if (!isValidId(id)) return Response.json({ error: "Ungültige ID." }, { status: 400 });

  try {
    await dbConnect();
    const doc = await HeroImage.findByIdAndDelete(id).select("-data").lean();
    if (!doc) return Response.json({ error: "Bild nicht gefunden." }, { status: 404 });
    return Response.json({ ok: true });
  } catch (err) {
    console.error("HERO_DELETE_ERROR:", err?.message || err);
    return Response.json({ error: "Bild konnte nicht gelöscht werden." }, { status: 500 });
  }
}
