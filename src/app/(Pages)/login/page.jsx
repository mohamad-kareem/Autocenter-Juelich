"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [ok, setOk] = useState(null);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    setOk(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setOk(false);
        setMsg(data.error || "Anmeldung fehlgeschlagen.");
        return;
      }

      setOk(true);
      setMsg("Anmeldung erfolgreich.");

      router.push("/dashboard");
      router.refresh();
    } catch {
      setOk(false);
      setMsg("Es ist ein Fehler aufgetreten.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen ac-page flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md sm:p-8">
        <h1 className="text-2xl font-bold text-white sm:text-3xl">Anmelden</h1>
        <p className="mt-2 text-sm text-white/70">
          Melden Sie sich in Ihrem Konto an.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input
            name="email"
            type="email"
            placeholder="E-Mail-Adresse"
            value={form.email}
            onChange={handleChange}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-white/40"
            required
          />

          <input
            name="password"
            type="password"
            placeholder="Passwort"
            value={form.password}
            onChange={handleChange}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-white/40"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl px-4 py-3 font-semibold text-white disabled:opacity-60"
            style={{ background: "var(--ac-gradient-primary)" }}
          >
            {loading ? "Anmeldung läuft..." : "Anmelden"}
          </button>

          {msg ? (
            <div
              className={`rounded-xl border px-4 py-3 text-sm ${
                ok
                  ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                  : "border-red-500/20 bg-red-500/10 text-red-300"
              }`}
            >
              {msg}
            </div>
          ) : null}
        </form>
      </div>
    </div>
  );
}
