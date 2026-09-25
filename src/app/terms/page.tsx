import type { Metadata } from "next";
import { InnerPage } from "@/components/layout/InnerPage";
import { LegalSections } from "@/components/legal/LegalSections";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms",
  description: "Rules for using the 4EOS website. Client work is covered by a signed agreement.",
};

export default function TermsPage() {
  return (
    <InnerPage
      phase="discovery"
      kicker="Terms"
      title="Rules for using this website."
      lede="Updated September 25, 2026. These terms cover the site. They are not a quote, and they do not replace a signed agreement."
    >
      <LegalSections
        sections={[
          {
            heading: "The site and the work",
            paragraphs: [
              "Pages describe what 4EOS does in general. They are not a promise of a particular price, response time, or security outcome. Work for a client is governed by the written agreement for that work.",
              "Nothing on the site is legal, tax, accounting, or compliance advice. Sending a form does not make you a client. A client relationship starts with a signed agreement.",
              "Remote support is for an existing client when we ask you to connect. The button opens a third-party session tool. Do not use it unless we have asked you to.",
            ],
          },
          {
            heading: "Acceptable use",
            paragraphs: [
              "Use the site for lawful purposes. Do not attempt to break it, overload it, probe it without permission, or send malware through a form.",
              "Do not copy the site, the field, or the writing for your own commercial use without written permission.",
            ],
          },
          {
            heading: "Copyright",
            paragraphs: [
              `The writing, marks, and design on this site belong to ${site.name} unless a credit says otherwise. To report a copyright concern, email ${site.helpdesk} with the page address and a description of the work.`,
            ],
          },
          {
            heading: "Other sites",
            paragraphs: [
              "Links to social networks and to remote support leave this site. We are not responsible for those sites or for what you do after you leave.",
            ],
          },
          {
            heading: "Liability",
            paragraphs: [
              "The site is provided as it is. To the extent the law allows, 4EOS is not liable for damages that come from using the website itself, including interrupted access or a mistake on a page.",
              "Some states do not allow certain limits. In those cases the limit applies only as far as the law allows. Nothing here limits liability that the law says cannot be limited.",
            ],
          },
          {
            heading: "Law",
            paragraphs: [
              `These website terms are governed by the laws of the State of Indiana. Disputes about the website are heard in the state or federal courts located in Allen County, Indiana. Questions: ${site.helpdesk}, ${site.phone}.`,
            ],
          },
        ]}
      />
    </InnerPage>
  );
}
