import type { Metadata } from "next";
import { Suspense } from "react";
import Dashboard from "@/components/admin/dashboard/Dashboard";
import PanelSkeleton from "@/components/admin/PanelSkeleton";
import { requireAdmin } from "@/lib/server/auth";
import { countBlogs } from "@/lib/server/blogs";
import { countEnquiries } from "@/lib/server/enquiries";
import { listProducts } from "@/lib/server/products";

export const metadata: Metadata = { title: "Dashboard" };

export default function DashboardPage() {
  return (
    <Suspense fallback={<PanelSkeleton />}>
      <Overview />
    </Suspense>
  );
}

async function Overview() {
  await requireAdmin();
  const [products, blogs, enquiries] = await Promise.all([listProducts(), countBlogs(), countEnquiries()]);
  return <Dashboard products={products} blogs={blogs} enquiries={enquiries} />;
}
