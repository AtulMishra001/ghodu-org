"use client";

import Link from "next/link";
import { useMemo, useRef, useState, useTransition } from "react";
import { AnimatePresence, motion, Reorder, useDragControls } from "motion/react";
import { ArrowsDownUpIcon, CheckIcon, DotsSixVerticalIcon, MagnifyingGlassIcon, PlusIcon, XIcon } from "@phosphor-icons/react";
import CoverThumb from "../CoverThumb";
import { useToast } from "@/components/shared/Toast";
import { removeProduct, saveOrder, setPublished } from "@/app/admin/actions";
import { productCategories, type ProductCategory } from "@/data/categories";
import type { AdminProduct } from "@/lib/server/products";
import { button } from "@/lib/ui";
import DeleteDialog from "../DeleteDialog";
import { card } from "../styles";
import ProductCard from "./ProductCard";
import Segmented from "./Segmented";

type Status = "all" | "live" | "hidden";

export default function ProductGrid({ products }: { products: AdminProduct[] }) {
  const toast = useToast();
  // Local copy for optimistic updates; re-synced whenever the server sends a fresh list.
  const [items, setItems] = useState(products);
  const [synced, setSynced] = useState(products);
  if (products !== synced) {
    setSynced(products);
    setItems(products);
  }

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<Status>("all");
  const [line, setLine] = useState<"All" | ProductCategory>("All");
  const [arranging, setArranging] = useState(false);
  const [deleting, setDeleting] = useState<AdminProduct | null>(null);
  const [, startTransition] = useTransition();
  const savedOrder = useRef(products.map((p) => p.id).join());

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter(
      (p) =>
        (status === "all" || (status === "live") === p.published) &&
        (line === "All" || p.category === line) &&
        (!q || [p.name, p.localName, p.kind, p.slug, ...p.forms].join(" ").toLowerCase().includes(q)),
    );
  }, [items, query, status, line]);

  const live = items.filter((p) => p.published).length;

  function togglePublished(p: AdminProduct) {
    const next = !p.published;
    setItems((list) => list.map((x) => (x.id === p.id ? { ...x, published: next } : x)));
    startTransition(async () => {
      const res = await setPublished(p.id, next);
      if (res.ok) toast(next ? `${p.name} is live on the website` : `${p.name} is hidden from the website`);
      else {
        setItems((list) => list.map((x) => (x.id === p.id ? { ...x, published: p.published } : x)));
        toast(res.message);
      }
    });
  }

  function persistOrder() {
    const ids = items.map((p) => p.id);
    if (ids.join() === savedOrder.current) return;
    const before = savedOrder.current;
    savedOrder.current = ids.join();
    startTransition(async () => {
      const res = await saveOrder(ids);
      if (res.ok) toast("New order saved");
      else {
        savedOrder.current = before;
        toast(res.message);
      }
    });
  }

  async function confirmDelete(p: AdminProduct) {
    const res = await removeProduct(p.id);
    if (!res.ok) return toast(res.message);
    const rest = items.filter((x) => x.id !== p.id);
    setItems(rest);
    savedOrder.current = rest.map((x) => x.id).join();
    setDeleting(null);
    toast(`${p.name} deleted`);
  }

  function startArranging() {
    setQuery("");
    setStatus("all");
    setLine("All");
    setArranging(true);
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-[32px] leading-tight font-medium tracking-tight md:text-[40px]">Products</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            <span className="font-semibold text-foreground tabular">{items.length}</span> in the catalogue ·{" "}
            <span className="font-semibold text-primary tabular">{live}</span> live on the website
          </p>
        </div>
        <div className="flex gap-2">
          {arranging ? (
            <button type="button" onClick={() => setArranging(false)} className={button("primary", "md")}>
              <CheckIcon size={18} weight="bold" />
              Done
            </button>
          ) : (
            <>
              <button type="button" onClick={startArranging} className={button("outline", "md")}>
                <ArrowsDownUpIcon size={18} />
                <span className="hidden sm:inline">Arrange</span>
              </button>
              <Link href="/admin/products/new" className={button("primary", "md")}>
                <PlusIcon size={18} weight="bold" />
                New product
              </Link>
            </>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {arranging ? (
          <motion.div key="arrange" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
            <p className="mt-5 mb-3 text-sm text-muted-foreground">
              Drag products into the order they should appear on the website. Changes save as you drop.
            </p>
            <Reorder.Group
              axis="y"
              values={items.map((p) => p.id)}
              onReorder={(ids: string[]) => setItems(ids.map((id) => items.find((p) => p.id === id)!))}
              className={`${card} max-w-3xl divide-y overflow-hidden`}
            >
              {items.map((p, i) => (
                <ArrangeRow key={p.id} product={p} index={i} onDrop={persistOrder} />
              ))}
            </Reorder.Group>
          </motion.div>
        ) : (
          <motion.div key="grid" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
            {/* toolbar */}
            <div className="mt-5 flex flex-col gap-2.5 md:flex-row md:items-center">
              <label className="relative flex h-11 flex-1 items-center rounded-control border bg-surface transition-colors focus-within:border-primary md:max-w-sm">
                <span className="sr-only">Search products</span>
                <MagnifyingGlassIcon size={18} className="ml-3 shrink-0 text-muted-foreground" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search name, type, form…"
                  className="h-full min-w-0 flex-1 bg-transparent px-2.5 text-[15px] outline-none [&::-webkit-search-cancel-button]:appearance-none"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    aria-label="Clear search"
                    className="mr-1.5 grid size-8 place-items-center rounded-full text-muted-foreground hover:bg-surface-muted"
                  >
                    <XIcon size={16} />
                  </button>
                )}
              </label>
              <div className="flex gap-2 overflow-x-auto md:ml-auto">
                <Segmented
                  id="status"
                  value={status}
                  onChange={setStatus}
                  options={[
                    { value: "all", label: "All" },
                    { value: "live", label: "Live" },
                    { value: "hidden", label: "Hidden" },
                  ]}
                />
                <Segmented
                  id="line"
                  value={line}
                  onChange={setLine}
                  options={[{ value: "All", label: "All lines" }, ...productCategories.map((c) => ({ value: c, label: c }))]}
                />
              </div>
            </div>

            {shown.length === 0 && items.length > 0 ? (
              <div className={`${card} mt-5 px-6 py-12 text-center`}>
                <p className="font-display text-xl font-medium">No products match</p>
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setStatus("all");
                    setLine("All");
                  }}
                  className="mt-2 text-sm font-semibold text-primary hover:underline"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <motion.ul layout className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
                <AnimatePresence mode="popLayout" initial={false}>
                  {shown.map((p, i) => (
                    <ProductCard key={p.id} product={p} index={i} onToggle={() => togglePublished(p)} onDelete={() => setDeleting(p)} />
                  ))}
                </AnimatePresence>
                <motion.li layout key="add">
                  <Link
                    href="/admin/products/new"
                    className="flex h-full min-h-56 flex-col items-center justify-center gap-3 rounded-card border-2 border-dashed text-muted-foreground transition hover:border-primary/50 hover:bg-surface hover:text-primary"
                  >
                    <span className="grid size-12 place-items-center rounded-full bg-surface shadow-card">
                      <PlusIcon size={22} weight="bold" />
                    </span>
                    <span className="font-semibold">Add a product</span>
                  </Link>
                </motion.li>
              </motion.ul>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <DeleteDialog product={deleting} onClose={() => setDeleting(null)} onConfirm={confirmDelete} />
    </div>
  );
}

function ArrangeRow({ product: p, index, onDrop }: { product: AdminProduct; index: number; onDrop: () => void }) {
  const controls = useDragControls();
  return (
    <Reorder.Item
      value={p.id}
      dragListener={false}
      dragControls={controls}
      onDragEnd={onDrop}
      whileDrag={{ scale: 1.01, boxShadow: "var(--shadow-float)", zIndex: 10 }}
      className="relative flex items-center gap-3 bg-surface px-2 py-2.5 md:px-3"
    >
      <button
        type="button"
        aria-label={`Drag to reorder ${p.name}`}
        onPointerDown={(e) => controls.start(e)}
        className="grid size-10 shrink-0 cursor-grab touch-none place-items-center rounded-control text-muted-foreground transition hover:bg-surface-muted hover:text-foreground active:cursor-grabbing"
      >
        <DotsSixVerticalIcon size={20} weight="bold" />
      </button>
      <span className="w-6 text-sm font-semibold text-muted-foreground tabular">{index + 1}</span>
      <CoverThumb product={p} className="size-12 rounded-tile" sizes="48px" />
      <span className="min-w-0 flex-1">
        <span className="block truncate font-semibold">{p.name}</span>
        <span className="block truncate text-xs text-muted-foreground">
          {p.category} · {p.kind}
        </span>
      </span>
      <span className={`text-xs font-semibold ${p.published ? "text-primary" : "text-muted-foreground"}`}>{p.published ? "Live" : "Hidden"}</span>
    </Reorder.Item>
  );
}
