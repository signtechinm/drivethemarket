import { BookLock, FolderOpen } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { permissions } from "@/lib/auth/constants";
import { requireAnyPermission } from "@/lib/auth/session";
import { getDatabase } from "@/lib/db/client";

export default async function MaterialsPage() {
  await requireAnyPermission([
    permissions.materialsManage,
    permissions.materialsApprove,
    permissions.materialsRelease,
  ]);
  const batches = await getDatabase().batch.findMany({
    where: { status: { in: ["ACTIVE", "ENROLLING"] } },
    include: {
      course: true,
      modules: {
        include: {
          classes: {
            include: { _count: { select: { materials: true } } },
            orderBy: { position: "asc" },
          },
        },
        orderBy: { position: "asc" },
      },
    },
    orderBy: { startsAt: "desc" },
  });
  return (
    <main className="mx-auto max-w-7xl p-5 sm:p-8">
      <Badge variant="soft">Protected content operations</Badge>
      <h1 className="mt-4 text-3xl font-bold text-olive-950">
        Materials and recordings
      </h1>
      <p className="text-muted-foreground mt-2">
        Prepare content before class while keeping every resource locked from
        students.
      </p>
      <div className="mt-8 space-y-5">
        {batches.map((batch) => (
          <Card key={batch.id}>
            <CardHeader>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <CardTitle>{batch.name}</CardTitle>
                  <p className="text-muted-foreground text-xs">
                    {batch.code} · {batch.course.title}
                  </p>
                </div>
                <Badge variant={batch.status === "ACTIVE" ? "soft" : "neutral"}>
                  {batch.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              {batch.modules.flatMap((module) =>
                module.classes.map((session) => (
                  <div
                    className="border-border flex items-center gap-3 rounded-xl border p-4"
                    key={session.id}
                  >
                    <span className="text-primary grid size-10 place-items-center rounded-xl bg-olive-100">
                      <FolderOpen className="size-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">{session.title}</p>
                      <p className="text-muted-foreground text-xs">
                        {module.title} · {session._count.materials} resources ·{" "}
                        {session.status}
                      </p>
                    </div>
                    <Link
                      className={buttonVariants({
                        size: "sm",
                        variant: "outline",
                      })}
                      href={`/admin/classes/${session.id}/materials`}
                    >
                      Manage
                    </Link>
                  </div>
                )),
              )}
            </CardContent>
          </Card>
        ))}
        {!batches.length ? (
          <Card>
            <CardContent className="p-12 text-center">
              <BookLock className="text-primary mx-auto size-9" />
              <p className="text-muted-foreground mt-3 text-sm">
                No active batches are ready for materials.
              </p>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </main>
  );
}
