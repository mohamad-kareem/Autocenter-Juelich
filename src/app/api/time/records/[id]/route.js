import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import mongoose from "mongoose";
import { verifyToken } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import TimeRecord from "@/app/models/TimeRecord";

async function getAdminUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const currentUser = token ? await verifyToken(token) : null;

  if (!currentUser?.userId || currentUser.role !== "admin") {
    return null;
  }

  return currentUser;
}

function normalizeRecord(record) {
  if (!record) return null;

  return {
    ...record,
    _id: record._id?.toString(),
    userId: record.userId?.toString(),
  };
}

export async function PUT(req, context) {
  try {
    const currentUser = await getAdminUser();

    if (!currentUser) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Ungültige Eintrags-ID." },
        { status: 400 },
      );
    }

    const body = await req.json();

    const action = body.action === "out" ? "out" : "in";
    const timestamp = body.timestamp ? new Date(body.timestamp) : null;

    if (!timestamp || Number.isNaN(timestamp.getTime())) {
      return NextResponse.json(
        { error: "Gültiges Datum und Uhrzeit sind erforderlich." },
        { status: 400 },
      );
    }

    await dbConnect();

    const updatedRecord = await TimeRecord.findByIdAndUpdate(
      id,
      {
        action,
        timestamp,
        source: "manual",
        updatedBy: currentUser.name || "admin",
      },
      {
        new: true,
      },
    ).lean();

    if (!updatedRecord) {
      return NextResponse.json(
        { error: "Eintrag nicht gefunden." },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        record: normalizeRecord(updatedRecord),
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("TIME_RECORD_UPDATE_ERROR:", error);

    return NextResponse.json(
      { error: "Eintrag konnte nicht aktualisiert werden." },
      { status: 500 },
    );
  }
}

export async function DELETE(req, context) {
  try {
    const currentUser = await getAdminUser();

    if (!currentUser) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Ungültige Eintrags-ID." },
        { status: 400 },
      );
    }

    await dbConnect();

    const deletedRecord = await TimeRecord.findByIdAndDelete(id).lean();

    if (!deletedRecord) {
      return NextResponse.json(
        { error: "Eintrag nicht gefunden." },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        message: "Eintrag erfolgreich gelöscht.",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("TIME_RECORD_DELETE_ERROR:", error);

    return NextResponse.json(
      { error: "Eintrag konnte nicht gelöscht werden." },
      { status: 500 },
    );
  }
}
