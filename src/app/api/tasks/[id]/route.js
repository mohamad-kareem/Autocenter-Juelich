export const runtime = "nodejs";

import mongoose from "mongoose";
import dbConnect from "@/lib/mongodb";
import Task from "@/app/models/Task";
import { CATEGORIES, DAY_RE, getSessionUser, serializeTask } from "@/lib/tasks";

const isValidId = (id) => mongoose.Types.ObjectId.isValid(String(id || ""));

/** PATCH /api/tasks/:id – { title?, day?, status?, assignee?, sort? } */
export async function PATCH(req, { params }) {
  const user = await getSessionUser();
  if (!user?.userId) return Response.json({ error: "Nicht angemeldet." }, { status: 401 });

  const { id } = await params;
  if (!isValidId(id)) return Response.json({ error: "Ungültige ID." }, { status: 400 });

  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Ungültige Anfrage." }, { status: 400 });
  }

  const update = {};
  if (typeof body?.title === "string" && body.title.trim()) update.title = body.title.trim().slice(0, 200);
  if (typeof body?.assignee === "string") update.assignee = body.assignee.trim().slice(0, 80);
  if (typeof body?.day === "string" && DAY_RE.test(body.day)) update.day = body.day;
  if (typeof body?.sort === "number" && Number.isFinite(body.sort)) update.sort = body.sort;
  if (CATEGORIES.includes(body?.category)) update.category = body.category;
  if (body?.status === "open" || body?.status === "done") {
    update.status = body.status;
    update.doneAt = body.status === "done" ? new Date() : null;
  }

  if (!Object.keys(update).length) {
    return Response.json({ error: "Keine Änderungen übergeben." }, { status: 400 });
  }

  try {
    await dbConnect();
    const doc = await Task.findByIdAndUpdate(id, update, { new: true }).lean();
    if (!doc) return Response.json({ error: "Aufgabe nicht gefunden." }, { status: 404 });
    return Response.json({ task: serializeTask(doc) });
  } catch (err) {
    console.error("TASK_PATCH_ERROR:", err?.message || err);
    return Response.json({ error: "Änderung konnte nicht gespeichert werden." }, { status: 500 });
  }
}

/** DELETE /api/tasks/:id */
export async function DELETE(req, { params }) {
  const user = await getSessionUser();
  if (!user?.userId) return Response.json({ error: "Nicht angemeldet." }, { status: 401 });

  const { id } = await params;
  if (!isValidId(id)) return Response.json({ error: "Ungültige ID." }, { status: 400 });

  try {
    await dbConnect();
    const doc = await Task.findByIdAndDelete(id).lean();
    if (!doc) return Response.json({ error: "Aufgabe nicht gefunden." }, { status: 404 });
    return Response.json({ ok: true });
  } catch (err) {
    console.error("TASK_DELETE_ERROR:", err?.message || err);
    return Response.json({ error: "Aufgabe konnte nicht gelöscht werden." }, { status: 500 });
  }
}
