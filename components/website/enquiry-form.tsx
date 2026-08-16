"use client";

import { useActionState, useRef } from "react";

import {
  submitWebsiteEnquiryAction,
  type WebsiteActionState,
} from "@/app/actions/website-management";
import { Button } from "@/components/ui/button";

const initialState: WebsiteActionState = { success: false, message: "" };

export function EnquiryForm({
  courses,
}: {
  courses: { id: string; title: string }[];
}) {
  const [state, action, pending] = useActionState(
    submitWebsiteEnquiryAction,
    initialState,
  );
  const startedAtRef = useRef<HTMLInputElement>(null);
  function markFormStarted() {
    if (startedAtRef.current && !startedAtRef.current.value)
      startedAtRef.current.value = String(Date.now());
  }
  const input =
    "h-11 w-full rounded-[var(--radius-control)] border border-border bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/30";
  return (
    <form
      action={action}
      className="space-y-4"
      onFocusCapture={markFormStarted}
      onPointerDown={markFormStarted}
    >
      <input name="startedAt" ref={startedAtRef} type="hidden" />
      <label className="absolute -left-[9999px]" aria-hidden="true">
        Website
        <input autoComplete="off" name="website" tabIndex={-1} />
      </label>
      {state.message ? (
        <p
          className={`rounded-xl p-3 text-sm ${state.success ? "bg-olive-100 text-olive-800" : "bg-red-50 text-red-800"}`}
          role="status"
        >
          {state.message}
        </p>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field className={input} label="Full name" name="name" required />
        <Field
          className={input}
          label="Email address"
          name="email"
          required
          type="email"
        />
        <Field className={input} label="Phone number" name="phone" type="tel" />
        <label className="space-y-1.5 text-xs font-semibold">
          <span>Course interest</span>
          <select className={input} name="courseId">
            <option value="">General enquiry</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label className="block space-y-1.5 text-xs font-semibold">
        <span>How can we help?</span>
        <textarea
          className={`${input} min-h-32 py-3`}
          name="message"
          required
        />
      </label>
      <Button disabled={pending} size="lg" type="submit">
        {pending ? "Sending…" : "Send enquiry"}
      </Button>
    </form>
  );
}

function Field({
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="space-y-1.5 text-xs font-semibold">
      <span>{label}</span>
      <input {...props} />
    </label>
  );
}
