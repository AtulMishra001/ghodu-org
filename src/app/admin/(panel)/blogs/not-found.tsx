import Link from "next/link";
import { button } from "@/lib/ui";

export default function AdminBlogNotFound() {
  return (
    <div className="py-10 text-center">
      <h1 className="font-display text-[32px] font-medium">This blog doesn&apos;t exist</h1>
      <p className="mt-1 text-muted-foreground">It may have been deleted.</p>
      <Link href="/admin/blogs" className={`${button("primary", "md")} mt-4`}>
        Back to archive
      </Link>
    </div>
  );
}
