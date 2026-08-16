import {
  Activity,
  ArrowUpRight,
  CalendarDays,
  GraduationCap,
  Inbox,
  LibraryBig,
  TrendingUp,
  Users,
} from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireActiveUser } from "@/lib/auth/session";
import { getDatabase } from "@/lib/db/client";

function monthKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}`;
}

export default async function AdminPage() {
  await requireActiveUser("/admin");
  const database = getDatabase();
  const now = new Date();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  const weekEnd = new Date(now.getTime() + 7 * 86_400_000);

  const [
    studentCount,
    activeEnrolments,
    liveBatchCount,
    pendingMaterials,
    newEnquiries,
    upcomingClasses,
    recentStudents,
    liveBatches,
    enrolmentDates,
    recentAudit,
  ] = await Promise.all([
    database.studentProfile.count(),
    database.enrolment.count({ where: { status: "ACTIVE" } }),
    database.batch.count({
      where: { status: { in: ["ACTIVE", "ENROLLING"] } },
    }),
    database.material.count({
      where: { status: { in: ["IN_REVIEW", "APPROVED"] } },
    }),
    database.websiteEnquiry.count({ where: { status: "NEW" } }),
    database.classSession.count({
      where: { scheduledAt: { gte: now, lte: weekEnd } },
    }),
    database.studentProfile.findMany({
      include: {
        user: { select: { name: true, email: true, status: true } },
        enrolments: { where: { status: "ACTIVE" }, select: { id: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    database.batch.findMany({
      where: { status: { in: ["ACTIVE", "ENROLLING"] } },
      include: {
        course: { select: { title: true } },
        enrolments: { where: { status: "ACTIVE" }, select: { id: true } },
      },
      orderBy: { startsAt: "asc" },
      take: 5,
    }),
    database.enrolment.findMany({
      where: { enrolledAt: { gte: sixMonthsAgo } },
      select: { enrolledAt: true },
    }),
    database.auditLog.findMany({
      include: { actor: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const monthlyEnrolments = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - 5 + index, 1);
    return {
      key: monthKey(date),
      label: date.toLocaleDateString("en-IN", { month: "short" }),
      count: 0,
    };
  });
  const monthMap = new Map(monthlyEnrolments.map((item) => [item.key, item]));
  for (const enrolment of enrolmentDates) {
    const item = monthMap.get(monthKey(enrolment.enrolledAt));
    if (item) item.count += 1;
  }
  const chartMax = Math.max(1, ...monthlyEnrolments.map((item) => item.count));
  const totalCapacity = liveBatches.reduce(
    (total, batch) => total + (batch.capacity ?? 0),
    0,
  );
  const totalBatchStudents = liveBatches.reduce(
    (total, batch) => total + batch.enrolments.length,
    0,
  );
  const capacityUse = totalCapacity
    ? Math.round((totalBatchStudents / totalCapacity) * 100)
    : 0;

  return (
    <main className="mx-auto max-w-7xl p-5 sm:p-8">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <Badge variant="soft">Operations overview</Badge>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-olive-950 sm:text-4xl">
            Administration dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Academic delivery, student growth, and operational priorities at a
            glance.
          </p>
        </div>
        <Link className={buttonVariants()} href="/admin/reports">
          Open reports <ArrowUpRight className="size-4" />
        </Link>
      </div>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            icon: GraduationCap,
            label: "Students",
            value: studentCount,
            detail: `${activeEnrolments} active enrolments`,
            href: "/admin/students",
          },
          {
            icon: CalendarDays,
            label: "Live batches",
            value: liveBatchCount,
            detail: `${capacityUse}% capacity used`,
            href: "/admin/batches",
          },
          {
            icon: LibraryBig,
            label: "Content queue",
            value: pendingMaterials,
            detail: "Awaiting review or release",
            href: "/admin/materials",
          },
          {
            icon: Inbox,
            label: "New enquiries",
            value: newEnquiries,
            detail: `${upcomingClasses} classes next 7 days`,
            href: "/admin/website/enquiries",
          },
        ].map(({ icon: Icon, label, value, detail, href }) => (
          <Link
            className="group rounded-2xl border border-olive-200 bg-white p-5 shadow-[var(--shadow-card)] transition hover:-translate-y-0.5 hover:border-olive-400"
            href={href}
            key={label}
          >
            <div className="flex items-start justify-between">
              <span className="grid size-11 place-items-center rounded-xl bg-olive-100 text-olive-800">
                <Icon className="size-5" />
              </span>
              <ArrowUpRight className="text-silver-400 size-4 transition group-hover:text-olive-700" />
            </div>
            <p className="mt-5 text-3xl font-bold text-olive-950">{value}</p>
            <p className="mt-1 text-sm font-semibold text-olive-900">{label}</p>
            <p className="text-muted-foreground mt-1 text-xs">{detail}</p>
          </Link>
        ))}
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.25fr_.75fr]">
        <Card className="overflow-hidden">
          <CardHeader className="border-silver-100 flex-row items-start justify-between space-y-0 border-b">
            <div>
              <p className="text-xs font-bold tracking-[0.16em] text-olive-700 uppercase">
                Growth
              </p>
              <CardTitle className="mt-1">Enrolments over six months</CardTitle>
            </div>
            <span className="grid size-10 place-items-center rounded-xl bg-olive-100 text-olive-800">
              <TrendingUp className="size-5" />
            </span>
          </CardHeader>
          <CardContent className="p-6">
            <div className="border-silver-200 grid h-64 grid-cols-6 items-end gap-3 border-b px-2 sm:gap-5">
              {monthlyEnrolments.map((month) => (
                <div
                  className="flex h-full flex-col justify-end"
                  key={month.key}
                >
                  <p className="mb-2 text-center text-xs font-bold text-olive-800">
                    {month.count}
                  </p>
                  <div className="group relative flex h-48 items-end overflow-hidden rounded-t-xl bg-olive-50">
                    <div
                      className="w-full rounded-t-xl bg-gradient-to-t from-olive-800 to-olive-500 transition group-hover:from-olive-700 group-hover:to-olive-400"
                      style={{
                        height: `${Math.max(8, (month.count / chartMax) * 100)}%`,
                      }}
                    />
                  </div>
                  <p className="text-silver-600 mt-3 text-center text-xs font-semibold">
                    {month.label}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="border-silver-100 border-b">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold tracking-[0.16em] text-olive-700 uppercase">
                  Capacity
                </p>
                <CardTitle className="mt-1">Live batch health</CardTitle>
              </div>
              <Badge variant="neutral">{capacityUse}% filled</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 p-5">
            {liveBatches.map((batch) => {
              const filled = batch.capacity
                ? Math.min(
                    100,
                    Math.round(
                      (batch.enrolments.length / batch.capacity) * 100,
                    ),
                  )
                : 0;
              return (
                <Link
                  className="block"
                  href={`/admin/batches/${batch.id}`}
                  key={batch.id}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-olive-950">
                        {batch.name}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {batch.course.title}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-olive-800">
                      {batch.enrolments.length}/{batch.capacity ?? "—"}
                    </span>
                  </div>
                  <div className="bg-silver-100 mt-2 h-2 overflow-hidden rounded-full">
                    <div
                      className="h-full rounded-full bg-olive-600"
                      style={{ width: `${filled}%` }}
                    />
                  </div>
                </Link>
              );
            })}
            {!liveBatches.length ? (
              <p className="text-muted-foreground py-8 text-center text-sm">
                No active or enrolling batches.
              </p>
            ) : null}
            <Link
              className={`${buttonVariants({ variant: "outline", size: "sm" })} w-full`}
              href="/admin/batches"
            >
              View all batches
            </Link>
          </CardContent>
        </Card>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_.85fr]">
        <Card className="overflow-hidden">
          <CardHeader className="border-silver-100 flex-row items-center justify-between space-y-0 border-b">
            <div>
              <p className="text-xs font-bold tracking-[0.16em] text-olive-700 uppercase">
                Students
              </p>
              <CardTitle className="mt-1">Recently added</CardTitle>
            </div>
            <Users className="size-5 text-olive-600" />
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-silver-50 text-silver-600 text-xs">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Student</th>
                    <th className="px-5 py-3 font-semibold">ID</th>
                    <th className="px-5 py-3 font-semibold">Active courses</th>
                    <th className="px-5 py-3 font-semibold">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-silver-100 divide-y">
                  {recentStudents.map((student) => (
                    <tr key={student.id}>
                      <td className="px-5 py-4">
                        <p className="font-semibold text-olive-950">
                          {student.user.name}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {student.user.email}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-xs font-semibold">
                        {student.studentNumber}
                      </td>
                      <td className="px-5 py-4">{student.enrolments.length}</td>
                      <td className="text-silver-600 px-5 py-4 text-xs">
                        {student.createdAt.toLocaleDateString("en-IN")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="border-silver-100 border-t p-4">
              <Link
                className={buttonVariants({ variant: "outline", size: "sm" })}
                href="/admin/students"
              >
                Manage students
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="border-silver-100 flex-row items-center justify-between space-y-0 border-b">
            <div>
              <p className="text-xs font-bold tracking-[0.16em] text-olive-700 uppercase">
                Activity
              </p>
              <CardTitle className="mt-1">Latest operations</CardTitle>
            </div>
            <Activity className="size-5 text-olive-600" />
          </CardHeader>
          <CardContent className="space-y-1 p-4">
            {recentAudit.map((event) => (
              <div
                className="hover:bg-silver-50 flex gap-3 rounded-xl p-3"
                key={event.id}
              >
                <span className="mt-1.5 size-2 shrink-0 rounded-full bg-olive-500" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">
                    {event.action}
                  </p>
                  <p className="text-muted-foreground mt-1 text-xs">
                    {event.actor?.name ?? "System"} · {event.entityType}
                  </p>
                </div>
                <time className="text-silver-600 shrink-0 text-[11px]">
                  {event.createdAt.toLocaleDateString("en-IN")}
                </time>
              </div>
            ))}
            {!recentAudit.length ? (
              <p className="text-muted-foreground py-8 text-center text-sm">
                No recent activity recorded.
              </p>
            ) : null}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
