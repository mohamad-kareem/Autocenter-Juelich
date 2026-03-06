import { NextResponse } from "next/server";

export async function POST(request) {
  const response = NextResponse.redirect(new URL("/login", request.url));

  response.cookies.set("token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(0),
  });

  return response;
}
