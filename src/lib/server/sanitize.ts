import "server-only";
import DOMPurify from "isomorphic-dompurify";
import { toHtml } from "@/lib/rich-text";

// Allow-list for the rich-text product description. Runs when a product is
// saved and again when it's read for the website, so nothing unsafe can be
// stored or rendered even if it reaches the database another way.

const ALLOWED_TAGS = [
  "h1", "h2", "h3", "h4", "h5", "h6", "p", "br",
  "strong", "b", "em", "i", "u", "s", "code", "pre",
  "ul", "ol", "li", "blockquote", "hr",
  "a", "img",
  "table", "thead", "tbody", "tr", "th", "td",
];
const ALLOWED_ATTR = ["href", "target", "rel", "download", "src", "alt", "width", "height", "data-align", "style", "colspan", "rowspan"];
const TEXT_ALIGN = /^\s*text-align\s*:\s*(left|center|right|justify)\s*;?\s*$/i;

let hooked = false;
function purifier() {
  if (hooked) return DOMPurify;
  DOMPurify.addHook("uponSanitizeAttribute", (node, data) => {
    // Inline styles: keep a single text-align declaration, drop anything else.
    if (data.attrName === "style") {
      const align = data.attrValue.split(";").map((d) => d.trim()).find((d) => TEXT_ALIGN.test(d));
      if (align) data.attrValue = align.replace(/\s+/g, " ").replace(/;?$/, ";");
      else data.keepAttr = false;
    }
    // Images: https only (no data:, javascript:, or plain http). Links: web, mail, phone or on-site.
    if (data.attrName === "src" && !/^https:\/\//i.test(data.attrValue)) data.keepAttr = false;
    if (data.attrName === "href" && !/^(?:https?:|mailto:|tel:|\/|#)/i.test(data.attrValue)) data.keepAttr = false;
    if (data.attrName === "target" && !["_blank", "_self"].includes(data.attrValue)) data.keepAttr = false;
    // Articles may carry heading anchors; ids anywhere else aren't needed.
    if (data.attrName === "id" && !/^H[1-6]$/.test(node.nodeName)) data.keepAttr = false;
  });
  DOMPurify.addHook("afterSanitizeAttributes", (node) => {
    // Links that open a new tab can't reach back into this page.
    if (node.tagName === "A" && node.getAttribute("target") === "_blank") node.setAttribute("rel", "noopener noreferrer");
  });
  hooked = true;
  return DOMPurify;
}

/** Cleans editor HTML down to the allowed tags and attributes. Plain text becomes paragraphs. */
export function sanitizeRichText(html: string) {
  return purifier()
    // No custom ALLOWED_URI_REGEXP: DOMPurify would apply it to every attribute
    // value (target, width, colspan…). Protocols are enforced in the hook above.
    .sanitize(toHtml(html), { ALLOWED_TAGS, ALLOWED_ATTR, ALLOW_DATA_ATTR: false })
    .trim();
}

/** Cleans a blog article: the same allow-list, plus heading ids for the table of contents. */
export function sanitizeArticle(html: string) {
  return purifier()
    .sanitize(toHtml(html), { ALLOWED_TAGS, ALLOWED_ATTR: [...ALLOWED_ATTR, "id"], ALLOW_DATA_ATTR: false })
    .trim();
}

const wrapTables = (html: string) => html.replace(/<table\b/g, '<div class="table-scroll"><table').replace(/<\/table>/g, "</table></div>");

/** A blog article for display: sanitised again on the way out, with scrolling tables. */
export function articleForDisplay(html: string) {
  return wrapTables(sanitizeArticle(html));
}

/** For display: sanitised, with each table wrapped so it can scroll sideways on phones. */
export function descriptionForDisplay(html: string) {
  return wrapTables(sanitizeRichText(html));
}
