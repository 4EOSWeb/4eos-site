import { aiFaq } from "@/lib/ai";

export const dynamic = "force-static";

export function GET() {
  return Response.json(aiFaq());
}
