import { generalFaqs, industries, services } from "@/lib/content";
import { getPosts } from "@/lib/posts";
import { addressLine, site } from "@/lib/site";

/** Machine-readable endpoints from the geo-checklist.dev AI discovery draft, built from the same content as the pages. */

const abs = (path: string) => `${site.url}${path}`;

export function aiTxt() {
  return [
    `# ${site.name} (${site.legalName})`,
    `# ${site.description}`,
    "",
    "User-agent: *",
    "Allow: /",
    "Disallow: /api/",
    "Disallow: /analytics",
    "Disallow: /signal-lab",
    "",
    `Summary: ${abs("/ai/summary.json")}`,
    `FAQ: ${abs("/ai/faq.json")}`,
    `Services: ${abs("/ai/service.json")}`,
    `LLMs: ${abs("/llms.txt")}`,
    `LLMs-Full: ${abs("/llms-full.txt")}`,
    `Sitemap: ${abs("/sitemap.xml")}`,
    `Contact: ${site.sales}`,
    "",
  ].join("\n");
}

export function aiSummary() {
  return {
    name: site.name,
    legalName: site.legalName,
    description: site.description,
    url: site.url,
    founded: site.founded,
    updated: site.updated,
    areaServed: site.serviceArea,
    address: addressLine,
    telephone: site.phone,
    email: { support: site.helpdesk, sales: site.sales },
    hours: site.hours,
    partners: site.partners,
    family: [
      { name: "Midwest VoIP", url: abs("/voip") },
      { name: "SafeHouse DataCenter", url: abs("/data-center") },
    ],
    rating: { value: site.rating.value, count: site.rating.count, source: site.rating.source },
    pages: {
      services: abs("/services"),
      industries: abs("/industries"),
      about: abs("/about"),
      contact: abs("/contact"),
      faq: abs("/faq"),
    },
  };
}

export function aiFaq() {
  return [...generalFaqs, ...services.flatMap((s) => s.faqs)].map((item) => ({
    question: item.q,
    answer: item.a,
  }));
}

export function aiService() {
  return {
    name: site.name,
    description: site.description,
    url: site.url,
    capabilities: services.map((s) => s.title),
    services: services.map((s) => ({
      name: s.title,
      url: abs(s.href),
      summary: s.summary,
      includes: s.included.map((i) => i.title),
    })),
    industries: industries.map((i) => ({ name: i.title, url: abs(`/industries/${i.slug}`), summary: i.summary })),
    contact: { telephone: site.phone, email: site.sales, consultation: abs("/contact") },
  };
}

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function rssFeed() {
  const items = getPosts()
    .map(
      (p) => `    <item>
      <title>${esc(p.title)}</title>
      <link>${abs(`/blog/${p.slug}`)}</link>
      <guid isPermaLink="true">${abs(`/blog/${p.slug}`)}</guid>
      <pubDate>${new Date(`${p.date}T12:00:00Z`).toUTCString()}</pubDate>
      <author>${site.sales} (${esc(p.author)})</author>
      <description>${esc(p.description)}</description>
    </item>`,
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${site.name} Insights</title>
    <link>${abs("/blog")}</link>
    <atom:link href="${abs("/feed.xml")}" rel="self" type="application/rss+xml" />
    <description>Practical articles from ${site.name} on managed IT, cybersecurity, and technology planning.</description>
    <language>en-us</language>
    <lastBuildDate>${new Date(`${site.updated}T12:00:00Z`).toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>
`;
}
