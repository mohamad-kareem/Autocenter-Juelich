// app/datenschutz/page.jsx
import Link from "next/link";

export const metadata = {
  title: "Datenschutz | AutoCenter Jülich",
  description: "Datenschutzerklärung von AutoCenter Jülich.",
};

function Section({ title, children }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[rgba(10,20,45,0.35)] overflow-hidden">
      <div className="p-5 sm:p-6 border-b border-white/10">
        <h2 className="text-lg sm:text-xl font-bold text-[var(--ac-text)]">
          {title}
        </h2>
      </div>
      <div className="p-5 sm:p-6 text-sm text-[var(--ac-muted-2)] leading-relaxed">
        {children}
      </div>
    </div>
  );
}

export default function DatenschutzPage() {
  return (
    <div className="ac-page">
      <div className="px-4 sm:px-6 lg:px-12 py-8 sm:py-8 lg:py-8">
        <div className="mx-auto w-full max-w-5xl">
          {/* Header */}
          <section className="relative mb-8">
            <div className="h-px w-full bg-gradient-to-r from-transparent via-white/15 to-transparent" />

            <div className="py-8 sm:py-10">
              <h1 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight text-[var(--ac-text)]">
                Datenschutz <span className="ac-text-gradient"></span>
              </h1>

              <p className="mt-3 max-w-2xl text-sm sm:text-base text-[var(--ac-muted-2)] leading-relaxed">
                Informationen zur Verarbeitung personenbezogener Daten gemäß
                DSGVO.
              </p>

              <div className="mt-4">
                <Link
                  href="/impressum"
                  className="text-sm font-semibold text-[var(--ac-blue-light)] hover:underline"
                >
                  → Zum Impressum
                </Link>
              </div>
            </div>

            <div className="h-px w-full bg-gradient-to-r from-transparent via-white/15 to-transparent" />
          </section>

          <div className="grid gap-6">
            <Section title="Allgemeine Hinweise">
              <p>
                Diese Datenschutzerklärung informiert Sie darüber, welche Daten
                wir erfassen, wofür wir sie nutzen und welche Rechte Sie haben.
              </p>

              <ul className="mt-4 list-disc pl-5 space-y-2">
                <li>
                  Wir verarbeiten personenbezogene Daten nur, wenn eine
                  Rechtsgrundlage besteht.
                </li>
                <li>Wir behandeln Ihre Daten vertraulich.</li>
                <li>Wir speichern Daten nur so lange wie notwendig.</li>
              </ul>
            </Section>

            <Section title="Zugriffsdaten / Server-Logfiles">
              <p>
                Beim Besuch der Website werden durch den Hosting-Anbieter
                technisch notwendige Daten verarbeitet (z. B. IP-Adresse,
                Datum/Uhrzeit, aufgerufene Seite, Browser/OS). Diese Daten sind
                erforderlich, um die Website bereitzustellen und die Sicherheit
                zu gewährleisten.
              </p>

              <p className="mt-3">
                <span className="font-semibold text-[var(--ac-text)]">
                  Rechtsgrundlage:
                </span>{" "}
                Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an sicherem
                und stabilem Betrieb).
              </p>
            </Section>

            <Section title="Kontaktformular (E-Mail-Versand)">
              <p>
                Wenn Sie uns über das Kontaktformular schreiben, verarbeiten wir
                die von Ihnen eingegebenen Daten (z. B. Name, E-Mail, Telefon,
                Betreff, Nachricht), um Ihre Anfrage zu bearbeiten und zu
                beantworten.
              </p>

              <p className="mt-3">
                <span className="font-semibold text-[var(--ac-text)]">
                  Rechtsgrundlage:
                </span>{" "}
                Art. 6 Abs. 1 lit. b DSGVO (Vertragsanbahnung/Anfrage) oder Art.
                6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an Kommunikation).
              </p>

              <p className="mt-3">
                <span className="font-semibold text-[var(--ac-text)]">
                  Speicherdauer:
                </span>{" "}
                Wir speichern Ihre Anfrage nur so lange, wie es für die
                Bearbeitung erforderlich ist, bzw. wie gesetzliche
                Aufbewahrungspflichten bestehen.
              </p>
            </Section>

            <Section title="Ihre Rechte">
              <p>Sie haben folgende Rechte nach der DSGVO:</p>

              <ul className="mt-4 list-disc pl-5 space-y-2">
                <li>Auskunft über Ihre gespeicherten Daten (Art. 15 DSGVO)</li>
                <li>Berichtigung unrichtiger Daten (Art. 16 DSGVO)</li>
                <li>Löschung (Art. 17 DSGVO)</li>
                <li>Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
                <li>Datenübertragbarkeit (Art. 20 DSGVO)</li>
                <li>Widerspruch gegen Verarbeitung (Art. 21 DSGVO)</li>
                <li>Widerruf einer Einwilligung (Art. 7 Abs. 3 DSGVO)</li>
              </ul>
            </Section>
          </div>
        </div>
      </div>
    </div>
  );
}
