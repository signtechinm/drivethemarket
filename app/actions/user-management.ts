"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { permissions } from "@/lib/auth/constants";
import { requirePermission } from "@/lib/auth/session";
import {
  createOpaqueToken,
  expiresInHours,
  INVITATION_TTL_HOURS,
} from "@/lib/auth/tokens";
import { getDatabase } from "@/lib/db/client";
import { getServerEnvironment } from "@/lib/env/server";
import {
  deliverPendingEmails,
  queueNotifications,
} from "@/lib/communications/notification-service";

export interface UserActionState {
  success: boolean;
  message: string;
  developmentInvitationUrl?: string;
}

const createUserSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z
    .string()
    .trim()
    .email()
    .transform((value) => value.toLowerCase()),
  roleId: z.string().min(1),
});

export async function createUserAction(
  _state: UserActionState,
  formData: FormData,
): Promise<UserActionState> {
  const { user: actor } = await requirePermission(permissions.usersManage);
  const parsed = createUserSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    roleId: formData.get("roleId"),
  });
  if (!parsed.success)
    return { success: false, message: "Enter a valid name, email, and role." };

  const database = getDatabase();
  const existingUser = await database.user.findUnique({
    where: { email: parsed.data.email },
  });
  if (existingUser)
    return {
      success: false,
      message: "A user with this email already exists.",
    };

  const role = await database.role.findUnique({
    where: { id: parsed.data.roleId },
  });
  if (!role)
    return { success: false, message: "The selected role no longer exists." };

  const { token, tokenHash } = createOpaqueToken();
  const createdUser = await database.$transaction(async (transaction) => {
    const user = await transaction.user.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        status: "INVITED",
        invitedAt: new Date(),
        roles: { create: { roleId: role.id } },
        invitationTokens: {
          create: {
            tokenHash,
            expiresAt: expiresInHours(INVITATION_TTL_HOURS),
          },
        },
      },
    });
    await transaction.auditLog.create({
      data: {
        actorId: actor.id,
        action: "user.invited",
        entityType: "User",
        entityId: user.id,
        metadata: { role: role.key },
      },
    });
    return user;
  });

  revalidatePath("/admin/users");
  await queueNotifications({
    userIds: [createdUser.id],
    eventKey: "account_invitation",
    subject: "Your Drive the Market account invitation",
    body: "Your account has been created. Use the invitation link to set your password.",
    relatedEntityType: "User",
    relatedEntityId: createdUser.id,
    mandatory: true,
  });
  const delivery = await deliverPendingEmails(1, {
    userIds: [createdUser.id],
    eventKeys: ["account_invitation"],
  });
  const mailerIsLive = getServerEnvironment().EMAIL_PROVIDER !== "log";
  const invitationUrl = `${getServerEnvironment().NEXT_PUBLIC_APP_URL}/accept-invitation/${token}`;
  return {
    success: true,
    message:
      delivery.sent > 0
        ? mailerIsLive
          ? `${createdUser.name} was invited as ${role.name} and the email was sent.`
          : `${createdUser.name} was invited as ${role.name}. The development mailer logged the invitation.`
        : `${createdUser.name} was invited as ${role.name}, but email delivery failed. Retry it from Communications.`,
    developmentInvitationUrl:
      process.env.NODE_ENV === "production" ? undefined : invitationUrl,
  };
}

const statusSchema = z.object({
  userId: z.string().min(1),
  status: z.enum(["ACTIVE", "SUSPENDED", "DEACTIVATED"]),
});

export async function updateUserStatusAction(formData: FormData) {
  const { user: actor } = await requirePermission(permissions.usersManage);
  const parsed = statusSchema.safeParse({
    userId: formData.get("userId"),
    status: formData.get("status"),
  });
  if (!parsed.success || parsed.data.userId === actor.id) return;

  await getDatabase().$transaction([
    getDatabase().user.update({
      where: { id: parsed.data.userId },
      data: { status: parsed.data.status },
    }),
    getDatabase().auditLog.create({
      data: {
        actorId: actor.id,
        action: "user.status_changed",
        entityType: "User",
        entityId: parsed.data.userId,
        metadata: { status: parsed.data.status },
      },
    }),
  ]);
  revalidatePath("/admin/users");
}

const assignmentSchema = z.object({
  userId: z.string().min(1),
  roleId: z.string().min(1),
});

export async function assignUserRoleAction(formData: FormData) {
  const { user: actor } = await requirePermission(permissions.rolesManage);
  const parsed = assignmentSchema.safeParse({
    userId: formData.get("userId"),
    roleId: formData.get("roleId"),
  });
  if (!parsed.success) return;

  await getDatabase().$transaction([
    getDatabase().userRole.upsert({
      where: { userId_roleId: parsed.data },
      update: {},
      create: parsed.data,
    }),
    getDatabase().auditLog.create({
      data: {
        actorId: actor.id,
        action: "user.role_assigned",
        entityType: "User",
        entityId: parsed.data.userId,
        metadata: { roleId: parsed.data.roleId },
      },
    }),
  ]);
  revalidatePath("/admin/users");
}
