import type { Metadata } from "next";
import { Suspense } from "react";
import BlogList from "@/components/admin/blogs/BlogList";
import PanelSkeleton from "@/components/admin/PanelSkeleton";
import { requireAdmin } from "@/lib/server/auth";

export const metadata: Metadata = { title: "Blogs" };

export default function AdminBlogsPage() {
  return (
    <Suspense fallback={<PanelSkeleton />}>
      <Blogs />
    </Suspense>
  );
}

async function Blogs() {
  await requireAdmin();
  return <BlogList />;
}
