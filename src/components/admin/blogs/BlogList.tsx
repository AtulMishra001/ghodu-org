"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ImageIcon, MagnifyingGlassIcon, PencilSimpleIcon, PencilSimpleLineIcon, RowsIcon, SquaresFourIcon, TrashIcon } from "@phosphor-icons/react";
import { useToast } from "@/components/shared/Toast";
import { formatBlogDate, type BlogAdminListItem } from "@/lib/blog";
import { button } from "@/lib/ui";
import { card, field } from "../styles";
import { fetchAllBlogs, removeBlog } from "./api";
import BlogDeleteDialog from "./BlogDeleteDialog";

type StatusFilter = "all" | "published" | "draft";
type View = "cards" | "table";

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "published", label: "Published" },
  { value: "draft", label: "Drafts" },
];

// All posts are loaded (no 100-row limit), so search and filters see everything.
export default function BlogList() {
  const toast = useToast();
  const [blogs, setBlogs] = useState<BlogAdminListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [category, setCategory] = useState("all");
  const [view, setView] = useState<View>("cards");
  const [deleting, setDeleting] = useState<BlogAdminListItem | null>(null);

  // Runs again whenever this page becomes visible (the router keeps it mounted
  // while hidden), so an edit made seconds ago is always shown.
  useEffect(() => {
    let live = true;
    fetchAllBlogs()
      .then((rows) => live && setBlogs(rows))
      .catch((err: Error) => live && toast(err.message || "Couldn't load blogs.", "error"))
      .finally(() => live && setLoading(false));
    return () => {
      live = false;
    };
  }, [toast]);

  const categories = useMemo(() => [...new Set(blogs.map((b) => b.category).filter(Boolean))].sort((a, b) => a.localeCompare(b)), [blogs]);

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return blogs.filter(
      (b) =>
        (status === "all" || b.status === status) &&
        (category === "all" || b.category === category) &&
        (!term || b.title.toLowerCase().includes(term)),
    );
  }, [blogs, search, status, category]);

  async function confirmDelete() {
    if (!deleting) return;
    try {
      await removeBlog(deleting._id);
      setBlogs((rows) => rows.filter((b) => b._id !== deleting._id));
      toast("Blog deleted");
      setDeleting(null);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Couldn't delete the blog.", "error");
      setDeleting(null);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-primary">Blogs</p>
          <h1 className="mt-1 font-display text-[32px] leading-tight font-medium tracking-tight md:text-[40px]">Blog archive</h1>
          <p className="mt-1 max-w-2xl text-[15px] text-muted-foreground">Write, edit and publish the articles buyers read on the website.</p>
        </div>
        <Link href="/admin/blogs/create" className={button("primary", "md")}>
          <PencilSimpleLineIcon size={18} />
          Write Blog
        </Link>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2.5">
        <label className="relative min-w-60 flex-1">
          <span className="sr-only">Search by title</span>
          <MagnifyingGlassIcon size={18} className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted-foreground" />
          <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by title" className={`${field} w-full pl-10`} />
        </label>
        <label>
          <span className="sr-only">Filter by status</span>
          <select value={status} onChange={(e) => setStatus(e.target.value as StatusFilter)} className={field}>
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="sr-only">Filter by category</span>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className={field}>
            <option value="all">All categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <div role="group" aria-label="View" className="flex rounded-control border p-1">
          <ViewButton active={view === "cards"} onClick={() => setView("cards")} label="Cards" icon={<SquaresFourIcon size={18} />} />
          <ViewButton active={view === "table"} onClick={() => setView("table")} label="Table" icon={<RowsIcon size={18} />} />
        </div>
      </div>

      <div className="mt-5" aria-live="polite">
        {loading ? (
          <p className="py-10 text-center text-muted-foreground">Loading blogs...</p>
        ) : visible.length === 0 ? (
          <p className={`${card} py-10 text-center text-muted-foreground`}>No blogs found.</p>
        ) : view === "cards" ? (
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {visible.map((blog) => (
              <li key={blog._id} className={`${card} flex flex-col overflow-hidden`}>
                <div className="relative aspect-video bg-surface-muted">
                  {blog.image ? (
                    <Image src={blog.image} alt={blog.alt || ""} fill sizes="(min-width: 1536px) 25vw, (min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover" />
                  ) : (
                    <span className="absolute inset-0 grid place-items-center text-muted-foreground">
                      <ImageIcon size={32} aria-label="No image" />
                    </span>
                  )}
                  <span className="absolute top-2.5 left-2.5">
                    <StatusBadge status={blog.status} />
                  </span>
                </div>
                <div className="flex flex-1 flex-col gap-1 p-4">
                  <p className="text-xs text-muted-foreground">Updated {formatBlogDate(blog.updatedAt, "recently")}</p>
                  <h2 className="font-semibold leading-snug">{blog.title}</h2>
                  <p className="truncate text-sm text-muted-foreground">/{blog.slug}</p>
                  <div className="mt-auto flex gap-2 pt-3">
                    <Actions blog={blog} onDelete={() => setDeleting(blog)} />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className={`${card} overflow-x-auto`}>
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b bg-surface-muted/60 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                <tr>
                  <th scope="col" className="px-4 py-3">Article</th>
                  <th scope="col" className="px-4 py-3">Category</th>
                  <th scope="col" className="px-4 py-3">Status</th>
                  <th scope="col" className="px-4 py-3">Updated</th>
                  <th scope="col" className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((blog) => (
                  <tr key={blog._id} className="border-b last:border-0">
                    <td className="max-w-md px-4 py-3">
                      <p className="font-semibold">{blog.title}</p>
                      <p className="truncate text-muted-foreground">/{blog.slug}</p>
                    </td>
                    <td className="px-4 py-3">{blog.category || "–"}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={blog.status} />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">{formatBlogDate(blog.updatedAt, "–")}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Actions blog={blog} onDelete={() => setDeleting(blog)} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <BlogDeleteDialog title={deleting?.title ?? null} onClose={() => setDeleting(null)} onConfirm={confirmDelete} />
    </div>
  );
}

function ViewButton({ active, onClick, label, icon }: { active: boolean; onClick: () => void; label: string; icon: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`flex h-9.5 items-center gap-1.5 rounded-md px-3 text-sm font-semibold transition-colors ${active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
    >
      {icon}
      {label}
    </button>
  );
}

function StatusBadge({ status }: { status: BlogAdminListItem["status"] }) {
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-bold tracking-wide uppercase ${status === "published" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>
      {status === "published" ? "Published" : "Draft"}
    </span>
  );
}

function Actions({ blog, onDelete }: { blog: BlogAdminListItem; onDelete: () => void }) {
  return (
    <>
      <Link href={`/admin/blogs/edit/${blog._id}`} aria-label={`Edit ${blog.title}`} className={button("outline", "sm")}>
        <PencilSimpleIcon size={16} />
        Edit
      </Link>
      <button type="button" onClick={onDelete} aria-label={`Delete ${blog.title}`} className={`${button("outline", "sm")} text-red-700`}>
        <TrashIcon size={16} />
        Delete
      </button>
    </>
  );
}
