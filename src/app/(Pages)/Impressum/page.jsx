import Link from "next/link";
import PageHeader from "@/app/(components)/PageHeader";
import { SITE } from "@/lib/site";

export const metadata = {
  title: "Impressum",
  description: "Impressum und rechtliche Hinweise von Autocenter Jülich.",
};

function Row({ label, children }) {
  return (
    <div className="grid gap-0.5 py-2 sm:grid-cols-3 sm:gap-4">
      <dt className="text-[13px] text-muted">{label}</dt>
      <dd className="text-[13px] font-medium text-ink sm:col-span-2">{children}</dd>
    </div>
  );
}

export default function ImpressumPage() {
  return (
    <div>
      <PageHeader crumbs={[{ label: "Impressum" }]} title="Impressum" subtitle="Angaben gemäß § 5 DDG sowie rechtliche Hinweise." />

      <div className="container-ac mt-4 max-w-4xl space-y-4">
        <section className="card p-4 sm:p-5">
          <h2 className="text-base font-semibold">Anbieter</h2>
          <dl className="mt-2 divide-y divide-line">
            <Row label="Unternehmen">{SITE.name}</Row>
            <Row label="Inhaber">{SITE.legalOwner}</Row>
            <Row label="Anschrift">
              {SITE.street}
              <br />
              {SITE.zip} {SITE.city}, {SITE.country}
            </Row>
            <Row label="Telefon">
              <a href={SITE.phoneHref} className="text-brand-600 hover:underline">
                {SITE.phoneIntl}
              </a>
            </Row>
            <Row label="E-Mail">
              <a href={`mailto:${SITE.email}`} className="text-brand-600 hover:underline">
                {SITE.email}
              </a>
            </Row>
            <Row label="Umsatzsteuer-ID">DE 317574583</Row>
          </dl>
          <Link href="/kontakt" className="link mt-2 inline-flex text-[13px]">
            Zur Kontaktseite →
          </Link>
        </section>

        <section className="card p-4 sm:p-5">
          <h2 className="text-base font-semibold">Rechtliche Hinweise</h2>
          <div className="mt-2 space-y-3 text-[13px] leading-6 text-body">
            <p>
              <span className="font-semibold text-ink">Haftung für Inhalte:</span> Die Inhalte dieser Website wurden
              mit größtmöglicher Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte
              können wir jedoch keine Gewähr übernehmen. Fahrzeugangaben und Preise werden aus unserem
              Fahrzeugbestand übernommen; Irrtümer und Zwischenverkauf vorbehalten.
            </p>
            <p>
              <span className="font-semibold text-ink">Haftung für Links:</span> Diese Website enthält ggf. Links zu
              externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese
              fremden Inhalte auch keine Gewähr übernehmen.
            </p>
            <p>
              <span className="font-semibold text-ink">Urheberrecht:</span> Inhalte und Werke auf dieser Website
              unterliegen dem deutschen Urheberrecht. Vervielfältigung, Bearbeitung, Verbreitung und jede Art der
              Verwertung außerhalb der Grenzen des Urheberrechts bedürfen der schriftlichen Zustimmung des jeweiligen
              Autors bzw. Erstellers.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
