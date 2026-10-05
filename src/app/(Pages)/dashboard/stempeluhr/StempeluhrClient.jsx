"use client";

import { useEffect, useState } from "react";
import { Loader2, LogIn, LogOut } from "lucide-react";

function formatDateTime(value) {
  if (!value) return "–";
  return new Date(value).toLocaleString("de-DE", { dateStyle: "short", timeStyle: "short" });
}

function LiveClock() {
  const [now, setNow] = useState(null);
  useEffect(() => {
    const tick = () => setNow(new Date());
    const first = setTimeout(tick, 0);
    const t = setInterval(tick, 1000);
    return () => {
      clearTimeout(first);
      clearInterval(t);
    };
  }, []);
  return (
    <div className="text-center">
      <p className="font-mono text-4xl font-bold tracking-tight text-ink tabular-nums sm:text-5xl">
        {now ? now.toLocaleTimeString("de-DE") : "--:--:--"}
      </p>
      <p className="mt-2 text-muted">
        {now ? now.toLocaleDateString("de-DE", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : " "}
      </p>
    </div>
  );
}

export default function StempeluhrClient({ user }) {
  const [status, setStatus] = useState("out");
  const [lastRecord, setLastRecord] = useState(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState("");
  const [ok, setOk] = useState(null);

  async function loadStatus() {
    try {
      setLoadingStatus(true);
      const res = await fetch("/api/time/status", { cache: "no-store" });
      const data = await res.json();

      if (!res.ok) {
        setOk(false);
        setMsg(data.error || "Status konnte nicht geladen werden.");
        return;
      }

      setStatus(data.status || "out");
      setLastRecord(data.lastRecord || null);
    } catch {
      setOk(false);
      setMsg("Status konnte nicht geladen werden.");
    } finally {
      setLoadingStatus(false);
    }
  }

  async function handleToggle() {
    try {
      setSubmitting(true);
      setMsg("");
      setOk(null);

      const res = await fetch("/api/time/toggle", { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        setOk(false);
        setMsg(data.error || "Stempeln fehlgeschlagen.");
        return;
      }

      setOk(true);
      setMsg(data.message || "Erfolgreich gespeichert.");
      await loadStatus();
    } catch {
      setOk(false);
      setMsg("Etwas ist schiefgelaufen.");
    } finally {
      setSubmitting(false);
    }
  }

  useEffect(() => {
    loadStatus();
  }, []);

  const isIn = status === "in";

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Stempeluhr</h1>
          <p className="mt-1 text-muted">Ein- und Ausstempeln für Ihren Arbeitstag.</p>
        </div>
        <p className="text-sm text-muted">
          Angemeldet als <span className="font-semibold text-ink">{user.name}</span>
        </p>
      </div>

      <div className="card mt-4 p-5 sm:p-8">
        <LiveClock />

        <div className="mt-8 flex justify-center">
          {loadingStatus ? (
            <span className="chip bg-canvas px-4 py-2 text-sm text-muted">
              <Loader2 className="h-4 w-4 animate-spin" /> Status wird geladen …
            </span>
          ) : (
            <span
              className={`chip px-4 py-2 text-sm ${
                isIn ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200" : "bg-slate-100 text-slate-700 ring-1 ring-slate-200"
              }`}
            >
              <span className={`h-2 w-2 rounded-full ${isIn ? "bg-emerald-500" : "bg-slate-400"}`} />
              {isIn ? "Eingestempelt" : "Ausgestempelt"}
            </span>
          )}
        </div>

        <button
          onClick={handleToggle}
          disabled={loadingStatus || submitting}
          className={`btn btn-lg mx-auto mt-6 flex w-full max-w-sm text-white ${
            isIn ? "bg-rose-600 hover:bg-rose-700" : "bg-emerald-600 hover:bg-emerald-700"
          }`}
        >
          {submitting ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : isIn ? (
            <LogOut className="h-5 w-5" />
          ) : (
            <LogIn className="h-5 w-5" />
          )}
          {submitting ? "Wird gespeichert …" : isIn ? "Jetzt ausstempeln" : "Jetzt einstempeln"}
        </button>

        {msg ? (
          <div
            role="status"
            className={`mx-auto mt-5 max-w-sm rounded-xl border px-4 py-3 text-center text-sm ${
              ok ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-rose-200 bg-rose-50 text-rose-800"
            }`}
          >
            {msg}
          </div>
        ) : null}

        <div className="mt-10 grid gap-3 border-t border-line pt-6 sm:grid-cols-2">
          <div className="rounded-xl bg-canvas p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">Letzte Buchung</p>
            <p className="mt-1.5 text-lg font-semibold text-ink">{formatDateTime(lastRecord?.timestamp)}</p>
          </div>
          <div className="rounded-xl bg-canvas p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">Letzte Aktion</p>
            <p className="mt-1.5 text-lg font-semibold text-ink">
              {lastRecord?.action === "in" ? "Einstempeln" : lastRecord?.action === "out" ? "Ausstempeln" : "–"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
