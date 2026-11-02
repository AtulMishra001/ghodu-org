"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { ArrowLeftIcon, ClockCounterClockwiseIcon, SpinnerGapIcon } from "@phosphor-icons/react";
import RichTextEditor from "@/components/shared/RichTextEditor";
import { Sheet } from "@/components/shared/Sheet";
import { useToast } from "@/components/shared/Toast";
import { BLOG_AUTHOR } from "@/data/blog";
import { formatBlogDate, normalizeBlogInput, slugify, validateBlogInput, type Blog, type BlogFaq, type BlogStatus } from "@/lib/blog";
import { IMAGE_MIME } from "@/lib/image-rules";
import { button } from "@/lib/ui";
import { card, field, hint, label } from "../styles";
import { contentImageHint, saveBlog, uploadContentImage } from "./api";
import FaqRows, { emptyFaq } from "../form/FaqRows";
import HeroImageField from "./HeroImageField";
import { useBlogAutosave } from "./useBlogAutosave";

type FormState = {
  title: string;
  slug: string;
  /** False until the slug is typed by hand: until then it follows the title. */
  slugEdited: boolean;
  category: string;
  image: string;
  alt: string;
  excerpt: string;
  tldr: string;
  keyTakeaways: string;
  content: string;
  tags: string;
  relatedPostSlugs: string;
  faqs: BlogFaq[];
  sources: string;
  metaTitle: string;
  metaDescription: string;
  schemaTitle: string;
  schemaDescription: string;
};

function startingForm(blog?: Blog): FormState {
  return {
    title: blog?.title ?? "",
    slug: blog?.slug ?? "",
    slugEdited: !!blog,
    category: blog?.category ?? "",
    image: blog?.image ?? "",
    alt: blog?.alt ?? "",
    excerpt: blog?.excerpt ?? "",
    tldr: blog?.tldr ?? "",
    keyTakeaways: (blog?.keyTakeaways ?? []).join("\n"),
    content: blog?.content ?? "",
    tags: (blog?.tags ?? []).join(", "),
    relatedPostSlugs: (blog?.relatedPostSlugs ?? []).join("\n"),
    faqs: blog?.faqs?.length ? blog.faqs : [emptyFaq(), emptyFaq(), emptyFaq()],
    sources: (blog?.sources ?? []).join("\n"),
    metaTitle: blog?.meta?.title ?? "",
    metaDescription: blog?.meta?.description ?? "",
    schemaTitle: blog?.structuredData?.title ?? "",
    schemaDescription: blog?.structuredData?.description ?? "",
  };
}

const NEW_CATEGORY = "__new";

