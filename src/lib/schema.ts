import { hours, leadership } from "@/lib/content";
import { site } from "@/lib/site";

type Qa = { q: string; a: string };

const orgId = `${site.url}/#organization`;
const siteId = `${site.url}/#website`;
const pageId = `${site.url}/#webpage`;

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
    provider: { "@id": orgId },
  };
}

export function industryPageSchema(industry: { title: string; lede: string; slug: string }) {
  return {
    "@type": "WebPage",
    name: industry.title,
    description: industry.lede,
    url: `${site.url}/industries/${industry.slug}`,
    about: { "@id": orgId },
  };
}

export function websiteSchema() {
  return {
    "@type": "WebSite",
    "@id": siteId,
    name: site.name,
    url: site.url,
    description: site.description,
    inLanguage: "en-US",
    dateModified: site.updated,
    publisher: { "@id": orgId },
    potentialAction: {
      "@type": "ContactAction",
      name: "Request a free IT assessment",
      target: `${site.url}/assessment`,
    },
  };
}

export function homePageSchema() {
  return {
    "@type": "WebPage",
    "@id": pageId,
    url: site.url,
    name: `${site.name} | ${site.tagline}`,
    headline: site.tagline,
    description: site.description,
    inLanguage: "en-US",
    datePublished: site.updated,
    dateModified: site.updated,
    isPartOf: { "@id": siteId },
    about: { "@id": orgId },
    author: { "@id": orgId },
    publisher: { "@id": orgId },
  };
}

export function organizationSchema() {
  const people = leadership.flatMap((person) => {
    if (!person.name) return [];
    return [
      {
        "@type": "Person",
        "@id": `${site.url}/#${person.jobTitle.toLowerCase().replaceAll(" ", "-")}`,
        name: person.name,
        jobTitle: person.jobTitle,
        worksFor: { "@id": orgId },
      },
    ];
  });

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["Organization", "ProfessionalService"],
        "@id": orgId,
        name: site.name,
        legalName: site.name,
        description: site.description,
        url: site.url,
        telephone: site.phone,
        email: site.helpdesk,
        foundingDate: String(site.founded),
        dateModified: site.updated,
        areaServed: "Indiana",
        logo: `${site.url}/brand/4eos-icon.svg`,
        image: `${site.url}/brand/4eos-icon.svg`,
        sameAs: [site.social.facebook, site.social.linkedin, site.social.x],
        address: {
          "@type": "PostalAddress",
          streetAddress: site.address.street,
          addressLocality: site.address.city,
          addressRegion: site.address.region,
          postalCode: site.address.postal,
          addressCountry: site.address.country,
        },
        contactPoint: [
          {
            "@type": "ContactPoint",
            contactType: "customer support",
            telephone: site.phone,
            email: site.helpdesk,
            areaServed: "US",
            availableLanguage: "English",
          },
          {
            "@type": "ContactPoint",
            contactType: "sales",
            url: `${site.url}/contact`,
            telephone: site.phone,
            areaServed: "US",
            availableLanguage: "English",
          },
        ],
        openingHoursSpecification: {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
          opens: "08:00",
          closes: "17:00",
          description: hours,
        },
        employee: people.map((person) => ({ "@id": person["@id"] })),
      },
      websiteSchema(),
      ...people,
    ],
  };
}

export function graphSchema(nodes: object[]) {
  return { "@context": "https://schema.org", "@graph": nodes };
}
