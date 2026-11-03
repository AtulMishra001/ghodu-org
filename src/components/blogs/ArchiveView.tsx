import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRightIcon, NotebookIcon, NewspaperIcon, QuestionIcon, SealCheckIcon } from "@phosphor-icons/react/dist/ssr";
import Breadcrumbs from "@/components/shared/Breadcrumbs";
import FaqAccordion from "@/components/shared/FaqAccordion";
import JsonLd from "@/components/shared/JsonLd";
import Section from "@/components/shared/Section";
import SheetRow from "@/components/shared/SheetRow";
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

  // One root element: Next scrolls a new page by its top-level elements, and with
  // the invisible scripts first, several roots left phones part-way down the page.
  return (
    <div>
      <JsonLd data={breadcrumbSchema(crumbs)} />
      {isRoot && <JsonLd data={blogSchema(all, blogArchive.metaDescription)} />}
      {isRoot && <JsonLd data={faqPageSchema(blogArchive.faqs)} />}

      {/* ---------- hero ---------- */}
      <section className={`${container} pt-1 md:pt-6`}>
        <div className="max-md:hidden">
          <Breadcrumbs items={crumbs} />
        </div>
        <div className="grid gap-6 md:mt-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:gap-10">
          <div className="flex flex-col justify-end">
            <p className="flex flex-wrap items-center gap-2 text-[11px] font-semibold tracking-[0.18em] text-primary uppercase md:text-xs">
              {blogArchive.label}
              <span className="h-px w-6 bg-primary/40" />
              <span className="tabular">
                {posts.length} {noun}
              </span>
            </p>
            <h1 className="mt-1 font-display text-[24px] leading-[1.1] font-medium tracking-tight text-balance md:mt-3 md:text-[56px] md:leading-[1.05] 2xl:text-[68px]">
              {current ? current.name : blogArchive.title}
            </h1>
            <p className="mt-3 max-w-3xl text-[17px] leading-relaxed text-muted-foreground max-md:hidden md:text-lg">{blogArchive.answer}</p>
            {categories.length > 0 && (
              <ul aria-label="Filter by category" className="mt-5 flex flex-wrap gap-2 max-md:hidden">
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

      {/* Phones: the categories stay within reach, stuck under the app bar while the feed scrolls. */}
      {categories.length > 0 && (
        <nav aria-label="Article categories" className="sticky top-14 z-20 mt-2 border-b bg-background md:hidden">
          <ul className="rail scroll-pl-4 gap-1 px-4">
            {[{ slug: "", name: "All" }, ...categories].map((c) => {
              const on = c.slug === (category ?? "");
              return (
                <li key={c.slug} className="shrink-0">
                  <Link
                    href={c.slug ? archivePath(1, c.slug) : "/blogs"}
                    aria-current={on ? "page" : undefined}
                    className={`relative block px-2.5 py-2.5 text-sm font-semibold whitespace-nowrap ${on ? "text-foreground" : "text-muted-foreground"}`}
                  >
                    {c.name}
                    {on && <span className="absolute inset-x-2.5 bottom-0 h-0.5 bg-primary" />}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      )}

      {/* ---------- posts ---------- */}
      <Section id="posts" className="max-md:pt-3">
        <ScrollToGrid />
        {visible.length ? (
          <>
            <ul className="grid gap-4 max-md:gap-0 max-md:divide-y md:grid-cols-2 lg:grid-cols-4">
              {visible.map((post, i) => (
                <li key={post.slug} className={i === 0 ? "max-md:pb-1" : ""}>
                  <BlogCard post={post} variant={i === 0 ? "lead" : "row"} />
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

      {/* ---------- phones: the feed's small print, in sheets ---------- */}
      <section aria-label="About this journal" className="mx-4 mt-2 mb-4 divide-y border-y md:hidden">
        <SheetRow icon={<NewspaperIcon size={22} weight="duotone" />} title={blogArchive.whatWePublish.title} hint={blogArchive.whatWePublish.items.map((item) => item.title).join(", ")}>
          <p className="text-[15px] text-muted-foreground">{blogArchive.whatWePublish.summary}</p>
          <ul className="mt-2 divide-y pb-2">
            {blogArchive.whatWePublish.items.map((item) => (
              <li key={item.title} className="py-3">
                <h3 className="font-semibold">{item.title}</h3>
                <p className="mt-0.5 text-[15px] leading-relaxed text-muted-foreground">{item.body}</p>
              </li>
            ))}
          </ul>
        </SheetRow>
        <SheetRow icon={<SealCheckIcon size={22} weight="duotone" />} title={blogArchive.editorial.title} hint={BLOG_AUTHOR.name}>
          <p className="text-[15px] leading-relaxed text-muted-foreground">{blogArchive.editorial.body}</p>
          <Link href={BLOG_AUTHOR.profileUrl} className="mt-3 mb-2 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
            About the {BLOG_AUTHOR.name}
            <ArrowRightIcon size={14} weight="bold" />
          </Link>
        </SheetRow>
        <SheetRow icon={<QuestionIcon size={22} weight="duotone" />} title="Questions about the blog" hint={`${blogArchive.faqs.length} common questions`}>
          <FaqAccordion faqs={blogArchive.faqs} />
        </SheetRow>
      </section>

      {/* ---------- phones: where to go next, as a swipeable row ---------- */}
      <nav aria-label="Next steps" className="pb-4 md:hidden">
        <h2 className="px-4 text-sm font-semibold">{blogArchive.guidance.title}</h2>
        <ul className="rail mt-2 scroll-pl-4 gap-2 px-4">
          {blogArchive.guidance.cards.map((c) => (
            <li key={c.href} className="w-[58%] shrink-0">
              <Link href={c.href} className="flex h-full flex-col rounded-card border p-3 transition active:scale-[0.98]">
                <span className="font-display text-lg leading-tight font-medium">{c.title}</span>
                <span className="mt-auto flex items-center gap-1 pt-2 text-sm font-semibold text-primary">
                  {c.cta}
                  <ArrowRightIcon size={14} weight="bold" />
                </span>
              </Link>
            </li>
          ))}
          <li className="w-[58%] shrink-0">
            <Link href={blogArchive.guidance.contact.href} className="flex h-full flex-col rounded-card bg-inverse p-3 text-inverse-foreground transition active:scale-[0.98]">
              <span className="font-display text-lg leading-tight font-medium">{blogArchive.guidance.contact.title}</span>
              <span className="mt-auto flex items-center gap-1 pt-2 text-sm font-semibold text-accent">
                {blogArchive.guidance.contact.cta}
                <ArrowRightIcon size={14} weight="bold" />
              </span>
            </Link>
          </li>
        </ul>
      </nav>

      {/* ---------- what we publish ---------- */}
      <div className="max-md:hidden">
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
      </div>
    </div>
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
