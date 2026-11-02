/**
 * Removes every column width and alignment hint from tables pasted out of Word,
 * Docs or Sheets, so a pasted table is never stored with fixed widths. Takes the
 * parser as an argument so it can also run outside the browser.
 */
export function cleanPastedTables(html: string, parser: Pick<DOMParser, "parseFromString"> = new DOMParser()) {
  const doc = parser.parseFromString(html, "text/html");
  doc.querySelectorAll("colgroup, col").forEach((el) => el.remove());
  doc.querySelectorAll("table, table *").forEach((el) => {
    const h = el as HTMLElement;
    for (const attr of ["width", "colwidth", "data-colwidth", "align"]) h.removeAttribute(attr);
    for (const prop of ["width", "min-width", "max-width", "text-align"]) h.style?.removeProperty(prop);
  });
  return doc.body.innerHTML;
}
