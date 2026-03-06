"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

const formatPrice = (n) =>
  new Intl.NumberFormat("de-DE").format(Number(n || 0));

const formatKm = (n) => new Intl.NumberFormat("de-DE").format(Number(n || 0));

const FUEL_LABELS = {
  PETROL: "Benzin",
  DIESEL: "Diesel",
  ELECTRICITY: "Elektro",
  HYBRID: "Hybrid",
  HYBRID_DIESEL: "Hybrid (Diesel)",
  LPG: "LPG",
  CNG: "CNG",
};

const GEARBOX_LABELS = {
  AUTOMATIC_GEAR: "Automatik",
  SEMIAUTOMATIC_GEAR: "Halbautomatik",
  MANUAL_GEAR: "Schaltung",
};

function firstWords(text, count = 4) {
  return String(text || "")
    .replace(/\*/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .slice(0, count)
    .join(" ");
}

function Spec({ label }) {
  if (!label) return null;

  return (
    <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-white/75">
      {label}
    </span>
  );
}

export default function FeaturedCarsSlider({ cars = [] }) {
  const scrollRef = useRef(null);
  const autoplayRef = useRef(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);

  const sliderCars = useMemo(() => {
    return cars.filter((car) => !car?.isSold).slice(0, 8);
  }, [cars]);

  const updateButtons = () => {
    const el = scrollRef.current;
    if (!el) return;

    setCanLeft(el.scrollLeft > 10);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 10);
  };

  const scrollByCard = (dir = 1) => {
    const el = scrollRef.current;
    if (!el) return;

    const card = el.querySelector("[data-slider-card]");
    const gap = 24;
    const step = card ? card.clientWidth + gap : 380;

    el.scrollBy({
      left: dir * step,
      behavior: "smooth",
    });
  };

  const startAutoplay = () => {
    stopAutoplay();
    autoplayRef.current = setInterval(() => {
      const el = scrollRef.current;
      if (!el) return;

      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 10;

      if (atEnd) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        scrollByCard(1);
      }
    }, 5000);
  };

  const stopAutoplay = () => {
    if (autoplayRef.current) clearInterval(autoplayRef.current);
  };

  useEffect(() => {
    updateButtons();
    startAutoplay();

    const el = scrollRef.current;
    if (!el) return;

    const onScroll = () => updateButtons();
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", updateButtons);

    return () => {
      stopAutoplay();
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", updateButtons);
    };
  }, [sliderCars.length]);

  if (!sliderCars.length) return null;

  return (
    <section className="relative py-16 sm:py-20 ac-page">
      <div className="mx-auto max-w-7xl px-4">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <div className="mb-3 h-px w-14 bg-gradient-to-r from-[var(--ac-blue)] to-[var(--ac-cyan)]" />
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--ac-blue-light)]">
              Fahrzeugauswahl
            </p>
            <h2 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-light tracking-tight text-[var(--ac-text)]">
              Aktuelle <span className="font-semibold">Top Fahrzeuge</span>
            </h2>
            <p className="mt-3 text-sm sm:text-base leading-relaxed text-[var(--ac-muted)]">
              Eine Auswahl aus unserem aktuellen Bestand – modern präsentiert
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                stopAutoplay();
                scrollByCard(-1);
              }}
              disabled={!canLeft}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Zurück"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <button
              type="button"
              onClick={() => {
                stopAutoplay();
                scrollByCard(1);
              }}
              disabled={!canRight}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Weiter"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Slider wrapper */}
        <div className="relative">
          <div className="pointer-events-none absolute -left-6 top-0 z-10 hidden h-full w-20   lg:block" />
          <div className="pointer-events-none absolute -right-6 top-0 z-10 hidden h-full w-20   lg:block" />

          <div
            ref={scrollRef}
            className="no-scrollbar flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth pb-2"
            onMouseEnter={stopAutoplay}
            onMouseLeave={startAutoplay}
          >
            {sliderCars.map((car) => {
              const img = car.images?.[0] || "/placeholder-car.jpg";
              const title = firstWords(car.title, 5) || car.title || "Fahrzeug";

              const fuel = car.fuel ? FUEL_LABELS[car.fuel] || car.fuel : null;
              const gearbox = car.gearbox
                ? GEARBOX_LABELS[car.gearbox] || car.gearbox
                : null;
              const km = car.km ? `${formatKm(car.km)} km` : null;
              const year = car.year ? String(car.year) : null;

              return (
                <Link
                  key={car.id || `${car.title}-${img}`}
                  href={`/fahrzeuge/${car.id}`}
                  data-slider-card
                  className="group relative min-w-[85%] snap-start overflow-hidden rounded-3xl border border-white/10 bg-[rgba(10,20,45,0.42)] shadow-[0_20px_60px_rgba(0,0,0,0.35)] transition hover:-translate-y-1 hover:bg-[rgba(10,20,45,0.52)] sm:min-w-[420px] lg:min-w-[370px] xl:min-w-[390px]"
                >
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <Image
                      src={img}
                      alt={title}
                      fill
                      className="object-cover transition duration-700 group-hover:scale-105"
                      sizes="(max-width: 640px) 85vw, (max-width: 1024px) 420px, 390px"
                    />

                    <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(4,7,17,0.95),rgba(4,7,17,0.18),transparent)]" />

                    <div className="absolute left-4 top-4">
                      <span className="rounded-full border border-white/10 bg-black/35 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white backdrop-blur-sm">
                        AutoCenter Jülich
                      </span>
                    </div>

                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="mb-2 text-2xl font-extrabold text-white">
                        {formatPrice(car.price)} €
                      </div>

                      <h3 className="line-clamp-1 text-base sm:text-lg font-semibold text-white">
                        {title}
                      </h3>

                      <p className="mt-1 text-xs text-white/75">
                        {car.location || "Jülich"}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 sm:p-5">
                    <div className="flex flex-wrap gap-2">
                      <Spec label={year} />
                      <Spec label={km} />
                      <Spec label={fuel} />
                      <Spec label={gearbox} />
                    </div>

                    <div className="mt-5 flex items-center justify-between">
                      <span className="text-sm font-medium text-[var(--ac-muted)] transition group-hover:text-white">
                        Details ansehen
                      </span>

                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/80 transition group-hover:bg-white/10 group-hover:text-white">
                        →
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-10 text-center">
          <Link
            href="/fahrzeuge"
            className="ac-btn-primary inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm sm:text-base font-semibold"
          >
            Alle Fahrzeuge ansehen
          </Link>
        </div>
      </div>
    </section>
  );
}
