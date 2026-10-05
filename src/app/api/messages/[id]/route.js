export const runtime = "nodejs";

import mongoose from "mongoose";
import dbConnect from "@/lib/mongodb";
import ContactMessage, { MESSAGE_STATUS } from "@/app/models/ContactMessage";
import { getAdminUser, getStaffUser, serializeMessage } from "@/lib/messages";
import { isHiddenEmail } from "@/lib/hiddenUsers";

function isValidId(id) {
  return mongoose.Types.ObjectId.isValid(String(id || ""));
}

/** PATCH /api/messages/:id  { status?, read?, note? } */
export async function PATCH(req, { params }) {
  const admin = await getStaffUser();
  if (!admin) return Response.json({ error: "Nicht berechtigt." }, { status: 401 });

  const { id } = await params;
  if (!isValidId(id)) return Response.json({ error: "Ungültige ID." }, { status: 400 });

  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Ungültige Anfrage." }, { status: 400 });
  }

  const update = {};
  if (typeof body?.read === "boolean") update.read = body.read;
  if (typeof body?.note === "string") update.note = body.note.slice(0, 2000);
  if (typeof body?.status === "string") {
    if (!MESSAGE_STATUS.includes(body.status)) {
      return Response.json({ error: "Ungültiger Status." }, { status: 400 });
    }
    update.status = body.status;
    // test accounts change the status without leaving their name behind
    if (!isHiddenEmail(admin.email)) {
      update.handledBy = admin.name || admin.email || "Team";
      update.handledAt = new Date();
    }
    if (body.status !== "new") update.read = true;
  }

  if (!Object.keys(update).length) {
    return Response.json({ error: "Keine Änderungen übergeben." }, { status: 400 });
  }

  try {
    await dbConnect();
    const doc = await ContactMessage.findByIdAndUpdate(id, update, { new: true }).lean();
    if (!doc) return Response.json({ error: "Anfrage nicht gefunden." }, { status: 404 });
    return Response.json({ message: serializeMessage(doc) });
  } catch (err) {
    console.error("MESSAGES_PATCH_ERROR:", err?.message || err);
    return Response.json({ error: "Änderung konnte nicht gespeichert werden." }, { status: 500 });
  }
}

/** DELETE /api/messages/:id */
export async function DELETE(req, { params }) {
  const admin = await getAdminUser();
  if (!admin) return Response.json({ error: "Nur Administratoren können Anfragen löschen." }, { status: 403 });

  const { id } = await params;
  if (!isValidId(id)) return Response.json({ error: "Ungültige ID." }, { status: 400 });

  try {
    await dbConnect();
    const doc = await ContactMessage.findByIdAndDelete(id).lean();
    if (!doc) return Response.json({ error: "Anfrage nicht gefunden." }, { status: 404 });
    return Response.json({ ok: true });
  } catch (err) {
    console.error("MESSAGES_DELETE_ERROR:", err?.message || err);
    return Response.json({ error: "Anfrage konnte nicht gelöscht werden." }, { status: 500 });
  }
}
