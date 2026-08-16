"use client";

import { useActionState } from "react";

import {
  releaseMaterialAction,
  relockMaterialAction,
  type MaterialActionState,
} from "@/app/actions/material-management";
import { Button } from "@/components/ui/button";

const initialState: MaterialActionState = { success: false, message: "" };

export function ReleaseMaterialControl({
  materialId,
  classId,
}: {
  materialId: string;
  classId: string;
}) {
  const [state, action, pending] = useActionState(
    releaseMaterialAction,
    initialState,
  );
  return (
    <form action={action} className="space-y-2">
      <input name="materialId" type="hidden" value={materialId} />
      <input name="classId" type="hidden" value={classId} />
      <Button disabled={pending} size="sm">
        {pending ? "Releasing…" : "Release to students"}
      </Button>
      {state.message ? <p className="text-xs">{state.message}</p> : null}
    </form>
  );
}

export function RelockMaterialControl({
  materialId,
  classId,
}: {
  materialId: string;
  classId: string;
}) {
  const [state, action, pending] = useActionState(
    relockMaterialAction,
    initialState,
  );
  return (
    <form action={action} className="flex flex-wrap items-start gap-2">
      <input name="materialId" type="hidden" value={materialId} />
      <input name="classId" type="hidden" value={classId} />
      <input
        className="border-border h-9 min-w-52 rounded-lg border px-3 text-xs"
        name="reason"
        placeholder="Required re-lock reason"
        required
      />
      <Button disabled={pending} size="sm" type="submit" variant="destructive">
        {pending ? "Re-locking…" : "Emergency re-lock"}
      </Button>
      {state.message ? <p className="w-full text-xs">{state.message}</p> : null}
    </form>
  );
}
