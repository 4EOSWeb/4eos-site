import { generalFaqs, industries, services, tiers } from "@/lib/content";
import { getPosts } from "@/lib/posts";
import { addressLine, leadership, site } from "@/lib/site";

const SECUREAI =
  "Access to more than sixty AI models, including GPT-4 and Claude, on one managed platform with company-wide monthly credits instead of per-user fees. Plans: Starter $500 (100,000 credits), Small Business $1,000 (250,000 credits), Business $2,250 (750,000 credits); enterprise pricing above 1,500,000 credits.";

function abs(path: string) {
  return `${site.url}${path}`;
}

function link(label: string, path: string, detail?: string) {
  const line = `- [${label}](${abs(path)})`;
  return detail ? `${line}: ${detail}` : line;
}

function qa(items: readonly { q: string; a: string }[]) {
  return items.flatMap((item) => [`Q: ${item.q}`, `A: ${item.a}`, ""]);
}

const contact = [
  `${site.name} (${site.legalName}), ${addressLine}.`,
  `Phone ${site.phone}. Fax ${site.fax}. Help desk ${site.helpdesk}. Sales ${site.sales}.`,
  `Hours: ${site.hours}. Service area: ${site.serviceArea}. Founded ${site.founded}.`,
  `Family companies: Midwest VoIP (business phone systems) and SafeHouse DataCenter (Fort Wayne data center).`,
  `Partners: ${site.partners.join(", ")}. Rated ${site.rating.value} on ${site.rating.source} from ${site.rating.count} reviews.`,
];

export function llmsTxt() {
  return [
    `# ${site.name}`,
    "",
    `> ${site.description}`,
    "",
    ...contact,
    "",
    `Full reference: ${abs("/llms-full.txt")}`,
    "",
    "## Services",
    "",
    link("All services", "/services"),
    ...services.map((s) => link(s.title, s.href, s.summary)),
    link("SecureAI", "/secureai", SECUREAI),
    "",
    "## Industries",
    "",
    link("Industries we support", "/industries"),
    ...industries.map((i) => link(i.title, `/industries/${i.slug}`, i.summary)),
    "",
    "## Company",
    "",
    link("About 4EOS", "/about"),
    link("Contact and consultations", "/contact"),
    link("Client support", "/support"),
    "",
    "## Resources",
    "",
    link("Resources", "/resources"),
    link("FAQ", "/faq"),
    link("Insights", "/blog"),
    "",
    "## Optional",
    "",
    link("Privacy Policy", "/privacy"),
    link("Terms of Use", "/terms"),
    link("Accessibility Statement", "/accessibility"),
    "",
  ].join("\n");
}

function block(title: string, path: string, parts: string[]) {
  return [`## ${title}`, abs(path), "", ...parts, ""].join("\n");
}

export function llmsFullTxt() {
  const serviceBlocks = services.map((s) =>
    block(s.title, s.href, [
      `${s.headline}.`,
      s.summary,
      "",
      ...s.body,
      "",
      "Signs it is time:",
      ...s.problems.map((p) => `- ${p}`),
      "",
      "What is included:",
      ...s.included.map((i) => `- ${i.title}: ${i.body}`),
      ...(s.slug === "managed-it"
        ? [
            "",
            "CompleteCare levels:",
            ...tiers.map((t) => `- ${t.name}: ${t.fit}`),
            "Typical managed IT pricing runs about $100 to $200 per user per month; 4EOS quotes a fixed monthly price after a free assessment.",
          ]
        : []),
      "",
      ...qa(s.faqs),
    ]),
  );

  const industryBlocks = industries.map((i) =>
    block(`IT for ${i.title}`, `/industries/${i.slug}`, [
      `${i.headline}.`,
      i.summary,
      "",
      ...i.how.map((h) => `- ${h}`),
      "",
      ...qa(i.faqs),
    ]),
  );

  const posts = getPosts().map((post) => link(post.title, `/blog/${post.slug}`, post.description));

  return [
    `# ${site.name}`,
    "",
    `> ${site.description}`,
    "",
    ...contact,
    "",
    block(
      "Leadership",
      "/about",
      leadership.map((p) => `- ${p.name}, ${p.role}: ${p.focus}`),
    ),
    ...serviceBlocks,
    block("SecureAI", "/secureai", [SECUREAI]),
    ...industryBlocks,
    block("Frequently asked questions", "/faq", qa(generalFaqs)),
    ["## Insights", abs("/blog"), "", ...posts, ""].join("\n"),
  ].join("\n");
}
