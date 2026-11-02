import Link from "next/link";
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr";
import { button, container } from "@/lib/ui";

export default function ProductNotFound() {
  return (
    <section className={`${container} flex flex-col items-center py-10 text-center`}>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Not in the catalogue</p>
      <h1 className="mt-2 font-display text-[34px] leading-tight font-medium md:text-[44px]">We couldn&apos;t find that product</h1>
      <p className="mt-2 max-w-md text-muted-foreground">It may have been renamed or taken off the list for now. Browse the catalogue, or ask us to source it.</p>
      <Link href="/products" className={`${button("primary", "lg")} mt-6`}>
        <ArrowLeftIcon size={18} />
        Back to the catalogue
      </Link>
    </section>
  );
}
