import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  createSessionToken,
  getSessionCookieOptions,
  verifyAdminCredentials,
} from "@/lib/auth";
import { loginInputSchema } from "@/lib/validators";
import type { AuthSession } from "@/types/auth";

export async function POST(request: NextRequest) {
  const payload = loginInputSchema.safeParse(await request.json());

  if (!payload.success) {
    return NextResponse.json({ error: "Geçersiz giriş bilgileri." }, { status: 400 });
  }

  const user = await verifyAdminCredentials(payload.data.email, payload.data.password);

  if (!user) {
    return NextResponse.json({ error: "Geçersiz e-posta veya şifre." }, { status: 401 });
  }

  const session: AuthSession = {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
    isAdmin: true,
  };

  const token = await createSessionToken(session);
  const { name, options } = getSessionCookieOptions();
  const response = NextResponse.json(session);

  response.cookies.set(name, token, options);
  return response;
}
