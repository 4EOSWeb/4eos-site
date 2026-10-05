import { industries } from "@/lib/content";
import { ogContentType, ogSize, renderOg } from "@/lib/og";

export const size = ogSize;
export const contentType = ogContentType;
export const alt = "4EOS IT services by industry";

export function generateStaticParams() {
  return industries.map((i) => ({ slug: i.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const industry = industries.find((i) => i.slug === slug);
  return renderOg({ kicker: `IT for ${industry?.title ?? "your industry"}`, title: industry?.headline ?? "Industries" });
}
