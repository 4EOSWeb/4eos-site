import type { Qa, Service } from "@/lib/content";
import { leadership, site } from "@/lib/site";

const ORG_ID = `${site.url}/#organization`;
const SITE_ID = `${site.url}/#website`;

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
      item: `${site.url}${item.path === "/" ? "" : item.path}`,
    })),
  };
}

const areaServed = [
  { "@type": "City", name: "Fort Wayne" },
  { "@type": "AdministrativeArea", name: "Northeast Indiana" },
];

export function serviceSchema(service: Pick<Service, "title" | "summary" | "href" | "included">) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${site.url}${service.href}#service`,
    name: service.title,
    serviceType: service.title,
    description: service.summary,
    url: `${site.url}${service.href}`,
    provider: { "@id": ORG_ID },
    areaServed,
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: `${service.title} from ${site.name}`,
      itemListElement: service.included.map((item) => ({
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: item.title, description: item.body },
      })),
    },
  };
}

export function articleSchema(post: {
  title: string;
  description: string;
  date: string;
  author: string;
  path: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${site.url}${post.path}#article`,
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    author: { "@type": "Person", name: post.author, worksFor: { "@id": ORG_ID } },
    publisher: { "@id": ORG_ID },
    mainEntityOfPage: `${site.url}${post.path}`,
    isPartOf: { "@id": SITE_ID },
  };
}

export function webPageSchema(page: { title: string; description: string; path: string; type?: string }) {
  return {
    "@context": "https://schema.org",
    "@type": page.type ?? "WebPage",
    "@id": `${site.url}${page.path}#webpage`,
    name: page.title,
    description: page.description,
    url: `${site.url}${page.path}`,
    isPartOf: { "@id": SITE_ID },
    about: { "@id": ORG_ID },
  };
}

export function websiteSchema() {
  return {
    "@type": "WebSite",
    "@id": SITE_ID,
    name: site.name,
    url: site.url,
    inLanguage: "en-US",
    publisher: { "@id": ORG_ID },
  };
}

export function organizationSchema() {
  return {
    "@type": ["Organization", "LocalBusiness", "ProfessionalService"],
    "@id": ORG_ID,
    name: site.name,
    legalName: site.legalName,
    description: site.description,
    url: site.url,
    logo: `${site.url}/brand/4eos-lockup.svg`,
    image: `${site.url}/opengraph-image`,
    telephone: site.phoneIntl,
    faxNumber: site.faxIntl,
    email: site.helpdesk,
    foundingDate: String(site.founded),
    foundingLocation: { "@type": "Place", name: "Fort Wayne, Indiana" },
    address: {
      "@type": "PostalAddress",
      streetAddress: site.address.street,
      addressLocality: site.address.city,
      addressRegion: site.address.region,
      postalCode: site.address.postal,
      addressCountry: site.address.country,
    },
    areaServed,
    openingHours: "Mo-Fr 08:00-17:00",
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "08:00",
      closes: "17:00",
    },
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: site.phoneIntl,
        email: site.helpdesk,
        contactType: "customer support",
        areaServed: "US",
        availableLanguage: "English",
      },
      {
        "@type": "ContactPoint",
        telephone: site.phoneIntl,
        email: site.sales,
        contactType: "sales",
        areaServed: "US",
        availableLanguage: "English",
      },
    ],
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: site.rating.value,
      reviewCount: site.rating.count,
      bestRating: "5",
      worstRating: "1",
    },
    sameAs: [site.social.facebook, site.social.linkedin, site.social.x, site.rating.reviewUrl],
    knowsAbout: [
      "Managed IT services",
      "Cybersecurity",
      "NIST Cybersecurity Framework",
      "Cloud migration",
      "Microsoft 365",
      "Azure",
      "Backup and disaster recovery",
      "Business continuity",
      "Network infrastructure",
      "IT strategy and vCIO services",
      "Business VoIP",
      "Data center co-location",
      "Hardware procurement",
      "Secure AI platforms",
    ],
    employee: leadership.map((p) => ({
      "@type": "Person",
      name: p.name,
      jobTitle: p.role,
      sameAs: p.linkedin,
    })),
    subOrganization: [
      { "@type": "Organization", name: "Midwest VoIP", url: `${site.url}/voip` },
      { "@type": "Organization", name: "SafeHouse DataCenter", url: `${site.url}/data-center` },
    ],
  };
}

export function graphSchema(nodes: object[]) {
  return { "@context": "https://schema.org", "@graph": nodes };
}
