"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, ArrowRight, Camera, CheckCircle2, ImagePlus, Loader2, X } from "lucide-react";
import {
  ACCIDENT_OPTIONS,
  CONDITION_OPTIONS,
  FUEL_OPTIONS,
  GEARBOX_OPTIONS,
  MAX_TRADEIN_PHOTOS,
} from "@/lib/tradeInOptions";

const cx = (...c) => c.filter(Boolean).join(" ");

const STEPS = ["Fahrzeug", "Fotos", "Kontakt"];
const THIS_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: THIS_YEAR - 1979 }, (_, i) => THIS_YEAR - i);

const EMPTY = {
  brand: "",
  model: "",
  year: "",
  mileage: "",
  fuel: "",
  gearbox: "",
  power: "",
  condition: "",
  accidentFree: "",
  tuev: "",
  askingPrice: "",
  description: "",
  name: "",
  email: "",
  phone: "",
  zip: "",
  consent: false,
  website: "", // honeypot
};

/** Shrink a photo in the browser (max 1600 px, JPEG) so uploads stay small. */
async function shrinkImage(file) {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d").drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.82));
    if (!blob) return file;
    return new File([blob], file.name.replace(/\.\w+$/, "") + ".jpg", { type: "image/jpeg" });
  } catch {
    return file; // e.g. HEIC on browsers that cannot decode it – the server handles it
  }
}

const digits = (v) => v.replace(/[^\d]/g, "");
const thousands = (v) => (v ? new Intl.NumberFormat("de-DE").format(Number(v)) : "");

