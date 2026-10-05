export function LegalSections({
  sections,
}: {
  sections: { heading: string; paragraphs: string[] }[];
}) {
  return (
    <div className="max-w-[68ch]">
      {sections.map((section) => (
        <section key={section.heading} className="border-t border-hairline py-8 last:border-b">
          <h2 className="text-[clamp(1.15rem,1.6vw,1.35rem)] tracking-tight">{section.heading}</h2>
          {section.paragraphs.map((paragraph) => (
            <p key={paragraph} className="body-sm mt-4">
              {paragraph}
            </p>
          ))}
        </section>
      ))}
    </div>
  );
}
