import type { Metadata } from "next";
import { Suspense } from "react";
import BlogForm from "@/components/admin/blogs/BlogForm";
import FormSkeleton from "@/components/admin/FormSkeleton";
import { requireAdmin } from "@/lib/server/auth";
import { listBlogCategories } from "@/lib/server/blogs";

export const metadata: Metadata = { title: "Create blog" };

export default function CreateBlogPage() {
  return (
    <Suspense fallback={<FormSkeleton />}>
      <Create />
    </Suspense>
  );
}

async function Create() {
  await requireAdmin();
  return <BlogForm categories={await listBlogCategories()} />;
}
