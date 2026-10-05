"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, ChevronDown, Search, Star } from "lucide-react";
import { PRICE_STEPS, formatNumber, fuelLabel, prettyBrand } from "@/lib/cars";
import { SITE } from "@/lib/site";

const cx = (...c) => c.filter(Boolean).join(" ");

const FALLBACK_SLIDES = [
  {
    src: "/hero-showroom.jpg",
    alt: "Showroom von Autocenter Jülich mit Gebrauchtwagen",
    position: "object-[center_55%]",
  },
  {
    src: "/center.jpg",
    alt: "Showroom von Autocenter Jülich mit Verkauf und Finanzierung",
    position: "object-[center_40%]",
  },
  {
    src: "/center2.jpeg",
    alt: "Gebrauchtwagen im Showroom von Autocenter Jülich",
    position: "object-[center_60%]",
  },
];

/**
 * Full-bleed hero with crossfading showroom photos and a floating quick search.
 * @param {{ cars: Array<{brand:string, price:number, year:number|null, fuel:string|null}>, rating?: {rating:number, count:number} }} props
 */
export default function HeroSectionWithSearch({ cars = [], rating, slides }) {
  const router = useRouter();
  const SLIDES = slides?.length ? slides : FALLBACK_SLIDES;
  const [slide, setSlide] = useState(0);
  const [brand, setBrand] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [yearFrom, setYearFrom] = useState("");
  const [fuel, setFuel] = useState("");

  useEffect(() => {
    if (SLIDES.length < 2) return;
    const t = setInterval(() => setSlide((s) => (s + 1) % SLIDES.length), 8000);
    return () => clearInterval(t);
  }, [SLIDES.length]);

  const brands = useMemo(() => {
    const counts = new Map();
    for (const c of cars)
      if (c.brand) counts.set(c.brand, (counts.get(c.brand) || 0) + 1);
    return [...counts.entries()].sort((a, b) => a[0].localeCompare(b[0], "de"));
  }, [cars]);

  const fuels = useMemo(
    () => [...new Set(cars.map((c) => c.fuel).filter(Boolean))].sort(),
    [cars],
  );

  const years = useMemo(() => {
    const ys = cars.map((c) => c.year).filter(Boolean);
    if (!ys.length) return [];
    const min = Math.min(...ys);
    const max = Math.max(...ys);
    return Array.from({ length: max - min + 1 }, (_, i) => max - i);
  }, [cars]);

  const matchCount = useMemo(
    () =>
      cars.filter(
        (c) =>
          (!brand || c.brand === brand) &&
          (!maxPrice || c.price <= Number(maxPrice)) &&
          (!yearFrom || (c.year && c.year >= Number(yearFrom))) &&
          (!fuel || c.fuel === fuel),
      ).length,
    [cars, brand, maxPrice, yearFrom, fuel],
  );

  function submit(e) {
    e.preventDefault();
    const p = new URLSearchParams();
    if (brand) p.set("brand", brand);
    if (maxPrice) p.set("max", maxPrice);
    if (yearFrom) p.set("yf", yearFrom);
    if (fuel) p.set("fuel", fuel);
    const qs = p.toString();
    router.push(`/fahrzeuge${qs ? `?${qs}` : ""}`);
  }

  const ratingValue = rating?.rating ?? SITE.googleRatingFallback.rating;
  const ratingCount = rating?.count ?? SITE.googleRatingFallback.count;

  return (
    <section className="relative">
      {/* Image stage */}
      <div className="relative isolate overflow-hidden bg-navy-950">
        {SLIDES.map((s, i) => (
          <div
            key={s.src}
            className={cx(
              "absolute inset-0 -z-20 transition-opacity duration-[1500ms]",
              i === slide ? "opacity-100" : "opacity-0",
            )}
            aria-hidden={i !== slide}
          >
            <Image
              src={s.src}
              alt={s.alt}
              fill
              priority={i === 0}
              sizes="100vw"
              unoptimized={String(s.src).startsWith("/api/")}
              className={cx(
                "object-cover",
                s.position,
                i === slide && "animate-kenburns",
              )}
            />
          </div>
        ))}
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-navy-950/92 via-navy-950/60 to-navy-950/10" />
        <div className="absolute inset-x-0 top-0 -z-10 h-32 bg-gradient-to-b from-navy-950/75 to-transparent" />

        <div className="container-ac flex min-h-[580px] flex-col justify-center pb-36 pt-28 sm:min-h-[660px] lg:min-h-[730px] lg:pb-40 lg:pt-32">
          <div className="max-w-2xl animate-fade-up">
            <a
              href="#bewertungen"
              className="group inline-flex items-center gap-2 text-[13px] text-white/70 transition hover:text-white"
            >
              <span className="flex">
                {[0, 1, 2, 3, 4].map((i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-star text-star" />
                ))}
              </span>
              <span>
                <span className="font-semibold text-white">
                  {ratingValue.toFixed(1).replace(".", ",")}
                </span>
                {" von 5 · "}
                Google-Bewertungen
              </span>
            </a>

            <h1 className="font-display mt-5 text-[40px] leading-[1.05] text-white sm:text-[52px] lg:text-[64px]">
              Ihr nächstes Auto.
              <br />
              <span className="text-white/55">Geprüft in Jülich.</span>
            </h1>
            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-white/70">
              Sorgfältig ausgewählte Gebrauchtwagen und ehrliche Beratung –
              persönlich bei uns im Showroom.
            </p>

            <div className="mt-6 flex flex-wrap gap-2.5">
              <Link
                href="/fahrzeuge"
                className="inline-flex h-10 items-center rounded-full bg-white px-5 text-[13px] font-semibold text-navy-900 transition hover:bg-accent-300"
              >
                {cars.length
                  ? `${cars.length} Fahrzeuge ansehen`
                  : "Fahrzeuge ansehen"}
              </Link>
              <Link
                href="/kontakt?betreff=Probefahrt%20vereinbaren"
                className="inline-flex h-10 items-center rounded-full border border-white/25 px-5 text-[13px] font-medium text-white transition hover:border-white/50 hover:bg-white/5"
              >
                Probefahrt anfragen
              </Link>
            </div>
          </div>

          {/* Slide dots */}
          <div className="absolute bottom-28 left-1/2 flex -translate-x-1/2 gap-1.5 lg:bottom-32">
            {SLIDES.length > 1
              ? SLIDES.map((s, i) => (
                  <button
                    key={s.src}
                    type="button"
                    onClick={() => setSlide(i)}
                    aria-label={`Bild ${i + 1}`}
                    className={cx(
                      "h-1.5 rounded-full transition-all",
                      i === slide
                        ? "w-6 bg-white"
                        : "w-1.5 bg-white/40 hover:bg-white/70",
                    )}
                  />
                ))
              : null}
          </div>
        </div>
      </div>

      {/* Floating search – clean card, custom dropdowns, compact mirror button */}
      <div className="container-ac relative z-10 -mt-24">
        <form
          onSubmit={submit}
          className="rounded-2xl bg-white p-4 shadow-[0_24px_60px_-24px_rgba(6,15,29,0.55)] ring-1 ring-black/5 sm:p-5"
        >
          <div className="mb-3.5 flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink">
              Fahrzeug finden
            </p>
            <Link
              href="/fahrzeuge"
              className="inline-flex items-center gap-1 text-[12px] font-medium text-muted transition hover:text-ink"
            >
              Erweiterte Suche
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-[repeat(4,minmax(0,1fr))_auto]">
            <Dropdown
              label="Marke"
              placeholder="Alle Marken"
              value={brand}
              onChange={setBrand}
              options={brands.map(([b, n]) => ({ value: b, label: prettyBrand(b), meta: n }))}
            />
            <Dropdown
              label="Preis bis"
              placeholder="Beliebig"
              value={maxPrice}
              onChange={setMaxPrice}
              options={PRICE_STEPS.map((p) => ({ value: String(p), label: `${formatNumber(p)} €` }))}
            />
            <Dropdown
              label="Erstzulassung ab"
              shortLabel="Erstzulassung"
              placeholder="Beliebig"
              value={yearFrom}
              onChange={setYearFrom}
              options={years.map((y) => ({ value: String(y), label: String(y) }))}
            />
            <Dropdown
              label="Kraftstoff"
              placeholder="Beliebig"
              value={fuel}
              onChange={setFuel}
              options={fuels.map((f) => ({ value: f, label: fuelLabel(f) }))}
            />

            <button
              type="submit"
              className="btn-mirror group col-span-2 inline-flex h-12 items-center justify-center gap-2 rounded-lg px-5 text-[13px] font-semibold text-white lg:col-span-1"
            >
              <Search className="h-4 w-4 opacity-80" />
              <span className="tabular-nums">{matchCount}</span>
              {matchCount === 1 ? "Angebot" : "Angebote"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

/** Custom select: label + value field, opens a clean option list. */
function Dropdown({ label, shortLabel, placeholder, value, onChange, options }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const listRef = useRef(null);
  const all = [{ value: "", label: placeholder }, ...options];
  const current = all.find((o) => o.value === value) || all[0];

  useEffect(() => {
    if (!open) return;
    listRef.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: "nearest" });
    const onDown = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function onListKey(e) {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    e.preventDefault();
    const items = [...(listRef.current?.querySelectorAll("button") || [])];
    const i = items.indexOf(document.activeElement);
    const next = e.key === "ArrowDown" ? Math.min(i + 1, items.length - 1) : Math.max(i - 1, 0);
    items[next]?.focus();
  }

  return (
    <div ref={ref} className="relative min-w-0">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" && !open) {
            e.preventDefault();
            setOpen(true);
          }
        }}
        className={cx(
          "flex h-12 w-full items-center gap-2 rounded-lg border bg-canvas/60 px-3.5 text-left transition",
          open ? "border-ink/30 bg-white" : "border-line hover:border-line-strong hover:bg-white",
        )}
      >
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[10px] font-semibold uppercase tracking-[0.08em] text-muted sm:tracking-[0.12em]">
            {shortLabel ? (
              <>
                <span className="sm:hidden">{shortLabel}</span>
                <span className="hidden sm:inline">{label}</span>
              </>
            ) : (
              label
            )}
          </span>
          <span className={cx("block truncate text-[13px] font-medium", value ? "text-ink" : "text-ink/60")}>
            {current.label}
          </span>
        </span>
        <ChevronDown className={cx("h-4 w-4 shrink-0 text-muted transition", open && "rotate-180 text-ink")} />
      </button>

      {open ? (
        <ul
          ref={listRef}
          role="listbox"
          aria-label={label}
          onKeyDown={onListKey}
          className="scroll-slim animate-pop-in absolute left-0 top-full z-30 mt-1.5 max-h-64 w-full overflow-y-auto rounded-xl border border-line bg-white p-1 shadow-float"
        >
          {all.map((o) => {
            const selected = o.value === value;
            return (
              <li key={o.value || "_all"}>
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => {
                    onChange(o.value);
                    setOpen(false);
                  }}
                  className={cx(
                    "flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[13px] outline-none transition hover:bg-canvas focus-visible:bg-canvas",
                    selected ? "font-semibold text-ink" : "text-ink/80",
                  )}
                >
                  <span className="flex-1 truncate">{o.label}</span>
                  {o.meta != null ? <span className="text-[11px] tabular-nums text-muted">{o.meta}</span> : null}
                  <Check className={cx("h-3.5 w-3.5 shrink-0 text-brand-600", !selected && "invisible")} />
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
