import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRightIcon, NotebookIcon } from "@phosphor-icons/react/dist/ssr";
import Breadcrumbs from "@/components/shared/Breadcrumbs";
import FaqAccordion from "@/components/shared/FaqAccordion";
import JsonLd from "@/components/shared/JsonLd";
import Section from "@/components/shared/Section";
import SectionHeader from "@/components/shared/SectionHeader";
import { blogArchive, BLOG_AUTHOR } from "@/data/blog";
import { getPublishedBlogs } from "@/data/blog-posts";
import { photos } from "@/data/photos";
import { archivePath, BLOG_PAGE_SIZE, categorySlug, type BlogSummary } from "@/lib/blog";
import { blogSchema, breadcrumbSchema } from "@/lib/blog-json-ld";
import { faqPageSchema } from "@/lib/faq";
import { photoProps } from "@/lib/photo";
import { button, container } from "@/lib/ui";
import ArchivePagination from "./ArchivePagination";
import BlogCard from "./BlogCard";
import ScrollToGrid from "./ScrollToGrid";

const pillBase = "rounded-control border px-3 py-1.5 text-sm font-semibold transition-colors";

/** Categories in use on published posts, sorted alphabetically. */
export function categoriesInUse(posts: BlogSummary[]) {
  const seen = new Map<string, string>();
  for (const post of posts) if (post.category) seen.set(categorySlug(post.category), post.category);
  return [...seen.entries()].map(([slug, name]) => ({ slug, name })).sort((a, b) => a.name.localeCompare(b.name));
}

