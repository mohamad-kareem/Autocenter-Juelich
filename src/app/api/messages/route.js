export const runtime = "nodejs";

import dbConnect from "@/lib/mongodb";
import ContactMessage, { MESSAGE_STATUS } from "@/app/models/ContactMessage";
import { getAdminUser, serializeMessage } from "@/lib/messages";

const PAGE_SIZE = 25;

/** GET /api/messages?status=new&q=müller&skip=0 */
export async function GET(req) {
  const admin = await getAdminUser();
  if (!admin) {
    return Response.json({ error: "Nicht berechtigt." }, { status: 401 });
  }

  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "";
    const q = (searchParams.get("q") || "").trim().slice(0, 80);
    const skip = Math.max(0, Number(searchParams.get("skip") || 0));

    const filter = {};
    if (MESSAGE_STATUS.includes(status)) filter.status = status;
    if (status === "unread") {
      delete filter.status;
      filter.read = false;
    }
    if (q) {
      const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [{ name: rx }, { email: rx }, { subject: rx }, { message: rx }, { vehicle: rx }, { phone: rx }];
    }

    const [docs, total, counts] = await Promise.all([
      ContactMessage.find(filter).sort({ createdAt: -1 }).skip(skip).limit(PAGE_SIZE).lean(),
      ContactMessage.countDocuments(filter),
      buildCounts(),
    ]);

    return Response.json({
      messages: docs.map(serializeMessage),
      total,
      skip,
      pageSize: PAGE_SIZE,
      counts,
    });
  } catch (err) {
    console.error("MESSAGES_GET_ERROR:", err?.message || err);
    return Response.json({ error: "Anfragen konnten nicht geladen werden." }, { status: 500 });
  }
}

async function buildCounts() {
  const [grouped, unread, all] = await Promise.all([
    ContactMessage.aggregate([{ $group: { _id: "$status", n: { $sum: 1 } } }]),
    ContactMessage.countDocuments({ read: false }),
    ContactMessage.countDocuments({}),
  ]);

  const counts = { all, unread, new: 0, in_progress: 0, done: 0, archived: 0 };
  for (const row of grouped) {
    if (row?._id in counts) counts[row._id] = row.n;
  }
  return counts;
}
