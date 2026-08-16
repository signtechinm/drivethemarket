"use client";

import { useActionState } from "react";

import {
  createUserAction,
  type UserActionState,
} from "@/app/actions/user-management";
import { Button } from "@/components/ui/button";

interface RoleOption {
  id: string;
  name: string;
}
const initialState: UserActionState = { success: false, message: "" };

export function CreateUserForm({ roles }: { roles: RoleOption[] }) {
  const [state, action, pending] = useActionState(
    createUserAction,
    initialState,
  );
  const inputClass =
    "h-10 w-full rounded-[var(--radius-control)] border border-border bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/30";

  return (
    <form action={action} className="space-y-4">
      {state.message ? (
        <div
          className={`rounded-xl p-3 text-sm ${state.success ? "bg-olive-100 text-olive-800" : "bg-red-50 text-red-800"}`}
          role="status"
        >
          {state.message}
        </div>
      ) : null}
      {state.developmentInvitationUrl ? (
        <a
          className="text-primary block rounded-xl border border-olive-200 p-3 text-xs font-semibold break-all underline"
          href={state.developmentInvitationUrl}
        >
          Open development invitation
        </a>
      ) : null}
      <label className="block space-y-1.5 text-xs font-semibold">
        <span>Full name</span>
        <input className={inputClass} name="name" required />
      </label>
      <label className="block space-y-1.5 text-xs font-semibold">
        <span>Email</span>
        <input className={inputClass} name="email" required type="email" />
      </label>
      <label className="block space-y-1.5 text-xs font-semibold">
        <span>Initial role</span>
        <select className={inputClass} name="roleId" required>
          <option value="">Select a role</option>
          {roles.map((role) => (
            <option key={role.id} value={role.id}>
              {role.name}
            </option>
          ))}
        </select>
      </label>
      <Button className="w-full" disabled={pending} type="submit">
        {pending ? "Creating invitation…" : "Invite user"}
      </Button>
    </form>
  );
}
