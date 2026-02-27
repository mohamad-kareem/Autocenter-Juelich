"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useState, useEffect, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const formatPrice = (n) =>
  new Intl.NumberFormat("de-DE").format(Number(n || 0));
const formatKm = (n) => new Intl.NumberFormat("de-DE").format(Number(n || 0));

const FUEL_LABELS = {
  PETROL: "Benzin",
  DIESEL: "Diesel",
  ELECTRICITY: "Elektro",
  HYBRID: "Hybrid",
  HYBRID_DIESEL: "Hybrid (Diesel)",
  LPG: "LPG",
  CNG: "CNG",
};

const GEARBOX_LABELS = {
  AUTOMATIC_GEAR: "Automatik",
  SEMIAUTOMATIC_GEAR: "Halbautomatik",
  MANUAL_GEAR: "Schaltung",
};

function normalizeStr(v) {
  return String(v || "").trim();
}

function FilterSection({ title, children }) {
  return (
    <div className="border-b border-white/10 pb-6">
      <h3 className="mb-4 text-sm font-semibold text-[var(--ac-text)]">
        {title}
      </h3>
      {children}
    </div>
  );
}

function SpecPill({ children }) {
  return (
    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/75">
      {children}
    </span>
  );
}

function parseMulti(sp, key) {
  const raw = sp.get(key);
  if (!raw) return [];
  return raw
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}

function buildQuery(next) {
  const params = new URLSearchParams();

  if (next.q) params.set("q", next.q);
  if (next.sort) params.set("sort", next.sort);

  if (next.brands?.length) params.set("brand", next.brands.join(","));
  if (next.fuels?.length) params.set("fuel", next.fuels.join(","));
  if (next.gearbox) params.set("gearbox", next.gearbox);

  if (next.minPrice) params.set("min", String(next.minPrice));
  if (next.maxPrice) params.set("max", String(next.maxPrice));

  if (next.yearFrom) params.set("yf", String(next.yearFrom));
  if (next.yearTo) params.set("yt", String(next.yearTo));

  const s = params.toString();
  return s ? `?${s}` : "";
}

