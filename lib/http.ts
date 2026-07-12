import { NextResponse } from "next/server";
import { ZodError } from "zod";

export class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function jsonOk<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, init);
}

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function handleApiError(error: unknown) {
  if (error instanceof HttpError) {
    return jsonError(error.message, error.status);
  }

  if (error instanceof ZodError) {
    return jsonError(error.issues[0]?.message ?? "ورودی نامعتبر است.", 422);
  }

  console.error(error);

  if (
    error instanceof Error &&
    error.name === "PrismaClientInitializationError" &&
    error.message.includes("DATABASE_URL")
  ) {
    return jsonError(
      "DATABASE_URL تنظیم نشده است. فایل .env یا .env.local را بسازید و دیتابیس را اجرا کنید.",
      500,
    );
  }

  return jsonError("خطای غیرمنتظره‌ای رخ داد.", 500);
}
