"use client";

import { useActionState } from "react";

import {
  createStudentAction,
  type StudentActionState,
} from "@/app/actions/student-management";
import { Button } from "@/components/ui/button";

const initialState: StudentActionState = { success: false, message: "" };
const input =
  "h-10 w-full rounded-[var(--radius-control)] border border-border bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/30";

export function CreateStudentForm() {
  const [state, action, pending] = useActionState(
    createStudentAction,
    initialState,
  );
  return (
    <form action={action} className="space-y-4">
      {state.message ? (
        <p
          className={`rounded-xl p-3 text-sm ${state.success ? "bg-olive-100 text-olive-800" : "bg-red-50 text-red-800"}`}
          role="status"
        >
          {state.message}
        </p>
      ) : null}
      {state.developmentInvitationUrl ? (
        <a
          className="text-primary block rounded-xl border border-olive-200 p-3 text-xs font-semibold break-all underline"
          href={state.developmentInvitationUrl}
        >
          Open development invitation
        </a>
      ) : null}
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Full name" name="name" required />
        <Field label="Student number" name="studentNumber" required />
        <Field label="Email" name="email" required type="email" />
        <Field label="Phone" name="phone" type="tel" />
        <Field label="Date of birth" name="dateOfBirth" type="date" />
        <Field label="Emergency contact" name="emergencyName" />
        <Field label="Emergency phone" name="emergencyPhone" type="tel" />
      </div>
      <label className="block space-y-1.5 text-xs font-semibold">
        <span>Address</span>
        <textarea className={`${input} min-h-20 py-2`} name="address" />
      </label>
      <Button className="w-full" disabled={pending} type="submit">
        {pending ? "Registering…" : "Register and invite student"}
      </Button>
    </form>
  );
}

function Field({
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="block space-y-1.5 text-xs font-semibold">
      <span>{label}</span>
      <input className={input} {...props} />
    </label>
  );
}
