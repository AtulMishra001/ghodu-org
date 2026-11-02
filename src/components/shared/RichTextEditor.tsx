"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableHeaderBase from "@tiptap/extension-table-header";
import TableCellBase from "@tiptap/extension-table-cell";

/* Strip colwidth from schema so Tiptap never stores or renders <col> widths */
const TableCell = TableCellBase.extend({
  addAttributes() {
    const attrs = this.parent?.() ?? {};
    delete (attrs as Record<string, unknown>).colwidth;
    return attrs;
  },
});
const TableHeader = TableHeaderBase.extend({
  addAttributes() {
    const attrs = this.parent?.() ?? {};
    delete (attrs as Record<string, unknown>).colwidth;
    return attrs;
  },
});
import { useEffect, useId, useState, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import {
  Bold, Italic, Underline as UnderlineIcon, List, ListOrdered,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Link as LinkIcon, ImageIcon, Table as TableIcon,
  Undo2, Redo2, Strikethrough, Code, Minus, X, Bookmark, Loader2,
} from "lucide-react";
import { cleanPastedTables } from "@/lib/rte-paste";

/* ── Link extension: also keeps the download attribute ── */
const CustomLink = Link.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      download: {
        default: null,
        parseHTML: (el) => el.getAttribute("download"),
        renderHTML: (attrs) => (attrs.download === null || attrs.download === undefined ? {} : { download: attrs.download }),
      },
    };
  },
});

/* ── Image extension: alignment + explicit width / height ── */
const CustomImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      "data-align": {
        default: "basic",
        parseHTML: (el) => el.getAttribute("data-align") ?? "basic",
        renderHTML: ({ "data-align": align }) =>
          align && align !== "basic" ? { "data-align": align } : {},
      },
      width: {
        default: null,
        parseHTML: (el) => el.getAttribute("width"),
        renderHTML: (attrs) => (attrs.width ? { width: attrs.width } : {}),
      },
      height: {
        default: null,
        parseHTML: (el) => el.getAttribute("height"),
        renderHTML: (attrs) => (attrs.height ? { height: attrs.height } : {}),
      },
    };
  },
});

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  minHeight?: string;
  maxHeight?: string;
  /**
   * Uploads a picked image and resolves to its public URL. It should reject
   * with a readable message when the file breaks the upload rules. Without
   * it, the image dialog only accepts a pasted URL.
   */
  onImageUpload?: (file: File) => Promise<string>;
  /** Shown under the file picker, e.g. "WebP only, up to 2 MB." */
  imageHint?: string;
  /** `accept` for the file picker. */
  imageAccept?: string;
  /** Class for the editing area, to match where the content is shown (default: the admin's plain style). */
  contentClassName?: string;
}

const FORMAT_OPTIONS = [
  { label: "Paragraph", value: "paragraph" },
  { label: "Heading 1",  value: "h1" },
  { label: "Heading 2",  value: "h2" },
  { label: "Heading 3",  value: "h3" },
  { label: "Heading 4",  value: "h4" },
  { label: "Heading 5",  value: "h5" },
  { label: "Heading 6",  value: "h6" },
];

/* ══════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════ */

