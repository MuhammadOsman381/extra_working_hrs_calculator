import "server-only";

import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "node:crypto";
import { prisma } from "@/src/lib/prisma";
import { AppError } from "@/src/lib/api";
import { loginSchema, registerSchema, settingsSchema } from "../schemas/auth-schemas";

const SESSION_COOKIE = "extra_hours_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 14;

type SessionPayload = {
  userId: string;
  email: string;
  exp: number;
};

function getAuthSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 16) {
    throw new AppError("DATABASE_ERROR", "AUTH_SECRET must be configured.", 500);
  }
  return secret;
}

function encodeBase64Url(value: string) {
  return Buffer.from(value).toString("base64url");
}

function sign(payload: string) {
  return createHmac("sha256", getAuthSecret()).update(payload).digest("base64url");
}

function createSessionToken(payload: SessionPayload) {
  const body = encodeBase64Url(JSON.stringify(payload));
  return `${body}.${sign(body)}`;
}

function verifySessionToken(token?: string): SessionPayload | null {
  if (!token) return null;
  const [body, signature] = token.split(".");
  if (!body || !signature) return null;

  const expected = sign(body);
  const givenBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (givenBuffer.length !== expectedBuffer.length) return null;
  if (!timingSafeEqual(givenBuffer, expectedBuffer)) return null;

  const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as SessionPayload;
  if (payload.exp < Date.now()) return null;
  return payload;
}

export async function setSession(user: { id: string; email: string }) {
  const token = createSessionToken({
    userId: user.id,
    email: user.email,
    exp: Date.now() + SESSION_MAX_AGE * 1000,
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getSession() {
  const cookieStore = await cookies();
  return verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value);
}

export async function requireUser() {
  const session = await getSession();
  if (!session) {
    throw new AppError("UNAUTHORIZED", "Please log in to continue.", 401);
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, name: true, email: true, dailyWorkingHours: true },
  });

  if (!user) {
    throw new AppError("UNAUTHORIZED", "Please log in to continue.", 401);
  }

  return user;
}

export async function registerUser(input: unknown) {
  const data = registerSchema.parse(input);
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) {
    throw new AppError("VALIDATION_ERROR", "An account with this email already exists.", 422);
  }

  const passwordHash = await bcrypt.hash(data.password, 12);
  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      passwordHash,
      dailyWorkingHours: data.dailyWorkingHours,
    },
    select: { id: true, name: true, email: true, dailyWorkingHours: true },
  });

  await setSession(user);
  return user;
}

export async function loginUser(input: unknown) {
  const data = loginSchema.parse(input);
  const user = await prisma.user.findUnique({ where: { email: data.email } });
  if (!user || !(await bcrypt.compare(data.password, user.passwordHash))) {
    throw new AppError("UNAUTHORIZED", "Email or password is incorrect.", 401);
  }

  await setSession(user);
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    dailyWorkingHours: user.dailyWorkingHours,
  };
}

export async function updateSettings(userId: string, input: unknown) {
  const data = settingsSchema.parse(input);
  return prisma.user.update({
    where: { id: userId },
    data: { dailyWorkingHours: data.dailyWorkingHours },
    select: { id: true, name: true, email: true, dailyWorkingHours: true },
  });
}
