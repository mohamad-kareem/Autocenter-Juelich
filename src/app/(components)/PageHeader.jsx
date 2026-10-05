import Link from "next/link";
import { ChevronRight } from "lucide-react";

/**
 * Compact page title bar with breadcrumb (white, like large marketplaces).
 * @param {{ title: React.ReactNode, subtitle?: React.ReactNode, crumbs?: {label:string, href?:string}[], children?: React.ReactNode }} props
 */
export default function PageHeader({ title, subtitle, crumbs = [], children }) {
  return (
    <section className="border-b border-line bg-white">
      <div className="container-ac py-4 sm:py-5">
        {crumbs.length ? (
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-1 text-xs text-muted">
              <li>
                <Link href="/" className="hover:text-ink">
                  Startseite
                </Link>
              </li>
              {crumbs.map((c) => (
                <li key={c.label} className="flex items-center gap-1">
                  <ChevronRight className="h-3 w-3" />
                  {c.href ? (
                    <Link href={c.href} className="hover:text-ink">
                      {c.label}
                    </Link>
                  ) : (
                    <span className="text-ink">{c.label}</span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        ) : null}
        <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-[26px] leading-tight sm:text-[32px]">{title}</h1>
            {subtitle ? <p className="mt-1 max-w-3xl text-sm text-muted">{subtitle}</p> : null}
          </div>
          {children}
        </div>
      </div>
    </section>
  );
}
