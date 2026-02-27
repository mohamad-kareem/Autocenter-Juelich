"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import Image from "next/image";

export default function ImageSlider({
  images = [],
  alt = "Fahrzeug",
  thumbsCount = 6,
  className = "",
}) {
  const list = useMemo(() => {
    const arr = Array.isArray(images) ? images : [];
    // remove empty values + duplicates
    const cleaned = arr
      .map((v) => (typeof v === "string" ? v.trim() : ""))
      .filter(Boolean);
    return [...new Set(cleaned)];
  }, [images]);

  const [index, setIndex] = useState(0);

  const safeIndex = list.length
    ? Math.min(Math.max(index, 0), list.length - 1)
    : 0;
  const current = list[safeIndex] || "/placeholder-car.jpg";

  const goPrev = useCallback(() => {
    if (list.length <= 1) return;
    setIndex((i) => (i - 1 + list.length) % list.length);
  }, [list.length]);

  const goNext = useCallback(() => {
    if (list.length <= 1) return;
    setIndex((i) => (i + 1) % list.length);
  }, [list.length]);

  const canSlide = list.length > 1;
  const THUMBS = Math.max(1, Number(thumbsCount) || 6);

  if (!list.length) {
    return (
      <div
        className={[
          "relative aspect-[4/3] rounded-2xl overflow-hidden border border-white/10 bg-[rgba(10,20,45,0.35)]",
          className,
        ].join(" ")}
      >
        <Image
          src="/placeholder-car.jpg"
          alt={alt}
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 50vw"
          priority
        />
      </div>
    );
  }

  return (
    <div className={["space-y-4", className].join(" ")}>
      {/* Main */}
      <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-white/10 bg-[rgba(10,20,45,0.35)]">
        <Image
          src={current}
          alt={alt}
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 50vw"
          priority
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />

        {/* Controls */}
        {canSlide && (
          <>
            <button
              type="button"
              onClick={goPrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full border border-white/15 bg-black/40 backdrop-blur-sm text-white hover:bg-black/55 transition flex items-center justify-center"
              aria-label="Vorheriges Bild"
            >
              ←
            </button>

            <button
              type="button"
              onClick={goNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full border border-white/15 bg-black/40 backdrop-blur-sm text-white hover:bg-black/55 transition flex items-center justify-center"
              aria-label="Nächstes Bild"
            >
              →
            </button>

            <div className="absolute bottom-3 right-3 rounded-full border border-white/15 bg-black/45 px-3 py-1 text-xs text-white/90 backdrop-blur-sm">
              {safeIndex + 1} / {list.length}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails (max 6) */}
      {canSlide && (
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {list.slice(0, THUMBS).map((src, i) => {
            const active = i === safeIndex;
            const remaining = list.length - THUMBS;

            return (
              <button
                key={`${src}-${i}`}
                type="button"
                onClick={() => setIndex(i)}
                className={[
                  "relative aspect-[4/3] rounded-xl overflow-hidden border bg-[rgba(10,20,45,0.35)] transition",
                  active
                    ? "border-[var(--accent)]"
                    : "border-white/10 hover:border-white/25",
                ].join(" ")}
                aria-label={`Bild ${i + 1}`}
              >
                <Image
                  src={src}
                  alt={`${alt} - Bild ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 33vw, (max-width: 1024px) 16vw, 10vw"
                />

                {/* +X overlay on last thumb if there are more */}
                {i === THUMBS - 1 && remaining > 0 && (
                  <div className="absolute inset-0 bg-black/55 flex items-center justify-center text-white font-semibold text-sm">
                    +{remaining}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
