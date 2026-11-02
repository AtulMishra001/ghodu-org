import { htmlToText } from "./rich-text";

export type TocItem = { id: string; text: string; level: 2 | 3 };
export type TocGroup = { item: TocItem; children: TocItem[] };

function slugifyHeading(text: string) {
  return text.toLowerCase().normalize("NFKD").replace(/[^a-z0-9\s-]/g, "").trim().replace(/[\s-]+/g, "-").slice(0, 80);
}

/**
 * Gives every h2 and h3 a unique id and returns them for the table of contents.
 * Ids already in the HTML are kept; repeats get -2, -3.
 */
export function addHeadingIds(html: string) {
  const toc: TocItem[] = [];
  const used = new Set<string>();
  const unique = (base: string) => {
    let id = base;
    for (let n = 2; used.has(id); n++) id = `${base}-${n}`;
    used.add(id);
    return id;
  };

  const out = html.replace(/<h([23])((?:\s[^>]*)?)>([\s\S]*?)<\/h\1>/gi, (match, level: string, attrs: string, inner: string) => {
    const text = htmlToText(inner);
    if (!text) return match;
    const existing = attrs.match(/\sid=["']([^"']+)["']/i)?.[1];
    const id = unique(existing ?? (slugifyHeading(text) || "section"));
    toc.push({ id, text, level: Number(level) as 2 | 3 });
    const rest = attrs.replace(/\sid=["'][^"']*["']/i, "");
    return `<h${level} id="${id}"${rest}>${inner}</h${level}>`;
  });
  return { html: out, toc };
}

/** Nests each h3 under the h2 above it. A leading h3 with no h2 stays top-level. */
export function groupToc(items: TocItem[]): TocGroup[] {
  const groups: TocGroup[] = [];
  for (const item of items) {
    const current = groups[groups.length - 1];
    if (item.level === 3 && current?.item.level === 2) current.children.push(item);
    else groups.push({ item, children: [] });
  }
  return groups;
}
