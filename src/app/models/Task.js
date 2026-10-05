import mongoose from "mongoose";

export const TASK_STATUS = ["open", "done"];
export const TASK_CATEGORIES = ["allgemein", "fahrzeug", "kunde", "werkstatt", "termin"];

const TaskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    /** Day the task is planned for, stored as YYYY-MM-DD (Europe/Berlin). */
    day: { type: String, required: true, index: true },
    status: { type: String, enum: TASK_STATUS, default: "open", index: true },
    category: { type: String, enum: TASK_CATEGORIES, default: "allgemein" },
    /** Optional owner – free text so it also works for people without a login. */
    assignee: { type: String, default: "", trim: true, maxlength: 80 },
    sort: { type: Number, default: 0 },
    createdBy: { type: String, default: "", trim: true },
    doneAt: { type: Date, default: null },
  },
  { timestamps: true },
);

TaskSchema.index({ day: 1, sort: 1, createdAt: 1 });

export default mongoose.models.Task || mongoose.model("Task", TaskSchema);
