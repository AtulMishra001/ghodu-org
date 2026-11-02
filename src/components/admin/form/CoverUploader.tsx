"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowsClockwiseIcon, ImageSquareIcon, TrashIcon, UploadSimpleIcon, WarningCircleIcon } from "@phosphor-icons/react";
import type { CoverImageInput } from "@/lib/product-input";
import { checkFile, IMAGE_MIME, MAX_IMAGE_MB, uploadImage } from "./upload";

type Upload = { preview: string; progress: number } | null;

// The cover photo: drop or pick one file, see progress, then replace or remove it.
export default function CoverUploader({
  value,
  onChange,
  onUploaded,
  error,
}: {
  value: CoverImageInput | null;
  onChange: (img: CoverImageInput | null) => void;
  /** Told about every finished upload, so unsaved ones can be cleaned up. */
  onUploaded: (publicId: string) => void;
  error?: string;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [upload, setUpload] = useState<Upload>(null);
  const [problem, setProblem] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  // free the local preview once it's no longer shown
  const preview = upload?.preview;
  useEffect(() => () => void (preview && URL.revokeObjectURL(preview)), [preview]);

  async function handle(file: File | undefined) {
    if (!file) return;
    const issue = checkFile(file);
    setProblem(issue);
    if (issue) return;

    setUpload({ preview: URL.createObjectURL(file), progress: 0 });
    try {
      const res = await uploadImage(file, (progress) => setUpload((u) => (u ? { ...u, progress } : u)));
      onUploaded(res.publicId);
      onChange({ ...res, alt: value?.alt ?? "" });
    } catch (err) {
      setProblem(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUpload(null);
    }
  }

  const shownSrc = upload?.preview ?? value?.url;

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handle(e.dataTransfer.files[0]);
        }}
        className={`relative aspect-[4/5] overflow-hidden rounded-card border-2 border-dashed transition-colors ${
          dragOver ? "border-primary bg-primary/5" : error && !shownSrc ? "border-red-300 bg-red-50/40" : shownSrc ? "border-transparent" : "border-border bg-surface-muted/50"
        }`}
      >
        {shownSrc ? (
          <>
            <Image
              src={shownSrc}
              alt={value?.alt ?? ""}
              fill
              sizes="360px"
              unoptimized={!!upload}
              className={`object-cover transition-[filter,opacity] duration-300 ${upload ? "opacity-70 blur-[1px]" : ""}`}
            />
            <AnimatePresence>
              {upload && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-x-4 bottom-4 rounded-control bg-inverse/85 p-3 text-inverse-foreground backdrop-blur"
                >
                  <div className="flex justify-between text-xs font-semibold">
                    <span>Uploading…</span>
                    <span className="tabular">{Math.round(upload.progress * 100)}%</span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-inverse-foreground/20">
                    <motion.div className="h-full rounded-full bg-accent" animate={{ width: `${upload.progress * 100}%` }} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            {!upload && (
              <div className="absolute top-3 right-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => input.current?.click()}
                  className="flex h-9 items-center gap-1.5 rounded-control bg-background/90 px-3 text-sm font-semibold shadow-card backdrop-blur transition hover:bg-background active:scale-95"
                >
                  <ArrowsClockwiseIcon size={16} />
                  Replace
                </button>
                <button
                  type="button"
                  onClick={() => onChange(null)}
                  aria-label="Remove cover photo"
                  className="grid size-9 place-items-center rounded-control bg-background/90 text-red-700 shadow-card backdrop-blur transition hover:bg-background active:scale-95"
                >
                  <TrashIcon size={16} />
                </button>
              </div>
            )}
          </>
        ) : (
          <button
            type="button"
            onClick={() => input.current?.click()}
            className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center"
          >
            <span className="grid size-14 place-items-center rounded-full bg-surface text-primary shadow-card">
              {dragOver ? <UploadSimpleIcon size={26} /> : <ImageSquareIcon size={26} weight="duotone" />}
            </span>
            <span className="font-semibold">{dragOver ? "Drop to upload" : "Add the cover photo"}</span>
            <span className="text-xs text-muted-foreground">
              Drag a photo here or tap to choose.
              <br />
              WebP only, up to {MAX_IMAGE_MB} MB. Portrait works best.
            </span>
          </button>
        )}
      </div>

      <input
        ref={input}
        type="file"
        accept={`${IMAGE_MIME},.webp`}
        className="sr-only"
        tabIndex={-1}
        onChange={(e) => {
          handle(e.target.files?.[0]);
          e.target.value = "";
        }}
      />

      {(problem || (error && !shownSrc)) && (
        <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-red-700">
          <WarningCircleIcon size={16} weight="fill" />
          {problem ?? error}
        </p>
      )}
    </div>
  );
}
