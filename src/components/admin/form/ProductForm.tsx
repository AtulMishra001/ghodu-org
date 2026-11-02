"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeftIcon, CheckIcon, SpinnerGapIcon, TrashIcon, WarningCircleIcon } from "@phosphor-icons/react";
import RichTextEditor from "@/components/shared/RichTextEditor";
import { useToast } from "@/components/shared/Toast";
import { discardUploads, removeProduct, saveProduct } from "@/app/admin/actions";
import { productCategories } from "@/data/categories";
import { availabilityLabels, availabilityOptions } from "@/data/ordering";
import { emptyDraft, limits, parseProductInput, slugify, type ProductDraft, type ProductErrorKey, type ProductErrors } from "@/lib/product-input";
import { MAX_IMAGE_MB } from "@/lib/image-rules";
import { htmlToText, imageSources, toHtml } from "@/lib/rich-text";
import type { AdminProduct } from "@/lib/server/products";
import { button } from "@/lib/ui";
import DeleteDialog from "../DeleteDialog";
import Switch from "../Switch";
import { card, errorText, field, hint, label } from "../styles";
import ChipsInput from "./ChipsInput";
import CoverUploader from "./CoverUploader";
import FaqRows, { emptyFaq } from "./FaqRows";
import GalleryUploader from "./GalleryUploader";
import HarvestPicker from "./HarvestPicker";
import PackagingEditor, { QuantityField } from "./PackagingEditor";
import ProductPreview from "./ProductPreview";
import SpecsEditor from "./SpecsEditor";
import { checkFile, IMAGE_MIME, publicIdOf, uploadImage } from "./upload";

const sections = [
  { id: "basics", label: "Basics" },
  { id: "description", label: "Description" },
  { id: "supply", label: "Harvest & forms" },
  { id: "specs", label: "Specifications" },
  { id: "ordering", label: "Ordering" },
  { id: "faqs", label: "FAQs" },
  { id: "photos", label: "Photos" },
];

// Which section each error lives in, for the error count on the section nav.
const sectionOf: Record<ProductErrorKey, string> = {
  name: "basics", slug: "basics", localName: "basics", category: "basics", kind: "basics",
  summary: "description", description: "description",
  harvest: "supply", forms: "supply",
  specs: "specs",
  faqs: "faqs",
  moq: "ordering", packaging: "ordering", leadTime: "ordering", samples: "ordering", paymentTerms: "ordering", deliveryRegions: "ordering", orderNotes: "ordering",
  coverImage: "photos", coverAlt: "photos", gallery: "photos",
};

const REGION_SUGGESTIONS = ["Pan-India", "Jammu & Kashmir", "Delhi NCR", "Mumbai", "Export"];

function toDraft(p: AdminProduct | null): ProductDraft {
  if (!p) return emptyDraft();
  const o = p.ordering;
  return {
    name: p.name,
    slug: p.slug,
    localName: p.localName ?? "",
    category: p.category,
    kind: p.kind,
    summary: p.summary,
    description: toHtml(p.description), // older plain-text descriptions become paragraphs
    harvest: p.harvest,
    forms: p.forms,
    specs: p.specs,
    faqs: p.faqs.length ? p.faqs : [emptyFaq()],
    coverImage: p.coverImage ? { url: p.coverImage.url, publicId: p.coverImage.publicId, alt: p.coverImage.alt } : null,
    gallery: p.gallery,
    published: p.published,
    ordering: {
      moqValue: o.moq ? String(o.moq.value) : "",
      moqUnit: o.moq?.unit ?? "kg",
      availability: o.availability,
      packaging: o.packaging.map((k) => ({ label: k.label, value: String(k.size.value), unit: k.size.unit })),
      leadMin: o.leadTimeDays ? String(o.leadTimeDays.min) : "",
      leadMax: o.leadTimeDays ? String(o.leadTimeDays.max) : "",
      samplesAvailable: o.samples?.available ?? false,
      samplesNote: o.samples?.note ?? "",
      paymentTerms: o.paymentTerms ?? "",
      deliveryRegions: o.deliveryRegions,
      notes: o.notes ?? "",
    },
  };
}

