import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import mongoose from "mongoose";
import { verifyToken } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import TimeRecord from "@/app/models/TimeRecord";
import User from "@/app/models/User";
import { getMonthRange } from "@/lib/time";

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

function normalizeUser(user) {
  if (!user) return null;

  return {
    _id: user._id?.toString(),
    name: user.name || "Unbekannt",
    role: user.role,
  };
}

function buildMonthlySummary(records) {
  const grouped = {};

  const sortedRecords = [...records].sort(
    (a, b) => new Date(a.timestamp) - new Date(b.timestamp),
  );

  for (const record of sortedRecords) {
    if (!grouped[record.userId]) {
      grouped[record.userId] = {
        userId: record.userId,
        userName: record.userName,
        totalMinutes: 0,
        openIn: null,
      };
    }

    const currentGroup = grouped[record.userId];

    if (record.action === "in") {
      currentGroup.openIn = new Date(record.timestamp);
      continue;
    }

    if (record.action === "out" && currentGroup.openIn) {
      const diffMs = new Date(record.timestamp) - currentGroup.openIn;
      const diffMinutes = Math.max(0, Math.floor(diffMs / 60000));

      currentGroup.totalMinutes += diffMinutes;
      currentGroup.openIn = null;
    }
  }

  return Object.values(grouped)
    .map((item) => ({
      userId: item.userId,
      userName: item.userName,
      totalMinutes: item.totalMinutes,
      totalHours: Number((item.totalMinutes / 60).toFixed(2)),
    }))
    .sort((a, b) => a.userName.localeCompare(b.userName, "de"));
}

export async function GET(req) {
  try {
    const currentUser = await getAdminUser();

    if (!currentUser) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const month = searchParams.get("month");

    const { start, end } = getMonthRange(month);

    await dbConnect();

    const [records, users] = await Promise.all([
      TimeRecord.find({
        timestamp: {
          $gte: start,
          $lt: end,
        },
      })
        .sort({ timestamp: -1 })
        .lean(),

      User.find({ role: { $in: ["user", "admin"] } }, { name: 1, role: 1 })
        .sort({ name: 1 })
        .lean(),
    ]);

    const normalizedRecords = records.map(normalizeRecord);
    const normalizedUsers = users.map(normalizeUser);
    const summary = buildMonthlySummary(normalizedRecords);

    return NextResponse.json(
      {
        records: normalizedRecords,
        summary,
        users: normalizedUsers,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("TIME_RECORDS_GET_ERROR:", error);

    return NextResponse.json(
      { error: "Daten konnten nicht geladen werden." },
      { status: 500 },
    );
  }
}

export async function POST(req) {
  try {
    const currentUser = await getAdminUser();

    if (!currentUser) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    const body = await req.json();

    const userId = String(body.userId || "").trim();
    const action = body.action === "out" ? "out" : "in";
    const timestamp = body.timestamp ? new Date(body.timestamp) : null;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        { error: "Ungültiger Mitarbeiter." },
        { status: 400 },
      );
    }

    if (!timestamp || Number.isNaN(timestamp.getTime())) {
      return NextResponse.json(
        { error: "Gültiges Datum und Uhrzeit sind erforderlich." },
        { status: 400 },
      );
    }

    await dbConnect();

    const selectedUser = await User.findById(userId).lean();

    if (!selectedUser) {
      return NextResponse.json(
        { error: "Mitarbeiter nicht gefunden." },
        { status: 404 },
      );
    }

    const createdRecord = await TimeRecord.create({
      userId: selectedUser._id,
      userName: selectedUser.name || "Unbekannt",
      userRole: selectedUser.role,
      action,
      timestamp,
      source: "manual",
      createdBy: currentUser.name || "admin",
      updatedBy: "",
    });

    return NextResponse.json(
      {
        record: normalizeRecord(createdRecord.toObject()),
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("TIME_RECORDS_POST_ERROR:", error);

    return NextResponse.json(
      { error: "Eintrag konnte nicht erstellt werden." },
      { status: 500 },
    );
  }
}
