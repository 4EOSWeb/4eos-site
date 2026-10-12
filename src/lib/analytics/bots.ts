const AI_CRAWLERS: [RegExp, string][] = [
  [/GPTBot/i, "GPTBot"],
  [/ChatGPT-User/i, "ChatGPT"],
  [/OAI-SearchBot/i, "OpenAI search"],
  [/ClaudeBot/i, "Claude"],
  [/Claude-Web/i, "Claude"],
  [/anthropic-ai/i, "Claude"],
  [/PerplexityBot/i, "Perplexity"],
  [/Google-Extended/i, "Google-Extended"],
  [/Applebot-Extended/i, "Applebot-Extended"],
  [/Amazonbot/i, "Amazonbot"],
  [/CCBot/i, "Common Crawl"],
  [/Bytespider/i, "Bytespider"],
  [/Meta-ExternalAgent/i, "Meta"],
  [/cohere-ai/i, "Cohere"],
];

const GENERIC_BOT = /bot|spider|crawler|slurp|headless|preview|facebookexternalhit|pingdom|uptime|monitor|wget|curl\//i;

export type AgentKind = { kind: "person" } | { kind: "crawler"; name: string } | { kind: "bot" };

export function classifyAgent(userAgent: string | null): AgentKind {
  const ua = userAgent ?? "";
  if (!ua.trim()) return { kind: "bot" };
  for (const [pattern, name] of AI_CRAWLERS) {
    if (pattern.test(ua)) return { kind: "crawler", name };
  }
  if (GENERIC_BOT.test(ua)) return { kind: "bot" };
  return { kind: "person" };
}