// Every archive URL (/blogs, /blogs/page/2, /blogs/category/x...) renders this.
// Loading is the parent's Suspense boundary's job, so DB errors just give an empty state.
export default async function ArchiveView({ page = 1, category }: { page?: number; category?: string }) {
  const all = await getPublishedBlogs();
  const categories = categoriesInUse(all);
  const current = category ? categories.find((c) => c.slug === category) : undefined;
  if (category && !current) notFound();

  const posts = category ? all.filter((p) => categorySlug(p.category) === category) : all;
  const pages = Math.max(1, Math.ceil(posts.length / BLOG_PAGE_SIZE));
  if (!Number.isInteger(page) || page < 1 || page > pages) notFound();
  const visible = posts.slice((page - 1) * BLOG_PAGE_SIZE, page * BLOG_PAGE_SIZE);

  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Blogs", href: "/blogs" },
    ...(current ? [{ name: current.name, href: archivePath(1, category) }] : []),
    ...(page > 1 ? [{ name: `Page ${page}`, href: archivePath(page, category) }] : []),
  ];
  const isRoot = !category && page === 1;
  const noun = posts.length === 1 ? "article" : "articles";

  return (
    <>
      <JsonLd data={breadcrumbSchema(crumbs)} />
      {isRoot && <JsonLd data={blogSchema(all, blogArchive.metaDescription)} />}
      {isRoot && <JsonLd data={faqPageSchema(blogArchive.faqs)} />}

      {/* ---------- hero ---------- */}
      <section className={`${container} pt-4 md:pt-6`}>
        <Breadcrumbs items={crumbs} />
        <div className="mt-4 grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:gap-10">
          <div className="flex flex-col justify-end">
            <p className="flex flex-wrap items-center gap-2 text-xs font-semibold tracking-[0.18em] text-primary uppercase">
              {blogArchive.label}
              <span className="h-px w-6 bg-primary/40" />
              <span className="tabular">
                {posts.length} {noun}
              </span>
            </p>
            <h1 className="mt-3 font-display text-[38px] leading-[1.05] font-medium tracking-tight text-balance md:text-[56px] 2xl:text-[68px]">
              {current ? current.name : blogArchive.title}
            </h1>
            <p className="mt-3 max-w-3xl text-[17px] leading-relaxed text-muted-foreground md:text-lg">{blogArchive.answer}</p>
            {categories.length > 0 && (
              <ul aria-label="Filter by category" className="mt-5 flex flex-wrap gap-2">
                <li>
                  <Link href="/blogs" aria-current={!category ? "page" : undefined} className={`${pillBase} block ${!category ? "border-primary bg-primary text-primary-foreground" : "bg-surface hover:border-foreground/40"}`}>
                    All
                  </Link>
                </li>
                {categories.map((c) => (
                  <li key={c.slug}>
                    <Link href={archivePath(1, c.slug)} aria-current={c.slug === category ? "page" : undefined} className={`${pillBase} block ${c.slug === category ? "border-primary bg-primary text-primary-foreground" : "bg-surface hover:border-foreground/40"}`}>
                      {c.name}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="relative hidden aspect-[16/10] overflow-hidden rounded-card bg-surface-muted lg:block">
            <Image {...photoProps(photos.orchard)} alt={photos.orchard.alt} fill priority sizes="40vw" className="object-cover" />
          </div>
        </div>
      </section>

      {/* ---------- posts ---------- */}
      <Section id="posts">
        <ScrollToGrid />
        {visible.length ? (
          <>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {visible.map((post) => (
                <li key={post.slug}>
                  <BlogCard post={post} />
                </li>
              ))}
            </ul>
            <ArchivePagination page={page} total={posts.length} category={category} />
          </>
        ) : (
          <div className="flex flex-col items-center rounded-card border p-8 text-center">
            <NotebookIcon size={36} weight="light" className="text-primary" />
            <h2 className="mt-3 font-display text-2xl font-medium">New articles are on the way</h2>
            <p className="mt-1 max-w-md text-muted-foreground">Nothing is published here just yet. In the meantime, browse the catalogue or send us your questions.</p>
            <Link href="/products" className={`${button("primary", "md")} mt-4`}>
              Browse the catalogue
            </Link>
          </div>
        )}
      </Section>

      {/* ---------- what we publish ---------- */}
      <Section>
        <SectionHeader index="01" kicker="Coverage" title={blogArchive.whatWePublish.title} summary={blogArchive.whatWePublish.summary} />
        <ul className="mt-5 grid border-t sm:grid-cols-2 xl:grid-cols-4">
          {blogArchive.whatWePublish.items.map((item, i) => (
            <li key={item.title} className="border-b py-4 sm:pr-5 xl:border-b-0">
              <p className="text-sm font-semibold text-primary tabular">{String(i + 1).padStart(2, "0")}</p>
              <h3 className="mt-1 text-lg font-semibold">{item.title}</h3>
              <p className="mt-1 text-[15px] leading-relaxed text-muted-foreground">{item.body}</p>
            </li>
          ))}
        </ul>
      </Section>

      {/* ---------- internal links ---------- */}
      <Section>
        <SectionHeader index="02" kicker="Next steps" title={blogArchive.guidance.title} summary={blogArchive.guidance.summary} />
        <ul className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {blogArchive.guidance.cards.map((c) => (
            <li key={c.href}>
              <Link href={c.href} className="group flex h-full flex-col rounded-card border p-5 transition hover:border-primary/40 hover:bg-surface-muted/40">
                <h3 className="font-display text-[22px] leading-tight font-medium">{c.title}</h3>
                <p className="mt-1.5 text-[15px] text-muted-foreground">{c.body}</p>
                <span className="mt-auto flex items-center gap-1 pt-4 text-sm font-semibold text-primary">
                  {c.cta}
                  <ArrowRightIcon size={14} weight="bold" className="transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            </li>
          ))}
          <li className="flex flex-col rounded-card bg-inverse p-5 text-inverse-foreground">
            <h3 className="font-display text-[22px] leading-tight font-medium">{blogArchive.guidance.contact.title}</h3>
            <p className="mt-1.5 text-[15px] text-inverse-foreground/75">{blogArchive.guidance.contact.body}</p>
            <div className="mt-auto pt-4">
              <Link href={blogArchive.guidance.contact.href} className={button("accent", "sm")}>
                {blogArchive.guidance.contact.cta}
              </Link>
            </div>
          </li>
        </ul>
      </Section>

      {/* ---------- editorial review + FAQs ---------- */}
      <Section className="pb-8 md:pb-10">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:gap-10">
          <div>
            <SectionHeader index="03" kicker="Editorial review" title={blogArchive.editorial.title} />
            <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground md:text-base">{blogArchive.editorial.body}</p>
            <Link href={BLOG_AUTHOR.profileUrl} className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
              About the {BLOG_AUTHOR.name}
              <ArrowRightIcon size={14} weight="bold" />
            </Link>
          </div>
          <div>
            <h2 className="mb-3 text-xs font-semibold tracking-[0.18em] text-primary uppercase">Questions about the blog</h2>
            <FaqAccordion faqs={blogArchive.faqs} />
          </div>
        </div>
      </Section>
    </>
  );
}

export function ArchiveSkeleton() {
  return (
    <div className={`${container} animate-pulse pt-6 pb-10`} aria-busy aria-label="Loading">
      <div className="h-4 w-40 rounded bg-border/60" />
      <div className="mt-5 h-16 max-w-xl rounded-control bg-border/60" />
      <div className="mt-3 h-20 max-w-2xl rounded-control bg-border/40" />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="aspect-[4/3] rounded-card border bg-surface-muted/50" />
        ))}
      </div>
    </div>
  );
}
