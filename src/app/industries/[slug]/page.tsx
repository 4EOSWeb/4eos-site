import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { InnerPage } from "@/components/layout/InnerPage";
import { industries } from "@/lib/content";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return industries.map((i) => ({ slug: i.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const industry = industries.find((i) => i.slug === slug);
  if (!industry) return {};
  return { title: industry.title, description: industry.lede };
}

export default async function IndustryPage({ params }: Props) {
  const { slug } = await params;
  const industry = industries.find((i) => i.slug === slug);
  if (!industry) notFound();
  const index = industries.findIndex((i) => i.slug === slug);

  return (
    <InnerPage
      phase="industries"
      kicker="Industry"
      title={industry.statement}
      lede={industry.lede}
      focus={index}
      zoom
      backHref="/#chapter-industries"
      backLabel="Industries"
    >
      <div className="grid gap-10 md:grid-cols-12">
        <div className="md:col-span-6">
          <p className="micro text-fg-faint">How it shows up</p>
          <ul className="mt-5 space-y-4">
            {industry.how.map((item, i) => (
              <li
                key={item}
                className="flex gap-4 border-t border-hairline pt-4 text-[15px] tracking-tight"
              >
                <span className="micro text-fg-faint">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="md:col-span-6">
          <p className="micro text-fg-faint">{industry.title}</p>
          <p className="lede mt-5">
            Two decades in this work means we rarely start from scratch. The
            patterns are known. The surprises are fewer.
          </p>
        </div>
      </div>
      <ul className="mt-12 flex flex-wrap gap-6 border-t border-hairline pt-8">
        {industry.related.map((item) => (
          <li key={item.href}>
            <Link href={item.href} className="micro text-gold">
              {item.label} →
            </Link>
          </li>
        ))}
      </ul>
      <Link href="/contact" className="micro mt-10 inline-flex text-gold">
        Request an assessment →
      </Link>
    </InnerPage>
  );
}
