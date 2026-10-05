"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Lock } from "lucide-react";

export default function MonitorLogin() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [pass, setPass] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/monitor/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, pass }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Anmeldung fehlgeschlagen.");
        return;
      }
      router.refresh();
    } catch {
      setError("Keine Verbindung.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4">
      <form onSubmit={submit} className="card w-full max-w-xs p-5">
        <div className="flex items-center gap-2 text-ink">
          <Lock className="h-4 w-4" />
          <h1 className="text-sm font-semibold">Systemlog</h1>
        </div>
        <div className="mt-4 space-y-2.5">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
            autoComplete="off"
            className="field h-9 text-[13px]"
            required
          />
          <input
            type="password"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            placeholder="Passwort"
            autoComplete="off"
            className="field h-9 text-[13px]"
            required
          />
        </div>
        {error ? <p className="mt-2 text-[12px] text-rose-700">{error}</p> : null}
        <button type="submit" disabled={busy} className="btn btn-primary mt-4 w-full">
          {busy ? <Loader2 className="animate-spin" /> : null}
          Öffnen
        </button>
      </form>
    </div>
  );
}
