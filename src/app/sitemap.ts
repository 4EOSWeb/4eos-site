import type { MetadataRoute } from "next";
import { industries, services } from "@/lib/content";
import { getPosts } from "@/lib/posts";
import { site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const entry = (path: string, priority: number, lastModified = now) => ({
    url: `${site.url}${path}`,
    lastModified,
    priority,
  });

  return [
    entry("/", 1),
    entry("/services", 0.9),
    ...services.map((s) => entry(s.href, s.parent ? 0.7 : 0.9)),
    entry("/secureai", 0.7),
    entry("/industries", 0.8),
    ...industries.map((i) => entry(`/industries/${i.slug}`, 0.7)),
    entry("/about", 0.8),
    entry("/contact", 0.8),
    entry("/resources", 0.5),
    entry("/faq", 0.6),
    entry("/blog", 0.5),
    ...getPosts().map((p) => entry(`/blog/${p.slug}`, 0.5, new Date(`${p.date}T00:00:00`))),
    entry("/support", 0.4),
    entry("/privacy", 0.2),
    entry("/terms", 0.2),
    entry("/accessibility", 0.2),
  ];
}
