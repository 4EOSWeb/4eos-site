/**
 * Machine-readable endpoints for AI crawlers. Every string here is already
 * on the site — this file only packages it.
 */

import { faqs, industries, services } from "@/lib/content";
import { getPosts } from "@/lib/posts";
import { addressLine, site } from "@/lib/site";

const CACHE = "public, max-age=86400";

export const jsonHeaders = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": CACHE,
} as const;

export const textHeaders = {
  "Content-Type": "text/plain; charset=utf-8",
  "Cache-Control": CACHE,
  "X-Content-Type-Options": "nosniff",
} as const;

export const rssHeaders = {
  "Content-Type": "application/rss+xml; charset=utf-8",
  "Cache-Control": CACHE,
} as const;

export function aiSummary() {
  return {
    name: site.name,
    title: site.name,
    description: site.description,
    url: site.url,
    tagline: site.tagline,
    docs: `${site.url}/llms.txt`,
    source: site.url,
    lastModified: new Date().toISOString(),
    foundingDate: String(site.founded),
    areaServed: "Indiana",
    telephone: site.phone,
    email: site.helpdesk,
    address: addressLine,
    sameAs: [site.social.linkedin, site.social.facebook],
  };
}

export function aiFaq() {
  return faqs.map((f) => ({ question: f.q, answer: f.a }));
}

export function aiService() {
  return {
    service: site.name,
    type: "ProfessionalService",
    description: site.description,
    url: site.url,
    areaServed: "Indiana",
    capabilities: services.map((s) => s.title),
    industries: industries.map((i) => i.title),
    contact: {
      telephone: site.phone,
      email: site.helpdesk,
      address: addressLine,
    },
  };
}

export function faqPageSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.a,
      },
    })),
  };
}

export function orgGraph() {
  const orgId = `${site.url}/#organization`;
  const siteId = `${site.url}/#website`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": orgId,
        name: site.name,
        legalName: site.name,
        url: site.url,
        description: site.description,
        foundingDate: String(site.founded),
        telephone: site.phone,
        email: site.helpdesk,
        logo: `${site.url}/icon.png`,
        sameAs: [site.social.linkedin, site.social.facebook],
        address: {
          "@type": "PostalAddress",
          streetAddress: site.address.street,
          addressLocality: site.address.city,
          addressRegion: site.address.region,
          postalCode: site.address.postal,
          addressCountry: site.address.country,
        },
      },
      {
        "@type": "WebSite",
        "@id": siteId,
        url: site.url,
        name: site.name,
        description: site.description,
        inLanguage: "en-US",
        publisher: { "@id": orgId },
      },
      {
        "@type": "ProfessionalService",
        "@id": `${site.url}/#service`,
        name: site.name,
        description: site.description,
        url: site.url,
        telephone: site.phone,
        email: site.helpdesk,
        foundingDate: String(site.founded),
        areaServed: "Indiana",
        parentOrganization: { "@id": orgId },
        address: {
          "@type": "PostalAddress",
          streetAddress: site.address.street,
          addressLocality: site.address.city,
          addressRegion: site.address.region,
          postalCode: site.address.postal,
          addressCountry: site.address.country,
        },
      },
    ],
  };
}

export function aiTxt() {
  const lines = [
    `# AI Crawler Permissions for ${site.url}`,
    "",
    "User-Agent: *",
    "Allow: /",
    "",
    "User-Agent: GPTBot",
    "Allow: /",
    "",
    "User-Agent: Claude-Web",
    "Allow: /",
    "",
    "User-Agent: Anthropic-AI",
    "Allow: /",
    "",
    "User-Agent: Google-Extended",
    "Allow: /",
    "",
    "User-Agent: CCBot",
    "Allow: /",
    "",
    "User-Agent: PerplexityBot",
    "Allow: /",
    "",
    "Disallow: /api/",
    "Disallow: /signal-lab",
    "",
    `AI-Endpoint: ${site.url}/ai/summary.json`,
    `AI-Endpoint: ${site.url}/ai/faq.json`,
    `AI-Endpoint: ${site.url}/ai/service.json`,
    `AI-Endpoint: ${site.url}/llms.txt`,
    "",
    `Sitemap: ${site.url}/sitemap.xml`,
    `Feed: ${site.url}/feed.xml`,
    "",
    `Last-Modified: ${new Date().toISOString().slice(0, 10)}`,
  ];
  return `${lines.join("\n")}\n`;
}

export function llmsTxt() {
  const link = (path: string, title: string, note: string) =>
    `- [${title}](${site.url}${path}): ${note}`;

  const serviceLinks = services
    .map((s) => link(`/services/${s.slug}`, s.title, s.statement))
    .join("\n");
  const industryLinks = industries
    .map((i) => link(`/industries/${i.slug}`, i.title, i.statement))
    .join("\n");
  const posts = getPosts()
    .map((p) => link(`/blog/${p.slug}`, p.title, p.description))
    .join("\n");

  return `# ${site.name}

> ${site.description}

${site.tagline} Founded in Fort Wayne in ${site.founded}. Managed IT, cybersecurity, and compliance for Indiana businesses.

## Services

${serviceLinks}
${link("/secureai", "SecureAI", "Sixty-plus models on one platform, with the data staying yours.")}

## Industries

${industryLinks}

## Company

${link("/about", "About", "Fort Wayne born. Business first.")}
${link("/why-4eos", "Why 4EOS", "A partner, not a vendor.")}
${link("/faq", "FAQ", "Straight answers on choosing a provider, VoIP, outsourcing, and cybersecurity.")}
${link("/contact", "Contact", "New client intake. A senior engineer follows up.")}
${link("/support", "Support", "Existing client with an issue.")}

## Journal

${posts || link("/blog", "Journal", "Notes on managed IT, security, and running a business in Fort Wayne.")}

## Machine-readable

${link("/ai/summary.json", "summary.json", "Short site identity for AI crawlers.")}
${link("/ai/faq.json", "faq.json", "The FAQ as question and answer pairs.")}
${link("/feed.xml", "RSS feed", "Journal updates.")}
`;
}

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export function rssXml() {
  const items = getPosts()
    .map((post) => {
      const url = `${site.url}/blog/${post.slug}`;
      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${url}</link>
      <guid>${url}</guid>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      <description>${escapeXml(post.description)}</description>
    </item>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(site.name)} Journal</title>
    <link>${site.url}/blog</link>
    <description>${escapeXml("Notes on managed IT, security, and running a business in Fort Wayne.")}</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>
`;
}
