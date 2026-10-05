export const runtime = "nodejs";

import dbConnect from "@/lib/mongodb";
import TradeIn from "@/app/models/TradeIn";
import TradeInPhoto from "@/app/models/TradeInPhoto";
import { getStaffUser } from "@/lib/messages";
import { escapeHtml, sendMail } from "@/lib/mailer";
import { SITE } from "@/lib/site";
import {
  ACCIDENT_OPTIONS,
  CONDITION_OPTIONS,
  FUEL_OPTIONS,
  GEARBOX_OPTIONS,
  MAX_TRADEIN_PHOTOS,
  formatEuro,
  formatKm,
  serializeTradeIn,
} from "@/lib/tradeInOptions";

const NOTIFY_TO = "info@autocenter-juelich.de";
const MAX_PHOTO_BYTES = 6 * 1024 * 1024; // per photo, before compression
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif", "image/avif"];

const hits = new Map(); // ip -> timestamps (best effort, per instance)
function rateLimited(ip) {
  const now = Date.now();
  const list = (hits.get(ip) || []).filter((t) => now - t < 60 * 60 * 1000);
  list.push(now);
  hits.set(ip, list);
  return list.length > 5;
}

const str = (v, max) => String(v ?? "").trim().slice(0, max);
const int = (v, min, max) => {
  const n = Number(String(v ?? "").replace(/[^\d]/g, ""));
  return Number.isFinite(n) && String(v ?? "").trim() !== "" && n >= min && n <= max ? n : undefined;
};
const oneOf = (v, list) => (list.includes(v) ? v : "");

async function optimize(buffer) {
  try {
    const sharp = (await import("sharp")).default;
    const img = sharp(buffer, { failOn: "none" }).rotate();
    const meta = await img.metadata();
    const pipeline = meta.width && meta.width > 1600 ? img.resize({ width: 1600 }) : img;
    const data = await pipeline.webp({ quality: 78 }).toBuffer();
    const out = await sharp(data).metadata();
    return { data, contentType: "image/webp", width: out.width || 0, height: out.height || 0 };
  } catch {
    return { data: buffer, contentType: "image/jpeg", width: 0, height: 0 };
  }
}

