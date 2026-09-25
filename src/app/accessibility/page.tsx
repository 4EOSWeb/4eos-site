import type { Metadata } from "next";
import { InnerPage } from "@/components/layout/InnerPage";
import { LegalSections } from "@/components/legal/LegalSections";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Accessibility",
  description: "How to reach 4EOS if a page on this website is hard to use.",
};

export default function AccessibilityPage() {
  return (
    <InnerPage
      phase="discovery"
      kicker="Accessibility"
      title="If a page is hard to use, tell us."
      lede="We want the site to work with a keyboard, a screen reader, and readable type."
    >
      <LegalSections
        sections={[
          {
            heading: "What we aim for",
            paragraphs: [
              "Pages use text you can resize, controls you can reach with a keyboard, and labels on forms. The particle field behind the pages is decorative and is hidden from assistive technology.",
              "If motion makes the site hard to use, turn on reduced motion in your operating system. The field then holds still.",
            ],
          },
          {
            heading: "If something blocks you",
            paragraphs: [
              `Email ${site.helpdesk} or call ${site.phone}. Tell us the page and what you were trying to do. We will answer and work on a fix.`,
              "If you need the same information another way, we will provide it. You do not have to use the website to reach the help desk.",
            ],
          },
        ]}
      />
    </InnerPage>
  );
}
