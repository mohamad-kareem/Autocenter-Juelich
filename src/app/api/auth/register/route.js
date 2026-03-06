import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/mongodb";
import User from "@/app/models/User";
import { verifyToken } from "@/lib/auth";

const PASSWORD_RULE = /^(?=.*[!@#$%^&*()_\-+=[\]{};':"\\|,.<>/?`~]).{6,}$/;

export async function POST(req) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const currentUser = token ? await verifyToken(token) : null;

    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json(
        { error: "Only admins can create users." },
        { status: 403 },
      );
    }

    const body = await req.json();
    const name = String(body.name || "").trim();
    const email = String(body.email || "")
      .trim()
      .toLowerCase();
    const password = String(body.password || "").trim();
    const role = body.role === "admin" ? "admin" : "user";

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required." },
        { status: 400 },
      );
    }

    if (!PASSWORD_RULE.test(password)) {
      return NextResponse.json(
        {
          error:
            "Password must be at least 6 characters and contain at least one special character.",
        },
        { status: 400 },
      );
    }

    await dbConnect();

    const existingUser = await User.findOne({ email }).lean();

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already exists." },
        { status: 409 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    return NextResponse.json(
      {
        message: "User registered successfully.",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("REGISTER_ERROR:", error);
    return NextResponse.json(
      { error: "Something went wrong during registration." },
      { status: 500 },
    );
  }
}
