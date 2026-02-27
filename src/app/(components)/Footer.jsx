import Link from "next/link";
import { Clock, Mail, Phone, MapPin, ChevronRight } from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative border-t border-white/10">
      {/* keep the same structure (top line) but theme colors */}
      <div
        className="bg-[linear-gradient(135deg,var(--ac-bg-0),var(--ac-bg-1)_45%,var(--ac-bg-2))]"
        style={{ color: "var(--ac-text)" }}
      >
        <div className="h-1 w-full bg-[var(--ac-blue)]" />

        <div className="mx-auto max-w-7xl px-4 py-12">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
            {/* Brand */}
            <section>
              <Link href="/" className="flex items-center gap-3">
                <span className="text-lg font-extrabold text-[var(--ac-text)]">
                  AutoCenter{" "}
                  <span className="text-[var(--ac-blue-light)]">Jülich</span>
                </span>
              </Link>

              <p className="mt-4 text-sm leading-6 text-[var(--ac-muted)] max-w-sm">
                Ihr zuverlässiger Partner für hochwertige Fahrzeuge und
                exzellenten Service.
              </p>
            </section>

            {/* Öffnungszeiten */}
            <section>
              <h4 className="text-sm font-bold text-[var(--ac-text)]">
                Öffnungszeiten
                <span className="mt-2 block h-[2px] w-12 rounded-full bg-[var(--ac-blue)]" />
              </h4>

              <ul className="mt-5 space-y-3 text-sm text-[var(--ac-muted)]">
                <li className="flex items-start gap-3">
                  <Clock className="mt-0.5 h-4 w-4 text-[var(--ac-blue-light)]" />
                  <span>
                    <span className="font-semibold text-[var(--ac-text)]">
                      Mo–Fr:
                    </span>{" "}
                    10:00 – 18:00 Uhr
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Clock className="mt-0.5 h-4 w-4 text-[var(--ac-blue-light)]" />
                  <span>
                    <span className="font-semibold text-[var(--ac-text)]">
                      Sa:
                    </span>{" "}
                    10:00 – 15:00 Uhr
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Clock className="mt-0.5 h-4 w-4 text-[var(--ac-blue-light)]" />
                  <span>
                    <span className="font-semibold text-[var(--ac-text)]">
                      So:
                    </span>{" "}
                    nach telefonischer Absprache
                  </span>
                </li>
              </ul>
            </section>

            {/* Kontakt */}
            <section>
              <h4 className="text-sm font-bold text-[var(--ac-text)]">
                Kontakt
                <span className="mt-2 block h-[2px] w-12 rounded-full bg-[var(--ac-blue)]" />
              </h4>

              <address className="mt-5 not-italic">
                <ul className="space-y-3 text-sm text-[var(--ac-muted)]">
                  <li>
                    <a
                      href="mailto:info@autocenter-juelich.de"
                      className="flex items-start gap-3 transition hover:text-[var(--ac-blue-light)]"
                    >
                      <Mail className="mt-0.5 h-4 w-4 text-[var(--ac-blue-light)]" />
                      <span className="break-all">
                        info@autocenter-juelich.de
                      </span>
                    </a>
                  </li>
                  <li>
                    <a
                      href="tel:+492461123456"
                      className="flex items-start gap-3 transition hover:text-[var(--ac-blue-light)]"
                    >
                      <Phone className="mt-0.5 h-4 w-4 text-[var(--ac-blue-light)]" />
                      <span>+49 176 32445082</span>
                    </a>
                  </li>
                  <li className="flex items-start gap-3">
                    <MapPin className="mt-0.5 h-4 w-4 text-[var(--ac-blue-light)]" />
                    <span>
                      <span className="font-semibold text-[var(--ac-text)]">
                        Adresse
                      </span>
                      <br />
                      Rudolf-Diesel-Str. 5
                      <br />
                      52428 Jülich
                    </span>
                  </li>
                </ul>
              </address>
            </section>

            {/* Rechtliches */}
            <section>
              <h4 className="text-sm font-bold text-[var(--ac-text)]">
                Rechtliches
                <span className="mt-2 block h-[2px] w-12 rounded-full bg-[var(--ac-blue)]" />
              </h4>

              <nav className="mt-5">
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link
                      href="/Impressum"
                      className="group inline-flex items-center gap-2 text-[var(--ac-muted)] transition hover:text-[var(--ac-blue-light)]"
                    >
                      <ChevronRight className="h-4 w-4 text-[var(--ac-blue-light)] transition group-hover:translate-x-0.5" />
                      Impressum
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/Datenschutz"
                      className="group inline-flex items-center gap-2 text-[var(--ac-muted)] transition hover:text-[var(--ac-blue-light)]"
                    >
                      <ChevronRight className="h-4 w-4 text-[var(--ac-blue-light)] transition group-hover:translate-x-0.5" />
                      Datenschutz
                    </Link>
                  </li>
                </ul>
              </nav>
            </section>
          </div>

          {/* Bottom */}
          <div className="mt-10 border-t border-white/10 pt-6 flex flex-col gap-2 text-xs text-[var(--ac-muted)] md:flex-row md:items-center md:justify-between">
            <p>
              © {year}{" "}
              <span className="font-semibold text-[var(--ac-text)]">
                AutoCenter Jülich
              </span>
              . Alle Rechte vorbehalten.
            </p>
            <p className="text-[var(--ac-muted-2)]">
              Professionelle Fahrzeugdienstleistungen seit Jahren
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
