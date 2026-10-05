import mongoose from "mongoose";

/** Photos are stored separately so a request never hits MongoDB's 16 MB document limit. */
const TradeInPhotoSchema = new mongoose.Schema(
  {
    tradeIn: { type: mongoose.Schema.Types.ObjectId, ref: "TradeIn", required: true, index: true },
    data: { type: Buffer, required: true },
    contentType: { type: String, default: "image/webp" },
    width: { type: Number, default: 0 },
    height: { type: Number, default: 0 },
    sort: { type: Number, default: 0 },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export default mongoose.models.TradeInPhoto || mongoose.model("TradeInPhoto", TradeInPhotoSchema);
