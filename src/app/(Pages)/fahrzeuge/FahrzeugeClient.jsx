"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronRight, LayoutGrid, List, Search, SlidersHorizontal, X } from "lucide-react";
import CarCard from "@/app/(components)/CarCard";
import { PRICE_STEPS, formatNumber, fuelLabel, gearboxLabel, prettyBrand } from "@/lib/cars";
import { SITE } from "@/lib/site";

const cx = (...c) => c.filter(Boolean).join(" ");
const PAGE_SIZE = 24;
const CATEGORY_LABELS = {
  Cabrio: "Cabrio / Roadster",
  EstateCar: "Kombi",
  Limousine: "Limousine",
  OffRoad: "SUV / Geländewagen",
  SmallCar: "Kleinwagen",
  SportsCar: "Sportwagen / Coupé",
  Van: "Van / Kleinbus",
};
const KM_STEPS = [10000, 25000, 50000, 75000, 100000, 150000];

const EMPTY = {
  q: "",
  sort: "newest",
  brands: [],
  fuels: [],
  gearbox: "",
  minPrice: "",
  maxPrice: "",
  yearFrom: "",
  yearTo: "",
  maxKm: "",
  cat: "",
};

function parseMulti(sp, key) {
  const raw = sp.get(key);
  return raw ? raw.split(",").map((x) => x.trim()).filter(Boolean) : [];
}

function stateFromParams(sp) {
  return {
    q: sp.get("q") || "",
    sort: sp.get("sort") || "newest",
    brands: parseMulti(sp, "brand"),
    fuels: parseMulti(sp, "fuel"),
    gearbox: sp.get("gearbox") || "",
    minPrice: sp.get("min") || "",
    maxPrice: sp.get("max") || "",
    yearFrom: sp.get("yf") || "",
    yearTo: sp.get("yt") || "",
    maxKm: sp.get("km") || "",
    cat: sp.get("cat") || "",
  };
}

function buildQuery(s) {
  const p = new URLSearchParams();
  if (s.q) p.set("q", s.q);
  if (s.sort && s.sort !== "newest") p.set("sort", s.sort);
  if (s.brands.length) p.set("brand", s.brands.join(","));
  if (s.fuels.length) p.set("fuel", s.fuels.join(","));
  if (s.gearbox) p.set("gearbox", s.gearbox);
  if (s.minPrice) p.set("min", s.minPrice);
  if (s.maxPrice) p.set("max", s.maxPrice);
  if (s.yearFrom) p.set("yf", s.yearFrom);
  if (s.yearTo) p.set("yt", s.yearTo);
  if (s.maxKm) p.set("km", s.maxKm);
  if (s.cat) p.set("cat", s.cat);
  const str = p.toString();
  return str ? `?${str}` : "";
}

function FilterGroup({ title, children }) {
  return (
    <div className="border-b border-line py-3 first:pt-0 last:border-b-0 last:pb-0">
      <h3 className="mb-2 text-[13px] font-semibold text-ink">{title}</h3>
      {children}
    </div>
  );
}

function CheckRow({ checked, onChange, label, count }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 rounded px-1 py-[3px] text-[13px] text-body hover:bg-canvas">
      <input type="checkbox" checked={checked} onChange={onChange} className="h-3.5 w-3.5 rounded" />
      <span className="flex-1">{label}</span>
      {count != null ? <span className="text-xs text-muted">{count}</span> : null}
    </label>
  );
}

