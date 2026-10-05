import type { ReactNode } from "react";
import { PageHero } from "@/components/site/PageHero";

export function LegalPage({
  title,
  lede,
  path,
  children,
}: {
  title: string;
  lede: string;
  path: string;
  children: ReactNode;
}) {
  return (
    <>
      <PageHero crumbs={[{ name: title, path }]} title={title} lede={lede} />
      <section className="section surface-paper" aria-label={`${title} details`}>
        <div className="wrap">{children}</div>
      </section>
    </>
  );
}

export function LegalSections({
  sections,
}: {
  sections: { heading: string; paragraphs: string[] }[];
}) {
  return (
    <div className="prose">
      {sections.map((section) => (
        <section key={section.heading} className="border-t border-[var(--line)] pt-8 first:border-t-0 first:pt-0">
          <h2 className="!mt-0">{section.heading}</h2>
          {section.paragraphs.map((paragraph) => (
            <p key={paragraph} className="mt-4">
              {paragraph}
            </p>
          ))}
        </section>
      ))}
    </div>
  );
}
