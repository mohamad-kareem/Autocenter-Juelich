import Link from "next/link";
import { CalendarRange, Check, Info, Phone, PiggyBank, Timer } from "lucide-react";
import PageHeader from "@/app/(components)/PageHeader";
import { SITE } from "@/lib/site";

export const metadata = {
  title: "Autofinanzierung",
  description:
    "Flexible Autofinanzierung bei Autocenter Jülich: Laufzeiten von 12 bis 84 Monaten, mit oder ohne Anzahlung, schnelle Abwicklung über unsere Finanzierungspartner.",
};

const BENEFITS = [
  { icon: CalendarRange, title: "Flexible Laufzeiten", text: "Typischerweise 12–84 Monate. Wir finden die Rate, die zu Ihrem Budget passt." },
  { icon: PiggyBank, title: "Anzahlung optional", text: "Mit oder ohne Anzahlung – Sie entscheiden, was am besten passt." },
  { icon: Timer, title: "Schnelle Abwicklung", text: "Unkomplizierter Ablauf über unsere Finanzierungspartner." },
];

const STEPS = [
  { title: "Wunschrate nennen", text: "Persönlich, telefonisch oder per Formular." },
  { title: "Angebote prüfen", text: "Wir prüfen passende Angebote unserer Partner." },
  { title: "Klare Konditionen", text: "Transparent und ohne versteckte Kosten." },
  { title: "Losfahren", text: "Nach Zustimmung: schnelle Abwicklung und Übergabe." },
];

const DOCUMENTS = [
  "Personalausweis oder Reisepass mit Aufenthaltstitel",
  "Wohnsitz in Deutschland",
  "Einkommensnachweise (je nach Bank)",
  "Bankverbindung (IBAN)",
];

export default function FinanzierungPage() {
  return (
    <div>
      <PageHeader
        crumbs={[{ label: "Finanzierung" }]}
        title="Autofinanzierung"
        subtitle="Flexible Finanzierungslösungen – transparent, fair und schnell. Die genauen Konditionen hängen vom Fahrzeug und der Bonität ab."
      >
        <Link href="/kontakt?betreff=Finanzierung%20anfragen" className="btn btn-primary shrink-0">
          Finanzierung anfragen
        </Link>
      </PageHeader>

      <div className="container-ac mt-4 grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <div className="grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-3">
            {BENEFITS.map(({ icon: Icon, ...b }) => (
              <div key={b.title} className="bg-white p-4">
                <Icon className="h-5 w-5 text-brand-600" />
                <h2 className="mt-2 text-sm font-semibold">{b.title}</h2>
                <p className="mt-1 text-[13px] text-muted">{b.text}</p>
              </div>
            ))}
          </div>

          <section className="card p-4 sm:p-5">
            <h2 className="text-base font-semibold">So läuft die Finanzierung ab</h2>
            <ol className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {STEPS.map((s, i) => (
                <li key={s.title} className="flex gap-2.5">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-navy-900 text-xs font-semibold text-white">
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="text-[13px] font-semibold">{s.title}</h3>
                    <p className="text-xs text-muted">{s.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <div className="flex gap-2.5 rounded-lg border border-line bg-white p-4 text-xs text-muted">
            <Info className="h-4 w-4 shrink-0" />
            <p>
              Diese Seite dient der Information und stellt keine verbindliche Finanzierungszusage dar. Die endgültigen
              Bedingungen richten sich nach der jeweiligen Bank bzw. dem Finanzierungspartner und Ihrer Bonität.
            </p>
          </div>
        </div>

        <aside className="space-y-4">
          <section className="card p-4">
            <h2 className="text-sm font-semibold">Was Sie mitbringen sollten</h2>
            <ul className="mt-2.5 space-y-1.5">
              {DOCUMENTS.map((d) => (
                <li key={d} className="flex items-start gap-1.5 text-[13px] text-body">
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" strokeWidth={2.5} />
                  {d}
                </li>
              ))}
            </ul>
          </section>
          <section className="card p-4">
            <h2 className="text-sm font-semibold">Persönliche Beratung</h2>
            <p className="mt-1 text-[13px] text-muted">Wir rechnen Ihre Wunschrate gerne mit Ihnen durch.</p>
            <a href={SITE.phoneHref} className="btn btn-secondary mt-3 w-full">
              <Phone className="h-4 w-4" />
              {SITE.phoneDisplay}
            </a>
          </section>
        </aside>
      </div>
    </div>
  );
}
