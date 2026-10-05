"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Check, KeyRound, Loader2, Lock, LogOut, Shield, User } from "lucide-react";
import { initialsOf } from "@/app/(components)/UserMenu";

export default function ProfileClient({ initialUser }) {
  const router = useRouter();
  const [user, setUser] = useState(initialUser);
  const [name, setName] = useState(initialUser.name);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [busy, setBusy] = useState("");
  const [msg, setMsg] = useState(null); // { ok, text }

  async function save(payload, key) {
    setBusy(key);
    setMsg(null);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setMsg({ ok: false, text: data.error || "Speichern fehlgeschlagen." });
        return false;
      }
      setUser((u) => ({ ...u, ...data.user }));
      router.refresh();
      return true;
    } catch {
      setMsg({ ok: false, text: "Keine Verbindung zum Server." });
      return false;
    } finally {
      setBusy("");
    }
  }

  async function saveAccount(e) {
    e.preventDefault();
    const ok = await save({ name: name.trim() }, "account");
    if (ok) setMsg({ ok: true, text: "Profil gespeichert." });
  }

  async function savePassword(e) {
    e.preventDefault();
    if (newPassword !== repeatPassword) {
      setMsg({ ok: false, text: "Die neuen Passwörter stimmen nicht überein." });
      return;
    }
    const ok = await save({ currentPassword, newPassword }, "password");
    if (ok) {
      setCurrentPassword("");
      setNewPassword("");
      setRepeatPassword("");
      setMsg({ ok: true, text: "Passwort geändert." });
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      {/* Identity card */}
      <div className="card flex flex-wrap items-center gap-4 p-4">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-accent-500 text-lg font-bold text-white">
          {initialsOf(user.name) || "?"}
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-bold">{user.name}</h1>
          <p className="truncate text-sm text-muted">{user.email}</p>
        </div>
        <span className="chip bg-canvas text-muted">
          <Shield className="h-3 w-3" />
          {user.role === "admin" ? "Administrator" : "Mitarbeiter"}
        </span>
        <form action="/api/auth/logout" method="POST">
          <button type="submit" className="btn btn-secondary btn-sm">
            <LogOut className="h-3.5 w-3.5" />
            Abmelden
          </button>
        </form>
      </div>

      {msg ? (
        <div
          role="status"
          className={`mt-3 flex items-center gap-2 rounded-md border px-3 py-2 text-[13px] ${
            msg.ok ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-rose-200 bg-rose-50 text-rose-800"
          }`}
        >
          {msg.ok ? <Check className="h-4 w-4 shrink-0" /> : <AlertTriangle className="h-4 w-4 shrink-0" />}
          {msg.text}
        </div>
      ) : null}

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {/* Account data */}
        <form onSubmit={saveAccount} className="card p-4">
          <h2 className="flex items-center gap-2 text-base font-semibold">
            <User className="h-4 w-4 text-brand-600" />
            Persönliche Daten
          </h2>

          <div className="mt-3 space-y-3">
            <div>
              <label htmlFor="name" className="label">
                Name
              </label>
              <input id="name" value={name} onChange={(e) => setName(e.target.value)} className="field" required />
            </div>
            <div>
              <span className="label">E-Mail-Adresse (Login)</span>
              <div className="flex h-9 items-center gap-2 rounded-md border border-line bg-canvas px-3 text-[13px] text-muted">
                <Lock className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{user.email}</span>
              </div>
              <p className="mt-1 text-[11px] text-muted">
                Die Login-Adresse kann nicht geändert werden.
              </p>
            </div>
          </div>

          <button type="submit" disabled={busy === "account"} className="btn btn-primary btn-sm mt-4">
            {busy === "account" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
            Speichern
          </button>
        </form>

        {/* Password */}
        <form onSubmit={savePassword} className="card p-4">
          <h2 className="flex items-center gap-2 text-base font-semibold">
            <KeyRound className="h-4 w-4 text-brand-600" />
            Passwort ändern
          </h2>

          <div className="mt-3 space-y-3">
            <div>
              <label htmlFor="pw-old" className="label">
                Aktuelles Passwort
              </label>
              <input
                id="pw-old"
                type="password"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="field"
                required
              />
            </div>
            <div>
              <label htmlFor="pw-new" className="label">
                Neues Passwort
              </label>
              <input
                id="pw-new"
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="field"
                required
              />
              <p className="mt-1 text-[11px] text-muted">Mindestens 6 Zeichen und ein Sonderzeichen.</p>
            </div>
            <div>
              <label htmlFor="pw-repeat" className="label">
                Neues Passwort wiederholen
              </label>
              <input
                id="pw-repeat"
                type="password"
                autoComplete="new-password"
                value={repeatPassword}
                onChange={(e) => setRepeatPassword(e.target.value)}
                className="field"
                required
              />
            </div>
          </div>

          <button type="submit" disabled={busy === "password"} className="btn btn-primary btn-sm mt-4">
            {busy === "password" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <KeyRound className="h-3.5 w-3.5" />}
            Passwort ändern
          </button>
        </form>
      </div>
    </div>
  );
}
