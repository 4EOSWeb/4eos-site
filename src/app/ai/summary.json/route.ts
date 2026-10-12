import { aiSummary, jsonHeaders } from "@/lib/discovery";

export function GET() {
  return Response.json(aiSummary(), { headers: jsonHeaders });
}
