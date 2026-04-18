import "server-only";

import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { AdminUserModel } from "@/lib/models/admin-user";
import { connectToDatabase } from "@/lib/mongodb";
import type { AuthSession } from "@/types/auth";

const SESSION_COOKIE_NAME = "admin_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7;

type SessionPayload = {
  sub: string;
  email: string;
  name?: string;
  isAdmin: boolean;
};

function getAuthSecret() {
  const secret = process.env.AUTH_SECRET;

  if (!secret) {
    throw new Error("Missing AUTH_SECRET environment variable.");
  }

  return new TextEncoder().encode(secret);
}

export async function syncDefaultAdminFromEnv() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    return null;
  }

  await connectToDatabase();

  const existingUser = await AdminUserModel.findOne({ email });
  const passwordHash = await bcrypt.hash(password, 10);

  if (!existingUser) {
    return AdminUserModel.create({
      email,
      name: "Admin",
      passwordHash,
      isAdmin: true,
      source: "env",
    });
  }

  const passwordMatches = await bcrypt.compare(password, existingUser.passwordHash);

  if (!passwordMatches || !existingUser.isAdmin || existingUser.source !== "env") {
    existingUser.passwordHash = passwordHash;
    existingUser.isAdmin = true;
    existingUser.source = "env";
    await existingUser.save();
  }

  return existingUser;
}

export async function verifyAdminCredentials(email: string, password: string) {
  await syncDefaultAdminFromEnv();
  await connectToDatabase();

  const user = await AdminUserModel.findOne({
    email: email.trim().toLowerCase(),
    isAdmin: true,
  });

  if (!user) {
    return null;
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);

  if (!isValid) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    isAdmin: true,
  } satisfies AuthSession["user"] & { isAdmin: true };
}

export async function createSessionToken(session: AuthSession) {
  const now = Math.floor(Date.now() / 1000);

  return new SignJWT({
    email: session.user.email,
    name: session.user.name || undefined,
    isAdmin: session.isAdmin,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt(now)
    .setExpirationTime(now + SESSION_DURATION_SECONDS)
    .setSubject(session.user.id)
    .sign(getAuthSecret());
}

export async function verifySessionToken(token: string | undefined) {
  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, getAuthSecret());
    const sessionPayload = payload as SessionPayload;

    return {
      user: {
        id: sessionPayload.sub,
        email: sessionPayload.email,
        name: sessionPayload.name || null,
      },
      isAdmin: Boolean(sessionPayload.isAdmin),
    } satisfies AuthSession;
  } catch {
    return null;
  }
}

export function getSessionCookieOptions() {
  return {
    name: SESSION_COOKIE_NAME,
    options: {
      httpOnly: true,
      sameSite: "lax" as const,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: SESSION_DURATION_SECONDS,
    },
  };
}

export async function getServerAuthSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  return verifySessionToken(token);
}

export async function getRequestAuthSession(request: NextRequest) {
  return verifySessionToken(request.cookies.get(SESSION_COOKIE_NAME)?.value);
}
