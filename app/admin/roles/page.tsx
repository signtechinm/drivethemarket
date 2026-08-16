import { KeyRound } from "lucide-react";

import { CreateRoleForm } from "@/components/admin/create-role-form";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { permissions } from "@/lib/auth/constants";
import { requirePermission } from "@/lib/auth/session";
import { getDatabase } from "@/lib/db/client";

export default async function RolesPage() {
  await requirePermission(permissions.rolesManage);
  const database = getDatabase();
  const [roles, permissionOptions] = await Promise.all([
    database.role.findMany({
      include: {
        permissions: { include: { permission: true } },
        _count: { select: { users: true } },
      },
      orderBy: { name: "asc" },
    }),
    database.permission.findMany({ orderBy: { key: "asc" } }),
  ]);
  return (
    <main className="mx-auto max-w-7xl p-5 sm:p-8">
      <Badge variant="soft">Access policy</Badge>
      <h1 className="mt-4 text-3xl font-bold tracking-tight text-olive-950">
        Roles and permissions
      </h1>
      <p className="text-muted-foreground mt-2">
        Roles group granular server-enforced capabilities.
      </p>
      <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="grid gap-4 md:grid-cols-2">
          {roles.map((role) => (
            <Card key={role.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <span className="text-primary grid size-10 place-items-center rounded-xl bg-olive-100">
                    <KeyRound className="size-5" />
                  </span>
                  {role.system ? (
                    <Badge variant="neutral">System role</Badge>
                  ) : (
                    <Badge variant="outline">Custom</Badge>
                  )}
                </div>
                <CardTitle>{role.name}</CardTitle>
                <CardDescription>
                  {role.key} · {role._count.users} assigned users
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1.5">
                  {role.permissions.length ? (
                    role.permissions.map(({ permission }) => (
                      <Badge key={permission.id} variant="soft">
                        {permission.key}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-muted-foreground text-xs">
                      No permissions assigned
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <aside>
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Create custom role</CardTitle>
              <CardDescription>
                System roles remain protected from structural edits.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CreateRoleForm permissionOptions={permissionOptions} />
            </CardContent>
          </Card>
        </aside>
      </div>
    </main>
  );
}
