import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ContactMessageModel } from "@/lib/models/contact-message";
import { getRequestAuthSession } from "@/lib/auth";
import { serializeContactMessage } from "@/lib/serializers";

export async function GET(request: NextRequest) {
  const session = await getRequestAuthSession(request);

  if (!session?.isAdmin) {
    return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
  }

  await connectToDatabase();
  const messages = await ContactMessageModel.find()
    .sort({ created_at: -1 })
    .lean();

  return NextResponse.json(messages.map(serializeContactMessage));
}
