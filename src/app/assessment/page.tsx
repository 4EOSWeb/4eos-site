import type { Metadata } from "next";
import { Page } from "@/components/layout/Page";
import { Sheet } from "@/components/layout/Sheet";
import { PageIntro, subpageColumn } from "@/components/layout/Subpage";
import { RiskQuiz } from "@/components/forms/RiskQuiz";
import { withCanonical } from "@/lib/metadata";

export const metadata: Metadata = withCanonical("/assessment", {
  title: "IT Risk Quiz",
  description:
    "Twelve questions on business, cybersecurity, backup, compliance, infrastructure, and support. Get a risk score and a read on each area.",
});

export default function AssessmentPage() {
  return (
    <Page phase="discovery">
      <section className="px-[var(--sheet-inset)] pb-6 pt-[6vh]">
        <div className={subpageColumn("wide")}>
          <PageIntro
            field
            backHref="/"
            backLabel="Home"
            eyebrow="Free IT assessment"
            title={
              <>
                How exposed is
                <br />
                <span className="text-gold">your environment?</span>
              </>
            }
            titleClassName="max-w-[18ch]"
            description="A twelve-question self-check across the six areas we review on every engagement. You get a risk score and a short read on each area. Nothing is sent until you ask for the full assessment."
          />
        </div>
      </section>
      <Sheet tone="ink">
        <div className={`${subpageColumn("wide")} py-[clamp(2rem,5vh,3.5rem)]`}>
          <RiskQuiz />
        </div>
      </Sheet>
    </Page>
  );
}
