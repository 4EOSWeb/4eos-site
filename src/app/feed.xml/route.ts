import { rssHeaders, rssXml } from "@/lib/discovery";

export function GET() {
  return new Response(rssXml(), { headers: rssHeaders });
}
