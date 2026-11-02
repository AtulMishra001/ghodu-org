import type { Metadata, Viewport } from "next";
import { Figtree, Newsreader } from "next/font/google";
import { site } from "@/data/site";
import { siteUrl } from "@/lib/blog-urls";
import "./globals.css";

const heading = Newsreader({ variable: "--font-heading", subsets: ["latin"], style: ["normal", "italic"] });
const body = Figtree({ variable: "--font-body", subsets: ["latin"] });

export const metadata: Metadata = {
  // Makes relative canonical and Open Graph URLs absolute.
  metadataBase: new URL(siteUrl),
  title: { default: `${site.name} — Agricultural produce from Kashmir`, template: `%s | ${site.name}` },
  description: site.description,
  appleWebApp: { capable: true, title: site.shortName, statusBarStyle: "default" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = { themeColor: "#ffffff", viewportFit: "cover" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${heading.variable} ${body.variable} h-full antialiased`}>
      <body className="flex min-h-dvh flex-col font-sans">{children}</body>
    </html>
  );
}
