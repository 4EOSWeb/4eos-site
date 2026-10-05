import { ogContentType, ogSize, renderOg } from "@/lib/og";
import { getPost, getPosts } from "@/lib/posts";

export const size = ogSize;
export const contentType = ogContentType;
export const alt = "An article from 4EOS Insights";

export function generateStaticParams() {
  return getPosts().map((p) => ({ slug: p.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return renderOg({ kicker: "4EOS Insights", title: getPost(slug)?.title ?? "Insights" });
}
