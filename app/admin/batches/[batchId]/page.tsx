import { ArrowLeft, CalendarClock, Link2, UserRound } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  scheduleClassAction,
  updateBatchStatusAction,
  updateClassStatusAction,
} from "@/app/actions/batch-management";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { permissions } from "@/lib/auth/constants";
import { requirePermission } from "@/lib/auth/session";
import { getDatabase } from "@/lib/db/client";

interface BatchDetailPageProps {
  params: Promise<{ batchId: string }>;
}

export default async function BatchDetailPage({
  params,
}: BatchDetailPageProps) {
  await requirePermission(permissions.batchesManage);
  const { batchId } = await params;
  const database = getDatabase();
  const [batch, instructors] = await Promise.all([
    database.batch.findUnique({
      where: { id: batchId },
      include: {
        course: true,
        instructors: { include: { user: true } },
        enrolments: { where: { status: "ACTIVE" }, select: { id: true } },
        modules: {
          include: {
            classes: {
              include: {
                instructor: true,
                _count: { select: { materials: true } },
              },
              orderBy: { position: "asc" },
            },
          },
          orderBy: { position: "asc" },
        },
      },
    }),
    database.user.findMany({
      where: {
        status: "ACTIVE",
        roles: { some: { role: { key: "instructor" } } },
      },
      orderBy: { name: "asc" },
    }),
  ]);
  if (!batch) notFound();
  const classCount = batch.modules.reduce(
    (total, module) => total + module.classes.length,
    0,
  );
  const scheduledCount = batch.modules.reduce(
    (total, module) =>
      total + module.classes.filter((session) => session.scheduledAt).length,
    0,
  );
  const input = "h-9 rounded-lg border border-border bg-white px-2 text-xs";
  return (
    <main className="mx-auto max-w-7xl p-5 sm:p-8">
      <Link
        className="text-primary inline-flex items-center gap-2 text-sm font-semibold"
        href="/admin/batches"
      >
        <ArrowLeft className="size-4" />
        Batches
      </Link>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex gap-2">
            <Badge variant="soft">{batch.code}</Badge>
            <Badge variant={batch.status === "ACTIVE" ? "soft" : "neutral"}>
              {batch.status}
            </Badge>
          </div>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-olive-950">
            {batch.name}
          </h1>
          <p className="text-muted-foreground mt-2">
            {batch.course.title} · {batch.enrolments.length} active students
          </p>
        </div>
        <form action={updateBatchStatusAction} className="flex gap-2">
          <input name="batchId" type="hidden" value={batch.id} />
          <select className={input} defaultValue={batch.status} name="status">
            <option>DRAFT</option>
            <option>ENROLLING</option>
            <option>ACTIVE</option>
            <option>COMPLETED</option>
            <option>ARCHIVED</option>
          </select>
          <Button size="sm" type="submit">
            Update batch
          </Button>
        </form>
      </div>
      <div className="mt-7 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3 p-5">
            <CalendarClock className="text-primary size-5" />
            <div>
              <p className="text-muted-foreground text-xs">Scheduled</p>
              <p className="font-bold">
                {scheduledCount} / {classCount} classes
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-5">
            <UserRound className="text-primary size-5" />
            <div>
              <p className="text-muted-foreground text-xs">Batch instructors</p>
              <p className="font-bold">
                {batch.instructors.length || "Not assigned"}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-5">
            <Link2 className="text-primary size-5" />
            <div>
              <p className="text-muted-foreground text-xs">
                External class delivery
              </p>
              <p className="font-bold">Managed per session</p>
            </div>
          </CardContent>
        </Card>
      </div>
      <section className="mt-6 space-y-4">
        {batch.modules.map((module) => (
          <Card key={module.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-primary text-xs font-bold">
                    MODULE {module.position}
                  </p>
                  <CardTitle>{module.title}</CardTitle>
                </div>
                <Badge variant="neutral">{module.classes.length} classes</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {module.classes.map((session) => (
                <article
                  className="border-border rounded-xl border p-4"
                  key={session.id}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex gap-3">
                      <span className="bg-silver-100 grid size-9 place-items-center rounded-lg text-xs font-bold">
                        {String(session.position).padStart(2, "0")}
                      </span>
                      <div>
                        <p className="font-semibold">{session.title}</p>
                        <p className="text-muted-foreground text-xs">
                          {session.scheduledAt
                            ? session.scheduledAt.toLocaleString("en-IN")
                            : "Not scheduled"}{" "}
                          ·{" "}
                          {session.instructor?.name ?? "Instructor unassigned"}{" "}
                          · {session._count.materials} resources
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={
                        session.status === "SCHEDULED"
                          ? "outline"
                          : session.status === "CANCELLED"
                            ? "destructive"
                            : "neutral"
                      }
                    >
                      {session.status}
                    </Badge>
                  </div>
                  <div className="border-border mt-4 grid gap-2 border-t pt-3 lg:grid-cols-[1fr_180px_1fr_auto]">
                    <form action={scheduleClassAction} className="contents">
                      <input name="classId" type="hidden" value={session.id} />
                      <input name="batchId" type="hidden" value={batch.id} />
                      <input
                        className={input}
                        defaultValue={session.scheduledAt
                          ?.toISOString()
                          .slice(0, 16)}
                        name="scheduledAt"
                        required
                        type="datetime-local"
                      />
                      <select
                        className={input}
                        defaultValue={session.instructorId ?? ""}
                        name="instructorId"
                      >
                        <option value="">No instructor</option>
                        {instructors.map((instructor) => (
                          <option key={instructor.id} value={instructor.id}>
                            {instructor.name}
                          </option>
                        ))}
                      </select>
                      <input
                        className={input}
                        defaultValue={session.liveClassUrl ?? ""}
                        name="liveClassUrl"
                        placeholder="https://live-class-link"
                        type="url"
                      />
                      <Button size="sm" type="submit" variant="outline">
                        Save schedule
                      </Button>
                    </form>
                  </div>
                  <div className="mt-2 flex gap-2">
                    <Link
                      className={buttonVariants({
                        size: "sm",
                        variant: "outline",
                      })}
                      href={`/admin/classes/${session.id}/materials`}
                    >
                      Materials
                    </Link>
                    <form action={updateClassStatusAction}>
                      <input name="classId" type="hidden" value={session.id} />
                      <input name="batchId" type="hidden" value={batch.id} />
                      <input name="status" type="hidden" value="RESCHEDULED" />
                      <Button size="sm" type="submit" variant="ghost">
                        Mark rescheduled
                      </Button>
                    </form>
                    <form action={updateClassStatusAction}>
                      <input name="classId" type="hidden" value={session.id} />
                      <input name="batchId" type="hidden" value={batch.id} />
                      <input name="status" type="hidden" value="CANCELLED" />
                      <Button size="sm" type="submit" variant="destructive">
                        Cancel class
                      </Button>
                    </form>
                  </div>
                </article>
              ))}
            </CardContent>
          </Card>
        ))}
      </section>
    </main>
  );
}
