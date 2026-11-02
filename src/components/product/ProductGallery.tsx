"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, type PanInfo } from "motion/react";
import { ArrowsOutSimpleIcon, CaretLeftIcon, CaretRightIcon, XIcon } from "@phosphor-icons/react";
import type { Photo } from "@/data/photos";
import { haptic } from "@/lib/haptics";
import { photoProps } from "@/lib/photo";

// Cover first, then the gallery. Swipe or use the thumbnails; tap the photo
// for a full-screen view (arrow keys and Escape work there too).
export default function ProductGallery({ photos, name }: { photos: Photo[]; name: string }) {
  const [index, setIndex] = useState(0);
  const [viewer, setViewer] = useState(false);
  const many = photos.length > 1;
  const go = (i: number) => {
    haptic(5);
    setIndex((i + photos.length) % photos.length);
  };

  function onSwipe(_: unknown, info: PanInfo) {
    if (info.offset.x < -50 || info.velocity.x < -400) go(index + 1);
    else if (info.offset.x > 50 || info.velocity.x > 400) go(index - 1);
  }

  useEffect(() => {
    if (!viewer) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setViewer(false);
      if (e.key === "ArrowRight") setIndex((i) => (i + 1) % photos.length);
      if (e.key === "ArrowLeft") setIndex((i) => (i - 1 + photos.length) % photos.length);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [viewer, photos.length]);

  const photo = photos[index];

  return (
    <div>
      {/* On phones the photo takes the height the Overview tab leaves free, so that tab fits one screen. */}
      <motion.div
        drag={many ? "x" : false}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.15}
        onDragEnd={onSwipe}
        className="group relative h-[clamp(8.5rem,calc(100svh-28.5rem-env(safe-area-inset-bottom)),40svh)] touch-pan-y overflow-hidden bg-surface-muted md:aspect-4/3 md:h-auto md:rounded-card lg:aspect-auto lg:h-[clamp(360px,calc(100dvh-15rem),600px)]"
      >
        <AnimatePresence initial={false}>
          <motion.div key={index} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }} className="absolute inset-0">
            <Image
              {...photoProps(photo)}
              alt={photo.alt}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              {...(index === 0 ? { loading: "eager" as const, fetchPriority: "high" as const } : {})}
              className="pointer-events-none object-cover"
            />
          </motion.div>
        </AnimatePresence>

        <button
          type="button"
          onClick={() => setViewer(true)}
          aria-label={`View ${name} photos full screen`}
          className="absolute inset-0 cursor-zoom-in"
        />
        <span className="pointer-events-none absolute top-3 right-3 grid size-10 place-items-center rounded-full bg-background/90 opacity-0 shadow-card backdrop-blur transition-opacity group-hover:opacity-100">
          <ArrowsOutSimpleIcon size={18} />
        </span>

        {many && (
          <>
            <span className="pointer-events-none absolute bottom-7 left-1/2 flex -translate-x-1/2 gap-1.5 md:hidden">
              {photos.map((_, i) => (
                <span key={i} className={`h-1.5 rounded-full bg-background transition-all ${i === index ? "w-5" : "w-1.5 opacity-60"}`} />
              ))}
            </span>
            <ArrowButton side="left" onClick={() => go(index - 1)} />
            <ArrowButton side="right" onClick={() => go(index + 1)} />
          </>
        )}
      </motion.div>

      {many && (
        <div role="tablist" aria-label="Photos" className="rail mt-2.5 hidden gap-2 md:flex">
          {photos.map((p, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Photo ${i + 1}`}
              onClick={() => go(i)}
              className={`relative size-14 shrink-0 overflow-hidden rounded-tile bg-surface-muted transition ${
                i === index ? "ring-2 ring-primary ring-offset-2" : "opacity-65 hover:opacity-100"
              }`}
            >
              <Image {...photoProps(p)} alt="" fill sizes="56px" className="object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* full-screen viewer */}
      <AnimatePresence>
        {viewer && (
          <motion.div
            role="dialog"
            aria-modal
            aria-label={`${name} photos`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] flex flex-col bg-inverse/95 backdrop-blur-sm"
          >
            <div className="flex items-center justify-between p-3 text-inverse-foreground" style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}>
              <span className="px-2 text-sm font-semibold tabular">
                {index + 1} / {photos.length}
              </span>
              <button type="button" onClick={() => setViewer(false)} aria-label="Close" className="grid size-11 place-items-center rounded-full hover:bg-inverse-foreground/10">
                <XIcon size={22} />
              </button>
            </div>
            <motion.div
              drag={many ? "x" : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={onSwipe}
              className="relative flex-1 touch-pan-y"
            >
              <AnimatePresence initial={false}>
                <motion.div key={index} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="absolute inset-0">
                  <Image {...photoProps(photo)} alt={photo.alt} fill sizes="100vw" className="pointer-events-none object-contain" />
                </motion.div>
              </AnimatePresence>
              {many && (
                <>
                  <ArrowButton side="left" onClick={() => go(index - 1)} always />
                  <ArrowButton side="right" onClick={() => go(index + 1)} always />
                </>
              )}
            </motion.div>
            <p className="p-4 text-center text-sm text-inverse-foreground/75">{photo.alt}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ArrowButton({ side, onClick, always }: { side: "left" | "right"; onClick: () => void; always?: boolean }) {
  const Icon = side === "left" ? CaretLeftIcon : CaretRightIcon;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={side === "left" ? "Previous photo" : "Next photo"}
      className={`absolute top-1/2 ${side === "left" ? "left-3" : "right-3"} z-10 hidden size-11 -translate-y-1/2 place-items-center rounded-full bg-background/90 shadow-card backdrop-blur transition hover:bg-background md:grid ${
        always ? "" : "opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
      }`}
    >
      <Icon size={20} weight="bold" />
    </button>
  );
}
