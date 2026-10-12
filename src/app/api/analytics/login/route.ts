import { NextResponse } from "next/server";
import { analyticsConfigured, COMMAND_COOKIE, credentialsMatch, sessionToken } from "@/lib/analytics/auth";

export async function POST(request: Request) {
  if (!analyticsConfigured()) {
    return NextResponse.json({ ok: false, reason: "unconfigured" }, { status: 503 });
  }
  let body: { user?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  if (!credentialsMatch(body.user ?? "", body.password ?? "")) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const token = sessionToken();
  const response = NextResponse.json({ ok: true });
  response.cookies.set(COMMAND_COOKIE, token.value, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: token.maxAge,
  });
  return response;
}
