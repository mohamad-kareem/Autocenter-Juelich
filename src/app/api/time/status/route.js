import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import mongoose from "mongoose";
import { verifyToken } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import TimeRecord from "@/app/models/TimeRecord";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const user = token ? await verifyToken(token) : null;

    if (!user?.userId) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    if (!mongoose.Types.ObjectId.isValid(user.userId)) {
      return NextResponse.json({ error: "Invalid user id." }, { status: 400 });
    }

    await dbConnect();

    const userObjectId = new mongoose.Types.ObjectId(user.userId);

    const lastRecord = await TimeRecord.findOne({ userId: userObjectId })
      .sort({ timestamp: -1 })
      .lean();

    const currentStatus = lastRecord?.action === "in" ? "in" : "out";

    return NextResponse.json(
      {
        status: currentStatus,
        lastRecord: lastRecord || null,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("TIME_STATUS_ERROR:", error);
    return NextResponse.json(
      { error: "Failed to get status." },
      { status: 500 },
    );
  }
}
