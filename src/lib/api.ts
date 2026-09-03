import { NextResponse } from "next/server";
import { ZodError } from "zod";

export type ApiErrorCode =
  | "UNAUTHORIZED"
  | "NOT_FOUND"
  | "VALIDATION_ERROR"
  | "ALREADY_STARTED"
  | "ALREADY_COMPLETED"
  | "ACTIVE_BREAK"
  | "NO_ACTIVE_BREAK"
  | "INVALID_TIME_RANGE"
  | "DATABASE_ERROR";

export class AppError extends Error {
  constructor(
    public code: ApiErrorCode,
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}

export function apiSuccess<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ ok: true, data }, init);
}

export function apiError(error: unknown) {
  if (error instanceof AppError) {
    return NextResponse.json(
      { ok: false, error: { code: error.code, message: error.message } },
      { status: error.status },
    );
  }

  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "VALIDATION_ERROR",
          message: error.issues[0]?.message ?? "Invalid request.",
        },
      },
      { status: 422 },
    );
  }

  return NextResponse.json(
    {
      ok: false,
      error: {
        code: "DATABASE_ERROR",
        message: "Something went wrong. Please try again.",
      },
    },
    { status: 500 },
  );
}
