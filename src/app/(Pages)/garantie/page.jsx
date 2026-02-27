export default function GarantiePage() {
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
                  CAR GARANTIE®
                </p>

                {/* ✅ same line */}
                <h1 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight text-[var(--ac-text)]">
                  Mehr Schutz –{" "}
                  <span className="ac-text-gradient">ganz einfach.</span>
                </h1>

                <p className="mt-3 max-w-2xl text-sm sm:text-base text-[var(--ac-muted-2)] leading-relaxed">
                  Flexible Laufzeiten. Klare Konditionen.
                </p>
              </div>
            </div>

            <div className="h-px w-full bg-gradient-to-r from-transparent via-white/15 to-transparent" />
          </section>

          {/* FEATURES */}
          <section className="mt-10 sm:mt-12">
            <div className="rounded-2xl border border-white/10 overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2">
                <div className="p-5 sm:p-6 bg-[rgba(10,20,45,0.35)] border-b md:border-b-0 md:border-r border-white/10">
                  <p className="text-xs text-[var(--ac-muted)]">Laufzeiten</p>
                  <p className="mt-1 text-base sm:text-lg font-semibold text-[var(--ac-text)]">
                    12, 24 oder 36 Monate
                  </p>
                  <p className="mt-2 text-sm text-[var(--ac-muted-2)]">
                    Schutz passend zu Fahrzeug und Nutzung.
                  </p>
                </div>

                <div className="p-5 sm:p-6 bg-[rgba(10,20,45,0.45)] border-b border-white/10 md:border-b-0">
                  <p className="text-xs text-[var(--ac-muted)]">Abwicklung</p>
                  <p className="mt-1 text-base sm:text-lg font-semibold text-[var(--ac-text)]">
                    Unterstützung mit der Werkstatt
                  </p>
                  <p className="mt-2 text-sm text-[var(--ac-muted-2)]">
                    Wir helfen bei der Organisation und Abwicklung.
                  </p>
                </div>

                <div className="p-5 sm:p-6 bg-[rgba(10,20,45,0.45)] md:border-r border-white/10">
                  <p className="text-xs text-[var(--ac-muted)]">Konditionen</p>
                  <p className="mt-1 text-base sm:text-lg font-semibold text-[var(--ac-text)]">
                    Klar & nachvollziehbar
                  </p>
                  <p className="mt-2 text-sm text-[var(--ac-muted-2)]">
                    Keine unnötigen Überraschungen durch versteckte Kosten.
                  </p>
                </div>

                <div className="p-5 sm:p-6 bg-[rgba(10,20,45,0.35)]">
                  <p className="text-xs text-[var(--ac-muted)]">
                    Notfallservice
                  </p>
                  <p className="mt-1 text-base sm:text-lg font-semibold text-[var(--ac-text)]">
                    24/7 im EU-Raum
                  </p>
                  <p className="mt-2 text-sm text-[var(--ac-muted-2)]">
                    Schnelle Hilfe im Fall der Fälle – europaweit.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* COVERAGE */}
          <section className="mt-12 sm:mt-14">
            <div className="flex items-end justify-between gap-4 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-bold text-[var(--ac-text)]">
                Schutzumfang
              </h2>
              <p className="text-xs text-[var(--ac-muted)]">
                * Details laut Garantievertrag
              </p>
            </div>

            <div className="mt-6 overflow-hidden rounded-2xl border border-white/10">
              <div className="grid grid-cols-1 lg:grid-cols-3">
                <div className="p-5 sm:p-6 bg-[rgba(10,20,45,0.35)] border-b lg:border-b-0 lg:border-r border-white/10">
                  <p className="text-xs text-[var(--ac-muted)]">Enthalten</p>
                  <h3 className="mt-1 text-base sm:text-lg font-bold text-[var(--ac-text)]">
                    Wichtige Baugruppen
                  </h3>

                  <ul className="mt-4 space-y-3 text-sm text-[var(--ac-muted-2)]">
                    <li className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[var(--ac-blue-light)]" />
                      Motor & Getriebe
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[var(--ac-blue-light)]" />
                      Antriebsstrang
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[var(--ac-blue-light)]" />
                      Hauptelektronik
                    </li>
                  </ul>
                </div>

                <div className="p-5 sm:p-6 bg-[rgba(10,20,45,0.45)] border-b lg:border-b-0 lg:border-r border-white/10">
                  <p className="text-xs text-[var(--ac-muted)]">Erweiterbar</p>
                  <h3 className="mt-1 text-base sm:text-lg font-bold text-[var(--ac-text)]">
                    Komfort & Assistenz
                  </h3>

                  <ul className="mt-4 space-y-3 text-sm text-[var(--ac-muted-2)]">
                    <li className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[var(--ac-cyan-light)]" />
                      Klimaanlage
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[var(--ac-cyan-light)]" />
                      Fahrerassistenzsysteme
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[var(--ac-cyan-light)]" />
                      Komfortelektronik (je nach Ausstattung)
                    </li>
                  </ul>
                </div>

                <div className="p-5 sm:p-6 bg-[rgba(10,20,45,0.35)]">
                  <p className="text-xs text-[var(--ac-muted)]">
                    Nicht enthalten
                  </p>
                  <h3 className="mt-1 text-base sm:text-lg font-bold text-[var(--ac-text)]">
                    Ausnahmen
                  </h3>

                  <ul className="mt-4 space-y-3 text-sm text-[var(--ac-muted-2)]">
                    <li className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-white/20" />
                      Verschleißteile
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-white/20" />
                      Karosserieschäden
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-white/20" />
                      Unfallfolgen
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <p className="text-sm text-[var(--ac-muted-2)]">
                Alle Garantien werden{" "}
                <span className="text-[var(--ac-text)] font-semibold">
                  CarGarantie®
                </span>{" "}
                bereitgestellt.
              </p>
            </div>
          </section>

          {/* LEGAL */}
          <section className="mt-12">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8">
              <h3 className="text-base sm:text-lg font-bold text-[var(--ac-text)]">
                Rechtliche Hinweise
              </h3>
              <p className="mt-3 text-sm text-[var(--ac-muted-2)] leading-relaxed">
                Die CarGarantie® ist eine freiwillige Leistung des AutoCenter
                Jülich in Kooperation mit CarGarantie® und keine gesetzliche
                Gewährleistung. Umfang und Bedingungen ergeben sich aus dem
                individuellen Garantievertrag. Voraussetzung ist ein technisch
                einwandfreies Fahrzeug bei Vertragsabschluss. Stand: Februar
                2026.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
