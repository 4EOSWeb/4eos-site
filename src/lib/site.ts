/**
 * Verified 4EOS facts. Nothing in this file may be invented — every value
 * here is sourced from the live 4eos.com site. Copy that makes a claim
 * must trace back to something in here.
 */

export const site = {
  name: "4EOS",
  tagline: "Modern IT Leadership for Growing Businesses",
  description:
    "Managed IT, cybersecurity, and compliance for Indiana businesses. Founded in Fort Wayne in 2002.",
  url: "https://www.4eos.com",
  founded: 2002,
  phone: "(260) 490-7740",
  phoneHref: "tel:+12604907740",
  helpdesk: "helpdesk@4eos.com",
  address: {
    street: "9815 Dawson's Creek Blvd.",
    city: "Fort Wayne",
    region: "IN",
    postal: "46825",
    country: "US",
  },
  updated: "2026-10-13",
  social: {
    facebook: "https://www.facebook.com/4EOSOfficial",
    linkedin: "https://www.linkedin.com/company/28155015",
    x: "https://x.com/4eosoffical",
  },
} as const;

export const addressLine = `${site.address.street}, ${site.address.city}, ${site.address.region} ${site.address.postal}`;

export const nav = [
  { label: "Services", href: "/services" },
  { label: "SecureAI", href: "/secureai" },
  { label: "Industries", href: "/industries" },
  { label: "Why 4EOS", href: "/why-4eos" },
  { label: "About", href: "/about" },
] as const;

/** The live 4eos.com bar, in that order. About stays in the menu. */
export const headerNav = [
  { label: "Services", href: "/services" },
  { label: "CompleteCare", href: "/#chapter-ownership" },
  { label: "SecureAI", href: "/secureai" },
  { label: "Industries", href: "/industries" },
  { label: "Why 4EOS", href: "/why-4eos" },
  { label: "FAQ", href: "/faq" },
] as const;

export const utilityNav = [
  { label: "Support", href: "/support" },
  { label: "Contact", href: "/contact" },
  { label: "FAQ", href: "/faq" },
] as const;
