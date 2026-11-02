import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import BlogForm from "@/components/admin/blogs/BlogForm";
import FormSkeleton from "@/components/admin/FormSkeleton";
import { requireAdmin } from "@/lib/server/auth";
import { getBlogById, listBlogCategories } from "@/lib/server/blogs";

export const metadata: Metadata = { title: "Edit blog" };

export default function EditBlogPage({ params }: PageProps<"/admin/blogs/edit/[id]">) {
  return (
    <Suspense fallback={<FormSkeleton />}>
      <Edit params={params} />
    </Suspense>
  );
}

async function Edit({ params }: Pick<PageProps<"/admin/blogs/edit/[id]">, "params">) {
  await requireAdmin();
  const { id } = await params;
  const [blog, categories] = await Promise.all([getBlogById(id), listBlogCategories()]);
  if (!blog) notFound();
  // Keyed by save time: returning after an update starts from the saved post.
  return <BlogForm key={blog.updatedAt} blog={blog} categories={categories} />;
}
