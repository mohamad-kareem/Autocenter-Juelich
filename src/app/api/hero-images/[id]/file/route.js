export const runtime = "nodejs";

import mongoose from "mongoose";
import dbConnect from "@/lib/mongodb";
import HeroImage from "@/app/models/HeroImage";

/** GET /api/hero-images/:id/file – public, delivers the image itself */
export async function GET(req, { params }) {
  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(String(id || ""))) {
    return new Response("Not found", { status: 404 });
  }

  try {
    await dbConnect();
    const doc = await HeroImage.findById(id).select("data contentType updatedAt").lean();
    if (!doc?.data) return new Response("Not found", { status: 404 });

    const body = Buffer.isBuffer(doc.data) ? doc.data : Buffer.from(doc.data.buffer || doc.data);

    return new Response(body, {
      headers: {
        "Content-Type": doc.contentType || "image/webp",
        "Content-Length": String(body.length),
        "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
      },
    });
  } catch (err) {
    console.error("HERO_FILE_ERROR:", err?.message || err);
    return new Response("Server error", { status: 500 });
  }
}
