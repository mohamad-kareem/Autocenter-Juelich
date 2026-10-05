export const runtime = "nodejs";

import dbConnect from "@/lib/mongodb";
import Task from "@/app/models/Task";
import { DAY_RE, getSessionUser, readCategory, serializeTask } from "@/lib/tasks";

/** GET /api/tasks?from=YYYY-MM-DD&to=YYYY-MM-DD */
export async function GET(req) {
  const user = await getSessionUser();
  if (!user?.userId) return Response.json({ error: "Nicht angemeldet." }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const filter = {};
  if (DAY_RE.test(from || "") && DAY_RE.test(to || "")) filter.day = { $gte: from, $lte: to };

  try {
    await dbConnect();
    const docs = await Task.find(filter).sort({ day: 1, sort: 1, createdAt: 1 }).maxTimeMS(2500).lean();
    return Response.json({ tasks: docs.map(serializeTask) });
  } catch (err) {
    console.error("TASKS_LIST_ERROR:", err?.message || err);
    return Response.json({ error: "Aufgaben konnten nicht geladen werden." }, { status: 500 });
  }
}

/** POST /api/tasks – { title, day, assignee? } */
export async function POST(req) {
  const user = await getSessionUser();
  if (!user?.userId) return Response.json({ error: "Nicht angemeldet." }, { status: 401 });

  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Ungültige Anfrage." }, { status: 400 });
  }

  const title = String(body?.title || "").trim().slice(0, 200);
  const day = String(body?.day || "");
  const assignee = String(body?.assignee || "").trim().slice(0, 80);
  const category = readCategory(body?.category);

  if (!title) return Response.json({ error: "Bitte einen Titel angeben." }, { status: 400 });
  if (!DAY_RE.test(day)) return Response.json({ error: "Ungültiges Datum." }, { status: 400 });

  try {
    await dbConnect();
    const last = await Task.findOne({ day }).sort({ sort: -1 }).select("sort").lean();
    const doc = await Task.create({
      title,
      day,
      assignee,
      category,
      sort: (last?.sort ?? -1) + 1,
      createdBy: user.name || user.email || "Team",
    });
    return Response.json({ task: serializeTask(doc.toObject()) }, { status: 201 });
  } catch (err) {
    console.error("TASK_CREATE_ERROR:", err?.message || err);
    return Response.json({ error: "Aufgabe konnte nicht gespeichert werden." }, { status: 500 });
  }
}
