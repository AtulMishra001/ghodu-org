"use client";

import { useActionState, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { EyeIcon, EyeSlashIcon, SpinnerGapIcon, WarningCircleIcon } from "@phosphor-icons/react";
import { login, type LoginState } from "@/app/admin/login/actions";
import { button } from "@/lib/ui";
import { field, label } from "./styles";

export default function LoginForm() {
  const next = useSearchParams().get("next") ?? "";
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});
  const [show, setShow] = useState(false);

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="next" value={next} />

      <AnimatePresence initial={false}>
        {state.error && !pending && (
          <motion.p
            key={state.error}
            role="alert"
            initial={{ opacity: 0, y: -6, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-2 overflow-hidden rounded-control border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-semibold text-red-800"
          >
            <WarningCircleIcon size={18} weight="fill" className="shrink-0" />
            {state.error}
          </motion.p>
        )}
      </AnimatePresence>

      <label className="flex flex-col gap-1.5">
        <span className={label}>Email</span>
        <input
          name="email"
          type="email"
          autoComplete="username"
          required
          autoFocus
          defaultValue={state.email}
          className={field}
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className={label}>Password</span>
        <span className="relative">
          <input
            name="password"
            type={show ? "text" : "password"}
            autoComplete="current-password"
            required
            className={`${field} w-full pr-12`}
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? "Hide password" : "Show password"}
            className="absolute inset-y-0 right-1 my-auto grid size-10 place-items-center rounded-control text-muted-foreground transition hover:text-foreground"
          >
            {show ? <EyeSlashIcon size={20} /> : <EyeIcon size={20} />}
          </button>
        </span>
      </label>

      <button type="submit" disabled={pending} className={`${button("primary", "lg")} mt-2 w-full disabled:opacity-70`}>
        {pending && <SpinnerGapIcon size={20} className="animate-spin" />}
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
