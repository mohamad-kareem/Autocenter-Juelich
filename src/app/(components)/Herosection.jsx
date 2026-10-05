"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Search, Star } from "lucide-react";
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
              Ausgewählte Gebrauchtwagen, faire Finanzierung und CarGarantie® –
              persönlich im Showroom.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/fahrzeuge"
                className="inline-flex h-12 items-center rounded-full bg-white px-6 text-sm font-semibold text-navy-900 transition hover:bg-accent-300"
              >
                {cars.length
                  ? `${cars.length} Fahrzeuge ansehen`
                  : "Fahrzeuge ansehen"}
              </Link>
              <Link
                href="/kontakt?betreff=Probefahrt%20vereinbaren"
                className="inline-flex h-12 items-center rounded-full border border-white/25 px-6 text-sm font-medium text-white transition hover:border-white/50 hover:bg-white/5"
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

      {/* Floating search panel */}
      <div className="container-ac relative z-10 -mt-24 lg:-mt-24">
        <form
          onSubmit={submit}
          className="rounded-xl bg-white p-3 shadow-[0_20px_50px_-12px_rgba(6,15,29,0.35)] ring-1 ring-black/5 sm:p-4"
        >
          <div className="mb-3 flex items-center justify-between">
            <p className="flex items-center gap-2 text-sm font-semibold text-ink">
              <Search className="h-4 w-4 text-brand-600" />
              Fahrzeug finden
            </p>
            <Link
              href="/fahrzeuge"
              className="link hidden items-center gap-0.5 text-xs sm:inline-flex"
            >
              Erweiterte Suche
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-[1.3fr_1fr_1fr_1fr_auto]">
            <div className="col-span-2 lg:col-span-1">
              <label htmlFor="hs-brand" className="label">
                Marke
              </label>
              <select
                id="hs-brand"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="field"
              >
                <option value="">Alle Marken</option>
                {brands.map(([b, n]) => (
                  <option key={b} value={b}>
                    {prettyBrand(b)} ({n})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="hs-price" className="label">
                Preis bis
              </label>
              <select
                id="hs-price"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="field"
              >
                <option value="">Beliebig</option>
                {PRICE_STEPS.map((p) => (
                  <option key={p} value={p}>
                    {formatNumber(p)} €
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="hs-year" className="label">
                Erstzulassung ab
              </label>
              <select
                id="hs-year"
                value={yearFrom}
                onChange={(e) => setYearFrom(e.target.value)}
                className="field"
              >
                <option value="">Beliebig</option>
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label htmlFor="hs-fuel" className="label">
                Kraftstoff
              </label>
              <select
                id="hs-fuel"
                value={fuel}
                onChange={(e) => setFuel(e.target.value)}
                className="field"
              >
                <option value="">Beliebig</option>
                {fuels.map((f) => (
                  <option key={f} value={f}>
                    {fuelLabel(f)}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-2 flex items-end sm:col-span-1">
              <button
                type="submit"
                className="btn btn-primary w-full lg:w-auto lg:min-w-44"
              >
                <Search className="h-4 w-4" />
                {matchCount} {matchCount === 1 ? "Angebot" : "Angebote"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}
