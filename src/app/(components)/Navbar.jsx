"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, CalendarCheck, ChevronDown, MapPin, Menu, Phone, X } from "lucide-react";
import Logo from "./Logo";
import UserMenu, { initialsOf } from "./UserMenu";
import useSession from "./useSession";
import { SITE, getOpeningStatus } from "@/lib/site";

const cx = (...c) => c.filter(Boolean).join(" ");

const NAV = [
  { label: "Fahrzeuge", href: "/fahrzeuge" },
  {
    label: "Service",
    children: [
      { label: "Finanzierung", href: "/finanzierung", text: "Laufzeiten von 12 bis 84 Monaten" },
      { label: "CarGarantie®", href: "/garantie", text: "12, 24 oder 36 Monate Schutz" },
    ],
  },
  { label: "Auto verkaufen", href: "/auto-verkaufen" },
  { label: "Kontakt", href: "/kontakt" },
];

/** Flat list for the mobile menu */
const FLAT_NAV = NAV.flatMap((item) => item.children || [item]);

function useOpeningStatus() {
  const [status, setStatus] = useState(null);
  useEffect(() => {
    const update = () => setStatus(getOpeningStatus());
    const first = setTimeout(update, 0);
    const t = setInterval(update, 60_000);
    return () => {
      clearTimeout(first);
      clearInterval(t);
    };
  }, []);
  return status;
}

