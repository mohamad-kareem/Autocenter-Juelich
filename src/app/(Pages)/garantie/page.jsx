import Link from "next/link";
import { Check, Clock3, Globe2, Info, Minus, Plus, Receipt, Wrench } from "lucide-react";
import PageHeader from "@/app/(components)/PageHeader";

export const metadata = {
  title: "CarGarantie®",
  description:
    "Mehr Schutz für Ihren Gebrauchtwagen: CarGarantie® bei Autocenter Jülich mit 12, 24 oder 36 Monaten Laufzeit und 24/7 Notfallservice im EU-Raum.",
};

const HIGHLIGHTS = [
  { icon: Clock3, title: "12, 24 oder 36 Monate", text: "Schutz passend zu Fahrzeug und Nutzung." },
  { icon: Wrench, title: "Hilfe mit der Werkstatt", text: "Wir unterstützen bei der Abwicklung." },
  { icon: Receipt, title: "Klare Konditionen", text: "Keine versteckten Kosten." },
  { icon: Globe2, title: "24/7 im EU-Raum", text: "Notfallservice europaweit." },
];

const COVERAGE = [
  { kind: "included", title: "Enthalten", items: ["Motor & Getriebe", "Antriebsstrang", "Hauptelektronik"] },
  {
    kind: "optional",
    title: "Erweiterbar",
    items: ["Klimaanlage", "Fahrerassistenzsysteme", "Komfortelektronik (je nach Ausstattung)"],
  },
  { kind: "excluded", title: "Nicht enthalten", items: ["Verschleißteile", "Karosserieschäden", "Unfallfolgen"] },
];

const STYLE = {
  included: { icon: Check, cls: "text-emerald-600" },
  optional: { icon: Plus, cls: "text-brand-600" },
  excluded: { icon: Minus, cls: "text-slate-400" },
};

export default function GarantiePage() {
  return (
    <div>
      <PageHeader
        crumbs={[{ label: "Garantie" }]}
        title="CarGarantie® – mehr Schutz, ganz einfach"
        subtitle="Flexible Laufzeiten, klare Konditionen und Hilfe rund um die Uhr."
      >
        <Link href="/kontakt?betreff=Allgemeine%20Anfrage" className="btn btn-primary shrink-0">
          Beratung anfragen
        </Link>
      </PageHeader>

      <div className="container-ac mt-4 space-y-4">
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-line bg-line lg:grid-cols-4">
          {HIGHLIGHTS.map(({ icon: Icon, ...h }) => (
            <div key={h.title} className="flex gap-2.5 bg-white p-4">
              <Icon className="h-5 w-5 shrink-0 text-brand-600" />
              <div>
                <h2 className="text-sm font-semibold">{h.title}</h2>
                <p className="mt-0.5 text-xs text-muted">{h.text}</p>
              </div>
            </div>
          ))}
        </div>

        <section className="card p-4 sm:p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-base font-semibold">Leistungsumfang</h2>
            <p className="text-xs text-muted">Details laut individuellem Garantievertrag</p>
          </div>
          <div className="mt-3 grid gap-4 sm:grid-cols-3">
            {COVERAGE.map((c) => {
              const { icon: Icon, cls } = STYLE[c.kind];
              return (
                <div key={c.title}>
                  <h3 className="text-[13px] font-semibold">{c.title}</h3>
                  <ul className="mt-1.5 space-y-1">
                    {c.items.map((it) => (
                      <li key={it} className="flex items-center gap-1.5 text-[13px] text-body">
                        <Icon className={`h-3.5 w-3.5 shrink-0 ${cls}`} strokeWidth={2.5} />
                        {it}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
          <p className="mt-4 border-t border-line pt-3 text-xs text-muted">
            Alle Garantien werden von <span className="font-semibold text-ink">CarGarantie®</span> bereitgestellt.
          </p>
        </section>

        <div className="flex gap-2.5 rounded-lg border border-line bg-white p-4 text-xs text-muted">
          <Info className="h-4 w-4 shrink-0" />
          <p>
            Die CarGarantie® ist eine freiwillige Leistung des Autocenter Jülich in Kooperation mit CarGarantie® und
            keine gesetzliche Gewährleistung. Umfang und Bedingungen ergeben sich aus dem individuellen Garantievertrag.
            Voraussetzung ist ein technisch einwandfreies Fahrzeug bei Vertragsabschluss. Stand: Februar 2026.
          </p>
        </div>
      </div>
    </div>
  );
}
