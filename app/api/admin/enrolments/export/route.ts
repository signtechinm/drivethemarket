import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth/options";
import { permissions } from "@/lib/auth/constants";
import { getDatabase } from "@/lib/db/client";
import { escapeCsv } from "@/lib/students/csv";

export async function GET() {
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
          ({ permission }) => permission.key === permissions.enrolmentsManage,
        ),
    );
  if (!allowed) return new Response("Forbidden", { status: 403 });
  const enrolments = await database.enrolment.findMany({
    include: {
      student: { include: { user: true } },
      batch: { include: { course: true } },
    },
    orderBy: { enrolledAt: "desc" },
  });
  const header = [
    "studentNumber",
    "name",
    "email",
    "batchCode",
    "course",
    "status",
    "enrolledAt",
    "accessStartsAt",
    "accessEndsAt",
  ];
  const lines = enrolments.map((item) =>
    [
      item.student.studentNumber,
      item.student.user.name,
      item.student.user.email,
      item.batch.code,
      item.batch.course.title,
      item.status,
      item.enrolledAt.toISOString(),
      item.accessStartsAt?.toISOString() ?? "",
      item.accessEndsAt?.toISOString() ?? "",
    ]
      .map(escapeCsv)
      .join(","),
  );
  return new Response([header.join(","), ...lines].join("\n"), {
    headers: {
      "Content-Disposition":
        'attachment; filename="trade-tuter-enrolments.csv"',
      "Content-Type": "text/csv; charset=utf-8",
    },
  });
}
