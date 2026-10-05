import type { Metadata } from "next";
import { site } from "./site";

/** Child metadata replaces the inherited openGraph object, so the root card is named explicitly.
 *  An explicit image also beats a segment's own opengraph-image file, hence hasImageFile. */
const DEFAULT_IMAGE = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: "4EOS: modern IT leadership for growing businesses",
};

/** Unique title, description, canonical, and social data for one route. */
export function pageMetadata({
  title,
  description,
  path,
  absoluteTitle = false,
  type = "website",
  hasImageFile = false,
}: {
  title: string;
  description: string;
  path: string;
  absoluteTitle?: boolean;
  type?: "website" | "article";
  hasImageFile?: boolean;
}): Metadata {
  const fullTitle = absoluteTitle ? title : `${title} | ${site.name}`;
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: path, types: { "application/rss+xml": [{ url: "/feed.xml", title: `${site.name} Insights` }] } },
    openGraph: {
      type,
      url: path,
      siteName: site.name,
      locale: "en_US",
      title: fullTitle,
      description,
      ...(hasImageFile ? {} : { images: [DEFAULT_IMAGE] }),
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      ...(hasImageFile ? {} : { images: [DEFAULT_IMAGE.url] }),
    },
  };
}
