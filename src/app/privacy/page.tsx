import type { Metadata } from "next";
import { InnerPage } from "@/components/layout/InnerPage";
import { LegalSections } from "@/components/legal/LegalSections";
import { salesEmail } from "@/lib/content";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy",
  description: "What 4EOS collects on this website, and what we do with it.",
};

export default function PrivacyPage() {
  return (
    <InnerPage
      phase="discovery"
      kicker="Privacy"
      title="What this website collects."
      lede="Updated September 25, 2026. This covers 4eos.com. A signed service agreement covers work we do for a client."
    >
      <LegalSections
        sections={[
          {
            heading: "Who we are",
            paragraphs: [
              `${site.name}, ${site.address.street}, ${site.address.city}, ${site.address.region} ${site.address.postal}. Questions about this page go to ${site.helpdesk} or ${site.phone}.`,
            ],
          },
          {
            heading: "What you send us",
            paragraphs: [
              "The contact form and the support form ask for your name, email, company, phone, and a message. You choose what to type. We use it to reply and to open a ticket or an assessment.",
              "A phone number is used only to reply about that request. We do not use it for marketing calls or texts.",
              "A hidden field on those forms is there to catch automated submissions. If it is filled in, we discard the message.",
              "Do not send medical records, payment card numbers, passwords, or other sensitive files through the form. Call the help desk instead.",
            ],
          },
          {
            heading: "How we use it",
            paragraphs: [
              `The assessment form is delivered by an email service, Resend, to ${salesEmail}. The support form is delivered the same way to the help desk at ${site.helpdesk}. When the Rewst webhook is turned on, that same submission is posted there so a workflow can open a service ticket in ConnectWise. An assessment is sent as an assessment. A support request is sent as support. We do not sell personal information, and we do not share it for advertising.`,
              "We keep an inquiry for as long as we need it to respond and to keep a record of the request. Email us if you want a copy of a website inquiry, or if you want it deleted.",
            ],
          },
          {
            heading: "Cookies and logs",
            paragraphs: [
              "This site does not set advertising cookies. A first-party cookie stores a random visitor id so we can tell a new visit from a return visit. It is not tied to your name, email, or phone.",
              "Pages you open, roughly how long a page stays in view, scroll depth, and clicks on a phone number, an email address, or a contact link are stored in a database on our server. A contact or support form is counted as a request. The name, email, company, phone, and message you type are not copied into that database.",
              "Those facts are kept for about 400 days, then deleted. The host may also keep ordinary server logs, such as an IP address and browser type, to run and protect the site. The analytics database does not keep the IP address.",
              "If a company-lookup key is turned on later, we may store an organization name and its location from the network the visit came from. We do not store a person's name from that lookup.",
            ],
          },
          {
            heading: "Other sites",
            paragraphs: [
              "Facebook, LinkedIn, and X open on their own sites and follow their own rules. Remote support opens 4eos.screenconnect.com, a ConnectWise tool, and only when you choose that link.",
            ],
          },
          {
            heading: "Children",
            paragraphs: [
              "This site is for businesses. It is not directed at children, and we do not knowingly collect information from them.",
            ],
          },
        ]}
      />
    </InnerPage>
  );
}
