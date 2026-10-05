import { getService, industries, type GlyphName } from "./content";
import { site } from "./site";

export type MenuLink = {
  href: string;
  label: string;
  line?: string;
  glyph?: GlyphName;
  external?: boolean;
};

export type MenuGroup = { heading: string; links: MenuLink[] };

export type MenuFeature = {
  title: string;
  body: string;
  href: string;
  label: string;
};

export type NavEntry =
  | { kind: "link"; label: string; bar?: string; href: string; match?: string[] }
  | {
      kind: "menu";
      id: string;
      label: string;
      bar?: string;
      overview: MenuLink;
      groups: MenuGroup[];
      feature: MenuFeature;
      match: string[];
    };

function serviceLink(slug: Parameters<typeof getService>[0]): MenuLink {
  const s = getService(slug);
  return { href: s.href, label: s.short, line: s.menuLine, glyph: s.glyph };
}

export const mainNav: NavEntry[] = [
  {
    kind: "menu",
    id: "services",
    label: "Managed IT Services",
    bar: "Managed IT",
    overview: { href: "/services", label: "All services" },
    match: ["/managed-it", "/services", "/voip", "/data-center", "/hardware", "/secureai"],
    groups: [
      {
        heading: "Run and protect",
        links: [
          serviceLink("managed-it"),
          serviceLink("backup-disaster-recovery"),
          serviceLink("network-infrastructure"),
        ],
      },
      {
        heading: "Secure and modernize",
        links: [
          serviceLink("cybersecurity"),
          {
            href: "/secureai",
            label: "SecureAI",
            line: "60+ AI models on one secure, managed platform",
            glyph: "ai",
          },
          serviceLink("cloud-microsoft-365"),
          serviceLink("hardware"),
        ],
      },
      {
        heading: "The 4EOS family",
        links: [serviceLink("voip"), serviceLink("data-center")],
      },
    ],
    feature: {
      title: "Start with a free IT assessment",
      body: "A senior engineer reviews your environment and ranks the risks by business impact. No obligation.",
      href: "/contact?topic=assessment",
      label: "Get an IT Assessment",
    },
  },
  { kind: "link", label: "Cybersecurity", href: "/cybersecurity" },
  { kind: "link", label: "Cloud & Microsoft 365", bar: "Cloud & M365", href: "/cloud-microsoft-365" },
  { kind: "link", label: "IT Strategy / vCIO", bar: "IT Strategy", href: "/it-strategy" },
  {
    kind: "menu",
    id: "industries",
    label: "Industries / Who We Help",
    bar: "Industries",
    overview: { href: "/industries", label: "Who we help" },
    match: ["/industries"],
    groups: [
      {
        heading: "Industries we support",
        links: industries.slice(0, 3).map((i) => ({
          href: `/industries/${i.slug}`,
          label: i.title,
          line: i.offer,
        })),
      },
      {
        heading: "\u00a0",
        links: industries.slice(3).map((i) => ({
          href: `/industries/${i.slug}`,
          label: i.title,
          line: i.offer,
        })),
      },
    ],
    feature: {
      title: "Not on the list?",
      body: "4EOS supports growing businesses of every kind across Fort Wayne and Northeast Indiana. Tell us how yours works.",
      href: "/contact?topic=other",
      label: "Talk to an IT Expert",
    },
  },
  { kind: "link", label: "About 4EOS", bar: "About", href: "/about" },
  {
    kind: "menu",
    id: "resources",
    label: "Resources",
    overview: { href: "/resources", label: "All resources" },
    match: ["/resources", "/blog", "/faq", "/support"],
    groups: [
      {
        heading: "Learn",
        links: [
          { href: "/blog", label: "Insights", line: "Articles on managed IT, security, and planning" },
          { href: "/faq", label: "FAQ", line: "Pricing, switching providers, assessments, and more" },
        ],
      },
      {
        heading: "Existing clients",
        links: [
          { href: "/support", label: "Client support", line: `Help desk, ${site.hoursShort}` },
          {
            href: site.remoteSupportUrl,
            label: "Start a remote session",
            line: "Only when a 4EOS engineer asks you to",
            external: true,
          },
        ],
      },
    ],
    feature: {
      title: "Need help right now?",
      body: `Existing clients can call the help desk at ${site.phone}. Outages get priority.`,
      href: site.phoneHref,
      label: `Call ${site.phone}`,
    },
  },
  { kind: "link", label: "Contact", href: "/contact" },
];

export function isActive(pathname: string, match: string[]) {
  return match.some((m) => pathname === m || pathname.startsWith(`${m}/`));
}
