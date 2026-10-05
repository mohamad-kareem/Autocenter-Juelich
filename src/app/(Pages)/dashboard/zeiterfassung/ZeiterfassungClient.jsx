"use client";

import { useEffect, useMemo, useState } from "react";
import { BarChart3, ChevronLeft, ChevronRight, Pencil, Plus, Trash2 } from "lucide-react";

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

  const selectCls = "field";

  function Modal({ title, onClose, onSubmit, children }) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/60 p-4" onClick={onClose}>
        <div className="card animate-pop-in w-full max-w-sm p-5 shadow-float" onClick={(e) => e.stopPropagation()}>
          <h3 className="text-base font-semibold text-ink">{title}</h3>
          <form onSubmit={onSubmit} className="mt-4 space-y-3">
            {children}
            <div className="flex justify-end gap-2 border-t border-line pt-3">
              <button type="button" onClick={onClose} className="btn btn-secondary btn-sm">
                Abbrechen
              </button>
              <button type="submit" className="btn btn-primary btn-sm">
                Speichern
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  const actionFields = (value, setValue) => (
    <div>
      <span className="label">Aktion</span>
      <div className="grid grid-cols-2 gap-2">
        {[
          ["in", "EIN"],
          ["out", "AUS"],
        ].map(([v, label]) => (
          <button
            key={v}
            type="button"
            onClick={() => setValue(v)}
            className={`rounded-md border px-3 py-1.5 text-[12px] font-semibold transition ${
              value === v
                ? v === "in"
                  ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                  : "border-rose-500 bg-rose-50 text-rose-700"
                : "border-line-strong text-body hover:border-brand-500"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-[1600px]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Zeiterfassung</h1>
          <p className="mt-1 text-muted">Übersicht und Verwaltung der Stempelzeiten.</p>
        </div>

        <div className="flex flex-wrap items-end gap-2">
          <div>
            <label htmlFor="month" className="label">
              Monat
            </label>
            <input
              id="month"
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="field h-7 w-40 py-0 text-[12px]"
            />
          </div>
          <button
            type="button"
            onClick={() => setShowSummary((prev) => !prev)}
            className={`btn btn-sm ${showSummary ? "bg-ink text-white hover:bg-navy-800" : "btn-secondary"}`}
          >
            <BarChart3 className="h-3.5 w-3.5" />
            Monatsübersicht
          </button>
          <button type="button" onClick={openAddModal} className="btn btn-primary btn-sm">
            <Plus className="h-3.5 w-3.5" />
            Stempel hinzufügen
          </button>
        </div>
      </div>

      {showSummary && (
        <div className="card mt-6 p-5 sm:p-6">
          <h2 className="text-lg font-semibold">Monatssumme pro Mitarbeiter</h2>
          {loading && sortedSummary.length === 0 ? (
            <p className="mt-3 text-sm text-muted">Lade Übersicht …</p>
          ) : sortedSummary.length === 0 ? (
            <p className="mt-3 text-sm text-muted">Keine Übersicht für diesen Monat.</p>
          ) : (
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {sortedSummary.map((item) => (
                <div key={item.userId} className="rounded-xl bg-canvas p-4">
                  <p className="truncate text-sm font-semibold text-ink">{item.userName}</p>
                  <p className="mt-1 text-2xl font-bold text-navy-900">{minutesToGermanHours(item.totalMinutes)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="card mt-6 overflow-hidden">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold">Einträge</h2>
            <p className="text-xs text-muted">
              {records.length > 0 ? `${pageStart}–${pageEnd} von ${records.length} Einträgen` : "Keine Einträge vorhanden"}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-sm">
            <thead className="bg-canvas text-left text-xs font-semibold uppercase tracking-wider text-muted">
              <tr>
                <th className="px-5 py-3">Mitarbeiter</th>
                <th className="px-5 py-3">Datum &amp; Uhrzeit</th>
                <th className="px-5 py-3">Stempel</th>
                <th className="px-5 py-3">Quelle</th>
                <th className="px-5 py-3 text-right">Aktionen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-muted">
                    Lädt …
                  </td>
                </tr>
              ) : paginatedRecords.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-muted">
                    Keine Einträge gefunden.
                  </td>
                </tr>
              ) : (
                paginatedRecords.map((record) => (
                  <tr key={record._id} className="transition hover:bg-canvas/60">
                    <td className="px-5 py-3.5 font-medium text-ink">{record.userName}</td>
                    <td className="px-5 py-3.5 tabular-nums text-body">{formatDate(record.timestamp)}</td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`chip ${
                          record.action === "in" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                        }`}
                      >
                        {record.action === "in" ? "EIN" : "AUS"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-muted">
                      <span className="block max-w-[260px] truncate">{getSourceLabel(record)}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(record)}
                          className="inline-flex items-center gap-1 rounded-md border border-line-strong px-2 py-1 text-[11px] font-medium text-body transition hover:border-brand-500 hover:text-brand-700"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Bearbeiten
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(record._id)}
                          className="inline-flex items-center gap-1 rounded-md border border-rose-200 px-2 py-1 text-[11px] font-medium text-rose-700 transition hover:bg-rose-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
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

        <div className="flex flex-col gap-3 border-t border-line px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted">
            {records.length > 0 ? `${pageStart}–${pageEnd} von ${records.length} Einträgen` : "0 Einträge"}
          </p>
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={goToPrevPage}
              disabled={currentPage === 1}
              aria-label="Vorherige Seite"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-line-strong text-body transition hover:border-brand-500 disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-xs font-medium text-body">
              Seite {currentPage} / {totalPages}
            </span>
            <button
              type="button"
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              aria-label="Nächste Seite"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-line-strong text-body transition hover:border-brand-500 disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {showAddModal &&
        Modal({
          title: "Stempel hinzufügen",
          onClose: closeAddModal,
          onSubmit: handleAddRecord,
          children: (
            <>
              <div>
                <label htmlFor="add-user" className="label">
                  Mitarbeiter
                </label>
                <select id="add-user" value={addUserId} onChange={(e) => setAddUserId(e.target.value)} className={selectCls} required>
                  <option value="">Bitte auswählen</option>
                  {users.map((user) => (
                    <option key={user._id} value={user._id}>
                      {user.name}
                    </option>
                  ))}
                </select>
              </div>
              {actionFields(addAction, setAddAction)}
              <div>
                <label htmlFor="add-ts" className="label">
                  Datum &amp; Uhrzeit
                </label>
                <input
                  id="add-ts"
                  type="datetime-local"
                  value={addTimestamp}
                  onChange={(e) => setAddTimestamp(e.target.value)}
                  className={selectCls}
                  required
                />
              </div>
            </>
          ),
        })}

      {editingRecord &&
        Modal({
          title: "Eintrag bearbeiten",
          onClose: closeEdit,
          onSubmit: handleSaveEdit,
          children: (
            <>
              <p className="text-sm text-muted">
                Mitarbeiter: <span className="font-semibold text-ink">{editingRecord.userName}</span>
              </p>
              {actionFields(editAction, setEditAction)}
              <div>
                <label htmlFor="edit-ts" className="label">
                  Datum &amp; Uhrzeit
                </label>
                <input
                  id="edit-ts"
                  type="datetime-local"
                  value={editTimestamp}
                  onChange={(e) => setEditTimestamp(e.target.value)}
                  className={selectCls}
                  required
                />
              </div>
            </>
          ),
        })}
    </div>
  );
}
