"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2, Send, XCircle } from "lucide-react";

// Must match ALLOWED_SUBJECTS in /api/contact/route.js
const SUBJECT_OPTIONS = [
  "Allgemeine Anfrage",
  "Probefahrt vereinbaren",
  "Finanzierung anfragen",
  "Inzahlungnahme anfragen",
  "Service-Termin vereinbaren",
];

export default function ContactForm() {
  const sp = useSearchParams();
  const formRef = useRef(null);
  const hpRef = useRef("");
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState(null);
  const [msg, setMsg] = useState("");

  const presetSubject = SUBJECT_OPTIONS.includes(sp.get("betreff") || "") ? sp.get("betreff") : "";
  const vehicle = (sp.get("fahrzeug") || "").slice(0, 160);
  const vehicleId = (sp.get("fahrzeugId") || "").replace(/[^A-Za-z0-9_-]/g, "").slice(0, 40);
  const presetMessage = vehicle
    ? `Guten Tag,\n\nich interessiere mich für das Fahrzeug: ${vehicle}.\n\n`
    : "";

  async function onSubmit(e) {
    e.preventDefault();
    setOk(null);
    setMsg("");

    const fd = new FormData(e.target);
    const payload = {
      name: String(fd.get("name") || "").trim(),
      email: String(fd.get("email") || "").trim(),
      phone: String(fd.get("phone") || "").trim(),
      subject: String(fd.get("subject") || "").trim(),
      message: String(fd.get("message") || "").trim(),
      vehicle,
      vehicleId,
      agreement: fd.get("agreement") === "on",
      website: hpRef.current || "",
    };

    if (!payload.name || !payload.email || !payload.subject || !payload.message) {
      setOk(false);
      setMsg("Bitte Name, E-Mail, Betreff und Nachricht ausfüllen.");
      return;
    }
    if (!payload.agreement) {
      setOk(false);
      setMsg("Bitte bestätigen Sie die Datenschutzerklärung.");
      return;
    }
    if (!SUBJECT_OPTIONS.includes(payload.subject)) {
      setOk(false);
      setMsg("Bitte wählen Sie einen gültigen Betreff aus.");
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
        setMsg(data?.error || "Senden fehlgeschlagen. Bitte versuchen Sie es erneut.");
        return;
      }

      setOk(true);
      setMsg("Vielen Dank! Ihre Nachricht wurde erfolgreich gesendet. Wir melden uns in Kürze.");
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
    <form ref={formRef} onSubmit={onSubmit} className="mt-4 space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="label">
            Name *
          </label>
          <input id="name" name="name" autoComplete="name" className="field" placeholder="Vor- und Nachname" required />
        </div>
        <div>
          <label htmlFor="email" className="label">
            E-Mail *
          </label>
          <input id="email" name="email" type="email" autoComplete="email" className="field" placeholder="name@beispiel.de" required />
        </div>
        <div>
          <label htmlFor="phone" className="label">
            Telefon
          </label>
          <input id="phone" name="phone" type="tel" autoComplete="tel" className="field" placeholder="Für einen Rückruf" />
        </div>
        <div>
          <label htmlFor="subject" className="label">
            Betreff *
          </label>
          <select id="subject" name="subject" required defaultValue={presetSubject} className="field">
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

      <div>
        <label htmlFor="message" className="label">
          Nachricht *
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          defaultValue={presetMessage}
          className="field resize-y"
          placeholder="Wie können wir Ihnen helfen?"
          required
        />
      </div>

      {/* Honeypot – hidden from real visitors, filled in by bots */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
        onChange={(e) => (hpRef.current = e.target.value)}
      />

      <label htmlFor="agreement" className="flex cursor-pointer items-start gap-2 text-xs leading-5 text-body">
        <input type="checkbox" id="agreement" name="agreement" className="mt-0.5 h-3.5 w-3.5 shrink-0 rounded" required />
        <span>
          Ich stimme zu, dass meine Angaben zur Bearbeitung meiner Anfrage gemäß der{" "}
          <Link href="/Datenschutz" className="font-medium text-brand-600 hover:underline">
            Datenschutzerklärung
          </Link>{" "}
          verarbeitet werden. *
        </span>
      </label>

      <button type="submit" disabled={loading} className="btn btn-primary w-full sm:w-auto sm:px-6">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        {loading ? "Wird gesendet …" : "Nachricht senden"}
      </button>

      {msg ? (
        <div
          role="status"
          className={`flex items-start gap-2 rounded-md border px-3 py-2 text-[13px] ${
            ok ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-rose-200 bg-rose-50 text-rose-800"
          }`}
        >
          {ok ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> : <XCircle className="mt-0.5 h-4 w-4 shrink-0" />}
          {msg}
        </div>
      ) : null}
    </form>
  );
}
