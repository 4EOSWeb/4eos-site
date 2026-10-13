import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MidwestLogo } from "@/components/brand/MidwestLogo";
import { InnerPage } from "@/components/layout/InnerPage";
import { PracticeBody } from "@/components/layout/PracticeBody";
import { FaqList } from "@/components/seo/FaqList";
import { JsonLd } from "@/components/seo/JsonLd";
import { services, tiers } from "@/lib/content";
import { withCanonical } from "@/lib/metadata";
import { breadcrumbSchema, faqSchema, graphSchema, serviceSchema } from "@/lib/schema";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const service = services.find((s) => s.slug === slug);
  if (!service) return {};
  return withCanonical(`/services/${service.slug}`, { title: service.title, description: service.lede });
}

export default async function ServicePage({ params }: Props) {
  const { slug } = await params;
  const service = services.find((s) => s.slug === slug);
  if (!service) notFound();

  return (
    <InnerPage
      phase="unmanaged"
      kicker={service.slug === "voip" ? undefined : "family" in service ? service.family : "Practice"}
      brand={service.slug === "voip" ? <MidwestLogo height={56} /> : undefined}
      title={service.statement}
      lede={service.lede}
      backHref="/services"
      backLabel="Services"
    >
      <JsonLd
        data={graphSchema([
          serviceSchema(service),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Services", path: "/services" },
            { name: service.title, path: `/services/${service.slug}` },
          ]),
          faqSchema(service.faqs),
        ])}
      />
      {service.slug === "completecare" ? (
        <ul className="mb-16 divide-y divide-hairline border-y border-hairline">
          {tiers.map((tier) => (
            <li key={tier.name} className="grid gap-4 py-10 md:grid-cols-12">
              <div className="md:col-span-5">
                <h2 className="display text-[clamp(1.5rem,2.6vw,2.2rem)]">
                  {tier.name}
                </h2>
                <p className="lede mt-3">{tier.statement}</p>
              </div>
              <ul className="space-y-3 md:col-span-7">
                {tier.points.map((point, i) => (
                  <li key={point} className="flex gap-4 text-[15px] tracking-tight">
                    <span className="micro text-fg-faint">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {point}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      ) : null}
      <PracticeBody
        title={service.title}
        points={service.points}
        how={service.how}
        related={service.related}
      />
      <div className="mt-16">
        <FaqList items={service.faqs} />
      </div>
    </InnerPage>
  );
}
