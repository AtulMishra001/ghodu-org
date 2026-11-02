"use client";

import type { MouseEvent } from "react";
import { ListBulletsIcon } from "@phosphor-icons/react";
import type { TocGroup } from "@/lib/blog-html";

const GAP_BELOW_HEADER = 16;

/** Scrolls to a heading just below the site's header, measured because its height varies by screen. */
function jumpTo(event: MouseEvent<HTMLAnchorElement>, id: string) {
  // Not getElementById: the router keeps visited posts in the DOM but hidden, and
  // another post may have a heading with the same id.
  const heading = [...document.querySelectorAll<HTMLElement>(`[id="${CSS.escape(id)}"]`)].find((el) => el.offsetParent !== null);
  if (!heading) return;
  event.preventDefault();
  const header = document.querySelector("header")?.getBoundingClientRect().height ?? 0;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({ top: Math.max(heading.getBoundingClientRect().top + window.scrollY - header - GAP_BELOW_HEADER, 0), behavior: reduced ? "auto" : "smooth" });
  // Updates the address without adding a Back button stop.
  window.history.replaceState(null, "", `#${id}`);
  // Keyboard and screen-reader users continue reading from the heading.
  heading.setAttribute("tabindex", "-1");
  heading.focus({ preventScroll: true });
}

export default function TableOfContents({ groups }: { groups: TocGroup[] }) {
  if (!groups.length) return null;

  const link = "block rounded py-0.5 leading-snug transition-colors hover:text-primary";
  return (
    <nav aria-labelledby="toc-title" className="max-w-[80ch] rounded-card border p-4 md:p-5">
      <h2 id="toc-title" className="flex items-center gap-2 font-semibold">
        <ListBulletsIcon size={20} className="text-primary" />
        Table of contents
      </h2>
      <ol className="mt-2 ml-5 grid list-decimal gap-1 text-[15px] marker:text-muted-foreground">
        {groups.map(({ item, children }) => (
          <li key={item.id} className="pl-1">
            <a href={`#${item.id}`} onClick={(e) => jumpTo(e, item.id)} className={`${link} font-medium`}>
              {item.text}
            </a>
            {children.length > 0 && (
              <ol className="mt-1 ml-5 grid list-[lower-alpha] gap-1 text-muted-foreground marker:text-muted-foreground">
                {children.map((child) => (
                  <li key={child.id} className="pl-1">
                    <a href={`#${child.id}`} onClick={(e) => jumpTo(e, child.id)} className={link}>
                      {child.text}
                    </a>
                  </li>
                ))}
              </ol>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
