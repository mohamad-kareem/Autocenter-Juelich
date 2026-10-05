import mongoose from "mongoose";

/** One page view. Kept for 30 days, then MongoDB deletes it automatically. */
const VisitSchema = new mongoose.Schema(
  {
    path: { type: String, required: true, maxlength: 300 },
    role: { type: String, enum: ["guest", "user", "admin"], default: "guest", index: true },
    name: { type: String, default: "", maxlength: 120 },
    /** Anonymous daily fingerprint (hash) – recognises the same guest without cookies or raw IPs. */
    visitor: { type: String, default: "", index: true },
    device: { type: String, default: "" },
    browser: { type: String, default: "" },
    os: { type: String, default: "" },
    referrer: { type: String, default: "", maxlength: 200 },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

VisitSchema.index({ createdAt: -1 });
VisitSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 30 });

export default mongoose.models.Visit || mongoose.model("Visit", VisitSchema);
