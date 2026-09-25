import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { analyticsConfigured, COMMAND_COOKIE, tokenValid } from "@/lib/analytics/auth";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/analytics/login" || pathname === "/api/analytics/login") {
    return NextResponse.next();
  }
  if (!analyticsConfigured()) {
    return new NextResponse("Not found", { status: 404 });
  }
  if (tokenValid(request.cookies.get(COMMAND_COOKIE)?.value)) {
    return NextResponse.next();
  }
  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  return NextResponse.redirect(new URL("/analytics/login", request.url));
}

export const config = {
  matcher: ["/analytics", "/analytics/:path*", "/api/analytics/:path*"],
};
