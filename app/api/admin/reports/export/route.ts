import { getServerSession } from "next-auth";

import { EnrolmentStatus, Prisma } from "@/generated/prisma/client";
import { authOptions } from "@/lib/auth/options";
import { permissions } from "@/lib/auth/constants";
import { getDatabase } from "@/lib/db/client";
import {
  completionPercent,
  latestDate,
  parseReportDate,
} from "@/lib/reports/metrics";
import { escapeCsv } from "@/lib/students/csv";

const enrolmentStatuses = [
  "PENDING",
  "ACTIVE",
  "SUSPENDED",
  "COMPLETED",
  "CANCELLED",
];

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });
  const database = getDatabase();
  const user = await database.user.findUnique({
    where: { id: session.user.id },
    include: {
      roles: {
        include: {
          role: { include: { permissions: { include: { permission: true } } } },
        },
      },
    },
  });
  const allowed =
    user?.status === "ACTIVE" &&
    user.roles.some(
      ({ role }) =>
        role.key === "super-admin" ||
        role.permissions.some(
          ({ permission }) => permission.key === permissions.reportsView,
        ),
    );
  if (!allowed) return new Response("Forbidden", { status: 403 });

  const url = new URL(request.url);
  const type = url.searchParams.get("type") ?? "students";
  const batchId = url.searchParams.get("batch") || undefined;
  const statusValue = url.searchParams.get("status") || undefined;
  const status = enrolmentStatuses.includes(statusValue ?? "")
    ? (statusValue as EnrolmentStatus)
    : undefined;
  const from = parseReportDate(url.searchParams.get("from") || undefined);
  const to = parseReportDate(url.searchParams.get("to") || undefined, true);
  const q = url.searchParams.get("q")?.trim() ?? "";
  const enrolmentWhere: Prisma.EnrolmentWhereInput = {
    ...(batchId ? { batchId } : {}),
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

  let header: string[];
  let rows: unknown[][];
  if (type === "batches") {
    const batches = await database.batch.findMany({
      where: batchId ? { id: batchId } : undefined,
      include: {
        course: true,
        enrolments: true,
        modules: { include: { classes: true } },
      },
      orderBy: { startsAt: "desc" },
    });
    header = [
      "batchCode",
      "batchName",
      "course",
      "status",
      "capacity",
      "enrolments",
      "activeStudents",
      "plannedClasses",
      "conductedClasses",
      "releasedClasses",
      "startsAt",
      "endsAt",
    ];
    rows = batches.map((batch) => {
      const classes = batch.modules.flatMap((module) => module.classes);
      return [
        batch.code,
        batch.name,
        batch.course.title,
        batch.status,
        batch.capacity ?? "",
        batch.enrolments.length,
        batch.enrolments.filter((item) => item.status === "ACTIVE").length,
        classes.length,
        classes.filter((item) => item.conductedAt).length,
        classes.filter((item) => item.status === "RELEASED").length,
        batch.startsAt.toISOString(),
        batch.endsAt?.toISOString() ?? "",
      ];
    });
  } else if (type === "materials") {
    const materials = await database.material.findMany({
      where: {
        ...(batchId ? { classSession: { module: { batchId } } } : {}),
        ...(from || to
          ? {
              createdAt: {
                ...(from ? { gte: from } : {}),
                ...(to ? { lte: to } : {}),
              },
            }
          : {}),
      },
      include: {
        uploadedBy: true,
        classSession: { include: { module: { include: { batch: true } } } },
        progress: true,
      },
      orderBy: { createdAt: "desc" },
    });
    header = [
      "batchCode",
      "class",
      "material",
      "type",
      "status",
      "required",
      "uploader",
      "studentOpens",
      "studentCompletions",
      "createdAt",
    ];
    rows = materials.map((material) => [
      material.classSession.module.batch.code,
      material.classSession.title,
      material.title,
      material.type,
      material.status,
      material.required,
      material.uploadedBy.name,
      material.progress.filter((item) => item.openedAt).length,
      material.progress.filter((item) => item.completedAt).length,
      material.createdAt.toISOString(),
    ]);
  } else if (type === "enquiries") {
    const enquiries = await database.websiteEnquiry.findMany({
      where: {
        ...(from || to
          ? {
              createdAt: {
                ...(from ? { gte: from } : {}),
                ...(to ? { lte: to } : {}),
              },
            }
          : {}),
      },
      include: { course: true },
      orderBy: { createdAt: "desc" },
    });
    header = [
      "name",
      "email",
      "phone",
      "course",
      "status",
      "message",
      "createdAt",
    ];
    rows = enquiries.map((item) => [
      item.name,
      item.email,
      item.phone ?? "",
      item.course?.title ?? "General enquiry",
      item.status,
      item.message ?? "",
      item.createdAt.toISOString(),
    ]);
  } else {
    const enrolments = await database.enrolment.findMany({
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
    });
    header = [
      "studentNumber",
      "name",
      "email",
      "batchCode",
      "course",
      "status",
      "completionPercent",
      "lastActivity",
      "enrolledAt",
      "accessEndsAt",
    ];
    rows = enrolments.map((item) => {
      const requiredIds = new Set(
        item.batch.modules.flatMap((module) =>
          module.classes.flatMap((classItem) =>
            classItem.materials.map((material) => material.id),
          ),
        ),
      );
      const completed = item.materialProgress.filter(
        (progress) =>
          requiredIds.has(progress.materialId) && progress.completedAt,
      ).length;
      const lastActivity = latestDate([
        ...item.materialProgress.map((progress) => progress.updatedAt),
        ...item.videoProgress.map((progress) => progress.updatedAt),
      ]);
      return [
        item.student.studentNumber,
        item.student.user.name,
        item.student.user.email,
        item.batch.code,
        item.batch.course.title,
        item.status,
        completionPercent(completed, requiredIds.size),
        lastActivity?.toISOString() ?? "",
        item.enrolledAt.toISOString(),
        item.accessEndsAt?.toISOString() ?? "",
      ];
    });
  }
  const csv = [header, ...rows]
    .map((row) => row.map(escapeCsv).join(","))
    .join("\n");
  const safeType = ["students", "batches", "materials", "enquiries"].includes(
    type,
  )
    ? type
    : "students";
  return new Response(csv, {
    headers: {
      "Content-Disposition": `attachment; filename="trade-tuter-${safeType}-report.csv"`,
      "Content-Type": "text/csv; charset=utf-8",
    },
  });
}
