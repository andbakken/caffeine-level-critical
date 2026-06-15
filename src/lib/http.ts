import { NextResponse } from "next/server";

export function json<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function ok<T extends object>(data: T = {} as T) {
  return json({ ok: true, ...data });
}

export function fail(message: string, status = 400) {
  return json({ ok: false, error: message }, status);
}
