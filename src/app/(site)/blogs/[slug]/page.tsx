import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import PostView, { PostSkeleton } from "@/components/blogs/PostView";
import { getPublishedBlogPage, getPublishedBlogs } from "@/data/blog-posts";
import { blogPath } from "@/lib/blog";

// "__not-found" is always built: it's the page the proxy shows with a real 404,
// and it keeps the build valid when there are no posts or no database. New posts
// render on first visit.
export async function generateStaticParams() {
  return [{ slug: "__not-found" }, ...(await getPublishedBlogs()).map((p) => ({ slug: p.slug }))];
}

export async function generateMetadata({ params }: PageProps<"/blogs/[slug]">): Promise<Metadata> {
  const page = await getPublishedBlogPage((await params).slug);
  if (!page) return { title: "Article not found", robots: { index: false } };
  const { post } = page;
  const title = post.meta?.title || post.title;
  const description = post.meta?.description || post.excerpt;
  const url = blogPath(post.slug);
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "article",
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      images: [{ url: post.image, alt: post.alt }],
    },
  };
}

// Params and the lookup stay inside Suspense: after a CMS write, re-rendering
// treats them as request-time data, which can't be awaited outside a boundary.
export default function BlogPostPage({ params }: PageProps<"/blogs/[slug]">) {
  return (
    <Suspense fallback={<PostSkeleton />}>
      <Post params={params} />
    </Suspense>
  );
}

async function Post({ params }: Pick<PageProps<"/blogs/[slug]">, "params">) {
  const { slug } = await params;
  const [page, all] = await Promise.all([getPublishedBlogPage(slug), getPublishedBlogs()]);
  if (!page) notFound();
  const related = page.post.relatedPostSlugs.map((s) => all.find((p) => p.slug === s)).filter((p) => !!p);
  return <PostView page={page} related={related} />;
}
