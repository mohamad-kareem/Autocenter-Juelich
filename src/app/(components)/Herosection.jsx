"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, ChevronDown } from "lucide-react";

const cx = (...c) => c.filter(Boolean).join(" ");

export default function HeroSectionWithSearch({ brands = [] }) {
  const router = useRouter();

  const [currentSlide, setCurrentSlide] = useState(0);
  const autoplayInterval = useRef(null);

  const [brand, setBrand] = useState("ALL");
  const [maxPrice, setMaxPrice] = useState("ANY");

  const heroSlides = useMemo(
    () => [
      {
        id: 1,
        title: "Premium Fahrzeuge",
        subtitle: "Flexibel & schnell",
        description: "Individuelle Raten, fair, transparent und unkompliziert.",
        image: "/center2.jpeg",
      },
      {
        id: 2,
        title: "Top Konditionen",
        subtitle: "Wir finden das passende Angebot",
        description: "Persönliche Beratung, klare Abläufe und starke Lösungen.",
        image: "/center.jpg",
      },
    ],
    [],
  );

  const stopAutoplay = () => {
    if (autoplayInterval.current) clearInterval(autoplayInterval.current);
  };

  const startAutoplay = () => {
    stopAutoplay();
    autoplayInterval.current = setInterval(() => {
      setCurrentSlide((prev) =>
        prev === heroSlides.length - 1 ? 0 : prev + 1,
      );
    }, 9000);
  };

  useEffect(() => {
    startAutoplay();
    return stopAutoplay;
  }, []);

  const goToSlide = (index) => {
    setCurrentSlide(index);
    startAutoplay();
  };

  const handleSearch = (e) => {
    e.preventDefault();

    const params = new URLSearchParams();

    if (brand !== "ALL") params.set("brand", brand);
    if (maxPrice !== "ANY") params.set("max", maxPrice);

    router.push(`/fahrzeuge${params.toString() ? `?${params}` : ""}`);
  };

  return (
    <section className="relative overflow-hidden">
      {/* Shared glow */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[28rem] bg-[radial-gradient(circle_at_50%_0%,rgba(42,107,255,0.14),transparent_60%)]" />
      <div className="pointer-events-none absolute -top-24 left-1/2 h-64 w-[42rem] -translate-x-1/2 rounded-full bg-[rgba(42,107,255,0.18)] blur-[90px]" />

      {/* HERO FULL WIDTH */}
      <div className="w-full ">
        <div className="relative overflow-hidden  border-white/10 bg-[rgba(10,20,45,0.28)] shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
          <div className="relative h-[24rem] sm:h-[27rem] md:h-[38rem] lg:h-[40rem]">
            {heroSlides.map((s, index) => (
              <div
                key={s.id}
                className={cx(
                  "absolute inset-0 transition-opacity duration-1000",
                  index === currentSlide
                    ? "pointer-events-auto z-10 opacity-100"
                    : "pointer-events-none z-0 opacity-0",
                )}
                aria-hidden={index !== currentSlide}
              >
                <div className="absolute inset-0">
                  <Image
                    src={s.image}
                    alt={s.title}
                    fill
                    priority={index === 0}
                    className="object-cover object-center"
                    sizes="100vw"
                  />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(42,107,255,0.22),transparent_45%),linear-gradient(to_right,rgba(4,7,17,0.90),rgba(7,10,26,0.68),rgba(4,7,17,0.30)),linear-gradient(to_bottom,rgba(10,15,38,0.22),transparent_52%,rgba(4,7,17,0.84))]" />
                </div>

                <div className="relative flex h-full items-center">
                  <div className="mx-auto w-full max-w-6xl px-5 sm:px-6">
                    <div className="max-w-xl md:max-w-2xl">
                      <p className="mb-3 text-[11px] sm:text-xs font-semibold uppercase tracking-[0.22em] text-[var(--ac-blue-light)]">
                        AutoCenter Jülich
                      </p>

                      <h1
                        className="text-3xl sm:text-4xl md:text-6xl font-semibold leading-[1.04] text-white"
                        style={{
                          fontFamily:
                            'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
                        }}
                      >
                        {s.title}
                      </h1>

                      <p className="mt-3 text-sm sm:text-base md:text-lg font-medium text-white/90">
                        {s.subtitle}
                      </p>

                      <p className="mt-4 max-w-xl text-xs sm:text-sm md:text-base leading-relaxed text-white/78">
                        {s.description}
                      </p>

                      <div className="mt-7 flex flex-wrap gap-3">
                        <Link
                          href="/fahrzeuge"
                          className="ac-btn-primary inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm sm:px-6 sm:text-base font-semibold"
                        >
                          Fahrzeuge ansehen
                        </Link>

                        <Link
                          href="/kontakt"
                          className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm sm:px-6 sm:text-base font-semibold text-white transition hover:bg-white/10"
                        >
                          Kontakt
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Indicators */}
            <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 gap-2">
              {heroSlides.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => goToSlide(index)}
                  className={cx(
                    "h-2.5 rounded-full transition-all duration-300",
                    index === currentSlide
                      ? "w-9 bg-gradient-to-r from-[#1a5ae6] to-[#2a6bff]"
                      : "w-2.5 bg-white/25 hover:bg-white/45",
                  )}
                  aria-label={`Gehe zu Folie ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* SEARCH PANEL */}
      <div className="relative z-20 -mt-10 px-2 sm:-mt-14 sm:px-4">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-[1.6rem] border border-white/10 bg-[rgba(10,20,45,0.72)] backdrop-blur-xl shadow-[0_24px_60px_rgba(0,0,0,0.34)]">
            <div className="p-4 sm:p-5 md:p-6">
              <div>
                <h3 className="text-base sm:text-lg md:text-xl font-semibold text-white">
                  Gebrauchtwagen finden
                </h3>
                <p className="mt-1 text-[11px] sm:text-xs text-white/50">
                  Marke wählen, Budget festlegen und direkt zu den Ergebnissen
                  wechseln.
                </p>
              </div>

              <form
                onSubmit={handleSearch}
                className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3 items-end"
              >
                <div>
                  <label className="mb-1.5 block text-[11px] sm:text-xs font-medium text-white/60">
                    Marke
                  </label>
                  <div className="relative">
                    <select
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      className="w-full appearance-none rounded-xl border border-white/10 bg-[rgba(255,255,255,0.05)] px-3.5 py-3 pr-10 text-sm text-white outline-none transition focus:border-[rgba(42,107,255,0.6)]"
                    >
                      <option value="ALL" className="bg-[#0a0f26] text-white">
                        Alle
                      </option>
                      {brands.map((b) => (
                        <option
                          key={b}
                          value={b}
                          className="bg-[#0a0f26] text-white"
                        >
                          {b}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/55" />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-[11px] sm:text-xs font-medium text-white/60">
                    Budget bis
                  </label>
                  <div className="relative">
                    <select
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="w-full appearance-none rounded-xl border border-white/10 bg-[rgba(255,255,255,0.05)] px-3.5 py-3 pr-10 text-sm text-white outline-none transition focus:border-[rgba(42,107,255,0.6)]"
                    >
                      <option value="ANY" className="bg-[#0a0f26] text-white">
                        Beliebig
                      </option>
                      <option value="3000" className="bg-[#0a0f26] text-white">
                        3.000 €
                      </option>
                      <option value="5000" className="bg-[#0a0f26] text-white">
                        5.000 €
                      </option>
                      <option value="10000" className="bg-[#0a0f26] text-white">
                        10.000 €
                      </option>
                      <option value="15000" className="bg-[#0a0f26] text-white">
                        15.000 €
                      </option>
                      <option value="20000" className="bg-[#0a0f26] text-white">
                        20.000 €
                      </option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/55" />
                  </div>
                </div>

                <button
                  type="submit"
                  className="ac-btn-primary flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm sm:text-base font-semibold"
                >
                  <Search className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span>Suchen</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
