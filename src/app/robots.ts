import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

const PRIVATE = ["/signal-lab", "/api/", "/analytics"];

/** Search and answer-engine crawlers named explicitly, so the intent to be cited is unambiguous. */
const AI_CRAWLERS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
  "Bingbot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: PRIVATE },
      { userAgent: AI_CRAWLERS, allow: "/", disallow: PRIVATE },
    ],
    sitemap: `${site.url}/sitemap.xml`,
  };
}
