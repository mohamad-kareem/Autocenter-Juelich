"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarCheck,
  ChevronsLeft,
  Clock,
  ExternalLink,
  Image as ImageIcon,
  Inbox,
  LayoutDashboard,
  ListChecks,
  Menu,
  UserCog,
  UserPlus,
  X,
} from "lucide-react";
import { initialsOf } from "./UserMenu";

const cx = (...c) => c.filter(Boolean).join(" ");

const GROUPS = [
  {
    items: [
      { label: "Übersicht", href: "/dashboard", icon: LayoutDashboard, color: "text-brand-600", roles: ["user", "admin"], exact: true },
    ],
  },
  {
    title: "Kunden",
    items: [
      { label: "Anfragen", href: "/dashboard/anfragen", icon: Inbox, color: "text-emerald-600", roles: ["admin"], badgeKey: "unread" },
      { label: "Wochenplan", href: "/dashboard/wochenplan", icon: CalendarCheck, color: "text-violet-600", roles: ["user", "admin"] },
    ],
  },
  {
    title: "Website",
    items: [
      { label: "Startseiten-Bilder", href: "/dashboard/startseite", icon: ImageIcon, color: "text-sky-600", roles: ["admin"] },
    ],
  },
  {
    title: "Team",
    items: [
      { label: "Stempeluhr", href: "/dashboard/stempeluhr", icon: Clock, color: "text-amber-600", roles: ["user", "admin"] },
      { label: "Zeiterfassung", href: "/dashboard/zeiterfassung", icon: ListChecks, color: "text-orange-600", roles: ["admin"] },
      { label: "Benutzer", href: "/dashboard/register", icon: UserPlus, color: "text-rose-600", roles: ["admin"] },
    ],
  },
  {
    title: "Konto",
    items: [
      { label: "Mein Profil", href: "/dashboard/profil", icon: UserCog, color: "text-slate-500", roles: ["user", "admin"] },
      { label: "Zur Website", href: "/", icon: ExternalLink, color: "text-slate-500", roles: ["user", "admin"] },
    ],
  },
];

export default function DashboardNav({ role = "user", badges = {}, user }) {
  const pathname = usePathname() || "";
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    const t = setTimeout(() => {
      try {
        setCollapsed(localStorage.getItem("ac-sidebar") === "collapsed");
      } catch {
        /* ignore */
      }
    }, 0);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.sidebar = collapsed ? "collapsed" : "open";
    return () => {
      delete document.documentElement.dataset.sidebar;
    };
  }, [collapsed]);

  const toggleCollapsed = () => {
    setCollapsed((v) => {
      try {
        localStorage.setItem("ac-sidebar", v ? "open" : "collapsed");
      } catch {
        /* ignore */
      }
      return !v;
    });
  };

  const panel = (mini) => (
    <>
      {/* Brand row – same height as the top bar so both hairlines line up */}
      <div className={cx("flex h-14 shrink-0 items-center border-b border-line", mini ? "justify-center" : "gap-2 pl-4 pr-2")}>
        {!mini ? (
          <Link href="/dashboard" className="min-w-0 truncate font-display text-[19px] leading-none text-ink">
            Autocenter Jülich
          </Link>
        ) : null}
        <button
          type="button"
          onClick={toggleCollapsed}
          aria-label={mini ? "Menü ausklappen" : "Menü einklappen"}
          title={mini ? "Menü ausklappen" : "Menü einklappen"}
          className={cx(
            "hidden h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted transition hover:bg-canvas hover:text-ink lg:flex",
            !mini && "ml-auto",
          )}
        >
          <ChevronsLeft className={cx("h-4 w-4 transition", mini && "rotate-180")} />
        </button>
      </div>

      <div className="scroll-slim flex-1 overflow-y-auto px-2 py-3">
        {GROUPS.map((group, gi) => {
          const items = group.items.filter((i) => i.roles.includes(role));
          if (!items.length) return null;
          return (
            <div key={group.title || gi} className={cx(gi > 0 && "mt-4")}>
              {group.title && !mini ? (
                <p className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
                  {group.title}
                </p>
              ) : null}
              {group.title && mini ? <div className="mx-3 mb-2 border-t border-line" /> : null}

              <div className="space-y-0.5">
                {items.map(({ icon: Icon, ...item }) => {
                  const active = item.exact
                    ? pathname === item.href
                    : item.href !== "/" && pathname.startsWith(item.href);
                  const badge = item.badgeKey ? badges[item.badgeKey] : 0;
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      title={mini ? item.label : undefined}
                      className={cx(
                        "flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition",
                        mini && "justify-center px-0",
                        active ? "bg-brand-50 text-brand-700" : "text-body hover:bg-canvas hover:text-ink",
                      )}
                    >
                      <Icon className={cx("h-[18px] w-[18px] shrink-0", active ? "text-brand-600" : item.color)} />
                      {!mini ? <span className="flex-1 truncate">{item.label}</span> : null}
                      {badge && !mini ? (
                        <span className="rounded-full bg-brand-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                          {badge}
                        </span>
                      ) : null}
                      {badge && mini ? <span className="absolute h-1.5 w-1.5 translate-x-3 -translate-y-2 rounded-full bg-brand-600" /> : null}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {user ? (
        <div className={cx("flex items-center gap-2.5 border-t border-line px-4 py-3", mini && "justify-center px-2")}>
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-accent-500 text-[11px] font-bold text-white">
            {initialsOf(user.name) || "?"}
          </span>
          {!mini ? (
            <span className="min-w-0">
              <span className="block truncate text-[13px] font-medium text-ink">{user.name}</span>
              <span className="block text-[11px] text-muted">
                {user.role === "admin" ? "Administrator" : "Mitarbeiter"}
              </span>
            </span>
          ) : null}
        </div>
      ) : null}
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cx(
          "fixed inset-y-0 left-0 z-40 hidden flex-col border-r border-line bg-white transition-[width] duration-200 lg:flex",
          collapsed ? "w-[68px]" : "w-60",
        )}
      >
        {panel(collapsed)}
      </aside>

      {/* Mobile trigger */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Menü öffnen"
        className="flex h-9 w-9 items-center justify-center rounded-lg text-body transition hover:bg-canvas lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile drawer */}
      {open ? (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <button
            type="button"
            aria-label="Menü schließen"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-navy-950/40 backdrop-blur-sm"
          />
          <div className="absolute inset-y-0 left-0 flex w-64 flex-col bg-white">
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Menü schließen"
              className="absolute right-2 top-3 flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-canvas hover:text-ink"
            >
              <X className="h-4 w-4" />
            </button>
            {panel(false)}
          </div>
        </div>
      ) : null}
    </>
  );
}
