"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Search } from "lucide-react";

const cx = (...c) => c.filter(Boolean).join(" ");

export default function HeroSectionWithSearch() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const autoplayInterval = useRef(null);

  const heroSlides = useMemo(
    () => [
      {
        id: 1,
        title: "Premium Fahrzeuge",
        subtitle: "Flexibel & schnell",
        description: "Individuelle Raten, fair & transparent.",
        ctaText: "Fahrzeuge ansehen",
        image: "/center.jpg",
      },
      {
        id: 2,
        title: "Premium Fahrzeuge",
        subtitle: "Top Konditionen",
        description: "Wir finden das passende Angebot.",
        ctaText: "Fahrzeuge ansehen",
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

  const handleSearch = (e) => {
    e.preventDefault();
    // TODO: route with query params (brand + max price)
  };

  return (
    <section className="relative">
      {/* ===== HERO SLIDER ===== */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 ac-page" />

        <div className="relative h-[20rem] sm:h-[22rem] md:h-[34rem] lg:h-[32rem]">
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
                <div className="absolute inset-0 bg-gradient-to-r from-[#040711]/90 via-[#070a1a]/70 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-b from-[#0a0f26]/40 via-transparent to-[#040711]/80" />
              </div>

              {/* Content */}
              <div className="relative h-full flex items-center">
                <div className="mx-auto w-full max-w-6xl px-4">
                  <div className="max-w-xl md:max-w-2xl">
                    <h2
                      className="text-2xl sm:text-3xl md:text-5xl font-semibold leading-tight text-white"
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

                    <p className="mt-3 md:mt-4 text-xs sm:text-sm md:text-base text-white/80 max-w-lg">
                      {s.description}
                    </p>

                    <div className="mt-5 md:mt-7 flex flex-wrap gap-2 sm:gap-3">
                      <button className="ac-btn-primary rounded-xl px-4 py-2 text-sm sm:px-5 sm:py-2.5 md:px-6 md:py-3 md:text-base font-semibold">
                        {s.ctaText}
                      </button>

                      <button className="ac-btn-ghost rounded-xl px-4 py-2 text-sm sm:px-5 sm:py-2.5 md:px-6 md:py-3 md:text-base font-semibold">
                        Mehr Infos →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Indicators */}
          <div className="absolute bottom-5 md:bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
            {heroSlides.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => goToSlide(index)}
                className={cx(
                  "h-2.5 rounded-full transition-all duration-300",
                  index === currentSlide
                    ? "w-8 bg-gradient-to-r from-[#1a5ae6] to-[#2a6bff]"
                    : "w-2.5 bg-white/30 hover:bg-white/50",
                )}
                aria-label={`Gehe zu Folie ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ===== COMPACT SEARCH PANEL (USED CARS ONLY) ===== */}
      <div className="relative z-10 -mt-10 sm:-mt-12 px-4">
        <div className="mx-auto max-w-6xl">
          <div className="ac-panel rounded-2xl border border-[rgba(26,90,230,0.12)] p-3 sm:p-4 md:p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3
                  className="text-sm sm:text-base md:text-lg font-semibold text-white"
                  style={{
                    fontFamily:
                      'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
                  }}
                >
                  Gebrauchtwagen finden
                </h3>
                <p className="mt-0.5 text-[11px] sm:text-xs text-white/45">
                  Marke wählen, Budget setzen — fertig.
                </p>
              </div>
            </div>

            <form
              onSubmit={handleSearch}
              className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 items-end"
            >
              {/* Marke */}
              <div>
                <label className="block text-[11px] sm:text-xs font-medium text-white/60 mb-1">
                  Marke
                </label>
                <select className="ac-field w-full rounded-xl px-3 py-2.5 text-sm appearance-none">
                  <option className="bg-[#0a0f26] text-white">Alle</option>
                  <option className="bg-[#0a0f26] text-white">Audi</option>
                  <option className="bg-[#0a0f26] text-white">BMW</option>
                  <option className="bg-[#0a0f26] text-white">Mercedes</option>
                  <option className="bg-[#0a0f26] text-white">
                    Volkswagen
                  </option>
                </select>
              </div>

              {/* Budget */}
              <div>
                <label className="block text-[11px] sm:text-xs font-medium text-white/60 mb-1">
                  Budget bis
                </label>
                <select className="ac-field w-full rounded-xl px-3 py-2.5 text-sm appearance-none">
                  <option className="bg-[#0a0f26] text-white">Beliebig</option>
                  <option className="bg-[#0a0f26] text-white">10.000€</option>
                  <option className="bg-[#0a0f26] text-white">20.000€</option>
                  <option className="bg-[#0a0f26] text-white">30.000€</option>
                  <option className="bg-[#0a0f26] text-white">50.000€</option>
                  <option className="bg-[#0a0f26] text-white">75.000€</option>
                </select>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="ac-btn-primary w-full rounded-xl px-4 py-2.5 sm:px-5 sm:py-3 text-sm sm:text-base font-semibold flex items-center justify-center gap-2"
              >
                <Search className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Suchen</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
