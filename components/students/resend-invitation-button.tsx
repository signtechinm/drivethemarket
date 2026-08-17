"use client";

import { Send } from "lucide-react";
import { useActionState } from "react";

import {
  resendStudentInvitationAction,
  type InvitationActionState,
} from "@/app/actions/student-management";
import { Button } from "@/components/ui/button";

const initialState: InvitationActionState = { success: false, message: "" };

export function ResendInvitationButton({ studentId }: { studentId: string }) {
  const [state, action, pending] = useActionState(
    resendStudentInvitationAction,
    initialState,
  );

  return (
    <div className="flex flex-col items-end gap-2">
      <form action={action}>
        <input name="studentId" type="hidden" value={studentId} />
        <Button disabled={pending} size="sm" type="submit" variant="outline">
          <Send className="size-4" />
          {pending ? "Sending…" : "Resend invitation"}
        </Button>
      </form>
      {state.message ? (
        <p
          className={`max-w-72 text-right text-xs font-medium ${state.success ? "text-olive-700" : "text-red-700"}`}
          role="status"
        >
          {state.message}
        </p>
      ) : null}
    </div>
  );
}
