import Link from "next/link";
import PageHeader from "@/app/(components)/PageHeader";
import { SITE } from "@/lib/site";

export const metadata = {
  title: "Datenschutz",
  description: "Datenschutzerklärung von Autocenter Jülich.",
};

function Section({ id, title, children }) {
  return (
    <section id={id} className="card scroll-mt-24 p-4 sm:p-5">
      <h2 className="text-base font-semibold">{title}</h2>
      <div className="mt-2 space-y-2 text-[13px] leading-6 text-body">{children}</div>
    </section>
  );
}

const Legal = ({ children }) => (
  <p>
    <span className="font-semibold text-ink">Rechtsgrundlage:</span> {children}
  </p>
);

export default function DatenschutzPage() {
  const toc = [
    ["verantwortlich", "Verantwortliche Stelle"],
    ["allgemein", "Allgemeine Hinweise"],
    ["logfiles", "Server-Logfiles"],
    ["speicher", "Cookies & lokaler Speicher"],
    ["kontakt", "Kontaktformular"],
    ["fahrzeugbilder", "Fahrzeugdaten & -bilder"],
    ["maps", "Google Maps"],
    ["bewertungen", "Google-Bewertungen"],
    ["chat", "KI-Chat-Assistent"],
    ["rechte", "Ihre Rechte"],
  ];

  return (
    <div>
      <PageHeader
        crumbs={[{ label: "Datenschutz" }]}
        title="Datenschutzerklärung"
        subtitle="Informationen zur Verarbeitung personenbezogener Daten gemäß DSGVO."
      />

      <div className="container-ac mt-4 grid gap-4 lg:grid-cols-12">
        <aside className="hidden lg:col-span-3 lg:block">
          <nav className="card sticky top-[88px] p-4" aria-label="Inhalt">
            <p className="text-[13px] font-semibold text-ink">Inhalt</p>
            <ul className="mt-2 space-y-1.5 text-[13px]">
              {toc.map(([id, label]) => (
                <li key={id}>
                  <a href={`#${id}`} className="text-muted transition hover:text-brand-600">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        <div className="space-y-3 lg:col-span-9">
          <Section id="verantwortlich" title="Verantwortliche Stelle">
            <p>
              {SITE.name}, Inhaber {SITE.legalOwner}
              <br />
              {SITE.street}, {SITE.zip} {SITE.city}
              <br />
              Telefon: {SITE.phoneIntl} · E-Mail:{" "}
              <a href={`mailto:${SITE.email}`} className="text-brand-600 hover:underline">
                {SITE.email}
              </a>
            </p>
            <p>
              Weitere Angaben finden Sie im{" "}
              <Link href="/Impressum" className="text-brand-600 hover:underline">
                Impressum
              </Link>
              .
            </p>
          </Section>

          <Section id="allgemein" title="Allgemeine Hinweise">
            <p>
              Diese Datenschutzerklärung informiert Sie darüber, welche Daten wir erfassen, wofür wir sie nutzen und
              welche Rechte Sie haben.
            </p>
            <ul className="list-disc space-y-1.5 pl-5">
              <li>Wir verarbeiten personenbezogene Daten nur, wenn eine Rechtsgrundlage besteht.</li>
              <li>Wir behandeln Ihre Daten vertraulich.</li>
              <li>Wir speichern Daten nur so lange wie notwendig.</li>
            </ul>
          </Section>

          <Section id="logfiles" title="Zugriffsdaten / Server-Logfiles">
            <p>
              Beim Besuch der Website werden durch den Hosting-Anbieter technisch notwendige Daten verarbeitet (z. B.
              IP-Adresse, Datum/Uhrzeit, aufgerufene Seite, Browser/Betriebssystem). Diese Daten sind erforderlich, um
              die Website bereitzustellen und die Sicherheit zu gewährleisten.
            </p>
            <Legal>Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an sicherem und stabilem Betrieb).</Legal>
          </Section>

          <Section id="speicher" title="Cookies & lokaler Speicher">
            <p>
              Wir verwenden ausschließlich technisch notwendige Speicherfunktionen Ihres Browsers: Ihre Auswahl im
              Cookie-Hinweis wird im lokalen Speicher (localStorage) abgelegt, der Verlauf des Chat-Assistenten nur für
              die Dauer der Browsersitzung (sessionStorage). Für den Mitarbeiter-Login wird ein Sitzungs-Cookie gesetzt.
              Tracking- oder Werbe-Cookies setzen wir nicht ein.
            </p>
            <Legal>§ 25 Abs. 2 Nr. 2 TDDDG i. V. m. Art. 6 Abs. 1 lit. f DSGVO.</Legal>
          </Section>

          <Section id="kontakt" title="Kontaktformular (E-Mail-Versand)">
            <p>
              Wenn Sie uns über das Kontaktformular schreiben, verarbeiten wir die von Ihnen eingegebenen Daten (z. B.
              Name, E-Mail, Telefon, Betreff, Nachricht), um Ihre Anfrage zu bearbeiten und zu beantworten.
            </p>
            <Legal>
              Art. 6 Abs. 1 lit. b DSGVO (Vertragsanbahnung/Anfrage) oder Art. 6 Abs. 1 lit. f DSGVO (berechtigtes
              Interesse an Kommunikation).
            </Legal>
            <p>
              Ihre Anfrage wird zusätzlich in unserem internen Anfragen-System gespeichert, damit wir sie nachvollziehbar
              bearbeiten können. Zugriff haben ausschließlich berechtigte Mitarbeitende.
            </p>
            <p>
              <span className="font-semibold text-ink">Speicherdauer:</span> Wir speichern Ihre Anfrage nur so lange,
              wie es für die Bearbeitung erforderlich ist, bzw. wie gesetzliche Aufbewahrungspflichten bestehen.
            </p>
          </Section>

          <Section id="fahrzeugbilder" title="Fahrzeugdaten & -bilder (mobile.de)">
            <p>
              Unsere Fahrzeugangebote werden über die Schnittstelle von mobile.de geladen. Die Fahrzeugbilder werden
              direkt von Servern der mobile.de GmbH bzw. deren Dienstleistern ausgeliefert; dabei wird Ihre IP-Adresse
              technisch bedingt an diese Server übermittelt.
            </p>
            <Legal>Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an einer aktuellen Darstellung unseres Bestands).</Legal>
          </Section>

          <Section id="maps" title="Google Maps">
            <p>
              Auf der Kontaktseite binden wir eine Karte von Google Maps ein (Anbieter: Google Ireland Limited, Gordon
              House, Barrow Street, Dublin 4, Irland). Beim Laden der Karte werden Daten wie Ihre IP-Adresse an Google
              übermittelt; eine Übermittlung in die USA ist möglich. Weitere Informationen:{" "}
              <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline">
                Datenschutzerklärung von Google
              </a>
              .
            </p>
            <Legal>Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an einer leicht auffindbaren Darstellung unseres Standorts).</Legal>
          </Section>

          <Section id="bewertungen" title="Google-Bewertungen">
            <p>
              Auf der Startseite zeigen wir öffentliche Google-Bewertungen unseres Autohauses an. Die Inhalte werden
              serverseitig über die Google Places API abgerufen und zwischengespeichert. Profilbilder der Bewertenden
              werden von Google-Servern geladen, wodurch Ihre IP-Adresse an Google übermittelt wird.
            </p>
            <Legal>Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an der Darstellung von Kundenbewertungen).</Legal>
          </Section>

          <Section id="chat" title="KI-Chat-Assistent">
            <p>
              Auf unserer Website können Sie freiwillig einen KI-gestützten Chat-Assistenten nutzen. Ihre eingegebenen
              Nachrichten werden zur Erzeugung einer Antwort an die Gemini API von Google (Google Ireland Limited bzw.
              Google LLC) übermittelt. Eine Verarbeitung in den USA ist möglich. Je nach genutztem Tarif kann Google
              Eingaben zur Verbesserung seiner Dienste verwenden. Bitte geben Sie daher keine sensiblen
              personenbezogenen Daten (z. B. Bank-, Ausweis- oder Gesundheitsdaten) in den Chat ein.
            </p>
            <p>
              Der Chat-Verlauf wird von uns nicht dauerhaft gespeichert, sondern nur für die Dauer Ihrer Browsersitzung
              in Ihrem Browser vorgehalten. KI-generierte Antworten sind unverbindlich.
            </p>
            <Legal>Art. 6 Abs. 1 lit. a DSGVO (Ihre Einwilligung durch aktive Nutzung des Chats) bzw. Art. 6 Abs. 1 lit. b DSGVO (vorvertragliche Anfrage).</Legal>
          </Section>

          <Section id="rechte" title="Ihre Rechte">
            <p>Sie haben folgende Rechte nach der DSGVO:</p>
            <ul className="list-disc space-y-1.5 pl-5">
              <li>Auskunft über Ihre gespeicherten Daten (Art. 15 DSGVO)</li>
              <li>Berichtigung unrichtiger Daten (Art. 16 DSGVO)</li>
              <li>Löschung (Art. 17 DSGVO)</li>
              <li>Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
              <li>Datenübertragbarkeit (Art. 20 DSGVO)</li>
              <li>Widerspruch gegen die Verarbeitung (Art. 21 DSGVO)</li>
              <li>Widerruf einer Einwilligung (Art. 7 Abs. 3 DSGVO)</li>
              <li>Beschwerde bei einer Datenschutz-Aufsichtsbehörde (Art. 77 DSGVO)</li>
            </ul>
          </Section>
        </div>
      </div>
    </div>
  );
}
