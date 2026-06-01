"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";

const FALLBACK_IMAGE = "/placeholder-car.jpg";

function isRemoteImage(src) {
  return typeof src === "string" && /^https?:\/\//i.test(src);
}

function cleanImages(images) {
  if (!Array.isArray(images)) return [];

  const cleaned = images
    .map((img) => (typeof img === "string" ? img.trim() : ""))
    .filter(Boolean);

  return Array.from(new Set(cleaned));
}

export default function ImageSlider({
  images = [],
  alt = "Fahrzeug",
  thumbsCount = 6,
  className = "",
}) {
  const list = useMemo(() => cleanImages(images), [images]);

  const [index, setIndex] = useState(0);

  const total = list.length;
  const canSlide = total > 1;

  const maxThumbs = Math.max(1, Number(thumbsCount) || 6);
  const visibleThumbs = list.slice(0, maxThumbs);
  const remainingThumbs = Math.max(total - maxThumbs, 0);

  const safeIndex = total > 0 ? Math.min(Math.max(index, 0), total - 1) : 0;

  const currentImage = total > 0 ? list[safeIndex] : FALLBACK_IMAGE;

  const goPrev = useCallback(() => {
    if (!canSlide) return;

    setIndex((current) => {
      const normalized = Math.min(Math.max(current, 0), total - 1);
      return normalized === 0 ? total - 1 : normalized - 1;
    });
  }, [canSlide, total]);

  const goNext = useCallback(() => {
    if (!canSlide) return;

    setIndex((current) => {
      const normalized = Math.min(Math.max(current, 0), total - 1);
      return normalized === total - 1 ? 0 : normalized + 1;
    });
  }, [canSlide, total]);

  return (
    <div className={["space-y-4", className].filter(Boolean).join(" ")}>
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-white/10 bg-[rgba(10,20,45,0.35)]">
        <Image
          src={currentImage}
          alt={alt}
          fill
          unoptimized={isRemoteImage(currentImage)}
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 50vw"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />

        {canSlide && (
          <>
            <button
              type="button"
              onClick={goPrev}
              aria-label="Vorheriges Bild"
              className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/40 text-white backdrop-blur-sm transition hover:bg-black/55"
            >
              ←
            </button>

            <button
              type="button"
              onClick={goNext}
              aria-label="Nächstes Bild"
              className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/40 text-white backdrop-blur-sm transition hover:bg-black/55"
            >
              →
            </button>

            <div className="absolute bottom-3 right-3 rounded-full border border-white/15 bg-black/45 px-3 py-1 text-xs text-white/90 backdrop-blur-sm">
              {safeIndex + 1} / {total}
            </div>
          </>
        )}
      </div>

      {canSlide && (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {visibleThumbs.map((src, thumbIndex) => {
            const isActive = thumbIndex === safeIndex;
            const isLastVisibleThumb = thumbIndex === visibleThumbs.length - 1;
            const showMoreOverlay = isLastVisibleThumb && remainingThumbs > 0;

            return (
              <button
                key={`${src}-${thumbIndex}`}
                type="button"
                onClick={() => setIndex(thumbIndex)}
                aria-label={`Bild ${thumbIndex + 1}`}
                className={[
                  "relative aspect-[4/3] overflow-hidden rounded-xl border bg-[rgba(10,20,45,0.35)] transition",
                  isActive
                    ? "border-[var(--accent)]"
                    : "border-white/10 hover:border-white/25",
                ].join(" ")}
              >
                <Image
                  src={src}
                  alt={`${alt} - Bild ${thumbIndex + 1}`}
                  fill
                  unoptimized={isRemoteImage(src)}
                  className="object-cover"
                  sizes="(max-width: 640px) 33vw, (max-width: 1024px) 16vw, 10vw"
                />

                {showMoreOverlay && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/55 text-sm font-semibold text-white">
                    +{remainingThumbs}
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
