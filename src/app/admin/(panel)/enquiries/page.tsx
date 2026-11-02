import type { Metadata } from "next";
import { Suspense } from "react";
import EnquiryList from "@/components/admin/enquiries/EnquiryList";
import EnquiryLock from "@/components/admin/enquiries/EnquiryLock";
import PanelSkeleton from "@/components/admin/PanelSkeleton";
import { ENQUIRY_FORMS, type EnquiryFormId } from "@/lib/enquiry";
import { requireAdmin } from "@/lib/server/auth";
import { getEnquiryAccess } from "@/lib/server/enquiry-access";
import { listEnquiries } from "@/lib/server/enquiries";

export const metadata: Metadata = { title: "Enquiries" };

type Props = PageProps<"/admin/enquiries">;

export default function EnquiriesPage({ searchParams }: Props) {
  return (
    <Suspense fallback={<PanelSkeleton />}>
      <Enquiries searchParams={searchParams} />
    </Suspense>
  );
}

async function Enquiries({ searchParams }: Pick<Props, "searchParams">) {
  await requireAdmin();
  // Nothing is read from the database until the code has been entered.
  const expiresAt = await getEnquiryAccess();
  if (!expiresAt) return <EnquiryLock />;

  const params = await searchParams;
  const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value) ?? "";
  const formParam = first(params.form);
  const form = Object.hasOwn(ENQUIRY_FORMS, formParam) ? (formParam as EnquiryFormId) : undefined;
  const search = first(params.q);
  const requested = Number.parseInt(first(params.page), 10);
  const page = requested > 0 ? requested : 1;

  const result = await listEnquiries({ form, search, page });
  return <EnquiryList {...result} form={form} search={search} page={page} expiresAt={expiresAt} />;
}
