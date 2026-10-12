import { NextResponse } from "next/server";
import { COMMAND_COOKIE } from "@/lib/analytics/auth";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(COMMAND_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  return response;
}
