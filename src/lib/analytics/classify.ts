export type SourceClass =
  | "direct"
  | "google"
  | "bing"
  | "ai"
  | "linkedin"
  | "social"
  | "referral"
  | "campaign";

export type Source = {
  class: SourceClass;
  label: string;
  host: string | null;
};

const AI_HOSTS: [string, string][] = [
  ["chatgpt.com", "ChatGPT"],
  ["chat.openai.com", "ChatGPT"],
  ["openai.com", "ChatGPT"],
  ["copilot.microsoft.com", "Copilot"],
  ["edgeservices.bing.com", "Copilot"],
  ["perplexity.ai", "Perplexity"],
  ["gemini.google.com", "Gemini"],
  ["claude.ai", "Claude"],
  ["poe.com", "Other AI"],
  ["you.com", "Other AI"],
];

const SOCIAL = ["facebook.com", "instagram.com", "x.com", "twitter.com", "youtube.com", "tiktok.com", "t.co"];

function hostOf(referrer: string) {
  try {
    return new URL(referrer).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return null;
  }
}

function matchHost(host: string, root: string) {
  return host === root || host.endsWith(`.${root}`);
}

export function classifySource(input: {
  referrer?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
}): Source {
  const utmSource = clip(input.utmSource);
  const utmCampaign = clip(input.utmCampaign);
  if (utmSource || utmCampaign) {
    return {
      class: "campaign",
      label: utmCampaign || utmSource || "Campaign",
      host: hostOf(input.referrer ?? "") ,
    };
  }

  const host = hostOf(input.referrer ?? "");
  if (!host || matchHost(host, "4eos.com") || host === "localhost" || host.startsWith("127.")) {
    return { class: "direct", label: "Direct", host: null };
  }

  if (matchHost(host, "google.com") || host === "google") {
    return { class: "google", label: "Google", host };
  }
  if (matchHost(host, "bing.com")) return { class: "bing", label: "Bing", host };

  for (const [root, label] of AI_HOSTS) {
    if (matchHost(host, root)) return { class: "ai", label, host };
  }
  if (matchHost(host, "linkedin.com")) return { class: "linkedin", label: "LinkedIn", host };
  if (SOCIAL.some((root) => matchHost(host, root))) {
    return { class: "social", label: host, host };
  }
  return { class: "referral", label: host, host };
}

function clip(value: string | null | undefined) {
  const text = value?.trim();
  if (!text) return null;
  return text.slice(0, 80);
}
