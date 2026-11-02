import { Suspense } from "react";
import { archiveMetadata } from "@/components/blogs/archive-metadata";
import ArchiveView, { ArchiveSkeleton } from "@/components/blogs/ArchiveView";

export const metadata = archiveMetadata();

export default function BlogsPage() {
  return (
    <Suspense fallback={<ArchiveSkeleton />}>
      <ArchiveView />
    </Suspense>
  );
}
