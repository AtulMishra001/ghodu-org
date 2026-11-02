import type { Metadata } from "next";
import { Suspense } from "react";
import { archiveMetadata } from "@/components/blogs/archive-metadata";
import ArchiveView, { ArchiveSkeleton, categoriesInUse } from "@/components/blogs/ArchiveView";
import { getPublishedBlogs } from "@/data/blog-posts";

type Props = PageProps<"/blogs/category/[category]/page/[page]">;

// The placeholder keeps the build valid; everything else renders on first visit.
export function generateStaticParams() {
  return [{ category: "__none", page: "2" }];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category, page } = await params;
  const found = categoriesInUse(await getPublishedBlogs()).find((c) => c.slug === category);
  return found ? archiveMetadata(Number(page), found) : { title: "Category not found", robots: { index: false } };
}

export default function BlogCategoryPagedPage({ params }: Props) {
  return (
    <Suspense fallback={<ArchiveSkeleton />}>
      <Paged params={params} />
    </Suspense>
  );
}

async function Paged({ params }: Pick<Props, "params">) {
  const { category, page } = await params;
  return <ArchiveView category={category} page={Number(page)} />;
}
