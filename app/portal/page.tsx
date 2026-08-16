import {
  ArrowRight,
  Bell,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock3,
} from "lucide-react";
import Link from "next/link";

import { markNotificationReadAction } from "@/app/actions/portal-progress";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDatabase } from "@/lib/db/client";
import { calculateProgress } from "@/lib/portal/progress";
import { requireStudentProfile } from "@/lib/portal/student-scope";

export default async function PortalDashboardPage() {
  const { user, profile } = await requireStudentProfile();
  const now = new Date();
  const database = getDatabase();
  const [enrolments, notifications, recentProgress] = await Promise.all([
    database.enrolment.findMany({
      where: {
        studentId: profile.id,
        status: "ACTIVE",
        OR: [{ accessStartsAt: null }, { accessStartsAt: { lte: now } }],
        AND: [{ OR: [{ accessEndsAt: null }, { accessEndsAt: { gte: now } }] }],
      },
      include: {
        materialProgress: true,
        batch: {
          include: {
            course: true,
            modules: {
              include: {
                classes: {
                  include: { materials: { where: { status: "RELEASED" } } },
                  orderBy: { position: "asc" },
                },
              },
              orderBy: { position: "asc" },
            },
          },
        },
      },
      orderBy: { enrolledAt: "desc" },
    }),
    database.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    database.materialProgress.findMany({
      where: { enrolment: { studentId: profile.id }, openedAt: { not: null } },
      include: {
        material: true,
        enrolment: { include: { batch: { include: { course: true } } } },
      },
      orderBy: { updatedAt: "desc" },
      take: 4,
    }),
  ]);

  const upcoming = enrolments
    .flatMap((enrolment) =>
      enrolment.batch.modules.flatMap((module) =>
        module.classes
          .filter((session) => session.scheduledAt && session.scheduledAt > now)
          .map((session) => ({ ...session, batchName: enrolment.batch.name })),
      ),
    )
    .sort((left, right) => Number(left.scheduledAt) - Number(right.scheduledAt))
    .slice(0, 4);

  const enrolmentSummaries = enrolments.map((enrolment) => {
    const resources = enrolment.batch.modules.flatMap((module) =>
      module.classes.flatMap((session) => session.materials),
    );
    const completed = new Set(
      enrolment.materialProgress
        .filter((item) => item.completedAt)
        .map((item) => item.materialId),
    );
    const progress = calculateProgress(
      resources.map((item) => ({
        id: item.id,
        required: item.required,
        completed: completed.has(item.id),
      })),
    );
    return { enrolment, progress, resourceCount: resources.length };
  });
  const averageProgress = enrolmentSummaries.length
    ? Math.round(
        enrolmentSummaries.reduce((total, item) => total + item.progress, 0) /
          enrolmentSummaries.length,
      )
    : 0;
  const unreadCount = notifications.filter(
    (notice) => notice.status !== "READ",
  ).length;

  return (
    <main className="pb-24 sm:pb-12">
      <section className="bg-olive-950 text-white">
        <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-12">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <Badge
                className="border-white/15 bg-white/10 text-olive-100"
                variant="outline"
              >
                Student workspace
              </Badge>
              <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
                Welcome back, {user.name}.
              </h1>
              <p className="mt-2 max-w-xl text-olive-100">
                Continue your learning, review progress, and stay ready for the
                next live class.
              </p>
            </div>
            <p className="text-sm text-olive-200">
              {now.toLocaleDateString("en-IN", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </p>
          </div>
          <div className="mt-8 grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-3">
            <div className="flex items-center gap-4 bg-olive-900/80 p-5">
              <span className="grid size-11 place-items-center rounded-xl bg-white/10">
                <BookOpen className="size-5 text-olive-200" />
              </span>
              <div>
                <p className="text-2xl font-bold">
                  {enrolmentSummaries.length}
                </p>
                <p className="text-xs text-olive-200">Active courses</p>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-olive-900/80 p-5">
              <span className="grid size-11 place-items-center rounded-xl bg-white/10">
                <CheckCircle2 className="size-5 text-olive-200" />
              </span>
              <div>
                <p className="text-2xl font-bold">{averageProgress}%</p>
                <p className="text-xs text-olive-200">Average progress</p>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-olive-900/80 p-5">
              <span className="grid size-11 place-items-center rounded-xl bg-white/10">
                <CalendarDays className="size-5 text-olive-200" />
              </span>
              <div>
                <p className="text-2xl font-bold">{upcoming.length}</p>
                <p className="text-xs text-olive-200">Upcoming classes</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-6 px-5 py-8 sm:px-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-6">
          <section>
            <p className="text-xs font-bold tracking-[0.16em] text-olive-700 uppercase">
              My learning
            </p>
            <h2 className="mt-1 text-2xl font-bold text-olive-950">
              Continue where you left off
            </h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {enrolmentSummaries.map(
                ({ enrolment, progress, resourceCount }) => (
                  <article
                    className="group overflow-hidden rounded-2xl border border-olive-200 bg-white shadow-[var(--shadow-card)]"
                    key={enrolment.id}
                  >
                    <div className="h-1.5 bg-olive-100">
                      <div
                        className="h-full bg-olive-600"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <span className="grid size-11 place-items-center rounded-xl bg-olive-100 text-olive-800">
                          <BookOpen className="size-5" />
                        </span>
                        <Badge variant="neutral">{progress}% complete</Badge>
                      </div>
                      <h3 className="mt-5 text-xl font-bold text-olive-950">
                        {enrolment.batch.course.title}
                      </h3>
                      <p className="text-muted-foreground mt-1 text-sm">
                        {enrolment.batch.name}
                      </p>
                      <div className="border-silver-100 mt-5 flex items-center justify-between border-t pt-4 text-xs">
                        <span className="text-muted-foreground">
                          {resourceCount} released resources
                        </span>
                        <Link
                          className="inline-flex items-center gap-1 font-bold text-olive-700"
                          href={`/portal/courses/${enrolment.id}`}
                        >
                          Continue
                          <ArrowRight className="size-3.5 transition group-hover:translate-x-1" />
                        </Link>
                      </div>
                    </div>
                  </article>
                ),
              )}
              {!enrolmentSummaries.length ? (
                <div className="text-muted-foreground rounded-2xl border border-dashed border-olive-300 bg-white p-10 text-center text-sm md:col-span-2">
                  You do not currently have an active enrolment.
                </div>
              ) : null}
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
            <Card>
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <div>
                  <p className="text-xs font-bold tracking-[0.14em] text-olive-700 uppercase">
                    Schedule
                  </p>
                  <CardTitle className="mt-1">Upcoming classes</CardTitle>
                </div>
                <CalendarDays className="size-5 text-olive-600" />
              </CardHeader>
              <CardContent className="space-y-2">
                {upcoming.map((session) => (
                  <div
                    className="bg-silver-50 flex gap-3 rounded-xl p-3"
                    key={session.id}
                  >
                    <time className="flex w-12 shrink-0 flex-col items-center rounded-lg bg-white py-2 text-center shadow-sm">
                      <span className="text-[10px] font-bold text-olive-700 uppercase">
                        {session.scheduledAt?.toLocaleDateString("en-IN", {
                          month: "short",
                        })}
                      </span>
                      <span className="text-lg font-bold text-olive-950">
                        {session.scheduledAt?.getDate()}
                      </span>
                    </time>
                    <div className="min-w-0 py-1">
                      <p className="truncate text-sm font-semibold">
                        {session.title}
                      </p>
                      <p className="text-muted-foreground mt-1 truncate text-xs">
                        {session.batchName} ·{" "}
                        {session.scheduledAt?.toLocaleTimeString("en-IN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ))}
                {!upcoming.length ? (
                  <p className="text-muted-foreground py-6 text-center text-sm">
                    No upcoming classes are scheduled.
                  </p>
                ) : null}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <div>
                  <p className="text-xs font-bold tracking-[0.14em] text-olive-700 uppercase">
                    Activity
                  </p>
                  <CardTitle className="mt-1">Recently viewed</CardTitle>
                </div>
                <Clock3 className="size-5 text-olive-600" />
              </CardHeader>
              <CardContent className="space-y-2">
                {recentProgress.map((item) => (
                  <Link
                    className="group bg-silver-50 flex items-center gap-3 rounded-xl border border-transparent p-3 transition hover:border-olive-200 hover:bg-white"
                    href={`/portal/materials/${item.materialId}`}
                    key={item.id}
                  >
                    <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-white text-olive-700 shadow-sm">
                      <BookOpen className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">
                        {item.material.title}
                      </p>
                      <p className="text-muted-foreground truncate text-xs">
                        {item.enrolment.batch.course.title}
                      </p>
                    </div>
                    {item.completedAt ? (
                      <CheckCircle2 className="size-4 text-olive-600" />
                    ) : (
                      <ArrowRight className="text-silver-400 size-4 transition group-hover:translate-x-1" />
                    )}
                  </Link>
                ))}
                {!recentProgress.length ? (
                  <p className="text-muted-foreground py-6 text-center text-sm">
                    Open a released resource to begin your activity history.
                  </p>
                ) : null}
              </CardContent>
            </Card>
          </section>
        </div>

        <aside>
          <Card className="sticky top-24 overflow-hidden">
            <CardHeader className="border-silver-100 bg-silver-50/70 border-b">
              <div className="flex items-center justify-between">
                <span className="grid size-10 place-items-center rounded-xl bg-olive-100 text-olive-800">
                  <Bell className="size-5" />
                </span>
                {unreadCount ? (
                  <Badge>{unreadCount} new</Badge>
                ) : (
                  <Badge variant="neutral">All read</Badge>
                )}
              </div>
              <CardTitle className="pt-3">Notifications</CardTitle>
              <p className="text-muted-foreground text-sm">
                Updates from your institution.
              </p>
            </CardHeader>
            <CardContent className="space-y-2 p-4">
              {notifications.map((notice) => (
                <div
                  className={`rounded-xl border p-3 text-sm ${
                    notice.status === "READ"
                      ? "bg-silver-50 border-transparent"
                      : "border-olive-200 bg-olive-50"
                  }`}
                  key={notice.id}
                >
                  <div className="flex items-start gap-2">
                    <span
                      className={`mt-1.5 size-2 shrink-0 rounded-full ${
                        notice.status === "READ"
                          ? "bg-silver-300"
                          : "bg-olive-600"
                      }`}
                    />
                    <div>
                      <p className="font-semibold">{notice.subject}</p>
                      <p className="text-muted-foreground mt-1 line-clamp-3 text-xs leading-5">
                        {notice.body}
                      </p>
                    </div>
                  </div>
                  {notice.status !== "READ" ? (
                    <form
                      action={markNotificationReadAction}
                      className="mt-2 pl-4"
                    >
                      <input
                        name="notificationId"
                        type="hidden"
                        value={notice.id}
                      />
                      <Button size="sm" type="submit" variant="ghost">
                        Mark as read
                      </Button>
                    </form>
                  ) : null}
                </div>
              ))}
              {!notifications.length ? (
                <p className="text-muted-foreground py-8 text-center text-sm">
                  No notifications yet.
                </p>
              ) : null}
              <Link
                className={`${buttonVariants({ variant: "outline", size: "sm" })} mt-2 w-full`}
                href="/portal/notifications"
              >
                View all notifications
              </Link>
            </CardContent>
          </Card>
        </aside>
      </div>
    </main>
  );
}
