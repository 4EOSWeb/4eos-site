import { aiService, jsonHeaders } from "@/lib/discovery";

export function GET() {
  return Response.json(aiService(), { headers: jsonHeaders });
}
