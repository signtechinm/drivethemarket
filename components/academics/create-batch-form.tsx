"use client";

import { useActionState, useState } from "react";

import {
  createBatchAction,
  type BatchActionState,
} from "@/app/actions/batch-management";
import { Button } from "@/components/ui/button";

interface SyllabusOption {
  id: string;
  title: string;
  version: number;
  courseId: string;
  courseTitle: string;
}
interface InstructorOption {
  id: string;
  name: string;
}
const initialState: BatchActionState = { success: false, message: "" };

export function CreateBatchForm({
  syllabuses,
  instructors,
}: {
  syllabuses: SyllabusOption[];
  instructors: InstructorOption[];
}) {
  const [state, action, pending] = useActionState(
    createBatchAction,
    initialState,
  );
  const [courseId, setCourseId] = useState("");
  const input =
    "h-10 w-full rounded-[var(--radius-control)] border border-border bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/30";
  const courses = [
    ...new Map(
      syllabuses.map((item) => [item.courseId, item.courseTitle]),
    ).entries(),
  ];
  return (
    <form action={action} className="space-y-4">
      {state.message ? (
        <div
          className={`rounded-xl p-3 text-sm ${state.success ? "bg-olive-100 text-olive-800" : "bg-red-50 text-red-800"}`}
        >
          {state.message}
          {state.batchId ? (
            <a
              className="mt-2 block font-semibold underline"
              href={`/admin/batches/${state.batchId}`}
            >
              Open batch planner
            </a>
          ) : null}
        </div>
      ) : null}
      <label className="block space-y-1.5 text-xs font-semibold">
        <span>Course</span>
        <select
          className={input}
          name="courseId"
          onChange={(event) => setCourseId(event.target.value)}
          required
          value={courseId}
        >
          <option value="">Select course</option>
          {courses.map(([id, title]) => (
            <option key={id} value={id}>
              {title}
            </option>
          ))}
        </select>
      </label>
      <label className="block space-y-1.5 text-xs font-semibold">
        <span>Published syllabus</span>
        <select
          className={input}
          disabled={!courseId}
          name="syllabusId"
          required
        >
          <option value="">Select syllabus</option>
          {syllabuses
            .filter((item) => item.courseId === courseId)
            .map((item) => (
              <option key={item.id} value={item.id}>
                {item.title} · v{item.version}
              </option>
            ))}
        </select>
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="block space-y-1.5 text-xs font-semibold">
          <span>Batch code</span>
          <input className={input} name="code" required />
        </label>
        <label className="block space-y-1.5 text-xs font-semibold">
          <span>Capacity</span>
          <input
            className={input}
            min="1"
            name="capacity"
            required
            type="number"
          />
        </label>
      </div>
      <label className="block space-y-1.5 text-xs font-semibold">
        <span>Batch name</span>
        <input className={input} name="name" required />
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="block space-y-1.5 text-xs font-semibold">
          <span>Start date</span>
          <input className={input} name="startsAt" required type="date" />
        </label>
        <label className="block space-y-1.5 text-xs font-semibold">
          <span>End date</span>
          <input className={input} name="endsAt" required type="date" />
        </label>
      </div>
      <label className="block space-y-1.5 text-xs font-semibold">
        <span>Primary instructor</span>
        <select className={input} name="instructorId">
          <option value="">Assign later</option>
          {instructors.map((instructor) => (
            <option key={instructor.id} value={instructor.id}>
              {instructor.name}
            </option>
          ))}
        </select>
      </label>
      <Button className="w-full" disabled={pending} type="submit">
        {pending ? "Cloning syllabus…" : "Create batch"}
      </Button>
    </form>
  );
}
