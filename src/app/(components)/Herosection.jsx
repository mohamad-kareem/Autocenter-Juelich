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

  // ✅ Dynamic filters
  const [brand, setBrand] = useState("ALL");
  const [maxPrice, setMaxPrice] = useState("ANY");

  const heroSlides = useMemo(
    () => [
      {
        id: 1,
        title: "Premium Fahrzeuge",
        subtitle: "Flexibel & schnell",
        description: "Individuelle Raten, fair & transparent.",
        image: "/center.jpg",
      },
      {
        id: 2,
        title: "Top Konditionen",
        subtitle: "Wir finden das passende Angebot.",
        description: "Persönliche Beratung & klare Abläufe.",
        image: "/backcenter.avif",
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const goToSlide = (index) => {
    setCurrentSlide(index);
    startAutoplay();
  };

  // ✅ IMPORTANT: match your FahrzeugeClient query keys:
  // brands => "brand" (comma separated)
  // maxPrice => "max"
  const handleSearch = (e) => {
    e.preventDefault();

    const params = new URLSearchParams();

    if (brand !== "ALL") params.set("brand", brand); // your client parses parseMulti(sp,"brand")
    if (maxPrice !== "ANY") params.set("max", maxPrice); // your client uses sp.get("max")

    router.push(`/fahrzeuge${params.toString() ? `?${params}` : ""}`);
  };

  return (
    <section className="relative overflow-hidden">
      {/* fix “white background” */}
      <div className="absolute inset-0 ac-page" />
      <div className="pointer-events-none absolute -top-24 left-1/2 h-64 w-[42rem] -translate-x-1/2 rounded-full bg-[rgba(42,107,255,0.22)] blur-[90px]" />

      {/* HERO SLIDER */}
      <div className="relative overflow-hidden">
        <div className="relative h-[24rem] sm:h-[26rem] md:h-[38rem] lg:h-[36rem]">
          {heroSlides.map((s, index) => (
            <div
              key={s.id}
              className={cx(
                "absolute inset-0 transition-opacity duration-1000",
                index === currentSlide
                  ? "opacity-100 pointer-events-auto z-10"
                  : "opacity-0 pointer-events-none z-0",
              )}
              aria-hidden={index !== currentSlide}
            >
              {/* Background */}
              <div className="absolute inset-0">
                <Image
                  src={s.image}
                  alt={s.title}
                  fill
                  priority={index === 0}
                  className="object-cover object-center"
                  sizes="100vw"
                />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(42,107,255,0.25),transparent_45%),linear-gradient(to_right,rgba(4,7,17,0.92),rgba(7,10,26,0.70),rgba(4,7,17,0.35)),linear-gradient(to_bottom,rgba(10,15,38,0.35),transparent_55%,rgba(4,7,17,0.88))]" />
              </div>

              {/* Content */}
              <div className="relative h-full flex items-center">
                <div className="mx-auto w-full max-w-6xl px-4">
                  <div className="max-w-xl md:max-w-2xl">
                    <h2
                      className="text-3xl sm:text-4xl md:text-6xl font-semibold leading-[1.05] text-white"
                      style={{
                        fontFamily:
                          'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
                      }}
                    >
                      {s.title}
                    </h2>

                    <p className="mt-2 text-sm sm:text-base md:text-lg font-medium text-white/90">
                      {s.subtitle}
                    </p>

                    <p className="mt-4 text-xs sm:text-sm md:text-base text-white/80 max-w-xl leading-relaxed">
                      {s.description}
                    </p>

                    <div className="mt-6 md:mt-8 flex flex-wrap gap-2 sm:gap-3">
                      <Link
                        href="/fahrzeuge"
                        className="ac-btn-primary rounded-xl px-4 py-2.5 text-sm sm:px-5 sm:py-3 md:px-6 md:py-3.5 md:text-base font-semibold inline-flex items-center justify-center"
                      >
                        Fahrzeuge ansehen
                      </Link>

                      <Link
                        href="/kontakt"
                        className="rounded-xl px-4 py-2.5 text-sm sm:px-5 sm:py-3 md:px-6 md:py-3.5 md:text-base font-semibold inline-flex items-center justify-center border border-white/15 bg-white/5 text-white hover:bg-white/10 transition"
                      >
                        Kontakt →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Indicators */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
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

      {/* ✅ DYNAMIC SEARCH PANEL */}
      <div className="relative z-20 -mt-10 sm:-mt-14 px-4 pb-8">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-2xl border border-white/10 bg-[rgba(10,20,45,0.55)] backdrop-blur-xl shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
            <div className="p-4 sm:p-5 md:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-base sm:text-lg md:text-xl font-semibold text-white">
                    Gebrauchtwagen finden
                  </h3>
                  <p className="mt-1 text-[11px] sm:text-xs text-white/50">
                    Marke wählen, Budget setzen — direkt zu den Ergebnissen.
                  </p>
                </div>
              </div>

              <form
                onSubmit={handleSearch}
                className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 items-end"
              >
                {/* Marke */}
                <div>
                  <label className="block text-[11px] sm:text-xs font-medium text-white/60 mb-1.5">
                    Marke
                  </label>
                  <div className="relative">
                    <select
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      className="w-full appearance-none rounded-xl border border-white/10 bg-[rgba(255,255,255,0.05)] px-3.5 py-3 pr-10 text-sm text-white outline-none focus:border-[rgba(42,107,255,0.6)]"
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
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/55" />
                  </div>
                </div>

                {/* Budget */}
                <div>
                  <label className="block text-[11px] sm:text-xs font-medium text-white/60 mb-1.5">
                    Budget bis
                  </label>
                  <div className="relative">
                    <select
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="w-full appearance-none rounded-xl border border-white/10 bg-[rgba(255,255,255,0.05)] px-3.5 py-3 pr-10 text-sm text-white outline-none focus:border-[rgba(42,107,255,0.6)]"
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
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/55" />
                  </div>
                </div>

                <button
                  type="submit"
                  className="ac-btn-primary w-full rounded-xl px-4 py-3 text-sm sm:text-base font-semibold flex items-center justify-center gap-2"
                >
                  <Search className="w-4 h-4 sm:w-5 sm:h-5" />
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
