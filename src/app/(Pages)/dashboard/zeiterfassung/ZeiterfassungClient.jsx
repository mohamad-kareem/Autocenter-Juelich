"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const ENTRIES_PER_PAGE = 15;

function getCurrentMonthValue() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function formatDate(value) {
  if (!value) return "-";

  return new Date(value).toLocaleString("de-DE", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function toDatetimeLocalValue(value) {
  if (!value) return "";

  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60000);

  return localDate.toISOString().slice(0, 16);
}

function minutesToGermanHours(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours} Std ${minutes} Min`;
}

function getSourceLabel(record) {
  if (record?.updatedBy) {
    return `Bearbeitet von ${record.updatedBy}`;
  }

  if (record?.createdBy && record.createdBy !== "self") {
    return `Hinzugefügt von ${record.createdBy}`;
  }

  if (record?.source === "manual") {
    return "Hinzugefügt manuell";
  }

  return "Normal";
}

export default function ZeiterfassungClient() {
  const [month, setMonth] = useState(getCurrentMonthValue());
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showSummary, setShowSummary] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const [editingRecord, setEditingRecord] = useState(null);
  const [editAction, setEditAction] = useState("in");
  const [editTimestamp, setEditTimestamp] = useState("");

  const [addUserId, setAddUserId] = useState("");
  const [addAction, setAddAction] = useState("in");
  const [addTimestamp, setAddTimestamp] = useState("");

  const [currentPage, setCurrentPage] = useState(1);

  async function loadData(selectedMonth = month) {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      params.set("month", selectedMonth);

      const res = await fetch(`/api/time/records?${params.toString()}`, {
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Daten konnten nicht geladen werden.");
        return;
      }

      setRecords(data.records || []);
      setSummary(data.summary || []);
      setUsers(data.users || []);
      setCurrentPage(1);
    } catch {
      alert("Daten konnten nicht geladen werden.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData(month);
  }, [month]);

  function openEdit(record) {
    setEditingRecord(record);
    setEditAction(record.action);
    setEditTimestamp(toDatetimeLocalValue(record.timestamp));
  }

  function closeEdit() {
    setEditingRecord(null);
    setEditAction("in");
    setEditTimestamp("");
  }

  function openAddModal() {
    setShowAddModal(true);
    setAddUserId("");
    setAddAction("in");
    setAddTimestamp(toDatetimeLocalValue(new Date()));
  }

  function closeAddModal() {
    setShowAddModal(false);
    setAddUserId("");
    setAddAction("in");
    setAddTimestamp("");
  }

  async function handleAddRecord(e) {
    e.preventDefault();

    if (!addUserId) {
      alert("Bitte wählen Sie einen Mitarbeiter aus.");
      return;
    }

    if (!addTimestamp) {
      alert("Bitte wählen Sie Datum und Uhrzeit.");
      return;
    }

    try {
      const res = await fetch("/api/time/records", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: addUserId,
          action: addAction,
          timestamp: addTimestamp,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Eintrag konnte nicht erstellt werden.");
        return;
      }

      closeAddModal();
      await loadData();
    } catch {
      alert("Eintrag konnte nicht erstellt werden.");
    }
  }

  async function handleSaveEdit(e) {
    e.preventDefault();

    if (!editingRecord) return;

    if (!editTimestamp) {
      alert("Bitte wählen Sie Datum und Uhrzeit.");
      return;
    }

    try {
      const res = await fetch(`/api/time/records/${editingRecord._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: editAction,
          timestamp: editTimestamp,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Eintrag konnte nicht gespeichert werden.");
        return;
      }

      closeEdit();
      await loadData();
    } catch {
      alert("Eintrag konnte nicht gespeichert werden.");
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Möchten Sie diesen Eintrag wirklich löschen?")) {
      return;
    }

    try {
      const res = await fetch(`/api/time/records/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Eintrag konnte nicht gelöscht werden.");
        return;
      }

      await loadData();
    } catch {
      alert("Eintrag konnte nicht gelöscht werden.");
    }
  }

  const sortedSummary = useMemo(() => {
    return [...summary].sort((a, b) =>
      a.userName.localeCompare(b.userName, "de"),
    );
  }, [summary]);

  const totalPages = Math.max(1, Math.ceil(records.length / ENTRIES_PER_PAGE));

  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * ENTRIES_PER_PAGE;
    const end = start + ENTRIES_PER_PAGE;
    return records.slice(start, end);
  }, [records, currentPage]);

  const pageStart =
    records.length === 0 ? 0 : (currentPage - 1) * ENTRIES_PER_PAGE + 1;
  const pageEnd = Math.min(currentPage * ENTRIES_PER_PAGE, records.length);

  function goToPrevPage() {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  }

  function goToNextPage() {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  }

  return (
    <div className="min-h-screen ac-page px-4 py-6">
      <div className="mx-auto max-w-7xl text-white">
        <div className="rounded-2xl border border-white/10 bg-[#0f1b36] p-4 sm:p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
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
                    Zeiterfassung
                  </h1>
                  <p className="mt-1 text-sm text-white/65">
                    Übersicht und Verwaltung der Stempelzeiten.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex w-full flex-col gap-3 lg:w-auto lg:flex-row lg:flex-wrap lg:items-end lg:justify-end">
              <div className="min-w-[170px]">
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-white/60">
                  Monat
                </label>
                <input
                  type="month"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className="h-10 w-full rounded-xl border border-white/10 bg-[#0f1b36] px-3 text-sm text-white outline-none transition focus:border-white/20 focus:bg-white/[0.03]"
                />
              </div>

              <button
                type="button"
                onClick={() => setShowSummary((prev) => !prev)}
                className="h-10 rounded-xl border border-white/10 bg-[#0f1b36] px-4 text-sm font-medium text-white transition hover:bg-white/10"
              >
                {showSummary ? "Übersicht ausblenden" : "Übersicht"}
              </button>

              <button
                type="button"
                onClick={openAddModal}
                className="h-10 rounded-xl px-4 text-sm font-medium text-white shadow-sm"
                style={{ background: "var(--ac-gradient-primary)" }}
              >
                + Stempel hinzufügen
              </button>
            </div>
          </div>
        </div>

        {showSummary && (
          <div className="mt-5 rounded-2xl border border-white/10 bg-[#0f1b36] p-4 sm:p-5">
            <div className="mb-3">
              <h2 className="text-base font-semibold sm:text-lg">
                Monatssumme pro Mitarbeiter
              </h2>
            </div>

            {loading && sortedSummary.length === 0 ? (
              <div className="text-sm text-white/70">Lade Übersicht...</div>
            ) : sortedSummary.length === 0 ? (
              <div className="text-sm text-white/70">
                Keine Übersicht für diesen Monat.
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {sortedSummary.map((item) => (
                  <div
                    key={item.userId}
                    className="rounded-xl border border-white/10 bg-white/[0.03] p-3.5"
                  >
                    <p className="truncate text-sm font-semibold text-white">
                      {item.userName}
                    </p>
                    <p className="mt-1 text-sm text-white/75">
                      {minutesToGermanHours(item.totalMinutes)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-[#0f1b36]">
          <div className="border-b border-white/10 px-4 py-3 sm:px-5">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-base font-semibold sm:text-lg">Einträge</h2>
                <p className="mt-1 text-xs text-white/55">
                  {records.length > 0
                    ? `${pageStart}-${pageEnd} von ${records.length} Einträgen`
                    : "Keine Einträge vorhanden"}
                </p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-sm text-white">
              <thead className="bg-white/[0.02] text-xs uppercase tracking-wide text-white/55">
                <tr>
                  <th className="px-5 py-3 text-left font-medium">
                    Mitarbeiter
                  </th>
                  <th className="px-5 py-3 text-left font-medium">
                    Datum & Uhrzeit
                  </th>
                  <th className="px-5 py-3 text-left font-medium">Stempel</th>
                  <th className="px-5 py-3 text-left font-medium">Quelle</th>
                  <th className="px-18 py-3 text-left font-medium">Aktionen</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-5 text-white/70">
                      Lädt...
                    </td>
                  </tr>
                ) : paginatedRecords.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-5 text-white/70">
                      Keine Einträge gefunden.
                    </td>
                  </tr>
                ) : (
                  paginatedRecords.map((record) => (
                    <tr
                      key={record._id}
                      className="border-t border-white/10 align-middle transition hover:bg-white/[0.025]"
                    >
                      <td className="px-5 py-4 font-medium text-white">
                        {record.userName}
                      </td>

                      <td className="px-5 py-4 text-white/80">
                        {formatDate(record.timestamp)}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide ${
                            record.action === "in"
                              ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                              : "border border-red-500/30 bg-red-500/10 text-red-300"
                          }`}
                        >
                          {record.action === "in" ? "EIN" : "AUS"}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-white/70">
                        <span className="block max-w-[270px] truncate">
                          {getSourceLabel(record)}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => openEdit(record)}
                            className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-white transition hover:bg-white/10"
                          >
                            Bearbeiten
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(record._id)}
                            className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-300 transition hover:bg-red-500/20"
                          >
                            Löschen
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-3 border-t border-white/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <p className="text-xs text-white/55">
              {records.length > 0
                ? `${pageStart}-${pageEnd} von ${records.length} Einträgen`
                : "0 Einträge"}
            </p>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                type="button"
                onClick={goToPrevPage}
                disabled={currentPage === 1}
                className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Zurück
              </button>

              <div className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-white/80">
                Seite {currentPage} / {totalPages}
              </div>

              <button
                type="button"
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Weiter
              </button>
            </div>
          </div>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0f1b36] p-5 text-white shadow-2xl">
            <h3 className="text-lg font-bold sm:text-xl">Stempel hinzufügen</h3>

            <form onSubmit={handleAddRecord} className="mt-4 space-y-3.5">
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-white/60">
                  Mitarbeiter
                </label>
                <select
                  value={addUserId}
                  onChange={(e) => setAddUserId(e.target.value)}
                  className="h-10 w-full rounded-xl border border-white/10 bg-[#0f1b36] px-3 text-sm text-white outline-none transition focus:border-white/20"
                  required
                >
                  <option value="" className="bg-[#0f1b36] text-white">
                    Bitte auswählen
                  </option>
                  {users.map((user) => (
                    <option
                      key={user._id}
                      value={user._id}
                      className="bg-[#0f1b36] text-white"
                    >
                      {user.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-white/60">
                  Aktion
                </label>
                <select
                  value={addAction}
                  onChange={(e) => setAddAction(e.target.value)}
                  className="h-10 w-full rounded-xl border border-white/10 bg-[#0f1b36] px-3 text-sm text-white outline-none transition focus:border-white/20"
                >
                  <option value="in" className="bg-[#0f1b36] text-white">
                    EIN
                  </option>
                  <option value="out" className="bg-[#0f1b36] text-white">
                    AUS
                  </option>
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-white/60">
                  Datum & Uhrzeit
                </label>
                <input
                  type="datetime-local"
                  value={addTimestamp}
                  onChange={(e) => setAddTimestamp(e.target.value)}
                  className="h-10 w-full rounded-xl border border-white/10 bg-[#0f1b36] px-3 text-sm text-white outline-none transition focus:border-white/20"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="h-10 flex-1 rounded-xl px-3 text-sm font-medium text-white"
                  style={{ background: "var(--ac-gradient-primary)" }}
                >
                  Speichern
                </button>

                <button
                  type="button"
                  onClick={closeAddModal}
                  className="h-10 flex-1 rounded-xl border border-white/10 bg-[#0f1b36] px-3 text-sm font-medium text-white transition hover:bg-white/10"
                >
                  Abbrechen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0f1b36] p-5 text-white shadow-2xl">
            <h3 className="text-lg font-bold sm:text-xl">Eintrag bearbeiten</h3>

            <form onSubmit={handleSaveEdit} className="mt-4 space-y-3.5">
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-white/60">
                  Aktion
                </label>
                <select
                  value={editAction}
                  onChange={(e) => setEditAction(e.target.value)}
                  className="h-10 w-full rounded-xl border border-white/10 bg-[#0f1b36] px-3 text-sm text-white outline-none transition focus:border-white/20"
                >
                  <option value="in" className="bg-[#0f1b36] text-white">
                    EIN
                  </option>
                  <option value="out" className="bg-[#0f1b36] text-white">
                    AUS
                  </option>
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-white/60">
                  Datum & Uhrzeit
                </label>
                <input
                  type="datetime-local"
                  value={editTimestamp}
                  onChange={(e) => setEditTimestamp(e.target.value)}
                  className="h-10 w-full rounded-xl border border-white/10 bg-[#0f1b36] px-3 text-sm text-white outline-none transition focus:border-white/20"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="h-10 flex-1 rounded-xl px-3 text-sm font-medium text-white"
                  style={{ background: "var(--ac-gradient-primary)" }}
                >
                  Speichern
                </button>

                <button
                  type="button"
                  onClick={closeEdit}
                  className="h-10 flex-1 rounded-xl border border-white/10 bg-[#0f1b36] px-3 text-sm font-medium text-white transition hover:bg-white/10"
                >
                  Abbrechen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
