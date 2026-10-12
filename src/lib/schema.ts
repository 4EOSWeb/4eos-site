import { hours } from "@/lib/content";
import { site } from "@/lib/site";

type Qa = { q: string; a: string };

export function faqSchema(items: readonly Qa[]) {
  return {
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${site.url}${item.path}`,
    })),
  };
}

export function serviceSchema(service: { title: string; lede: string; slug: string }) {
  return {
    "@type": "Service",
    name: service.title,
    description: service.lede,
    url: `${site.url}/services/${service.slug}`,
    provider: { "@type": "Organization", name: site.name, url: site.url },
  };
}

export function industryPageSchema(industry: { title: string; lede: string; slug: string }) {
  return {
    "@type": "WebPage",
    name: industry.title,
    description: industry.lede,
    url: `${site.url}/industries/${industry.slug}`,
    about: { "@type": "Organization", name: site.name, url: site.url },
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: site.name,
    url: site.url,
  };
}

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: site.name,
    description: site.description,
    url: site.url,
    telephone: site.phone,
    email: site.helpdesk,
    foundingDate: String(site.founded),
    address: {
      "@type": "PostalAddress",
      streetAddress: site.address.street,
      addressLocality: site.address.city,
      addressRegion: site.address.region,
      postalCode: site.address.postal,
      addressCountry: site.address.country,
    },
    areaServed: "Indiana",
    sameAs: [site.social.facebook, site.social.linkedin, site.social.x],
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "08:00",
      closes: "17:00",
      description: hours,
    },
  };
}

export function graphSchema(nodes: object[]) {
  return { "@context": "https://schema.org", "@graph": nodes };
}