export default function RichTextEditor({
  value,
  onChange,
  minHeight = "300px",
  maxHeight  = "500px",
  onImageUpload,
  imageHint,
  imageAccept = "image/*",
  contentClassName = "rte-content",
}: RichTextEditorProps) {
  const [linkOpen,        setLinkOpen]        = useState(false);
  const [imageOpen,       setImageOpen]       = useState(false);
  const [tablePickerOpen, setTablePickerOpen] = useState(false);
  const tableRef = useRef<HTMLDivElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
    // Tiptap v3 doesn't re-render on selection changes by default, which would
    // leave the toolbar's active and disabled states out of date.
    shouldRerenderOnTransaction: true,
    extensions: [
      // StarterKit v3 already bundles Link and Underline; turn those copies off
      // so the configured versions below are the only ones (no duplicate warning).
      StarterKit.configure({ heading: { levels: [1, 2, 3, 4, 5, 6] }, link: false, underline: false }),
      Underline,
      CustomLink.configure({
        openOnClick: false,
        HTMLAttributes: { rel: "noopener noreferrer" },
      }),
      CustomImage.configure({ inline: false, allowBase64: false }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Table.configure({ resizable: false }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: value || "",
    editorProps: {
      attributes: { class: contentClassName, spellcheck: "true" },
      /* Strip ALL column-width hints injected by Word / Google Sheets on paste */
      transformPastedHTML: (html: string) => cleanPastedTables(html),
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  /* Sync external value only while editor is idle */
  useEffect(() => {
    if (!editor || editor.isFocused) return;
    // emitUpdate: false — syncing from props is not a user edit, so it must not
    // fire onUpdate/onChange (Tiptap v3 emits by default).
    if (value !== editor.getHTML()) editor.commands.setContent(value || "", { emitUpdate: false });
  }, [value, editor]);

  /* Close table picker on outside click */
  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (tableRef.current && !tableRef.current.contains(e.target as Node))
        setTablePickerOpen(false);
    };
    if (tablePickerOpen) document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [tablePickerOpen]);

  const getFormatValue = () => {
    if (!editor) return "paragraph";
    for (let i = 1; i <= 6; i++)
      if (editor.isActive("heading", { level: i })) return `h${i}`;
    return "paragraph";
  };

  const handleFormat = (val: string) => {
    if (!editor) return;
    if (val === "paragraph") editor.chain().focus().setParagraph().run();
    else {
      const level = parseInt(val.replace("h", "")) as 1|2|3|4|5|6;
      editor.chain().focus().setHeading({ level }).run();
    }
  };

  if (!editor) return null;

  return (
    <>
      <div className="rounded-control border bg-surface">

        {/* ── Toolbar ─────────────────────────────── */}
        <div role="toolbar" aria-label="Formatting" className="flex flex-wrap items-center gap-0.5 rounded-t-control border-b bg-surface-muted px-2 py-2">

          <Btn onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} tooltip="Undo">
            <Undo2 size={14} />
          </Btn>
          <Btn onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} tooltip="Redo">
            <Redo2 size={14} />
          </Btn>

          <Sep />

          <select
            value={getFormatValue()}
            onChange={(e) => handleFormat(e.target.value)}
            aria-label="Text format"
            className="h-8 cursor-pointer rounded-md border bg-surface px-2 text-xs text-foreground outline-none hover:border-foreground/40 focus:border-primary focus:ring-2 focus:ring-primary/15"
          >
            {FORMAT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          <Sep />

          <Btn onClick={() => editor.chain().focus().toggleBold().run()}      active={editor.isActive("bold")}      tooltip="Bold">         <Bold          size={14} /></Btn>
          <Btn onClick={() => editor.chain().focus().toggleItalic().run()}    active={editor.isActive("italic")}    tooltip="Italic">       <Italic        size={14} /></Btn>
          <Btn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} tooltip="Underline">    <UnderlineIcon size={14} /></Btn>
          <Btn onClick={() => editor.chain().focus().toggleStrike().run()}    active={editor.isActive("strike")}    tooltip="Strikethrough"><Strikethrough size={14} /></Btn>
          <Btn onClick={() => editor.chain().focus().toggleCode().run()}      active={editor.isActive("code")}      tooltip="Inline Code">  <Code          size={14} /></Btn>

          <Sep />

          <Btn onClick={() => editor.chain().focus().toggleBulletList().run()}  active={editor.isActive("bulletList")}  tooltip="Bullet List">   <List        size={14} /></Btn>
          <Btn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} tooltip="Ordered List">  <ListOrdered size={14} /></Btn>

          <Sep />

          <Btn onClick={() => editor.chain().focus().setTextAlign("left").run()}    active={editor.isActive({ textAlign: "left" })}    tooltip="Align Left">   <AlignLeft    size={14} /></Btn>
          <Btn onClick={() => editor.chain().focus().setTextAlign("center").run()}  active={editor.isActive({ textAlign: "center" })}  tooltip="Align Center"> <AlignCenter  size={14} /></Btn>
          <Btn onClick={() => editor.chain().focus().setTextAlign("right").run()}   active={editor.isActive({ textAlign: "right" })}   tooltip="Align Right">  <AlignRight   size={14} /></Btn>
          <Btn onClick={() => editor.chain().focus().setTextAlign("justify").run()} active={editor.isActive({ textAlign: "justify" })} tooltip="Justify">       <AlignJustify size={14} /></Btn>

          <Sep />

          <Btn onClick={() => setLinkOpen(true)}  active={editor.isActive("link")} tooltip="Insert Link">  <LinkIcon  size={14} /></Btn>
          <Btn onClick={() => setImageOpen(true)}                                   tooltip="Insert Image"> <ImageIcon size={14} /></Btn>

          {/* Table button with grid picker */}
          <div className="relative" ref={tableRef}>
            <Btn onClick={() => setTablePickerOpen((v) => !v)} active={tablePickerOpen} tooltip="Insert Table">
              <TableIcon size={14} />
            </Btn>
            {tablePickerOpen && (
              <TablePicker
                onSelect={(rows, cols) => {
                  editor.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run();
                  setTablePickerOpen(false);
                }}
                onClose={() => setTablePickerOpen(false)}
              />
            )}
          </div>

          <Btn onClick={() => editor.chain().focus().setHorizontalRule().run()} tooltip="Horizontal Rule">
            <Minus size={14} />
          </Btn>
        </div>

        {/* ── Table controls: only while the cursor is in a table ── */}
        {editor.isActive("table") && (
          <div role="toolbar" aria-label="Table" className="flex flex-wrap items-center gap-1 border-b bg-surface-muted/50 px-2 py-1.5">
            <span className="mr-1 text-xs font-semibold text-muted-foreground">Table</span>
            <TableAction onClick={() => editor.chain().focus().addRowAfter().run()}>Add row</TableAction>
            <TableAction onClick={() => editor.chain().focus().deleteRow().run()}>Remove row</TableAction>
            <TableAction onClick={() => editor.chain().focus().addColumnAfter().run()}>Add column</TableAction>
            <TableAction onClick={() => editor.chain().focus().deleteColumn().run()}>Remove column</TableAction>
            <TableAction onClick={() => editor.chain().focus().deleteTable().run()} danger>Delete table</TableAction>
          </div>
        )}

        {/* ── Editable area ───────────────────────── */}
        <div
          className="overflow-y-auto rounded-b-control bg-surface"
          style={{ minHeight, maxHeight }}
          onClick={() => editor.commands.focus()}
        >
          <EditorContent editor={editor} />
        </div>
      </div>

      {/* Modals rendered above everything */}
      {linkOpen  && <LinkModal  editor={editor} onClose={() => setLinkOpen(false)}  />}
      {imageOpen && (
        <ImageModal editor={editor} onClose={() => setImageOpen(false)} upload={onImageUpload} hint={imageHint} accept={imageAccept} />
      )}
    </>
  );
}

