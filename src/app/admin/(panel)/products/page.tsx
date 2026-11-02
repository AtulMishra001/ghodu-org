import type { Metadata } from "next";
import { Suspense } from "react";
import PanelSkeleton from "@/components/admin/PanelSkeleton";
import ProductGrid from "@/components/admin/products/ProductGrid";
import { requireAdmin } from "@/lib/server/auth";
import { listProducts } from "@/lib/server/products";

export const metadata: Metadata = { title: "Products" };

// The page's own boundary lets navigations show the skeleton instantly
// while the session check and database read stream in.
export default function AdminProductsPage() {
  return (
    <Suspense fallback={<PanelSkeleton />}>
      <Products />
    </Suspense>
  );
}

async function Products() {
  await requireAdmin();
  return <ProductGrid products={await listProducts()} />;
}