export default function SellCarForm() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(EMPTY);
  const [photos, setPhotos] = useState([]); // { file, url }
  const [preparing, setPreparing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const fileRef = useRef(null);
  const topRef = useRef(null);

  const set = (patch) => {
    setForm((f) => ({ ...f, ...patch }));
    setError("");
  };

  // free preview URLs when the component goes away
  const photosRef = useRef(photos);
  photosRef.current = photos;
  useEffect(() => () => photosRef.current.forEach((p) => URL.revokeObjectURL(p.url)), []);

  async function addFiles(list) {
    const files = Array.from(list || []).filter((f) => f.type.startsWith("image/") || /\.(heic|heif)$/i.test(f.name));
    const room = MAX_TRADEIN_PHOTOS - photos.length;
    if (!files.length || room <= 0) return;
    setPreparing(true);
    const prepared = [];
    for (const f of files.slice(0, room)) {
      const small = await shrinkImage(f);
      prepared.push({ file: small, url: URL.createObjectURL(small) });
    }
    setPhotos((p) => [...p, ...prepared]);
    setPreparing(false);
  }

  function removePhoto(i) {
    setPhotos((p) => {
      URL.revokeObjectURL(p[i].url);
      return p.filter((_, idx) => idx !== i);
    });
  }

  function validate(s) {
    if (s === 0) {
      if (!form.brand.trim() || !form.model.trim()) return "Bitte Marke und Modell angeben.";
      if (!form.year) return "Bitte die Erstzulassung wählen.";
      if (form.mileage === "") return "Bitte den Kilometerstand angeben.";
    }
    if (s === 2) {
      if (!form.name.trim()) return "Bitte Ihren Namen angeben.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) return "Bitte eine gültige E-Mail-Adresse angeben.";
      if (!form.consent) return "Bitte bestätigen Sie die Datenschutzerklärung.";
    }
    return "";
  }

  function go(next) {
    if (next > step) {
      const msg = validate(step);
      if (msg) {
        setError(msg);
        return;
      }
    }
    setError("");
    setStep(next);
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function submit(e) {
    e.preventDefault();
    const msg = validate(0) || validate(2);
    if (msg) {
      setError(msg);
      return;
    }
    setSending(true);
    setError("");
    try {
      const body = new FormData();
      Object.entries(form).forEach(([k, v]) => body.append(k, String(v)));
      photos.forEach((p) => body.append("photos", p.file));
      const res = await fetch("/api/ankauf", { method: "POST", body });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Senden fehlgeschlagen. Bitte versuchen Sie es erneut.");
        return;
      }
      setDone(true);
      topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch {
      setError("Keine Verbindung. Bitte prüfen Sie Ihre Internetverbindung.");
    } finally {
      setSending(false);
    }
  }

  if (done) {
    return (
      <div ref={topRef} className="card scroll-mt-24 p-8 text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-500" />
        <h2 className="mt-3 text-lg font-semibold text-ink">Vielen Dank, {form.name.split(" ")[0]}!</h2>
        <p className="mx-auto mt-1 max-w-md text-[13px] text-muted">
          Wir haben die Daten zu Ihrem {form.brand} {form.model} erhalten und melden uns in der Regel innerhalb eines
          Werktags mit einem Angebot bei Ihnen.
        </p>
        <Link href="/" className="btn btn-secondary btn-sm mt-5">
          Zur Startseite
        </Link>
      </div>
    );
  }

  return (
    <form ref={topRef} onSubmit={submit} className="card scroll-mt-24 overflow-hidden" noValidate>
      {/* Steps */}
      <ol className="grid grid-cols-3 border-b border-line bg-canvas/60">
        {STEPS.map((label, i) => (
          <li key={label}>
            <button
              type="button"
              onClick={() => (i < step ? go(i) : null)}
              className={cx(
                "flex w-full items-center gap-2 px-4 py-2.5 text-left text-[12px] font-medium transition",
                i === step ? "text-ink" : i < step ? "text-brand-700 hover:bg-white" : "cursor-default text-muted",
              )}
            >
              <span
                className={cx(
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
                  i === step ? "bg-ink text-white" : i < step ? "bg-brand-600 text-white" : "bg-line text-muted",
                )}
              >
                {i < step ? "✓" : i + 1}
              </span>
              {label}
            </button>
            <span className={cx("block h-0.5", i <= step ? "bg-brand-600" : "bg-transparent")} />
          </li>
        ))}
      </ol>

      <div className="p-4 sm:p-5">
        {error ? (
          <p className="mb-4 flex items-center gap-2 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-[13px] text-rose-800">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {error}
          </p>
        ) : null}

        {/* honeypot */}
        <input
          type="text"
          name="website"
          value={form.website}
          onChange={(e) => set({ website: e.target.value })}
          tabIndex={-1}
          autoComplete="off"
          className="hidden"
          aria-hidden
        />

        {/* Step 1 – vehicle */}
        {step === 0 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Marke *" htmlFor="brand">
              <input id="brand" value={form.brand} onChange={(e) => set({ brand: e.target.value })} className="field" placeholder="z. B. Volkswagen" />
            </Field>
            <Field label="Modell *" htmlFor="model">
              <input id="model" value={form.model} onChange={(e) => set({ model: e.target.value })} className="field" placeholder="z. B. Golf 1.5 TSI" />
            </Field>
            <Field label="Erstzulassung *" htmlFor="year">
              <select id="year" value={form.year} onChange={(e) => set({ year: e.target.value })} className="field">
                <option value="">Bitte wählen</option>
                {YEARS.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Kilometerstand *" htmlFor="mileage">
              <div className="relative">
                <input
                  id="mileage"
                  inputMode="numeric"
                  value={thousands(form.mileage)}
                  onChange={(e) => set({ mileage: digits(e.target.value).slice(0, 7) })}
                  className="field pr-10"
                  placeholder="z. B. 85.000"
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-muted">km</span>
              </div>
            </Field>
            <Field label="Kraftstoff" htmlFor="fuel">
              <select id="fuel" value={form.fuel} onChange={(e) => set({ fuel: e.target.value })} className="field">
                <option value="">Bitte wählen</option>
                {FUEL_OPTIONS.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </Field>
            <Field label="Getriebe" htmlFor="gearbox">
              <select id="gearbox" value={form.gearbox} onChange={(e) => set({ gearbox: e.target.value })} className="field">
                <option value="">Bitte wählen</option>
                {GEARBOX_OPTIONS.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </Field>
            <Field label="Leistung" htmlFor="power">
              <div className="relative">
                <input
                  id="power"
                  inputMode="numeric"
                  value={form.power}
                  onChange={(e) => set({ power: digits(e.target.value).slice(0, 4) })}
                  className="field pr-10"
                  placeholder="z. B. 150"
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-muted">PS</span>
              </div>
            </Field>
            <Field label="TÜV / HU bis" htmlFor="tuev">
              <input id="tuev" type="month" value={form.tuev} onChange={(e) => set({ tuev: e.target.value })} className="field" />
            </Field>
            <Field label="Allgemeiner Zustand" htmlFor="condition">
              <select id="condition" value={form.condition} onChange={(e) => set({ condition: e.target.value })} className="field">
                <option value="">Bitte wählen</option>
                {CONDITION_OPTIONS.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </Field>
            <Field label="Unfallfrei?" htmlFor="accidentFree">
              <select
                id="accidentFree"
                value={form.accidentFree}
                onChange={(e) => set({ accidentFree: e.target.value })}
                className="field"
              >
                <option value="">Bitte wählen</option>
                {ACCIDENT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Preisvorstellung (optional)" htmlFor="askingPrice">
              <div className="relative">
                <input
                  id="askingPrice"
                  inputMode="numeric"
                  value={thousands(form.askingPrice)}
                  onChange={(e) => set({ askingPrice: digits(e.target.value).slice(0, 8) })}
                  className="field pr-8"
                  placeholder="z. B. 12.500"
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-muted">€</span>
              </div>
            </Field>
            <div className="sm:col-span-2">
              <Field label="Ausstattung, Mängel, Besonderheiten (optional)" htmlFor="description">
                <textarea
                  id="description"
                  rows={3}
                  value={form.description}
                  onChange={(e) => set({ description: e.target.value.slice(0, 3000) })}
                  className="field"
                  placeholder="z. B. Navi, Sitzheizung, neue Reifen, kleiner Kratzer hinten links …"
                />
              </Field>
            </div>
          </div>
        ) : null}

        {/* Step 2 – photos */}
        {step === 1 ? (
          <div>
            <p className="text-[13px] text-muted">
              Fotos helfen uns, ein genaues Angebot zu machen: außen von allen Seiten, Innenraum, Tacho mit Kilometerstand
              und eventuelle Schäden. Bis zu {MAX_TRADEIN_PHOTOS} Fotos – optional.
            </p>

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                addFiles(e.dataTransfer.files);
              }}
              className={cx(
                "mt-3 grid grid-cols-2 gap-2 rounded-lg border-2 border-dashed p-2 transition sm:grid-cols-4",
                dragOver ? "border-brand-500 bg-brand-50" : "border-line-strong",
              )}
            >
              {photos.map((p, i) => (
                <div key={p.url} className="group relative aspect-[4/3] overflow-hidden rounded-md bg-canvas">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.url} alt={`Foto ${i + 1}`} className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removePhoto(i)}
                    aria-label="Foto entfernen"
                    className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-navy-950/70 text-white transition hover:bg-rose-600"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                  {i === 0 ? (
                    <span className="absolute bottom-1 left-1 rounded bg-navy-950/70 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                      Titelbild
                    </span>
                  ) : null}
                </div>
              ))}

              {photos.length < MAX_TRADEIN_PHOTOS ? (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={preparing}
                  className="flex aspect-[4/3] flex-col items-center justify-center gap-1 rounded-md bg-canvas text-[12px] font-medium text-muted transition hover:bg-brand-50 hover:text-brand-700"
                >
                  {preparing ? <Loader2 className="h-5 w-5 animate-spin" /> : photos.length ? <ImagePlus className="h-5 w-5" /> : <Camera className="h-5 w-5" />}
                  {preparing ? "Wird vorbereitet …" : photos.length ? "Weitere Fotos" : "Fotos auswählen"}
                </button>
              ) : null}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                addFiles(e.target.files);
                e.target.value = "";
              }}
            />
            <p className="mt-2 text-[11px] text-muted">
              {photos.length} von {MAX_TRADEIN_PHOTOS} Fotos · auf dem Handy öffnet sich direkt die Kamera oder Galerie
            </p>
          </div>
        ) : null}

        {/* Step 3 – contact */}
        {step === 2 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Vor- und Nachname *" htmlFor="name">
              <input id="name" autoComplete="name" value={form.name} onChange={(e) => set({ name: e.target.value })} className="field" />
            </Field>
            <Field label="E-Mail *" htmlFor="email">
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={(e) => set({ email: e.target.value })}
                className="field"
              />
            </Field>
            <Field label="Telefon (für Rückfragen)" htmlFor="phone">
              <input id="phone" type="tel" autoComplete="tel" value={form.phone} onChange={(e) => set({ phone: e.target.value })} className="field" />
            </Field>
            <Field label="PLZ" htmlFor="zip">
              <input
                id="zip"
                inputMode="numeric"
                autoComplete="postal-code"
                value={form.zip}
                onChange={(e) => set({ zip: digits(e.target.value).slice(0, 5) })}
                className="field"
              />
            </Field>

            {/* summary */}
            <div className="rounded-lg bg-canvas px-3 py-2.5 text-[12px] text-body sm:col-span-2">
              <span className="font-semibold text-ink">
                {form.brand} {form.model}
              </span>
              {" · "}EZ {form.year || "–"} · {thousands(form.mileage) || "–"} km
              {form.fuel ? ` · ${form.fuel}` : ""}
              {form.askingPrice ? ` · Wunschpreis ${thousands(form.askingPrice)} €` : ""} · {photos.length}{" "}
              {photos.length === 1 ? "Foto" : "Fotos"}
            </div>

            <label className="flex items-start gap-2 text-[12px] text-body sm:col-span-2">
              <input
                type="checkbox"
                checked={form.consent}
                onChange={(e) => set({ consent: e.target.checked })}
                className="mt-0.5 h-4 w-4 accent-brand-600"
              />
              <span>
                Ich bin einverstanden, dass meine Angaben zur Bearbeitung meines Verkaufsangebots gespeichert und verwendet
                werden. Mehr in der{" "}
                <Link href="/Datenschutz" target="_blank" className="text-brand-700 underline">
                  Datenschutzerklärung
                </Link>
                . *
              </span>
            </label>
          </div>
        ) : null}
      </div>

      {/* Footer actions */}
      <div className="flex items-center justify-between gap-2 border-t border-line bg-canvas/40 px-4 py-3 sm:px-5">
        {step > 0 ? (
          <button type="button" onClick={() => go(step - 1)} className="btn btn-secondary btn-sm">
            <ArrowLeft className="h-3.5 w-3.5" />
            Zurück
          </button>
        ) : (
          <span className="text-[11px] text-muted">* Pflichtfelder</span>
        )}

        {step < 2 ? (
          <button type="button" onClick={() => go(step + 1)} className="btn btn-primary btn-sm">
            {step === 1 && !photos.length ? "Ohne Fotos weiter" : "Weiter"}
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        ) : (
          <button type="submit" disabled={sending} className="btn btn-primary btn-sm">
            {sending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
            {sending ? "Wird gesendet …" : "Angebot anfordern"}
          </button>
        )}
      </div>
    </form>
  );
}

function Field({ label, htmlFor, children }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="label">
        {label}
      </label>
      {children}
    </div>
  );
}