/* ── Portal: escapes any parent transform/overflow so fixed works ── */
function Portal({ children }: { children: ReactNode }) {
  if (typeof document === "undefined") return null;
  return createPortal(children, document.body);
}

/* ══════════════════════════════════════════════════
   MODAL SHELL
══════════════════════════════════════════════════ */

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  /* Focus moves in on open and back to the toolbar on close. */
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    const panel = panelRef.current;
    const moveIn = () => (panel?.querySelector<HTMLElement>("[data-autofocus]") ?? panel)?.focus();
    moveIn();
    /* Tiptap's focus() runs on the next frame, so a recent command can pull focus back out. */
    const frame = requestAnimationFrame(() => {
      if (!panel?.contains(document.activeElement)) moveIn();
    });
    return () => {
      cancelAnimationFrame(frame);
      opener?.focus?.();
    };
  }, []);

  const onKeyDown = (e: React.KeyboardEvent) => {
    /* React portals bubble events through the React tree, so a submit or an
       Enter keypress in here would otherwise reach the CMS form wrapping the
       editor and save the post before the edit is applied. */
    if (e.key === "Enter") e.stopPropagation();
    if (e.key === "Escape") {
      e.stopPropagation();
      onClose();
    }
    if (e.key === "Tab" && panelRef.current) {
      const items = [...panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)];
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    }
  };

  return (
    <Portal>
      <div
        className="fixed inset-0 z-9999 flex items-center justify-center bg-inverse/50 backdrop-blur-[2px]"
        onMouseDown={(e) => e.target === e.currentTarget && onClose()}
        onSubmit={(e) => e.stopPropagation()}
        onKeyDown={onKeyDown}
      >
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          tabIndex={-1}
          className="mx-4 max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-card bg-background shadow-elevated outline-none"
        >
          <div className="flex items-center justify-between border-b px-6 py-4">
            <h3 id={titleId} className="font-display text-xl font-medium">{title}</h3>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="cursor-pointer rounded-md p-1 text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground"
            >
              <X size={18} />
            </button>
          </div>

          <div className="px-6 py-5">{children}</div>
        </div>
      </div>
    </Portal>
  );
}

