"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Lock, Mail } from "lucide-react";
import Logo from "@/app/(components)/Logo";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [ok, setOk] = useState(null);

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

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
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand side */}
      <div className="relative hidden overflow-hidden bg-navy-950 lg:block">
        <Image src="/center.jpg" alt="" fill priority sizes="50vw" className="object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/60 to-navy-950/30" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <Logo className="h-12 w-auto" />
          <div>
            <p className="text-2xl font-bold leading-tight text-white">Mitarbeiterbereich</p>
            <p className="mt-3 max-w-md text-white/70">Stempeluhr, Zeiterfassung und Benutzerverwaltung für das Team von Autocenter Jülich.</p>
          </div>
        </div>
      </div>

      {/* Form side */}
      <div className="flex flex-col bg-white">
        <div className="flex items-center justify-between bg-navy-900 px-5 py-4 lg:hidden">
          <Logo className="h-8 w-auto" />
        </div>
        <div className="flex flex-1 items-center justify-center px-5 py-12">
          <div className="w-full max-w-sm">
            <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink">
              <ArrowLeft className="h-4 w-4" /> Zur Website
            </Link>
            <h1 className="mt-6 text-2xl font-bold">Anmelden</h1>
            <p className="mt-2 text-muted">Melden Sie sich mit Ihrem Mitarbeiterkonto an.</p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div>
                <label htmlFor="email" className="label">
                  E-Mail-Adresse
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="username"
                    value={form.email}
                    onChange={handleChange}
                    className="field pl-9"
                    placeholder="name@autocenter-juelich.de"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="label">
                  Passwort
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    value={form.password}
                    onChange={handleChange}
                    className="field pl-9"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn btn-primary btn-lg w-full">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {loading ? "Anmeldung läuft …" : "Anmelden"}
              </button>

              {msg ? (
                <div
                  role="status"
                  className={`rounded-xl border px-4 py-3 text-sm ${
                    ok ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-rose-200 bg-rose-50 text-rose-800"
                  }`}
                >
                  {msg}
                </div>
              ) : null}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
