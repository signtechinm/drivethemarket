"use client";

import { useActionState } from "react";

import {
  enrolStudentAction,
  type StudentActionState,
} from "@/app/actions/student-management";
import { Button } from "@/components/ui/button";

const initialState: StudentActionState = { success: false, message: "" };

export function EnrolStudentForm({
  studentId,
  batches,
}: {
  studentId: string;
  batches: { id: string; label: string; available: number | null }[];
}) {
  const [state, action, pending] = useActionState(
    enrolStudentAction,
    initialState,
  );
  const input =
    "h-10 w-full rounded-[var(--radius-control)] border border-border bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/30";
  return (
    <form action={action} className="space-y-4">
      <input name="studentId" type="hidden" value={studentId} />
      {state.message ? (
        <p
          className={`rounded-xl p-3 text-sm ${state.success ? "bg-olive-100 text-olive-800" : "bg-red-50 text-red-800"}`}
        >
          {state.message}
        </p>
      ) : null}
      <label className="block space-y-1.5 text-xs font-semibold">
        <span>Batch</span>
        <select className={input} name="batchId" required>
          <option value="">Select batch</option>
          {batches.map((batch) => (
            <option
              disabled={batch.available === 0}
              key={batch.id}
              value={batch.id}
            >
              {batch.label} ·{" "}
              {batch.available === null
                ? "Unlimited"
                : `${batch.available} seats`}
            </option>
          ))}
        </select>
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="space-y-1.5 text-xs font-semibold">
          <span>Access starts</span>
          <input className={input} name="accessStartsAt" type="date" />
        </label>
        <label className="space-y-1.5 text-xs font-semibold">
          <span>Access expires</span>
          <input className={input} name="accessEndsAt" type="date" />
        </label>
      </div>
      <label className="block space-y-1.5 text-xs font-semibold">
        <span>Initial status</span>
        <select className={input} defaultValue="PENDING" name="status">
          <option value="PENDING">Pending</option>
          <option value="ACTIVE">Active</option>
        </select>
      </label>
      <label className="block space-y-1.5 text-xs font-semibold">
        <span>Administrative notes</span>
        <textarea className={`${input} min-h-20 py-2`} name="notes" />
      </label>
      <Button className="w-full" disabled={pending || !batches.length}>
        {pending ? "Enrolling…" : "Create enrolment"}
      </Button>
    </form>
  );
}
