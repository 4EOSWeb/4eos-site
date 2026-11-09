import type { Metadata } from "next";
import Link from "next/link";
import { Page } from "@/components/layout/Page";
import { Sheet } from "@/components/layout/Sheet";
import { PageIntro, subpageColumn } from "@/components/layout/Subpage";
import { getPosts } from "@/lib/posts";
import { withCanonical } from "@/lib/metadata";

export const metadata: Metadata = withCanonical("/blog", {
  title: "Journal",
  description: "Notes on managed IT, security, and running a business in Fort Wayne.",
});

export default function BlogIndex() {
  const posts = getPosts();

  return (
    <Page phase="discovery">
      <section className="px-[var(--sheet-inset)] pb-8 pt-[6vh]">
        <div className={subpageColumn("wide")}>
          <PageIntro
            field
            backHref="/"
            backLabel="Home"
            eyebrow="Journal"
            title="Notes from the work."
            titleClassName="max-w-[14ch]"
          />
        </div>
      </section>
      <Sheet tone="ink">
        <ol className={`${subpageColumn("wide")} divide-y divide-hairline py-[clamp(2rem,5vh,3.5rem)]`}>
          {posts.map((post) => (
            <li key={post.slug}>
              <Link href={`/blog/${post.slug}`} className="group block py-10">
                <p className="micro text-fg-faint">
                  {formatDate(post.date)} · {post.author}
                </p>
                <h2 className="display mt-4 max-w-[22ch] text-[clamp(1.4rem,2.6vw,2rem)] group-hover:text-gold">
                  {post.title}
                </h2>
                <p className="lede mt-4 max-w-[56ch]">{post.description}</p>
              </Link>
            </li>
          ))}
        </ol>
      </Sheet>
    </Page>
  );
}

function formatDate(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
