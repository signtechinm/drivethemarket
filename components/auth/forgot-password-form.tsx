"use client";

import { useActionState } from "react";

import {
  type AuthLifecycleState,
  requestPasswordResetAction,
} from "@/app/actions/auth-lifecycle";
import { Button } from "@/components/ui/button";

const initialState: AuthLifecycleState = { success: false, message: "" };

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(
    requestPasswordResetAction,
    initialState,
  );

  return (
    <form action={action} className="space-y-5">
      {state.message ? (
        <div
          className="rounded-xl border border-olive-200 bg-olive-100 p-3 text-sm text-olive-800"
          role="status"
        >
          {state.message}
          {state.developmentUrl ? (
            <a
              className="mt-2 block font-semibold break-all underline"
              href={state.developmentUrl}
            >
              Development reset link
            </a>
          ) : null}
        </div>
      ) : null}
      <label className="block space-y-2 text-sm font-semibold">
        <span>Email address</span>
        <input
          autoComplete="email"
          className="border-border focus:border-primary focus:ring-ring/30 h-11 w-full rounded-[var(--radius-control)] border px-3 outline-none focus:ring-2"
          name="email"
          required
          type="email"
        />
      </label>
      <Button className="w-full" disabled={pending} size="lg" type="submit">
        {pending ? "Preparing instructions…" : "Reset password"}
      </Button>
    </form>
  );
}
