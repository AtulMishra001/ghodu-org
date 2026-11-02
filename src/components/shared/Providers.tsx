"use client";

import type { ReactNode } from "react";
import { MotionConfig } from "motion/react";
import type { Product } from "@/data/products";
import QuoteProvider from "./QuoteProvider";
import { ToastProvider } from "./Toast";

export default function Providers({ products, children }: { products: Product[]; children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <ToastProvider>
        <QuoteProvider products={products}>{children}</QuoteProvider>
      </ToastProvider>
    </MotionConfig>
  );
}
