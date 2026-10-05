import Link from "next/link";
import { ArrowUpRight, BadgePercent, Cog, Gauge, Leaf, Mountain, Sparkles } from "lucide-react";
import Reveal from "./Reveal";

/**
 * Quick-entry tiles into the vehicle search (only tiles with results are shown).
 * @param {{ cars: Array<ReturnType<import("@/lib/cars").toCardCar>> }} props
 */
export default function QuickFilters({ cars = [] }) {
  const tiles = [
    {
      title: "Bis 10.000 €",
      text: "Günstig einsteigen",
      href: "/fahrzeuge?max=10000&sort=price-asc",
      icon: BadgePercent,
      count: cars.filter((c) => c.price && c.price <= 10000).length,
      tone: "from-emerald-500 to-teal-500",
    },
    {
      title: "Automatik",
      text: "Entspannt fahren",
      href: "/fahrzeuge?gearbox=AUTOMATIC_GEAR",
      icon: Cog,
      count: cars.filter((c) => c.gearbox === "AUTOMATIC_GEAR").length,
      tone: "from-brand-500 to-indigo-500",
    },
    {
      title: "SUV & Geländewagen",
      text: "Mehr Platz, mehr Übersicht",
      href: "/fahrzeuge?cat=OffRoad",
      icon: Mountain,
      count: cars.filter((c) => c.category === "OffRoad").length,
      tone: "from-amber-500 to-orange-500",
    },
    {
      title: "Elektro & Hybrid",
      text: "Effizient unterwegs",
      href: "/fahrzeuge?fuel=ELECTRICITY,HYBRID,HYBRID_DIESEL",
      icon: Leaf,
      count: cars.filter((c) => ["ELECTRICITY", "HYBRID", "HYBRID_DIESEL"].includes(c.fuel)).length,
      tone: "from-lime-500 to-emerald-500",
    },
    {
      title: "Wenig Kilometer",
      text: "Unter 50.000 km",
      href: "/fahrzeuge?km=50000",
      icon: Gauge,
      count: cars.filter((c) => c.km != null && c.km <= 50000).length,
      tone: "from-sky-500 to-cyan-500",
    },
    {
      title: "Neu eingetroffen",
      text: "Frisch im Bestand",
      href: "/fahrzeuge?sort=newest",
      icon: Sparkles,
      count: cars.length,
      tone: "from-fuchsia-500 to-pink-500",
    },
  ].filter((t) => t.count > 0);

  if (!tiles.length) return null;

  return (
    <section className="container-ac mt-10">
      <div className="no-scrollbar -mx-4 flex snap-x scroll-px-4 gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 lg:flex">
        {tiles.map(({ icon: Icon, ...t }, i) => (
          <Reveal key={t.title} delay={i * 50} className="w-40 shrink-0 snap-start sm:w-auto lg:min-w-0 lg:flex-1">
            <Link
              href={t.href}
              className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-line bg-white p-3.5 transition duration-300 hover:-translate-y-1 hover:border-transparent hover:shadow-card-hover"
            >
              <Icon
                className="pointer-events-none absolute -bottom-5 -right-5 h-16 w-16 text-canvas transition duration-500 group-hover:scale-110 group-hover:text-brand-50"
                aria-hidden
              />
              <span className={`relative flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br ${t.tone} text-white shadow-sm`}>
                <Icon className="h-[18px] w-[18px]" />
              </span>
              <span className="relative mt-3 text-sm font-semibold text-ink">{t.title}</span>
              <span className="relative text-xs text-muted">{t.text}</span>
              <span className="relative mt-auto inline-flex pt-2 items-center gap-1 text-xs font-semibold text-brand-600">
                {t.count} {t.count === 1 ? "Fahrzeug" : "Fahrzeuge"}
                <ArrowUpRight className="h-3.5 w-3.5 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </span>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
