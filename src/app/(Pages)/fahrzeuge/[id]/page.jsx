import Link from "next/link";
import { notFound } from "next/navigation";
import ImageSlider from "./ImageSlider";
import { fetchSingleAd, fetchSellerAds } from "@/lib/mobilede";

const formatPrice = (n) =>
  new Intl.NumberFormat("de-DE").format(Number(n || 0));
const formatKm = (n) => new Intl.NumberFormat("de-DE").format(Number(n || 0));

function formatYYYYMM(yyyymm) {
  if (!yyyymm || typeof yyyymm !== "string" || yyyymm.length !== 6) return null;
  const y = yyyymm.slice(0, 4);
  const m = yyyymm.slice(4, 6);
  return `${m}/${y}`;
}

function kwToPs(kw) {
  if (kw == null || Number.isNaN(Number(kw))) return null;
  return Math.round(Number(kw) * 1.35962);
}

function labelYesNo(v) {
  if (v === true) return "Ja";
  if (v === false) return "Nein";
  return null;
}

function isNonEmpty(v) {
  if (v == null) return false;
  if (typeof v === "string") return v.trim().length > 0;
  if (Array.isArray(v)) return v.length > 0;
  if (typeof v === "object") return Object.keys(v).length > 0;
  return true;
}

function enumLabel(value, map) {
  if (!value) return null;
  return map[value] || value;
}

function buildField(label, value) {
  if (!isNonEmpty(value)) return null;
  return { label, value: String(value) };
}

/**
 * Keep titles short:
 * "DACIA Sandero III Stepway*wenig km*Allwetter*Extras"
 * -> "DACIA Sandero III Stepway"
 */
function firstWords(text, count = 4) {
  const clean = String(text || "")
    .replace(/\*/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!clean) return "";
  return clean.split(" ").slice(0, count).join(" ");
}

/**
 * mobile.de description uses CREOLE-like tokens:
 * - "\\\\": linebreak
 * - "----": separator line
 * - "* item": bullet
 * - "**bold**": bold
 */
function parseDescription(desc) {
  if (!desc || typeof desc !== "string") return [];

  const text = desc.replaceAll("\\\\", "\n");

  const rawBlocks = text
    .split(/\n?----+\n?/g)
    .map((b) => b.trim())
    .filter(Boolean);

  return rawBlocks.map((block) => {
    const lines = block
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    const bullets = [];
    const normalLines = [];

    for (const line of lines) {
      if (line.startsWith("* ")) bullets.push(line.slice(2).trim());
      else normalLines.push(line);
    }

    return { normalLines, bullets };
  });
}

function renderInlineBold(text) {
  const parts = [];
  let i = 0;

  while (i < text.length) {
    const start = text.indexOf("**", i);
    if (start === -1) {
      parts.push({ type: "text", value: text.slice(i) });
      break;
    }
    const end = text.indexOf("**", start + 2);
    if (end === -1) {
      parts.push({ type: "text", value: text.slice(i) });
      break;
    }

    if (start > i) parts.push({ type: "text", value: text.slice(i, start) });
    parts.push({ type: "bold", value: text.slice(start + 2, end) });
    i = end + 2;
  }

  return parts.map((p, idx) =>
    p.type === "bold" ? (
      <strong key={idx} className="text-[var(--ac-text)] font-semibold">
        {p.value}
      </strong>
    ) : (
      <span key={idx}>{p.value}</span>
    ),
  );
}

/* -----------------------------
   Specs UI (LESS space, better)
------------------------------ */

function SpecRow({ label, value }) {
  return (
    <div className="grid grid-cols-[1fr_auto] items-baseline gap-4 py-2.5 border-b border-white/10 last:border-b-0">
      <span className="text-[11px] sm:text-xs text-[var(--ac-muted)]">
        {label}
      </span>
      <span className="text-[11px] sm:text-xs font-medium text-[var(--ac-text)] text-right">
        {value}
      </span>
    </div>
  );
}

