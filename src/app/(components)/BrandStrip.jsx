import Link from "next/link";
import { prettyBrand } from "@/lib/cars";

/** Brand row like the big portals: every make in stock with its count. */
export default function BrandStrip({ cars = [] }) {
  const counts = new Map();
  for (const c of cars) if (c.brand) counts.set(c.brand, (counts.get(c.brand) || 0) + 1);

  const brands = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "de")).slice(0, 12);

  if (!brands.length) return null;

  return (
    <section className="container-ac mt-10">
      <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted">Marken im Bestand</h2>

      <ul className="mt-3 flex flex-wrap gap-2">
        {brands.map(([brand, count]) => (
          <li key={brand}>
            <Link
              href={`/fahrzeuge?brand=${encodeURIComponent(brand)}`}
              className="flex h-10 items-center gap-2 rounded-full border border-line bg-white px-4 text-[13px] font-medium text-ink transition hover:border-brand-500 hover:text-brand-700"
            >
              {prettyBrand(brand)}
              <span className="text-muted">{count}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
