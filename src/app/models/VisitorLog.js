import mongoose from "mongoose";

const VisitorLogSchema = new mongoose.Schema(
  {
    visitorName: {
      type: String,
      default: "Gast",
      trim: true,
    },
    page: {
      type: String,
      default: "/",
      trim: true,
    },
    visitedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true },
);

VisitorLogSchema.index({ visitedAt: -1 });

export default mongoose.models.VisitorLog ||
  mongoose.model("VisitorLog", VisitorLogSchema);
