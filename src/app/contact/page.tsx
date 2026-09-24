import type { Metadata } from "next";
import { Page } from "@/components/layout/Page";
import { BackLink } from "@/components/ui/BackLink";
import { Sheet } from "@/components/layout/Sheet";
import { IntakeForm } from "@/components/forms/IntakeForm";
import { addressLine, site } from "@/lib/site";
import { hours, salesEmail } from "@/lib/content";

export const metadata: Metadata = {
  title: "Contact",
  description: `Request a free IT assessment. ${site.phone} · ${addressLine}.`,
};

const routes = [
  { label: "Phone", value: site.phone, href: site.phoneHref },
  { label: "Support", value: site.helpdesk, href: `mailto:${site.helpdesk}` },
  { label: "New clients", value: salesEmail, href: `mailto:${salesEmail}` },
  { label: "Office", value: addressLine },
  { label: "Hours", value: hours },
];

export default function ContactPage() {
  return (
    <Page phase="discovery">
      <Sheet tone="bone" className="min-h-[calc(100svh-var(--nav-h)-var(--sheet-inset))]">
        <div className="sheet-pad sheet-y grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <BackLink href="/" label="Home" tone="bone" />
            <h1 className="display page-display mt-6 text-bone-fg">
              Tell us about the environment.
            </h1>
            <p className="mt-8 text-[15px] leading-relaxed tracking-tight text-bone-muted">
              New client. A senior engineer, not a salesperson, follows up.
              Existing client with an issue — use Support.
            </p>
            <ul className="mt-12">
              {routes.map((r) => (
                <li
                  key={r.label}
                  className="border-t border-dashed border-[rgba(149,145,128,0.4)] py-4 last:border-b"
                >
                  <p className="micro text-bone-faint">{r.label}</p>
                  {r.href ? (
                    <a
                      href={r.href}
                      className="mt-1 block text-[15px] tracking-tight text-bone-fg hover:text-[color:var(--color-navy-deep)]"
                    >
                      {r.value}
                    </a>
                  ) : (
                    <p className="mt-1 text-[15px] tracking-tight">{r.value}</p>
                  )}
                </li>
              ))}
            </ul>
          </div>
          <div className="md:col-span-6 md:col-start-7">
            <IntakeForm
              endpoint="/api/contact"
              intent="assessment"
              submitLabel="Send"
            />
          </div>
        </div>
      </Sheet>
    </Page>
  );
}
