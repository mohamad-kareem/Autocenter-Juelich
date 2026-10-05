import dbConnect from "@/lib/mongodb";
import HeroImage from "@/app/models/HeroImage";

/** Fallback slides as long as no images have been uploaded in the staff area. */
export const DEFAULT_HERO_SLIDES = [
  {
    src: "/hero-showroom.jpg",
    alt: "Showroom von Autocenter Jülich mit Gebrauchtwagen",
    position: "object-[center_55%]",
  },
  {
    src: "/center.jpg",
    alt: "Showroom von Autocenter Jülich mit Verkauf und Finanzierung",
    position: "object-[center_40%]",
  },
  {
    src: "/center2.jpeg",
    alt: "Gebrauchtwagen im Showroom von Autocenter Jülich",
    position: "object-[center_60%]",
  },
];

/** Picture used in the "Autokauf mit gutem Gefühl" section as long as none was uploaded. */
export const DEFAULT_ABOUT_IMAGE = {
  src: "/center2.jpeg",
  alt: "Fahrzeuge im Showroom von Autocenter Jülich",
};

export function heroImageUrl(doc) {
  const stamp = doc?.updatedAt ? new Date(doc.updatedAt).getTime() : 0;
  return `/api/hero-images/${doc._id}/file${stamp ? `?v=${stamp}` : ""}`;
}

/** Slides for the homepage hero – uploaded images first, defaults as fallback. */
export async function getHeroSlides() {
  try {
    await dbConnect();
    const docs = await HeroImage.find({ active: true, slot: { $ne: "about" } })
      .select("-data")
      .sort({ sort: 1, createdAt: 1 })
      .limit(6)
      .maxTimeMS(2500)
      .lean();

    if (!docs.length) return DEFAULT_HERO_SLIDES;

    return docs.map((doc) => ({
      src: heroImageUrl(doc),
      alt: doc.alt || "Autocenter Jülich",
      // Uploaded photos are always shown centred and full-width as background.
      position: "object-center",
    }));
  } catch (err) {
    console.error("HERO_SLIDES_ERROR:", err?.message || err);
    return DEFAULT_HERO_SLIDES;
  }
}

/** Single picture for the "Autokauf mit gutem Gefühl" section. */
export async function getAboutImage() {
  try {
    await dbConnect();
    const doc = await HeroImage.findOne({ slot: "about", active: true })
      .select("-data")
      .sort({ sort: 1, createdAt: -1 })
      .maxTimeMS(2500)
      .lean();

    if (!doc) return DEFAULT_ABOUT_IMAGE;
    return { src: heroImageUrl(doc), alt: doc.alt || DEFAULT_ABOUT_IMAGE.alt };
  } catch (err) {
    console.error("ABOUT_IMAGE_ERROR:", err?.message || err);
    return DEFAULT_ABOUT_IMAGE;
  }
}

/** Mongo document -> plain object for the admin UI (never includes the binary). */
export function serializeHeroImage(doc) {
  if (!doc) return null;
  return {
    _id: String(doc._id),
    url: heroImageUrl(doc),
    fileName: doc.fileName || "",
    alt: doc.alt || "",
    slot: doc.slot || "hero",
    active: Boolean(doc.active),
    sort: Number(doc.sort || 0),
    bytes: Number(doc.bytes || 0),
    width: Number(doc.width || 0),
    height: Number(doc.height || 0),
    uploadedBy: doc.uploadedBy || "",
    createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : null,
  };
}