export default function FahrzeugeClient({ initialCars = [] }) {
  const router = useRouter();
  const sp = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [state, setState] = useState(() => stateFromParams(sp));
  const [view, setView] = useState("grid");
  const [limit, setLimit] = useState(PAGE_SIZE);
  const [drawer, setDrawer] = useState(false);

  // Sync on back/forward (ignore URL changes we pushed ourselves)
  const spKey = sp.toString();
  const pushedRef = useRef(spKey);
  useEffect(() => {
    if (spKey === pushedRef.current) return;
    pushedRef.current = spKey;
    setState(stateFromParams(new URLSearchParams(spKey)));
  }, [spKey]);

  // Push to URL (debounced)
  useEffect(() => {
    const t = setTimeout(() => {
      const qs = buildQuery(state);
      if (qs.slice(1) !== pushedRef.current) {
        pushedRef.current = qs.slice(1);
        startTransition(() => router.replace(`/fahrzeuge${qs}`, { scroll: false }));
      }
    }, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  useEffect(() => setLimit(PAGE_SIZE), [state]);

  useEffect(() => {
    document.documentElement.style.overflow = drawer ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [drawer]);

  const options = useMemo(() => {
    const count = (key) => {
      const m = new Map();
      for (const c of initialCars) if (c[key]) m.set(c[key], (m.get(c[key]) || 0) + 1);
      return m;
    };
    const years = initialCars.map((c) => c.year).filter(Boolean);
    return {
      brands: [...count("brand")].sort((a, b) => a[0].localeCompare(b[0], "de")),
      fuels: [...count("fuel")].sort((a, b) => b[1] - a[1]),
      gearboxes: [...count("gearbox")].sort((a, b) => b[1] - a[1]),
      yearMin: years.length ? Math.min(...years) : new Date().getFullYear() - 15,
      yearMax: years.length ? Math.max(...years) : new Date().getFullYear(),
    };
  }, [initialCars]);

  const years = useMemo(
    () => Array.from({ length: options.yearMax - options.yearMin + 1 }, (_, i) => options.yearMax - i),
    [options],
  );

  const filtered = useMemo(() => {
    const q = state.q.trim().toLowerCase();
    const brandSet = new Set(state.brands);
    const fuelSet = new Set(state.fuels);
    const num = (v) => (v !== "" ? Number(v) : null);
    const min = num(state.minPrice);
    const max = num(state.maxPrice);
    const yf = num(state.yearFrom);
    const yt = num(state.yearTo);
    const km = num(state.maxKm);

    const list = initialCars.filter((c) => {
      if (q && !`${c.title} ${c.brand} ${c.model}`.toLowerCase().includes(q)) return false;
      if (brandSet.size && !brandSet.has(c.brand)) return false;
      if (fuelSet.size && !fuelSet.has(c.fuel)) return false;
      if (state.gearbox && c.gearbox !== state.gearbox) return false;
      if (min != null && c.price < min) return false;
      if (max != null && c.price > max) return false;
      if (yf != null && c.year != null && c.year < yf) return false;
      if (yt != null && c.year != null && c.year > yt) return false;
      if (km != null && c.km != null && c.km > km) return false;
      if (state.cat && c.category !== state.cat) return false;
      return true;
    });

    const sorters = {
      "price-asc": (a, b) => a.price - b.price,
      "price-desc": (a, b) => b.price - a.price,
      km: (a, b) => (a.km ?? 1e12) - (b.km ?? 1e12),
      "year-desc": (a, b) => (b.year || 0) - (a.year || 0),
      newest: (a, b) =>
        String(b.createdAt || "").localeCompare(String(a.createdAt || "")) || (b.year || 0) - (a.year || 0),
    };
    list.sort(sorters[state.sort] || sorters.newest);
    // reserved cars at the end
    list.sort((a, b) => Number(a.reserved) - Number(b.reserved));
    return list;
  }, [initialCars, state]);

  const set = (patch) => setState((s) => ({ ...s, ...patch }));
  const toggle = (key, value) =>
    setState((s) => {
      const next = new Set(s[key]);
      next.has(value) ? next.delete(value) : next.add(value);
      return { ...s, [key]: [...next] };
    });

  const chips = [
    ...state.brands.map((b) => ({ label: prettyBrand(b), clear: () => toggle("brands", b) })),
    ...state.fuels.map((f) => ({ label: fuelLabel(f), clear: () => toggle("fuels", f) })),
    state.gearbox && { label: gearboxLabel(state.gearbox), clear: () => set({ gearbox: "" }) },
    state.minPrice && { label: `ab ${formatNumber(state.minPrice)} €`, clear: () => set({ minPrice: "" }) },
    state.maxPrice && { label: `bis ${formatNumber(state.maxPrice)} €`, clear: () => set({ maxPrice: "" }) },
    state.yearFrom && { label: `EZ ab ${state.yearFrom}`, clear: () => set({ yearFrom: "" }) },
    state.yearTo && { label: `EZ bis ${state.yearTo}`, clear: () => set({ yearTo: "" }) },
    state.maxKm && { label: `bis ${formatNumber(state.maxKm)} km`, clear: () => set({ maxKm: "" }) },
    state.q && { label: `„${state.q}“`, clear: () => set({ q: "" }) },
    state.cat && { label: CATEGORY_LABELS[state.cat] || state.cat, clear: () => set({ cat: "" }) },
  ].filter(Boolean);

  const reset = () => setState(EMPTY);

  const filters = (
    <div>
      <FilterGroup title="Suche">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            value={state.q}
            onChange={(e) => set({ q: e.target.value })}
            placeholder="Marke, Modell …"
            className="field pl-9"
            aria-label="Fahrzeuge durchsuchen"
          />
        </div>
      </FilterGroup>

      <FilterGroup title="Marke">
        <div className="scroll-slim -mx-1 max-h-60 space-y-0.5 overflow-y-auto pr-1.5">
          {options.brands.map(([b, n]) => (
            <CheckRow
              key={b}
              checked={state.brands.includes(b)}
              onChange={() => toggle("brands", b)}
              label={prettyBrand(b)}
              count={n}
            />
          ))}
          {!options.brands.length ? <p className="px-1 text-sm text-muted">Keine Marken verfügbar</p> : null}
        </div>
      </FilterGroup>

      <FilterGroup title="Preis">
        <div className="grid grid-cols-2 gap-2">
          <select value={state.minPrice} onChange={(e) => set({ minPrice: e.target.value })} className="field" aria-label="Preis von">
            <option value="">von</option>
            {PRICE_STEPS.map((p) => (
              <option key={p} value={p}>
                {formatNumber(p)} €
              </option>
            ))}
          </select>
          <select value={state.maxPrice} onChange={(e) => set({ maxPrice: e.target.value })} className="field" aria-label="Preis bis">
            <option value="">bis</option>
            {PRICE_STEPS.map((p) => (
              <option key={p} value={p}>
                {formatNumber(p)} €
              </option>
            ))}
          </select>
        </div>
      </FilterGroup>

      <FilterGroup title="Erstzulassung">
        <div className="grid grid-cols-2 gap-2">
          <select value={state.yearFrom} onChange={(e) => set({ yearFrom: e.target.value })} className="field" aria-label="Erstzulassung von">
            <option value="">von</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          <select value={state.yearTo} onChange={(e) => set({ yearTo: e.target.value })} className="field" aria-label="Erstzulassung bis">
            <option value="">bis</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </FilterGroup>

      <FilterGroup title="Kilometerstand">
        <select value={state.maxKm} onChange={(e) => set({ maxKm: e.target.value })} className="field" aria-label="Kilometer bis">
          <option value="">Beliebig</option>
          {KM_STEPS.map((k) => (
            <option key={k} value={k}>
              bis {formatNumber(k)} km
            </option>
          ))}
        </select>
      </FilterGroup>

      <FilterGroup title="Kraftstoff">
        <div className="-mx-1 space-y-0.5">
          {options.fuels.map(([f, n]) => (
            <CheckRow key={f} checked={state.fuels.includes(f)} onChange={() => toggle("fuels", f)} label={fuelLabel(f)} count={n} />
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Getriebe">
        <div className="flex flex-wrap gap-2">
          {[["", initialCars.length], ...options.gearboxes].map(([g]) => (
            <button
              key={g || "all"}
              type="button"
              onClick={() => set({ gearbox: g })}
              className={cx(
                "rounded border px-2.5 py-1 text-xs font-medium transition",
                state.gearbox === g
                  ? "border-brand-600 bg-brand-600 text-white"
                  : "border-line-strong bg-white text-body hover:border-brand-500",
              )}
            >
              {g ? gearboxLabel(g) : "Alle"}
            </button>
          ))}
        </div>
      </FilterGroup>
    </div>
  );

  const visible = filtered.slice(0, limit);

  return (
    <div>
      {/* Header */}
      <section className="border-b border-line bg-white">
        <div className="container-ac py-4">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-xs text-muted">
            <Link href="/" className="hover:text-ink">
              Startseite
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-ink">Fahrzeuge</span>
          </nav>
          <h1 className="font-display mt-2 text-[26px] leading-tight sm:text-[32px]">Gebrauchtwagen bei Autocenter Jülich</h1>
          <p className="mt-0.5 text-sm text-muted">
            {initialCars.length} Fahrzeuge im Bestand · direkt aus unserem aktuellen Bestand
          </p>
        </div>
      </section>

      <div className="container-ac mt-4 grid gap-4 lg:grid-cols-[250px_1fr] lg:gap-5">
        {/* Sidebar (desktop) */}
        <aside className="hidden lg:block">
          <div className="scroll-slim card sticky top-[88px] max-h-[calc(100vh-104px)] overflow-y-auto p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="flex items-center gap-1.5 text-sm font-semibold">
                <SlidersHorizontal className="h-4 w-4" /> Filter
              </h2>
              {chips.length ? (
                <button type="button" onClick={reset} className="link text-xs">
                  Zurücksetzen
                </button>
              ) : null}
            </div>
            {filters}
          </div>
        </aside>

        {/* Results */}
        <div className="min-w-0">
          <div className="card flex flex-wrap items-center justify-between gap-2 px-2.5 py-2 sm:px-3">
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => setDrawer(true)} className="btn btn-secondary btn-sm lg:hidden">
                <SlidersHorizontal className="h-4 w-4" />
                Filter{chips.length ? ` (${chips.length})` : ""}
              </button>
              <p className="text-sm text-body">
                <span className="font-bold text-ink">{filtered.length}</span>{" "}
                Treffer
                {isPending ? <span className="ml-2 text-xs text-muted">aktualisiere …</span> : null}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={state.sort}
                onChange={(e) => set({ sort: e.target.value })}
                className="field h-8 w-40 text-[13px] sm:w-auto"
                aria-label="Sortierung"
              >
                <option value="newest">Neueste Angebote</option>
                <option value="price-asc">Preis aufsteigend</option>
                <option value="price-desc">Preis absteigend</option>
                <option value="km">Kilometer aufsteigend</option>
                <option value="year-desc">Erstzulassung (neueste)</option>
              </select>
              <div className="hidden rounded-lg border border-line-strong p-0.5 sm:flex" role="group" aria-label="Ansicht">
                {[
                  ["grid", LayoutGrid, "Kacheln"],
                  ["list", List, "Liste"],
                ].map(([v, Icon, label]) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setView(v)}
                    aria-label={label}
                    aria-pressed={view === v}
                    className={cx(
                      "flex h-7 w-7 items-center justify-center rounded transition",
                      view === v ? "bg-navy-900 text-white" : "text-muted hover:text-ink",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </button>
                ))}
              </div>
            </div>

            {chips.length ? (
              <div className="flex w-full flex-wrap items-center gap-1.5 border-t border-line pt-2">
                {chips.map((c) => (
                  <button
                    key={c.label}
                    type="button"
                    onClick={c.clear}
                    className="chip border border-brand-200 bg-brand-50 text-brand-700 hover:border-brand-500"
                  >
                    {c.label}
                    <X className="h-3.5 w-3.5" />
                  </button>
                ))}
                <button type="button" onClick={reset} className="text-xs font-medium text-muted hover:text-ink">
                  Alle entfernen
                </button>
              </div>
            ) : null}
          </div>

          {filtered.length === 0 ? (
            <div className="card mt-3 p-8 text-center">
              <h2 className="text-base font-semibold">Keine passenden Fahrzeuge gefunden</h2>
              <p className="mx-auto mt-1 max-w-md text-sm text-muted">
                Passen Sie die Filter an – oder rufen Sie uns an. Wir suchen gerne ein passendes Fahrzeug für Sie:{" "}
                <a href={SITE.phoneHref} className="font-semibold text-brand-600">
                  {SITE.phoneDisplay}
                </a>
              </p>
              {chips.length ? (
                <button type="button" onClick={reset} className="btn btn-primary mt-4">
                  Filter zurücksetzen
                </button>
              ) : null}
            </div>
          ) : (
            <>
              <div
                className={cx(
                  "mt-3 grid gap-3",
                  view === "list" ? "grid-cols-1" : "grid-cols-2 md:grid-cols-3",
                )}
              >
                {visible.map((car, i) => (
                  <CarCard key={car.id} car={car} layout={view} priority={i < 3} />
                ))}
              </div>

              {filtered.length > limit ? (
                <div className="mt-6 text-center">
                  <p className="mb-2 text-xs text-muted">
                    {visible.length} von {filtered.length} Fahrzeugen
                  </p>
                  <button type="button" onClick={() => setLimit((l) => l + PAGE_SIZE)} className="btn btn-secondary">
                    Weitere Fahrzeuge laden
                  </button>
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      <div className={cx("fixed inset-0 z-[90] lg:hidden", drawer ? "" : "pointer-events-none")} aria-hidden={!drawer}>
        <div
          className={cx("absolute inset-0 bg-navy-950/60 transition-opacity", drawer ? "opacity-100" : "opacity-0")}
          onClick={() => setDrawer(false)}
        />
        <div
          className={cx(
            "absolute inset-x-0 bottom-0 flex max-h-[90vh] flex-col rounded-t-2xl bg-white transition-transform duration-300",
            drawer ? "translate-y-0" : "translate-y-full",
          )}
        >
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <h2 className="text-base font-semibold">Filter</h2>
            <button type="button" onClick={() => setDrawer(false)} aria-label="Schließen" className="rounded-lg p-2 hover:bg-canvas">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="scroll-slim flex-1 overflow-y-auto px-4 py-4">{filters}</div>
          <div className="grid grid-cols-2 gap-2 border-t border-line p-3">
            <button type="button" onClick={reset} className="btn btn-secondary">
              Zurücksetzen
            </button>
            <button type="button" onClick={() => setDrawer(false)} className="btn btn-primary">
              {filtered.length} Treffer zeigen
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
