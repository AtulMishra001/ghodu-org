import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr";
import Logo from "@/components/shared/Logo";
import type { Photo } from "@/data/photos";
import { photoProps } from "@/lib/photo";

// Split sign-in screen: orchard photo on large screens, the form on its own on phones.
export default function LoginPanel({ image, children }: { image: Photo; children: ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
      <div className="relative hidden overflow-hidden bg-inverse lg:block">
        <Image {...photoProps(image)} alt="" fill sizes="55vw" className="object-cover opacity-80" loading="eager" />
        <div className="absolute inset-0 bg-linear-to-t from-inverse via-inverse/30 to-inverse/10" />
        <div className="absolute inset-x-0 bottom-0 p-10 text-inverse-foreground">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Catalogue admin</p>
          <p className="mt-2 max-w-md font-display text-4xl leading-tight font-medium">
            Keep the valley&apos;s produce up to date, season by season.
          </p>
        </div>
      </div>

      <div className="flex flex-col px-5 py-6 md:px-10">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 self-start text-sm font-semibold text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeftIcon size={16} />
          Back to site
        </Link>
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-10">
          <Logo />
          <h1 className="mt-8 font-display text-[32px] leading-tight font-medium tracking-tight">Sign in</h1>
          <p className="mt-1 text-[15px] text-muted-foreground">Manage the products shown on the website.</p>
          <div className="mt-7">{children}</div>
        </div>
      </div>
    </div>
  );
}
