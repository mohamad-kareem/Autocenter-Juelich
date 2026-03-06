import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import VisitorLog from "@/app/models/VisitorLog";

export async function POST(request) {
  try {
    const body = await request.json();
    const page = body.page || "/";

    // Do not save the visitors page itself
    if (page.startsWith("/visitors")) {
      return NextResponse.json({ success: true }, { status: 200 });
    }

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const user = token ? await verifyToken(token) : null;

    await dbConnect();

    await VisitorLog.create({
      visitorName: user?.name || "Gast",
      page,
      visitedAt: new Date(),
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("VISITOR_LOG_ERROR:", error);
    return NextResponse.json(
      { error: "Besucher konnte nicht gespeichert werden." },
      { status: 500 },
    );
  }
}
