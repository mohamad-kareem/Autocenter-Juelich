import Link from "next/link";
import { ArrowRight, CalendarCheck, KeyRound, Phone, Search } from "lucide-react";
import Reveal from "./Reveal";
import { SITE } from "@/lib/site";

const STEPS = [
  {
    icon: Search,
    title: "Fahrzeug finden",
    text: "Stöbern Sie online in unserem Bestand oder lassen Sie sich von unserem Assistenten beraten.",
  },
  {
    icon: CalendarCheck,
    title: "Probefahrt vereinbaren",
    text: "Kommen Sie vorbei, schauen Sie sich das Auto in Ruhe an und fahren Sie Probe.",
  },
  {
    icon: KeyRound,
    title: "Finanzieren & losfahren",
    text: "Wir kümmern uns um Finanzierung, Garantie und Zulassung – Sie holen nur noch den Schlüssel ab.",
  },
];

export default function HowItWorks() {
  return (
    <>
      <section className="container-ac mt-24 lg:mt-28">
        <Reveal className="text-center">
          <p className="eyebrow">So einfach geht&apos;s</p>
          <h2 className="section-title mt-2">
            In drei Schritten <span className="italic text-brand-600">zum neuen Auto</span>
          </h2>
        </Reveal>

        <div className="relative mt-8 grid gap-4 md:grid-cols-3">
          <div className="absolute left-[16%] right-[16%] top-7 hidden h-px bg-gradient-to-r from-transparent via-line-strong to-transparent md:block" />
          {STEPS.map(({ icon: Icon, ...s }, i) => (
            <Reveal key={s.title} delay={i * 120} className="relative text-center">
              <div className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-card ring-1 ring-line">
                <Icon className="h-6 w-6 text-brand-600" />
                <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-navy-900 text-[11px] font-bold text-white ring-2 ring-canvas">
                  {i + 1}
                </span>
              </div>
              <h3 className="mt-4 text-[15px] font-semibold">{s.title}</h3>
              <p className="mx-auto mt-1 max-w-xs text-[13px] leading-relaxed text-muted">{s.text}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CTA band */}
      <section className="container-ac mt-14">
        <Reveal>
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 via-brand-700 to-navy-900 px-6 py-8 sm:px-10 sm:py-10">
            <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full border-[40px] border-white/5" />
            <div className="pointer-events-none absolute -bottom-24 right-40 h-48 w-48 rounded-full bg-accent-400/20 blur-2xl" />
            <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="font-display text-2xl text-white sm:text-[32px]">Ihr Wunschauto ist nicht dabei?</h2>
                <p className="mt-1.5 max-w-lg text-sm text-white/75">
                  Sagen Sie uns, wonach Sie suchen – wir halten die Augen offen und melden uns, sobald das passende
                  Fahrzeug eintrifft.
                </p>
              </div>
              <div className="flex flex-col gap-2.5 sm:flex-row">
                <Link href="/kontakt?betreff=Allgemeine%20Anfrage" className="btn btn-lg bg-white text-navy-900 hover:bg-brand-50">
                  Suchauftrag senden
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a href={SITE.phoneHref} className="btn btn-lg btn-ghost-light">
                  <Phone className="h-4 w-4" />
                  {SITE.phoneDisplay}
                </a>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
