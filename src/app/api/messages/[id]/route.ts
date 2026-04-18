import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import { ContactMessageModel } from "@/lib/models/contact-message";
import { getRequestAuthSession } from "@/lib/auth";
import { serializeContactMessage } from "@/lib/serializers";

function isValidId(id: string) {
  return mongoose.Types.ObjectId.isValid(id);
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const session = await getRequestAuthSession(request);

  if (!session?.isAdmin) {
    return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
  }

  const { id } = await context.params;

  if (!isValidId(id)) {
    return NextResponse.json({ error: "Geçersiz mesaj kimliği." }, { status: 400 });
  }

  const body = (await request.json()) as { is_read?: boolean };

  await connectToDatabase();
  const message = await ContactMessageModel.findByIdAndUpdate(
    id,
    { is_read: Boolean(body.is_read) },
    { new: true },
  ).lean();

  if (!message) {
    return NextResponse.json({ error: "Mesaj bulunamadı." }, { status: 404 });
  }

  return NextResponse.json(serializeContactMessage(message));
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const session = await getRequestAuthSession(request);

  if (!session?.isAdmin) {
    return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
  }

  const { id } = await context.params;

  if (!isValidId(id)) {
    return NextResponse.json({ error: "Geçersiz mesaj kimliği." }, { status: 400 });
  }

  await connectToDatabase();
  const message = await ContactMessageModel.findByIdAndDelete(id).lean();

  if (!message) {
    return NextResponse.json({ error: "Mesaj bulunamadı." }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
