export const runtime = "nodejs";

import dbConnect from "@/lib/mongodb";
import Visit from "@/app/models/Visit";
import { isMonitorSession } from "@/lib/monitor";

/** GET /api/monitor/visits?role=all|guest|user|admin */
export async function GET(req) {
  if (!(await isMonitorSession())) {
    return Response.json({ error: "Nicht angemeldet." }, { status: 401 });
  }

  const role = new URL(req.url).searchParams.get("role");
  const filter = ["guest", "user", "admin"].includes(role) ? { role } : {};

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);

  try {
    await dbConnect();
    const [rows, todayViews, todayVisitors, liveVisitors, todayStaff] = await Promise.all([
      Visit.find(filter).sort({ createdAt: -1 }).limit(100).maxTimeMS(3000).lean(),
      Visit.countDocuments({ createdAt: { $gte: startOfDay } }).maxTimeMS(3000),
      Visit.distinct("visitor", { createdAt: { $gte: startOfDay } }).maxTimeMS(3000),
      Visit.distinct("visitor", { createdAt: { $gte: fiveMinAgo } }).maxTimeMS(3000),
      Visit.distinct("name", { createdAt: { $gte: startOfDay }, role: { $ne: "guest" } }).maxTimeMS(3000),
    ]);

    return Response.json({
      stats: {
        todayViews,
        todayVisitors: todayVisitors.length,
        live: liveVisitors.length,
        staffToday: todayStaff.filter(Boolean),
      },
      visits: rows.map((v) => ({
        _id: String(v._id),
        at: v.createdAt,
        path: v.path,
        role: v.role,
        name: v.name,
        visitor: v.visitor,
        device: v.device,
        browser: v.browser,
        os: v.os,
        referrer: v.referrer,
      })),
    });
  } catch (err) {
    console.error("MONITOR_LIST_ERROR:", err?.message || err);
    return Response.json({ error: "Daten konnten nicht geladen werden." }, { status: 500 });
  }
}
