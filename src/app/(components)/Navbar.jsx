"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, X, Phone, MapPin, Calendar } from "lucide-react";

const cx = (...classes) => classes.filter(Boolean).join(" ");

export default function Navbar() {
  const pathname = usePathname();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openMobileGroup, setOpenMobileGroup] = useState(null);

  const navRef = useRef(null);

  const shouldHideNavbar = pathname.startsWith("/dashboard");

  useEffect(() => {
    if (shouldHideNavbar) return;

    const handleMouseDown = (e) => {
      if (!navRef.current) return;
      if (navRef.current.contains(e.target)) return;

      setIsMenuOpen(false);
      setOpenMobileGroup(null);
    };

    document.addEventListener("mousedown", handleMouseDown);
    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
    };
  }, [shouldHideNavbar]);

  useEffect(() => {
    if (shouldHideNavbar) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsMenuOpen(false);
        setOpenMobileGroup(null);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [shouldHideNavbar]);

  useEffect(() => {
    if (shouldHideNavbar) {
      document.documentElement.style.overflow = "";
      return;
    }

    document.documentElement.style.overflow = isMenuOpen ? "hidden" : "";

    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [isMenuOpen, shouldHideNavbar]);

  useEffect(() => {
    if (shouldHideNavbar) return;

    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [shouldHideNavbar]);

  const navItems = useMemo(
    () => [
      {
        label: "Fahrzeuge",
        href: "/fahrzeuge",
        submenu: [
          {
            label: "Gebrauchtwagen",
            href: "/fahrzeuge?typ=gebrauchtwagen",
          },
        ],
      },
      {
        label: "Garantie",
        href: "/garantie",
      },
      {
        label: "Finanzierung",
        href: "/finanzierung",
      },
      {
        label: "Kontakt",
        href: "/kontakt",
        submenu: [],
      },
    ],
    [],
  );

  const toggleMobileGroup = (label) => {
    setOpenMobileGroup((current) => (current === label ? null : label));
  };

  if (shouldHideNavbar) {
    return null;
  }

  return (
    <>
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

              <span className="hidden text-white/60 md:inline">•</span>

              <span className="inline-flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <a
                  href="tel:+4924619163780"
                  className="font-semibold hover:underline"
                >
                  02461 9163780
                </a>
              </span>
            </div>

            <div className="flex items-center gap-2 text-white/90">
              <span className="hidden font-semibold lg:block">
                Nicht warten. Starten.
              </span>
            </div>
          </div>
        </div>
      </div>

      <header
        ref={navRef}
        className={cx(
          "sticky top-0 z-[9999] isolate transition-all duration-300",
          scrolled
            ? "backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.10)]"
            : "backdrop-blur-sm",
        )}
        style={{
          background: scrolled
            ? "rgba(241,245,255,0.92)"
            : "rgba(241,245,255,0.80)",
          borderBottom: scrolled
            ? "1px solid rgba(26,90,230,0.16)"
            : "1px solid rgba(15,23,42,0.08)",
        }}
      >
        <nav className="mx-auto max-w-7xl px-4">
          <div className="flex h-16 items-center justify-between">
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

            <div className="hidden items-center gap-1 lg:flex">
              {navItems.map((item) => {
                const hasSubmenu = item.submenu?.length > 0;

                return (
                  <div key={item.label} className="group relative">
                    <Link
                      href={item.href}
                      className={cx(
                        "inline-flex items-center gap-1 rounded-xl px-3 py-2 text-sm font-semibold transition",
                        "text-slate-700 hover:text-slate-900",
                      )}
                      style={{
                        background:
                          "linear-gradient(180deg, rgba(26,90,230,0.00), rgba(26,90,230,0.00))",
                      }}
                    >
                      <span>{item.label}</span>
                      {hasSubmenu && (
                        <ChevronDown className="h-4 w-4 transition group-hover:rotate-180" />
                      )}
                    </Link>

                    <div
                      className="absolute inset-x-2 -bottom-1 h-[2px] scale-x-0 opacity-0 transition group-hover:scale-x-100 group-hover:opacity-100"
                      style={{
                        background:
                          "linear-gradient(90deg, var(--ac-blue), var(--ac-blue-light))",
                      }}
                    />

                    {hasSubmenu && (
                      <div className="pointer-events-none absolute left-0 top-full pt-2 opacity-0 transition group-hover:pointer-events-auto group-hover:opacity-100">
                        <div
                          className="min-w-[240px] rounded-2xl p-2 shadow-[0_18px_45px_rgba(2,6,23,0.18)]"
                          style={{
                            background: "rgba(248,250,252,0.98)",
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
                                WebkitTapHighlightColor: "transparent",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.color = "var(--ac-blue)";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.color = "";
                              }}
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

            <div className="hidden items-center gap-4 lg:flex">
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

            <button
              type="button"
              aria-label="Menü öffnen"
              onClick={() => setIsMenuOpen((prev) => !prev)}
              className="inline-flex items-center justify-center rounded-xl px-3 py-2 transition lg:hidden"
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
                    const hasSubmenu = item.submenu?.length > 0;
                    const isOpen = openMobileGroup === item.label;

                    if (!hasSubmenu) {
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
                          className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-100"
                        >
                          <span>{item.label}</span>
                          <ChevronDown
                            className={cx(
                              "h-4 w-4 transition",
                              isOpen && "rotate-180",
                            )}
                            style={{ color: "var(--ac-blue)" }}
                          />
                        </button>

                        {isOpen && (
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
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.color =
                                      "var(--ac-blue)";
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.color = "";
                                  }}
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
                          href="tel:+4924619163780"
                          className="font-extrabold"
                          style={{ color: "var(--ac-blue)" }}
                        >
                          02461 9163780
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