export default function Navbar() {
  const pathname = usePathname() || "/";
  const isHome = pathname === "/";
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openMenu, setOpenMenu] = useState(null);
  const status = useOpeningStatus();
  const user = useSession();

  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
    setOpenMenu(null);
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const isActive = (href) => pathname === href || pathname.startsWith(`${href}/`);
  // Transparent over the homepage hero until the user scrolls
  const solid = !isHome || scrolled || open;

  return (
    <>
      <header
        className={cx(
          "fixed inset-x-0 top-0 z-[70] transition-[background-color,box-shadow,backdrop-filter] duration-300",
          solid
            ? "bg-navy-900/95 shadow-[0_1px_0_rgba(255,255,255,0.06),0_8px_30px_-12px_rgba(0,0,0,0.5)] backdrop-blur-md"
            : "bg-transparent",
        )}
      >
        <nav className="container-ac grid h-16 grid-cols-[auto_1fr_auto] items-center gap-6 lg:h-[72px]">
          <Logo className="h-8 w-auto lg:h-9" priority />

          {/* Center navigation */}
          <ul className="hidden items-center justify-center gap-2 lg:flex xl:gap-4">
            {NAV.map((item) => {
              const active = item.children ? item.children.some((c) => isActive(c.href)) : isActive(item.href);
              const linkCls = cx(
                "group relative inline-flex h-10 items-center gap-1 whitespace-nowrap px-3 text-[13px] font-medium uppercase tracking-[0.14em] transition-colors",
                active ? "text-white" : "text-white/70 hover:text-white",
              );
              const underline = (
                <span
                  className={cx(
                    "absolute bottom-1 left-1/2 h-px -translate-x-1/2 bg-accent-400 transition-all duration-300",
                    active ? "w-6" : "w-0 group-hover:w-6",
                  )}
                />
              );

              if (item.children) {
                const isOpen = openMenu === item.label;
                return (
                  <li
                    key={item.label}
                    className="relative"
                    onMouseEnter={() => setOpenMenu(item.label)}
                    onMouseLeave={() => setOpenMenu(null)}
                  >
                    <button
                      type="button"
                      aria-haspopup="true"
                      aria-expanded={isOpen}
                      onClick={() => setOpenMenu(isOpen ? null : item.label)}
                      className={linkCls}
                    >
                      {item.label}
                      <ChevronDown className={cx("h-3.5 w-3.5 transition", isOpen && "rotate-180")} />
                      {underline}
                    </button>
                    {isOpen ? (
                      <div className="absolute left-1/2 top-full w-64 -translate-x-1/2 pt-2">
                        <ul className="animate-pop-in overflow-hidden rounded-xl border border-line bg-white p-1.5 shadow-float">
                          {item.children.map((c) => (
                            <li key={c.href}>
                              <Link
                                href={c.href}
                                onClick={() => setOpenMenu(null)}
                                className={cx(
                                  "block rounded-lg px-3 py-2 transition hover:bg-canvas",
                                  isActive(c.href) && "bg-canvas",
                                )}
                              >
                                <span className="block text-[13px] font-semibold text-ink">{c.label}</span>
                                <span className="block text-[12px] text-muted">{c.text}</span>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </li>
                );
              }

              return (
                <li key={item.href}>
                  <Link href={item.href} className={linkCls}>
                    {item.label}
                    {underline}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Right actions */}
          <div className="hidden items-center justify-end gap-4 lg:flex">
            <Link
              href="/kontakt?betreff=Probefahrt%20vereinbaren"
              className="inline-flex h-9 items-center rounded-full border border-white/30 px-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-white transition hover:border-white hover:bg-white hover:text-navy-900"
            >
              Probefahrt
            </Link>
            {user ? (
              <>
                <span className="h-6 w-px bg-white/15" aria-hidden />
                <UserMenu user={user} variant="dark" showWebsiteLink={false} />
              </>
            ) : null}
          </div>

          {/* Mobile toggle */}
          <div className="flex items-center justify-end gap-1 lg:hidden">
            {user && !open ? <UserMenu user={user} variant="dark" showWebsiteLink={false} /> : null}
            <a
              href={SITE.phoneHref}
              aria-label="Anrufen"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white"
            >
              <Phone className="h-4 w-4" />
            </a>
            <button
              type="button"
              aria-label={open ? "Menü schließen" : "Menü öffnen"}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
              className="flex h-10 w-10 items-center justify-center rounded-full text-white hover:bg-white/10"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </nav>
      </header>

      {/* Spacer so content isn't hidden behind the fixed header (hero handles this itself) */}
      {!isHome ? <div className="h-16 lg:h-[72px]" aria-hidden /> : null}

      {/* Mobile full-screen menu */}
      <div
        className={cx(
          "fixed inset-0 z-[68] flex flex-col bg-navy-950 pt-16 transition-all duration-300 lg:hidden",
          open ? "visible opacity-100" : "invisible opacity-0",
        )}
        aria-hidden={!open}
      >
        <div className="pointer-events-none absolute -right-24 top-24 h-72 w-72 rounded-full bg-brand-600/25 blur-3xl" />
        <nav className="container-ac relative flex-1 overflow-y-auto pt-8">
          <ul className="space-y-1">
            {[{ label: "Startseite", href: "/" }, ...FLAT_NAV].map((item, i) => {
              const active = item.href === "/" ? isHome : isActive(item.href);
              return (
                <li
                  key={item.href}
                  className={cx("transition-all duration-500", open ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0")}
                  style={{ transitionDelay: open ? `${80 + i * 50}ms` : "0ms" }}
                >
                  <Link
                    href={item.href}
                    className="group flex items-center justify-between border-b border-white/10 py-4"
                  >
                    <span className={cx("font-display text-3xl", active ? "text-accent-300" : "text-white")}>
                      {item.label}
                    </span>
                    <ArrowRight className="h-5 w-5 text-white/40 transition group-hover:translate-x-1 group-hover:text-white" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="container-ac relative space-y-3 pb-8 pt-4 text-sm text-white/60">
          {user ? (
            <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-accent-500 text-[11px] font-bold text-white">
                {initialsOf(user.name) || "?"}
              </span>
              <span className="mr-auto text-[13px] font-medium text-white">{user.name}</span>
              <Link href="/dashboard" className="btn btn-ghost-light btn-sm rounded-full">
                Dashboard
              </Link>
              <Link href="/dashboard/profil" className="btn btn-ghost-light btn-sm rounded-full">
                Profil
              </Link>
            </div>
          ) : null}
          {status ? (
            <p className="flex items-center gap-2">
              <span className={cx("h-1.5 w-1.5 rounded-full", status.open ? "bg-emerald-400" : "bg-rose-400")} />
              {status.label}
            </p>
          ) : null}
          <p className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            {SITE.street}, {SITE.zip} {SITE.city}
          </p>
          <div className="grid grid-cols-2 gap-2 pt-1">
            <a href={SITE.phoneHref} className="btn btn-ghost-light btn-lg rounded-full">
              <Phone className="h-4 w-4" />
              Anrufen
            </a>
            <Link href="/kontakt?betreff=Probefahrt%20vereinbaren" className="btn btn-lg rounded-full bg-white text-navy-900">
              <CalendarCheck className="h-4 w-4" />
              Probefahrt
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
