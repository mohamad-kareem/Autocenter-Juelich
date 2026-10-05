import dbConnect from "@/lib/mongodb";
import ContactMessage from "@/app/models/ContactMessage";
import TimeRecord from "@/app/models/TimeRecord";
import Task from "@/app/models/Task";
import { getCarsSafe } from "@/lib/mobilede";

/** Never let a slow or offline database block the dashboard. */
async function withTimeout(factory, fallback, ms = 2500) {
  const timeout = new Promise((resolve) => setTimeout(() => resolve(fallback), ms));
  const work = (async () => factory())().catch((err) => {
    console.error("DASHBOARD_DATA_ERROR:", err?.message || err);
    return fallback;
  });
  return Promise.race([work, timeout]);
}

const DAY_SHORT = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];

/** Monday 00:00 of the week that contains `date`, plus the seven day buckets. */
export function getWeek(date = new Date()) {
  const start = new Date(date);
  const weekday = (start.getDay() + 6) % 7; // 0 = Monday
  start.setDate(start.getDate() - weekday);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(end.getDate() + 7);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return {
      key: d.toISOString().slice(0, 10),
      short: DAY_SHORT[d.getDay()],
      dayNumber: d.getDate(),
      isToday: d.getTime() === today.getTime(),
      isFuture: d.getTime() > today.getTime(),
      minutes: 0,
    };
  });

  return { start, end, days };
}

export function formatHours(minutes = 0) {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  if (!h && !m) return "–";
  return `${h}:${String(m).padStart(2, "0")} h`;
}

/** Contact-form counters for the admin overview. */
async function getMessageStats() {
  return withTimeout(
    async () => {
      await dbConnect();
      const since = new Date();
      since.setDate(since.getDate() - 7);

      const [unread, open, week, latest] = await Promise.all([
        ContactMessage.countDocuments({ read: false }).maxTimeMS(2000),
        ContactMessage.countDocuments({ status: { $in: ["new", "in_progress"] } }).maxTimeMS(2000),
        ContactMessage.countDocuments({ createdAt: { $gte: since } }).maxTimeMS(2000),
        ContactMessage.find({})
          .select("name subject status read createdAt vehicle")
          .sort({ createdAt: -1 })
          .limit(5)
          .maxTimeMS(2000)
          .lean(),
      ]);

      return {
        unread,
        open,
        week,
        latest: latest.map((m) => ({
          _id: String(m._id),
          name: m.name || "Unbekannt",
          subject: m.subject || "Anfrage",
          status: m.status || "new",
          read: Boolean(m.read),
          createdAt: m.createdAt ? new Date(m.createdAt).toISOString() : null,
        })),
      };
    },
    { unread: 0, open: 0, week: 0, latest: [] },
  );
}

/**
 * Working time of the current week.
 * Admins see the whole team, everyone else only their own hours.
 */
async function getWeekTime({ userId, isAdmin }) {
  const week = getWeek();

  return withTimeout(
    async () => {
      await dbConnect();

      const filter = { timestamp: { $gte: week.start, $lt: week.end } };
      if (!isAdmin) filter.userId = userId;

      const records = await TimeRecord.find(filter)
        .select("userId userName action timestamp")
        .sort({ timestamp: 1 })
        .maxTimeMS(2000)
        .lean();

      const days = week.days.map((d) => ({ ...d }));
      const byUser = new Map();
      const openIn = new Map();

      for (const r of records) {
        const uid = String(r.userId);
        if (!byUser.has(uid)) byUser.set(uid, { userId: uid, name: r.userName || "Unbekannt", minutes: 0 });

        if (r.action === "in") {
          openIn.set(uid, new Date(r.timestamp));
          continue;
        }
        const start = openIn.get(uid);
        if (!start) continue;

        const minutes = Math.max(0, Math.floor((new Date(r.timestamp) - start) / 60000));
        byUser.get(uid).minutes += minutes;

        const key = new Date(start).toISOString().slice(0, 10);
        const day = days.find((d) => d.key === key);
        if (day) day.minutes += minutes;

        openIn.delete(uid);
      }

      // Everyone still clocked in right now
      const onDuty = [...openIn.entries()].map(([uid, since]) => ({
        userId: uid,
        name: byUser.get(uid)?.name || "Unbekannt",
        since: since.toISOString(),
      }));

      return {
        days,
        totalMinutes: days.reduce((sum, d) => sum + d.minutes, 0),
        people: [...byUser.values()].sort((a, b) => b.minutes - a.minutes),
        onDuty,
      };
    },
    { days: week.days, totalMinutes: 0, people: [], onDuty: [] },
  );
}

/** Open tasks from the Wochenplan: today and the rest of this week. */
async function getTaskStats() {
  const berlinDay = (d) => new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Berlin" }).format(d);
  const { start, end } = getWeek();
  const lastDay = new Date(end);
  lastDay.setDate(lastDay.getDate() - 1);

  return withTimeout(
    async () => {
      await dbConnect();
      const [today, week] = await Promise.all([
        Task.countDocuments({ day: berlinDay(new Date()), status: "open" }).maxTimeMS(2000),
        Task.countDocuments({ day: { $gte: berlinDay(start), $lte: berlinDay(lastDay) }, status: "open" }).maxTimeMS(2000),
      ]);
      return { today, week };
    },
    { today: 0, week: 0 },
  );
}

/** Vehicles currently online on mobile.de (same cached source as the website). */
async function getCarCount() {
  return withTimeout(async () => (await getCarsSafe()).length, null, 4000);
}

/** Everything the dashboard overview needs, in one call. */
export async function getDashboardData({ userId, isAdmin }) {
  const [messages, week, tasks, cars] = await Promise.all([
    getMessageStats(),
    getWeekTime({ userId, isAdmin }),
    getTaskStats(),
    isAdmin ? getCarCount() : Promise.resolve(null),
  ]);

  return { messages, week, tasks, cars };
}
