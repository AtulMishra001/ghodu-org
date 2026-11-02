import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import FormSkeleton from "@/components/admin/FormSkeleton";
import ProductForm from "@/components/admin/form/ProductForm";
import { requireAdmin } from "@/lib/server/auth";
import { listProducts } from "@/lib/server/products";
import { suggestionsFrom } from "@/lib/server/suggestions";

export const metadata: Metadata = { title: "Edit product" };

export default function EditProductPage({ params }: PageProps<"/admin/products/[id]">) {
  return (
    <Suspense fallback={<FormSkeleton />}>
      <EditProduct params={params} />
    </Suspense>
  );
}

async function EditProduct({ params }: Pick<PageProps<"/admin/products/[id]">, "params">) {
  await requireAdmin();
  const { id } = await params;
  const all = await listProducts();
  const product = all.find((p) => p.id === id);
  if (!product) notFound();
  return <ProductForm product={product} suggestions={suggestionsFrom(all)} />;
}
