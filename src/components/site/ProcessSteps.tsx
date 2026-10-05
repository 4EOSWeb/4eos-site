import { engagement } from "@/lib/content";

export function ProcessSteps({ headingLevel = 3 }: { headingLevel?: 3 | 4 }) {
  const H = headingLevel === 3 ? "h3" : "h4";
  return (
    <ol className="steps">
      {engagement.map((step) => (
        <li key={step.title} className="step">
          <H className="t-title">{step.title}</H>
          <p className="body-sm">{step.body}</p>
          <ul aria-label={`${step.title} deliverables`}>
            {step.deliverables.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        </li>
      ))}
    </ol>
  );
}
