import {
  Activity,
  BookCheck,
  CalendarClock,
  Download,
  FileWarning,
  Inbox,
  Users,
} from "lucide-react";
import Link from "next/link";

import { EnrolmentStatus, Prisma } from "@/generated/prisma/client";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
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
import {
  classifyActivity,
  completionPercent,
  inActivityBand,
  latestDate,
  normalizePage,
  parseReportDate,
  type ActivityBand,
} from "@/lib/reports/metrics";

interface ReportsPageProps {
  searchParams: Promise<{
    batch?: string;
    from?: string;
    to?: string;
    status?: string;
    activity?: string;
    q?: string;
    page?: string;
  }>;
}

const enrolmentStatuses = [
  "PENDING",
  "ACTIVE",
  "SUSPENDED",
  "COMPLETED",
  "CANCELLED",
] as const;
const activityBands: ActivityBand[] = ["all", "active", "low", "none"];
const pageSize = 20;

export default async function ReportsPage({ searchParams }: ReportsPageProps) {
  await requirePermission(permissions.reportsView);
  const filters = await searchParams;
  const database = getDatabase();
  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date(now);
  endOfToday.setHours(23, 59, 59, 999);
  const expiryLimit = new Date(now.getTime() + 30 * 86_400_000);
  const from = parseReportDate(filters.from);
  const to = parseReportDate(filters.to, true);
  const activity: ActivityBand = activityBands.includes(
    filters.activity as ActivityBand,
  )
    ? (filters.activity as ActivityBand)
    : "all";
  const status = enrolmentStatuses.includes(
    filters.status as (typeof enrolmentStatuses)[number],
  )
    ? (filters.status as EnrolmentStatus)
    : undefined;
  const q = filters.q?.trim() ?? "";
  const page = normalizePage(filters.page);
  const enrolmentWhere: Prisma.EnrolmentWhereInput = {
    ...(filters.batch ? { batchId: filters.batch } : {}),
    ...(status ? { status } : {}),
    ...(from || to
      ? {
          enrolledAt: {
            ...(from ? { gte: from } : {}),
            ...(to ? { lte: to } : {}),
          },
        }
      : {}),
    ...(q
      ? {
          student: {
            user: {
              OR: [
                { name: { contains: q, mode: "insensitive" } },
                { email: { contains: q, mode: "insensitive" } },
              ],
            },
          },
        }
      : {}),
  };

  const [
    batches,
    activeStudents,
    activeBatches,
    classesToday,
    pendingMaterials,
    newEnquiries,
    expiringAccess,
    enrolments,
    batchRows,
    materialRows,
    enquiryGroups,
  ] = await Promise.all([
    database.batch.findMany({
      select: { id: true, code: true, name: true },
      orderBy: { startsAt: "desc" },
    }),
    database.enrolment.count({ where: { status: "ACTIVE" } }),
    database.batch.count({ where: { status: "ACTIVE" } }),
    database.classSession.count({
      where: { scheduledAt: { gte: startOfToday, lte: endOfToday } },
    }),
    database.material.count({
      where: { status: { in: ["IN_REVIEW", "APPROVED"] } },
    }),
    database.websiteEnquiry.count({ where: { status: "NEW" } }),
    database.enrolment.count({
      where: {
        status: "ACTIVE",
        accessEndsAt: { gte: now, lte: expiryLimit },
      },
    }),
    database.enrolment.findMany({
      where: enrolmentWhere,
      include: {
        student: { include: { user: true } },
        batch: {
          include: {
            course: true,
            modules: {
              include: {
                classes: {
                  include: {
                    materials: {
                      where: { required: true, status: "RELEASED" },
                      select: { id: true },
                    },
                  },
                },
              },
            },
          },
        },
        materialProgress: true,
        videoProgress: true,
      },
      orderBy: { enrolledAt: "desc" },
    }),
    database.batch.findMany({
      where: filters.batch ? { id: filters.batch } : undefined,
      include: {
        course: true,
        enrolments: { select: { status: true } },
        modules: {
          include: {
            classes: {
              include: { materials: { select: { status: true } } },
            },
          },
        },
      },
      orderBy: { startsAt: "desc" },
    }),
    database.material.findMany({
      where: { status: { in: ["IN_REVIEW", "APPROVED"] } },
      include: {
        uploadedBy: { select: { name: true } },
        classSession: {
          include: { module: { include: { batch: true } } },
        },
      },
      orderBy: { updatedAt: "asc" },
      take: 10,
    }),
    database.websiteEnquiry.groupBy({ by: ["status"], _count: true }),
  ]);

  const engagementRows = enrolments
    .map((enrolment) => {
      const requiredIds = new Set(
        enrolment.batch.modules.flatMap((module) =>
          module.classes.flatMap((classItem) =>
            classItem.materials.map((material) => material.id),
          ),
        ),
      );
      const completed = enrolment.materialProgress.filter(
        (progress) =>
          requiredIds.has(progress.materialId) && Boolean(progress.completedAt),
      ).length;
      const lastActivity = latestDate([
        ...enrolment.materialProgress.map((progress) => progress.updatedAt),
        ...enrolment.videoProgress.map((progress) => progress.updatedAt),
      ]);
      return {
        enrolment,
        lastActivity,
        completion: completionPercent(completed, requiredIds.size),
        activity: classifyActivity(lastActivity, now),
      };
    })
    .filter((row) => inActivityBand(row.lastActivity, activity, now));
  const totalPages = Math.max(1, Math.ceil(engagementRows.length / pageSize));
  const visibleEngagement = engagementRows.slice(
    (Math.min(page, totalPages) - 1) * pageSize,
    Math.min(page, totalPages) * pageSize,
  );
  const input =
    "h-10 rounded-[var(--radius-control)] border border-border bg-white px-3 text-sm outline-none focus:border-primary";
  const exportQuery = new URLSearchParams();
  for (const [key, value] of Object.entries(filters))
    if (value && key !== "page") exportQuery.set(key, value);

  return (
    <main className="mx-auto max-w-7xl p-5 sm:p-8">
      <Badge variant="soft">Phase 10 · Operational intelligence</Badge>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-olive-950">
            Reports and insights
          </h1>
          <p className="text-muted-foreground mt-2">
            Academic delivery, student engagement, content readiness, and
            admissions at a glance.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            ["students", "Student CSV"],
            ["batches", "Batch CSV"],
            ["materials", "Materials CSV"],
            ["enquiries", "Enquiries CSV"],
          ].map(([type, label]) => (
            <Link
              className={buttonVariants({ variant: "outline", size: "sm" })}
              href={`/api/admin/reports/export?type=${type}&${exportQuery}`}
              key={type}
            >
              <Download className="size-4" /> {label}
            </Link>
          ))}
        </div>
      </div>

      <form className="border-border mt-7 grid gap-2 rounded-2xl border bg-white p-4 md:grid-cols-3 xl:grid-cols-7">
        <input
          className={input}
          defaultValue={q}
          name="q"
          placeholder="Student name or email"
        />
        <select
          className={input}
          defaultValue={filters.batch ?? ""}
          name="batch"
        >
          <option value="">All batches</option>
          {batches.map((batch) => (
            <option key={batch.id} value={batch.id}>
              {batch.code} · {batch.name}
            </option>
          ))}
        </select>
        <select
          className={input}
          defaultValue={filters.status ?? ""}
          name="status"
        >
          <option value="">All enrolment states</option>
          {enrolmentStatuses.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
        <select className={input} defaultValue={activity} name="activity">
          <option value="all">All activity</option>
          <option value="active">Active within 7 days</option>
          <option value="low">Low activity: 8–14 days</option>
          <option value="none">No activity: 15+ days</option>
        </select>
        <input
          aria-label="From date"
          className={input}
          defaultValue={filters.from}
          name="from"
          type="date"
        />
        <input
          aria-label="To date"
          className={input}
          defaultValue={filters.to}
          name="to"
          type="date"
        />
        <button className={buttonVariants()} type="submit">
          Apply filters
        </button>
      </form>

      <section
        className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7"
        aria-label="Operational summary"
      >
        {[
          { icon: Users, label: "Active students", value: activeStudents },
          { icon: BookCheck, label: "Active batches", value: activeBatches },
          { icon: CalendarClock, label: "Classes today", value: classesToday },
          {
            icon: FileWarning,
            label: "Awaiting release",
            value: pendingMaterials,
          },
          { icon: Inbox, label: "New enquiries", value: newEnquiries },
          {
            icon: Activity,
            label: "Expiring in 30 days",
            value: expiringAccess,
          },
          {
            icon: Users,
            label: "Filtered students",
            value: engagementRows.length,
          },
        ].map(({ icon: Icon, label, value }) => (
          <Card key={label}>
            <CardContent className="p-4">
              <Icon className="text-primary size-5" />
              <p className="mt-3 text-2xl font-bold text-olive-950">{value}</p>
              <p className="text-muted-foreground text-xs">{label}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="mt-6 grid gap-5 xl:grid-cols-[1.35fr_.65fr]">
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Student engagement</CardTitle>
            <CardDescription>
              Released required-resource completion and recent learning activity
            </CardDescription>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-silver-50 text-xs uppercase">
                <tr>
                  <th className="p-3">Student</th>
                  <th className="p-3">Batch</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Completion</th>
                  <th className="p-3">Last activity</th>
                </tr>
              </thead>
              <tbody>
                {visibleEngagement.map(
                  ({ enrolment, completion, lastActivity, activity: band }) => (
                    <tr className="border-border border-t" key={enrolment.id}>
                      <td className="p-3">
                        <strong>{enrolment.student.user.name}</strong>
                        <span className="text-muted-foreground block text-xs">
                          {enrolment.student.user.email}
                        </span>
                      </td>
                      <td className="p-3">
                        {enrolment.batch.code}
                        <span className="text-muted-foreground block text-xs">
                          {enrolment.batch.course.title}
                        </span>
                      </td>
                      <td className="p-3">
                        <Badge variant="neutral">{enrolment.status}</Badge>
                      </td>
                      <td className="p-3">
                        <strong>{completion}%</strong>
                        <div className="bg-silver-100 mt-1 h-1.5 w-24 overflow-hidden rounded-full">
                          <span
                            className="bg-primary block h-full"
                            style={{ width: `${completion}%` }}
                          />
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge
                          variant={
                            band === "active"
                              ? "soft"
                              : band === "low"
                                ? "warning"
                                : "destructive"
                          }
                        >
                          {band}
                        </Badge>
                        <span className="text-muted-foreground mt-1 block text-xs">
                          {lastActivity?.toLocaleDateString("en-IN") ?? "Never"}
                        </span>
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
            {!visibleEngagement.length ? (
              <p className="text-muted-foreground p-10 text-center text-sm">
                No students match these report filters.
              </p>
            ) : null}
          </div>
          <CardContent className="border-border flex items-center justify-between border-t p-4">
            <span className="text-muted-foreground text-xs">
              Page {Math.min(page, totalPages)} of {totalPages}
            </span>
            <div className="flex gap-2">
              <PageLink disabled={page <= 1} filters={filters} page={page - 1}>
                Previous
              </PageLink>
              <PageLink
                disabled={page >= totalPages}
                filters={filters}
                page={page + 1}
              >
                Next
              </PageLink>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Admissions pipeline</CardTitle>
            <CardDescription>Website enquiry status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {(["NEW", "CONTACTED", "CLOSED", "SPAM"] as const).map((item) => (
              <div
                className="bg-silver-50 flex items-center justify-between rounded-xl p-3"
                key={item}
              >
                <span className="text-sm font-semibold">{item}</span>
                <Badge variant={item === "NEW" ? "soft" : "neutral"}>
                  {enquiryGroups.find((group) => group.status === item)
                    ?._count ?? 0}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="mt-6 grid gap-5 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Batch delivery</CardTitle>
            <CardDescription>
              Planned, conducted, released, and enrolled totals
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {batchRows.map((batch) => {
              const classes = batch.modules.flatMap((module) => module.classes);
              const conducted = classes.filter(
                (item) => item.conductedAt,
              ).length;
              const released = classes.filter(
                (item) => item.status === "RELEASED",
              ).length;
              return (
                <div
                  className="border-border rounded-xl border p-4"
                  key={batch.id}
                >
                  <div className="flex justify-between gap-3">
                    <div>
                      <strong>
                        {batch.code} · {batch.name}
                      </strong>
                      <p className="text-muted-foreground text-xs">
                        {batch.course.title}
                      </p>
                    </div>
                    <Badge variant="neutral">{batch.status}</Badge>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                    <span className="bg-silver-50 rounded-lg p-2">
                      <b className="block text-base">
                        {conducted}/{classes.length}
                      </b>
                      conducted
                    </span>
                    <span className="bg-silver-50 rounded-lg p-2">
                      <b className="block text-base">{released}</b>released
                    </span>
                    <span className="bg-silver-50 rounded-lg p-2">
                      <b className="block text-base">
                        {
                          batch.enrolments.filter(
                            (item) => item.status === "ACTIVE",
                          ).length
                        }
                      </b>
                      active students
                    </span>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Content requiring action</CardTitle>
            <CardDescription>
              Oldest review and approved items first
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {materialRows.map((material) => (
              <div
                className="border-border flex items-start justify-between gap-3 rounded-xl border p-3"
                key={material.id}
              >
                <div>
                  <strong className="text-sm">{material.title}</strong>
                  <p className="text-muted-foreground text-xs">
                    {material.classSession.module.batch.code} ·{" "}
                    {material.classSession.title} · {material.uploadedBy.name}
                  </p>
                </div>
                <Badge
                  variant={
                    material.status === "APPROVED" ? "warning" : "neutral"
                  }
                >
                  {material.status}
                </Badge>
              </div>
            ))}
            {!materialRows.length ? (
              <p className="text-muted-foreground text-sm">
                No materials are awaiting review or release.
              </p>
            ) : null}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}

function PageLink({
  children,
  disabled,
  filters,
  page,
}: {
  children: React.ReactNode;
  disabled: boolean;
  filters: Record<string, string | undefined>;
  page: number;
}) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(filters))
    if (value && key !== "page") query.set(key, value);
  query.set("page", String(page));
  return disabled ? (
    <span
      className={buttonVariants({
        variant: "outline",
        size: "sm",
        className: "pointer-events-none opacity-40",
      })}
    >
      {children}
    </span>
  ) : (
    <Link
      className={buttonVariants({ variant: "outline", size: "sm" })}
      href={`/admin/reports?${query}`}
    >
      {children}
    </Link>
  );
}
