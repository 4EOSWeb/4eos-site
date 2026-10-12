import { llmsTxt, textHeaders } from "@/lib/discovery";

export function GET() {
  return new Response(llmsTxt(), { headers: textHeaders });
}
