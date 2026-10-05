export const runtime = "nodejs";

import dbConnect from "@/lib/mongodb";
import HeroImage from "@/app/models/HeroImage";
import { getAdminUser } from "@/lib/messages";
import { serializeHeroImage } from "@/lib/heroImages";

const MAX_UPLOAD_BYTES = 12 * 1024 * 1024; // 12 MB before compression
const MAX_PER_SLOT = { hero: 6, about: 1 };
const slotFilter = (slot) => (slot === "about" ? { slot: "about" } : { slot: { $ne: "about" } });
const readSlot = (value) => (String(value || "hero") === "about" ? "about" : "hero");
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

/** GET /api/hero-images?slot=hero|about – list for the staff area */
export async function GET(req) {
  const admin = await getAdminUser();
  if (!admin) return Response.json({ error: "Nicht berechtigt." }, { status: 401 });

  const slot = readSlot(new URL(req.url).searchParams.get("slot"));

  try {
    await dbConnect();
    const docs = await HeroImage.find(slotFilter(slot))
      .select("-data")
      .sort({ sort: 1, createdAt: 1 })
      .lean();
    return Response.json({ images: docs.map(serializeHeroImage), max: MAX_PER_SLOT[slot] });
  } catch (err) {
    console.error("HERO_LIST_ERROR:", err?.message || err);
    return Response.json({ error: "Bilder konnten nicht geladen werden." }, { status: 500 });
  }
}

/** POST /api/hero-images – multipart upload (field "file") */
export async function POST(req) {
  const admin = await getAdminUser();
  if (!admin) return Response.json({ error: "Nicht berechtigt." }, { status: 401 });

  try {
    const form = await req.formData();
    const file = form.get("file");
    const alt = String(form.get("alt") || "").trim().slice(0, 160);
    const slot = readSlot(form.get("slot"));

    if (!file || typeof file.arrayBuffer !== "function") {
      return Response.json({ error: "Keine Datei erhalten." }, { status: 400 });
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return Response.json(
        { error: "Nur JPG-, PNG-, WebP- oder AVIF-Bilder sind erlaubt." },
        { status: 400 },
      );
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      return Response.json({ error: "Das Bild ist größer als 12 MB." }, { status: 400 });
    }

    await dbConnect();
    const max = MAX_PER_SLOT[slot];
    const count = await HeroImage.countDocuments(slotFilter(slot));
    if (count >= max) {
      return Response.json(
        {
          error:
            max === 1
              ? "Es ist bereits ein Bild hinterlegt. Bitte zuerst das vorhandene löschen."
              : `Maximal ${max} Bilder. Bitte zuerst ein Bild löschen.`,
        },
        { status: 400 },
      );
    }

    const original = Buffer.from(await file.arrayBuffer());
    const processed = await optimize(original);

    const last = await HeroImage.findOne(slotFilter(slot)).sort({ sort: -1 }).select("sort").lean();

    const doc = await HeroImage.create({
      data: processed.data,
      contentType: processed.contentType,
      bytes: processed.data.length,
      width: processed.width,
      height: processed.height,
      fileName: String(file.name || "").slice(0, 160),
      alt: alt || "Showroom von Autocenter Jülich",
      slot,
      active: true,
      sort: (last?.sort ?? count - 1) + 1,
      uploadedBy: admin.name || admin.email || "Team",
    });

    const plain = doc.toObject();
    delete plain.data;
    return Response.json({ image: serializeHeroImage(plain) }, { status: 201 });
  } catch (err) {
    console.error("HERO_UPLOAD_ERROR:", err?.message || err);
    return Response.json({ error: "Upload fehlgeschlagen." }, { status: 500 });
  }
}

/**
 * Resize to max. 2400px wide and convert to WebP so the homepage stays fast.
 * If sharp is unavailable the original file is stored unchanged.
 */
async function optimize(buffer) {
  try {
    const sharp = (await import("sharp")).default;
    const image = sharp(buffer, { failOn: "none" }).rotate();
    const meta = await image.metadata();
    const pipeline = meta.width && meta.width > 2400 ? image.resize({ width: 2400 }) : image;
    const data = await pipeline.webp({ quality: 82 }).toBuffer();
    const outMeta = await sharp(data).metadata();
    return {
      data,
      contentType: "image/webp",
      width: outMeta.width || 0,
      height: outMeta.height || 0,
    };
  } catch (err) {
    console.error("HERO_OPTIMIZE_SKIPPED:", err?.message || err);
    return { data: buffer, contentType: "image/jpeg", width: 0, height: 0 };
  }
}
