"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, UserPlus } from "lucide-react";

const PASSWORD_RULE = /^(?=.*[!@#$%^&*()_\-+=[\]{};':"\\|,.<>/?`~]).{6,}$/;

export default function RegisterForm() {
  const router = useRouter();

  const [form, setForm] = useState({ name: "", email: "", password: "", role: "user" });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [ok, setOk] = useState(null);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    setOk(null);

    const password = form.password.trim();

    if (!PASSWORD_RULE.test(password)) {
      setOk(false);
      setMsg("Das Passwort muss mindestens 6 Zeichen lang sein und mindestens ein Sonderzeichen enthalten.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setOk(false);
        setMsg(data.error || "Registrierung fehlgeschlagen.");
        return;
      }

      setOk(true);
      setMsg("Benutzer wurde erfolgreich erstellt.");
      setForm({ name: "", email: "", password: "", role: "user" });
      router.refresh();
    } catch {
      setOk(false);
      setMsg("Etwas ist schiefgelaufen.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl">
      <div className="card p-5">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
            <UserPlus className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-2xl font-bold">Benutzer erstellen</h1>
            <p className="text-sm text-muted">Nur Administratoren können neue Konten anlegen.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label htmlFor="name" className="label">
              Vollständiger Name
            </label>
            <input id="name" name="name" type="text" value={form.name} onChange={handleChange} className="field" required />
          </div>

          <div>
            <label htmlFor="email" className="label">
              E-Mail-Adresse
            </label>
            <input id="email" name="email" type="email" value={form.email} onChange={handleChange} className="field" required />
          </div>

          <div>
            <label htmlFor="password" className="label">
              Passwort
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              value={form.password}
              onChange={handleChange}
              className="field"
              required
            />
            <p className="mt-1.5 text-xs text-muted">Mindestens 6 Zeichen und ein Sonderzeichen.</p>
          </div>

          <div>
            <span className="label">Rolle</span>
            <div className="grid grid-cols-2 gap-2">
              {[
                ["user", "Mitarbeiter"],
                ["admin", "Administrator"],
              ].map(([value, label]) => (
                <label
                  key={value}
                  className={`flex cursor-pointer items-center gap-2.5 rounded-xl border px-4 py-3 text-[15px] font-medium transition ${
                    form.role === value ? "border-brand-600 bg-brand-50 text-brand-700" : "border-line-strong text-body hover:border-brand-500"
                  }`}
                >
                  <input type="radio" name="role" value={value} checked={form.role === value} onChange={handleChange} />
                  {label}
                </label>
              ))}
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary btn-lg w-full">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {loading ? "Wird erstellt …" : "Konto erstellen"}
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
  );
}
