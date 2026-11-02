import Link from "next/link";
import type { Photo, PhotoCredit } from "@/data/photos";
import { nav, site } from "@/data/site";
import { container } from "@/lib/ui";
import Logo from "./Logo";

export default function Footer({ credits }: { credits: (Photo & { credit: PhotoCredit })[] }) {
  const contact = [site.phone, site.email, site.address].filter(Boolean) as string[];
  return (
    <footer className="border-t bg-background">
      <div className={`${container} grid gap-8 py-10 max-md:hidden md:grid-cols-[1.6fr_1fr_1fr]`}>
        <div>
          <Logo className="h-12 w-auto" />
          <p className="mt-3 max-w-sm text-sm text-muted-foreground">{site.description}</p>
        </div>
        <nav aria-label="Footer">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Explore</p>
          <ul className="mt-3 grid gap-2">
            {nav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-[15px] font-medium hover:text-primary">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Get in touch</p>
          {contact.length ? (
            <ul className="mt-3 grid gap-2 text-[15px]">
              {contact.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-[15px]">
              <Link href="/contact" className="font-medium text-primary hover:underline">
                Send us an enquiry →
              </Link>
            </p>
          )}
        </div>
      </div>
      <div className="border-t max-md:border-t-0">
        <div className={`${container} flex flex-col gap-2 py-4 text-xs text-muted-foreground md:flex-row md:items-start md:justify-between`}>
          <p>
            © {site.name}. Produce of Kashmir.
            {/* The tab bar covers the other pages on phones; this one isn't a tab. */}
            <Link href="/blogs" className="ml-2 font-semibold text-primary md:hidden">
              Blogs
            </Link>
          </p>
          {credits.length > 0 && (
          <details className="md:max-w-2xl md:text-right">
            <summary className="cursor-pointer select-none hover:text-foreground">Photo credits</summary>
            <ul className="mt-2 grid gap-1">
              {credits.map((photo) => (
                <li key={photo.credit.url}>
                  <a href={photo.credit.url} target="_blank" rel="noreferrer" className="hover:text-foreground hover:underline">
                    {photo.alt.split(",")[0]} — {photo.credit.author}, {photo.credit.license}, via Wikimedia Commons
                  </a>
                </li>
              ))}
            </ul>
          </details>
          )}
        </div>
      </div>
    </footer>
  );
}
