"use client";

import { useActionState } from "react";

import {
  createAnnouncementAction,
  type CommunicationActionState,
} from "@/app/actions/communications";
import { Button } from "@/components/ui/button";

const initialState: CommunicationActionState = { success: false, message: "" };

export function AnnouncementForm({
  batches,
}: {
  batches: { id: string; label: string }[];
}) {
  const [state, action, pending] = useActionState(
    createAnnouncementAction,
    initialState,
  );
  const input =
    "h-10 w-full rounded-[var(--radius-control)] border border-border bg-white px-3 text-sm outline-none focus:border-primary";
  return (
    <form action={action} className="space-y-4">
      {state.message ? (
        <p
          className={`rounded-xl p-3 text-sm ${state.success ? "bg-olive-100 text-olive-800" : "bg-red-50 text-red-800"}`}
        >
          {state.message}
        </p>
      ) : null}
      <label className="block space-y-1.5 text-xs font-semibold">
        <span>Title</span>
        <input className={input} name="title" required />
      </label>
      <label className="block space-y-1.5 text-xs font-semibold">
        <span>Audience</span>
        <select className={input} name="batchId">
          <option value="">All active students</option>
          {batches.map((batch) => (
            <option key={batch.id} value={batch.id}>
              {batch.label}
            </option>
          ))}
        </select>
      </label>
      <label className="block space-y-1.5 text-xs font-semibold">
        <span>Message</span>
        <textarea className={`${input} min-h-28 py-2`} name="body" required />
      </label>
      <label className="block space-y-1.5 text-xs font-semibold">
        <span>Expires (optional)</span>
        <input className={input} name="expiresAt" type="datetime-local" />
      </label>
      <Button className="w-full" disabled={pending}>
        {pending ? "Saving…" : "Save draft"}
      </Button>
    </form>
  );
}
