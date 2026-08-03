import { NextResponse } from "next/server";

export type ApiResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: { code: string; message: string; details?: unknown };
};

export function ok<T>(data: T, status = 200): NextResponse {
  return NextResponse.json({ success: true, data } satisfies ApiResponse<T>, { status });
}

export function err(code: string, message: string, status = 400, details?: unknown): NextResponse {
  return NextResponse.json({ success: false, error: { code, message, details } } satisfies ApiResponse, { status });
}

export function unauthorized() {
  return err("UNAUTHORIZED", "Bu işlem için yetkiniz yok.", 401);
}

export function notFound(entity = "Kayıt") {
  return err("NOT_FOUND", `${entity} bulunamadı.`, 404);
}

export function serverError(details?: unknown) {
  return err("SERVER_ERROR", "Sunucu hatası oluştu.", 500, details);
}
