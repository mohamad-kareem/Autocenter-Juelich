import { BadgeCheck, Banknote, Clock, FileCheck2, Phone } from "lucide-react";
import PageHeader from "@/app/(components)/PageHeader";
import { SITE } from "@/lib/site";
import SellCarForm from "./SellCarForm";

export const metadata = {
  title: "Auto verkaufen",
  description:
    "Verkaufen Sie Ihr Auto an Autocenter Jülich: Fahrzeugdaten und Fotos online senden, faires Angebot erhalten, schnelle Abwicklung und sofortige Bezahlung.",
};

const STEPS = [
  { title: "Daten senden", text: "Fahrzeug und ein paar Fotos – dauert ca. 3 Minuten." },
  { title: "Angebot erhalten", text: "Wir prüfen Ihre Angaben und melden uns mit einem fairen Preis." },
  { title: "Verkaufen", text: "Besichtigung bei uns, Vertrag, Bezahlung – fertig." },
];

const BENEFITS = [
  { icon: Banknote, text: "Faire Bewertung, schnelle Bezahlung" },
  { icon: FileCheck2, text: "Wir übernehmen Abmeldung & Papiere" },
  { icon: BadgeCheck, text: "Unverbindlich und kostenlos" },
  { icon: Clock, text: "Antwort in der Regel innerhalb eines Werktags" },
];

export default function AutoVerkaufenPage() {
  return (
    <div>
      <PageHeader
        crumbs={[{ label: "Auto verkaufen" }]}
        title="Wir kaufen Ihr Auto"
        subtitle="Senden Sie uns die Daten Ihres Fahrzeugs – wir machen Ihnen ein faires, unverbindliches Angebot."
      />

      <div className="container-ac mt-4 grid items-start gap-4 lg:grid-cols-[1fr_300px]">
        <SellCarForm />

        <aside className="space-y-4 lg:sticky lg:top-[88px]">
          <section className="card p-4">
            <h2 className="text-sm font-semibold text-ink">So funktioniert&apos;s</h2>
            <ol className="mt-3 space-y-3">
              {STEPS.map((s, i) => (
                <li key={s.title} className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink text-[11px] font-bold text-white">
                    {i + 1}
                  </span>
                  <span>
                    <span className="block text-[13px] font-semibold text-ink">{s.title}</span>
                    <span className="block text-[12px] text-muted">{s.text}</span>
                  </span>
                </li>
              ))}
            </ol>
          </section>

          <section className="card p-4">
            <ul className="space-y-2.5">
              {BENEFITS.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-2.5 text-[13px] text-body">
                  <Icon className="h-4 w-4 shrink-0 text-emerald-600" />
                  {text}
                </li>
              ))}
            </ul>
          </section>

          <section className="card p-4">
            <p className="text-[12px] text-muted">Lieber persönlich?</p>
            <a href={SITE.phoneHref} className="mt-1 flex items-center gap-2 text-[15px] font-semibold text-ink hover:text-brand-700">
              <Phone className="h-4 w-4 text-brand-600" />
              {SITE.phoneDisplay}
            </a>
          </section>
        </aside>
      </div>
    </div>
  );
}
