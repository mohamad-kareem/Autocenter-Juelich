import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, MapPin, Repeat, ShieldCheck, Star, Wallet } from "lucide-react";
import Reveal from "./Reveal";
import { SITE } from "@/lib/site";

const BENEFITS = [
  {
    icon: BadgeCheck,
    title: "Geprüfte Fahrzeuge",
    text: "Gepflegt, ehrlich beschrieben, ohne Überraschungen.",
  },
  {
    icon: Wallet,
    title: "Flexible Finanzierung",
    text: "12 bis 84 Monate, mit oder ohne Anzahlung.",
    href: "/finanzierung",
  },
  {
    icon: ShieldCheck,
    title: "CarGarantie®",
    text: "12 bis 36 Monate für Motor, Getriebe und Elektronik.",
    href: "/garantie",
  },
  {
    icon: Repeat,
    title: "Inzahlungnahme",
    text: "Faire Bewertung, direkt verrechnet.",
    href: "/kontakt?betreff=Inzahlungnahme%20anfragen",
  },
];

/** "Warum wir" – clean split section: one showroom photo + benefit list. */
export default function Features({ rating, image }) {
  const photo = image?.src ? image : { src: "/center2.jpeg", alt: "Fahrzeuge im Showroom von Autocenter Jülich" };
  const ratingValue = (rating?.rating ?? SITE.googleRatingFallback.rating).toFixed(1).replace(".", ",");
  const ratingCount = rating?.count ?? SITE.googleRatingFallback.count;

  return (
    <section className="mt-14">
      <div className="container-ac grid items-center gap-10 py-6 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:py-8">
        {/* Photo */}
        <Reveal className="relative overflow-hidden rounded-2xl ring-1 ring-line">
          <div className="relative aspect-[4/3] w-full">
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              unoptimized={String(photo.src).startsWith("/api/")}
              className="object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy-950/90 via-navy-950/40 to-transparent p-4 pt-14">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-white">
                  <span className="flex">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-star text-star" />
                    ))}
                  </span>
                  <span className="text-[13px]">
                    <strong className="font-semibold">{ratingValue}</strong>
                    <span className="text-white/60"> · {ratingCount} Google-Bewertungen</span>
                  </span>
                </span>
                <span className="flex items-center gap-1.5 text-[12px] text-white/70">
                  <MapPin className="h-3.5 w-3.5 text-accent-400" />
                  {SITE.street}, {SITE.city}
                </span>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Benefits */}
        <div>
          <Reveal>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
              Warum Autocenter Jülich
            </p>
            <h2 className="font-display mt-3 text-[34px] leading-[1.1] text-ink sm:text-[44px]">
              Autokauf mit gutem Gefühl.
            </h2>
          </Reveal>

          <ul className="mt-7">
            {BENEFITS.map(({ icon: Icon, ...b }, i) => {
              const inner = (
                <>
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 ring-1 ring-line transition group-hover:bg-brand-100">
                    <Icon className="h-[17px] w-[17px]" />
                  </span>
                  <span className="min-w-0">
                    <span className="flex items-center gap-1.5 text-[14px] font-semibold text-ink">
                      {b.title}
                      {b.href ? (
                        <ArrowRight className="h-3.5 w-3.5 text-brand-600 opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100" />
                      ) : null}
                    </span>
                    <span className="mt-0.5 block text-[13px] leading-relaxed text-muted">{b.text}</span>
                  </span>
                </>
              );
              return (
                <Reveal
                  as="li"
                  key={b.title}
                  delay={i * 70}
                  className="border-t border-line first:border-t-0"
                >
                  {b.href ? (
                    <Link href={b.href} className="group flex items-start gap-3.5 py-3.5">
                      {inner}
                    </Link>
                  ) : (
                    <div className="group flex items-start gap-3.5 py-3.5">{inner}</div>
                  )}
                </Reveal>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
