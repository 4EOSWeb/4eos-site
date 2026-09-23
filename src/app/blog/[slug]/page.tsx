import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { InnerPage } from "@/components/layout/InnerPage";
import { Mdx } from "@/components/blog/Mdx";
import { getPost, getPosts } from "@/lib/posts";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return { title: post.title, description: post.description };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  return (
    <InnerPage
      phase="discovery"
      kicker={`${formatDate(post.date)} · ${post.author}`}
      title={post.title}
      lede={post.description}
    >
      <Mdx source={post.body} />
      <Link href="/blog" className="micro mt-16 inline-flex text-gold">
        ← Journal
      </Link>
    </InnerPage>
  );
}

function formatDate(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
