"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { ArrowSquareOutIcon, BuildingsIcon, CaretLeftIcon, CaretRightIcon, EnvelopeSimpleIcon, LockKeyIcon, MagnifyingGlassIcon, MapPinIcon, PhoneIcon } from "@phosphor-icons/react";
import { lockEnquiries } from "@/app/admin/(panel)/enquiries/actions";
import { ENQUIRY_FORMS, type EnquiryFormId } from "@/lib/enquiry";
import type { Enquiry, listEnquiries } from "@/lib/server/enquiries";
import { button } from "@/lib/ui";
import { card, field } from "../styles";

const dateTime = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit", timeZone: "Asia/Kolkata" });
const timeOnly = new Intl.DateTimeFormat("en-IN", { hour: "numeric", minute: "2-digit", timeZone: "Asia/Kolkata" });

type Props = Awaited<ReturnType<typeof listEnquiries>> & { form?: EnquiryFormId; search: string; page: number; expiresAt: number };

function hrefFor(next: { form?: string; q?: string; page?: number }) {
  const params = new URLSearchParams();
  if (next.form) params.set("form", next.form);
  if (next.q?.trim()) params.set("q", next.q.trim());
  if (next.page && next.page > 1) params.set("page", String(next.page));
  const query = params.toString();
  return query ? `/admin/enquiries?${query}` : "/admin/enquiries";
}

