import type { Metadata } from "next";
import { blogArchive } from "@/data/blog";
import { archivePath } from "@/lib/blog";

/** Metadata for any archive URL: each page's canonical is itself. */
export function archiveMetadata(page = 1, category?: { slug: string; name: string }): Metadata {
  const suffix = page > 1 ? ` (page ${page})` : "";
  const title = category ? `${category.name} articles${suffix}` : `${blogArchive.metaTitle}${suffix}`;
  const description = category ? `${category.name} articles for bulk buyers of Kashmir produce. ${blogArchive.metaDescription}` : blogArchive.metaDescription;
  const url = archivePath(page, category?.slug);
  return {
    title: { absolute: title.includes("|") ? title : `${title} | Ghodu Agro Blog` },
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: "website" },
  };
}
