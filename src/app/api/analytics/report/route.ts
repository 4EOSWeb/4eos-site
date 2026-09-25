import { NextResponse } from "next/server";
import { buildReport, type RangeKey } from "@/lib/analytics/report";

const RANGES = new Set(["day", "week", "month", "quarter", "year"]);

export async function GET(request: Request) {
  const range = new URL(request.url).searchParams.get("range") ?? "month";
  const key = (RANGES.has(range) ? range : "month") as RangeKey;
  try {
    return NextResponse.json(buildReport(key));
  } catch (error) {
    console.error("[command]", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
