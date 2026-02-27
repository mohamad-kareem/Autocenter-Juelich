// app/impressum/page.jsx
import Link from "next/link";

export const metadata = {
  title: "Impressum | AutoCenter Jülich",
  description: "Impressum und rechtliche Hinweise von AutoCenter Jülich.",
};

function Row({ label, value, href }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 py-3 border-b border-white/10">
      <span className="text-sm text-[var(--ac-muted)]">{label}</span>
      {href ? (
        <a
          href={href}
          className="text-sm font-medium text-[var(--ac-text)] hover:text-[var(--ac-blue-light)] transition sm:text-right break-words"
        >
          {value}
        </a>
      ) : (
        <span className="text-sm font-medium text-[var(--ac-text)] sm:text-right break-words">
          {value}
        </span>
      )}
    </div>
  );
}

export default function ImpressumPage() {
  return (
    <div className="ac-page">
      <div className="px-4 sm:px-6 lg:px-12 py-8 sm:py-10 lg:py-10">
        <div className="mx-auto w-full max-w-5xl">
          {/* Header */}
          <section className="relative mb-8">
            <div className="h-px w-full bg-gradient-to-r from-transparent via-white/15 to-transparent" />

            <div className="py-6 sm:py-6">
              <h1 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight text-[var(--ac-text)]">
                Impressum <span className="ac-text-gradient"></span>
              </h1>

              <p className="mt-3 max-w-2xl text-sm sm:text-base text-[var(--ac-muted-2)] leading-relaxed">
                Angaben gemäß § 5 TMG sowie rechtliche Hinweise.
              </p>
            </div>

            <div className="h-px w-full bg-gradient-to-r from-transparent via-white/15 to-transparent" />
          </section>

          {/* Content */}
          <section className="grid gap-6">
            {/* Impressum */}
            <div className="rounded-2xl border border-white/10 overflow-hidden bg-[rgba(10,20,45,0.35)]">
              <div className="p-5 sm:p-6 border-b border-white/10">
                <h2 className="text-lg sm:text-xl font-bold text-[var(--ac-text)]">
                  Anbieter
                </h2>
                <p className="mt-1 text-sm text-[var(--ac-muted-2)]">
                  Kontaktdaten und gesetzliche Pflichtangaben.
                </p>
              </div>

              <div className="p-5 sm:p-6">
                <Row label="Inhaber" value="Jibrail Alawie" />
                <Row
                  label="Adresse"
                  value={"Rudolf-Diesel-Str. 5\n52428 Jülich, Deutschland"}
                />
                <Row
                  label="Telefon"
                  value="+49 176 32445082"
                  href="tel:+4917632445082"
                />
                <Row label="Umsatzsteuer-ID" value="DE 317574583" />

                <div className="pt-4">
                  <Link
                    href="/kontakt"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--ac-blue-light)] hover:underline"
                  >
                    Kontaktseite öffnen <span aria-hidden>→</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Rechtliche Hinweise */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold text-[var(--ac-text)]">
                Rechtliche Hinweise
              </h2>

              <div className="mt-4 space-y-4 text-sm text-[var(--ac-muted-2)] leading-relaxed">
                <p>
                  <span className="font-semibold text-[var(--ac-text)]">
                    Haftung für Inhalte:
                  </span>{" "}
                  Die Inhalte dieser Website wurden mit größtmöglicher Sorgfalt
                  erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität
                  der Inhalte können wir jedoch keine Gewähr übernehmen.
                </p>

                <p>
                  <span className="font-semibold text-[var(--ac-text)]">
                    Haftung für Links:
                  </span>{" "}
                  Diese Website enthält ggf. Links zu externen Websites Dritter,
                  auf deren Inhalte wir keinen Einfluss haben. Deshalb können
                  wir für diese fremden Inhalte auch keine Gewähr übernehmen.
                </p>

                <p>
                  <span className="font-semibold text-[var(--ac-text)]">
                    Urheberrecht:
                  </span>{" "}
                  Inhalte und Werke auf dieser Website unterliegen dem deutschen
                  Urheberrecht. Vervielfältigung, Bearbeitung, Verbreitung und
                  jede Art der Verwertung außerhalb der Grenzen des
                  Urheberrechts bedürfen der schriftlichen Zustimmung des
                  jeweiligen Autors bzw. Erstellers.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
