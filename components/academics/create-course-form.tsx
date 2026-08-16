"use client";

import { useActionState } from "react";

import {
  createCourseAction,
  type CourseActionState,
} from "@/app/actions/course-management";
import { Button } from "@/components/ui/button";

const initialState: CourseActionState = { success: false, message: "" };

export function CreateCourseForm() {
  const [state, action, pending] = useActionState(
    createCourseAction,
    initialState,
  );
  const input =
    "h-10 w-full rounded-[var(--radius-control)] border border-border bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/30";
  return (
    <form action={action} className="space-y-4">
      {state.message ? (
        <div
          className={`rounded-xl p-3 text-sm ${state.success ? "bg-olive-100 text-olive-800" : "bg-red-50 text-red-800"}`}
        >
          {state.message}
        </div>
      ) : null}
      <label className="block space-y-1.5 text-xs font-semibold">
        <span>Course code</span>
        <input className={input} name="code" placeholder="TA-ADV" required />
      </label>
      <label className="block space-y-1.5 text-xs font-semibold">
        <span>Course title</span>
        <input className={input} name="title" required />
      </label>
      <label className="block space-y-1.5 text-xs font-semibold">
        <span>URL slug</span>
        <input
          className={input}
          name="slug"
          pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
          placeholder="advanced-technical-analysis"
          required
        />
      </label>
      <label className="block space-y-1.5 text-xs font-semibold">
        <span>Description</span>
        <textarea
          className="border-border min-h-24 w-full rounded-[var(--radius-control)] border bg-white p-3 text-sm"
          name="description"
        />
      </label>
      <Button className="w-full" disabled={pending} type="submit">
        {pending ? "Creating course…" : "Create course"}
      </Button>
    </form>
  );
}
