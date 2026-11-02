"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { ImageIcon, SpinnerGapIcon } from "@phosphor-icons/react";
import { useToast } from "@/components/shared/Toast";
import { IMAGE_MIME } from "@/lib/image-rules";
import { field, hint, label } from "../styles";
import { heroImageHint, uploadHeroImage } from "./api";

// Click to upload or replace. Type and size are checked before anything is sent.
export default function HeroImageField({ url, alt, onChange }: { url: string; alt: string; onChange: (url: string) => void }) {
  const toast = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function pick(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    try {
      onChange(await uploadHeroImage(file));
      toast("Image uploaded");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Upload failed. Try again.", "error");
    } finally {
      setUploading(false);
      // So the same file can be chosen again.
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <span className={label}>Hero image</span>
      <button
        type="button"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        aria-label={url ? "Replace hero image" : "Upload hero image"}
        className="relative grid aspect-video w-full place-items-center overflow-hidden rounded-control border border-dashed bg-surface-muted/50 text-muted-foreground transition hover:border-primary/50"
      >
        {url && <Image src={url} alt={alt} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />}
        {uploading ? (
          <span className="relative flex items-center gap-2 rounded-control bg-background/90 px-3 py-2 text-sm font-semibold text-primary">
            <SpinnerGapIcon size={18} className="animate-spin" />
            Uploading...
          </span>
        ) : (
          !url && (
            <span className="flex flex-col items-center gap-1.5 text-sm font-semibold">
              <ImageIcon size={32} />
              Click to upload
            </span>
          )
        )}
      </button>
      <input ref={inputRef} type="file" accept={`${IMAGE_MIME},.webp`} tabIndex={-1} aria-hidden className="sr-only" onChange={(e) => pick(e.target.files?.[0])} />
      <p className={hint}>{heroImageHint} Click the image to replace it.</p>
      {url && (
        <label className="mt-1 flex flex-col gap-1.5">
          <span className={label}>Image URL</span>
          <input value={url} readOnly className={`${field} bg-surface-muted/50 text-sm text-muted-foreground`} />
        </label>
      )}
    </div>
  );
}
