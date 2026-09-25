import { NextResponse } from "next/server";
import { buildLive } from "@/lib/analytics/report";

export async function GET() {
  try {
    return NextResponse.json(buildLive());
  } catch (error) {
    console.error("[command]", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
