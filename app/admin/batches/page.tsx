import { CalendarRange, Users } from "lucide-react";
import Link from "next/link";

import { updateBatchStatusAction } from "@/app/actions/batch-management";
import { CreateBatchForm } from "@/components/academics/create-batch-form";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
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

export default async function BatchesPage() {
  await requirePermission(permissions.batchesManage);
  const database = getDatabase();
  const [batches, syllabuses, instructors] = await Promise.all([
    database.batch.findMany({
      include: {
        course: true,
        _count: { select: { enrolments: true, modules: true } },
      },
      orderBy: { startsAt: "desc" },
    }),
    database.syllabusTemplate.findMany({
      where: { publishedAt: { not: null }, course: { active: true } },
      include: { course: true },
      orderBy: [{ course: { title: "asc" } }, { version: "desc" }],
    }),
    database.user.findMany({
      where: {
        status: "ACTIVE",
        roles: { some: { role: { key: "instructor" } } },
      },
      orderBy: { name: "asc" },
    }),
  ]);
  return (
    <main className="mx-auto max-w-7xl p-5 sm:p-8">
      <Badge variant="soft">Course delivery</Badge>
      <h1 className="mt-4 text-3xl font-bold tracking-tight text-olive-950">
        Batches and schedules
      </h1>
      <p className="text-muted-foreground mt-2">
        Every batch receives an independent, editable copy of its published
        syllabus.
      </p>
      <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="grid gap-4 md:grid-cols-2">
          {batches.map((batch) => (
            <Card key={batch.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <span className="text-primary grid size-10 place-items-center rounded-xl bg-olive-100">
                    <CalendarRange className="size-5" />
                  </span>
                  <Badge
                    variant={
                      batch.status === "ACTIVE"
                        ? "soft"
                        : batch.status === "ENROLLING"
                          ? "warning"
                          : "neutral"
                    }
                  >
                    {batch.status}
                  </Badge>
                </div>
                <CardTitle>{batch.name}</CardTitle>
                <CardDescription>
                  {batch.code} · {batch.course.title}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-silver-50 grid grid-cols-3 gap-3 rounded-xl p-3 text-center text-xs">
                  <span>
                    <strong className="text-foreground block text-base">
                      {batch._count.enrolments}
                    </strong>
                    Students
                  </span>
                  <span>
                    <strong className="text-foreground block text-base">
                      {batch._count.modules}
                    </strong>
                    Modules
                  </span>
                  <span>
                    <strong className="text-foreground block text-base">
                      {batch.capacity ?? "—"}
                    </strong>
                    Capacity
                  </span>
                </div>
                <p className="text-muted-foreground mt-4 text-xs">
                  {batch.startsAt.toLocaleDateString("en-IN")} –{" "}
                  {batch.endsAt?.toLocaleDateString("en-IN") ?? "Open ended"}
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Link
                    className={buttonVariants({ size: "sm" })}
                    href={`/admin/batches/${batch.id}`}
                  >
                    Open planner
                  </Link>
                  {batch.status === "DRAFT" ? (
                    <form action={updateBatchStatusAction}>
                      <input name="batchId" type="hidden" value={batch.id} />
                      <input name="status" type="hidden" value="ENROLLING" />
                      <Button size="sm" type="submit" variant="outline">
                        Open enrolment
                      </Button>
                    </form>
                  ) : null}
                  {batch.status === "ENROLLING" ? (
                    <form action={updateBatchStatusAction}>
                      <input name="batchId" type="hidden" value={batch.id} />
                      <input name="status" type="hidden" value="ACTIVE" />
                      <Button size="sm" type="submit" variant="outline">
                        Activate
                      </Button>
                    </form>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          ))}
          {!batches.length ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Users className="text-primary mx-auto size-9" />
                <p className="text-muted-foreground mt-4 text-sm">
                  Create the first batch from a published syllabus.
                </p>
              </CardContent>
            </Card>
          ) : null}
        </div>
        <aside>
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Create batch</CardTitle>
              <CardDescription>
                Published syllabus content is cloned during creation.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {syllabuses.length ? (
                <CreateBatchForm
                  instructors={instructors.map(({ id, name }) => ({
                    id,
                    name,
                  }))}
                  syllabuses={syllabuses.map((item) => ({
                    id: item.id,
                    title: item.title,
                    version: item.version,
                    courseId: item.courseId,
                    courseTitle: item.course.title,
                  }))}
                />
              ) : (
                <p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
                  Publish at least one course syllabus before creating a batch.
                </p>
              )}
            </CardContent>
          </Card>
        </aside>
      </div>
    </main>
  );
}
