"use client";

import { useMemo, useState } from "react";

export default function KontaktPage() {
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState(null);
  const [msg, setMsg] = useState("");

  const address = "Rudolf-Diesel-Str. 5, 52428 Jülich, Deutschland";

  const mapsLink = useMemo(() => {
    const q = encodeURIComponent(address);
    return `https://www.google.com/maps/search/?api=1&query=${q}`;
  }, [address]);

  // Google Maps embed without API key
  const embedSrc = useMemo(() => {
    const q = encodeURIComponent(address);
    return `https://www.google.com/maps?q=${q}&output=embed`;
  }, [address]);

  async function onSubmit(e) {
    e.preventDefault();
    setOk(null);
    setMsg("");

    const fd = new FormData(e.currentTarget);
    const payload = {
      name: String(fd.get("name") || "").trim(),
      email: String(fd.get("email") || "").trim(),
      phone: String(fd.get("phone") || "").trim(),
      subject: String(fd.get("subject") || "").trim(),
      message: String(fd.get("message") || "").trim(),
      agreement: fd.get("agreement") === "on",
    };

    if (!payload.name || !payload.email || !payload.message) {
      setOk(false);
      setMsg("Bitte Name, E-Mail und Nachricht ausfüllen.");
      return;
    }
    if (!payload.agreement) {
      setOk(false);
      setMsg("Bitte Datenschutzerklärung bestätigen.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setOk(false);
        setMsg(data?.error || "Senden fehlgeschlagen. Bitte erneut versuchen.");
        return;
      }

      setOk(true);
      setMsg("Danke! Ihre Nachricht wurde erfolgreich gesendet.");
      e.currentTarget.reset();
    } catch {
      setOk(false);
      setMsg("Netzwerkfehler. Bitte erneut versuchen.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="ac-page">
      <div className="ac-container py-6 sm:py-8 lg:py-12">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-6 sm:mb-8 lg:mb-12 px-2">
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-[var(--ac-text)] leading-tight">
            Kontaktieren <span className="ac-text-gradient">Sie uns</span>
          </h1>
        </div>

        {/* Main */}
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-5 sm:gap-6 lg:gap-10">
            {/* FORM */}
            <div className="ac-panel rounded-2xl p-4 sm:p-6 lg:p-8">
              <div className="mb-5 sm:mb-6">
                <h2 className="text-lg sm:text-2xl font-bold text-[var(--ac-text)]">
                  Senden Sie eine Nachricht
                </h2>
              </div>

              <form className="space-y-4 sm:space-y-5" onSubmit={onSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="group space-y-1.5">
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-[var(--ac-muted)] cursor-pointer select-none group-focus-within:text-[var(--ac-blue-light)]"
                    >
                      Name *
                    </label>
                    <input
                      id="name"
                      name="name"
                      className="ac-field w-full rounded-xl px-3.5 py-2.5 text-sm sm:text-base"
                      placeholder="Vollständiger Name"
                      required
                    />
                  </div>

                  <div className="group space-y-1.5">
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-[var(--ac-muted)] cursor-pointer select-none group-focus-within:text-[var(--ac-blue-light)]"
                    >
                      E-Mail *
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      className="ac-field w-full rounded-xl px-3.5 py-2.5 text-sm sm:text-base"
                      placeholder="email@adresse.de"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="group space-y-1.5">
                    <label
                      htmlFor="phone"
                      className="block text-sm font-medium text-[var(--ac-muted)] cursor-pointer select-none group-focus-within:text-[var(--ac-blue-light)]"
                    >
                      Telefon
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      className="ac-field w-full rounded-xl px-3.5 py-2.5 text-sm sm:text-base"
                      placeholder="+49 123 456 789"
                    />
                  </div>

                  <div className="group space-y-1.5">
                    <label
                      htmlFor="subject"
                      className="block text-sm font-medium text-[var(--ac-muted)] cursor-pointer select-none group-focus-within:text-[var(--ac-blue-light)]"
                    >
                      Betreff
                    </label>
                    <input
                      id="subject"
                      name="subject"
                      className="ac-field w-full rounded-xl px-3.5 py-2.5 text-sm sm:text-base"
                      placeholder="Worum geht es?"
                    />
                  </div>
                </div>

                <div className="group space-y-1.5">
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-[var(--ac-muted)] cursor-pointer select-none group-focus-within:text-[var(--ac-blue-light)]"
                  >
                    Nachricht *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    className="ac-field w-full rounded-xl px-3.5 py-2.5 text-sm sm:text-base resize-none"
                    placeholder="Beschreiben Sie Ihr Anliegen im Detail..."
                    required
                  />
                </div>

                <div className="flex items-start gap-3 pt-1">
                  <input
                    type="checkbox"
                    id="agreement"
                    name="agreement"
                    className="mt-1 h-4 w-4 rounded border-white/20 text-[var(--ac-blue)] focus:ring-2 focus:ring-[var(--ac-ring)]"
                    required
                  />
                  <label
                    htmlFor="agreement"
                    className="text-xs sm:text-sm text-[var(--ac-muted-2)] leading-relaxed cursor-pointer select-none"
                  >
                    Ich stimme zu, dass meine Daten gemäß der{" "}
                    <a
                      href="/datenschutz"
                      className="text-[var(--ac-blue-light)] hover:underline"
                    >
                      Datenschutzerklärung
                    </a>{" "}
                    verarbeitet werden.
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto px-6 sm:px-7 py-3 text-white text-sm sm:text-base font-semibold rounded-xl hover:opacity-90 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{ background: "var(--ac-gradient-primary)" }}
                >
                  {loading ? "Senden..." : "Nachricht senden"}
                </button>

                {msg ? (
                  <div
                    className={[
                      "mt-3 rounded-xl border px-4 py-3 text-sm",
                      ok
                        ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-200"
                        : "border-red-400/25 bg-red-400/10 text-red-200",
                    ].join(" ")}
                  >
                    {msg}
                  </div>
                ) : null}
              </form>
            </div>

            {/* MAP (always visible) */}
            <div className="ac-panel rounded-2xl p-4 sm:p-6 lg:p-8 space-y-5 sm:space-y-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg sm:text-2xl font-bold text-[var(--ac-text)]">
                    Unsere Location
                  </h2>
                  <p className="mt-2 text-sm text-[var(--ac-muted-2)]">
                    {address}
                  </p>
                </div>

                <a
                  href={mapsLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-[var(--ac-text)] hover:bg-white/10 transition"
                >
                  In Maps öffnen
                </a>
              </div>

              <div className="rounded-2xl overflow-hidden border border-white/10 bg-white/5">
                <iframe
                  title="AutoCenter Jülich - Standort"
                  src={embedSrc}
                  className="w-full h-72 sm:h-72 lg:h-[520px]"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>
            </div>
            {/* /MAP */}
          </div>
        </div>
      </div>
    </div>
  );
}
