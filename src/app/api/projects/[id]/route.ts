import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import { ProjectModel } from "@/lib/models/project";
import { getRequestAuthSession } from "@/lib/auth";
import { serializeProject } from "@/lib/serializers";
import { projectInputSchema } from "@/lib/validators";

function isValidId(id: string) {
  return mongoose.Types.ObjectId.isValid(id);
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const session = await getRequestAuthSession(request);

  if (!session?.isAdmin) {
    return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
  }

  const { id } = await context.params;

  if (!isValidId(id)) {
    return NextResponse.json({ error: "Geçersiz proje kimliği." }, { status: 400 });
  }

  const payload = projectInputSchema.safeParse(await request.json());

  if (!payload.success) {
    return NextResponse.json({ error: "Geçersiz proje verisi." }, { status: 400 });
  }

  await connectToDatabase();
  const project = await ProjectModel.findByIdAndUpdate(
    id,
    {
      ...payload.data,
      link: payload.data.link || null,
      long_description: payload.data.long_description || null,
      icon: payload.data.icon || "Globe",
    },
    { new: true },
  ).lean();

  if (!project) {
    return NextResponse.json({ error: "Proje bulunamadı." }, { status: 404 });
  }

  return NextResponse.json(serializeProject(project));
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
    return NextResponse.json({ error: "Geçersiz proje kimliği." }, { status: 400 });
  }

  await connectToDatabase();
  const project = await ProjectModel.findByIdAndDelete(id).lean();

  if (!project) {
    return NextResponse.json({ error: "Proje bulunamadı." }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
