"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeftIcon, ArrowRightIcon, PlusIcon, TrashIcon, WarningCircleIcon } from "@phosphor-icons/react";
import { limits } from "@/lib/product-input";
import { checkFile, IMAGE_MIME, MAX_IMAGE_MB, uploadImage } from "./upload";

type Pending = { key: string; preview: string; progress: number };

// Extra photos after the cover: pick or drop several at once, reorder with
// the arrows, remove any. Stored as Cloudinary URLs.
export default function GalleryUploader({
  value,
  onChange,
  onUploaded,
  error,
}: {
  value: string[];
  /** Takes an updater, so uploads that finish together don't overwrite each other. */
  onChange: (update: (urls: string[]) => string[]) => void;
  /** Told about every finished upload, so unsaved ones can be cleaned up. */
  onUploaded: (publicId: string) => void;
  error?: string;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<Pending[]>([]);
  const [problems, setProblems] = useState<string[]>([]);
  const [dragOver, setDragOver] = useState(false);

  const room = limits.gallery - value.length - pending.length;

  async function handle(files: File[]) {
    const issues: string[] = [];
    const accepted: File[] = [];
    for (const f of files) {
      const issue = checkFile(f);
      if (issue) issues.push(issue);
      else if (accepted.length < room) accepted.push(f);
      else issues.push(`${f.name}: the gallery holds up to ${limits.gallery} photos.`);
    }
    setProblems(issues);
    if (!accepted.length) return;

    const batch = accepted.map((file) => ({ file, key: `${file.name}-${file.size}-${Math.random()}`, preview: URL.createObjectURL(file) }));
    setPending((p) => [...p, ...batch.map(({ key, preview }) => ({ key, preview, progress: 0 }))]);

    await Promise.all(
      batch.map(async ({ file, key, preview }) => {
        try {
          const res = await uploadImage(file, (progress) => setPending((p) => p.map((x) => (x.key === key ? { ...x, progress } : x))));
          onUploaded(res.publicId);
          onChange((urls) => (urls.length < limits.gallery ? [...urls, res.url] : urls));
        } catch (err) {
          setProblems((p) => [...p, `${file.name}: ${err instanceof Error ? err.message : "upload failed"}`]);
        } finally {
          setPending((p) => p.filter((x) => x.key !== key));
          URL.revokeObjectURL(preview);
        }
      }),
    );
  }

  function move(i: number, by: -1 | 1) {
    onChange((urls) => {
      const next = [...urls];
      [next[i], next[i + by]] = [next[i + by], next[i]];
      return next;
    });
  }

  return (
    <div>
      <ul
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handle([...e.dataTransfer.files]);
        }}
        className={`grid grid-cols-3 gap-2 rounded-card transition-colors sm:grid-cols-4 lg:grid-cols-3 ${dragOver ? "bg-primary/5 ring-2 ring-primary/40" : ""}`}
      >
        <AnimatePresence initial={false}>
          {value.map((url, i) => (
            <motion.li
              key={url}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="group relative aspect-square overflow-hidden rounded-tile bg-surface-muted"
            >
              <Image src={url} alt={`Gallery photo ${i + 1}`} fill sizes="120px" className="object-cover" />
              <span className="absolute top-1.5 left-1.5 rounded bg-inverse/70 px-1.5 text-[11px] font-bold text-inverse-foreground tabular">{i + 2}</span>
              <div className="absolute inset-x-1.5 bottom-1.5 flex justify-between gap-1 opacity-100 transition-opacity lg:opacity-0 lg:group-focus-within:opacity-100 lg:group-hover:opacity-100">
                <span className="flex gap-1">
                  <IconButton label="Move earlier" disabled={i === 0} onClick={() => move(i, -1)}>
                    <ArrowLeftIcon size={14} weight="bold" />
                  </IconButton>
                  <IconButton label="Move later" disabled={i === value.length - 1} onClick={() => move(i, 1)}>
                    <ArrowRightIcon size={14} weight="bold" />
                  </IconButton>
                </span>
                <IconButton label={`Remove gallery photo ${i + 2}`} danger onClick={() => onChange((urls) => urls.filter((u) => u !== url))}>
                  <TrashIcon size={14} />
                </IconButton>
              </div>
            </motion.li>
          ))}
          {pending.map((p) => (
            <motion.li key={p.key} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative aspect-square overflow-hidden rounded-tile bg-surface-muted">
              <Image src={p.preview} alt="" fill unoptimized sizes="120px" className="object-cover opacity-60" />
              <div className="absolute inset-x-2 bottom-2 h-1.5 overflow-hidden rounded-full bg-background/70">
                <motion.div className="h-full rounded-full bg-accent" animate={{ width: `${p.progress * 100}%` }} />
              </div>
            </motion.li>
          ))}
        </AnimatePresence>
        {room > 0 && (
          <li className="aspect-square">
            <button
              type="button"
              onClick={() => input.current?.click()}
              className="flex size-full flex-col items-center justify-center gap-1 rounded-tile border-2 border-dashed text-muted-foreground transition hover:border-primary/50 hover:text-primary"
            >
              <PlusIcon size={20} weight="bold" />
              <span className="text-xs font-semibold">Add photos</span>
            </button>
          </li>
        )}
      </ul>

      <input
        ref={input}
        type="file"
        multiple
        accept={`${IMAGE_MIME},.webp`}
        className="sr-only"
        tabIndex={-1}
        onChange={(e) => {
          handle([...(e.target.files ?? [])]);
          e.target.value = "";
        }}
      />

      <p className="mt-2 text-xs text-muted-foreground">
        {value.length}/{limits.gallery} photos · WebP only, up to {MAX_IMAGE_MB} MB each. Show the product up close, its grades, packing and the orchard.
      </p>
      {[...problems, ...(error ? [error] : [])].map((p) => (
        <p key={p} className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-red-700">
          <WarningCircleIcon size={14} weight="fill" className="shrink-0" />
          {p}
        </p>
      ))}
    </div>
  );
}

function IconButton({ label, onClick, disabled, danger, children }: { label: string; onClick: () => void; disabled?: boolean; danger?: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={`grid size-7 place-items-center rounded-md bg-background/92 shadow-card backdrop-blur transition active:scale-90 disabled:opacity-40 ${
        danger ? "text-red-700" : "text-foreground"
      }`}
    >
      {children}
    </button>
  );
}
