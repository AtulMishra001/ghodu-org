// Helpers for the rich-text product description (stored as HTML).
// Client-safe: used by the admin form, the server action and the public page.

const ENTITIES: Record<string, string> = { "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&#39;": "'", "&nbsp;": " " };

/** Visible text of an HTML string: tags stripped, entities decoded, whitespace collapsed. */
export function htmlToText(html: string) {
  return html
    .replace(/<(br|\/p|\/h[1-6]|\/li|\/tr|\/blockquote|\/pre)\b[^>]*>/gi, " ")
    .replace(/<[^>]*>/g, "")
    .replace(/&(amp|lt|gt|quot|#39|nbsp);/g, (m) => ENTITIES[m])
    .replace(/\s+/g, " ")
    .trim();
}

/** True for an empty editor ("<p></p>"), whitespace-only HTML, or nothing at all. Images and tables count as content. */
export function isBlankHtml(html: string | undefined | null) {
  if (!html) return true;
  if (/<(img|table|hr)\b/i.test(html)) return false;
  return htmlToText(html) === "";
}

const escape = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/**
 * Old descriptions were plain text. Anything without tags becomes paragraphs
 * (one per line) so it loads in the editor and renders on the site.
 */
export function toHtml(value: string | undefined | null) {
  const v = (value ?? "").trim();
  if (!v) return "";
  // Real markup (as the editor writes it), not text that merely contains "<".
  if (/<\/?(p|h[1-6]|ul|ol|li|strong|em|u|s|b|i|br|hr|a|img|table|blockquote|pre|code|div|span)\b[^>]*>/i.test(v)) return v;
  return v
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => `<p>${escape(line)}</p>`)
    .join("");
}

/** `src` of every <img> in the HTML. */
export function imageSources(html: string | undefined | null) {
  return [...(html ?? "").matchAll(/<img\b[^>]*\ssrc=["']([^"']+)["']/gi)].map((m) => m[1]);
}

export type DescriptionHeading = { id: string; text: string };

/**
 * Gives each h2/h3 an id so the page can link to it, and returns those
 * headings in order as an outline ("On this page").
 */
export function withHeadingIds(html: string) {
  const outline: DescriptionHeading[] = [];
  const used = new Set<string>();
  const out = html.replace(/<h([23])(\s[^>]*)?>([\s\S]*?)<\/h\1>/gi, (match, level: string, attrs = "", inner: string) => {
    const text = htmlToText(inner);
    if (!text) return match;
    const base = `about-${text.toLowerCase().normalize("NFKD").replace(/[^a-z0-9\s-]/g, "").trim().replace(/[\s-]+/g, "-").slice(0, 60) || "section"}`;
    let id = base;
    for (let n = 2; used.has(id); n++) id = `${base}-${n}`;
    used.add(id);
    outline.push({ id, text });
    return `<h${level} id="${id}"${attrs}>${inner}</h${level}>`;
  });
  return { html: out, outline };
}
