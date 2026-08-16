import {
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  LockKeyhole,
  PlayCircle,
} from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { calculateProgress } from "@/lib/portal/progress";
import { requireOwnedEnrolment } from "@/lib/portal/student-scope";
import { getDatabase } from "@/lib/db/client";

interface CourseLearningProps {
  params: Promise<{ enrolmentId: string }>;
}

export default async function CourseLearningPage({
  params,
}: CourseLearningProps) {
  const { enrolmentId } = await params;
  const { enrolment } = await requireOwnedEnrolment(enrolmentId);
  const full = await getDatabase().enrolment.findUniqueOrThrow({
    where: { id: enrolment.id },
    include: {
      materialProgress: true,
      batch: {
        include: {
          course: true,
          modules: {
            include: {
              classes: {
                include: {
                  materials: {
                    where: { status: "RELEASED" },
                    orderBy: { position: "asc" },
                  },
                },
                orderBy: { position: "asc" },
              },
            },
            orderBy: { position: "asc" },
          },
        },
      },
    },
  });
  const completedIds = new Set(
    full.materialProgress
      .filter((item) => item.completedAt)
      .map((item) => item.materialId),
  );
  const allReleased = full.batch.modules.flatMap((module) =>
    module.classes.flatMap((session) => session.materials),
  );
  const courseProgress = calculateProgress(
    allReleased.map((item) => ({
      id: item.id,
      required: item.required,
      completed: completedIds.has(item.id),
    })),
  );
  return (
    <main className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
      <Link
        className={buttonVariants({ variant: "ghost", size: "sm" })}
        href="/portal"
      >
        <ArrowLeft className="size-4" /> Dashboard
      </Link>
      <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_260px]">
        <div>
          <Badge variant="soft">{full.batch.code}</Badge>
          <h1 className="mt-3 text-3xl font-bold text-olive-950">
            {full.batch.course.title}
          </h1>
          <p className="text-muted-foreground mt-2">{full.batch.name}</p>
        </div>
        <Card>
          <CardContent className="p-5">
            <p className="text-muted-foreground text-xs">Course progress</p>
            <p className="mt-1 text-3xl font-bold text-olive-950">
              {courseProgress}%
            </p>
            <div className="bg-silver-200 mt-3 h-2 overflow-hidden rounded-full">
              <div
                className="bg-primary h-full rounded-full"
                style={{ width: `${courseProgress}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="mt-8 space-y-5">
        {full.batch.modules.map((module) => {
          const moduleResources = module.classes.flatMap(
            (session) => session.materials,
          );
          const moduleProgress = calculateProgress(
            moduleResources.map((item) => ({
              id: item.id,
              required: item.required,
              completed: completedIds.has(item.id),
            })),
          );
          return (
            <Card key={module.id}>
              <CardHeader>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-primary text-xs font-bold">
                      MODULE {module.position}
                    </p>
                    <CardTitle>{module.title}</CardTitle>
                  </div>
                  <Badge variant="neutral">{moduleProgress}% complete</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {module.classes.map((session) => {
                  const released = session.status === "RELEASED";
                  const classProgress = calculateProgress(
                    session.materials.map((item) => ({
                      id: item.id,
                      required: item.required,
                      completed: completedIds.has(item.id),
                    })),
                  );
                  return (
                    <div
                      className="border-border rounded-xl border p-4"
                      key={session.id}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="font-bold">{session.title}</p>
                          <p className="text-muted-foreground mt-1 flex items-center gap-1 text-xs">
                            <CalendarClock className="size-3" />
                            {session.scheduledAt?.toLocaleString("en-IN") ??
                              "Schedule pending"}
                          </p>
                        </div>
                        <Badge variant={released ? "soft" : "neutral"}>
                          {released
                            ? `${classProgress}% complete`
                            : session.status}
                        </Badge>
                      </div>
                      {released ? (
                        <div className="mt-4 grid gap-2 sm:grid-cols-2">
                          {session.materials.map((material) => (
                            <Link
                              className="border-border flex items-center gap-3 rounded-xl border p-3 transition hover:border-olive-300"
                              href={`/portal/materials/${material.id}`}
                              key={material.id}
                            >
                              <span className="text-primary grid size-9 place-items-center rounded-lg bg-olive-100">
                                {material.type === "VIDEO" ? (
                                  <PlayCircle className="size-4" />
                                ) : completedIds.has(material.id) ? (
                                  <CheckCircle2 className="size-4" />
                                ) : (
                                  <LockKeyhole className="size-4" />
                                )}
                              </span>
                              <div className="min-w-0">
                                <p className="truncate text-sm font-semibold">
                                  {material.title}
                                </p>
                                <p className="text-muted-foreground text-xs">
                                  {completedIds.has(material.id)
                                    ? "Completed"
                                    : material.type}
                                </p>
                              </div>
                            </Link>
                          ))}
                        </div>
                      ) : (
                        <p className="bg-silver-50 text-muted-foreground mt-4 rounded-xl p-3 text-xs">
                          <LockKeyhole className="mr-1 inline size-3" />
                          Materials remain locked until this class is completed
                          and released.
                        </p>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </main>
  );
}
