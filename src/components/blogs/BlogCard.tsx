import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr";
import { blogPath, formatBlogDate, type BlogSummary } from "@/lib/blog";

// The whole card is one link. Photo on top, spec-sheet rows beneath.
export default function BlogCard({ post, sizes }: { post: BlogSummary; sizes?: string }) {
  return (
    <Link href={blogPath(post.slug)} className="group flex h-full flex-col overflow-hidden rounded-card border bg-surface transition-[border-color,box-shadow,translate] duration-300 ease-premium hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-elevated">
      <span className="relative block aspect-[16/10] overflow-hidden bg-surface-muted">
        <Image src={post.image} alt={post.alt || ""} fill sizes={sizes ?? "(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"} className="object-cover transition-transform duration-700 ease-premium group-hover:scale-[1.03]" />
      </span>
      <span className="flex flex-1 flex-col p-4">
        {post.category && <span className="text-xs font-semibold tracking-[0.14em] text-primary uppercase">{post.category}</span>}
        <span className="mt-1.5 font-display text-[20px] leading-[1.2] font-medium tracking-tight">{post.title}</span>
        <span className="mt-1.5 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{post.excerpt}</span>
        <span className="mt-auto flex flex-wrap items-center justify-between gap-x-3 gap-y-1 pt-3">
          <span className="text-xs text-muted-foreground tabular">
            {formatBlogDate(post.publishedAt ?? post.updatedAt)} · {post.readTime || 1} min read
          </span>
          <span className="flex shrink-0 items-center gap-1 text-sm font-semibold text-primary">
            Read more
            <ArrowRightIcon size={14} weight="bold" className="transition-transform group-hover:translate-x-0.5" />
          </span>
        </span>
      </span>
    </Link>
  );
}
