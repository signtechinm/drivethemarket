import "server-only";

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth/options";
import type { PermissionKey } from "@/lib/auth/constants";
import { getDatabase } from "@/lib/db/client";

export async function getCurrentSession() {
  return getServerSession(authOptions);
}

export async function requireActiveUser(callbackUrl?: string) {
  const session = await getCurrentSession();
  const loginUrl = callbackUrl
    ? `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`
    : "/login";
  if (!session?.user?.id) redirect(loginUrl);

  const user = await getDatabase().user.findUnique({
    where: { id: session.user.id },
    select: { id: true, email: true, name: true, status: true },
  });

  if (!user || user.status !== "ACTIVE")
    redirect(
      `${loginUrl}${loginUrl.includes("?") ? "&" : "?"}error=AccountInactive`,
    );
  return { session, user };
}

export async function requirePermission(permission: PermissionKey) {
  const { session, user } = await requireActiveUser();
  if (!session.user.permissionKeys.includes(permission))
    redirect("/unauthorized");
  return { session, user };
}

export async function requireAnyPermission(required: PermissionKey[]) {
  const { session, user } = await requireActiveUser();
  if (
    !required.some((permission) =>
      session.user.permissionKeys.includes(permission),
    )
  )
    redirect("/unauthorized");
  return { session, user };
}
