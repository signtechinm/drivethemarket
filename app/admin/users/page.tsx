import { UserCog } from "lucide-react";

import {
  assignUserRoleAction,
  updateUserStatusAction,
} from "@/app/actions/user-management";
import { CreateUserForm } from "@/components/admin/create-user-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

export default async function UsersPage() {
  const { user: actor } = await requirePermission(permissions.usersManage);
  const database = getDatabase();
  const [users, roles] = await Promise.all([
    database.user.findMany({
      include: { roles: { include: { role: true } } },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    database.role.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <main className="mx-auto max-w-7xl p-5 sm:p-8">
      <Badge variant="soft">User administration</Badge>
      <h1 className="mt-4 text-3xl font-bold tracking-tight text-olive-950">
        Users and account status
      </h1>
      <p className="text-muted-foreground mt-2">
        Invite staff and students, assign roles, and suspend access.
      </p>
      <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_340px]">
        <Card>
          <CardHeader>
            <CardTitle>Accounts</CardTitle>
            <CardDescription>Latest 100 users</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {users.map((user) => (
              <article
                className="border-border rounded-xl border p-4"
                key={user.id}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex gap-3">
                    <span className="text-primary grid size-10 place-items-center rounded-full bg-olive-100 font-bold">
                      {user.name.slice(0, 2).toUpperCase()}
                    </span>
                    <div>
                      <p className="font-semibold text-olive-950">
                        {user.name}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {user.email}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {user.roles.map(({ role }) => (
                          <Badge key={role.id} variant="neutral">
                            {role.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <Badge
                    variant={
                      user.status === "ACTIVE"
                        ? "soft"
                        : user.status === "INVITED"
                          ? "warning"
                          : "destructive"
                    }
                  >
                    {user.status}
                  </Badge>
                </div>
                {user.id !== actor.id ? (
                  <div className="border-border mt-4 flex flex-wrap gap-2 border-t pt-3">
                    <form action={updateUserStatusAction}>
                      <input name="userId" type="hidden" value={user.id} />
                      <input
                        name="status"
                        type="hidden"
                        value={
                          user.status === "SUSPENDED" ? "ACTIVE" : "SUSPENDED"
                        }
                      />
                      <Button size="sm" type="submit" variant="outline">
                        {user.status === "SUSPENDED" ? "Reactivate" : "Suspend"}
                      </Button>
                    </form>
                    <form action={assignUserRoleAction} className="flex gap-2">
                      <input name="userId" type="hidden" value={user.id} />
                      <select
                        className="border-border h-9 rounded-lg border bg-white px-2 text-xs"
                        name="roleId"
                        required
                      >
                        <option value="">Add role…</option>
                        {roles
                          .filter(
                            (role) =>
                              !user.roles.some(
                                (assigned) => assigned.roleId === role.id,
                              ),
                          )
                          .map((role) => (
                            <option key={role.id} value={role.id}>
                              {role.name}
                            </option>
                          ))}
                      </select>
                      <Button size="sm" type="submit" variant="outline">
                        Assign
                      </Button>
                    </form>
                  </div>
                ) : (
                  <p className="text-muted-foreground mt-3 text-xs">
                    Current account cannot suspend itself.
                  </p>
                )}
              </article>
            ))}
          </CardContent>
        </Card>
        <aside>
          <Card className="sticky top-24">
            <CardHeader>
              <span className="text-primary grid size-10 place-items-center rounded-xl bg-olive-100">
                <UserCog className="size-5" />
              </span>
              <CardTitle>Invite a user</CardTitle>
              <CardDescription>
                The invitation expires after 72 hours.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CreateUserForm
                roles={roles.map(({ id, name }) => ({ id, name }))}
              />
            </CardContent>
          </Card>
        </aside>
      </div>
    </main>
  );
}
