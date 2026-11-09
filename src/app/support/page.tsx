import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro, SubpageShell } from "@/components/layout/Subpage";
import { IntakeForm } from "@/components/forms/IntakeForm";
import { site } from "@/lib/site";
import { hours } from "@/lib/content";
import { withCanonical } from "@/lib/metadata";

export const metadata: Metadata = withCanonical("/support", {
  title: "Support",
  description: `Existing clients: reach the 4EOS help desk. ${site.phone} · ${site.helpdesk}.`,
});

const channels = [
  {
    label: "Call",
    value: site.phone,
    href: site.phoneHref,
    note: "Fastest for anything urgent.",
  },
  {
    label: "Email",
    value: site.helpdesk,
    href: `mailto:${site.helpdesk}`,
    note: "Creates a ticket automatically.",
  },
  {
    label: "Hours",
    value: hours,
    note: "CompleteCare monitoring runs 24/7.",
  },
];

export default function SupportPage() {
  return (
    <SubpageShell phase="unmanaged" width="wide">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <PageIntro
              backHref="/"
              backLabel="Home"
              eyebrow="Help desk"
              title="Existing client. We already know the environment."
              description="Down completely? Call, do not email. Outages get priority."
            />
            <Link
              href="/support/remote"
              className="bar-btn bar-btn-line bar-btn-glow mt-8 inline-flex h-auto min-h-11 px-4 py-3 text-center"
              style={{ whiteSpace: "normal" }}
            >
              Start a Remote Support Session
            </Link>
            <ul className="mt-12">
              {channels.map((c) => (
                <li key={c.label} className="border-t border-hairline py-5 last:border-b">
                  <p className="micro text-fg-faint">{c.label}</p>
                  {c.href ? (
                    <a href={c.href} className="mt-1 block text-[17px] tracking-tight hover:text-gold">
                      {c.value}
                    </a>
                  ) : (
                    <p className="mt-1 text-[17px] tracking-tight">{c.value}</p>
                  )}
                  <p className="body-sm mt-1">{c.note}</p>
                </li>
              ))}
            </ul>
          </div>
          <div className="md:col-span-6 md:col-start-7">
            <IntakeForm
              endpoint="/api/support"
              intent="support"
              submitLabel="Open ticket"
            />
          </div>
        </div>
    </SubpageShell>
  );
}
