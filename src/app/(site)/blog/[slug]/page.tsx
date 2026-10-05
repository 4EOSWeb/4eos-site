import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Mdx } from "@/components/blog/Mdx";
import { JsonLd } from "@/components/seo/JsonLd";
import { ButtonLink } from "@/components/site/Button";
import { CtaBand } from "@/components/site/CtaBand";
import { PageHero } from "@/components/site/PageHero";
import { Section } from "@/components/site/Section";
import { formatDate } from "@/lib/date";
import { pageMetadata } from "@/lib/metadata";
import { getPost, getPosts } from "@/lib/posts";
import { articleSchema } from "@/lib/schema";

export function generateStaticParams() {
  return getPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const post = getPost((await params).slug);
  if (!post) return {};
  return pageMetadata({
    title: post.title,
    description: post.description,
    path: `/blog/${post.slug}`,
    type: "article",
  });
}

export default async function PostPage({ params }: PageProps<"/blog/[slug]">) {
  const post = getPost((await params).slug);
  if (!post) notFound();
  const path = `/blog/${post.slug}`;

  return (
    <>
      <JsonLd data={articleSchema({ ...post, path })} />
      <PageHero
        crumbs={[
          { name: "Insights", path: "/blog" },
          { name: post.title, path },
        ]}
        kicker={
          <p className="label">
            <time dateTime={post.date}>{formatDate(post.date)}</time> · {post.author}
          </p>
        }
        title={post.title}
        lede={post.description}
      />
      <Section ariaLabel="Article">
        <article>
          <Mdx source={post.body} />
        </article>
        <div className="actions mt-12">
          <ButtonLink href="/blog" variant="secondary">
            More insights
          </ButtonLink>
        </div>
      </Section>
      <CtaBand title="Put this into practice with 4EOS." topic="assessment" />
    </>
  );
}
