import type { Metadata } from "next";
import Link from "next/link";
import { Page } from "@/components/layout/Page";
import { Breath, Sheet } from "@/components/layout/Sheet";
import { IndustryIndex } from "@/components/industries/IndustryIndex";

export const metadata: Metadata = {
  title: "Industries",
  description:
    "Legal, insurance, healthcare, construction, manufacturing, and private equity.",
};

/** Frameworks already published across the site — safe to name here. */
const FRAMEWORKS = ["NIST CSF", "HIPAA", "PCI", "SEC"] as const;

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
        <div className="sheet-pad sheet-y">
          <IndustryIndex />
          <div className="mt-14 border-t border-hairline pt-8 md:mt-16">
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="micro text-fg-faint">Operated under</p>
                <ul className="mt-4 flex flex-wrap gap-x-8 gap-y-3">
                  {FRAMEWORKS.map((f) => (
                    <li key={f} className="display text-[clamp(1rem,1.6vw,1.4rem)]">
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
              <Link href="/contact" className="micro inline-flex text-gold">
                Request an assessment →
              </Link>
            </div>
          </div>
        </div>
      </Sheet>
    </Page>
  );
}
