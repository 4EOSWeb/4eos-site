import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbSchema } from "@/lib/schema";

export type Crumb = { name: string; path: string };

/** Visible trail plus matching BreadcrumbList. Home is added here. */
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  const trail = [{ name: "Home", path: "/" }, ...items];
  return (
    <>
      <nav aria-label="Breadcrumb" className="crumbs">
        <ol>
          {trail.map((item, i) => (
            <li key={item.path}>
              {i === trail.length - 1 ? (
                <span aria-current="page">{item.name}</span>
              ) : (
                <Link href={item.path}>{item.name}</Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
      <JsonLd data={{ "@context": "https://schema.org", ...breadcrumbSchema(trail) }} />
    </>
  );
}
