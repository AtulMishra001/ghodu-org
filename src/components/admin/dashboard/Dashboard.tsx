"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { motion } from "motion/react";
import { ArrowRightIcon, ArticleIcon, ChatsCircleIcon, LeafIcon, PackageIcon, PencilSimpleLineIcon, PlantIcon, PlusIcon, TreeIcon, WarningCircleIcon, type Icon } from "@phosphor-icons/react";
import CoverThumb from "../CoverThumb";
import { monthNames } from "@/data/site";
import type { AdminProduct } from "@/lib/server/products";
import { button } from "@/lib/ui";
import { useMonth } from "@/lib/use-month";
import { gaps } from "./health";

const ease = [0.22, 1, 0.36, 1] as const;
const tile = "rounded-card border bg-surface shadow-card";

type Stat = { label: string; value: number | string; note: string; icon: Icon; href?: string };

// Overview of everything managed in the admin: one stat card per area,
// then one card per module with its main actions.
export default function Dashboard({ products, blogs, enquiries }: { products: AdminProduct[]; blogs: { total: number; published: number; drafts: number }; enquiries: number }) {
  const month = useMonth();
  const split = (list: AdminProduct[]) => {
    const live = list.filter((p) => p.published).length;
    return `${live} live · ${list.length - live} hidden`;
  };
  const dry = products.filter((p) => p.category === "Dry fruits");
  const crops = products.filter((p) => p.category === "Crops");
  const inSeason = month === null ? [] : products.filter((p) => p.published && p.harvest.includes(month));
  const attention = products
    .map((p) => ({ product: p, missing: gaps(p) }))
    .filter((x) => x.missing.length > 0)
    .sort((a, b) => b.missing.length - a.missing.length);

  const stats: Stat[] = [
    { label: "Products", value: products.length, note: split(products), icon: PackageIcon, href: "/admin/products" },
    { label: "Dry fruits", value: dry.length, note: split(dry), icon: TreeIcon, href: "/admin/products" },
    { label: "Crops", value: crops.length, note: split(crops), icon: LeafIcon, href: "/admin/products" },
    {
      label: "In season",
      value: month === null ? "–" : inSeason.length,
      note: month === null ? "Harvesting this month" : `Harvesting in ${monthNames[month]}`,
      icon: PlantIcon,
    },
    { label: "Blogs", value: blogs.total, note: `${blogs.published} published · ${blogs.drafts} ${blogs.drafts === 1 ? "draft" : "drafts"}`, icon: ArticleIcon, href: "/admin/blogs" },
    { label: "Enquiries", value: enquiries, note: "From all website forms", icon: ChatsCircleIcon, href: "/admin/enquiries" },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-primary">Dashboard</p>
          <h1 className="mt-1 font-display text-[32px] leading-tight font-medium tracking-tight md:text-[40px]">Catalogue overview</h1>
          <p className="mt-1 max-w-2xl text-[15px] text-muted-foreground">
            A quick view of the products listed through the admin and what buyers see on the website.
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <Link href="/admin/products/new" className={button("outline", "md")}>
            <PlusIcon size={18} weight="bold" />
            Add product
          </Link>
          <Link href="/admin/blogs/create" className={button("primary", "md")}>
            <PencilSimpleLineIcon size={18} />
            Write Blog
          </Link>
        </div>
      </div>

      {/* ---------- stat cards ---------- */}
      <ul className="mt-6 grid grid-cols-2 gap-3 md:gap-5 lg:grid-cols-3 2xl:grid-cols-6">
        {stats.map((s, i) => (
          <motion.li key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: i * 0.05, ease }}>
            <StatCard stat={s} />
          </motion.li>
        ))}
      </ul>

      {/* ---------- modules ---------- */}
      <div className="mt-5 grid grid-cols-1 gap-5 md:mt-8 lg:grid-cols-3">
        <Module
          title="Product catalogue"
          body="Add, edit, publish and hide products, along with their photos, specifications and ordering details."
          actions={
            <>
              <Link href="/admin/products" className={button("outline", "md")}>
                View products
              </Link>
              <Link href="/admin/products/new" className={button("primary", "md")}>
                Add product
              </Link>
            </>
          }
        />
        <Module
          title="Blog CMS"
          body="Write, publish and update articles for buyers, with their images, FAQs and search details."
          actions={
            <>
              <Link href="/admin/blogs" className={button("outline", "md")}>
                View Blogs
              </Link>
              <Link href="/admin/blogs/create" className={button("primary", "md")}>
                Create Blog
              </Link>
            </>
          }
        />
        <Module
          title="Enquiries"
          body="Enquiries sent from every form on the website, protected by an access code that expires after an hour."
          actions={
            <Link href="/admin/enquiries" className={button("primary", "md")}>
              View enquiries
            </Link>
          }
        />

        {products.length > 0 && (
          <Module
            title="Needs attention"
            body={
              attention.length
                ? "Products with details buyers will see as “On request”. Fill them in to give buyers a complete picture."
                : "Every product has complete details."
            }
            className="lg:col-span-3"
          >
            {attention.length > 0 && (
              <ul className="mt-4 grid grid-cols-1 gap-2 md:grid-cols-2">
                {attention.slice(0, 6).map(({ product: p, missing }) => (
                  <li key={p.id} className="min-w-0">
                    <Link href={`/admin/products/${p.id}`} className="group flex items-center gap-3 rounded-control border p-2.5 transition hover:border-primary/40 hover:bg-surface-muted/50">
                      <CoverThumb product={p} className="size-11 rounded-tile" sizes="44px" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-semibold group-hover:text-primary">{p.name}</span>
                        <span className="block truncate text-xs text-muted-foreground">Missing: {missing.join(", ")}</span>
                      </span>
                      <ArrowRightIcon size={16} className="shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            {attention.length > 6 && (
              <p className="mt-3 flex items-center gap-1.5 text-sm text-muted-foreground">
                <WarningCircleIcon size={16} />
                {attention.length - 6} more products need details.
              </p>
            )}
          </Module>
        )}
      </div>
    </div>
  );
}

function StatCard({ stat: s }: { stat: Stat }) {
  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold">{s.label}</p>
          <p className="mt-3 text-[36px] leading-none font-bold tracking-tight tabular md:text-[44px]">{s.value}</p>
        </div>
        <span className="grid size-11 shrink-0 place-items-center rounded-tile bg-primary/8 text-primary md:size-12">
          <s.icon size={24} />
        </span>
      </div>
      <p className="mt-4 text-sm text-muted-foreground">{s.note}</p>
    </>
  );
  const cls = `${tile} block h-full p-4 md:p-6`;
  return s.href ? (
    <Link href={s.href} className={`${cls} transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-elevated`}>
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
  );
}

function Module({
  title,
  badge,
  body,
  actions,
  className = "",
  children,
}: {
  title: string;
  badge?: string;
  body: string;
  actions?: ReactNode;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <section className={`${tile} min-w-0 p-5 md:p-7 ${className}`}>
      <div className="flex items-center gap-2">
        <h2 className="text-xl font-bold tracking-tight">{title}</h2>
        {badge && <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-secondary-foreground">{badge}</span>}
      </div>
      <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-muted-foreground">{body}</p>
      {actions && <div className="mt-5 flex flex-wrap gap-2.5">{actions}</div>}
      {children}
    </section>
  );
}
