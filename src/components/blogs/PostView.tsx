import Image from "next/image";
import Link from "next/link";
import { ArrowSquareOutIcon, CheckCircleIcon, LightningIcon, SealCheckIcon } from "@phosphor-icons/react/dist/ssr";
import Breadcrumbs from "@/components/shared/Breadcrumbs";
import FaqAccordion from "@/components/shared/FaqAccordion";
import JsonLd from "@/components/shared/JsonLd";
import { BLOG_AUTHOR } from "@/data/blog";
import type { getPublishedBlogPage } from "@/data/blog-posts";
import { blogPath, formatBlogDate, type BlogSummary } from "@/lib/blog";
import { groupToc } from "@/lib/blog-html";
import { blogPostingSchema, breadcrumbSchema } from "@/lib/blog-json-ld";
import { faqPageSchema } from "@/lib/faq";
import { container } from "@/lib/ui";
import BlogCard from "./BlogCard";
import PostEnquiryForm from "./PostEnquiryForm";
import TableOfContents from "./TableOfContents";

const blockTitle = "font-display text-2xl leading-tight font-medium tracking-tight md:text-[28px]";

function sourceLabel(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export default function PostView({ page, related }: { page: NonNullable<Awaited<ReturnType<typeof getPublishedBlogPage>>>; related: BlogSummary[] }) {
  const { post, html, toc } = page;
  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Blogs", href: "/blogs" },
    { name: post.title, href: blogPath(post.slug) },
  ];

  return (
    <article>
      <JsonLd data={breadcrumbSchema(crumbs)} />
      <JsonLd data={blogPostingSchema(post)} />
      {post.faqs.length > 0 && <JsonLd data={faqPageSchema(post.faqs)} />}

      {/* ---------- hero ---------- */}
      <header className={`${container} pt-4 md:pt-6`}>
        <Breadcrumbs items={crumbs} />
        <div className="mt-4 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-10">
          <div className="flex flex-col justify-center">
            {post.category && <p className="text-xs font-semibold tracking-[0.18em] text-primary uppercase">{post.category}</p>}
            <h1 className="mt-2 font-display text-[36px] leading-[1.08] font-medium tracking-tight text-balance md:text-[52px]">{post.title}</h1>
            <p className="mt-3 text-[17px] leading-relaxed text-muted-foreground md:text-lg">{post.excerpt}</p>
            <p className="mt-4 flex flex-wrap gap-x-3 gap-y-1 text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">By {post.author?.name ?? BLOG_AUTHOR.name}</span>
              <span>{post.readTime || 1} min read</span>
              <span>{post.updatedAt ? `Updated ${formatBlogDate(post.updatedAt)}` : "Recently updated"}</span>
            </p>
            <dl className="mt-4 grid max-w-md grid-cols-2 border-y">
              <div className="py-2.5">
                <dt className="text-xs text-muted-foreground">Word count</dt>
                <dd className="font-semibold tabular">{post.wordCount.toLocaleString("en-IN")}</dd>
              </div>
              <div className="border-l py-2.5 pl-4">
                <dt className="text-xs text-muted-foreground">Format</dt>
                <dd className="font-semibold">{post.category}</dd>
              </div>
            </dl>
          </div>
          <div className="relative aspect-[16/10] overflow-hidden rounded-card bg-surface-muted">
            <Image src={post.image} alt={post.alt || post.title} fill priority sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
          </div>
        </div>
      </header>

      <div className={`${container} grid gap-8 pt-8 pb-8 md:pt-10 md:pb-10 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-10 xl:grid-cols-[minmax(0,1fr)_400px]`}>
        {/* ---------- main column ---------- */}
        <div className="flex min-w-0 flex-col gap-8">
          {(post.tldr || post.keyTakeaways.length > 0) && (
            <div className="grid gap-4 xl:grid-cols-2">
              {post.tldr && (
                <section aria-labelledby="direct-answer" className="rounded-card bg-inverse p-5 text-inverse-foreground md:p-6">
                  <h2 id="direct-answer" className="flex items-center gap-2 text-xs font-semibold tracking-[0.18em] text-accent uppercase">
                    <LightningIcon size={16} weight="fill" />
                    Direct answer
                  </h2>
                  <p className="mt-2 text-[17px] leading-relaxed">{post.tldr}</p>
                </section>
              )}
              {post.keyTakeaways.length > 0 && (
                <section aria-labelledby="key-takeaways" className="rounded-card border p-5 md:p-6">
                  <h2 id="key-takeaways" className="text-xs font-semibold tracking-[0.18em] text-primary uppercase">Key takeaways</h2>
                  <ul className="mt-3 grid gap-2">
                    {post.keyTakeaways.map((item) => (
                      <li key={item} className="flex gap-2 text-[15px] leading-relaxed md:text-base">
                        <CheckCircleIcon size={20} weight="fill" className="mt-0.5 shrink-0 text-primary" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>
          )}

          <TableOfContents groups={groupToc(toc)} />

          {/* Sanitised on save and again in articleForDisplay. Shares the site's rich-text styles. */}
          <div className="product-description article-body max-w-[80ch]" dangerouslySetInnerHTML={{ __html: html }} />

          {post.sources.length > 0 && (
            <section aria-labelledby="sources">
              <h2 id="sources" className={blockTitle}>Sources</h2>
              <ol className="mt-3 grid gap-2 border-t pt-3">
                {post.sources.map((url) => (
                  <li key={url}>
                    <a href={url} target="_blank" rel="noopener noreferrer nofollow" className="inline-flex items-center gap-1.5 text-[15px] font-medium break-all text-primary hover:underline">
                      {sourceLabel(url)}
                      <ArrowSquareOutIcon size={14} className="shrink-0" />
                      <span className="sr-only">(opens in a new tab)</span>
                    </a>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {post.faqs.length > 0 && (
            <section aria-labelledby="post-faqs">
              <h2 id="post-faqs" className={`${blockTitle} mb-3`}>Frequently asked questions</h2>
              <FaqAccordion faqs={post.faqs} />
            </section>
          )}

          {related.length > 0 && (
            <section aria-labelledby="related-posts">
              <h2 id="related-posts" className={`${blockTitle} mb-3`}>Related posts</h2>
              <ul className="grid gap-4 md:grid-cols-2">
                {related.map((p) => (
                  <li key={p.slug}>
                    <BlogCard post={p} sizes="(min-width: 768px) 33vw, 100vw" />
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        {/* ---------- sidebar: sticky on desktop, after the article on smaller screens ---------- */}
        <aside className="flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start">
          <PostEnquiryForm slug={post.slug} />
          <section aria-labelledby="reviewed-by" className="rounded-card border p-4 md:p-5">
            <h2 id="reviewed-by" className="flex items-center gap-1.5 text-xs font-semibold tracking-[0.18em] text-primary uppercase">
              <SealCheckIcon size={16} weight="fill" />
              Reviewed by
            </h2>
            <p className="mt-2 font-semibold">{BLOG_AUTHOR.name}</p>
            <p className="text-sm text-muted-foreground">{BLOG_AUTHOR.role}</p>
            <Link href={BLOG_AUTHOR.profileUrl} className="mt-2 inline-block text-sm font-semibold text-primary hover:underline">
              View profile
            </Link>
          </section>
          {post.tags.length > 0 && (
            <section aria-labelledby="post-tags" className="rounded-card border p-4 md:p-5">
              <h2 id="post-tags" className="text-xs font-semibold tracking-[0.18em] text-primary uppercase">Tags</h2>
              <ul className="mt-2 flex flex-wrap gap-1.5">
                {post.tags.map((tag) => (
                  <li key={tag} className="rounded-control bg-surface-muted px-2.5 py-1 text-sm">
                    {tag}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </aside>
      </div>
    </article>
  );
}

export function PostSkeleton() {
  return (
    <div className={`${container} animate-pulse pt-6 pb-10`} aria-busy aria-label="Loading">
      <div className="h-4 w-52 rounded bg-border/60" />
      <div className="mt-5 grid gap-10 lg:grid-cols-2">
        <div>
          <div className="h-32 rounded-control bg-border/60" />
          <div className="mt-4 h-20 rounded-control bg-border/40" />
        </div>
        <div className="aspect-[16/10] rounded-card bg-surface-muted" />
      </div>
      <div className="mt-10 h-96 max-w-[80ch] rounded-card bg-surface-muted/60" />
    </div>
  );
}
