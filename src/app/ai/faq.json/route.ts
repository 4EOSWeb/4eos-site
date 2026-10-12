import { aiFaq, jsonHeaders } from "@/lib/discovery";

export function GET() {
  return Response.json(aiFaq(), { headers: jsonHeaders });
}
