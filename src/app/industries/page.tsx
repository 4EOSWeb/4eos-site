import type { Metadata } from "next";
import Link from "next/link";
import type { CSSProperties } from "react";
import { Page } from "@/components/layout/Page";
import { Sheet } from "@/components/layout/Sheet";
import { PageIntro, subpageColumn } from "@/components/layout/Subpage";
import { industries } from "@/lib/content";
import { withCanonical } from "@/lib/metadata";

export const metadata: Metadata = withCanonical("/industries", {
  title: "Industries",
  description:
    "Legal, insurance, healthcare, construction, manufacturing, and private equity.",
});

/**
 * The standalone index. Plain links on purpose: the dive through the die
 * belongs to the homepage chapter, and this page should read like a list.
 */
export default function IndustriesPage() {
  return (
    <Page phase="discovery">
      <section className="px-[var(--sheet-inset)] pb-8 pt-[6vh]">
        <div className={subpageColumn("wide")}>
          <PageIntro
            field
            backHref="/"
            backLabel="Home"
            eyebrow="Industries"
            title={
              <>
                We have seen
                <br />
                your problems
                <br />
                before.
              </>
            }
            titleClassName="[text-wrap:wrap]"
          />
        </div>
      </section>
      <Sheet tone="ink">
        <ol className={`${subpageColumn("wide")} reveal-rows flex flex-col items-start gap-8 py-[clamp(2rem,5vh,3.5rem)]`}>
          {industries.map((ind, i) => (
            <li key={ind.slug} className="max-w-[62ch]" style={{ "--row": i } as CSSProperties}>
              <Link
                href={`/industries/${ind.slug}`}
                className="inline-flex w-fit items-baseline gap-4 border-b border-hairline py-3 transition-colors hover:text-gold"
              >
                <span className="micro text-fg-faint">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="display text-[clamp(1.4rem,2.6vw,2rem)]">
                  {ind.title}
                </span>
              </Link>
              <p className="lede mt-3">{ind.lede}</p>
            </li>
          ))}
        </ol>
      </Sheet>
    </Page>
  );
}
