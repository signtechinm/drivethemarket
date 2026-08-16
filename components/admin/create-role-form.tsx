"use client";

import { useActionState } from "react";

import {
  createRoleAction,
  type RoleActionState,
} from "@/app/actions/role-management";
import { Button } from "@/components/ui/button";

interface PermissionOption {
  id: string;
  key: string;
  description: string;
}
const initialState: RoleActionState = { success: false, message: "" };

export function CreateRoleForm({
  permissionOptions,
}: {
  permissionOptions: PermissionOption[];
}) {
  const [state, action, pending] = useActionState(
    createRoleAction,
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
      <label className="block space-y-1.5 text-xs font-semibold">
        <span>Role name</span>
        <input className={inputClass} name="name" required />
      </label>
      <label className="block space-y-1.5 text-xs font-semibold">
        <span>Role key</span>
        <input
          className={inputClass}
          name="key"
          pattern="[a-z][a-z0-9-]+"
          placeholder="support-coordinator"
          required
        />
      </label>
      <fieldset>
        <legend className="mb-2 text-xs font-semibold">Permissions</legend>
        <div className="border-border max-h-64 space-y-2 overflow-auto rounded-xl border p-3">
          {permissionOptions.map((permission) => (
            <label className="flex gap-2 text-xs" key={permission.id}>
              <input
                className="accent-primary"
                name="permissionIds"
                type="checkbox"
                value={permission.id}
              />
              <span>
                <strong className="block">{permission.key}</strong>
                <span className="text-muted-foreground">
                  {permission.description}
                </span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <Button className="w-full" disabled={pending} type="submit">
        {pending ? "Creating role…" : "Create role"}
      </Button>
    </form>
  );
}
