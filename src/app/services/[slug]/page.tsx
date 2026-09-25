import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MidwestLogo } from "@/components/brand/MidwestLogo";
import { InnerPage } from "@/components/layout/InnerPage";
import { PracticeBody } from "@/components/layout/PracticeBody";
import { FaqList } from "@/components/seo/FaqList";
import { JsonLd } from "@/components/seo/JsonLd";
import { services } from "@/lib/content";
import { breadcrumbSchema, faqSchema, graphSchema, serviceSchema } from "@/lib/schema";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ from?: string }>;
};

export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const service = services.find((s) => s.slug === slug);
  if (!service) return {};
  return { title: service.title, description: service.lede };
}

export default async function ServicePage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { from } = await searchParams;
  const service = services.find((s) => s.slug === slug);
  if (!service) notFound();
  const fromStrategy = from === "strategy" || from === "strategy-services";
  const backHref = from === "strategy-services"
    ? "/#chapter-strategy-services"
    : fromStrategy
      ? "/#chapter-strategy"
      : "/services";
  const backLabel = fromStrategy ? "Strategy" : "Services";

  return (
    <InnerPage
      phase="unmanaged"
      kicker={service.slug === "voip" ? undefined : "family" in service ? service.family : "Practice"}
      brand={service.slug === "voip" ? <MidwestLogo height={56} /> : undefined}
      title={service.statement}
      lede={service.lede}
      backHref={backHref}
      backLabel={backLabel}
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
