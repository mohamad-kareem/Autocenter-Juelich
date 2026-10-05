import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowRight, CalendarCheck, Car, CircleDot, Clock, Mail } from "lucide-react";
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

const TONES = {
  blue: { bar: "bg-blue-500", icon: "bg-blue-50 text-blue-600", pill: "bg-blue-50 text-blue-700" },
  violet: { bar: "bg-violet-500", icon: "bg-violet-50 text-violet-600", pill: "bg-violet-50 text-violet-700" },
  emerald: { bar: "bg-emerald-500", icon: "bg-emerald-50 text-emerald-600", pill: "bg-emerald-50 text-emerald-700" },
  amber: { bar: "bg-amber-500", icon: "bg-amber-50 text-amber-600", pill: "bg-emerald-50 text-emerald-700" },
};

const timeFmt = new Intl.DateTimeFormat("de-DE", { timeZone: "Europe/Berlin", hour: "2-digit", minute: "2-digit" });
const dateFmt = new Intl.DateTimeFormat("de-DE", { timeZone: "Europe/Berlin", day: "2-digit", month: "2-digit" });

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const user = token ? await verifyToken(token) : null;
  if (!user) redirect("/login");

  const isAdmin = user.role === "admin";
  const { messages, week, tasks, cars } = await getDashboardData({ userId: user.userId, isAdmin });

  const hour = Number(
    new Intl.DateTimeFormat("de-DE", { timeZone: "Europe/Berlin", hour: "2-digit", hourCycle: "h23" }).format(new Date()),
  );
  const greeting = hour < 11 ? "Guten Morgen" : hour < 18 ? "Guten Tag" : "Guten Abend";
  const today = new Intl.DateTimeFormat("de-DE", { timeZone: "Europe/Berlin", dateStyle: "full" }).format(new Date());

  const onDutyNames = week.onDuty.map((d) => String(d.name || "").split(" ")[0]).filter(Boolean);

  const tasksTile = {
    label: "Aufgaben heute",
    value: tasks.today,
    hint: `${tasks.week} diese Woche`,
    alert: tasks.today > 0,
    href: "/dashboard/wochenplan",
    icon: CalendarCheck,
    tone: "violet",
  };

  const stats = isAdmin
    ? [
        {
          label: "Neue Anfragen",
          value: messages?.unread ?? 0,
          hint: `${messages?.open ?? 0} offen`,
          alert: (messages?.unread ?? 0) > 0,
          href: "/dashboard/anfragen",
          icon: Mail,
          tone: "blue",
        },
        tasksTile,
        {
          label: "Fahrzeuge online",
          value: cars ?? "–",
          hint: "mobile.de",
          href: "/fahrzeuge",
          icon: Car,
          tone: "emerald",
        },
        {
          label: "Im Dienst",
          value: week.onDuty.length,
          hint: onDutyNames.length ? onDutyNames.join(", ") : "niemand",
          title: week.onDuty.map((d) => `${d.name} seit ${timeFmt.format(new Date(d.since))}`).join("\n"),
          live: week.onDuty.length > 0,
          href: "/dashboard/zeiterfassung",
          icon: CircleDot,
          tone: "amber",
        },
      ]
    : [
        tasksTile,
        {
          label: "Diese Woche",
          value: formatHours(week.totalMinutes),
          hint: "Arbeitszeit",
          href: "/dashboard/stempeluhr",
          icon: Clock,
          tone: "blue",
        },
        {
          label: "Status",
          value: week.onDuty.length ? "Im Dienst" : "Frei",
          hint: "Stempeluhr",
          live: week.onDuty.length > 0,
          href: "/dashboard/stempeluhr",
          icon: CircleDot,
          tone: "amber",
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

      <div className={cx("card grid divide-line overflow-hidden", isAdmin ? "grid-cols-2 lg:grid-cols-4 lg:divide-x" : "grid-cols-1 divide-y sm:grid-cols-3 sm:divide-x sm:divide-y-0")}>
        {stats.map(({ icon: Icon, ...s }, i) => {
          const tone = TONES[s.tone] || TONES.blue;
          const isZero = s.value === 0;
          return (
            <Link
              key={s.label}
              href={s.href}
              title={s.title || undefined}
              className={cx(
                "group relative flex items-center justify-between gap-3 px-4 py-3 transition hover:bg-canvas/60",
                isAdmin && i % 2 === 1 && "border-l border-line lg:border-l-0",
                isAdmin && i > 1 && "border-t border-line lg:border-t-0",
              )}
            >
              <span className={cx("absolute inset-y-3 left-0 w-[3px] rounded-r-full", tone.bar)} aria-hidden />
              <span className="min-w-0">
                <span className="block text-[10.5px] font-semibold uppercase tracking-wider text-muted">
                  {s.label}
                </span>
                <span className="mt-1 flex min-w-0 items-center gap-2">
                  <span
                    className={cx(
                      "text-[22px] font-bold leading-none tabular-nums",
                      isZero ? "text-ink/35" : "text-ink",
                    )}
                  >
                    {s.value}
                  </span>
                  {s.hint ? (
                    <span
                      className={cx(
                        "inline-flex min-w-0 items-center gap-1 truncate rounded-full px-1.5 py-0.5 text-[10.5px] font-medium",
                        s.alert || s.live ? tone.pill : "bg-canvas text-muted",
                      )}
                    >
                      {s.live ? <span className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-emerald-500" /> : null}
                      <span className="truncate">{s.hint}</span>
                    </span>
                  ) : null}
                </span>
              </span>
              <span
                className={cx(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition group-hover:scale-105",
                  tone.icon,
                )}
              >
                <Icon className="h-4 w-4" />
              </span>
            </Link>
          );
        })}
      </div>


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
