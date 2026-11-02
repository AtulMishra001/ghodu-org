import Link from "next/link";
import Logo from "@/components/shared/Logo";
import { button } from "@/lib/ui";

const suggestions = [
  { href: "/products", label: "Products" },
  { href: "/blogs", label: "Blogs" },
  { href: "/about-us", label: "About us" },
  { href: "/contact", label: "Contact" },
];

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-10 text-center">
      <Link href="/" aria-label="Ghodu Agro home">
        <Logo className="h-12 w-auto" />
      </Link>
      <h1 className="font-display text-[34px] leading-tight font-medium md:text-[44px]">We couldn&apos;t find that page</h1>
      <p className="max-w-md text-muted-foreground">It may have moved or the address may be mistyped. These are a good place to start.</p>
      <nav aria-label="Suggested pages">
        <ul className="flex flex-wrap justify-center gap-2">
          {suggestions.map((s) => (
            <li key={s.href}>
              <Link href={s.href} className={button("outline", "md")}>
                {s.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </main>
  );
}
