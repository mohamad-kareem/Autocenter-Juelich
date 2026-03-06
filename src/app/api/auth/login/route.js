import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/mongodb";
import User from "@/app/models/User";
import { signToken } from "@/lib/auth";

export async function POST(req) {
  try {
    const body = await req.json();
    const email = String(body.email || "")
      .trim()
      .toLowerCase();
    const password = String(body.password || "").trim();

    console.log("LOGIN_STEP: request parsed");

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 },
      );
    }

    await dbConnect();
    console.log("LOGIN_STEP: db connected");

    const user = await User.findOne({ email });
    console.log("LOGIN_STEP: user lookup done", !!user);

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 },
      );
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    console.log("LOGIN_STEP: password compared", passwordMatch);

    if (!passwordMatch) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 },
      );
    }

    const token = await signToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
    });
    console.log("LOGIN_STEP: token created");

    const response = NextResponse.json(
      {
        message: "Login successful.",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      { status: 200 },
    );

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    console.log("LOGIN_STEP: cookie set");
    return response;
  } catch (error) {
    console.error("LOGIN_ERROR_FULL:", error);
    return NextResponse.json(
      { error: error?.message || "Something went wrong during login." },
      { status: 500 },
    );
  }
}
