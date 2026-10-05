"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";

const cx = (...c) => c.filter(Boolean).join(" ");

const DAY_LONG = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"];
const dateFmt = new Intl.DateTimeFormat("de-DE", { day: "2-digit", month: "2-digit" });

/** Task types – the colour shows on the card edge. */
const CATEGORIES = {
  allgemein: { label: "Allgemein", swatch: "bg-slate-400", ring: "ring-slate-400", text: "text-slate-600", edge: "border-l-slate-400" },
  fahrzeug: { label: "Fahrzeug", swatch: "bg-blue-500", ring: "ring-blue-500", text: "text-blue-700", edge: "border-l-blue-500" },
  kunde: { label: "Kunde", swatch: "bg-emerald-500", ring: "ring-emerald-500", text: "text-emerald-700", edge: "border-l-emerald-500" },
  werkstatt: { label: "Werkstatt", swatch: "bg-amber-500", ring: "ring-amber-500", text: "text-amber-700", edge: "border-l-amber-500" },
  termin: { label: "Termin", swatch: "bg-red-500", ring: "ring-red-500", text: "text-red-700", edge: "border-l-red-500" },
};
const CATEGORY_KEYS = Object.keys(CATEGORIES);
const catOf = (key) => CATEGORIES[key] || CATEGORIES.allgemein;

