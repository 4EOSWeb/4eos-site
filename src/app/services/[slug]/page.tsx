import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InnerPage } from "@/components/layout/InnerPage";
import { PracticeBody } from "@/components/layout/PracticeBody";
import { services } from "@/lib/content";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const service = services.find((s) => s.slug === slug);
  if (!service) return {};
  return { title: service.title, description: service.lede };
}

export default async function ServicePage({ params }: Props) {
  const { slug } = await params;
  const service = services.find((s) => s.slug === slug);
  if (!service) notFound();

  return (
    <InnerPage
      phase={service.phase}
      kicker={"family" in service ? service.family : "Practice"}
      title={service.statement}
      lede={service.lede}
    >
      <PracticeBody
        title={service.title}
        points={service.points}
        how={service.how}
        related={service.related}
      />
    </InnerPage>
  );
}
