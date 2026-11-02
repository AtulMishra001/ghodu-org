import type { Metadata } from "next";
import { Suspense } from "react";
import { archiveMetadata } from "@/components/blogs/archive-metadata";
import ArchiveView, { ArchiveSkeleton } from "@/components/blogs/ArchiveView";
import { getPublishedBlogs } from "@/data/blog-posts";
import { BLOG_PAGE_SIZE } from "@/lib/blog";

// Page 2 is always listed: Cache Components needs at least one param to build.
export async function generateStaticParams() {
  const pages = Math.ceil((await getPublishedBlogs()).length / BLOG_PAGE_SIZE);
  return Array.from({ length: Math.max(pages, 2) - 1 }, (_, i) => ({ page: String(i + 2) }));
}

export async function generateMetadata({ params }: PageProps<"/blogs/page/[page]">): Promise<Metadata> {
  return archiveMetadata(Number((await params).page));
}

export default function BlogsPagedPage({ params }: PageProps<"/blogs/page/[page]">) {
  return (
    <Suspense fallback={<ArchiveSkeleton />}>
      <Paged params={params} />
    </Suspense>
  );
}

async function Paged({ params }: Pick<PageProps<"/blogs/page/[page]">, "params">) {
  return <ArchiveView page={Number((await params).page)} />;
}