export default function FahrzeugeClient({ initialCars = [] }) {
  const router = useRouter();
  const sp = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // ---- options from data
  const brands = useMemo(() => {
    const set = new Set();
    for (const c of initialCars) {
      const b = normalizeStr(c.brand || (c.title || "").split(" ")[0]);
      if (b) set.add(b);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, "de"));
  }, [initialCars]);

  const fuels = useMemo(() => {
    const set = new Set();
    for (const c of initialCars) {
      const f = normalizeStr(c.fuel);
      if (f) set.add(f);
    }
    return Array.from(set).sort();
  }, [initialCars]);

  const gearboxes = useMemo(() => {
    const set = new Set();
    for (const c of initialCars) {
      const g = normalizeStr(c.gearbox);
      if (g) set.add(g);
    }
    return Array.from(set).sort();
  }, [initialCars]);

  const yearBounds = useMemo(() => {
    const years = initialCars
      .map((c) => Number(c.year))
      .filter((y) => Number.isFinite(y));
    if (!years.length) return { min: 2000, max: new Date().getFullYear() };
    return { min: Math.min(...years), max: Math.max(...years) };
  }, [initialCars]);

  // ---- read initial filter state from URL
  const [state, setState] = useState(() => ({
    q: sp.get("q") || "",
    sort: sp.get("sort") || "newest",
    brands: parseMulti(sp, "brand"),
    fuels: parseMulti(sp, "fuel"),
    gearbox: sp.get("gearbox") || "",
    minPrice: sp.get("min") || "",
    maxPrice: sp.get("max") || "",
    yearFrom: sp.get("yf") || "",
    yearTo: sp.get("yt") || "",
  }));

  // keep local state synced if user edits URL manually / back-forward
  useEffect(() => {
    setState((prev) => ({
      ...prev,
      q: sp.get("q") || "",
      sort: sp.get("sort") || "newest",
      brands: parseMulti(sp, "brand"),
      fuels: parseMulti(sp, "fuel"),
      gearbox: sp.get("gearbox") || "",
      minPrice: sp.get("min") || "",
      maxPrice: sp.get("max") || "",
      yearFrom: sp.get("yf") || "",
      yearTo: sp.get("yt") || "",
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sp.toString()]);

  // apply to URL (debounced for smooth typing)
  useEffect(() => {
    const t = setTimeout(() => {
      const qs = buildQuery(state);
      startTransition(() => router.replace(`/fahrzeuge${qs}`));
    }, 250);
    return () => clearTimeout(t);
  }, [state, router, startTransition]);

  // ---- filtering
  const filteredCars = useMemo(() => {
    const q = state.q.trim().toLowerCase();
    const brandSet = new Set(state.brands);
    const fuelSet = new Set(state.fuels);

    const min = state.minPrice !== "" ? Number(state.minPrice) : null;
    const max = state.maxPrice !== "" ? Number(state.maxPrice) : null;
    const yf = state.yearFrom !== "" ? Number(state.yearFrom) : null;
    const yt = state.yearTo !== "" ? Number(state.yearTo) : null;

    let list = initialCars.filter((c) => {
      const title = normalizeStr(c.title).toLowerCase();
      const brand = normalizeStr(c.brand || (c.title || "").split(" ")[0]);
      const fuel = normalizeStr(c.fuel);
      const gearbox = normalizeStr(c.gearbox);

      const price = c.price != null ? Number(c.price) : null;
      const year = c.year != null ? Number(c.year) : null;

      if (q) {
        const hay =
          `${title} ${brand} ${normalizeStr(c.model || "")}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }

      if (brandSet.size && !brandSet.has(brand)) return false;
      if (fuelSet.size && !fuelSet.has(fuel)) return false;

      if (state.gearbox && gearbox !== state.gearbox) return false;

      if (min != null && price != null && price < min) return false;
      if (max != null && price != null && price > max) return false;

      if (yf != null && year != null && year < yf) return false;
      if (yt != null && year != null && year > yt) return false;

      return true;
    });

    // ---- sorting
    const sort = state.sort || "newest";

    list.sort((a, b) => {
      const pa = a.price != null ? Number(a.price) : 0;
      const pb = b.price != null ? Number(b.price) : 0;

      const ka = a.km != null ? Number(a.km) : 999999999;
      const kb = b.km != null ? Number(b.km) : 999999999;

      const ya = a.year != null ? Number(a.year) : 0;
      const yb = b.year != null ? Number(b.year) : 0;

      if (sort === "price-asc") return pa - pb;
      if (sort === "price-desc") return pb - pa;
      if (sort === "km") return ka - kb;

      // newest (default)
      return yb - ya;
    });

    return list;
  }, [initialCars, state]);

  // helpers
  const toggleInArray = (key, value) => {
    setState((s) => {
      const arr = new Set(s[key]);
      if (arr.has(value)) arr.delete(value);
      else arr.add(value);
      return { ...s, [key]: Array.from(arr) };
    });
  };

  const resetAll = () => {
    setState({
      q: "",
      sort: "newest",
      brands: [],
      fuels: [],
      gearbox: "",
      minPrice: "",
      maxPrice: "",
      yearFrom: "",
      yearTo: "",
    });
  };

  return (
    <div className="px-4 sm:px-6 lg:px-12 py-10 sm:py-5 lg:py-5">
      <div className="mx-auto w-full max-w-7xl">
        {/* Header */}
        <section className="relative mb-10">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-white/15 to-transparent" />
          <div className="max-w-3xl">
            <h1 className="mt-1 text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight text-[var(--ac-text)]">
              Fahrzeuge <span className="ac-text-gradient">entdecken</span>
            </h1>
            <p className="mt-3 max-w-2xl text-sm sm:text-base text-[var(--ac-muted-2)] leading-relaxed">
              Finden Sie Ihr Wunschfahrzeug aus unserem aktuellen Bestand.
            </p>
          </div>
          <div className="h-px w-full bg-gradient-to-r from-transparent via-white/15 to-transparent" />
        </section>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Sidebar */}
          <aside className="lg:w-80 flex-shrink-0">
            <div className="sticky top-24 rounded-2xl border border-white/10 bg-[rgba(10,20,45,0.35)] p-6">
              <div className="flex items-center justify-between mb-6 gap-4">
                <h2 className="text-lg font-semibold text-[var(--ac-text)]">
                  Filter
                </h2>

                <button
                  type="button"
                  onClick={resetAll}
                  className="text-sm text-[var(--ac-muted)] hover:text-[var(--ac-text)] transition"
                >
                  Zurücksetzen
                </button>
              </div>

              <FilterSection title="Suche">
                <input
                  value={state.q}
                  onChange={(e) =>
                    setState((s) => ({ ...s, q: e.target.value }))
                  }
                  placeholder="z.B. Opel, Crossland, Golf..."
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-[var(--ac-text)] placeholder-[var(--ac-muted)] focus:border-[var(--accent)] focus:outline-none"
                />
              </FilterSection>

              <FilterSection title="Marke">
                <div className="space-y-2 max-h-60 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                  {brands.map((b) => (
                    <label
                      key={b}
                      className="flex items-center gap-3 text-sm text-[var(--ac-muted-2)] hover:text-[var(--ac-text)] transition"
                    >
                      <input
                        type="checkbox"
                        checked={state.brands.includes(b)}
                        onChange={() => toggleInArray("brands", b)}
                        className="rounded border-white/20 bg-white/5 text-[var(--accent)] focus:ring-[var(--accent)]"
                      />
                      {b}
                    </label>
                  ))}
                </div>
              </FilterSection>

              <FilterSection title="Preis (€)">
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="number"
                      inputMode="numeric"
                      value={state.minPrice}
                      onChange={(e) =>
                        setState((s) => ({ ...s, minPrice: e.target.value }))
                      }
                      placeholder="Min"
                      className="w-1/2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-[var(--ac-text)] placeholder-[var(--ac-muted)] focus:border-[var(--accent)] focus:outline-none"
                    />
                    <input
                      type="number"
                      inputMode="numeric"
                      value={state.maxPrice}
                      onChange={(e) =>
                        setState((s) => ({ ...s, maxPrice: e.target.value }))
                      }
                      placeholder="Max"
                      className="w-1/2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-[var(--ac-text)] placeholder-[var(--ac-muted)] focus:border-[var(--accent)] focus:outline-none"
                    />
                  </div>
                  <p className="text-xs text-[var(--ac-muted)]">
                    Tipp: leer lassen = keine Begrenzung
                  </p>
                </div>
              </FilterSection>

              <FilterSection title="Kraftstoff">
                <div className="space-y-2">
                  {fuels.map((f) => (
                    <label
                      key={f}
                      className="flex items-center gap-3 text-sm text-[var(--ac-muted-2)] hover:text-[var(--ac-text)] transition"
                    >
                      <input
                        type="checkbox"
                        checked={state.fuels.includes(f)}
                        onChange={() => toggleInArray("fuels", f)}
                        className="rounded border-white/20 bg-white/5 text-[var(--accent)] focus:ring-[var(--accent)]"
                      />
                      {FUEL_LABELS[f] || f}
                    </label>
                  ))}
                </div>
              </FilterSection>

              <FilterSection title="Getriebe">
                <div className="space-y-2">
                  <label className="flex items-center gap-3 text-sm text-[var(--ac-muted-2)] hover:text-[var(--ac-text)] transition">
                    <input
                      type="radio"
                      name="gearbox"
                      checked={!state.gearbox}
                      onChange={() => setState((s) => ({ ...s, gearbox: "" }))}
                      className="border-white/20 bg-white/5 text-[var(--accent)] focus:ring-[var(--accent)]"
                    />
                    Alle
                  </label>

                  {gearboxes.map((g) => (
                    <label
                      key={g}
                      className="flex items-center gap-3 text-sm text-[var(--ac-muted-2)] hover:text-[var(--ac-text)] transition"
                    >
                      <input
                        type="radio"
                        name="gearbox"
                        checked={state.gearbox === g}
                        onChange={() => setState((s) => ({ ...s, gearbox: g }))}
                        className="border-white/20 bg-white/5 text-[var(--accent)] focus:ring-[var(--accent)]"
                      />
                      {GEARBOX_LABELS[g] || g}
                    </label>
                  ))}
                </div>
              </FilterSection>

              <FilterSection title="Baujahr">
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={state.yearFrom}
                    onChange={(e) =>
                      setState((s) => ({ ...s, yearFrom: e.target.value }))
                    }
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-[var(--ac-text)] focus:border-[var(--accent)] focus:outline-none"
                  >
                    <option value="" className="bg-[#0a0f26] text-white">
                      Von
                    </option>
                    {Array.from(
                      { length: yearBounds.max - yearBounds.min + 1 },
                      (_, i) => yearBounds.min + i,
                    )
                      .reverse()
                      .map((y) => (
                        <option
                          key={`yf-${y}`}
                          value={String(y)}
                          className="bg-[#0a0f26] text-white"
                        >
                          {y}
                        </option>
                      ))}
                  </select>

                  <select
                    value={state.yearTo}
                    onChange={(e) =>
                      setState((s) => ({ ...s, yearTo: e.target.value }))
                    }
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-[var(--ac-text)] focus:border-[var(--accent)] focus:outline-none"
                  >
                    <option value="" className="bg-[#0a0f26] text-white">
                      Bis
                    </option>
                    {Array.from(
                      { length: yearBounds.max - yearBounds.min + 1 },
                      (_, i) => yearBounds.min + i,
                    )
                      .reverse()
                      .map((y) => (
                        <option
                          key={`yt-${y}`}
                          value={String(y)}
                          className="bg-[#0a0f26] text-white"
                        >
                          {y}
                        </option>
                      ))}
                  </select>
                </div>
              </FilterSection>

              <div className="mt-6">
                <div className="text-xs text-[var(--ac-muted)]">
                  {isPending ? "Filter werden angewendet..." : " "}
                </div>
              </div>
            </div>
          </aside>

          {/* Grid */}
          <main className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
              <p className="text-sm text-[var(--ac-muted-2)]">
                <span className="font-semibold text-[var(--ac-text)]">
                  {filteredCars.length}
                </span>{" "}
                Fahrzeuge gefunden
              </p>

              <select
                value={state.sort}
                onChange={(e) =>
                  setState((s) => ({ ...s, sort: e.target.value }))
                }
                className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-[var(--ac-text)] focus:border-[var(--accent)] focus:outline-none"
              >
                <option value="newest" className="bg-[#0a0f26] text-white">
                  Sortieren: Neueste
                </option>
                <option value="price-asc" className="bg-[#0a0f26] text-white">
                  Preis aufsteigend
                </option>
                <option value="price-desc" className="bg-[#0a0f26] text-white">
                  Preis absteigend
                </option>
                <option value="km" className="bg-[#0a0f26] text-white">
                  Kilometerstand
                </option>
              </select>
            </div>

            {filteredCars.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-[rgba(10,20,45,0.35)] p-10 text-center">
                <h3 className="text-lg font-semibold text-[var(--ac-text)]">
                  Keine Fahrzeuge gefunden
                </h3>
                <p className="mt-2 text-sm text-[var(--ac-muted-2)]">
                  Bitte Filter anpassen oder zurücksetzen.
                </p>
                <button
                  type="button"
                  onClick={resetAll}
                  className="mt-5 ac-btn-primary rounded-xl px-5 py-3 text-sm font-semibold"
                >
                  Filter zurücksetzen
                </button>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {filteredCars.map((car) => {
                  const img = car.images?.[0] || "/placeholder-car.jpg";

                  return (
                    <Link
                      key={car.id}
                      href={`/fahrzeuge/${car.id}`}
                      className="group rounded-2xl border border-white/10 overflow-hidden bg-[rgba(10,20,45,0.35)] hover:bg-[rgba(10,20,45,0.45)] transition"
                    >
                      <div className="relative aspect-[16/10]">
                        <Image
                          src={img}
                          alt={car.title || "Fahrzeug"}
                          fill
                          className="object-cover transition duration-500 group-hover:scale-105"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                        {car.isSold && (
                          <div className="absolute top-3 left-3 rounded-xl bg-black/60 px-3 py-1 text-xs font-semibold text-white border border-white/15 backdrop-blur-sm">
                            VERKAUFT
                          </div>
                        )}

                        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-3">
                          <div className="text-sm font-bold text-white">
                            {formatPrice(car.price)} €
                          </div>
                          <div className="text-[11px] text-white/80">
                            {car.location || "Jülich"}
                          </div>
                        </div>
                      </div>

                      <div className="p-5">
                        <h3 className="text-base font-bold text-[var(--ac-text)] line-clamp-2">
                          {car.title}
                        </h3>

                        <div className="mt-3 flex flex-wrap gap-2">
                          {car.year ? <SpecPill>{car.year}</SpecPill> : null}
                          {car.km != null ? (
                            <SpecPill>{formatKm(car.km)} km</SpecPill>
                          ) : null}
                          {car.fuel ? (
                            <SpecPill>
                              {FUEL_LABELS[car.fuel] || car.fuel}
                            </SpecPill>
                          ) : null}
                          {car.gearbox ? (
                            <SpecPill>
                              {GEARBOX_LABELS[car.gearbox] || car.gearbox}
                            </SpecPill>
                          ) : null}
                          {car.power ? (
                            <SpecPill>{car.power} PS</SpecPill>
                          ) : null}
                        </div>

                        <div className="mt-4 flex items-center justify-between">
                          <span className="text-xs text-[var(--ac-muted)]">
                            Details ansehen →
                          </span>
                          <span className="h-8 w-8 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-white/70 group-hover:text-white transition">
                            →
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
