import Link from "next/link";

export const metadata = {
  title: "Finanzierung | AutoCenter Jülich",
  description: "Finanzierung – Informationen bei AutoCenter Jülich.",
};

function Bullet({ children, variant = "cyan" }) {
  const dot =
    variant === "blue"
      ? "bg-[var(--ac-blue-light)]"
      : "bg-[var(--ac-cyan-light)]";

  return (
    <li className="flex items-start gap-2 text-sm text-[var(--ac-muted-2)]">
      <span className={`mt-1.5 h-1.5 w-1.5 rounded-full ${dot}`} />
      <span>{children}</span>
    </li>
  );
}

export default function FinanzierungPage() {
  return (
    <div className="ac-page">
      <div className="px-4 sm:px-6 lg:px-12 py-10 sm:py-12 lg:py-16">
        <div className="mx-auto w-full max-w-6xl">
          {/* HERO (left only) */}
          <section className="relative">
            <div className="h-px w-full bg-gradient-to-r from-transparent via-white/15 to-transparent" />

            <div className="py-10 sm:py-12 lg:py-2">
              <div className="max-w-3xl">
                <p className="text-xs font-semibold tracking-wide text-[var(--ac-muted)]">
                  AutoCenter Jülich
                </p>

                <h1 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight text-[var(--ac-text)]">
                  Finanzierung{" "}
                  <span className="ac-text-gradient">Informationen</span>
                </h1>

                <p className="mt-3 max-w-2xl text-sm sm:text-base text-[var(--ac-muted-2)] leading-relaxed">
                  Wir bieten flexible Finanzierungslösungen — transparent, fair
                  und schnell. Die genauen Konditionen hängen vom Fahrzeug und
                  der Bonität ab.
                </p>
              </div>
            </div>

            <div className="h-px w-full bg-gradient-to-r from-transparent via-white/15 to-transparent" />
          </section>

          {/* FEATURES (same content, Garantie-like bordered grid) */}
          <section className="mt-10 sm:mt-12">
            <div className="rounded-2xl border border-white/10 overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-3">
                <div className="p-5 sm:p-6 bg-[rgba(10,20,45,0.35)] border-b md:border-b-0 md:border-r border-white/10">
                  <p className="text-xs text-[var(--ac-muted)]">
                    Flexible Laufzeiten
                  </p>
                  <p className="mt-1 text-base sm:text-lg font-semibold text-[var(--ac-text)]">
                    Flexible Laufzeiten
                  </p>
                  <p className="mt-2 text-sm text-[var(--ac-muted-2)]">
                    Typisch 12–84 Monate möglich. Wir finden die passende Rate
                    für dein Budget.
                  </p>
                </div>

                <div className="p-5 sm:p-6 bg-[rgba(10,20,45,0.45)] border-b md:border-b-0 md:border-r border-white/10">
                  <p className="text-xs text-[var(--ac-muted)]">
                    Anzahlung optional
                  </p>
                  <p className="mt-1 text-base sm:text-lg font-semibold text-[var(--ac-text)]">
                    Anzahlung optional
                  </p>
                  <p className="mt-2 text-sm text-[var(--ac-muted-2)]">
                    Mit oder ohne Anzahlung – du entscheidest, was für dich am
                    besten passt.
                  </p>
                </div>

                <div className="p-5 sm:p-6 bg-[rgba(10,20,45,0.35)]">
                  <p className="text-xs text-[var(--ac-muted)]">
                    Schnelle Abwicklung
                  </p>
                  <p className="mt-1 text-base sm:text-lg font-semibold text-[var(--ac-text)]">
                    Schnelle Abwicklung
                  </p>
                  <p className="mt-2 text-sm text-[var(--ac-muted-2)]">
                    Unkomplizierter Ablauf über unsere Finanzierungspartner –
                    mit klaren Informationen.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* DETAILS (two columns, Garantie-like panels) */}
          <section className="mt-12 sm:mt-14">
            <div className="flex items-end justify-between gap-4 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-bold text-[var(--ac-text)]">
                Details
              </h2>
            </div>

            <div className="mt-6 overflow-hidden rounded-2xl border border-white/10">
              <div className="grid grid-cols-1 lg:grid-cols-2">
                <div className="p-5 sm:p-6 bg-[rgba(10,20,45,0.35)] border-b lg:border-b-0 lg:border-r border-white/10">
                  <p className="text-xs text-[var(--ac-muted)]">
                    Was du mitbringen solltest
                  </p>
                  <h3 className="mt-1 text-base sm:text-lg font-bold text-[var(--ac-text)]">
                    Was du mitbringen solltest
                  </h3>

                  <ul className="mt-4 space-y-3">
                    <Bullet>Ausweis / Aufenthaltstitel</Bullet>
                    <Bullet>Wohnsitz in Deutschland</Bullet>
                    <Bullet>Nachweise (z.B. Einkommen) – je nach Bank</Bullet>
                    <Bullet>Bankverbindung</Bullet>
                  </ul>
                </div>

                <div className="p-5 sm:p-6 bg-[rgba(10,20,45,0.45)]">
                  <p className="text-xs text-[var(--ac-muted)]">
                    So läuft es ab
                  </p>
                  <h3 className="mt-1 text-base sm:text-lg font-bold text-[var(--ac-text)]">
                    So läuft es ab
                  </h3>

                  <ul className="mt-4 space-y-3">
                    <Bullet variant="blue">
                      Du sagst uns Wunschrate & Laufzeit
                    </Bullet>
                    <Bullet variant="blue">Wir prüfen passende Angebote</Bullet>
                    <Bullet variant="blue">
                      Du bekommst klare Konditionen
                    </Bullet>
                    <Bullet variant="blue">
                      Nach Zustimmung: schnelle Abwicklung
                    </Bullet>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* NOTE (Garantie-like legal block style) */}
          <section className="mt-12">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8">
              <h3 className="text-base sm:text-lg font-bold text-[var(--ac-text)]">
                Hinweis
              </h3>
              <p className="mt-3 text-sm text-[var(--ac-muted-2)] leading-relaxed">
                Diese Seite ist informativ und keine verbindliche Zusage. Die
                endgültigen Bedingungen richten sich nach Bank/Partner und
                Bonität.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
