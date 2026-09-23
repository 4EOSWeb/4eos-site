/**
 * Verified 4EOS facts. Nothing in this file may be invented — every value
 * here is sourced from the live 4eos.com site. Copy that makes a claim
 * must trace back to something in here.
 */

export const site = {
  name: "4EOS",
  tagline: "IT That Works for You. Not the Other Way Around.",
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
  social: {
    linkedin: "https://www.linkedin.com/company/4eos",
    facebook: "https://www.facebook.com/4EOSFortWayne",
  },
} as const;

export const addressLine = `${site.address.street}, ${site.address.city}, ${site.address.region} ${site.address.postal}`;

export const nav = [
  { label: "Services", href: "/services" },
  { label: "SecureAI", href: "/secureai" },
  { label: "Industries", href: "/industries" },
  { label: "Why 4EOS", href: "/why-4eos" },
  { label: "About", href: "/about" },
  { label: "Journal", href: "/blog" },
] as const;

export const utilityNav = [
  { label: "Support", href: "/support" },
  { label: "Contact", href: "/contact" },
  { label: "FAQ", href: "/faq" },
] as const;
