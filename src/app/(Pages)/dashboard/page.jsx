import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowRight, CircleDot, Clock, Inbox, ListChecks, Mail } from "lucide-react";
import { verifyToken } from "@/lib/auth";
import { getDashboardData, formatHours } from "@/lib/dashboard";
import WeekTasks from "@/app/(components)/WeekTasks";

const cx = (...c) => c.filter(Boolean).join(" ");

const STATUS_LABEL = { new: "Neu", in_progress: "In Arbeit", done: "Erledigt", archived: "Archiv" };
const STATUS_STYLE = {
  new: "bg-brand-50 text-brand-700",
  in_progress: "bg-amber-50 text-amber-700",
  done: "bg-emerald-50 text-emerald-700",
  archived: "bg-slate-100 text-slate-600",
};

const timeFmt = new Intl.DateTimeFormat("de-DE", { timeZone: "Europe/Berlin", hour: "2-digit", minute: "2-digit" });
const dateFmt = new Intl.DateTimeFormat("de-DE", { timeZone: "Europe/Berlin", day: "2-digit", month: "2-digit" });

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const user = token ? await verifyToken(token) : null;
  if (!user) redirect("/login");

  const isAdmin = user.role === "admin";
  const { messages, week } = await getDashboardData({ userId: user.userId, isAdmin });

  const hour = Number(
    new Intl.DateTimeFormat("de-DE", { timeZone: "Europe/Berlin", hour: "2-digit", hourCycle: "h23" }).format(new Date()),
  );
  const greeting = hour < 11 ? "Guten Morgen" : hour < 18 ? "Guten Tag" : "Guten Abend";
  const today = new Intl.DateTimeFormat("de-DE", { timeZone: "Europe/Berlin", dateStyle: "full" }).format(new Date());

  const stats = isAdmin
    ? [
        { label: "Neue Anfragen", value: messages?.unread ?? 0, hint: "ungelesen", href: "/dashboard/anfragen", icon: Mail },
        { label: "Offene Vorgänge", value: messages?.open ?? 0, hint: "neu oder in Arbeit", href: "/dashboard/anfragen", icon: Inbox },
        { label: "Anfragen (7 Tage)", value: messages?.week ?? 0, hint: "eingegangen", href: "/dashboard/anfragen", icon: ListChecks },
        { label: "Im Dienst", value: week.onDuty.length, hint: "gerade eingestempelt", href: "/dashboard/zeiterfassung", icon: CircleDot },
      ]
    : [
        { label: "Diese Woche", value: formatHours(week.totalMinutes), hint: "erfasste Arbeitszeit", href: "/dashboard/stempeluhr", icon: Clock },
        {
          label: "Status",
          value: week.onDuty.length ? "Eingestempelt" : "Ausgestempelt",
          hint: "Stempeluhr",
          href: "/dashboard/stempeluhr",
          icon: CircleDot,
        },
      ];

  return (
    <div className="mx-auto max-w-[1600px] space-y-4">
      {/* Greeting + compact KPI strip */}
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-1">
        <h1 className="font-display text-[26px] leading-tight text-ink">
          {greeting}, {String(user.name || "").split(" ")[0]}
        </h1>
        <p className="text-[12px] text-muted">{today}</p>
      </div>

      <div className={cx("card grid divide-line overflow-hidden", isAdmin ? "grid-cols-2 lg:grid-cols-4 lg:divide-x" : "grid-cols-2 divide-x")}>
        {stats.map(({ icon: Icon, ...s }, i) => (
          <Link
            key={s.label}
            href={s.href}
            className={cx(
              "group flex items-center gap-3 px-4 py-3 transition hover:bg-canvas/60",
              isAdmin && i % 2 === 1 && "border-l border-line lg:border-l-0",
              isAdmin && i > 1 && "border-t border-line lg:border-t-0",
            )}
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 transition group-hover:bg-brand-100">
              <Icon className="h-4 w-4" />
            </span>
            <span className="min-w-0">
              <span className="block text-lg font-bold leading-tight text-ink">{s.value}</span>
              <span className="block truncate text-[11px] text-muted">{s.label}</span>
            </span>
          </Link>
        ))}
      </div>

      {week.onDuty.length ? (
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-[12px] text-emerald-800">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Im Dienst: {week.onDuty.map((d) => `${d.name} seit ${timeFmt.format(new Date(d.since))}`).join(" · ")}
        </p>
      ) : null}

      <div id="wochenplan" className="scroll-mt-20">
        <WeekTasks />
      </div>

      {isAdmin ? (
        <section className="card p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-ink">Letzte Anfragen</h2>
            <Link
              href="/dashboard/anfragen"
              className="inline-flex items-center gap-1 text-[13px] font-medium text-brand-600 hover:text-brand-700"
            >
              Alle Anfragen
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {messages?.latest?.length ? (
            <ul className="mt-2 divide-y divide-line">
              {messages.latest.map((m) => (
                <li key={m._id}>
                  <Link href="/dashboard/anfragen" className="flex items-center gap-3 py-2.5 transition hover:opacity-80">
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1.5 text-[13px] font-medium text-ink">
                        {!m.read ? <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-600" /> : null}
                        <span className="truncate">{m.name}</span>
                      </span>
                      <span className="mt-0.5 block truncate text-xs text-muted">{m.subject}</span>
                    </span>
                    <span
                      className={cx(
                        "shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold",
                        STATUS_STYLE[m.status],
                      )}
                    >
                      {STATUS_LABEL[m.status] || m.status}
                    </span>
                    <span className="w-12 shrink-0 text-right text-[11px] text-muted">
                      {m.createdAt ? dateFmt.format(new Date(m.createdAt)) : ""}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-[13px] text-muted">Noch keine Anfragen.</p>
          )}
        </section>
      ) : null}
    </div>
  );
}
