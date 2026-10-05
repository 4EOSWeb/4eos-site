import Link from "next/link";
import { CtaBand } from "@/components/site/CtaBand";
import { PageHero } from "@/components/site/PageHero";
import { Section } from "@/components/site/Section";
import { formatDate } from "@/lib/date";
import { pageMetadata } from "@/lib/metadata";
import { getPosts } from "@/lib/posts";

export const metadata = pageMetadata({
  title: "IT Insights for Growing Businesses",
  description:
    "Practical articles from 4EOS on managed IT, cybersecurity, and technology planning for businesses in Fort Wayne and Northeast Indiana.",
  path: "/blog",
});

export default function BlogIndex() {
  const posts = getPosts();

  return (
    <>
      <PageHero
        crumbs={[
          { name: "Resources", path: "/resources" },
          { name: "Insights", path: "/blog" },
        ]}
        title="Insights"
        lede="Plain-language articles on running technology well: choosing a provider, planning spend, and protecting the business."
      />
      <Section ariaLabel="Articles">
        <ol className="tile-grid">
          {posts.map((post) => (
            <li key={post.slug} className="tile">
              <p className="label">
                <time dateTime={post.date}>{formatDate(post.date)}</time> · {post.author}
              </p>
              <h2 className="t-title">{post.title}</h2>
              <p className="body-sm">{post.description}</p>
              <Link href={`/blog/${post.slug}`} className="svc-card-cta">
                Read the article
                <span aria-hidden="true" className="btn-arrow">
                  →
                </span>
                <span className="sr-only">: {post.title}</span>
              </Link>
            </li>
          ))}
        </ol>
      </Section>
      <CtaBand title="Rather talk it through?" topic="assessment" />
    </>
  );
}
