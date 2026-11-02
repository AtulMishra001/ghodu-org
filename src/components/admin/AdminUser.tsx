import { SignOutIcon } from "@phosphor-icons/react/dist/ssr";
import { logout } from "@/app/admin/login/actions";
import { getAdmin } from "@/lib/server/auth";

// Signed-in admin + sign out, at the foot of the sidebar. Reads the session,
// so it renders inside Suspense. Collapses to an icon via the shell's
// data-compact flag on the surrounding group/user element.
export default async function AdminUser() {
  const admin = await getAdmin();
  if (!admin) return null;
  return (
    <form action={logout} className="flex items-center gap-2 rounded-control px-1 pt-1 group-data-[compact=true]/user:justify-center">
      <span
        aria-hidden
        className="grid size-9 shrink-0 place-items-center rounded-full bg-secondary text-sm font-bold text-secondary-foreground uppercase group-data-[compact=true]/user:hidden"
      >
        {admin.email[0]}
      </span>
      <span className="min-w-0 flex-1 group-data-[compact=true]/user:hidden">
        <span className="block text-xs text-muted-foreground">Signed in as</span>
        <span className="block truncate text-sm font-semibold">{admin.email}</span>
      </span>
      <button
        type="submit"
        aria-label="Sign out"
        title="Sign out"
        className="grid size-9 shrink-0 place-items-center rounded-control text-muted-foreground transition hover:bg-red-50 hover:text-red-700 active:scale-90"
      >
        <SignOutIcon size={20} />
      </button>
    </form>
  );
}