export default function ProductForm({ product, suggestions }: { product: AdminProduct | null; suggestions: { kinds: string[]; forms: string[] } }) {
  const router = useRouter();
  const toast = useToast();
  const [initial] = useState(() => toDraft(product));
  const [form, setForm] = useState(initial);
  // New products take their slug from the name until it's edited by hand.
  const [slugEdited, setSlugEdited] = useState(!!product);
  const [errors, setErrors] = useState<ProductErrors>({});
  const [banner, setBanner] = useState<string | null>(null);
  const [saving, startSaving] = useTransition();
  const [deleting, setDeleting] = useState(false);

  const dirty = JSON.stringify(form) !== JSON.stringify(initial);

  // Photos uploaded in this session that aren't saved to the product yet.
  // Any that drop out of the form (replaced or removed) are deleted from
  // Cloudinary right away; the rest go on Cancel or when leaving unsaved.
  const unsaved = useRef(new Set<string>());
  const onUploaded = (publicId: string) => unsaved.current.add(publicId);

  useEffect(() => {
    const inForm = new Set([
      form.coverImage?.publicId,
      ...form.gallery.map(publicIdOf),
      ...imageSources(form.description).map(publicIdOf),
    ]);
    const dropped = [...unsaved.current].filter((id) => !inForm.has(id));
    if (!dropped.length) return;
    dropped.forEach((id) => unsaved.current.delete(id));
    void discardUploads(dropped);
  }, [form.coverImage, form.gallery, form.description]);

  useEffect(() => {
    const pending = unsaved.current;
    return () => {
      if (pending.size) void discardUploads([...pending]);
    };
  }, []);

  // Warn before closing the tab with unsaved changes.
  useEffect(() => {
    if (!dirty) return;
    const onLeave = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", onLeave);
    return () => window.removeEventListener("beforeunload", onLeave);
  }, [dirty]);

  // Images inside the description: same WebP / 2 MB rules and signed Cloudinary
  // upload as product photos, kept in their own folder. Tracked like other
  // unsaved uploads, so ones removed before saving are deleted.
  async function uploadDescriptionImage(file: File) {
    const problem = checkFile(file);
    if (problem) throw new Error(problem);
    const res = await uploadImage(file, () => {}, "content");
    onUploaded(res.publicId);
    return res.url;
  }

  function clear(...keys: ProductErrorKey[]) {
    setErrors((e) => {
      const next = { ...e };
      for (const k of keys) delete next[k];
      return next;
    });
    setBanner(null);
  }

  function set<K extends keyof ProductDraft>(key: K, value: ProductDraft[K], ...errorKeys: ProductErrorKey[]) {
    setForm((f) => {
      const next = { ...f, [key]: value };
      if (key === "name" && !slugEdited) next.slug = slugify(value as string);
      return next;
    });
    clear(...errorKeys, ...(key === "name" && !slugEdited ? (["slug"] as const) : []));
  }

  function setOrdering<K extends keyof ProductDraft["ordering"]>(key: K, value: ProductDraft["ordering"][K], errorKey: ProductErrorKey) {
    setForm((f) => ({ ...f, ordering: { ...f.ordering, [key]: value } }));
    clear(errorKey);
  }

  function showErrors(errs: ProductErrors, message?: string) {
    setErrors(errs);
    setBanner(message ?? null);
    const first = Object.keys(errs)[0];
    if (first) document.getElementById(`field-${first}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function submit() {
    const check = parseProductInput(form);
    if (check.errors) return showErrors(check.errors, "Check the highlighted fields.");
    setBanner(null);
    startSaving(async () => {
      const res = await saveProduct(product?.id ?? null, form);
      if (!res.ok) return showErrors(res.errors, res.message);
      unsaved.current.clear(); // saved: they belong to the product now
      toast(product ? `${form.name} saved` : `${form.name} added to the catalogue`);
      router.push("/admin/products");
      router.refresh();
    });
  }

  const errorCount = (section: string) => Object.keys(errors).filter((k) => sectionOf[k as ProductErrorKey] === section).length;
  const o = form.ordering;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      noValidate
    >
      <Link href="/admin/products" className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground transition hover:text-foreground">
        <ArrowLeftIcon size={16} />
        All products
      </Link>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <h1 className="font-display text-[30px] leading-tight font-medium tracking-tight md:text-[40px]">
          {product ? product.name : form.name.trim() || "New product"}
        </h1>
        {product && (
          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${product.published ? "bg-primary/10 text-primary" : "bg-surface-muted text-muted-foreground"}`}>
            {product.published ? "Live" : "Hidden"}
          </span>
        )}
      </div>

      {/* section nav */}
      <nav aria-label="Form sections" className="sticky top-14 z-20 -mx-4 mt-4 border-b bg-surface-muted/90 px-4 py-2 backdrop-blur-md md:-mx-6 md:px-6 lg:top-[72px] xl:-mx-10 xl:px-10">
        <ul className="rail gap-1.5">
          {sections.map((s) => {
            const count = errorCount(s.id);
            return (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className={`flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3 text-sm font-semibold whitespace-nowrap transition ${
                    count ? "bg-red-50 text-red-800" : "text-muted-foreground hover:bg-surface hover:text-foreground"
                  }`}
                >
                  {s.label}
                  {count > 0 && <span className="grid size-5 place-items-center rounded-full bg-red-700 text-[11px] font-bold text-white">{count}</span>}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>

      <AnimatePresence>
        {banner && (
          <motion.p
            role="alert"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 flex items-center gap-2 overflow-hidden rounded-control border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-semibold text-red-800"
          >
            <WarningCircleIcon size={18} weight="fill" className="shrink-0" />
            {banner}
          </motion.p>
        )}
      </AnimatePresence>

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="flex min-w-0 flex-col gap-5">
          {/* ---------- basics ---------- */}
          <Panel id="basics" title="Basics">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="name" label="Product name" error={errors.name}>
                <input id="in-name" value={form.name} onChange={(e) => set("name", e.target.value, "name")} maxLength={limits.name} placeholder="e.g. Walnut kernels" aria-invalid={!!errors.name} className={field} />
              </Field>
              <Field id="localName" label="Kashmiri name" optional error={errors.localName}>
                <input id="in-localName" value={form.localName} onChange={(e) => set("localName", e.target.value, "localName")} maxLength={limits.localName} placeholder="e.g. Doon" aria-invalid={!!errors.localName} className={field} />
              </Field>
            </div>
            <Field id="slug" label="Product ID" hint="Used in links and enquiries. Lowercase letters, numbers and dashes." error={errors.slug}>
              <input
                id="in-slug"
                value={form.slug}
                onChange={(e) => {
                  setSlugEdited(true);
                  set("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"), "slug");
                }}
                onBlur={() => setForm((f) => ({ ...f, slug: slugify(f.slug) || slugify(f.name) }))}
                maxLength={limits.slug}
                aria-invalid={!!errors.slug}
                className={`${field} font-mono text-sm`}
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="category" label="Product line" error={errors.category}>
                <div role="radiogroup" aria-label="Product line" className="grid grid-cols-2 gap-2">
                  {productCategories.map((c) => {
                    const on = form.category === c;
                    return (
                      <button
                        key={c}
                        type="button"
                        role="radio"
                        aria-checked={on}
                        onClick={() => set("category", c, "category")}
                        className={`flex h-12 items-center justify-center gap-2 rounded-control border text-[15px] font-semibold transition-colors ${
                          on ? "border-primary bg-primary/8 text-primary" : "bg-surface hover:border-foreground/30"
                        }`}
                      >
                        {on && <CheckIcon size={16} weight="bold" />}
                        {c}
                      </button>
                    );
                  })}
                </div>
              </Field>
              <Field id="kind" label="Type" hint="Shown on the product card." error={errors.kind}>
                <input id="in-kind" value={form.kind} onChange={(e) => set("kind", e.target.value, "kind")} list="kind-options" maxLength={limits.kind} placeholder="e.g. Tree nut" aria-invalid={!!errors.kind} className={field} />
                <datalist id="kind-options">
                  {suggestions.kinds.map((k) => (
                    <option key={k} value={k} />
                  ))}
                </datalist>
              </Field>
            </div>
          </Panel>

          {/* ---------- description ---------- */}
          <Panel id="description" title="Description">
            <Field id="summary" label="One-line summary" hint="Shown on product cards." error={errors.summary} aside={<Counter value={form.summary} max={limits.summary} />}>
              <textarea id="in-summary" value={form.summary} onChange={(e) => set("summary", e.target.value, "summary")} rows={2} placeholder="What a buyer should know at a glance." aria-invalid={!!errors.summary} className={`${field} h-auto resize-y py-3 leading-relaxed`} />
            </Field>
            <Field
              id="description"
              label="Full description"
              optional
              hint="Shown on the product page: origin, quality, how it's processed, common uses. Headings, lists, tables, links and images are kept."
              error={errors.description}
              aside={<Counter value={htmlToText(form.description)} max={limits.description} />}
            >
              <RichTextEditor
                value={form.description}
                onChange={(html) => set("description", html, "description")}
                minHeight="300px"
                maxHeight="500px"
                onImageUpload={uploadDescriptionImage}
                imageAccept={`${IMAGE_MIME},.webp`}
                imageHint={`WebP only, up to ${MAX_IMAGE_MB} MB.`}
              />
            </Field>
          </Panel>

          {/* ---------- harvest & forms ---------- */}
          <Panel id="supply" title="Harvest & forms">
            <Field id="harvest" label="Harvest months" hint="Drives the “Harvesting now” badges and the season calendar." error={errors.harvest}>
              <HarvestPicker value={form.harvest} onChange={(v) => set("harvest", v, "harvest")} />
            </Field>
            <Field id="forms" label="Forms supplied" hint={`Up to ${limits.forms}. Offered in the enquiry form.`} error={errors.forms}>
              <ChipsInput
                id="in-forms"
                value={form.forms}
                onChange={(v) => set("forms", v, "forms")}
                suggestions={suggestions.forms}
                max={limits.forms}
                maxLength={limits.form}
                placeholder="e.g. Kernels, then press Enter"
                addLabel="Add a form"
                invalid={!!errors.forms}
              />
            </Field>
          </Panel>

          {/* ---------- specs ---------- */}
          <Panel id="specs" title="Specifications" note="Quality details shown as a table: grade, size, moisture, shelf life…">
            <div id="field-specs">
              <SpecsEditor value={form.specs} onChange={(v) => set("specs", v, "specs")} invalid={!!errors.specs} />
              {errors.specs && <p className={`${errorText} mt-2`}>{errors.specs}</p>}
            </div>
          </Panel>

          {/* ---------- ordering ---------- */}
          <Panel id="ordering" title="Ordering" note="Anything left blank shows as “On request” to buyers.">
            <Field id="availability" label="Availability">
              <div role="radiogroup" aria-label="Availability" className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {availabilityOptions.map((a) => {
                  const on = o.availability === a;
                  return (
                    <button
                      key={a}
                      type="button"
                      role="radio"
                      aria-checked={on}
                      onClick={() => setOrdering("availability", a, "orderNotes")}
                      className={`flex min-h-11 items-center justify-center gap-1.5 rounded-control border px-2 text-center text-sm font-semibold transition-colors ${
                        on ? "border-primary bg-primary/8 text-primary" : "bg-surface hover:border-foreground/30"
                      }`}
                    >
                      {on && <CheckIcon size={14} weight="bold" className="shrink-0" />}
                      {availabilityLabels[a]}
                    </button>
                  );
                })}
              </div>
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="moq" label="Minimum order (MOQ)" hint="The smallest quantity you'll take an order for." error={errors.moq}>
                <QuantityField
                  id="in-moq"
                  value={o.moqValue}
                  unit={o.moqUnit}
                  onValue={(v) => setOrdering("moqValue", v, "moq")}
                  onUnit={(u) => setOrdering("moqUnit", u, "moq")}
                  label="Minimum order quantity"
                  placeholder="100"
                  invalid={!!errors.moq}
                />
              </Field>
              <Field id="leadTime" label="Lead time" hint="Days from order confirmation to dispatch." error={errors.leadTime}>
                <div className="flex items-center gap-2">
                  <DaysInput id="in-leadTime" value={o.leadMin} onChange={(v) => setOrdering("leadMin", v, "leadTime")} label="Minimum days" placeholder="3" invalid={!!errors.leadTime} />
                  <span className="text-muted-foreground">to</span>
                  <DaysInput value={o.leadMax} onChange={(v) => setOrdering("leadMax", v, "leadTime")} label="Maximum days" placeholder="7" invalid={!!errors.leadTime} />
                  <span className="text-sm text-muted-foreground">days</span>
                </div>
              </Field>
            </div>

            <Field id="packaging" label="Packing options" optional hint="What the order arrives in, and how much each holds." error={errors.packaging}>
              <PackagingEditor value={o.packaging} onChange={(v) => setOrdering("packaging", v, "packaging")} invalid={!!errors.packaging} />
            </Field>

            <Field id="samples" label="Samples" error={errors.samples}>
              <div className="rounded-control border bg-surface p-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold">Buyers can request a sample</span>
                  <Switch checked={o.samplesAvailable} onChange={(v) => setOrdering("samplesAvailable", v, "samples")} label="Samples available" />
                </div>
                <AnimatePresence initial={false}>
                  {o.samplesAvailable && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <input
                        value={o.samplesNote}
                        onChange={(e) => setOrdering("samplesNote", e.target.value, "samples")}
                        maxLength={limits.shortText}
                        placeholder="e.g. 250 g sample, courier charges extra"
                        aria-label="Sample terms"
                        className={`${field} mt-3 h-11 w-full`}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Field>

            <Field id="paymentTerms" label="Payment terms" optional error={errors.paymentTerms}>
              <input id="in-paymentTerms" value={o.paymentTerms} onChange={(e) => setOrdering("paymentTerms", e.target.value, "paymentTerms")} maxLength={limits.shortText} placeholder="e.g. 50% advance, balance before dispatch" aria-invalid={!!errors.paymentTerms} className={field} />
            </Field>

            <Field id="deliveryRegions" label="Delivers to" optional error={errors.deliveryRegions}>
              <ChipsInput
                id="in-deliveryRegions"
                value={o.deliveryRegions}
                onChange={(v) => setOrdering("deliveryRegions", v, "deliveryRegions")}
                suggestions={REGION_SUGGESTIONS}
                max={limits.regions}
                maxLength={limits.region}
                placeholder="e.g. Pan-India, then press Enter"
                addLabel="Add a delivery region"
                invalid={!!errors.deliveryRegions}
              />
            </Field>

            <Field id="orderNotes" label="Other ordering notes" optional hint="Grading and inspection, documents supplied, custom packing, anything else buyers ask." error={errors.orderNotes} aside={<Counter value={o.notes} max={limits.orderNotes} />}>
              <textarea id="in-orderNotes" value={o.notes} onChange={(e) => setOrdering("notes", e.target.value, "orderNotes")} rows={4} aria-invalid={!!errors.orderNotes} className={`${field} h-auto resize-y py-3 leading-relaxed`} />
            </Field>
          </Panel>

          {/* ---------- gallery ---------- */}
          <Panel id="faqs" title="FAQs" note="Shown on this product's page and given to search engines. Leave blank to hide the section.">
            <div id="field-faqs" className="flex scroll-mt-40 flex-col gap-1.5 lg:scroll-mt-48">
              <FaqRows rows={form.faqs} onChange={(rows) => set("faqs", rows, "faqs")} />
              {errors.faqs && <p className={errorText}>{errors.faqs}</p>}
            </div>
          </Panel>

          <Panel id="photos" title="Gallery" note="Extra photos shown after the cover in the product's spec sheet.">
            <div id="field-gallery">
              <GalleryUploader value={form.gallery} onChange={(update) => {
                setForm((f) => ({ ...f, gallery: update(f.gallery) }));
                clear("gallery");
              }} onUploaded={onUploaded} error={errors.gallery} />
            </div>
          </Panel>

          {product && (
            <Panel id="delete" title="Delete product">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="max-w-md text-sm text-muted-foreground">Removes it from the website and deletes its photos. To take it down for a while, hide it instead.</p>
                <button type="button" onClick={() => setDeleting(true)} className={`${button("outline", "md")} border-red-200 text-red-700 hover:border-red-400 hover:bg-red-50`}>
                  <TrashIcon size={18} />
                  Delete
                </button>
              </div>
            </Panel>
          )}
        </div>

        {/* ---------- cover, visibility, preview ---------- */}
        <div className="flex flex-col gap-5 lg:sticky lg:top-[136px]">
          <Panel title="Cover photo" note="Used on cards across the site. You can add it later; until then the website shows a “photo coming soon” image.">
            <div id="field-coverImage">
              <CoverUploader value={form.coverImage} onChange={(img) => set("coverImage", img, "coverImage")} onUploaded={onUploaded} error={errors.coverImage} />
            </div>
            {form.coverImage && (
              <Field id="coverAlt" label="Photo description" hint="Read aloud by screen readers and used by search engines." error={errors.coverAlt}>
                <input
                  id="in-coverAlt"
                  value={form.coverImage.alt}
                  onChange={(e) => set("coverImage", { ...form.coverImage!, alt: e.target.value }, "coverAlt")}
                  maxLength={limits.alt}
                  placeholder="e.g. Walnut kernels piled together"
                  aria-invalid={!!errors.coverAlt}
                  className={field}
                />
              </Field>
            )}
          </Panel>

          <div className={`${card} flex items-center justify-between gap-4 p-4`}>
            <div>
              <p className="font-semibold">Show on website</p>
              <p className="text-sm text-muted-foreground">{form.published ? "Visible in the catalogue" : "Saved, but hidden"}</p>
            </div>
            <Switch checked={form.published} onChange={(v) => set("published", v)} label="Show on website" />
          </div>

          <ProductPreview form={form} />
        </div>
      </div>

      {/* ---------- save bar ---------- */}
      <div className="sticky bottom-0 z-30 -mx-4 mt-6 border-t bg-background/92 px-4 backdrop-blur-md md:-mx-6 md:px-6 xl:-mx-10 xl:px-10" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        <div className="flex h-16 items-center gap-3">
          <AnimatePresence mode="wait" initial={false}>
            <motion.p key={dirty ? "dirty" : "clean"} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="hidden items-center gap-2 text-sm text-muted-foreground sm:flex">
              {dirty ? (
                <>
                  <span className="size-2 rounded-full bg-accent" />
                  Unsaved changes
                </>
              ) : (
                "No changes yet"
              )}
            </motion.p>
          </AnimatePresence>
          <div className="ml-auto flex w-full gap-2 sm:w-auto">
            <Link href="/admin/products" className={`${button("outline", "md")} flex-1 sm:flex-none`}>
              Cancel
            </Link>
            <button type="submit" disabled={saving || (!dirty && !!product)} className={`${button("primary", "md")} flex-2 disabled:opacity-60 sm:flex-none`}>
              {saving && <SpinnerGapIcon size={18} className="animate-spin" />}
              {saving ? "Saving…" : product ? "Save changes" : "Add product"}
            </button>
          </div>
        </div>
      </div>

      {product && (
        <DeleteDialog
          product={deleting ? product : null}
          onClose={() => setDeleting(false)}
          onConfirm={async (p) => {
            const res = await removeProduct(p.id);
            if (!res.ok) return toast(res.message);
            toast(`${p.name} deleted`);
            router.push("/admin/products");
            router.refresh();
          }}
        />
      )}
    </form>
  );
}

function Panel({ id, title, note, children }: { id?: string; title: string; note?: string; children: ReactNode }) {
  return (
    <section id={id} className={`${card} scroll-mt-32 p-4 md:p-5 lg:scroll-mt-36`}>
      <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{title}</h2>
      {note && <p className="mt-1 text-sm text-muted-foreground">{note}</p>}
      <div className="mt-4 flex flex-col gap-4">{children}</div>
    </section>
  );
}

function Field({
  id,
  label: text,
  hint: help,
  optional,
  error,
  aside,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  optional?: boolean;
  error?: string;
  aside?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div id={`field-${id}`} className="flex scroll-mt-40 flex-col gap-1.5 lg:scroll-mt-48">
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={`in-${id}`} className={label}>
          {text}
          {optional && <span className="ml-1.5 font-normal text-muted-foreground">optional</span>}
        </label>
        {aside}
      </div>
      {children}
      {error ? <p className={errorText}>{error}</p> : help ? <p className={hint}>{help}</p> : null}
    </div>
  );
}

function Counter({ value, max }: { value: string; max: number }) {
  return <span className={`text-xs tabular ${value.length > max ? "text-red-700" : "text-muted-foreground"}`}>{value.length}/{max}</span>;
}

function DaysInput({ id, value, onChange, label: aria, placeholder, invalid }: { id?: string; value: string; onChange: (v: string) => void; label: string; placeholder: string; invalid?: boolean }) {
  return (
    <input
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 3))}
      inputMode="numeric"
      placeholder={placeholder}
      aria-label={aria}
      aria-invalid={invalid}
      className={`${field} h-11 w-20 text-center tabular`}
    />
  );
}
