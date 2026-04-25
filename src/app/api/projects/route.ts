import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ProjectModel } from "@/lib/models/project";
import { serializeProject } from "@/lib/serializers";

export async function GET() {
  await connectToDatabase();
  const projects = await ProjectModel.find().sort({ display_order: 1, created_at: 1 }).lean();

  return NextResponse.json(projects.map(serializeProject));
}
