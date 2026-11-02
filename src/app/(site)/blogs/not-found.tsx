import Link from "next/link";
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr";
import { button, container } from "@/lib/ui";

export default function BlogNotFound() {
  return (
    <section className={`${container} flex flex-col items-center py-10 text-center`}>
      <p className="text-xs font-semibold tracking-[0.18em] text-primary uppercase">Not on the blog</p>
      <h1 className="mt-2 font-display text-[34px] leading-tight font-medium md:text-[44px]">We couldn&apos;t find that article</h1>
      <p className="mt-2 max-w-md text-muted-foreground">It may have moved or been taken down. Everything we&apos;ve published is on the blog page.</p>
      <Link href="/blogs" className={`${button("primary", "lg")} mt-6`}>
        <ArrowLeftIcon size={18} />
        Back to the blog
      </Link>
    </section>
  );
}
