import Link from "next/link";
import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react/dist/ssr";
import { archivePath, BLOG_PAGE_SIZE } from "@/lib/blog";
import { button } from "@/lib/ui";

// Real links in the server HTML, so crawlers reach older posts and any page can
// be linked or returned to. #posts brings the grid back to the top on arrival.
export default function ArchivePagination({ page, total, category }: { page: number; total: number; category?: string }) {
  const pages = Math.ceil(total / BLOG_PAGE_SIZE);
  if (pages <= 1) return null;
  const from = (page - 1) * BLOG_PAGE_SIZE + 1;
  const to = Math.min(page * BLOG_PAGE_SIZE, total);
  const href = (n: number) => `${archivePath(n, category)}#posts`;
  const step = button("outline", "sm");
  const off = `${step} pointer-events-none opacity-40`;

  return (
    <nav aria-label="Blog pages" className="mt-6 flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-muted-foreground tabular">
        Showing {from}-{to} of {total} blogs
      </p>
      <ul className="flex flex-wrap items-center gap-1.5">
        <li>
          {page > 1 ? (
            <Link href={href(page - 1)} rel="prev" className={step}>
              <CaretLeftIcon size={14} weight="bold" />
              Previous
            </Link>
          ) : (
            <span aria-disabled="true" className={off}>
              <CaretLeftIcon size={14} weight="bold" />
              Previous
            </span>
          )}
        </li>
        {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
          <li key={n}>
            <Link
              href={href(n)}
              aria-label={`Page ${n}`}
              aria-current={n === page ? "page" : undefined}
              className={`${button(n === page ? "primary" : "outline", "sm")} min-w-9 tabular`}
            >
              {n}
            </Link>
          </li>
        ))}
        <li>
          {page < pages ? (
            <Link href={href(page + 1)} rel="next" className={step}>
              Next
              <CaretRightIcon size={14} weight="bold" />
            </Link>
          ) : (
            <span aria-disabled="true" className={off}>
              Next
              <CaretRightIcon size={14} weight="bold" />
            </span>
          )}
        </li>
      </ul>
    </nav>
  );
}
