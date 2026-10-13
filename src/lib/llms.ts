import { faqs, industries, services } from "@/lib/content";
import { getPosts } from "@/lib/posts";
import { site } from "@/lib/site";

/** Matches the description on the SecureAI page. */
const SECUREAI =
  "Sixty-plus AI models on one secure platform. No per-user fees. The data stays yours.";

function abs(path: string) {
  return `${site.url}${path}`;
}

function link(label: string, path: string, detail?: string) {
  const line = `- [${label}](${abs(path)})`;
  return detail ? `${line}: ${detail}` : line;
}

export function llmsTxt() {
  const lines = [
    `# ${site.name}`,
    "",
    `> ${site.description}`,
    "",
    `${site.tagline} Founded in Fort Wayne in ${site.founded}.`,
    "",
    `Full reference: ${abs("/llms-full.txt")}`,
    "",
    "## Services",
    "",
    link("Services", "/services"),
    ...services.map((s) => link(s.title, `/services/${s.slug}`, s.lede)),
    link("SecureAI", "/secureai", SECUREAI),
    "",
    "## Industries",
    "",
    link("Industries", "/industries"),
    ...industries.map((i) => link(i.title, `/industries/${i.slug}`, i.lede)),
    "",
    "## Company",
    "",
    link("About 4EOS", "/about"),
    link("Why 4EOS", "/why-4eos"),
    link("FAQ", "/faq"),
    link("Contact", "/contact"),
    link("IT Risk Quiz", "/assessment", "A twelve-question self-check with a risk score."),
    link("Support", "/support"),
    link("Journal", "/blog"),
    "",
    "## Legal",
    "",
    link("Privacy", "/privacy"),
    link("Terms", "/terms"),
    link("Accessibility", "/accessibility"),
    "",
    "## Optional",
    "",
    "Companion files for AI crawlers:",
    "",
    link("llms-full.txt", "/llms-full.txt", "Full page text for retrieval."),
    link("summary.json", "/ai/summary.json", "Site identity."),
    link("faq.json", "/ai/faq.json", "Questions and answers."),
    link("service.json", "/ai/service.json", "Capabilities and industries."),
    link("ai.txt", "/.well-known/ai.txt", "Crawler permissions and endpoints."),
    link("RSS", "/feed.xml", "Site updates."),
    "",
  ];
  return lines.join("\n");
}

function block(title: string, path: string, parts: string[]) {
  return [`## ${title}`, abs(path), "", ...parts.filter(Boolean), ""].join("\n");
}

export function llmsFullTxt() {
  const serviceBlocks = services.map((service) =>
    block(service.title, `/services/${service.slug}`, [
      service.statement,
      service.lede,
      "",
      "How it shows up",
      ...service.how.map((item) => `- ${item}`),
      "",
      "In practice",
      ...service.points.map((item) => `- ${item}`),
      "",
      ...service.faqs.flatMap((item) => [`Q: ${item.q}`, `A: ${item.a}`, ""]),
    ]),
  );

  const industryBlocks = industries.map((industry) =>
    block(industry.title, `/industries/${industry.slug}`, [
      industry.statement,
      industry.lede,
      industry.note,
      "",
      "How it shows up",
      ...industry.how.map((item) => `- ${item}`),
      "",
      ...industry.faqs.flatMap((item) => [`Q: ${item.q}`, `A: ${item.a}`, ""]),
    ]),
  );

  const questions = faqs.flatMap((item) => [`Q: ${item.q}`, `A: ${item.a}`, ""]);
  const posts = getPosts().map((post) => link(post.title, `/blog/${post.slug}`, post.description));

  return [
    `# ${site.name}`,
    "",
    `> ${site.description}`,
    "",
    `${site.name}, ${site.address.street}, ${site.address.city}, ${site.address.region} ${site.address.postal}. ${site.phone}. ${site.helpdesk}. Founded ${site.founded}.`,
    "",
    ...serviceBlocks,
    block("SecureAI", "/secureai", [SECUREAI]),
    ...industryBlocks,
    block("Questions", "/faq", questions),
    ["## Journal", abs("/blog"), "", ...posts, ""].join("\n"),
  ].join("\n");
}
