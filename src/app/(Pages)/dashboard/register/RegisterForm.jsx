"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

const PASSWORD_RULE = /^(?=.*[!@#$%^&*()_\-+=[\]{};':"\\|,.<>/?`~]).{6,}$/;

export default function RegisterForm() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
  });

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [ok, setOk] = useState(null);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    setOk(null);

    const password = form.password.trim();

    if (!PASSWORD_RULE.test(password)) {
      setOk(false);
      setMsg(
        "Das Passwort muss mindestens 6 Zeichen lang sein und mindestens ein Sonderzeichen enthalten.",
      );
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setOk(false);
        setMsg(data.error || "Registrierung fehlgeschlagen.");
        return;
      }

      setOk(true);
      setMsg("Benutzer wurde erfolgreich erstellt.");

      setForm({
        name: "",
        email: "",
        password: "",
        role: "user",
      });

      router.refresh();
    } catch (error) {
      setOk(false);
      setMsg("Etwas ist schiefgelaufen.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen ac-page px-4 py-12">
      <div className="mx-auto w-full max-w-md">
        <Link
          href="/dashboard"
          className="mb-4 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/90 transition hover:bg-white/10"
        >
          <ArrowLeft className="h-4 w-4" />
          Zurück zum Dashboard
        </Link>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md sm:p-8">
          <h1 className="text-2xl font-bold text-white sm:text-3xl">
            Benutzer erstellen
          </h1>

          <p className="mt-2 text-sm text-white/70">
            Nur Administratoren können neue Benutzer oder Administratoren
            erstellen.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <input
              name="name"
              type="text"
              placeholder="Vollständiger Name"
              value={form.name}
              onChange={handleChange}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-white/40"
              required
            />

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

            <p className="text-xs text-white/50">
              Das Passwort muss mindestens 6 Zeichen lang sein und ein
              Sonderzeichen enthalten.
            </p>

            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
            >
              <option value="user" className="text-black">
                Benutzer
              </option>
              <option value="admin" className="text-black">
                Administrator
              </option>
            </select>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl px-4 py-3 font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60"
              style={{ background: "var(--ac-gradient-primary)" }}
            >
              {loading ? "Wird erstellt..." : "Konto erstellen"}
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
    </div>
  );
}
