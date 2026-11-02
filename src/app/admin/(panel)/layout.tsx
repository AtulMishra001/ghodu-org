import { Suspense } from "react";
import AdminUser from "@/components/admin/AdminUser";
import AdminShell from "@/components/admin/shell/AdminShell";
import Logo from "@/components/shared/Logo";

// Signed-in admin area: sidebar shell around every tab. Pages render their
// own Suspense boundaries for the session check and data.
export default function PanelLayout({ children }: LayoutProps<"/admin">) {
  return (
    <AdminShell
      logo={
        <>
          <Logo className="h-8 w-auto" />
          <span className="rounded-md bg-inverse px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-inverse-foreground">Admin</span>
        </>
      }
      mark={
        <span aria-label="Ghodu Agro admin" className="grid size-10 place-items-center rounded-tile bg-inverse font-display text-xl font-semibold text-accent">
          G
        </span>
      }
      user={
        <Suspense>
          <AdminUser />
        </Suspense>
      }
    >
      {children}
    </AdminShell>
  );
}
