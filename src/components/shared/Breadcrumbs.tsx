import Link from "next/link";
import { CaretRightIcon } from "@phosphor-icons/react/dist/ssr";

export type Crumb = { name: string; href: string };

// The last crumb is the current page, so it isn't a link.
export default function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm text-muted-foreground">
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={item.href} className="flex min-w-0 items-center gap-1.5">
              {i > 0 && <CaretRightIcon aria-hidden size={12} className="shrink-0" />}
              {last ? (
                <span aria-current="page" className="line-clamp-1 font-medium text-foreground">
                  {item.name}
                </span>
              ) : (
                <Link href={item.href} className="hover:text-primary hover:underline">
                  {item.name}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
