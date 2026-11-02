"use client";

import { useActionState } from "react";
import { LockKeyIcon, SpinnerGapIcon } from "@phosphor-icons/react";
import { unlockEnquiries, type UnlockState } from "@/app/admin/(panel)/enquiries/actions";
import { button } from "@/lib/ui";
import { field, label } from "../styles";

// Second lock on this tab. A successful code re-renders the page with the list.
export default function EnquiryLock() {
  const [state, action, pending] = useActionState<UnlockState, FormData>(unlockEnquiries, {});
  return (
    <div className="mx-auto mt-6 max-w-md rounded-card border bg-surface p-5 md:p-7">
      <span className="grid size-12 place-items-center rounded-tile bg-primary/8 text-primary">
        <LockKeyIcon size={24} />
      </span>
      <h1 className="mt-3 font-display text-[28px] leading-tight font-medium tracking-tight">Enter the access code</h1>
      <p className="mt-1 text-[15px] text-muted-foreground">Enquiries hold buyers&apos; contact details. Access lasts an hour, then you&apos;ll need the code again.</p>
      <form action={action} className="mt-4 flex flex-col gap-3">
        <label className="flex flex-col gap-1.5">
          <span className={label}>Access code</span>
          <input name="code" type="password" required autoFocus autoComplete="off" aria-invalid={!!state.error} className={field} />
        </label>
        {state.error && !pending && (
          <p role="alert" className="text-sm font-semibold text-red-700">
            {state.error}
          </p>
        )}
        <button type="submit" disabled={pending} className={`${button("primary", "md")} disabled:opacity-70`}>
          {pending && <SpinnerGapIcon size={18} className="animate-spin" />}
          {pending ? "Checking..." : "Unlock enquiries"}
        </button>
      </form>
    </div>
  );
}