/* ── Shared submit / cancel row ── */
function ModalActions({ onClose, submitLabel = "Submit", disabled }: { onClose: () => void; submitLabel?: string; disabled?: boolean }) {
  return (
    <div className="flex justify-end gap-2 pt-2">
      <button
        type="button"
        onClick={onClose}
        className="cursor-pointer rounded-control px-4 py-2 text-sm font-medium text-muted-foreground transition hover:bg-surface-muted hover:text-foreground"
      >
        Cancel
      </button>
      <button
        type="submit"
        disabled={disabled}
        className="cursor-pointer rounded-control bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-40"
      >
        {submitLabel}
      </button>
    </div>
  );
}

/* ── Shared input styles ── */
const inputCls =
  "w-full rounded-control border bg-surface px-3 py-2 text-sm outline-none transition placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-primary/15";
const labelCls = "mb-1.5 block text-sm font-medium";
const checkCls = "h-4 w-4 cursor-pointer rounded accent-primary";
const checkLabelCls = "flex cursor-pointer select-none items-center gap-2 text-sm text-muted-foreground";

/* ══════════════════════════════════════════════════
   LINK MODAL
══════════════════════════════════════════════════ */

function LinkModal({ editor, onClose }: { editor: Editor; onClose: () => void }) {
  const linkAttrs = editor.getAttributes("link");
  const existing = linkAttrs.href as string | undefined;
  const { from, to } = editor.state.selection;
  const selectedText = editor.state.doc.textBetween(from, to, "");

  const [url,       setUrl]       = useState(existing ?? "");
  const [linkText,  setLinkText]  = useState(selectedText);
  const [newWindow, setNewWindow] = useState(linkAttrs.target === "_blank");

  const submit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      /* Clearing the URL removes the link. extendMarkRange covers the whole
         link even when the selection only partly overlaps it. */
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      onClose();
      return;
    }

    const attrs = { href: url.trim(), target: newWindow ? "_blank" : "_self" };

    if (existing) {
      /* Editing an existing link: rewrite it end to end. */
      editor.chain().focus().extendMarkRange("link").setLink(attrs).run();
    } else if (selectedText) {
      /* Apply link to existing selection */
      editor.chain().focus().setLink(attrs).run();
    } else if (linkText.trim()) {
      /* Insert new text with link mark */
      editor.chain().focus().insertContent({
        type: "text",
        text: linkText.trim(),
        marks: [{ type: "link", attrs }],
      }).run();
    } else {
      editor.chain().focus().setLink(attrs).run();
    }
    onClose();
  };

  return (
    <Modal title={existing ? "Edit link" : "Insert link"} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <label className="block">
          <span className={labelCls}>URL to link</span>
          <span className="relative block">
            <input
              data-autofocus
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className={`${inputCls} pr-10`}
            />
            <Bookmark size={15} className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground" />
          </span>
        </label>

        {!selectedText && !existing && (
          <label className="block">
            <span className={labelCls}>Text to display</span>
            <input type="text" value={linkText} onChange={(e) => setLinkText(e.target.value)} placeholder="Link text" className={inputCls} />
          </label>
        )}

        <label className={checkLabelCls}>
          <input type="checkbox" checked={newWindow} onChange={(e) => setNewWindow(e.target.checked)} className={checkCls} />
          Open in new window
        </label>

        <ModalActions onClose={onClose} />
      </form>
    </Modal>
  );
}

