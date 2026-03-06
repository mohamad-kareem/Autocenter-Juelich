import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import User from "@/app/models/User";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    const decoded = await verifyToken(token);

    if (!decoded?.userId) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    await dbConnect();

    const user = await User.findById(decoded.userId).select("-password").lean();

    if (!user) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error("ME_ERROR:", error);
    return NextResponse.json({ user: null }, { status: 200 });
  }
}
