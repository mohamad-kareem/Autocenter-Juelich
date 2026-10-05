import mongoose from "mongoose";

/** Status flow of a purchase request ("Ankauf") */
export const TRADEIN_STATUS = ["new", "checking", "offer", "bought", "declined"];

const TradeInSchema = new mongoose.Schema(
  {
    // Vehicle
    brand: { type: String, required: true, trim: true, maxlength: 60 },
    model: { type: String, required: true, trim: true, maxlength: 80 },
    year: { type: Number, min: 1950, max: 2100 },
    mileage: { type: Number, min: 0, max: 2_000_000 },
    fuel: { type: String, default: "", maxlength: 30 },
    gearbox: { type: String, default: "", maxlength: 30 },
    power: { type: Number, min: 0, max: 2000 },
    condition: { type: String, default: "", maxlength: 30 },
    accidentFree: { type: String, enum: ["ja", "nein", "unbekannt", ""], default: "" },
    tuev: { type: String, default: "", maxlength: 7 }, // YYYY-MM
    askingPrice: { type: Number, min: 0, max: 10_000_000 },
    description: { type: String, default: "", maxlength: 3000 },

    // Seller
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 160 },
    phone: { type: String, default: "", trim: true, maxlength: 60 },
    zip: { type: String, default: "", trim: true, maxlength: 10 },

    photoCount: { type: Number, default: 0 },

    // Internal handling
    status: { type: String, enum: TRADEIN_STATUS, default: "new", index: true },
    read: { type: Boolean, default: false, index: true },
    offerPrice: { type: Number, min: 0, max: 10_000_000 },
    note: { type: String, default: "", maxlength: 3000 },
    handledBy: { type: String, default: "" },
    handledAt: { type: Date, default: null },
    emailSent: { type: Boolean, default: false },
  },
  { timestamps: true },
);

TradeInSchema.index({ createdAt: -1 });

export default mongoose.models.TradeIn || mongoose.model("TradeIn", TradeInSchema);
