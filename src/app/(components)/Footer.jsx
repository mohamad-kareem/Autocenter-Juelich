import Link from "next/link";
import { Lock } from "lucide-react";
import Logo from "./Logo";
import OpeningStatus from "./OpeningStatus";
import { SITE } from "@/lib/site";

const COLUMNS = [
  {
    title: "Service",
    items: [
      { label: "Alle Fahrzeuge", href: "/fahrzeuge" },
      { label: "Finanzierung", href: "/finanzierung" },
      { label: "CarGarantie®", href: "/garantie" },
      { label: "Inzahlungnahme", href: "/kontakt?betreff=Inzahlungnahme%20anfragen" },
    ],
  },
  {
    title: "Unternehmen",
    items: [
      { label: "Kontakt", href: "/kontakt" },
      { label: "Impressum", href: "/Impressum" },
      { label: "Datenschutz", href: "/Datenschutz" },
    ],
  },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-14 bg-navy-800 text-[13px] text-white/65">
      <div className="container-ac grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr] lg:gap-10">
        {/* Brand & address */}
        <div>
          <Logo className="h-8 w-auto" />
          <address className="mt-4 space-y-0.5 not-italic leading-relaxed">
            {SITE.street}
            <br />
            {SITE.zip} {SITE.city}
          </address>
          <div className="mt-3 space-y-0.5">
            <a href={SITE.phoneHref} className="block text-white/85 transition hover:text-white">
              {SITE.phoneDisplay}
            </a>
            <a href={`mailto:${SITE.email}`} className="block transition hover:text-white">
              {SITE.email}
            </a>
          </div>
        </div>

        {/* Link columns */}
        {COLUMNS.map((group) => (
          <nav key={group.title} aria-label={group.title}>
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-white">{group.title}</h3>
            <ul className="mt-4 space-y-2.5">
              {group.items.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="transition hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}

        {/* Opening hours */}
        <div>
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-white">Öffnungszeiten</h3>
          <dl className="mt-4 space-y-2">
            {SITE.openingHours.map((h) => (
              <div key={h.days} className="grid grid-cols-[3.25rem_1fr] gap-x-2">
                <dt>{h.short}</dt>
                <dd className="text-white/85">{h.time}</dd>
              </div>
            ))}
          </dl>
          <OpeningStatus className="mt-3" />
        </div>
      </div>

      <div className="border-t border-white/15">
        <div className="container-ac flex flex-col gap-1.5 py-4 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} · Alle Rechte vorbehalten</p>
          <Link href="/login" className="inline-flex items-center gap-1 transition hover:text-white">
            <Lock className="h-3 w-3" />
            Mitarbeiter
          </Link>
        </div>
      </div>
    </footer>
  );
}
