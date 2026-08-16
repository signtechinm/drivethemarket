import type { PermissionKey } from "@/lib/auth/constants";

export function hasPermission(
  permissionKeys: readonly string[],
  permission: PermissionKey,
) {
  return permissionKeys.includes(permission);
}

export function canAccessAdministration(roleKeys: readonly string[]) {
  return (
    roleKeys.length > 0 &&
    !(roleKeys.length === 1 && roleKeys.includes("student"))
  );
}
