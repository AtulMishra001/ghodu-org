import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr";
import { blogPath, formatBlogDate, type BlogSummary } from "@/lib/blog";

// How each card looks on phones, like a news app's feed: the lead story is a
// photo with its headline on it, the rest are compact rows. From md up, all are the same card.
const phone = {
  card: { link: "", photo: "", text: "", kicker: "", title: "", meta: "" },
  lead: {
    link: "max-md:relative max-md:border-0",
    photo: "max-md:aspect-[4/3]",
    text: "max-md:absolute max-md:inset-x-0 max-md:bottom-0 max-md:bg-linear-to-t max-md:from-inverse max-md:via-inverse/85 max-md:to-transparent max-md:pt-16 max-md:text-inverse-foreground",
    kicker: "max-md:text-accent",
    title: "max-md:text-[24px]",
    meta: "max-md:text-inverse-foreground/80",
  },
  row: {
    link: "max-md:flex-row max-md:gap-3 max-md:rounded-none max-md:border-0 max-md:bg-transparent max-md:py-3",
    photo: "max-md:aspect-auto max-md:size-24 max-md:shrink-0 max-md:rounded-tile",
    text: "max-md:p-0",
    kicker: "max-md:text-[11px]",
    title: "max-md:mt-0.5 max-md:text-[17px]",
    meta: "",
  },
};

// The whole card is one link. Photo on top, spec-sheet rows beneath.
export default function BlogCard({ post, sizes, variant = "card" }: { post: BlogSummary; sizes?: string; variant?: keyof typeof phone }) {
  const look = phone[variant];
  return (
    <Link href={blogPath(post.slug)} className={`group flex h-full flex-col overflow-hidden rounded-card border bg-surface transition-[border-color,box-shadow,translate] duration-300 ease-premium hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-elevated ${look.link}`}>
      <span className={`relative block aspect-[16/10] overflow-hidden bg-surface-muted ${look.photo}`}>
        <Image src={post.image} alt={post.alt || ""} fill sizes={sizes ?? "(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"} className="object-cover transition-transform duration-700 ease-premium group-hover:scale-[1.03]" />
      </span>
      <span className={`flex flex-1 flex-col p-4 ${look.text}`}>
        {post.category && <span className={`text-xs font-semibold tracking-[0.14em] text-primary uppercase ${look.kicker}`}>{post.category}</span>}
        <span className={`mt-1.5 font-display text-[20px] leading-[1.2] font-medium tracking-tight ${look.title}`}>{post.title}</span>
        <span className={`mt-1.5 line-clamp-3 text-sm leading-relaxed text-muted-foreground ${variant === "card" ? "" : "max-md:hidden"}`}>{post.excerpt}</span>
        <span className={`mt-auto flex flex-wrap items-center justify-between gap-x-3 gap-y-1 pt-3 ${variant === "card" ? "" : "max-md:pt-1.5"}`}>
          <span className={`text-xs text-muted-foreground tabular ${look.meta}`}>
            {formatBlogDate(post.publishedAt ?? post.updatedAt)} · {post.readTime || 1} min read
          </span>
          <span className={`flex shrink-0 items-center gap-1 text-sm font-semibold text-primary ${variant === "card" ? "" : "max-md:hidden"}`}>
            Read more
            <ArrowRightIcon size={14} weight="bold" className="transition-transform group-hover:translate-x-0.5" />
          </span>
        </span>
      </span>
    </Link>
  );
}