/** Colour picker: five swatches, the chosen one is ringed and named. */
function CategoryPicker({ value, onChange }) {
  const current = catOf(value);
  return (
    <div>
      <p className="text-[10px] font-medium uppercase tracking-wider text-muted">
        Typ: <span className={cx("font-semibold normal-case tracking-normal", current.text)}>{current.label}</span>
      </p>
      <div className="mt-1.5 flex items-center gap-2 pl-0.5">
        {CATEGORY_KEYS.map((key) => {
          const c = CATEGORIES[key];
          const active = (value || "allgemein") === key;
          return (
            <button
              key={key}
              type="button"
              title={c.label}
              aria-label={c.label}
              aria-pressed={active}
              // keep the text field focused so it does not save on blur
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => onChange(key)}
              className={cx(
                "flex h-[18px] w-[18px] items-center justify-center rounded-full transition",
                c.swatch,
                active ? cx("ring-2 ring-offset-2", c.ring) : "opacity-70 hover:scale-110 hover:opacity-100",
              )}
            >
              {active ? <Check className="h-2.5 w-2.5 text-white" strokeWidth={3.5} /> : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

const toKey = (d) => {
  const copy = new Date(d);
  copy.setHours(12, 0, 0, 0);
  return copy.toISOString().slice(0, 10);
};

function mondayOf(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return d;
}

function weekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
}

async function api(url, options) {
  const res = await fetch(url, {
    ...options,
    headers: options?.body ? { "Content-Type": "application/json" } : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Aktion fehlgeschlagen.");
  return data;
}

/**
 * Weekly task planner shared by the team.
 * Drag tasks between days, double-click to rename, colour = task type.
 */
export default function WeekTasks({ tall = false }) {
  const [weekStart, setWeekStart] = useState(() => mondayOf(new Date()));
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState("");
  const [composer, setComposer] = useState(null); // { day, title, category }
  const [editing, setEditing] = useState(null); // { id, title }
  const [dragId, setDragId] = useState(null);
  const [dropDay, setDropDay] = useState(null);

  const days = useMemo(() => {
    const todayKey = toKey(new Date());
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      const key = toKey(d);
      return {
        key,
        date: d,
        label: DAY_LONG[i],
        short: DAY_LONG[i].slice(0, 2),
        isToday: key === todayKey,
        isPast: key < todayKey,
        isSunday: i === 6,
      };
    });
  }, [weekStart]);

  const load = useCallback(async () => {
    try {
      const data = await api(`/api/tasks?from=${days[0].key}&to=${days[6].key}`);
      setTasks(data.tasks || []);
      setError("");
    } catch (err) {
      setError(err.message);
    }
  }, [days]);

  useEffect(() => {
    const t = setTimeout(load, 0);
    return () => clearTimeout(t);
  }, [load]);

  /* ---------- actions ---------- */

  async function createTask() {
    const draft = composer;
    setComposer(null);
    const title = draft?.title.trim();
    if (!title) return;
    try {
      const data = await api("/api/tasks", {
        method: "POST",
        body: JSON.stringify({ title, day: draft.day, category: draft.category || "allgemein" }),
      });
      setTasks((list) => [...list, data.task]);
    } catch (err) {
      setError(err.message);
    }
  }

  async function update(task, changes) {
    setTasks((list) => list.map((t) => (t._id === task._id ? { ...t, ...changes } : t)));
    try {
      await api(`/api/tasks/${task._id}`, { method: "PATCH", body: JSON.stringify(changes) });
    } catch (err) {
      setError(err.message);
      load();
    }
  }

  async function remove(task) {
    setTasks((list) => list.filter((t) => t._id !== task._id));
    try {
      await api(`/api/tasks/${task._id}`, { method: "DELETE" });
    } catch (err) {
      setError(err.message);
      load();
    }
  }

  function saveEdit() {
    const current = editing;
    setEditing(null);
    const task = tasks.find((t) => t._id === current?.id);
    if (!task) return;
    const changes = {};
    const title = current.title.trim();
    if (title && title !== task.title) changes.title = title;
    if (current.category && current.category !== (task.category || "allgemein")) changes.category = current.category;
    if (Object.keys(changes).length) update(task, changes);
  }

  function onDrop(dayKey) {
    const task = tasks.find((t) => t._id === dragId);
    setDragId(null);
    setDropDay(null);
    if (task && task.day !== dayKey) update(task, { day: dayKey });
  }

  const shift = (weeks) => {
    const next = new Date(weekStart);
    next.setDate(next.getDate() + weeks * 7);
    setWeekStart(next);
  };

  /* ---------- derived ---------- */

  const visible = tasks;
  const isCurrentWeek = toKey(weekStart) === toKey(mondayOf(new Date()));

  return (
    <section className="card overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-line px-3 py-2">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => shift(-1)}
            aria-label="Vorherige Woche"
            className="flex h-7 w-7 items-center justify-center rounded-md text-body transition hover:bg-canvas hover:text-ink"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => shift(1)}
            aria-label="Nächste Woche"
            className="flex h-7 w-7 items-center justify-center rounded-md text-body transition hover:bg-canvas hover:text-ink"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <p className="ml-1 text-[13px] text-ink">
            <span className="font-semibold">KW {weekNumber(weekStart)}</span>
            <span className="text-muted">
              {" "}
              · {dateFmt.format(days[0].date)} – {dateFmt.format(days[6].date)}
            </span>
          </p>
          {!isCurrentWeek ? (
            <button
              type="button"
              onClick={() => setWeekStart(mondayOf(new Date()))}
              className="ml-2 rounded-md border border-line px-2 py-0.5 text-[12px] font-medium text-body transition hover:border-line-strong hover:text-ink"
            >
              Heute
            </button>
          ) : null}
        </div>

      </div>

      {error ? <p className="border-b border-rose-100 bg-rose-50 px-4 py-2 text-[12px] text-rose-800">{error}</p> : null}

      {/* Day header row */}
      <div className="hidden border-b border-line bg-canvas/60 md:grid md:grid-cols-7">
        {days.map((day, i) => (
          <div
            key={day.key}
            className={cx(
              "flex items-center justify-between px-3 py-1.5 text-[12px]",
              i > 0 && "border-l border-line",
            )}
          >
            <span className={cx("font-medium", day.isToday ? "text-brand-700" : "text-body")}>
              {day.short}, {dateFmt.format(day.date)}
            </span>
            {day.isToday ? <span className="h-1.5 w-1.5 rounded-full bg-brand-600" title="Heute" /> : null}
          </div>
        ))}
      </div>

      {/* Week grid */}
      <div className="grid md:grid-cols-7">
        {days.map((day, i) => {
          const dayTasks = visible.filter((t) => t.day === day.key);
          const isDrop = dropDay === day.key;
          const composing = composer?.day === day.key;

          return (
            <div
              key={day.key}
              onDragOver={(e) => {
                if (!dragId) return;
                e.preventDefault();
                setDropDay(day.key);
              }}
              onDragLeave={() => setDropDay((d) => (d === day.key ? null : d))}
              onDrop={(e) => {
                e.preventDefault();
                onDrop(day.key);
              }}
              className={cx(
                "group/day flex flex-col transition-colors",
                tall ? "min-h-[560px]" : "min-h-[400px]",
                i > 0 && "border-t border-line md:border-l md:border-t-0",
                day.isToday && "bg-brand-50/30",
                isDrop && "bg-brand-50 ring-1 ring-inset ring-brand-300",
              )}
            >
              {/* Mobile day label */}
              <p className={cx("px-3 pt-2 text-[12px] font-medium md:hidden", day.isToday ? "text-brand-700" : "text-body")}>
                {day.label}, {dateFmt.format(day.date)}
              </p>

              <ul className="flex-1 space-y-1 p-1.5">
                {dayTasks.map((task) => {
                  const done = task.status === "done";
                  const isEditing = editing?.id === task._id;
                  const cat = catOf(isEditing ? editing.category : task.category);
                  return (
                    <li
                      key={task._id}
                      draggable={!isEditing}
                      onDragStart={(e) => {
                        setDragId(task._id);
                        e.dataTransfer.effectAllowed = "move";
                      }}
                      onDragEnd={() => {
                        setDragId(null);
                        setDropDay(null);
                      }}
                      className={cx(
                        "group flex items-start gap-2 rounded-md border border-line border-l-[3px] px-2 py-1.5 transition hover:border-line-strong",
                        done ? "border-l-line-strong bg-white" : cat.edge,
                        !done && (task.category === "termin" && !isEditing ? "bg-red-50/70" : "bg-white"),
                        dragId === task._id && "opacity-40",
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => update(task, { status: done ? "open" : "done" })}
                        aria-label={done ? "Als offen markieren" : "Als erledigt markieren"}
                        className={cx(
                          "mt-[2px] flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-[3px] border transition",
                          done ? "border-ink bg-ink text-white" : "border-line-strong hover:border-ink",
                        )}
                      >
                        {done ? <Check className="h-2.5 w-2.5" strokeWidth={3} /> : null}
                      </button>

                      {isEditing ? (
                        <div className="min-w-0 flex-1">
                          <textarea
                            autoFocus
                            rows={2}
                            value={editing.title}
                            onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                            onBlur={saveEdit}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                saveEdit();
                              }
                              if (e.key === "Escape") setEditing(null);
                            }}
                            className="w-full resize-none bg-transparent text-[13px] leading-snug text-ink outline-none"
                          />
                          <div className="mt-1 border-t border-line pt-1.5">
                            <CategoryPicker
                              value={editing.category}
                              onChange={(category) => setEditing({ ...editing, category })}
                            />
                          </div>
                        </div>
                      ) : (
                        <p
                          onDoubleClick={() => setEditing({ id: task._id, title: task.title, category: task.category || "allgemein" })}
                          className={cx(
                            "min-w-0 flex-1 cursor-default break-words text-[13px] leading-snug",
                            done ? "text-muted line-through" : "text-ink",
                          )}
                        >
                          {task.title}
                        </p>
                      )}

                      <button
                        type="button"
                        onClick={() => remove(task)}
                        aria-label="Aufgabe löschen"
                        className="mt-[1px] shrink-0 text-muted opacity-0 transition hover:text-rose-600 group-hover:opacity-100"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </li>
                  );
                })}

                {composing ? (
                  <li className={cx("rounded-md border border-line border-l-[3px] bg-white px-2 py-1.5 shadow-card-hover", catOf(composer.category).edge)}>
                    <textarea
                      autoFocus
                      rows={2}
                      value={composer.title}
                      onChange={(e) => setComposer({ ...composer, title: e.target.value })}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          createTask();
                        }
                        if (e.key === "Escape") setComposer(null);
                      }}
                      placeholder="Neue Aufgabe"
                      className="w-full resize-none bg-transparent text-[13px] leading-snug text-ink outline-none placeholder:text-muted"
                    />
                    <div className="mt-1 border-t border-line pt-1.5">
                      <CategoryPicker
                        value={composer.category}
                        onChange={(category) => setComposer({ ...composer, category })}
                      />
                    </div>
                    <div className="mt-2 flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setComposer(null)}
                        className="ml-auto text-[11px] text-muted hover:text-ink"
                      >
                        Abbrechen
                      </button>
                      <button
                        type="button"
                        onClick={createTask}
                        className="rounded bg-ink px-2 py-0.5 text-[11px] font-medium text-white hover:bg-brand-700"
                      >
                        Hinzufügen
                      </button>
                    </div>
                  </li>
                ) : null}
              </ul>

              {!composing ? (
                <button
                  type="button"
                  onClick={() => setComposer({ day: day.key, title: "", category: "allgemein" })}
                  className="mx-1.5 mb-1.5 flex items-center gap-1 rounded-md px-2 py-1 text-[12px] text-muted opacity-0 transition hover:bg-canvas hover:text-ink focus:opacity-100 group-hover/day:opacity-100"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Hinzufügen
                </button>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
