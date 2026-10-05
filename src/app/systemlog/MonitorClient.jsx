"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, RefreshCw } from "lucide-react";

const cx = (...c) => c.filter(Boolean).join(" ");

const TABS = [
  { key: "all", label: "Alle" },
  { key: "guest", label: "Gäste" },
  { key: "user", label: "Mitarbeiter" },
  { key: "admin", label: "Admins" },
];

const ROLE = {
  guest: { label: "Gast", cls: "bg-slate-100 text-slate-600" },
  user: { label: "Mitarbeiter", cls: "bg-emerald-50 text-emerald-700" },
  admin: { label: "Admin", cls: "bg-blue-50 text-blue-700" },
};

const timeFmt = new Intl.DateTimeFormat("de-DE", {
  timeZone: "Europe/Berlin",
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});

export default function MonitorClient() {
  const router = useRouter();
  const [tab, setTab] = useState("all");
  const [data, setData] = useState({ stats: null, visits: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/monitor/visits?role=${tab}`, { cache: "no-store" });
      const json = await res.json().catch(() => ({}));
      if (res.status === 401) {
        router.refresh();
        return;
      }
      if (!res.ok) {
        setError(json.error || "Fehler beim Laden.");
        return;
      }
      setError("");
      setData(json);
    } catch {
      setError("Keine Verbindung.");
    } finally {
      setLoading(false);
    }
  }, [tab, router]);

  useEffect(() => {
    const first = setTimeout(load, 0);
    return () => clearTimeout(first);
  }, [load]);

  async function logout() {
    await fetch("/api/monitor/login", { method: "DELETE" });
    router.refresh();
  }

  const s = data.stats;

  return (
    <div className="min-h-screen bg-canvas px-4 py-5 sm:px-6">
      <div className="mx-auto max-w-[1400px]">
        {/* Header */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <h1 className="text-[15px] font-semibold text-ink">Systemlog</h1>
          {s ? (
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-[12px] text-muted">
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <strong className="text-ink">{s.live}</strong> gerade aktiv
              </span>
              <span>
                <strong className="text-ink">{s.todayVisitors}</strong> Besucher heute
              </span>
              <span>
                <strong className="text-ink">{s.todayViews}</strong> Seitenaufrufe heute
              </span>
              {s.staffToday.length ? <span>Team heute: {s.staffToday.join(", ")}</span> : null}
            </div>
          ) : null}
          <div className="ml-auto flex items-center gap-1.5">
            <button type="button" onClick={load} className="btn btn-secondary btn-sm" aria-label="Aktualisieren">
              <RefreshCw className={cx(loading && "animate-spin")} />
            </button>
            <button type="button" onClick={logout} className="btn btn-secondary btn-sm">
              <LogOut />
              Abmelden
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-3 flex gap-1 border-b border-line">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={cx(
                "-mb-px border-b-2 px-3 py-1.5 text-[12px] font-medium transition",
                tab === t.key ? "border-ink text-ink" : "border-transparent text-muted hover:text-ink",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {error ? <p className="mt-3 text-[12px] text-rose-700">{error}</p> : null}

        {/* Table */}
        <div className="card mt-3 overflow-x-auto">
          <table className="w-full text-left text-[12px]">
            <thead className="border-b border-line bg-canvas/60 text-[11px] uppercase tracking-wider text-muted">
              <tr>
                <th className="px-3 py-2 font-medium">Zeit</th>
                <th className="px-3 py-2 font-medium">Typ</th>
                <th className="px-3 py-2 font-medium">Wer</th>
                <th className="px-3 py-2 font-medium">Seite</th>
                <th className="px-3 py-2 font-medium">Gerät</th>
                <th className="px-3 py-2 font-medium">Herkunft</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {data.visits.map((v) => {
                const role = ROLE[v.role] || ROLE.guest;
                return (
                  <tr key={v._id} className="hover:bg-canvas/50">
                    <td className="whitespace-nowrap px-3 py-1.5 tabular-nums text-muted">
                      {v.at ? timeFmt.format(new Date(v.at)) : ""}
                    </td>
                    <td className="px-3 py-1.5">
                      <span className={cx("rounded px-1.5 py-0.5 text-[10px] font-semibold", role.cls)}>
                        {role.label}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-1.5 text-ink">
                      {v.name || <span className="font-mono text-[11px] text-muted">#{v.visitor}</span>}
                    </td>
                    <td className="max-w-[360px] truncate px-3 py-1.5 font-mono text-[11px] text-ink" title={v.path}>
                      {v.path}
                    </td>
                    <td className="whitespace-nowrap px-3 py-1.5 text-muted">
                      {[v.device, v.browser, v.os].filter(Boolean).join(" · ")}
                    </td>
                    <td className="whitespace-nowrap px-3 py-1.5 text-muted">{v.referrer || "–"}</td>
                  </tr>
                );
              })}
              {!data.visits.length && !loading ? (
                <tr>
                  <td colSpan={6} className="px-3 py-8 text-center text-muted">
                    Noch keine Einträge.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-[11px] text-muted">
          Es werden nur die letzten 100 Aufrufe gespeichert – ältere werden automatisch gelöscht.
        </p>
      </div>
    </div>
  );
}
