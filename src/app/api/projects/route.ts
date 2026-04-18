import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ProjectModel } from "@/lib/models/project";
import { getRequestAuthSession } from "@/lib/auth";
import { serializeProject } from "@/lib/serializers";
import { projectInputSchema } from "@/lib/validators";

export async function GET() {
  await connectToDatabase();
  const projects = await ProjectModel.find().sort({ display_order: 1, created_at: 1 }).lean();

  return NextResponse.json(projects.map(serializeProject));
}

export async function POST(request: NextRequest) {
  const session = await getRequestAuthSession(request);

  if (!session?.isAdmin) {
    return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
  }

  const payload = projectInputSchema.safeParse(await request.json());

  if (!payload.success) {
    return NextResponse.json({ error: "Geçersiz proje verisi." }, { status: 400 });
  }

  await connectToDatabase();
  const project = await ProjectModel.create({
    ...payload.data,
    link: payload.data.link || null,
    long_description: payload.data.long_description || null,
    icon: payload.data.icon || "Globe",
  });

  return NextResponse.json(serializeProject(project.toObject()), { status: 201 });
}
