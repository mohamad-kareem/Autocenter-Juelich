"use client";

import { useMemo, useRef, useState } from "react";

export default function KontaktPage() {
  const formRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState(null);
  const [msg, setMsg] = useState("");

  const address = "Rudolf-Diesel-Str. 5, 52428 Jülich, Deutschland";

  const SUBJECT_OPTIONS = useMemo(
    () => [
      "Allgemeine Anfrage",
      "Probefahrt vereinbaren",
      "Finanzierung anfragen",
      "Inzahlungnahme anfragen",
      "Service-Termin vereinbaren",
    ],
    [],
  );

  const mapsLink = useMemo(() => {
    const q = encodeURIComponent(address);
    return `https://www.google.com/maps/search/?api=1&query=${q}`;
  }, [address]);

  const embedSrc = useMemo(() => {
    const q = encodeURIComponent(address);
    return `https://www.google.com/maps?q=${q}&output=embed`;
  }, [address]);

  async function onSubmit(e) {
    e.preventDefault();
    setOk(null);
    setMsg("");

    const fd = new FormData(e.target); // ✅ safer than e.currentTarget
    const payload = {
      name: String(fd.get("name") || "").trim(),
      email: String(fd.get("email") || "").trim(),
      phone: String(fd.get("phone") || "").trim(),
      subject: String(fd.get("subject") || "").trim(),
      message: String(fd.get("message") || "").trim(),
      agreement: fd.get("agreement") === "on",
    };

    if (
      !payload.name ||
      !payload.email ||
      !payload.subject ||
      !payload.message
    ) {
      setOk(false);
      setMsg("Bitte Name, E-Mail, Betreff und Nachricht ausfüllen.");
      return;
    }

    if (!payload.agreement) {
      setOk(false);
      setMsg("Bitte Datenschutzerklärung bestätigen.");
      return;
    }

    if (!SUBJECT_OPTIONS.includes(payload.subject)) {
      setOk(false);
      setMsg("Bitte einen gültigen Betreff auswählen.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        cache: "no-store",
      });

      const raw = await res.text();
      let data = {};
      try {
        data = raw ? JSON.parse(raw) : {};
      } catch {
        data = { raw };
      }

      if (!res.ok) {
        setOk(false);
        setMsg(data?.error || "Senden fehlgeschlagen. Bitte erneut versuchen.");
        return;
      }

      setOk(true);
      setMsg("Danke! Ihre Nachricht wurde erfolgreich gesendet.");

      // ✅ FIX: use ref reset (no null crash)
      formRef.current?.reset();
    } catch (err) {
      console.error("CONTACT_FETCH_ERROR:", err);
      setOk(false);
      setMsg(`Netzwerkfehler: ${err?.message || "Unbekannt"}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="ac-page">
      <div className="px-4 sm:px-6 lg:px-12 py-10 sm:py-12 lg:py-16">
        <div className="mx-auto w-full max-w-6xl">
          {/* HERO */}
          <section className="relative">
            <div className="h-px w-full bg-gradient-to-r from-transparent via-white/15 to-transparent" />

            <div className="py-10 sm:py-12 lg:py-2">
              <div className="max-w-3xl">
                <h1 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight text-[var(--ac-text)]">
                  Kontaktieren <span className="ac-text-gradient">Sie uns</span>
                </h1>

                <p className="mt-3 max-w-2xl text-sm sm:text-base text-[var(--ac-muted-2)] leading-relaxed">
                  Schnell, unkompliziert und direkt – wir melden uns so bald wie
                  möglich.
                </p>
              </div>
            </div>

            <div className="h-px w-full bg-gradient-to-r from-transparent via-white/15 to-transparent" />
          </section>

          {/* MAIN */}
          <section className="mt-10 sm:mt-12">
            <div className="grid lg:grid-cols-2 gap-5 sm:gap-6 lg:gap-10">
              {/* FORM */}
              <div className="rounded-2xl border border-white/10 overflow-hidden">
                <div className="p-5 sm:p-6 lg:p-8 bg-[rgba(10,20,45,0.35)]">
                  <div className="mb-5 sm:mb-6">
                    <h2 className="text-lg sm:text-2xl font-bold text-[var(--ac-text)]">
                      Senden Sie eine Nachricht
                    </h2>
                    <p className="mt-2 text-sm text-[var(--ac-muted-2)]">
                      Felder mit * sind Pflichtfelder.
                    </p>
                  </div>

                  <form
                    ref={formRef}
                    className="space-y-4 sm:space-y-5"
                    onSubmit={onSubmit}
                  >
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
                          placeholder="+49 2461 9163780"
                        />
                      </div>

                      <div className="group space-y-1.5">
                        <label
                          htmlFor="subject"
                          className="block text-sm font-medium text-[var(--ac-muted)] cursor-pointer select-none group-focus-within:text-[var(--ac-blue-light)]"
                        >
                          Betreff *
                        </label>

                        <select
                          id="subject"
                          name="subject"
                          required
                          defaultValue=""
                          className="ac-field w-full rounded-xl px-3.5 py-2.5 text-sm sm:text-base"
                        >
                          <option value="" disabled>
                            Bitte auswählen
                          </option>
                          {SUBJECT_OPTIONS.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
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
                          href="/Datenschutz"
                          className="text-[var(--ac-blue-light)] hover:underline"
                        >
                          Datenschutzerklärung
                        </a>{" "}
                        verarbeitet werden.
                      </label>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full sm:w-auto px-6 sm:px-7 py-3 text-white text-sm sm:text-base font-semibold rounded-xl hover:opacity-90 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed"
                        style={{ background: "var(--ac-gradient-primary)" }}
                      >
                        {loading ? "Senden..." : "Nachricht senden"}
                      </button>
                    </div>

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
              </div>

              {/* MAP */}
              <div className="rounded-2xl border border-white/10 overflow-hidden">
                <div className="p-5 sm:p-6 lg:p-8 bg-[rgba(10,20,45,0.45)]">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-lg sm:text-2xl font-bold text-[var(--ac-text)]">
                        Unsere Location
                      </h2>
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

                  <div className="mt-5 rounded-2xl overflow-hidden border border-white/10 bg-white/5">
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
              </div>
              {/* /MAP */}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
