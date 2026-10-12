import { aiTxt, textHeaders } from "@/lib/discovery";

export function GET() {
  return new Response(aiTxt(), { headers: textHeaders });
}
