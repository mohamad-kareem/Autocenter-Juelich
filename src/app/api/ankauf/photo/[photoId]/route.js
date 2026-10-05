export const runtime = "nodejs";

import mongoose from "mongoose";
import dbConnect from "@/lib/mongodb";
import TradeInPhoto from "@/app/models/TradeInPhoto";
import { getStaffUser } from "@/lib/messages";

/** GET /api/ankauf/photo/:photoId – staff only (customer photos are private) */
export async function GET(req, { params }) {
  const user = await getStaffUser();
  if (!user) return new Response("Nicht angemeldet.", { status: 401 });

  const { photoId } = await params;
  if (!mongoose.Types.ObjectId.isValid(String(photoId || ""))) return new Response("Ungültige ID.", { status: 400 });

  try {
    await dbConnect();
    const photo = await TradeInPhoto.findById(photoId).lean();
    if (!photo) return new Response("Nicht gefunden.", { status: 404 });
    return new Response(photo.data.buffer ? Buffer.from(photo.data.buffer) : photo.data, {
      headers: {
        "Content-Type": photo.contentType || "image/webp",
        "Cache-Control": "private, max-age=86400",
      },
    });
  } catch (err) {
    console.error("ANKAUF_PHOTO_ERROR:", err?.message || err);
    return new Response("Fehler.", { status: 500 });
  }
}
