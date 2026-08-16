"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { permissions } from "@/lib/auth/constants";
import { requirePermission } from "@/lib/auth/session";
import { getDatabase } from "@/lib/db/client";

export interface RoleActionState {
  success: boolean;
  message: string;
}

const createRoleSchema = z.object({
  name: z.string().trim().min(2).max(60),
  key: z
    .string()
    .trim()
    .regex(/^[a-z][a-z0-9-]{1,39}$/),
  permissionIds: z.array(z.string()).min(1),
});

export async function createRoleAction(
  _state: RoleActionState,
  formData: FormData,
): Promise<RoleActionState> {
  const { user: actor } = await requirePermission(permissions.rolesManage);
  const parsed = createRoleSchema.safeParse({
    name: formData.get("name"),
    key: formData.get("key"),
    permissionIds: formData.getAll("permissionIds"),
  });
  if (!parsed.success)
    return {
      success: false,
      message: "Enter a valid role name, key, and at least one permission.",
    };

  const database = getDatabase();
  if (await database.role.findUnique({ where: { key: parsed.data.key } })) {
    return { success: false, message: "A role with this key already exists." };
  }

  const role = await database.$transaction(async (transaction) => {
    const created = await transaction.role.create({
      data: {
        name: parsed.data.name,
        key: parsed.data.key,
        permissions: {
          create: parsed.data.permissionIds.map((permissionId) => ({
            permissionId,
          })),
        },
      },
    });
    await transaction.auditLog.create({
      data: {
        actorId: actor.id,
        action: "role.created",
        entityType: "Role",
        entityId: created.id,
        metadata: { key: created.key },
      },
    });
    return created;
  });

  revalidatePath("/admin/roles");
  return { success: true, message: `${role.name} was created.` };
}