/** POST /api/ankauf – public: a customer offers a car (multipart form). */
export async function POST(req) {
  const ip = (req.headers.get("x-forwarded-for") || "local").split(",")[0].trim();
  if (rateLimited(ip)) {
    return Response.json({ error: "Zu viele Anfragen. Bitte versuchen Sie es später erneut." }, { status: 429 });
  }

  let form;
  try {
    form = await req.formData();
  } catch {
    return Response.json({ error: "Ungültige Anfrage." }, { status: 400 });
  }

  // honeypot – bots fill every field
  if (str(form.get("website"), 200)) return Response.json({ ok: true });

  const data = {
    brand: str(form.get("brand"), 60),
    model: str(form.get("model"), 80),
    year: int(form.get("year"), 1950, new Date().getFullYear() + 1),
    mileage: int(form.get("mileage"), 0, 2_000_000),
    fuel: oneOf(str(form.get("fuel"), 30), FUEL_OPTIONS),
    gearbox: oneOf(str(form.get("gearbox"), 30), GEARBOX_OPTIONS),
    power: int(form.get("power"), 1, 2000),
    condition: oneOf(str(form.get("condition"), 30), CONDITION_OPTIONS),
    accidentFree: oneOf(str(form.get("accidentFree"), 12), ACCIDENT_OPTIONS.map((o) => o.value)),
    tuev: /^\d{4}-\d{2}$/.test(str(form.get("tuev"), 7)) ? str(form.get("tuev"), 7) : "",
    askingPrice: int(form.get("askingPrice"), 0, 10_000_000),
    description: str(form.get("description"), 3000),
    name: str(form.get("name"), 120),
    email: str(form.get("email"), 160).toLowerCase(),
    phone: str(form.get("phone"), 60),
    zip: str(form.get("zip"), 10),
  };

  if (form.get("consent") !== "true") {
    return Response.json({ error: "Bitte bestätigen Sie die Datenschutzerklärung." }, { status: 400 });
  }
  if (!data.brand || !data.model) {
    return Response.json({ error: "Bitte Marke und Modell angeben." }, { status: 400 });
  }
  if (!data.year || data.mileage === undefined) {
    return Response.json({ error: "Bitte Erstzulassung und Kilometerstand angeben." }, { status: 400 });
  }
  if (!data.name) return Response.json({ error: "Bitte Ihren Namen angeben." }, { status: 400 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(data.email)) {
    return Response.json({ error: "Bitte eine gültige E-Mail-Adresse angeben." }, { status: 400 });
  }

  const files = form
    .getAll("photos")
    .filter((f) => f && typeof f.arrayBuffer === "function" && f.size > 0)
    .slice(0, MAX_TRADEIN_PHOTOS);
  for (const f of files) {
    if (f.type && !ALLOWED_TYPES.includes(f.type)) {
      return Response.json({ error: "Bitte nur Fotos (JPG, PNG, WebP) hochladen." }, { status: 400 });
    }
    if (f.size > MAX_PHOTO_BYTES) {
      return Response.json({ error: "Ein Foto ist zu groß (max. 6 MB)." }, { status: 400 });
    }
  }

  let doc;
  try {
    await dbConnect();
    doc = await TradeIn.create({ ...data, photoCount: 0 });

    let saved = 0;
    for (const [i, f] of files.entries()) {
      const out = await optimize(Buffer.from(await f.arrayBuffer()));
      await TradeInPhoto.create({ tradeIn: doc._id, sort: i, ...out });
      saved += 1;
    }
    if (saved) await TradeIn.updateOne({ _id: doc._id }, { photoCount: saved });
    doc.photoCount = saved;
  } catch (err) {
    console.error("ANKAUF_SAVE_ERROR:", err?.message || err);
    return Response.json({ error: "Ihre Anfrage konnte nicht gespeichert werden. Bitte rufen Sie uns an." }, { status: 500 });
  }

  // Notify the team (the request is already saved, so a mail error is not shown to the customer)
  const t = serializeTradeIn(doc.toObject());
  const rows = [
    ["Fahrzeug", `${t.brand} ${t.model}`],
    ["Erstzulassung", t.year || "–"],
    ["Kilometerstand", formatKm(t.mileage)],
    ["Kraftstoff / Getriebe", [t.fuel, t.gearbox].filter(Boolean).join(" / ") || "–"],
    ["Leistung", t.power ? `${t.power} PS` : "–"],
    ["Zustand", t.condition || "–"],
    ["Unfallfrei", ACCIDENT_OPTIONS.find((o) => o.value === t.accidentFree)?.label || "–"],
    ["TÜV bis", t.tuev || "–"],
    ["Preisvorstellung", formatEuro(t.askingPrice)],
    ["Fotos", String(t.photoCount)],
    ["Verkäufer", `${t.name} · ${t.email}${t.phone ? ` · ${t.phone}` : ""}${t.zip ? ` · PLZ ${t.zip}` : ""}`],
  ];
  const link = `${SITE.url}/dashboard/ankauf?id=${t._id}`;
  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.5;color:#0b1220">
      <h2 style="margin:0 0 10px">Neues Ankauf-Angebot: ${escapeHtml(t.brand)} ${escapeHtml(t.model)}</h2>
      <table style="border-collapse:collapse;font-size:14px">
        ${rows.map(([k, v]) => `<tr><td style="padding:4px 14px 4px 0;color:#64748b">${escapeHtml(k)}</td><td style="padding:4px 0"><b>${escapeHtml(v)}</b></td></tr>`).join("")}
      </table>
      ${t.description ? `<p style="margin:12px 0 0;white-space:pre-wrap">${escapeHtml(t.description)}</p>` : ""}
      <p style="margin:16px 0 0"><a href="${link}">Im Händlerportal öffnen</a></p>
    </div>`;
  const text = `${rows.map(([k, v]) => `${k}: ${v}`).join("\n")}\n\n${t.description}\n\n${link}`;

  const mail = await sendMail({
    to: NOTIFY_TO,
    subject: `Ankauf: ${t.brand} ${t.model}${t.year ? ` (${t.year})` : ""}`,
    html,
    text,
    replyTo: t.email,
  });
  if (mail.sent) await TradeIn.updateOne({ _id: doc._id }, { emailSent: true }).catch(() => {});
  else console.error("ANKAUF_MAIL_ERROR:", mail.error);

  return Response.json({ ok: true });
}

/** GET /api/ankauf?status=&q= – staff list */
export async function GET(req) {
  const user = await getStaffUser();
  if (!user) return Response.json({ error: "Nicht angemeldet." }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const q = str(searchParams.get("q"), 80);

  const filter = {};
  if (["new", "checking", "offer", "bought", "declined"].includes(status)) filter.status = status;
  if (q) {
    const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    filter.$or = [{ brand: rx }, { model: rx }, { name: rx }, { email: rx }, { phone: rx }];
  }

  try {
    await dbConnect();
    const [docs, grouped, unread] = await Promise.all([
      TradeIn.find(filter).sort({ createdAt: -1 }).limit(200).maxTimeMS(3000).lean(),
      TradeIn.aggregate([{ $group: { _id: "$status", n: { $sum: 1 } } }]),
      TradeIn.countDocuments({ read: false }),
    ]);
    const counts = { all: 0, unread };
    for (const g of grouped) {
      counts[g._id] = g.n;
      counts.all += g.n;
    }
    return Response.json({ items: docs.map((d) => serializeTradeIn(d)), counts });
  } catch (err) {
    console.error("ANKAUF_LIST_ERROR:", err?.message || err);
    return Response.json({ error: "Angebote konnten nicht geladen werden." }, { status: 500 });
  }
}