function SpecSection({ title, items }) {
  const clean = (items || []).filter(Boolean);
  if (!clean.length) return null;

  return (
    <section className="rounded-2xl border border-white/10 bg-[rgba(10,20,45,0.35)] overflow-hidden">
      <div className="px-4 sm:px-5 py-3 border-b border-white/10">
        <h2 className="text-sm sm:text-base font-semibold text-[var(--ac-text)]">
          {title}
        </h2>
      </div>
      <div className="px-4 sm:px-5 py-1">
        {clean.map((it) => (
          <SpecRow key={it.label} label={it.label} value={it.value} />
        ))}
      </div>
    </section>
  );
}

/* ---------------------------------------
   (Optional) If you still need SEO later,
   keep generateMetadata somewhere else.
   You asked "no IDs & meta", so removed.
---------------------------------------- */

export default async function CarDetailPage({ params }) {
  const { id } = await params;
  if (!id) notFound();

  const ad = await fetchSingleAd(id);
  if (!ad) notFound();

  // Images
  const images = Array.isArray(ad.images)
    ? ad.images.map((i) => i?.ref).filter(Boolean)
    : [];

  // Build a long title, then shorten to 4 words
  const rawTitle = `${ad.make || ""} ${
    ad.modelDescription || ad.model || ""
  }`.trim();
  const title = firstWords(rawTitle, 4) || rawTitle || "Fahrzeug";

  // Price
  const priceGross = ad?.price?.consumerPriceGross;
  const priceText = priceGross ? `${formatPrice(priceGross)} €` : null;

  // Core quick values
  const firstReg = formatYYYYMM(ad.firstRegistration);
  const hu = formatYYYYMM(ad.generalInspection);
  const mileage = ad.mileage != null ? `${formatKm(ad.mileage)} km` : null;

  // Enum maps
  const gearboxMap = {
    MANUAL_GEAR: "Schaltung",
    AUTOMATIC_GEAR: "Automatik",
    SEMIAUTOMATIC_GEAR: "Halbautomatik",
  };
  const fuelMap = {
    PETROL: "Benzin",
    DIESEL: "Diesel",
    ELECTRICITY: "Elektro",
    HYBRID: "Hybrid",
    HYBRID_DIESEL: "Hybrid (Diesel)",
    LPG: "LPG",
    CNG: "CNG",
    ETHANOL: "Ethanol",
    HYDROGENIUM: "Wasserstoff",
  };
  const doorsMap = {
    TWO_OR_THREE: "2/3",
    FOUR_OR_FIVE: "4/5",
    SIX_OR_SEVEN: "6/7",
  };
  const driveMap = {
    FRONT: "Frontantrieb",
    REAR: "Heckantrieb",
    ALL_WHEEL: "Allrad",
  };

  // Sections (NO IDs & Meta)
  const sectionVehicle = [
    buildField("Fahrzeugklasse", ad.vehicleClass),
    buildField("Kategorie", ad.category),
    buildField("Marke", ad.make),
    buildField("Modell", ad.model),
    buildField("Erstzulassung", firstReg),
    buildField("Kilometerstand", mileage),
    buildField("Sitze", ad.seats),
    buildField("Türen", enumLabel(ad.doors, doorsMap)),
    buildField("Antrieb", enumLabel(ad.driveType, driveMap)),
  ];

  const ps = kwToPs(ad.power);
  const sectionEngine = [
    buildField(
      "Leistung",
      ad.power != null ? `${ad.power} kW${ps ? ` (${ps} PS)` : ""}` : null,
    ),
    buildField(
      "Hubraum",
      ad.cubicCapacity != null ? `${ad.cubicCapacity} cm³` : null,
    ),
    buildField("Zylinder", ad.cylinder),
    buildField("Getriebe", enumLabel(ad.gearbox, gearboxMap)),
    buildField("Kraftstoff", enumLabel(ad.fuel, fuelMap)),
    buildField("E10 geeignet", labelYesNo(ad.e10Enabled)),
    buildField(
      "Tankvolumen",
      ad.fuelTankVolume != null ? `${ad.fuelTankVolume} l` : null,
    ),
  ];

  const sectionEnv = [
    buildField("Schadstoffklasse", ad.emissionClass),
    buildField("Umweltplakette", ad.emissionSticker),
    buildField(
      "CO₂ (komb.)",
      ad?.emissions?.combined?.co2 != null
        ? `${ad.emissions.combined.co2} g/km`
        : null,
    ),
    buildField(
      "Verbrauch (komb.)",
      ad?.consumptions?.fuel?.combined != null
        ? `${ad.consumptions.fuel.combined} l/100km`
        : null,
    ),
  ];

  const sectionColors = [
    buildField("Außenfarbe", ad.exteriorColor),
    buildField("Herstellerfarbe", ad.manufacturerColorName),
    buildField("Metallic", labelYesNo(ad.metallic)),
    buildField("Innenfarbe", ad.interiorColor),
    buildField("Innenmaterial", ad.interiorType),
    buildField("Ausstattungslinie", ad.trimLine),
    buildField("Baureihe", ad.modelRange),
  ];

  const sectionService = [
    buildField("HU (bis)", hu),
    buildField("Scheckheft gepflegt", labelYesNo(ad.fullServiceHistory)),
    buildField("Unfall/Schaden unrepariert", labelYesNo(ad.damageUnrepaired)),
    buildField("Fahrbereit", labelYesNo(ad.roadworthy)),
    buildField("Garantie", labelYesNo(ad.warranty)),
  ];

  // Features (compact)
  const featureBooleans = [
    ["ABS", ad.abs],
    ["ESP", ad.esp],
    ["Bluetooth", ad.bluetooth],
    ["Freisprecheinrichtung", ad.handsFreePhoneSystem],
    ["Wegfahrsperre", ad.immobilizer],
    ["Multifunktionslenkrad", ad.multifunctionalWheel],
    ["Bordcomputer", ad.onBoardComputer],
    ["Sitzheizung", ad.electricHeatedSeats],
    ["Beheizte Frontscheibe", ad.heatedWindshield],
    ["Lederlenkrad", ad.leatherSteeringWheel],
    ["Touchscreen", ad.touchscreen],
    ["USB", ad.usb],
    ["Apple CarPlay", ad.carplay],
    ["Ganzjahresreifen", ad.allSeasonTires],
  ].filter(([, v]) => v === true);

  const featureArrays = [
    buildField(
      "Radio",
      Array.isArray(ad.radio) && ad.radio.length ? ad.radio.join(", ") : null,
    ),
    buildField(
      "Parkassistenten",
      Array.isArray(ad.parkingAssistants) && ad.parkingAssistants.length
        ? ad.parkingAssistants.join(", ")
        : null,
    ),
    buildField(
      "Heizung (Typen)",
      Array.isArray(ad.heating) && ad.heating.length
        ? ad.heating.join(", ")
        : null,
    ),
    buildField("Airbags", ad.airbag),
    buildField("Tagfahrlicht", ad.daytimeRunningLamps),
  ];

  const sectionFeatures = [
    ...featureBooleans.map(([name]) => buildField(name, "Ja")),
    ...featureArrays,
  ];

  const sectionTow = [
    buildField("Leergewicht", ad.weight != null ? `${ad.weight} kg` : null),
    buildField(
      "Anhängelast gebremst",
      ad.trailerLoadBraked != null ? `${ad.trailerLoadBraked} kg` : null,
    ),
    buildField(
      "Anhängelast ungebremst",
      ad.trailerLoadUnbraked != null ? `${ad.trailerLoadUnbraked} kg` : null,
    ),
  ];

  // Description blocks
  const descBlocks = parseDescription(ad.description);

  // Similar vehicles
  let similar = [];
  try {
    const all = await fetchSellerAds();
    similar = (Array.isArray(all) ? all : [])
      .filter((x) => String(x?.mobileAdId) !== String(ad.mobileAdId))
      .slice(0, 3)
      .map((x) => {
        const imgs = Array.isArray(x.images)
          ? x.images.map((i) => i?.ref).filter(Boolean)
          : [];
        const longT = `${x.make || ""} ${
          x.modelDescription || x.model || ""
        }`.trim();
        const shortT = firstWords(longT, 4) || longT || "Fahrzeug";
        const p = x?.price?.consumerPriceGross || null;
        return {
          id: String(x.mobileAdId),
          title: shortT,
          image: imgs[0] || "/placeholder-car.jpg",
          year: formatYYYYMM(x.firstRegistration),
          km: x.mileage,
          fuel: enumLabel(x.fuel, fuelMap),
          price: p,
        };
      });
  } catch {
    similar = [];
  }

  return (
    <div className="ac-page">
      <div className="px-4 sm:px-6 lg:px-12 py-6 sm:py-10 lg:py-14">
        <div className="mx-auto w-full max-w-7xl">
          {/* Breadcrumb */}
          <div className="mb-5 sm:mb-8">
            <Link
              href="/fahrzeuge"
              className="text-xs sm:text-sm text-[var(--ac-muted)] hover:text-[var(--ac-text)] transition flex items-center gap-2"
            >
              <span>←</span>
              <span>Zurück zur Übersicht</span>
            </Link>
          </div>

          <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
            {/* Images */}
            <div className="space-y-4">
              <ImageSlider images={images} alt={title || "Fahrzeug"} />
            </div>

            {/* Right Column */}
            <div className="space-y-5 sm:space-y-6">
              {/* Title + Price */}
              <div>
                <h1 className="text-xl sm:text-3xl lg:text-4xl font-bold text-[var(--ac-text)] leading-tight">
                  {title}
                </h1>

                <div className="mt-3 flex flex-wrap items-baseline gap-2 sm:gap-3">
                  {priceText && (
                    <span className="text-2xl sm:text-4xl font-light text-[var(--accent)]">
                      {priceText}
                    </span>
                  )}

                  {ad.condition && (
                    <span className="text-[11px] sm:text-xs font-semibold text-white/80 bg-white/5 px-3 py-1 rounded-full border border-white/10">
                      {ad.condition}
                    </span>
                  )}

                  {ad.warranty === true && (
                    <span className="text-[11px] sm:text-xs font-semibold text-emerald-300 bg-emerald-400/10 px-3 py-1 rounded-full border border-emerald-300/20">
                      Garantie
                    </span>
                  )}
                </div>

                <div className="mt-2 text-[11px] sm:text-sm text-[var(--ac-muted-2)]">
                  {firstReg ? <span>Erstzulassung: {firstReg}</span> : null}
                  {mileage ? (
                    <span className="ml-2 sm:ml-3">• Kilometer: {mileage}</span>
                  ) : null}
                </div>
              </div>

              {/* Quick Boxes (more compact on mobile) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 pt-1">
                {firstReg ? (
                  <div className="bg-[rgba(10,20,45,0.35)] border border-white/10 rounded-xl p-3 text-center">
                    <span className="block text-[10px] sm:text-xs text-[var(--ac-muted)]">
                      Erstzulassung
                    </span>
                    <span className="text-sm sm:text-lg font-semibold text-[var(--ac-text)]">
                      {firstReg}
                    </span>
                  </div>
                ) : null}

                {mileage ? (
                  <div className="bg-[rgba(10,20,45,0.35)] border border-white/10 rounded-xl p-3 text-center">
                    <span className="block text-[10px] sm:text-xs text-[var(--ac-muted)]">
                      Kilometer
                    </span>
                    <span className="text-sm sm:text-lg font-semibold text-[var(--ac-text)]">
                      {mileage}
                    </span>
                  </div>
                ) : null}

                {ad.power != null ? (
                  <div className="bg-[rgba(10,20,45,0.35)] border border-white/10 rounded-xl p-3 text-center">
                    <span className="block text-[10px] sm:text-xs text-[var(--ac-muted)]">
                      Leistung
                    </span>
                    <span className="text-sm sm:text-lg font-semibold text-[var(--ac-text)]">
                      {ps ? `${ps} PS` : `${ad.power} kW`}
                    </span>
                  </div>
                ) : null}

                {hu ? (
                  <div className="bg-[rgba(10,20,45,0.35)] border border-white/10 rounded-xl p-3 text-center">
                    <span className="block text-[10px] sm:text-xs text-[var(--ac-muted)]">
                      HU
                    </span>
                    <span className="text-sm sm:text-lg font-semibold text-[var(--ac-text)]">
                      {hu}
                    </span>
                  </div>
                ) : null}
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Link
                  href="/kontakt"
                  className="ac-btn-primary flex-1 py-3 sm:py-4 rounded-xl font-semibold text-sm sm:text-base text-center"
                >
                  Finanzierung anfragen
                </Link>

                <Link
                  href="/kontakt"
                  className="flex-1 border border-white/10 bg-white/5 py-3 sm:py-4 rounded-xl font-semibold text-sm sm:text-base text-[var(--ac-text)] hover:bg-white/10 transition text-center"
                >
                  Probefahrt vereinbaren
                </Link>
              </div>

              {/* Contact Note */}
              <p className="text-xs sm:text-sm text-[var(--ac-muted-2)] text-center sm:text-left leading-relaxed">
                Haben Sie Fragen zu diesem Fahrzeug?
                <br className="hidden sm:block" />
                Kontaktieren Sie uns gerne unter{" "}
                <a
                  href="tel:+492461234567"
                  className="text-[var(--accent)] hover:underline"
                >
                  02461 1234567
                </a>
              </p>
            </div>
          </div>

          {/* Specs (LESS SPACE + nicer layout) */}
          <div className="mt-10 sm:mt-12 grid gap-4 sm:gap-6 lg:grid-cols-2">
            <SpecSection title="Fahrzeug" items={sectionVehicle} />
            <SpecSection title="Motor & Antrieb" items={sectionEngine} />
            <SpecSection title="Verbrauch & Emissionen" items={sectionEnv} />
            <SpecSection title="Farben & Innenraum" items={sectionColors} />
            <SpecSection title="Zustand & Service" items={sectionService} />
            <SpecSection title="Ausstattung" items={sectionFeatures} />
            <SpecSection title="Gewicht & Anhängelast" items={sectionTow} />
          </div>

          {/* Description */}
          {descBlocks.length > 0 && (
            <div className="mt-10 sm:mt-12 border-t border-white/10 pt-7 sm:pt-8">
              <h2 className="text-base sm:text-xl font-semibold text-[var(--ac-text)] mb-4">
                Beschreibung
              </h2>

              <div className="space-y-4 sm:space-y-6">
                {descBlocks.map((b, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl border border-white/10 bg-[rgba(10,20,45,0.35)] p-4 sm:p-6"
                  >
                    {b.normalLines.length > 0 && (
                      <div className="space-y-2 sm:space-y-3 text-[11px] sm:text-sm text-[var(--ac-muted-2)] leading-relaxed">
                        {b.normalLines.map((line, i) => (
                          <p key={i}>{renderInlineBold(line)}</p>
                        ))}
                      </div>
                    )}

                    {b.bullets.length > 0 && (
                      <ul className="mt-3 sm:mt-4 space-y-2 text-[11px] sm:text-sm text-[var(--ac-muted-2)] list-disc pl-5">
                        {b.bullets.map((li, i) => (
                          <li key={i}>{renderInlineBold(li)}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Similar */}
          {similar.length > 0 && (
            <div className="mt-12 sm:mt-16">
              <h2 className="text-base sm:text-xl font-semibold text-[var(--ac-text)] mb-4 sm:mb-6">
                Ähnliche Fahrzeuge
              </h2>

              <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {similar.map((s) => (
                  <Link
                    key={s.id}
                    href={`/fahrzeuge/${s.id}`}
                    className="group rounded-2xl border border-white/10 overflow-hidden bg-[rgba(10,20,45,0.35)] hover:bg-[rgba(10,20,45,0.45)] transition"
                  >
                    <div className="relative aspect-[16/10]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={s.image}
                        alt={s.title}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                      {s.price != null && (
                        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                          <span className="text-xs sm:text-sm font-bold text-white">
                            {formatPrice(s.price)} €
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="p-4">
                      <h3 className="text-xs sm:text-sm font-semibold text-[var(--ac-text)] line-clamp-1">
                        {s.title}
                      </h3>
                      <p className="text-[11px] sm:text-xs text-[var(--ac-muted)] mt-1">
                        {s.year || "-"} ·{" "}
                        {s.km != null ? `${formatKm(s.km)} km` : "-"} ·{" "}
                        {s.fuel || "-"}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
