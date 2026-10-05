// Shared labels and formatters for vehicle data coming from mobile.de

export const FUEL_LABELS = {
  PETROL: "Benzin",
  DIESEL: "Diesel",
  ELECTRICITY: "Elektro",
  HYBRID: "Hybrid (Benzin)",
  HYBRID_DIESEL: "Hybrid (Diesel)",
  LPG: "Autogas (LPG)",
  CNG: "Erdgas (CNG)",
  ETHANOL: "Ethanol",
  HYDROGENIUM: "Wasserstoff",
  OTHER: "Sonstige",
};

export const GEARBOX_LABELS = {
  AUTOMATIC_GEAR: "Automatik",
  SEMIAUTOMATIC_GEAR: "Halbautomatik",
  MANUAL_GEAR: "Schaltgetriebe",
};

export const fuelLabel = (v) => (v ? FUEL_LABELS[v] || v : null);
export const gearboxLabel = (v) => (v ? GEARBOX_LABELS[v] || v : null);

const nf = new Intl.NumberFormat("de-DE");
export const formatNumber = (n) => nf.format(Number(n || 0));
export const formatPrice = (n) => `${nf.format(Math.round(Number(n || 0)))} €`;
export const formatKm = (n) => `${nf.format(Number(n || 0))} km`;

export function isRemoteImage(src) {
  return typeof src === "string" && /^https?:\/\//i.test(src);
}

/** "DACIA Sandero III Stepway*wenig km*Allwetter" -> "DACIA Sandero III Stepway" */
export function shortTitle(text, count = 4) {
  const clean = String(text || "")
    .replace(/\*/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!clean) return "";
  return clean.split(" ").slice(0, count).join(" ");
}

/** Capitalise brand names that mobile.de delivers in upper case (OPEL -> Opel). */
export function prettyBrand(brand) {
  const b = String(brand || "").trim();
  if (!b) return "";
  const keepUpper = new Set(["BMW", "VW", "MG", "DS", "BYD", "GMC", "MINI"]);
  if (keepUpper.has(b.toUpperCase()) && b.length <= 4) {
    return b.toUpperCase() === "MINI" ? "MINI" : b.toUpperCase();
  }
  return b
    .toLowerCase()
    .split(/([\s-])/)
    .map((p) => (p.length > 1 ? p[0].toUpperCase() + p.slice(1) : p))
    .join("");
}

export const PRICE_STEPS = [
  3000, 5000, 7500, 10000, 12500, 15000, 20000, 25000, 30000, 40000,
];

function formatYYYYMM(v) {
  const s = String(v || "");
  return s.length === 6 ? `${s.slice(4, 6)}/${s.slice(0, 4)}` : null;
}

/**
 * Lean, serialisable car object for client components (drops the big raw ad).
 * Accepts the output of mapAdToUiCar().
 */
export function toCardCar(car) {
  const raw = car?.raw || {};
  const brand = prettyBrand(car.brand);
  const make = String(raw.make || car.brand || "").trim();
  // mobile.de titles often look like "Crossland Edition*wenig km*Kamera" – keep the part before the first "*"
  let model = String(raw.modelDescription || raw.model || "").split("*")[0].trim();
  if (make && model.toUpperCase().startsWith(make.toUpperCase())) {
    model = model.slice(make.length).trim();
  }
  return {
    id: car.id,
    brand: String(car.brand || "").trim(),
    brandLabel: brand,
    model: shortTitle(model, 6),
    title: [brand, shortTitle(model, 6)].filter(Boolean).join(" ") || car.title,
    price: Number(car.price || 0),
    year: car.year ? Number(car.year) : null,
    firstRegistration: formatYYYYMM(raw.firstRegistration),
    km: typeof car.km === "number" ? car.km : null,
    fuel: car.fuel || null,
    gearbox: car.gearbox || null,
    power: car.power || null,
    image: car.images?.[0] || "/placeholder-car.svg",
    imageCount: Array.isArray(car.images) ? car.images.length : 0,
    reserved: Boolean(car.isSold),
    warranty: raw.warranty === true,
    category: raw.category || null,
    createdAt: raw.creationDate || raw.modificationDate || null,
  };
}
