"use server";

import { hash } from "bcryptjs";
import { redirect } from "next/navigation";
import { z } from "zod";

import { passwordSchema } from "@/lib/auth/password";
import {
  createOpaqueToken,
  expiresInMinutes,
  hashOpaqueToken,
  PASSWORD_RESET_TTL_MINUTES,
} from "@/lib/auth/tokens";
import { getDatabase } from "@/lib/db/client";
import { getServerEnvironment } from "@/lib/env/server";

export interface AuthLifecycleState {
  success: boolean;
  message: string;
  developmentUrl?: string;
}

const emailSchema = z
  .string()
  .trim()
  .email()
  .transform((value) => value.toLowerCase());

export async function requestPasswordResetAction(
  _state: AuthLifecycleState,
  formData: FormData,
): Promise<AuthLifecycleState> {
  const email = emailSchema.safeParse(formData.get("email"));
  const genericMessage =
    "If an active account exists, password-reset instructions are ready.";
  if (!email.success) return { success: true, message: genericMessage };

  const database = getDatabase();
  const user = await database.user.findUnique({ where: { email: email.data } });
  if (!user || user.status !== "ACTIVE")
    return { success: true, message: genericMessage };

  const { token, tokenHash } = createOpaqueToken();
  await database.$transaction([
    database.passwordResetToken.deleteMany({
      where: { userId: user.id, usedAt: null },
    }),
    database.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt: expiresInMinutes(PASSWORD_RESET_TTL_MINUTES),
      },
    }),
    database.auditLog.create({
      data: {
        action: "auth.password_reset_requested",
        entityType: "User",
        entityId: user.id,
      },
    }),
  ]);

  const resetUrl = `${getServerEnvironment().NEXT_PUBLIC_APP_URL}/reset-password/${token}`;
  return {
    success: true,
    message: genericMessage,
    developmentUrl:
      process.env.NODE_ENV === "production" ? undefined : resetUrl,
  };
}

const passwordFormSchema = z
  .object({
    token: z.string().min(20),
    password: passwordSchema,
    confirmation: z.string(),
  })
  .refine((input) => input.password === input.confirmation, {
    message: "Passwords do not match.",
    path: ["confirmation"],
  });

export async function resetPasswordAction(formData: FormData) {
  const input = passwordFormSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
    confirmation: formData.get("confirmation"),
  });
  if (!input.success)
    redirect(
      `/reset-password/${String(formData.get("token"))}?error=InvalidPassword`,
    );

  const database = getDatabase();
  const tokenHash = hashOpaqueToken(input.data.token);
  const resetToken = await database.passwordResetToken.findUnique({
    where: { tokenHash },
  });
  if (!resetToken || resetToken.usedAt || resetToken.expiresAt <= new Date())
    redirect("/login?error=InvalidResetToken");

  const passwordHash = await hash(input.data.password, 12);
  await database.$transaction([
    database.user.update({
      where: { id: resetToken.userId },
      data: { passwordHash },
    }),
    database.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { usedAt: new Date() },
    }),
    database.auditLog.create({
      data: {
        actorId: resetToken.userId,
        action: "auth.password_reset_completed",
        entityType: "User",
        entityId: resetToken.userId,
      },
    }),
  ]);
  redirect("/login?reset=complete");
}

export async function acceptInvitationAction(formData: FormData) {
  const input = passwordFormSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
    confirmation: formData.get("confirmation"),
  });
  if (!input.success)
    redirect(
      `/accept-invitation/${String(formData.get("token"))}?error=InvalidPassword`,
    );

  const database = getDatabase();
  const tokenHash = hashOpaqueToken(input.data.token);
  const invitation = await database.invitationToken.findUnique({
    where: { tokenHash },
  });
  if (!invitation || invitation.usedAt || invitation.expiresAt <= new Date())
    redirect("/login?error=InvalidInvitation");

  const passwordHash = await hash(input.data.password, 12);
  await database.$transaction([
    database.user.update({
      where: { id: invitation.userId },
      data: { passwordHash, status: "ACTIVE", emailVerifiedAt: new Date() },
    }),
    database.invitationToken.update({
      where: { id: invitation.id },
      data: { usedAt: new Date() },
    }),
    database.auditLog.create({
      data: {
        actorId: invitation.userId,
        action: "auth.invitation_accepted",
        entityType: "User",
        entityId: invitation.userId,
      },
    }),
  ]);
  redirect("/login?invited=accepted");
}
