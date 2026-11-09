import type { Metadata } from "next";
import { Page } from "@/components/layout/Page";
import { Sheet } from "@/components/layout/Sheet";
import { PageIntro, subpageColumn } from "@/components/layout/Subpage";
import { PhaseLink } from "@/components/ui/PhaseLink";
import { ServiceTitle } from "@/components/ui/ServiceTitle";
import { services } from "@/lib/content";
import { withCanonical } from "@/lib/metadata";

export const metadata: Metadata = withCanonical("/services", {
  title: "Services",
  description:
    "CompleteCare managed IT, cybersecurity, cloud, VoIP, data center, and hardware procurement.",
});

export default function ServicesPage() {
  return (
    <Page phase="unmanaged">
      <section className="px-[var(--sheet-inset)] pb-8 pt-[6vh]">
        <div className={subpageColumn("wide")}>
          <PageIntro
            field
            backHref="/"
            backLabel="Home"
            eyebrow="Practice"
            title={
              <>
                IT, phones,
                <br />
                and the data center.
              </>
            }
            titleClassName="[text-wrap:wrap]"
          />
        </div>
      </section>
      <Sheet tone="ink">
        <ol className={`${subpageColumn("wide")} divide-y divide-hairline py-[clamp(2rem,5vh,3.5rem)]`}>
          {services.map((s, i) => (
            <li key={s.slug}>
              <PhaseLink
                href={`/services/${s.slug}`}
                phase={s.phase}
                className="group grid gap-4 py-7 md:grid-cols-12"
              >
                <span className="micro text-fg-faint md:col-span-1">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="display text-[clamp(1.4rem,2.6vw,2rem)] md:col-span-5 group-hover:text-gold">
                  {s.title}
                </span>
                <span className="lede md:col-span-6">
                  <ServiceTitle title={s.statement} />
                </span>
              </PhaseLink>
            </li>
          ))}
        </ol>
      </Sheet>
    </Page>
  );
}
