import type { Metadata } from "next";
import { Suspense } from "react";
import { archiveMetadata } from "@/components/blogs/archive-metadata";
import ArchiveView, { ArchiveSkeleton, categoriesInUse } from "@/components/blogs/ArchiveView";
import { getPublishedBlogs } from "@/data/blog-posts";

// The placeholder keeps the build valid when no categories are in use yet.
export async function generateStaticParams() {
  return [{ category: "__none" }, ...categoriesInUse(await getPublishedBlogs()).map((c) => ({ category: c.slug }))];
}

export async function generateMetadata({ params }: PageProps<"/blogs/category/[category]">): Promise<Metadata> {
  const slug = (await params).category;
  const found = categoriesInUse(await getPublishedBlogs()).find((c) => c.slug === slug);
  return found ? archiveMetadata(1, found) : { title: "Category not found", robots: { index: false } };
}

export default function BlogCategoryPage({ params }: PageProps<"/blogs/category/[category]">) {
  return (
    <Suspense fallback={<ArchiveSkeleton />}>
      <Category params={params} />
    </Suspense>
  );
}

async function Category({ params }: Pick<PageProps<"/blogs/category/[category]">, "params">) {
  return <ArchiveView category={(await params).category} />;
}
