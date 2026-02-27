// components/Navbar.jsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, Menu, X, Phone, MapPin, Calendar } from "lucide-react";

const cx = (...c) => c.filter(Boolean).join(" ");

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openMobileGroup, setOpenMobileGroup] = useState(null);

  const navRef = useRef(null);

  // Close mobile menu on outside click
  useEffect(() => {
    const onDown = (e) => {
      if (!navRef.current) return;
      if (navRef.current.contains(e.target)) return;
      setIsMenuOpen(false);
      setOpenMobileGroup(null);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  // Close mobile menu on ESC
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        setIsMenuOpen(false);
        setOpenMobileGroup(null);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // Prevent background scroll when mobile menu open
  useEffect(() => {
    document.documentElement.style.overflow = isMenuOpen ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [isMenuOpen]);

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = useMemo(
    () => [
      {
        label: "Fahrzeuge",
        href: "/fahrzeuge",
        submenu: [
          { label: "Neuwagen", href: "/fahrzeuge?typ=neuwagen" },
          { label: "Gebrauchtwagen", href: "/fahrzeuge?typ=gebrauchtwagen" },
        ],
      },
      { label: "Garantie", href: "/garantie" },
      { label: "Finanzierung", href: "/finanzierung" },
      { label: "Kontakt", href: "/kontakt", submenu: [] },
    ],
    [],
  );

  const toggleMobileGroup = (label) => {
    setOpenMobileGroup((cur) => (cur === label ? null : label));
  };

  return (
    <>
      {/* =========================
          TOP BAR (premium blue like hero)
         ========================= */}
      <div
        className="text-white"
        style={{
          background:
            "linear-gradient(135deg, rgba(13,31,77,1) 0%, rgba(26,90,230,1) 100%)",
        }}
      >
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex flex-col gap-2 py-2 text-sm md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>Jülich</span>
              </span>
              <span className="hidden md:inline text-white/60">•</span>
              <span className="inline-flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <a
                  className="font-semibold hover:underline"
                  href="tel:+49176 32445082"
                >
                  0176 32445082
                </a>
              </span>
            </div>

            <div className="flex items-center gap-2 text-white/90">
              <span className="hidden lg:block font-semibold">
                Nicht warten. Starten.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* =========================
          MAIN NAV (light premium glass + hero blue)
         ========================= */}
      <header
        ref={navRef}
        className={cx(
          "sticky top-0 z-[9999] isolate transition-all duration-300",
          // Light glass always, just stronger when scrolled
          scrolled
            ? "backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.10)]"
            : "backdrop-blur-sm",
        )}
        style={{
          background: scrolled
            ? "rgba(241,245,255,0.92)" // light gray premium
            : "rgba(241,245,255,0.80)",
          borderBottom: scrolled
            ? "1px solid rgba(26,90,230,0.16)"
            : "1px solid rgba(15,23,42,0.08)",
        }}
      >
        <nav className="mx-auto max-w-7xl px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3">
              <div className="leading-tight">
                <div className="text-lg font-extrabold text-slate-900">
                  AutoCenter{" "}
                  <span style={{ color: "var(--ac-blue)" }}>Jülich</span>
                </div>
                <div className="text-xs text-slate-600">
                  Premium Autohaus seit 2014
                </div>
              </div>
            </Link>

            {/* Desktop menu */}
            <div className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => {
                const hasSub = item.submenu?.length > 0;

                return (
                  <div key={item.label} className="relative group">
                    <Link
                      href={item.href}
                      className={cx(
                        "inline-flex items-center gap-1 rounded-xl px-3 py-2 text-sm font-semibold transition",
                        "text-slate-700 hover:text-slate-900",
                      )}
                      style={{
                        // premium hover glow
                        background:
                          "linear-gradient(180deg, rgba(26,90,230,0.00), rgba(26,90,230,0.00))",
                      }}
                    >
                      <span>{item.label}</span>
                      {hasSub && (
                        <ChevronDown className="h-4 w-4 transition group-hover:rotate-180" />
                      )}
                    </Link>

                    {/* Hover highlight (hero blue, subtle) */}
                    <div
                      className="absolute inset-x-2 -bottom-1 h-[2px] scale-x-0 opacity-0 transition group-hover:scale-x-100 group-hover:opacity-100"
                      style={{
                        background:
                          "linear-gradient(90deg, var(--ac-blue), var(--ac-blue-light))",
                      }}
                    />

                    {/* Dropdown */}
                    {hasSub && (
                      <div className="absolute left-0 top-full pt-2 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition">
                        <div
                          className="min-w-[240px] rounded-2xl p-2 shadow-[0_18px_45px_rgba(2,6,23,0.18)]"
                          style={{
                            background: "rgba(248,250,252,0.98)", // light
                            border: "1px solid rgba(26,90,230,0.14)",
                            backdropFilter: "blur(10px)",
                          }}
                        >
                          {item.submenu.map((sub) => (
                            <Link
                              key={sub.label}
                              href={sub.href}
                              className="block rounded-xl px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100"
                              style={{
                                // blue text on hover
                                WebkitTapHighlightColor: "transparent",
                              }}
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.color = "var(--ac-blue)")
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.color = "")
                              }
                            >
                              {sub.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Desktop right */}
            <div className="hidden lg:flex items-center gap-4">
              <div className="text-right leading-tight">
                <div className="text-xs text-slate-600">Beratung & Verkauf</div>
                <a
                  className="text-sm font-extrabold text-slate-900"
                  style={{
                    color: scrolled ? "var(--ac-blue)" : "var(--ac-blue)",
                  }}
                  href="tel:+49176 32445082"
                >
                  176 32445082
                </a>
              </div>

              <Link
                href="/kontakt"
                className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white transition"
                style={{
                  background:
                    "linear-gradient(135deg, var(--ac-blue) 0%, #0d1f4d 100%)",
                  boxShadow:
                    "0 14px 30px rgba(0,0,0,0.18), 0 8px 18px rgba(26,90,230,0.18)",
                }}
              >
                <Calendar className="h-4 w-4" />
                Termin vereinbaren
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              type="button"
              className="lg:hidden inline-flex items-center justify-center rounded-xl px-3 py-2 transition"
              aria-label="Menü öffnen"
              onClick={() => setIsMenuOpen((v) => !v)}
              style={{
                background: "rgba(248,250,252,0.95)",
                border: "1px solid rgba(26,90,230,0.18)",
                boxShadow: "0 10px 24px rgba(2,6,23,0.10)",
                color: "#0f172a",
              }}
            >
              {isMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </nav>

        {/* =========================
            MOBILE DRAWER (light + hero blue borders)
           ========================= */}
        {isMenuOpen && (
          <div className="lg:hidden">
            <div className="mx-auto max-w-7xl px-4 pb-4">
              <div
                className="mt-2 overflow-hidden rounded-2xl"
                style={{
                  background: "rgba(248,250,252,0.98)",
                  border: "1px solid rgba(26,90,230,0.16)",
                  boxShadow: "0 18px 45px rgba(2,6,23,0.16)",
                  backdropFilter: "blur(10px)",
                }}
              >
                <div className="p-3">
                  {navItems.map((item) => {
                    const hasSub = item.submenu?.length > 0;
                    const open = openMobileGroup === item.label;

                    if (!hasSub) {
                      return (
                        <Link
                          key={item.label}
                          href={item.href}
                          onClick={() => {
                            setIsMenuOpen(false);
                            setOpenMobileGroup(null);
                          }}
                          className="flex items-center justify-between rounded-xl px-3 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-100"
                        >
                          <span>{item.label}</span>
                        </Link>
                      );
                    }

                    return (
                      <div key={item.label} className="mb-1">
                        <button
                          type="button"
                          onClick={() => toggleMobileGroup(item.label)}
                          className="w-full flex items-center justify-between rounded-xl px-3 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-100"
                        >
                          <span>{item.label}</span>
                          <ChevronDown
                            className={cx(
                              "h-4 w-4 transition",
                              open && "rotate-180",
                            )}
                            style={{ color: "var(--ac-blue)" }}
                          />
                        </button>

                        {open && (
                          <div className="px-2 pb-2">
                            <div
                              className="rounded-xl p-2"
                              style={{
                                background: "rgba(15,23,42,0.03)",
                                border: "1px solid rgba(26,90,230,0.12)",
                              }}
                            >
                              {item.submenu.map((sub) => (
                                <Link
                                  key={sub.label}
                                  href={sub.href}
                                  onClick={() => {
                                    setIsMenuOpen(false);
                                    setOpenMobileGroup(null);
                                  }}
                                  className="block rounded-lg px-3 py-2 text-sm text-slate-700 transition hover:bg-white"
                                  onMouseEnter={(e) =>
                                    (e.currentTarget.style.color =
                                      "var(--ac-blue)")
                                  }
                                  onMouseLeave={(e) =>
                                    (e.currentTarget.style.color = "")
                                  }
                                >
                                  {sub.label}
                                </Link>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Mobile bottom row */}
                  <div
                    className="mt-3 rounded-xl p-3"
                    style={{
                      background: "rgba(15,23,42,0.02)",
                      border: "1px solid rgba(26,90,230,0.12)",
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-sm">
                        <div className="text-slate-600">Beratung & Verkauf</div>
                        <a
                          className="font-extrabold"
                          style={{ color: "var(--ac-blue)" }}
                          href="tel:+49176 32445082"
                        >
                          0176 32445082
                        </a>
                      </div>

                      <Link
                        href="/kontakt"
                        onClick={() => {
                          setIsMenuOpen(false);
                          setOpenMobileGroup(null);
                        }}
                        className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white transition"
                        style={{
                          background:
                            "linear-gradient(135deg, var(--ac-blue) 0%, #0d1f4d 100%)",
                          boxShadow:
                            "0 14px 30px rgba(0,0,0,0.14), 0 8px 18px rgba(26,90,230,0.16)",
                        }}
                      >
                        <Calendar className="h-4 w-4" />
                        Termin
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Background overlay */}
              <div
                className="fixed inset-0 -z-10 bg-black/20"
                onClick={() => {
                  setIsMenuOpen(false);
                  setOpenMobileGroup(null);
                }}
              />
            </div>
          </div>
        )}
      </header>
    </>
  );
}
