"use client";

const items = [
  {
    title: "Individuelle Finanzierung",
    text: "Maßgeschneiderte Lösungen für jedes Budget. Transparent und fair.",
    tag: "Finance",
  },
  {
    title: "Premium Fahrzeuge",
    text: "Gepflegte Modelle verschiedener Hersteller. Qualität zu fairen Preisen.",
    tag: "Selection",
  },
  {
    title: "Direkter Ankauf",
    text: "Schnelle und unkomplizierte Bewertung Ihres Fahrzeugs.",
    tag: "Trade-in",
  },
  {
    title: "Volle Transparenz",
    text: "Klare Konditionen, verständliche Verträge, keine versteckten Kosten.",
    tag: "Security",
  },
];

export default function LandingFeaturesClean() {
  return (
    <section className="py-20 ac-page">
      <div className="mx-auto max-w-7xl px-4">
        {/* Minimal Header */}
        <div className="mb-16 text-center">
          <div className="inline-block mb-4">
            <div className="h-px w-12 bg-gradient-to-r from-[var(--ac-blue)] to-[var(--ac-cyan)] mx-auto"></div>
          </div>
          <h2 className="text-4xl md:text-5xl font-light text-[var(--ac-text)] tracking-tight mb-4">
            Professionelle <span className="font-semibold">Lösungen</span>
          </h2>
          <p className="text-[var(--ac-muted)] text-lg max-w-2xl mx-auto">
            Moderner Autohandel mit Fokus auf Kundenbedürfnisse und Transparenz
          </p>
        </div>

        {/* Clean Cards Grid using ac-panel */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {items.map((item, index) => (
            <div key={item.title} className="relative group">
              {/* Number Indicator */}
              <div className="absolute -top-3 -left-3 z-10 w-8 h-8 rounded-full bg-gradient-to-br from-[var(--ac-blue)] to-[var(--ac-blue-light)] flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-black/30">
                {index + 1}
              </div>

              {/* Card with ac-panel class */}
              <div className="ac-panel rounded-xl p-6 h-full hover:border-[var(--ac-border-2)] transition-all duration-300 group-hover:translate-y-[-4px] group-hover:shadow-[var(--ac-shadow-light)]">
                {/* Tag */}
                <div className="mb-4">
                  <span className="text-xs font-medium text-[var(--ac-blue-light)] uppercase tracking-wider">
                    {item.tag}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-xl font-semibold text-[var(--ac-text)] mb-3">
                  {item.title}
                </h3>

                {/* Description */}
                <p className="text-[var(--ac-muted-2)] text-sm leading-relaxed">
                  {item.text}
                </p>

                {/* Divider */}
                <div className="mt-6 pt-4 border-t border-[var(--ac-border)]">
                  <div className="text-xs text-[var(--ac-muted-2)]">
                    <div className="flex items-center gap-2"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center">
          <div className="ac-panel inline-block px-8 py-6 rounded-2xl">
            <p className="text-lg text-[var(--ac-text)] mb-4">
              Bereit für den nächsten Schritt?
            </p>
            <button className="ac-btn-primary px-8 py-3 rounded-lg text-sm font-medium">
              Jetzt Beratungstermin vereinbaren
            </button>
            <p className="mt-4 text-sm text-[var(--ac-muted-2)]">
              Kostenlose & unverbindliche Beratung
            </p>
          </div>
        </div>

        {/* Bottom Stats */}
        <div className="mt-20 pt-8 border-t border-[var(--ac-border)]">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-[var(--ac-text)] mb-2">
                14+
              </div>
              <div className="text-sm text-[var(--ac-muted)]">
                Jahre Erfahrung
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[var(--ac-text)] mb-2">
                500+
              </div>
              <div className="text-sm text-[var(--ac-muted)]">
                Zufriedene Kunden
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[var(--ac-text)] mb-2">
                24/7
              </div>
              <div className="text-sm text-[var(--ac-muted)]">
                Service Hotline
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[var(--ac-text)] mb-2">
                100%
              </div>
              <div className="text-sm text-[var(--ac-muted)]">Transparenz</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
