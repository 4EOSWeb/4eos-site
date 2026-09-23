import type { Metadata } from "next";
import { Page } from "@/components/layout/Page";
import { Breath, Sheet } from "@/components/layout/Sheet";
import { PhaseLink } from "@/components/ui/PhaseLink";
import { industries } from "@/lib/content";

export const metadata: Metadata = {
  title: "Industries",
  description:
    "Legal, insurance, healthcare, construction, manufacturing, and private equity.",
};

export default function IndustriesPage() {
  return (
    <Page phase="industries">
      <section className="px-[var(--sheet-inset)] pb-10 pt-[6vh]">
        <p className="micro text-fg-muted">Industries</p>
        <h1 className="display page-display mt-5 max-w-[16ch]">
          We have seen your problems before.
        </h1>
      </section>
      <Breath size="md" />
      <Sheet tone="ink">
        <ol className="sheet-pad flex flex-col items-start gap-8 py-8">
          {industries.map((ind, i) => (
            <li key={ind.slug} className="max-w-[62ch]">
              <PhaseLink
                href={`/industries/${ind.slug}`}
                phase="industries"
                focus={i}
                className="inline-flex w-fit items-baseline gap-4 border-b border-hairline py-3 transition-colors hover:text-gold"
              >
                <span className="micro text-fg-faint">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="display text-[clamp(1.4rem,2.6vw,2rem)]">
                  {ind.title}
                </span>
              </PhaseLink>
              <p className="lede mt-3">{ind.lede}</p>
            </li>
          ))}
        </ol>
      </Sheet>
    </Page>
  );
}
