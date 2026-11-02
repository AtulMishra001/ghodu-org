import { ArticleIcon, ChatsCircleIcon, PackageIcon, SquaresFourIcon, type Icon } from "@phosphor-icons/react";

export type NavItem = { href: string; label: string; icon: Icon; soon?: boolean };

// Tabs of the admin panel, in sidebar order.
export const navItems: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: SquaresFourIcon },
  { href: "/admin/products", label: "Products", icon: PackageIcon },
  { href: "/admin/blogs", label: "Blogs", icon: ArticleIcon },
  { href: "/admin/enquiries", label: "Enquiries", icon: ChatsCircleIcon },
];

export const isActive = (pathname: string, href: string) =>
  href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(`${href}/`);
