import { Suspense } from "react";
import { Clock, Mail, MapPin, Navigation, Phone } from "lucide-react";
import PageHeader from "@/app/(components)/PageHeader";
import ContactForm from "./ContactForm";
import { SITE } from "@/lib/site";

export const metadata = {
  title: "Kontakt & Anfahrt",
  description:
    "Kontaktieren Sie Autocenter Jülich: Telefon 02461 9163780, E-Mail oder Kontaktformular. Rudolf-Diesel-Straße 5, 52428 Jülich.",
};

export default function KontaktPage() {
  return (
    <div>
      <PageHeader
        crumbs={[{ label: "Kontakt" }]}
        title="Kontakt & Anfahrt"
        subtitle="Probefahrt, Finanzierung oder Inzahlungnahme – schreiben Sie uns oder rufen Sie an."
      />

      <div className="container-ac mt-4 grid gap-4 lg:grid-cols-12">
        {/* Form */}
        <div className="card p-4 sm:p-5 lg:col-span-7">
          <h2 className="text-base font-semibold">Nachricht senden</h2>
          <p className="text-xs text-muted">Felder mit * sind Pflichtfelder.</p>
          <Suspense
            fallback={
              <div className="mt-6 h-96 animate-pulse rounded-xl bg-canvas" />
            }
          >
            <ContactForm />
          </Suspense>
        </div>

        {/* Info */}
        <div className="space-y-4 lg:col-span-5">
          <div className="card divide-y divide-line">
            <a
              href={SITE.phoneHref}
              className="flex items-center gap-3 px-4 py-3 transition hover:bg-canvas"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-brand-50 text-brand-600">
                <Phone className="h-4 w-4" />
              </span>
              <span>
                <span className="block text-xs text-muted">Telefon</span>
                <span className="block text-sm font-semibold text-ink">
                  {SITE.phoneDisplay}
                </span>
              </span>
            </a>
            <a
              href={`mailto:${SITE.email}`}
              className="flex items-center gap-3 px-4 py-3 transition hover:bg-canvas"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-brand-50 text-brand-600">
                <Mail className="h-4 w-4" />
              </span>
              <span className="min-w-0">
                <span className="block text-xs text-muted">E-Mail</span>
                <span className="block truncate text-sm font-semibold text-ink">
                  {SITE.email}
                </span>
              </span>
            </a>
            <div className="flex items-start gap-3 px-4 py-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-brand-50 text-brand-600">
                <Clock className="h-4 w-4" />
              </span>
              <div className="flex-1">
                <span className="block text-xs text-muted">Öffnungszeiten</span>
                <dl className="mt-0.5 space-y-0.5 text-[13px]">
                  {SITE.openingHours.map((h) => (
                    <div key={h.days} className="flex justify-between gap-4">
                      <dt className="text-body">{h.days}</dt>
                      <dd className="text-right font-medium text-ink">
                        {h.time}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </div>

          <div className="card overflow-hidden">
            <iframe
              title="Autocenter Jülich – Standort auf Google Maps"
              src={SITE.mapsEmbed}
              className="h-56 w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
            <div className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                <p className="text-[13px] text-body">
                  <span className="font-semibold text-ink">{SITE.name}</span>
                  <br />
                  {SITE.street}, {SITE.zip} {SITE.city}
                </p>
              </div>
              <a
                href={SITE.mapsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary btn-sm shrink-0"
              >
                <Navigation className="h-3.5 w-3.5" />
                Route
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