/* ══════════════════════════════════════════════════
   IMAGE MODAL  (tabbed: Image | Link)
══════════════════════════════════════════════════ */

type ImgAlign = "basic" | "left" | "center" | "right";

const ALIGN_OPTIONS = ["basic", "left", "center", "right"] as const;

/** Only web images: base64 and other schemes never reach the document. */
const isImageUrl = (value: string) => /^https:\/\/\S+$/i.test(value.trim());

function ImageModal({
  editor,
  onClose,
  upload,
  hint,
  accept,
}: {
  editor: Editor;
  onClose: () => void;
  upload?: (file: File) => Promise<string>;
  hint?: string;
  accept: string;
}) {
  const [tab, setTab] = useState<"image" | "link">("image");
  const baseId = useId();

  /* ── Image tab ── */
  const [fileName,    setFileName]    = useState("");
  const [imageUrl,    setImageUrl]    = useState("");
  const [alt,         setAlt]         = useState("");
  const [imgWidth,    setImgWidth]    = useState("");
  const [imgHeight,   setImgHeight]   = useState("");
  const [constrain,   setConstrain]   = useState(true);
  const [ratio,       setRatio]       = useState<number | null>(null);
  const [imgAlign,    setImgAlign]    = useState<ImgAlign>("basic");
  const [uploading,   setUploading]   = useState(false);
  const [uploadErr,   setUploadErr]   = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  /* ── Link tab ── */
  const initSelectedText = () => {
    const { from, to } = editor.state.selection;
    return editor.state.doc.textBetween(from, to, "");
  };
  const [linkUrl,      setLinkUrl]      = useState("");
  const [linkText,     setLinkText]     = useState(initSelectedText);
  const [newWindow,    setNewWindow]    = useState(false);
  const [downloadLink, setDownloadLink] = useState(false);

  /* The image's real proportions, for "Constrain proportions" */
  useEffect(() => {
    if (!isImageUrl(imageUrl)) return;
    let live = true;
    const probe = new window.Image();
    probe.onload = () => {
      if (live && probe.naturalWidth && probe.naturalHeight) setRatio(probe.naturalWidth / probe.naturalHeight);
    };
    probe.src = imageUrl.trim();
    return () => {
      live = false;
    };
  }, [imageUrl]);

  /* With no ratio yet, the typed values themselves set the proportion. */
  const currentRatio = () => {
    if (ratio) return ratio;
    const w = Number(imgWidth);
    const h = Number(imgHeight);
    return w > 0 && h > 0 ? w / h : null;
  };
  const changeWidth = (value: string) => {
    const r = currentRatio();
    setImgWidth(value);
    if (constrain && r) setImgHeight(Number(value) > 0 ? String(Math.round(Number(value) / r)) : "");
  };
  const changeHeight = (value: string) => {
    const r = currentRatio();
    setImgHeight(value);
    if (constrain && r) setImgWidth(Number(value) > 0 ? String(Math.round(Number(value) * r)) : "");
  };

  /* ── File upload: validation and storage are the caller's (see onImageUpload) ── */
  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !upload) return;

    setFileName(file.name);
    setUploadErr("");
    setUploading(true);
    try {
      setRatio(null);
      setImageUrl(await upload(file));
    } catch (err) {
      setUploadErr(err instanceof Error ? err.message : "Upload failed. Please try again.");
      setFileName("");
      if (fileRef.current) fileRef.current.value = "";
    } finally {
      setUploading(false);
    }
  };

  const clearFile = () => {
    setFileName("");
    setImageUrl("");
    setRatio(null);
    setUploadErr("");
    if (fileRef.current) fileRef.current.value = "";
  };

  /* ── Submit handlers ── */
  const submitImage = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!isImageUrl(imageUrl) || uploading) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (editor.chain().focus() as any).setImage({
      src:          imageUrl.trim(),
      alt:          alt.trim(),
      "data-align": imgAlign,
      ...(imgWidth  ? { width:  imgWidth  } : {}),
      ...(imgHeight ? { height: imgHeight } : {}),
    }).run();
    onClose();
  };

  const submitLink = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!linkUrl.trim()) return;
    const attrs = {
      href:   linkUrl.trim(),
      target: newWindow    ? "_blank" : "_self",
      ...(downloadLink ? { download: "" } : {}),
    };
    if (linkText.trim()) {
      editor.chain().focus().insertContent({
        type: "text",
        text: linkText.trim(),
        marks: [{ type: "link", attrs }],
      }).run();
    } else {
      editor.chain().focus().setLink(attrs).run();
    }
    onClose();
  };

  const urlProblem = imageUrl.trim() && !isImageUrl(imageUrl) ? "Enter an https:// image address. Base64 images aren't allowed." : "";

  /* ── UI ── */
  return (
    <Modal title="Insert image" onClose={onClose}>
      {/* Tabs */}
      <div role="tablist" aria-label="Insert" className="-mt-2 mb-4 flex border-b">
        {(["image", "link"] as const).map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            id={`${baseId}-${t}`}
            aria-selected={tab === t}
            aria-controls={`${baseId}-${t}-panel`}
            onClick={() => setTab(t)}
            className={`-mb-px cursor-pointer border-b-2 px-4 py-2 text-sm font-semibold transition-colors ${
              tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t === "image" ? "Image" : "Link"}
          </button>
        ))}
      </div>

      {/* ════ IMAGE TAB ════ */}
      {tab === "image" && (
        <form id={`${baseId}-image-panel`} role="tabpanel" aria-labelledby={`${baseId}-image`} onSubmit={submitImage} className="space-y-4">
          {/* File picker (only when the caller can upload) */}
          {upload && (
            <div>
              <span className={labelCls}>Select from files</span>
              <div className="flex items-center gap-2">
                <label className="flex-1 cursor-pointer">
                  <input ref={fileRef} type="file" accept={accept} className="peer sr-only" onChange={handleFile} />
                  <span className="flex items-center rounded-control border bg-surface px-3 py-2 text-sm transition hover:border-foreground/40 peer-focus-visible:border-primary peer-focus-visible:ring-2 peer-focus-visible:ring-primary/15">
                    {uploading ? (
                      <span className="flex items-center gap-2 text-primary">
                        <Loader2 size={13} className="animate-spin" /> Uploading…
                      </span>
                    ) : (
                      <span className="truncate text-muted-foreground">{fileName || "Choose a file"}</span>
                    )}
                  </span>
                </label>
                {fileName && !uploading && (
                  <button
                    type="button"
                    onClick={clearFile}
                    aria-label="Clear file"
                    className="cursor-pointer rounded-md p-1.5 text-muted-foreground transition hover:bg-surface-muted hover:text-foreground"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>
              {hint && <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>}
              {uploadErr && <p role="alert" className="mt-1 text-xs font-semibold text-red-700">{uploadErr}</p>}
            </div>
          )}

          <label className="block">
            <span className={labelCls}>Image URL</span>
            <input
              data-autofocus
              type="text"
              value={imageUrl}
              onChange={(e) => {
                setRatio(null);
                setImageUrl(e.target.value);
              }}
              placeholder="https://example.com/image.webp"
              aria-invalid={!!urlProblem}
              className={inputCls}
            />
            {urlProblem && <span role="alert" className="mt-1 block text-xs font-semibold text-red-700">{urlProblem}</span>}
          </label>

          <div className="border-t border-dashed" />

          <label className="block">
            <span className={labelCls}>Alternative text</span>
            <input type="text" value={alt} onChange={(e) => setAlt(e.target.value)} placeholder="Describe the image…" className={inputCls} />
          </label>

          <div className="flex flex-wrap items-end gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-muted-foreground">Width</span>
              <input type="text" inputMode="numeric" value={imgWidth} onChange={(e) => changeWidth(e.target.value)} placeholder="auto" className={`${inputCls} w-20`} />
            </label>
            <span aria-hidden className="pb-2 font-medium text-muted-foreground">×</span>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-muted-foreground">Height</span>
              <input type="text" inputMode="numeric" value={imgHeight} onChange={(e) => changeHeight(e.target.value)} placeholder="auto" className={`${inputCls} w-20`} />
            </label>
            <label className={`${checkLabelCls} pb-2`}>
              <input type="checkbox" checked={constrain} onChange={(e) => setConstrain(e.target.checked)} className={checkCls} />
              Constrain proportions
            </label>
          </div>

          <fieldset className="flex flex-wrap gap-4">
            <legend className="mb-1.5 text-sm font-medium">Alignment</legend>
            {ALIGN_OPTIONS.map((a) => (
              <label key={a} className="flex cursor-pointer select-none items-center gap-1.5 text-sm text-muted-foreground capitalize">
                <input type="radio" name={`${baseId}-align`} value={a} checked={imgAlign === a} onChange={() => setImgAlign(a)} className="cursor-pointer accent-primary" />
                {a}
              </label>
            ))}
          </fieldset>

          <ModalActions onClose={onClose} disabled={!isImageUrl(imageUrl) || uploading} />
        </form>
      )}

      {/* ════ LINK TAB ════ */}
      {tab === "link" && (
        <form id={`${baseId}-link-panel`} role="tabpanel" aria-labelledby={`${baseId}-link`} onSubmit={submitLink} className="space-y-4">
          <label className="block">
            <span className={labelCls}>URL to link</span>
            <span className="relative block">
              <input type="text" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="https://example.com" className={`${inputCls} pr-10`} />
              <Bookmark size={15} className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground" />
            </span>
          </label>

          <label className="block">
            <span className={labelCls}>Text to display</span>
            <input type="text" value={linkText} onChange={(e) => setLinkText(e.target.value)} placeholder="Link text" className={inputCls} />
          </label>

          <div className="flex flex-wrap gap-5">
            <label className={checkLabelCls}>
              <input type="checkbox" checked={newWindow} onChange={(e) => setNewWindow(e.target.checked)} className={checkCls} />
              Open in new window
            </label>
            <label className={checkLabelCls}>
              <input type="checkbox" checked={downloadLink} onChange={(e) => setDownloadLink(e.target.checked)} className={checkCls} />
              Download link
            </label>
          </div>

          <ModalActions onClose={onClose} disabled={!linkUrl.trim()} />
        </form>
      )}
    </Modal>
  );
}

/* ══════════════════════════════════════════════════
   TABLE GRID PICKER
══════════════════════════════════════════════════ */

function TablePicker({ onSelect, onClose }: { onSelect: (rows: number, cols: number) => void; onClose: () => void }) {
  const MAX = 10;
  const [hover, setHover] = useState({ r: 1, c: 1 });
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => gridRef.current?.focus(), []);

  /* Arrow keys move the selection; Enter inserts, Escape closes. */
  const onKeyDown = (e: React.KeyboardEvent) => {
    const clamp = (n: number) => Math.min(MAX, Math.max(1, n));
    const moves: Record<string, () => void> = {
      ArrowRight: () => setHover((h) => ({ ...h, c: clamp(h.c + 1) })),
      ArrowLeft: () => setHover((h) => ({ ...h, c: clamp(h.c - 1) })),
      ArrowDown: () => setHover((h) => ({ ...h, r: clamp(h.r + 1) })),
      ArrowUp: () => setHover((h) => ({ ...h, r: clamp(h.r - 1) })),
      Enter: () => onSelect(hover.r, hover.c),
      Escape: onClose,
    };
    const move = moves[e.key];
    if (!move) return;
    e.preventDefault();
    e.stopPropagation();
    move();
  };

  return (
    <div className="absolute top-full left-0 z-[80] mt-1.5 rounded-card border bg-background p-3 shadow-elevated">
      <div
        ref={gridRef}
        role="application"
        tabIndex={0}
        aria-label={`Table size: ${hover.c} columns by ${hover.r} rows. Use the arrow keys, then press Enter.`}
        className="grid gap-1 rounded-sm"
        style={{ gridTemplateColumns: `repeat(${MAX}, 1.25rem)` }}
        onKeyDown={onKeyDown}
      >
        {Array.from({ length: MAX * MAX }).map((_, i) => {
          const r = Math.floor(i / MAX) + 1;
          const c = (i % MAX) + 1;
          const active = r <= hover.r && c <= hover.c;
          return (
            <div
              key={i}
              className={`h-5 w-5 cursor-pointer rounded-[3px] border transition-colors ${active ? "border-primary bg-primary/25" : "bg-surface-muted/60 hover:border-primary/40"}`}
              onMouseEnter={() => setHover({ r, c })}
              onMouseDown={(event) => {
                event.preventDefault();
                onSelect(r, c);
              }}
            />
          );
        })}
      </div>
      <p aria-hidden className="mt-2 text-center text-xs font-medium text-muted-foreground">{`${hover.c} × ${hover.r}`}</p>
    </div>
  );
}

function TableAction({ onClick, danger, children }: { onClick: () => void; danger?: boolean; children: ReactNode }) {
  return (
    <button
      type="button"
      // mouseDown keeps the cursor in the table so the command knows where to act.
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`cursor-pointer rounded-md border bg-surface px-2 py-1 text-xs font-medium transition hover:border-foreground/40 ${danger ? "text-red-700" : "text-foreground"}`}
    >
      {children}
    </button>
  );
}

/* ══════════════════════════════════════════════════
   TOOLBAR PRIMITIVES
══════════════════════════════════════════════════ */

function Btn({
  onClick, children, active, disabled, tooltip,
}: {
  onClick: () => void;
  children: ReactNode;
  active?: boolean;
  disabled?: boolean;
  tooltip?: string;
}) {
  return (
    <div className="group/btn relative">
      <button
        type="button"
        aria-label={tooltip}
        aria-pressed={active}
        // mouseDown is only stopped so the editor keeps its selection; the action
        // runs on click, so Enter and Space work as well as the mouse.
        onMouseDown={(e) => e.preventDefault()}
        onClick={onClick}
        disabled={disabled}
        className={`inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border transition-colors ${
          active
            ? "border-primary/40 bg-primary/10 text-primary"
            : "border-transparent text-muted-foreground hover:border-border hover:bg-surface hover:text-foreground"
        } disabled:cursor-not-allowed disabled:opacity-30`}
      >
        {children}
      </button>

      {/* Custom tooltip */}
      {tooltip && (
        <div className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-inverse px-2 py-1 text-xs font-medium text-inverse-foreground opacity-0 transition-opacity group-hover/btn:opacity-100 group-focus-within/btn:opacity-100">
          {tooltip}
          <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-inverse" />
        </div>
      )}
    </div>
  );
}

function Sep() {
  return <div className="mx-1 h-5 w-px shrink-0 self-center bg-border" />;
}
