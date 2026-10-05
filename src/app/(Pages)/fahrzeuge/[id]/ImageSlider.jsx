"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";

const FALLBACK_IMAGE = "/placeholder-car.svg";
const cx = (...c) => c.filter(Boolean).join(" ");

function isRemoteImage(src) {
  return typeof src === "string" && /^https?:\/\//i.test(src);
}

export default function ImageSlider({ images = [], alt = "Fahrzeug", className = "" }) {
  const list = useMemo(
    () => [...new Set((Array.isArray(images) ? images : []).map((s) => (typeof s === "string" ? s.trim() : "")).filter(Boolean))],
    [images],
  );
  const total = list.length;
  const [index, setIndex] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const thumbsRef = useRef(null);
  const touch = useRef(null);

  const current = total ? list[Math.min(index, total - 1)] : FALLBACK_IMAGE;

  const go = useCallback(
    (dir) => {
      if (total < 2) return;
      setIndex((i) => (i + dir + total) % total);
    },
    [total],
  );

  useEffect(() => {
    const box = thumbsRef.current;
    const el = box?.querySelector(`[data-thumb="${index}"]`);
    if (box && el) {
      box.scrollTo({ left: el.offsetLeft - box.clientWidth / 2 + el.clientWidth / 2, behavior: "smooth" });
    }
  }, [index]);

  useEffect(() => {
    const onKey = (e) => {
      const tag = e.target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || e.target?.isContentEditable) return;
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
      if (e.key === "Escape") setLightbox(false);
    };
    document.addEventListener("keydown", onKey);
    document.documentElement.style.overflow = lightbox ? "hidden" : "";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
    };
  }, [go, lightbox]);

  const swipe = {
    onTouchStart: (e) => (touch.current = e.touches[0].clientX),
    onTouchEnd: (e) => {
      if (touch.current == null) return;
      const dx = e.changedTouches[0].clientX - touch.current;
      if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
      touch.current = null;
    },
  };

  const renderNav = (dark = false) =>
    total > 1 ? (
      <>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            go(-1);
          }}
          aria-label="Vorheriges Bild"
          className={cx(
            "absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full shadow-md transition",
            dark ? "bg-white/10 text-white hover:bg-white/20" : "bg-white/90 text-ink hover:bg-white",
          )}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            go(1);
          }}
          aria-label="Nächstes Bild"
          className={cx(
            "absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full shadow-md transition",
            dark ? "bg-white/10 text-white hover:bg-white/20" : "bg-white/90 text-ink hover:bg-white",
          )}
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </>
    ) : null;

  return (
    <div className={cx("space-y-2", className)}>
      <div
        className="group relative aspect-[3/2] cursor-zoom-in overflow-hidden rounded-lg bg-navy-950"
        onClick={() => total && setLightbox(true)}
        {...swipe}
      >
        <Image
          src={current}
          alt={`${alt} – Bild ${index + 1}`}
          fill
          priority
          unoptimized={isRemoteImage(current)}
          className="object-contain"
          sizes="(max-width: 1024px) 100vw, 60vw"
        />
        {renderNav()}
        {total ? (
          <div className="absolute bottom-3 right-3 flex items-center gap-2">
            <span className="chip bg-black/60 font-medium text-white">
              {index + 1} / {total}
            </span>
            <span className="chip bg-black/60 font-medium text-white">
              <Expand className="h-3 w-3" /> Vollbild
            </span>
          </div>
        ) : null}
      </div>

      {total > 1 ? (
        <div ref={thumbsRef} className="no-scrollbar relative flex gap-2 overflow-x-auto pb-1">
          {list.map((src, i) => (
            <button
              key={`${src}-${i}`}
              type="button"
              data-thumb={i}
              onClick={() => setIndex(i)}
              aria-label={`Bild ${i + 1}`}
              className={cx(
                "relative aspect-[4/3] w-20 shrink-0 overflow-hidden rounded ring-2 transition",
                i === index ? "ring-brand-600" : "opacity-70 ring-transparent hover:opacity-100",
              )}
            >
              <Image src={src} alt="" fill unoptimized={isRemoteImage(src)} className="object-cover" sizes="112px" />
            </button>
          ))}
        </div>
      ) : null}

      {lightbox ? (
        <div className="fixed inset-0 z-[100] flex flex-col bg-navy-950/95" role="dialog" aria-label="Bildergalerie">
          <div className="flex items-center justify-between px-4 py-3 text-white">
            <span className="text-sm text-white/70">
              {index + 1} / {total}
            </span>
            <button
              type="button"
              onClick={() => setLightbox(false)}
              aria-label="Schließen"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="relative flex-1" {...swipe}>
            <Image
              src={current}
              alt={`${alt} – Bild ${index + 1}`}
              fill
              unoptimized={isRemoteImage(current)}
              className="object-contain"
              sizes="100vw"
            />
            {renderNav(true)}
          </div>
        </div>
      ) : null}
    </div>
  );
}