export default function BlogForm({ blog, categories }: { blog?: Blog; categories: string[] }) {
  const router = useRouter();
  const toast = useToast();
  const [initial] = useState(() => startingForm(blog));
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState<BlogStatus | null>(null);
  const [addingCategory, setAddingCategory] = useState(false);
  const [confirmUnpublish, setConfirmUnpublish] = useState(false);
  const isPublished = blog?.status === "published";

  const autosave = useBlogAutosave<FormState>({ id: blog?._id, form, initial, onRestore: setForm });
  const autosaveRef = useRef(autosave);
  // eslint-disable-next-line react-hooks/refs -- always the latest handlers, read only from the cleanup below
  autosaveRef.current = autosave;

  // The router keeps this page mounted but hidden after leaving it. Once a post
  // has been saved, coming back must show an empty form, not the post just saved.
  useLayoutEffect(
    () => () => {
      if (!autosaveRef.current.isClosed()) return;
      setForm(initial);
      setAddingCategory(false);
      autosaveRef.current.reopen();
    },
    [initial],
  );

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    autosave.markDirty();
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function setTitle(title: string) {
    autosave.markDirty();
    setForm((prev) => ({ ...prev, title, slug: prev.slugEdited ? prev.slug : slugify(title) }));
  }

  function setSlug(slug: string) {
    autosave.markDirty();
    // Letters may still be mid-word, so only the final hyphen is kept while typing.
    setForm((prev) => ({ ...prev, slugEdited: true, slug: slug.toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/-{2,}/g, "-").replace(/^-/, "") }));
  }

  function payload(status: BlogStatus) {
    return {
      title: form.title,
      slug: form.slug,
      category: form.category,
      image: form.image,
      alt: form.alt,
      excerpt: form.excerpt,
      tldr: form.tldr,
      keyTakeaways: form.keyTakeaways,
      content: form.content,
      tags: form.tags.split(","),
      relatedPostSlugs: form.relatedPostSlugs,
      faqs: form.faqs,
      sources: form.sources,
      meta: { title: form.metaTitle, description: form.metaDescription },
      structuredData: { title: form.schemaTitle, description: form.schemaDescription },
      status,
    };
  }

  async function submit(status: BlogStatus) {
    if (saving) return;
    const body = payload(status);
    const problem = validateBlogInput(normalizeBlogInput(body));
    if (problem) {
      toast(problem, "error");
      return;
    }
    setSaving(status);
    try {
      await saveBlog(blog?._id, body);
      autosave.close();
      toast(status === "draft" ? "Draft saved" : isPublished ? "Blog updated" : "Blog published");
      router.push("/admin/blogs");
      router.refresh();
    } catch (err) {
      // The form keeps its contents, so nothing is lost on a failed save.
      toast(err instanceof Error ? err.message : "Couldn't save the blog.", "error");
    } finally {
      setSaving(null);
    }
  }

  const busy = saving !== null;
  const categoryOptions = [...new Set([...categories, ...(form.category ? [form.category] : [])])].sort((a, b) => a.localeCompare(b));

  return (
    <div className="pb-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link href="/admin/blogs" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
            <ArrowLeftIcon size={16} />
            Back to archive
          </Link>
          <h1 className="mt-2 font-display text-[32px] leading-tight font-medium tracking-tight md:text-[40px]">{blog ? "Edit blog" : "Create blog"}</h1>
        </div>
      </div>

      {autosave.pending && (
        <Notice>
          <span className="min-w-0 flex-1">You have unsaved changes from {new Date(autosave.pending.savedAt).toLocaleString("en-IN")}. Choose what to do before you continue editing.</span>
          <button type="button" onClick={autosave.restorePending} className={button("primary", "sm")}>
            Restore unsaved changes
          </button>
          <button type="button" onClick={autosave.discard} className={button("outline", "sm")}>
            Discard
          </button>
        </Notice>
      )}
      {autosave.restoredAt && !blog && (
        <Notice>
          <span className="min-w-0 flex-1">We restored the draft you were writing.</span>
          <button type="button" onClick={autosave.discard} className={button("outline", "sm")}>
            Discard and start fresh
          </button>
        </Notice>
      )}

      {/* Nothing here submits: only the explicit buttons at the end save, so
          pressing Enter in a field can never publish. Editing waits while a
          restore decision is pending, so it can't overwrite the saved copy. */}
      <form onSubmit={(e) => e.preventDefault()} inert={!!autosave.pending} className={`mt-5 flex flex-col gap-5 ${autosave.pending ? "opacity-50" : ""}`}>
        <FormSection title="Core Blog Setup">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Title">
              <input value={form.title} onChange={(e) => setTitle(e.target.value)} className={field} />
            </Field>
            <Field label="Slug" note={isPublished ? "If you change this, the old URL redirects to the new one." : "Fills in from the title until you edit it."}>
              <input value={form.slug} onChange={(e) => setSlug(e.target.value)} onBlur={() => set("slug", slugify(form.slug))} className={field} />
            </Field>
            <Field label="Category">
              {addingCategory ? (
                <span className="flex gap-2">
                  <input autoFocus value={form.category} onChange={(e) => set("category", e.target.value)} maxLength={60} placeholder="New category name" className={`${field} min-w-0 flex-1`} />
                  <button
                    type="button"
                    onClick={() => {
                      setAddingCategory(false);
                      set("category", initial.category);
                    }}
                    className={button("outline", "md")}
                  >
                    Cancel
                  </button>
                </span>
              ) : (
                <select
                  value={form.category}
                  onChange={(e) => {
                    if (e.target.value === NEW_CATEGORY) {
                      setAddingCategory(true);
                      set("category", "");
                    } else set("category", e.target.value);
                  }}
                  className={field}
                >
                  <option value="">Select a category</option>
                  {categoryOptions.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                  <option value={NEW_CATEGORY}>+ Add a new category…</option>
                </select>
              )}
            </Field>
            <div className="flex flex-col gap-1.5">
              <span className={label}>Author</span>
              <p className="rounded-control border bg-surface-muted/50 px-3.5 py-2.5 text-[15px]">
                <span className="font-semibold">{BLOG_AUTHOR.name}</span>
                <span className="text-muted-foreground"> · {BLOG_AUTHOR.role}</span>
              </p>
            </div>
          </div>
        </FormSection>

        <FormSection title="Media">
          <div className="grid gap-4 md:grid-cols-2">
            <HeroImageField url={form.image} alt={form.alt} onChange={(url) => set("image", url)} />
            <Field label="Alt Text" note="Describe the image for people who can't see it.">
              <input value={form.alt} onChange={(e) => set("alt", e.target.value)} className={field} />
            </Field>
          </div>
        </FormSection>

        <FormSection title="Answer Layer">
          <Field label="Archive Excerpt" note="The summary shown on archive cards and in the post's hero.">
            <TextArea value={form.excerpt} onChange={(v) => set("excerpt", v)} />
          </Field>
          <Field label="TL;DR" note="Shown at the top of the post as the direct answer.">
            <TextArea value={form.tldr} onChange={(v) => set("tldr", v)} />
          </Field>
          <Field label="Key Takeaways" note="One per line.">
            <TextArea value={form.keyTakeaways} onChange={(v) => set("keyTakeaways", v)} rows={4} />
          </Field>
        </FormSection>

        <FormSection title="Main Article Content">
          <RichTextEditor
            value={form.content}
            onChange={(html) => set("content", html)}
            minHeight="70vh"
            maxHeight="75vh"
            contentClassName="rte-article product-description"
            onImageUpload={uploadContentImage}
            imageHint={contentImageHint}
            imageAccept={`${IMAGE_MIME},.webp`}
          />
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Tags" note="Separate with commas.">
              <input value={form.tags} onChange={(e) => set("tags", e.target.value)} className={field} />
            </Field>
            <Field label="Related Post Slugs" note="One per line. Only published posts are shown.">
              <TextArea value={form.relatedPostSlugs} onChange={(v) => set("relatedPostSlugs", v)} />
            </Field>
          </div>
        </FormSection>

        <FormSection title="Post FAQs">
          <FaqRows rows={form.faqs} onChange={(rows) => set("faqs", rows)} />
        </FormSection>

        <FormSection title="Trust + Relationships">
          <Field label="Sources" note="One http or https link per line.">
            <TextArea value={form.sources} onChange={(v) => set("sources", v)} rows={4} />
          </Field>
        </FormSection>

        <FormSection title="SEO">
          <Field label="Meta Title">
            <input value={form.metaTitle} onChange={(e) => set("metaTitle", e.target.value)} className={field} />
          </Field>
          <Field label="Meta Description">
            <TextArea value={form.metaDescription} onChange={(v) => set("metaDescription", v)} />
          </Field>
        </FormSection>

        <FormSection title="Schema">
          <Field label="Schema Title">
            <input value={form.schemaTitle} onChange={(e) => set("schemaTitle", e.target.value)} className={field} />
          </Field>
          <Field label="Schema Description">
            <TextArea value={form.schemaDescription} onChange={(v) => set("schemaDescription", v)} />
          </Field>
        </FormSection>

        <section className={`${card} flex flex-wrap items-center gap-3 p-4 md:p-5`}>
          <button type="button" disabled={busy} onClick={() => submit("published")} className={`${button("primary", "md")} disabled:opacity-60`}>
            {saving === "published" && <SpinnerGapIcon size={18} className="animate-spin" />}
            {isPublished ? (saving === "published" ? "Updating..." : "Update") : saving === "published" ? "Publishing..." : "Publish"}
          </button>
          <button type="button" disabled={busy} onClick={() => (isPublished ? setConfirmUnpublish(true) : submit("draft"))} className={`${button("outline", "md")} disabled:opacity-60`}>
            {saving === "draft" && <SpinnerGapIcon size={18} className="animate-spin" />}
            {isPublished ? (saving === "draft" ? "Moving..." : "Move to Draft") : saving === "draft" ? "Saving..." : "Save Draft"}
          </button>
          {blog?.updatedAt && <p className={hint}>Last saved {formatBlogDate(blog.updatedAt, "recently")}</p>}
        </section>
      </form>

      <Sheet open={confirmUnpublish} onClose={() => setConfirmUnpublish(false)} title="Move this post to draft?">
        <div className="flex flex-col gap-4 pb-2">
          <p className="text-[15px] text-muted-foreground">The post will go offline straight away, and its URL will show a &ldquo;not found&rdquo; page until you publish it again.</p>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={() => setConfirmUnpublish(false)} className={button("outline", "lg")}>
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                setConfirmUnpublish(false);
                submit("draft");
              }}
              className={button("primary", "lg")}
            >
              Move to Draft
            </button>
          </div>
        </div>
      </Sheet>
    </div>
  );
}

function Notice({ children }: { children: ReactNode }) {
  return (
    <div role="status" className="mt-4 flex flex-wrap items-center gap-3 rounded-card border border-accent/60 bg-accent/10 p-3.5 text-sm font-medium">
      <ClockCounterClockwiseIcon size={20} className="shrink-0" />
      {children}
    </div>
  );
}

function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className={`${card} flex flex-col gap-4 p-4 md:p-5`}>
      <h2 className="text-lg font-bold tracking-tight">{title}</h2>
      {children}
    </section>
  );
}

function Field({ label: text, note, children }: { label: string; note?: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="flex flex-col gap-1.5">
        <span className={label}>{text}</span>
        {children}
      </label>
      {note && <p className={hint}>{note}</p>}
    </div>
  );
}

function TextArea({ value, onChange, rows = 3 }: { value: string; onChange: (value: string) => void; rows?: number }) {
  return <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={rows} className={`${field} h-auto w-full py-2.5`} />;
}
