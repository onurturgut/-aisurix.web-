import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { sendContactEmail } from "@/lib/smtp";
import { contactInputSchema } from "@/lib/validators";

export async function POST(request: NextRequest) {
  const payload = contactInputSchema.safeParse(await request.json());

  if (!payload.success) {
    return NextResponse.json({ error: "Gecersiz mesaj verisi." }, { status: 400 });
  }

  try {
    await sendContactEmail({
      name: payload.data.name,
      email: payload.data.email,
      phone: payload.data.phone,
      detail: payload.data.detail,
      type: payload.data.type || null,
    });
  } catch (error) {
    console.error("Contact email send failed:", error);
    return NextResponse.json({ error: "Mesaj gonderilemedi." }, { status: 500 });
  }

  return NextResponse.json({ success: true }, { status: 201 });
}
