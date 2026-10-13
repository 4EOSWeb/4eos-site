import { addressLine, site } from "@/lib/site";

export function GET() {
  return Response.json({
    name: site.name,
    legalName: site.legalName,
    title: site.name,
    description: site.description,
    url: site.url,
    tagline: site.tagline,
    docs: `${site.url}/llms.txt`,
    source: site.url,
    lastModified: site.updated,
    foundingDate: String(site.founded),
    areaServed: "Indiana",
    telephone: site.phone,
    email: site.helpdesk,
    address: addressLine,
    sameAs: [
      site.social.linkedin,
      site.social.facebook,
      site.social.google,
      site.social.x,
    ],
  });
}
