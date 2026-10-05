import { IntakeForm } from "@/components/forms/IntakeForm";
import type { TopicValue } from "@/lib/content";
import { consultHref, consultLabel, site } from "@/lib/site";
import { ButtonLink } from "./Button";
import { Glyph } from "./Glyph";

export function CtaBand({
  id = "consultation",
  title = "Get technology leadership that moves your business forward.",
  lede = "Tell us where things stand. A senior engineer will follow up within one business day to schedule a consultation or a free IT assessment.",
  form = true,
  topic = "assessment",
}: {
  id?: string;
  title?: string;
  lede?: string;
  form?: boolean;
  topic?: TopicValue;
}) {
  const headingId = `${id}-title`;
  return (
    <section id={id} aria-labelledby={headingId} className="section surface-ink">
      <div className="wrap">
        <div className={form ? "split" : ""}>
          <div className="section-head">
            <h2 id={headingId} className="display t-section">
              {title}
            </h2>
            <p className="lede">{lede}</p>
            <ul className="mt-8 grid gap-3">
              <li>
                <a href={site.phoneHref} className="link-arrow">
                  <Glyph name="call" size={18} className="accent" />
                  Call {site.phone}
                </a>
              </li>
              <li>
                <a href={`mailto:${site.sales}`} className="link-arrow">
                  <Glyph name="mail" size={18} className="accent" />
                  Email {site.sales}
                </a>
              </li>
              <li className="body-sm flex items-center gap-3">
                <Glyph name="clock" size={18} className="accent" />
                {site.hours}
              </li>
            </ul>
            {form ? null : (
              <div className="actions mt-8">
                <ButtonLink href={`${consultHref}?topic=${topic}`} size="lg">
                  {consultLabel}
                </ButtonLink>
              </div>
            )}
          </div>
          {form ? (
            <div>
              <IntakeForm endpoint="/api/contact" intent="assessment" submitLabel={consultLabel} defaultTopic={topic} compact />
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
