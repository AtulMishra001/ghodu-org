import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import HarvestSeason from "@/components/product/HarvestSeason";
import OrderingDetails from "@/components/product/OrderingDetails";
import ProductDock from "@/components/product/ProductDock";
import ProductDetails from "@/components/product/ProductDetails";
import ProductFaq from "@/components/product/ProductFaq";
import ProductSpecs from "@/components/product/ProductSpecs";
import ProductHero from "@/components/product/ProductHero";
import ProductOverview from "@/components/product/ProductOverview";
import ProductPager, { type PagerTab } from "@/components/product/ProductPager";
import ProductSkeleton from "@/components/product/ProductSkeleton";
import ProductTopBar from "@/components/product/ProductTopBar";
import RelatedProducts from "@/components/product/RelatedProducts";
import { getProductBySlug, getProducts, getRelatedProducts } from "@/data/catalogue";
import { site } from "@/data/site";
import { htmlToText } from "@/lib/rich-text";

// One page per product, fetched by its product ID (slug), e.g. /products/walnuts.
// Published products are prerendered at build; ones added later in the admin
// render on their first visit. Admin saves refresh them via the "products" tag.

export async function generateStaticParams() {
  return (await getProducts()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/products/[slug]">): Promise<Metadata> {
  const product = await getProductBySlug((await params).slug);
  if (!product) return { title: "Product not found" };
  const title = `${product.name}${product.localName ? ` (${product.localName})` : ""}: bulk supply from Kashmir`;
  const image = typeof product.image.src === "string" ? product.image.src : product.image.src.src;
  return {
    title,
    description: product.summary,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: { title, description: product.summary, images: [{ url: image, alt: product.image.alt }] },
  };
}

// The product lookup sits inside Suspense: after an admin save invalidates the
// cache, the page is re-rendered with params as request-time data, which must
// not be awaited outside a boundary. At build time the boundary resolves in
// the prerender, so known products still ship as complete static HTML.
export default function ProductPage({ params }: PageProps<"/products/[slug]">) {
  return (
    <Suspense fallback={<ProductSkeleton />}>
      <Product params={params} />
    </Suspense>
  );
}

async function Product({ params }: Pick<PageProps<"/products/[slug]">, "params">) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();
  const related = await getRelatedProducts(product);

  // Structured data for search engines. No price: it's quoted per order.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description ? htmlToText(product.description) : product.summary, // plain text, never HTML
    category: `${product.category} > ${product.kind}`,
    brand: { "@type": "Brand", name: site.name },
    countryOfOrigin: "IN",
    additionalProperty: (product.specs ?? []).map((s) => ({ "@type": "PropertyValue", name: s.label, value: s.value })),
  };

  // Swipeable tabs on phones; on desktop the same panels stack as sections,
  // with the overview's content in the hero and the season after the terms.
  const tabs: PagerTab[] = [
    { id: "overview", label: "Overview", node: <ProductOverview product={product} /> },
    { id: "about", label: "Details", node: <ProductDetails product={product} /> },
    { id: "specs", label: "Specs", node: <ProductSpecs product={product} /> },
    {
      id: "terms",
      label: "Ordering",
      node: (
        <>
          <OrderingDetails product={product} />
          <HarvestSeason product={product} />
        </>
      ),
    },
    ...(product.faqs?.length ? [{ id: "faq", label: "FAQ", node: <ProductFaq product={product} /> }] : []),
  ];

  return (
    <div data-immersive className="flex flex-col max-md:min-h-dvh">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <ProductTopBar name={product.name} />
      <ProductHero product={product} />
      <ProductPager tabs={tabs} />
      <RelatedProducts products={related} line={product.category} index={product.faqs?.length ? "06" : "05"} />
      <ProductDock product={product} />
    </div>
  );
}
