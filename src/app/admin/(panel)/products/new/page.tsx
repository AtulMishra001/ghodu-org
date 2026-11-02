import type { Metadata } from "next";
import { Suspense } from "react";
import FormSkeleton from "@/components/admin/FormSkeleton";
import ProductForm from "@/components/admin/form/ProductForm";
import { requireAdmin } from "@/lib/server/auth";
import { listProducts } from "@/lib/server/products";
import { suggestionsFrom } from "@/lib/server/suggestions";

export const metadata: Metadata = { title: "New product" };

export default function NewProductPage() {
  return (
    <Suspense fallback={<FormSkeleton />}>
      <NewProduct />
    </Suspense>
  );
}

async function NewProduct() {
  await requireAdmin();
  const all = await listProducts();
  return <ProductForm product={null} suggestions={suggestionsFrom(all)} />;
}
