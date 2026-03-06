"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

function formatDateTime(value) {
  if (!value) return "-";
  return new Date(value).toLocaleString("de-DE", {
    dateStyle: "short",
    timeStyle: "short",
  });
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

      const res = await fetch("/api/time/status", {
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok) {
        setOk(false);
        setMsg(data.error || "Failed to load status.");
        return;
      }

      setStatus(data.status || "out");
      setLastRecord(data.lastRecord || null);
    } catch {
      setOk(false);
      setMsg("Failed to load status.");
    } finally {
      setLoadingStatus(false);
    }
  }

  async function handleToggle() {
    try {
      setSubmitting(true);
      setMsg("");
      setOk(null);

      const res = await fetch("/api/time/toggle", {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        setOk(false);
        setMsg(data.error || "Failed to stamp.");
        return;
      }

      setOk(true);
      setMsg(data.message || "Success.");
      await loadStatus();
    } catch {
      setOk(false);
      setMsg("Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  useEffect(() => {
    loadStatus();
  }, []);

  const nextActionLabel =
    status === "in" ? "Jetzt ausstempeln" : "Jetzt einstempeln";

  const currentStatusLabel =
    status === "in" ? "Eingestempelt" : "Ausgestempelt";

  const currentStatusClass =
    status === "in"
      ? "border border-emerald-500/25 bg-emerald-500/10 text-emerald-300"
      : "border border-red-500/25 bg-red-500/10 text-red-300";

  return (
    <div className="min-h-screen ac-page px-4 py-6">
      <div className="mx-auto max-w-4xl text-white">
        <div className="rounded-2xl border border-white/10 bg-[#0f1b36] p-4 sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <Link
                  href="/dashboard"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-white transition hover:bg-white/10"
                  aria-label="Zurück zum Dashboard"
                >
                  ←
                </Link>

                <div>
                  <h1 className="text-2xl font-bold tracking-tight">
                    Stempeluhr
                  </h1>
                  <p className="mt-1 text-sm text-white/65">
                    Ein- und Ausstempeln für Ihren Arbeitstag.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm">
              <p className="font-medium text-white">{user.name}</p>
              <p className="mt-0.5 text-white/60">Rolle: {user.role}</p>
            </div>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-white/10 bg-[#0f1b36] p-5 sm:p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-white/55">
                Aktueller Status
              </p>

              <div className="mt-3">
                {loadingStatus ? (
                  <div className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-sm text-white/70 inline-flex">
                    Lädt...
                  </div>
                ) : (
                  <div
                    className={`inline-flex rounded-full px-3 py-1.5 text-sm font-semibold ${currentStatusClass}`}
                  >
                    {currentStatusLabel}
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-white/55">
                Letzte Buchung
              </p>
              <p className="mt-3 text-sm font-medium text-white">
                {formatDateTime(lastRecord?.timestamp)}
              </p>
              <p className="mt-2 text-sm text-white/65">
                Letzte Aktion:{" "}
                <span className="font-medium text-white">
                  {lastRecord?.action === "in"
                    ? "EIN"
                    : lastRecord?.action === "out"
                      ? "AUS"
                      : "-"}
                </span>
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <button
              onClick={handleToggle}
              disabled={loadingStatus || submitting}
              className="h-11 w-full rounded-xl px-4 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60"
              style={{ background: "var(--ac-gradient-primary)" }}
            >
              {submitting ? "Wird gespeichert..." : nextActionLabel}
            </button>

            {msg ? (
              <div
                className={`mt-4 rounded-xl px-4 py-3 text-sm ${
                  ok
                    ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                    : "border border-red-500/20 bg-red-500/10 text-red-300"
                }`}
              >
                {msg}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