export default function EnquiryList({ enquiries, total, pages, counts, form, search, page, expiresAt }: Props) {
  const router = useRouter();
  const [term, setTerm] = useState(search);
  const [pending, startTransition] = useTransition();
  const debounce = useRef<ReturnType<typeof setTimeout>>(undefined);
  const allCount = Object.values(counts).reduce((sum, n) => sum + (n ?? 0), 0);

  // When the hour is up the list has to go, even if the page is just left open.
  // The router keeps hidden pages mounted, so this also runs on coming back.
  useEffect(() => {
    const refresh = () => startTransition(() => router.refresh());
    const remaining = expiresAt - Date.now();
    if (remaining <= 0) {
      refresh();
      return;
    }
    const timer = setTimeout(refresh, remaining + 500);
    return () => clearTimeout(timer);
  }, [expiresAt, router]);

  useEffect(() => () => clearTimeout(debounce.current), []);

  const go = (href: string) => startTransition(() => router.replace(href, { scroll: false }));

  function onSearch(value: string) {
    setTerm(value);
    clearTimeout(debounce.current);
    debounce.current = setTimeout(() => go(hrefFor({ form, q: value })), 300);
  }

  async function lock() {
    await lockEnquiries();
    startTransition(() => router.refresh());
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-primary">Enquiries</p>
          <h1 className="mt-1 font-display text-[32px] leading-tight font-medium tracking-tight md:text-[40px]">Website enquiries</h1>
          <p className="mt-1 max-w-2xl text-[15px] text-muted-foreground">Everything sent from the forms on the website, newest first.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-sm text-muted-foreground">Access ends at {timeOnly.format(expiresAt)}</p>
          <button type="button" onClick={lock} className={button("outline", "md")}>
            <LockKeyIcon size={18} />
            Lock now
          </button>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2.5">
        <label className="relative min-w-60 flex-1">
          <span className="sr-only">Search enquiries</span>
          <MagnifyingGlassIcon size={18} className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted-foreground" />
          <input type="search" value={term} onChange={(e) => onSearch(e.target.value)} placeholder="Search name, company, contact, product or message" className={`${field} w-full pl-10`} />
        </label>
        <label>
          <span className="sr-only">Filter by form</span>
          <select value={form ?? ""} onChange={(e) => go(hrefFor({ form: e.target.value, q: term }))} className={field}>
            <option value="">All forms ({allCount})</option>
            {(Object.keys(ENQUIRY_FORMS) as EnquiryFormId[]).map((id) => (
              <option key={id} value={id}>
                {ENQUIRY_FORMS[id]} ({counts[id] ?? 0})
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className={`mt-5 transition-opacity ${pending ? "opacity-60" : ""}`} aria-busy={pending}>
        {enquiries.length === 0 ? (
          <p className={`${card} py-10 text-center text-muted-foreground`}>{form || search ? "No enquiries match this search." : "No enquiries yet."}</p>
        ) : (
          <ul className="grid gap-4 xl:grid-cols-2">
            {enquiries.map((enquiry) => (
              <EnquiryCard key={enquiry._id} enquiry={enquiry} />
            ))}
          </ul>
        )}
      </div>

      {pages > 1 && (
        <nav aria-label="Enquiry pages" className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground tabular">
            Page {page} of {pages} · {total} enquiries
          </p>
          <div className="flex gap-1.5">
            {page > 1 && (
              <Link href={hrefFor({ form, q: search, page: page - 1 })} className={button("outline", "sm")}>
                <CaretLeftIcon size={14} weight="bold" />
                Newer
              </Link>
            )}
            {page < pages && (
              <Link href={hrefFor({ form, q: search, page: page + 1 })} className={button("outline", "sm")}>
                Older
                <CaretRightIcon size={14} weight="bold" />
              </Link>
            )}
          </div>
        </nav>
      )}
    </div>
  );
}

function ContactLink({ contact }: { contact: string }) {
  const email = contact.includes("@");
  const Icon = email ? EnvelopeSimpleIcon : PhoneIcon;
  return (
    <a href={email ? `mailto:${contact}` : `tel:${contact.replace(/[^\d+]/g, "")}`} className="inline-flex items-center gap-1.5 font-semibold text-primary hover:underline">
      <Icon size={16} />
      <span className="break-all">{contact}</span>
    </a>
  );
}

function EnquiryCard({ enquiry: e }: { enquiry: Enquiry }) {
  return (
    <li className={`${card} flex min-w-0 flex-col gap-2.5 p-4 md:p-5`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-bold tracking-wide text-secondary-foreground uppercase">{ENQUIRY_FORMS[e.form] ?? e.form}</span>
        <time dateTime={e.createdAt} className="text-xs text-muted-foreground tabular">
          {dateTime.format(new Date(e.createdAt))}
        </time>
      </div>
      <div>
        <h2 className="text-lg leading-snug font-bold tracking-tight">{e.name}</h2>
        {e.subject && <p className="text-sm text-muted-foreground">{e.subject}</p>}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
        {e.contact && <ContactLink contact={e.contact} />}
        {e.company && (
          <span className="inline-flex items-center gap-1.5">
            <BuildingsIcon size={16} className="text-muted-foreground" />
            {e.company}
          </span>
        )}
        {e.city && (
          <span className="inline-flex items-center gap-1.5">
            <MapPinIcon size={16} className="text-muted-foreground" />
            {e.city}
          </span>
        )}
      </div>
      {e.items.length > 0 && (
        <ul className="rounded-control bg-surface-muted/60 px-3 py-2 text-sm">
          {e.items.map((item, i) => (
            <li key={i} className="flex flex-wrap justify-between gap-x-3 py-0.5">
              <span className="font-medium">
                {item.name}
                {item.form && <span className="font-normal text-muted-foreground"> · {item.form}</span>}
              </span>
              {item.qty ? (
                <span className="tabular">
                  {item.qty} {item.unit === "t" ? "tonnes" : "kg"}
                </span>
              ) : null}
            </li>
          ))}
        </ul>
      )}
      {e.message && <p className="text-[15px] leading-relaxed break-words whitespace-pre-line">{e.message}</p>}
      {e.pageUrl && (
        <a href={e.pageUrl} target="_blank" rel="noopener noreferrer" className="mt-auto inline-flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
          <ArrowSquareOutIcon size={14} className="shrink-0" />
          <span className="truncate">Sent from {e.pageUrl.replace(/^https?:\/\/[^/]+/, "") || "/"}</span>
        </a>
      )}
    </li>
  );
}
