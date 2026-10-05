import { aiTxt } from "@/lib/ai";

export const dynamic = "force-static";

export function GET() {
  return new Response(aiTxt(), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
