import { NextResponse } from "next/server";
import { getSessionCookieOptions } from "@/lib/auth";

export async function POST() {
  const { name, options } = getSessionCookieOptions();
  const response = NextResponse.json({ success: true });

  response.cookies.set(name, "", {
    ...options,
    maxAge: 0,
  });

  return response;
}
