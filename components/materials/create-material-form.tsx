"use client";

import { useActionState, useState } from "react";

import {
  createMaterialAction,
  type MaterialActionState,
} from "@/app/actions/material-management";
import { Button } from "@/components/ui/button";

const initialState: MaterialActionState = { success: false, message: "" };

export function CreateMaterialForm({
  classId,
}: {
  classId: string;
}) {
  const [state, action, pending] = useActionState(
    createMaterialAction,
    initialState,
  );
  const [type, setType] = useState("DOCUMENT");
  const input =
    "h-10 w-full rounded-[var(--radius-control)] border border-border bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/30";

  return (
    <form action={action} className="space-y-4">
      <input name="classId" type="hidden" value={classId} />
      {state.message ? (
        <p
          className={`rounded-xl p-3 text-sm ${state.success ? "bg-olive-100 text-olive-800" : "bg-red-50 text-red-800"}`}
          role="status"
        >
          {state.message}
        </p>
      ) : null}
      <label className="block space-y-1.5 text-xs font-semibold">
        <span>Title</span>
        <input className={input} name="title" required />
      </label>
      <label className="block space-y-1.5 text-xs font-semibold">
        <span>Type</span>
        <select
          className={input}
          name="type"
          onChange={(event) => setType(event.target.value)}
          value={type}
        >
          <option value="DOCUMENT">PDF document</option>
          <option value="PRESENTATION">Presentation</option>
          <option value="IMAGE">Image</option>
          <option value="WORKSHEET">Worksheet</option>
          <option value="ASSIGNMENT">Assignment</option>
          <option value="VIDEO">Recorded video</option>
          <option value="DOWNLOAD">Supplementary download</option>
          <option value="EXTERNAL_LINK">External link</option>
        </select>
      </label>
      {type === "EXTERNAL_LINK" ? (
        <label className="block space-y-1.5 text-xs font-semibold">
          <span>External URL</span>
          <input className={input} name="externalUrl" required type="url" />
        </label>
      ) : (
        <label className="block space-y-1.5 text-xs font-semibold">
          <span>Material file</span>
          <input
            accept={type === "VIDEO" ? "video/mp4,video/webm" : undefined}
            className="border-border block w-full rounded-xl border bg-white p-2 text-sm"
            name="file"
            required
            type="file"
          />
          <span className="text-muted-foreground block font-normal">
            Documents: 20 MB maximum. Videos: 250 MB maximum.
          </span>
        </label>
      )}
      <label className="block space-y-1.5 text-xs font-semibold">
        <span>Description</span>
        <textarea className={`${input} min-h-20 py-2`} name="description" />
      </label>
      <div className="flex flex-wrap gap-4 text-xs">
        <label className="flex items-center gap-2">
          <input defaultChecked name="required" type="checkbox" /> Required
        </label>
        <label className="flex items-center gap-2">
          <input name="downloadAllowed" type="checkbox" /> Allow download
        </label>
      </div>
      <Button className="w-full" disabled={pending} type="submit">
        {pending ? "Uploading and saving…" : "Save draft material"}
      </Button>
    </form>
  );
}
