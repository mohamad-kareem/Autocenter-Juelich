"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarCheck, Clock, Mail, MapPin, Navigation, Phone } from "lucide-react";
import { SITE, getOpeningStatus } from "@/lib/site";

const cx = (...c) => c.filter(Boolean).join(" ");

/** Compact contact strip at the end of the homepage: address, hours, contact. */
export default function VisitStrip() {
  const [status, setStatus] = useState(null);

  useEffect(() => {
    const update = () => setStatus(getOpeningStatus());
    const first = setTimeout(update, 0);
    const t = setInterval(update, 60_000);
    return () => {
      clearTimeout(first);
      clearInterval(t);
    };
  }, []);

  return (
    <section className="container-ac mt-14">
      <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-card">
        <div className="grid divide-y divide-line md:grid-cols-3 md:divide-x md:divide-y-0">
          {/* Address */}
          <div className="p-5">
            <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted">
              <MapPin className="h-3.5 w-3.5 text-brand-600" />
              Standort
            </p>
            <p className="mt-2.5 text-sm font-semibold text-ink">{SITE.name}</p>
            <p className="text-[13px] text-muted">
              {SITE.street}
              <br />
              {SITE.zip} {SITE.city}
            </p>
            <a
              href={SITE.mapsLink}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2.5 inline-flex items-center gap-1.5 text-[13px] font-medium text-brand-600 hover:text-brand-700"
            >
              <Navigation className="h-3.5 w-3.5" />
              Route planen
            </a>
          </div>

          {/* Opening hours */}
          <div className="p-5">
            <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted">
              <Clock className="h-3.5 w-3.5 text-brand-600" />
              Öffnungszeiten
            </p>
            {status ? (
              <p className="mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-canvas px-2 py-0.5 text-[12px] font-medium text-ink">
                <span className={cx("h-1.5 w-1.5 rounded-full", status.open ? "bg-emerald-500" : "bg-rose-500")} />
                {status.open ? "Jetzt geöffnet" : "Geschlossen"}
              </p>
            ) : null}
            <dl className="mt-2 space-y-1 text-[13px]">
              {SITE.openingHours.map((h) => (
                <div key={h.days} className="flex justify-between gap-3">
                  <dt className="text-muted">{h.short}</dt>
                  <dd className="text-right font-medium text-ink">{h.time}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Contact */}
          <div className="p-5">
            <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted">
              <Phone className="h-3.5 w-3.5 text-brand-600" />
              Kontakt
            </p>
            <a href={SITE.phoneHref} className="mt-2.5 block text-base font-semibold text-ink hover:text-brand-600">
              {SITE.phoneDisplay}
            </a>
            <a
              href={`mailto:${SITE.email}`}
              className="mt-0.5 flex items-center gap-1.5 text-[13px] text-muted hover:text-ink"
            >
              <Mail className="h-3.5 w-3.5" />
              {SITE.email}
            </a>
            <Link href="/kontakt?betreff=Probefahrt%20vereinbaren" className="btn btn-primary btn-sm mt-3 w-full">
              <CalendarCheck className="h-3.5 w-3.5" />
              Termin vereinbaren
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
