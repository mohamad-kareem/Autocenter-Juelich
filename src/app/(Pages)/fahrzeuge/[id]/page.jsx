import Link from "next/link";
import { notFound, unstable_rethrow } from "next/navigation";
import {
  ArrowLeft,
  BadgeCheck,
  Calendar,
  Check,
  ChevronRight,
  Cog,
  Fuel,
  Gauge,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Star,
  Wallet,
  Wrench,
  Zap,
} from "lucide-react";
import ImageSlider from "./ImageSlider";
import CarCard from "@/app/(components)/CarCard";
import { fetchSingleAd, getCarsSafe, mapAdToUiCar } from "@/lib/mobilede";
import { formatKm, formatPrice, prettyBrand, toCardCar } from "@/lib/cars";
import { SITE } from "@/lib/site";

/* ----------------------------- helpers ----------------------------- */

function formatYYYYMM(yyyymm) {
  if (!yyyymm || typeof yyyymm !== "string" || yyyymm.length !== 6) return null;
  return `${yyyymm.slice(4, 6)}/${yyyymm.slice(0, 4)}`;
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

const enumLabel = (value, map) => (value ? map[value] || value : null);
const field = (label, value) => (isNonEmpty(value) ? { label, value: String(value) } : null);

/**
 * mobile.de description uses CREOLE-like tokens:
 * "\\\\" linebreak, "----" separator, "* item" bullet, "**bold**"
 */
function parseDescription(desc) {
  if (!desc || typeof desc !== "string") return [];
  return desc
    .replaceAll("\\\\", "\n")
    .split(/\n?----+\n?/g)
    .map((b) => b.trim())
    .filter(Boolean)
    .map((block) => {
      const lines = block
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);
      return {
        normalLines: lines.filter((l) => !l.startsWith("* ")),
        bullets: lines.filter((l) => l.startsWith("* ")).map((l) => l.slice(2).trim()),
      };
    });
}

function renderInlineBold(text) {
  return String(text)
    .split(/(\*\*[^*]+\*\*)/g)
    .filter(Boolean)
    .map((part, i) =>
      part.startsWith("**") && part.endsWith("**") ? (
        <strong key={i} className="font-semibold text-ink">
          {part.slice(2, -2)}
        </strong>
      ) : (
        <span key={i}>{part}</span>
      ),
    );
}

const GEARBOX = { MANUAL_GEAR: "Schaltgetriebe", AUTOMATIC_GEAR: "Automatik", SEMIAUTOMATIC_GEAR: "Halbautomatik" };
const FUEL = {
  PETROL: "Benzin",
  DIESEL: "Diesel",
  ELECTRICITY: "Elektro",
  HYBRID: "Hybrid (Benzin)",
  HYBRID_DIESEL: "Hybrid (Diesel)",
  LPG: "Autogas (LPG)",
  CNG: "Erdgas (CNG)",
  ETHANOL: "Ethanol",
  HYDROGENIUM: "Wasserstoff",
};
const DOORS = { TWO_OR_THREE: "2/3", FOUR_OR_FIVE: "4/5", SIX_OR_SEVEN: "6/7" };
const DRIVE = { FRONT: "Frontantrieb", REAR: "Heckantrieb", ALL_WHEEL: "Allrad" };
const CONDITION = { USED: "Gebraucht", NEW: "Neu" };
const CATEGORY = {
  Cabrio: "Cabrio / Roadster",
  EstateCar: "Kombi",
  Limousine: "Limousine",
  OffRoad: "SUV / Geländewagen",
  SmallCar: "Kleinwagen",
  SportsCar: "Sportwagen / Coupé",
  Van: "Van / Kleinbus",
  OtherCar: "Andere",
};

/* ----------------------------- UI bits ----------------------------- */

