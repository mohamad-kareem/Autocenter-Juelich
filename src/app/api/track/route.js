export const runtime = "nodejs";

import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Visit from "@/app/models/Visit";
import { BOT_RE, describeAgent, visitorId } from "@/lib/monitor";
import { isHiddenEmail } from "@/lib/hiddenUsers";

const SKIP = ["/systemlog", "/api", "/_next"];
const KEEP = 100; // only the newest 100 page views are stored

/** POST /api/track – { path, ref } – records one page view. Always answers 204. */
export async function POST(req) {
  const done = new Response(null, { status: 204 });

  const ua = req.headers.get("user-agent") || "";
  if (!ua || BOT_RE.test(ua)) return done;

  let body;
  try {
    body = await req.json();
  } catch {
    return done;
  }

  const path = String(body?.path || "").slice(0, 300);
  if (!path.startsWith("/") || SKIP.some((p) => path.startsWith(p))) return done;

  // Only keep the host of external referrers
  let referrer = "";
  try {
    if (body?.ref) {
      const ref = new URL(String(body.ref));
      const own = new URL(req.url).host;
      if (ref.host && ref.host !== own) referrer = ref.host.replace(/^www\./, "");
    }
  } catch {
    /* ignore malformed referrer */
  }

  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const user = token ? await verifyToken(token) : null;
  if (user && isHiddenEmail(user.email)) return done;

  const ip = (req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "").split(",")[0].trim();

  try {
    await dbConnect();
    await Visit.create({
      path,
      role: user?.role === "admin" ? "admin" : user?.userId ? "user" : "guest",
      name: user?.name || "",
      visitor: visitorId(ip, ua),
      referrer,
      ...describeAgent(ua),
    });

    // Drop everything older than the newest KEEP entries
    const oldestKept = await Visit.findOne({}).sort({ createdAt: -1 }).skip(KEEP - 1).select("createdAt").lean();
    if (oldestKept?.createdAt) {
      await Visit.deleteMany({ createdAt: { $lt: oldestKept.createdAt } });
    }
  } catch (err) {
    console.error("TRACK_ERROR:", err?.message || err);
  }

  return done;
}
