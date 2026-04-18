import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getRequestAuthSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await getRequestAuthSession(request);
  return NextResponse.json(session);
}