function SpecGroup({ title, items }) {
  const clean = (items || []).filter(Boolean);
  if (!clean.length) return null;
  return (
    <div className="mb-4 break-inside-avoid">
      <h3 className="border-b border-line pb-1.5 text-[13px] font-semibold text-ink">{title}</h3>
      <dl>
        {clean.map((it) => (
          <div key={it.label} className="flex justify-between gap-4 border-b border-line/70 py-1.5 text-[13px] last:border-b-0">
            <dt className="text-muted">{it.label}</dt>
            <dd className="text-right font-medium text-ink">{it.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function KeyFact({ icon: Icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-center gap-2.5 rounded-md bg-canvas px-3 py-2">
      <Icon className="h-4 w-4 shrink-0 text-navy-700" />
      <div className="min-w-0">
        <p className="text-[11px] text-muted">{label}</p>
        <p className="truncate text-[13px] font-semibold text-ink">{value}</p>
      </div>
    </div>
  );
}

/* ------------------------------ page ------------------------------ */

async function loadAd(id) {
  try {
    return await fetchSingleAd(id);
  } catch (err) {
    unstable_rethrow(err);
    console.error("MOBILEDE_SINGLE_AD_ERROR:", err?.message || err);
    return null;
  }
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const ad = id ? await loadAd(id) : null;
  if (!ad) return { title: "Fahrzeug nicht gefunden" };
  const title = toCardCar(mapAdToUiCar(ad)).title;
  const price = ad?.price?.consumerPriceGross ? ` für ${formatPrice(ad.price.consumerPriceGross)}` : "";
  return {
    title,
    description: `${title}${price} – jetzt bei Autocenter Jülich ansehen, Probefahrt vereinbaren oder Finanzierung anfragen.`,
    openGraph: { images: ad.images?.[0]?.ref ? [ad.images[0].ref] : undefined },
  };
}

export default async function CarDetailPage({ params }) {
  const { id } = await params;
  if (!id) notFound();

  const ad = await loadAd(id);
  if (!ad) notFound();

  const card = toCardCar(mapAdToUiCar(ad));
  const images = Array.isArray(ad.images) ? ad.images.map((i) => i?.ref).filter(Boolean) : [];

  const priceGross = ad?.price?.consumerPriceGross;
  const firstReg = formatYYYYMM(ad.firstRegistration);
  const hu = formatYYYYMM(ad.generalInspection);
  const mileage = ad.mileage != null ? formatKm(ad.mileage) : null;
  const ps = kwToPs(ad.power);

  const sectionVehicle = [
    field("Zustand", enumLabel(ad.condition, CONDITION)),
    field("Kategorie", enumLabel(ad.category, CATEGORY)),
    field("Marke", prettyBrand(ad.make)),
    field("Modell", ad.model),
    field("Erstzulassung", firstReg),
    field("Kilometerstand", mileage),
    field("Sitze", ad.seats),
    field("Türen", enumLabel(ad.doors, DOORS)),
    field("Antrieb", enumLabel(ad.driveType, DRIVE)),
  ];

  const sectionEngine = [
    field("Leistung", ad.power != null ? `${ad.power} kW${ps ? ` (${ps} PS)` : ""}` : null),
    field("Hubraum", ad.cubicCapacity != null ? `${ad.cubicCapacity} cm³` : null),
    field("Zylinder", ad.cylinder),
    field("Getriebe", enumLabel(ad.gearbox, GEARBOX)),
    field("Kraftstoff", enumLabel(ad.fuel, FUEL)),
    field("E10 geeignet", labelYesNo(ad.e10Enabled)),
    field("Tankvolumen", ad.fuelTankVolume != null ? `${ad.fuelTankVolume} l` : null),
  ];

  const sectionEnv = [
    field("Schadstoffklasse", ad.emissionClass),
    field("Umweltplakette", ad.emissionSticker),
    field("CO₂-Emissionen (komb.)", ad?.emissions?.combined?.co2 != null ? `${ad.emissions.combined.co2} g/km` : null),
    field("Verbrauch (komb.)", ad?.consumptions?.fuel?.combined != null ? `${ad.consumptions.fuel.combined} l/100 km` : null),
  ];

  const sectionColors = [
    field("Außenfarbe", ad.exteriorColor),
    field("Herstellerfarbe", ad.manufacturerColorName),
    field("Metallic", labelYesNo(ad.metallic)),
    field("Innenfarbe", ad.interiorColor),
    field("Innenmaterial", ad.interiorType),
    field("Ausstattungslinie", ad.trimLine),
    field("Baureihe", ad.modelRange),
  ];

  const sectionService = [
    field("HU bis", hu),
    field("Scheckheftgepflegt", labelYesNo(ad.fullServiceHistory)),
    field("Unrepariertes Schadensfahrzeug", labelYesNo(ad.damageUnrepaired)),
    field("Fahrtauglich", labelYesNo(ad.roadworthy)),
    field("Garantie", labelYesNo(ad.warranty)),
  ];

  const sectionWeight = [
    field("Leergewicht", ad.weight != null ? `${ad.weight} kg` : null),
    field("Anhängelast gebremst", ad.trailerLoadBraked != null ? `${ad.trailerLoadBraked} kg` : null),
    field("Anhängelast ungebremst", ad.trailerLoadUnbraked != null ? `${ad.trailerLoadUnbraked} kg` : null),
  ];

  const features = [
    ["ABS", ad.abs],
    ["ESP", ad.esp],
    ["Bluetooth", ad.bluetooth],
    ["Freisprecheinrichtung", ad.handsFreePhoneSystem],
    ["Wegfahrsperre", ad.immobilizer],
    ["Multifunktionslenkrad", ad.multifunctionalWheel],
    ["Bordcomputer", ad.onBoardComputer],
    ["Sitzheizung", ad.electricHeatedSeats],
    ["Beheizbare Frontscheibe", ad.heatedWindshield],
    ["Lederlenkrad", ad.leatherSteeringWheel],
    ["Touchscreen", ad.touchscreen],
    ["USB", ad.usb],
    ["Apple CarPlay", ad.carplay],
    ["Ganzjahresreifen", ad.allSeasonTires],
  ]
    .filter(([, v]) => v === true)
    .map(([n]) => n);

  const featureDetails = [
    field("Radio", Array.isArray(ad.radio) && ad.radio.length ? ad.radio.join(", ") : null),
    field("Parkassistenten", Array.isArray(ad.parkingAssistants) && ad.parkingAssistants.length ? ad.parkingAssistants.join(", ") : null),
    field("Heizung", Array.isArray(ad.heating) && ad.heating.length ? ad.heating.join(", ") : null),
    field("Airbags", ad.airbag),
    field("Tagfahrlicht", ad.daytimeRunningLamps),
  ];

  const descBlocks = parseDescription(ad.description);

  const all = (await getCarsSafe()).map(toCardCar).filter((c) => c.id !== card.id && !c.reserved);
  const similar = [
    ...all.filter((c) => c.brand === card.brand),
    ...all
      .filter((c) => c.brand !== card.brand)
      .sort((a, b) => Math.abs(a.price - card.price) - Math.abs(b.price - card.price)),
  ].slice(0, 4);

  const contactHref = (betreff) =>
    `/kontakt?betreff=${encodeURIComponent(betreff)}&fahrzeug=${encodeURIComponent(card.title)}&fahrzeugId=${encodeURIComponent(card.id)}`;

  return (
    <div>
      {/* Breadcrumb */}
      <div className="border-b border-line bg-white">
        <div className="container-ac flex items-center justify-between gap-4 py-2">
          <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1 text-xs text-muted">
            <Link href="/" className="shrink-0 hover:text-ink">
              Startseite
            </Link>
            <ChevronRight className="h-3.5 w-3.5 shrink-0" />
            <Link href="/fahrzeuge" className="shrink-0 hover:text-ink">
              Fahrzeuge
            </Link>
            <ChevronRight className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate text-ink">{card.title}</span>
          </nav>
          <Link href="/fahrzeuge" className="link hidden shrink-0 items-center gap-1 text-xs sm:inline-flex">
            <ArrowLeft className="h-3.5 w-3.5" /> Zur Übersicht
          </Link>
        </div>
      </div>

      <div className="container-ac mt-4 grid gap-4 lg:grid-cols-12 lg:gap-5">
        {/* Left column */}
        <div className="min-w-0 space-y-4 lg:col-span-8">
          <ImageSlider images={images} alt={card.title} />

          {/* Title (mobile) */}
          <div className="card p-4 lg:hidden">
            <TitleBlock card={card} ad={ad} priceGross={priceGross} />
          </div>

          <div className="card p-4">
            <h2 className="text-[15px] font-semibold">Technische Daten</h2>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
              <KeyFact icon={Calendar} label="Erstzulassung" value={firstReg} />
              <KeyFact icon={Gauge} label="Kilometerstand" value={mileage} />
              <KeyFact icon={Zap} label="Leistung" value={ad.power != null ? `${ps} PS (${ad.power} kW)` : null} />
              <KeyFact icon={Fuel} label="Kraftstoff" value={enumLabel(ad.fuel, FUEL)} />
              <KeyFact icon={Cog} label="Getriebe" value={enumLabel(ad.gearbox, GEARBOX)} />
              <KeyFact icon={Wrench} label="HU bis" value={hu} />
            </div>
          </div>

          {features.length ? (
            <section className="card p-4">
              <h2 className="text-[15px] font-semibold">Ausstattung</h2>
              <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 sm:grid-cols-3">
                {features.map((f) => (
                  <li key={f} className="flex items-center gap-1.5 text-[13px] text-body">
                    <span className="flex h-4 w-4 shrink-0 items-center justify-center text-emerald-600">
                      <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {descBlocks.length ? (
            <section className="card p-4">
              <h2 className="text-[15px] font-semibold">Fahrzeugbeschreibung</h2>
              <div className="mt-2 space-y-3 text-[13px] leading-6 text-body">
                {descBlocks.map((b, idx) => (
                  <div key={idx} className={idx ? "border-t border-line pt-3" : ""}>
                    {b.normalLines.map((line, i) => (
                      <p key={i}>{renderInlineBold(line)}</p>
                    ))}
                    {b.bullets.length ? (
                      <ul className="mt-2 grid gap-x-4 gap-y-0.5 sm:grid-cols-2">
                        {b.bullets.map((li, i) => (
                          <li key={i} className="flex gap-2.5">
                            <span className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-brand-500" />
                            <span>{renderInlineBold(li)}</span>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          <section className="card p-4">
            <h2 className="text-[15px] font-semibold">Technische Details</h2>
            <div className="mt-3 gap-8 md:columns-2">
              <SpecGroup title="Fahrzeug" items={sectionVehicle} />
              <SpecGroup title="Motor & Antrieb" items={sectionEngine} />
              <SpecGroup title="Zustand & Service" items={sectionService} />
              <SpecGroup title="Farbe & Innenraum" items={sectionColors} />
              <SpecGroup title="Verbrauch & Umwelt" items={sectionEnv} />
              <SpecGroup title="Weitere Ausstattung" items={featureDetails} />
              <SpecGroup title="Gewicht & Anhängelast" items={sectionWeight} />
            </div>
          </section>
        </div>

        {/* Right column – sticky contact card */}
        <aside className="lg:col-span-4">
          <div className="space-y-3 lg:sticky lg:top-[88px]">
            <div className="card p-4">
              <div className="hidden lg:block">
                <TitleBlock card={card} ad={ad} priceGross={priceGross} />
              </div>

              <div className="grid gap-2 lg:mt-4">
                <a href={SITE.phoneHref} className="btn btn-primary btn-lg w-full">
                  <Phone className="h-4 w-4" />
                  {SITE.phoneDisplay}
                </a>
                <Link href={contactHref("Probefahrt vereinbaren")} className="btn btn-secondary w-full">
                  <Calendar className="h-4 w-4" />
                  Probefahrt vereinbaren
                </Link>
                <Link href={contactHref("Allgemeine Anfrage")} className="btn btn-secondary w-full">
                  <Mail className="h-4 w-4" />
                  Nachricht senden
                </Link>
              </div>
            </div>

            <Link
              href={contactHref("Finanzierung anfragen")}
              className="group card flex items-center gap-3 p-3 transition hover:border-brand-200"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-brand-50 text-brand-600">
                <Wallet className="h-4 w-4" />
              </span>
              <span className="flex-1">
                <span className="block text-[13px] font-semibold text-ink">Finanzierung anfragen</span>
                <span className="block text-xs text-muted">12–84 Monate, mit oder ohne Anzahlung</span>
              </span>
              <ChevronRight className="h-4 w-4 text-muted" />
            </Link>

            <Link
              href="/garantie"
              className="group card flex items-center gap-3 p-3 transition hover:border-brand-200"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-emerald-50 text-emerald-600">
                <ShieldCheck className="h-4 w-4" />
              </span>
              <span className="flex-1">
                <span className="block text-[13px] font-semibold text-ink">CarGarantie® möglich</span>
                <span className="block text-xs text-muted">12, 24 oder 36 Monate Schutz</span>
              </span>
              <ChevronRight className="h-4 w-4 text-muted" />
            </Link>

            <div className="card overflow-hidden">
              <div className="flex items-center gap-2.5 bg-navy-900 px-3 py-2.5 text-white">
                <MapPin className="h-4 w-4 text-accent-400" />
                <div>
                  <p className="text-[13px] font-semibold">{SITE.name}</p>
                  <p className="text-xs text-white/70">
                    {SITE.street}, {SITE.zip} {SITE.city}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between gap-3 px-3 py-2.5 text-xs">
                <span className="inline-flex items-center gap-1.5 text-body">
                  <Star className="h-3.5 w-3.5 fill-star text-star" />
                  <span className="font-semibold text-ink">
                    {SITE.googleRatingFallback.rating.toFixed(1).replace(".", ",")}
                  </span>{" "}
                  bei Google
                </span>
                <a href={SITE.mapsLink} target="_blank" rel="noopener noreferrer" className="link">
                  Route planen
                </a>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {similar.length ? (
        <section className="container-ac mt-8">
          <div className="flex items-end justify-between gap-4">
            <h2 className="section-title">Ähnliche Fahrzeuge</h2>
            <Link href="/fahrzeuge" className="link text-sm">
              Alle Fahrzeuge
            </Link>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
            {similar.map((c) => (
              <CarCard key={c.id} car={c} />
            ))}
          </div>
        </section>
      ) : null}

      {/* Mobile sticky action bar */}
      <style>{"@media (max-width: 1023px) { body { padding-bottom: 56px; } }"}</style>
      <div className="fixed inset-x-0 bottom-0 z-40 flex gap-2 border-t border-line bg-white p-2 lg:hidden">
        <a href={SITE.phoneHref} className="btn btn-secondary flex-1">
          <Phone className="h-4 w-4" />
          Anrufen
        </a>
        <Link href={contactHref("Allgemeine Anfrage")} className="btn btn-primary flex-1">
          <Mail className="h-4 w-4" />
          Anfragen
        </Link>
      </div>
    </div>
  );
}

function TitleBlock({ card, ad, priceGross }) {
  return (
    <div>
      <div className="flex flex-wrap gap-1.5">
        {card.reserved ? <span className="chip bg-amber-100 text-amber-800">Reserviert</span> : null}
        {ad.warranty === true ? (
          <span className="chip bg-emerald-50 text-emerald-700">
            <ShieldCheck className="h-3.5 w-3.5" /> Garantie
          </span>
        ) : null}
        {ad.fullServiceHistory === true ? (
          <span className="chip bg-brand-50 text-brand-700">
            <BadgeCheck className="h-3.5 w-3.5" /> Scheckheftgepflegt
          </span>
        ) : null}
      </div>
      <h1 className="mt-2 text-lg font-bold leading-snug">{card.title}</h1>
      {priceGross ? (
        <p className="mt-2 text-2xl font-bold text-ink">{formatPrice(priceGross)}</p>
      ) : (
        <p className="mt-2 text-lg font-semibold text-ink">Preis auf Anfrage</p>
      )}
      <p className="mt-0.5 text-xs text-muted">
        {[card.firstRegistration && `EZ ${card.firstRegistration}`, card.km != null && formatKm(card.km), card.power && `${card.power} PS`]
          .filter(Boolean)
          .join(" · ")}
      </p>
    </div>
  );
}
