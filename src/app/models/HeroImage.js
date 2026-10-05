import mongoose from "mongoose";

/** Where the picture is used: homepage background slider, or the "Warum wir" section. */
export const IMAGE_SLOTS = ["hero", "about"];

const HeroImageSchema = new mongoose.Schema(
  {
    /** Binary image data – kept in MongoDB so no extra storage service is needed. */
    data: { type: Buffer, required: true },
    contentType: { type: String, required: true, default: "image/webp" },
    bytes: { type: Number, default: 0 },
    width: { type: Number, default: 0 },
    height: { type: Number, default: 0 },

    /** Original file name, only for the admin list */
    fileName: { type: String, default: "", trim: true, maxlength: 160 },
    /** Alt text for screen readers / SEO */
    alt: { type: String, default: "", trim: true, maxlength: 160 },

    /** hero = Hintergrund-Slider, about = Bild im Abschnitt "Autokauf mit gutem Gefühl" */
    slot: { type: String, enum: IMAGE_SLOTS, default: "hero", index: true },

    active: { type: Boolean, default: true, index: true },
    sort: { type: Number, default: 0, index: true },

    uploadedBy: { type: String, default: "", trim: true },
  },
  { timestamps: true },
);

HeroImageSchema.index({ slot: 1, active: 1, sort: 1, createdAt: 1 });

export default mongoose.models.HeroImage || mongoose.model("HeroImage", HeroImageSchema);
