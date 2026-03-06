import mongoose from "mongoose";

const TimeRecordSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    userName: {
      type: String,
      required: true,
      trim: true,
    },
    userRole: {
      type: String,
      enum: ["user", "admin"],
      required: true,
    },
    action: {
      type: String,
      enum: ["in", "out"],
      required: true,
    },
    timestamp: {
      type: Date,
      required: true,
      index: true,
    },
    source: {
      type: String,
      enum: ["button", "manual"],
      default: "button",
    },
    createdBy: {
      type: String,
      default: "self",
      trim: true,
    },
    updatedBy: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { timestamps: true },
);

TimeRecordSchema.index({ userId: 1, timestamp: -1 });

export default mongoose.models.TimeRecord ||
  mongoose.model("TimeRecord", TimeRecordSchema);
