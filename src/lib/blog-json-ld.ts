import { BLOG_AUTHOR } from "@/data/blog";
import { site } from "@/data/site";
import type { Blog, BlogSummary } from "./blog";
import { absoluteUrl, blogPath } from "./blog-urls";

// Structured data for the blog. All URLs come from the same helpers as the
// canonical tags and links, so the formats can't disagree.

const organizationId = absoluteUrl("/#organization");
const publisher = { "@type": "Organization", "@id": organizationId, name: site.name, url: absoluteUrl("/"), logo: { "@type": "ImageObject", url: absoluteUrl("/ghodu-logo.webp") } };
const author = { "@type": "Organization", name: BLOG_AUTHOR.name, url: absoluteUrl(BLOG_AUTHOR.profileUrl) };

export function breadcrumbSchema(items: { name: string; href: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({ "@type": "ListItem", position: i + 1, name: item.name, item: absoluteUrl(item.href) })),
  };
}

const posting = (post: BlogSummary) => ({
  "@type": "BlogPosting",
  headline: post.structuredData?.title || post.title,
  description: post.structuredData?.description || post.meta?.description || post.excerpt,
  url: absoluteUrl(blogPath(post.slug)),
  mainEntityOfPage: absoluteUrl(blogPath(post.slug)),
  image: post.image,
  datePublished: post.publishedAt ?? post.createdAt,
  dateModified: post.updatedAt,
  author,
  publisher,
});

export function blogSchema(posts: BlogSummary[], description: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: `${site.name} Blog`,
    description,
    url: absoluteUrl("/blogs"),
    publisher,
    blogPost: posts.slice(0, 12).map(posting),
  };
}

export const blogPostingSchema = (post: Blog) => ({ "@context": "https://schema.org", ...posting(post) });
