/**
 * Verified 4EOS facts. Every value here is published on 4eos.com or in its
 * structured data. Contact details are rendered from this file everywhere,
 * so they cannot drift between the header, footer, forms, and schema.
 */

export const site = {
  name: "4EOS",
  legalName: "Experienced Office Solutions",
  tagline: "Modern IT leadership for growing businesses.",
  description:
    "Managed IT, cybersecurity, cloud and Microsoft 365, backup and disaster recovery, and IT strategy for growing businesses in Fort Wayne and Northeast Indiana. Founded in 2002.",
  url: "https://www.4eos.com",
  founded: 2002,
  /** Last substantive content revision, for dateModified and feeds. Bump with content changes. */
  updated: "2026-10-05",
  phone: "(260) 490-7740",
  phoneHref: "tel:+12604907740",
  phoneIntl: "+1-260-490-7740",
  fax: "(260) 490-7925",
  faxIntl: "+1-260-490-7925",
  helpdesk: "helpdesk@4eos.com",
  sales: "sales@4eos.com",
  hours: "Monday to Friday, 8:00 AM to 5:00 PM Eastern",
  hoursShort: "Mon–Fri, 8–5 ET",
  address: {
    street: "9815 Dawson's Creek Blvd.",
    city: "Fort Wayne",
    region: "IN",
    regionName: "Indiana",
    postal: "46825",
    country: "US",
  },
  serviceArea: "Fort Wayne and Northeast Indiana",
  partners: ["Dell", "Microsoft", "Cisco"],
  rating: {
    value: "4.8",
    count: 16,
    source: "Google",
    reviewUrl: "https://g.page/r/CbgYFdrdDa0rEAI/review",
  },
  remoteSupportUrl: "https://4eos.screenconnect.com",
  social: {
    facebook: "https://www.facebook.com/4EOSOfficial",
    linkedin: "https://www.linkedin.com/company/28155015",
    x: "https://x.com/4eosoffical",
  },
} as const;

export const addressLine = `${site.address.street}, ${site.address.city}, ${site.address.region} ${site.address.postal}`;

export const leadership = [
  {
    name: "Tyson Howard",
    role: "Chief Executive Officer",
    focus: "IT strategy, managed services, and business operations",
    linkedin: "https://www.linkedin.com/in/tyson-howard-mba-9186227b/",
  },
  {
    name: "Adam Steury",
    role: "Chief Revenue Officer",
    focus: "Managed IT services, client partnerships, and business growth",
    linkedin: "https://www.linkedin.com/in/steury/",
  },
  {
    name: "Connor Heminger",
    role: "Director, Operations and Sales",
    focus: "Service operations, client onboarding, and support delivery",
    linkedin: "https://www.linkedin.com/in/connor-heminger-00265a181/",
  },
  {
    name: "Rhett Godwin",
    role: "Lead Engineer",
    focus: "Network engineering, cybersecurity, and IT infrastructure",
    linkedin: "https://www.linkedin.com/in/rhett-godwin-b88520264/",
  },
  {
    name: "Sam King",
    role: "vCIO",
    focus: "IT strategy, technology roadmaps, and virtual CIO services",
    linkedin: "https://www.linkedin.com/in/sam-king-937831199/",
  },
] as const;

export const consultHref = "/contact";
export const consultLabel = "Schedule a Consultation";
