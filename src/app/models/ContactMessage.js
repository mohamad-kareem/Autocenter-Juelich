import mongoose from "mongoose";

export const MESSAGE_STATUS = ["new", "in_progress", "done", "archived"];

const ContactMessageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 160 },
    phone: { type: String, default: "", trim: true, maxlength: 60 },
    subject: { type: String, required: true, trim: true, maxlength: 120 },
    message: { type: String, required: true, trim: true, maxlength: 5000 },
    /** Optional vehicle reference, e.g. "Opel Crossland Edition (Nr. 403)" */
    vehicle: { type: String, default: "", trim: true, maxlength: 200 },
    /** mobile.de ad id, so the dashboard can link to /fahrzeuge/<id> */
    vehicleId: { type: String, default: "", trim: true, maxlength: 40 },

    status: { type: String, enum: MESSAGE_STATUS, default: "new", index: true },
    read: { type: Boolean, default: false, index: true },

    /** Did the notification e-mail go out? */
    emailSent: { type: Boolean, default: false },
    emailError: { type: String, default: "" },

    /** Who last changed the status */
    handledBy: { type: String, default: "", trim: true },
    handledAt: { type: Date, default: null },

    /** Internal note for the team (not visible to the customer) */
    note: { type: String, default: "", trim: true, maxlength: 2000 },
  },
  { timestamps: true },
);

ContactMessageSchema.index({ createdAt: -1 });
ContactMessageSchema.index({ status: 1, createdAt: -1 });

export default mongoose.models.ContactMessage ||
  mongoose.model("ContactMessage", ContactMessageSchema);
