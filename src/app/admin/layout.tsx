import type { Metadata } from "next";
import AdminProviders from "@/components/admin/AdminProviders";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: { default: `Admin · ${site.name}`, template: `%s · Admin · ${site.name}` },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return <AdminProviders>{children}</AdminProviders>;
}
