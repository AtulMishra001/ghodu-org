"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import type { Photo } from "@/data/photos";
import { photoProps } from "@/lib/photo";

// A photo that fills its parent and drifts slightly slower than the page as it scrolls by.
export default function ParallaxPhoto({ photo, sizes, className }: { photo: Photo; sizes: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-6%", "6%"]);

  return (
    <div ref={ref} className={`absolute inset-0 overflow-hidden ${className ?? ""}`}>
      <motion.div style={{ y }} className="absolute -inset-y-[8%] inset-x-0">
        <Image {...photoProps(photo)} alt={photo.alt} fill sizes={sizes} className="object-cover" />
      </motion.div>
    </div>
  );
}
