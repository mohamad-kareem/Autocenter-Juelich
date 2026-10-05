import { ArrowUpRight, PenLine } from "lucide-react";
import { getGoogleReviews } from "@/lib/googleReviews";
import Stars from "./Stars";
import ReviewsCarousel from "./ReviewsCarousel";
import Reveal from "./Reveal";

export function GoogleReviewsSkeleton() {
  return (
    <section id="bewertungen" className="container-ac mt-14">
      <div className="grid gap-3 lg:grid-cols-[280px_1fr]">
        <div className="h-52 animate-pulse rounded-xl bg-white" />
        <div className="grid gap-3 md:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-52 animate-pulse rounded-xl bg-white" />
          ))}
        </div>
      </div>
    </section>
  );
}

export default async function GoogleReviews() {
  const data = await getGoogleReviews();
  const ratingText = Number(data.rating || 0).toFixed(1).replace(".", ",");

  return (
    <section id="bewertungen" className="container-ac mt-14 scroll-mt-24">
      <Reveal>
        <p className="eyebrow">Kundenstimmen</p>
        <h2 className="section-title mt-2">
          Das sagen <span className="italic text-brand-600">unsere Kunden</span>
        </h2>
      </Reveal>

      <div className="mt-5 grid gap-3 lg:grid-cols-[260px_1fr]">
        <Reveal className="relative overflow-hidden rounded-xl bg-navy-900 p-5 text-white">
          <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-accent-500/20 blur-2xl" />
          <p className="text-xs font-medium text-white/60">Google Bewertungen</p>
          <p className="font-display mt-2 text-6xl leading-none">{ratingText}</p>
          <Stars value={data.rating} size="h-4 w-4" className="mt-2" />
          <p className="mt-1 text-xs text-white/60">basierend auf {data.count} Bewertungen</p>
          <div className="mt-5 grid gap-2">
            <a href={data.mapsUrl} target="_blank" rel="noopener noreferrer" className="btn btn-sm bg-white text-navy-900 hover:bg-brand-50">
              Alle Bewertungen
              <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
            {data.writeReviewUrl ? (
              <a href={data.writeReviewUrl} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-ghost-light">
                <PenLine className="h-3.5 w-3.5" />
                Bewertung schreiben
              </a>
            ) : null}
          </div>
        </Reveal>

        {data.reviews.length ? (
          <ReviewsCarousel reviews={data.reviews} />
        ) : (
          <div className="flex items-center justify-center rounded-xl border border-dashed border-line-strong bg-white p-6 text-center text-sm text-muted">
            Lesen Sie die Erfahrungen unserer Kunden direkt auf Google Maps.
          </div>
        )}
      </div>
    </section>
  );
}
