import { IntakeForm } from "@/components/forms/IntakeForm";
import { ButtonLink } from "@/components/site/Button";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { Glyph } from "@/components/site/Glyph";
import { pageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Client Support and Help Desk",
  description: `Existing 4EOS clients can reach the help desk at ${site.phone} or ${site.helpdesk}, start a remote session, or open a ticket online.`,
  path: "/support",
});

const channels = [
  {
    glyph: "call" as const,
    title: "Call the help desk",
    body: "The fastest route for anything urgent. If people cannot work, call rather than email.",
    href: site.phoneHref,
    link: site.phone,
  },
  {
    glyph: "mail" as const,
    title: "Email a ticket",
    body: "Sending to the help desk address opens a ticket automatically.",
    href: `mailto:${site.helpdesk}`,
    link: site.helpdesk,
  },
  {
    glyph: "clock" as const,
    title: "Hours",
    body: `${site.hours}. CompleteCare monitoring runs around the clock.`,
    href: null,
    link: null,
  },
];

export default function SupportPage() {
  return (
    <section className="surface-ink" aria-labelledby="support-title">
      <div className="wrap pb-[var(--section-y)] pt-8">
        <Breadcrumbs
          items={[
            { name: "Resources", path: "/resources" },
            { name: "Client support", path: "/support" },
          ]}
        />
        <div className="split mt-10">
          <div className="section-head">
            <h1 id="support-title" className="display t-page">
              Client support
            </h1>
            <p className="lede">
              For existing 4EOS clients. Your engineers already know the environment, so tell us what is happening and
              we will pick it up from there.
            </p>
            <div className="actions">
              <ButtonLink href={site.phoneHref} size="lg">
                Call {site.phone}
              </ButtonLink>
              <ButtonLink href={site.remoteSupportUrl} variant="secondary" size="lg" external>
                Start a remote session
                <span className="sr-only"> (opens in a new tab)</span>
              </ButtonLink>
            </div>
            <ul className="rule-list mt-6">
              {channels.map((c) => (
                <li key={c.title} className="flex gap-4 !py-5">
                  <Glyph name={c.glyph} size={20} className="accent mt-1 shrink-0" />
                  <div>
                    <h2 className="t-title-sm">{c.title}</h2>
                    <p className="body-sm mt-1">{c.body}</p>
                    {c.href ? (
                      <a href={c.href} className="text-link mt-2 inline-block">
                        {c.link}
                      </a>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="t-title mb-6">Open a ticket</h2>
            <IntakeForm endpoint="/api/support" intent="support" submitLabel="Open a ticket" showTopic={false} />
          </div>
        </div>
      </div>
    </section>
  );
}
