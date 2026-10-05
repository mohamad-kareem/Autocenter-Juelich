"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import CarCard from "./CarCard";

const cx = (...c) => c.filter(Boolean).join(" ");

/**
 * Featured vehicles with tabs (Neueste / Günstigste / Automatik).
 * @param {{ tabs: Array<{ key: string, label: string, cars: any[], href: string }>, total?: number }} props
 */
export default function FeaturedCarsSlider({ tabs = [], total }) {
  const visibleTabs = tabs.filter((t) => t.cars.length);
  const [active, setActive] = useState(visibleTabs[0]?.key);
  const current = visibleTabs.find((t) => t.key === active) || visibleTabs[0];

  return (
    <section className="container-ac mt-12">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Aktuelle Angebote</p>
          <h2 className="section-title mt-2">Unsere Fahrzeuge</h2>
        </div>

        {visibleTabs.length > 1 ? (
          <div className="flex rounded-lg bg-white p-1 ring-1 ring-line" role="tablist">
            {visibleTabs.map((t) => (
              <button
                key={t.key}
                type="button"
                role="tab"
                aria-selected={current?.key === t.key}
                onClick={() => setActive(t.key)}
                className={cx(
                  "rounded-md px-3 py-1.5 text-[13px] font-medium transition",
                  current?.key === t.key ? "bg-navy-900 text-white shadow-sm" : "text-muted hover:text-ink",
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {current ? (
        <>
          <div key={current.key} className="mt-4 grid animate-fade-up grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {current.cars.map((car, i) => (
              <CarCard key={car.id} car={car} priority={i < 4} />
            ))}
          </div>
          <div className="mt-5 flex justify-center">
            <Link href={current.href} className="btn btn-secondary group">
              Alle {total ? `${total} ` : ""}Fahrzeuge ansehen
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </Link>
          </div>
        </>
      ) : (
        <div className="card mt-4 p-6 text-center text-sm text-muted">
          Unser Bestand wird gerade aktualisiert. Rufen Sie uns gerne an – wir informieren Sie über aktuelle Fahrzeuge.
        </div>
      )}
    </section>
  );
}
