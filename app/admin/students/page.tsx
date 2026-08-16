import { Download, Search, UserRoundPlus, Users } from "lucide-react";
import Link from "next/link";

import { CreateStudentForm } from "@/components/students/create-student-form";
import { StudentImportForm } from "@/components/students/student-import-form";
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
import { EnrolmentStatus, Prisma, UserStatus } from "@/generated/prisma/client";

interface StudentsPageProps {
  searchParams: Promise<{ q?: string; status?: string; enrolment?: string }>;
}

export default async function StudentsPage({
  searchParams,
}: StudentsPageProps) {
  await requirePermission(permissions.studentsManage);
  const filters = await searchParams;
  const q = filters.q?.trim() ?? "";
  const userStatuses = ["INVITED", "ACTIVE", "SUSPENDED", "DEACTIVATED"];
  const enrolmentStatuses = [
    "PENDING",
    "ACTIVE",
    "SUSPENDED",
    "COMPLETED",
    "CANCELLED",
  ];
  const database = getDatabase();
  const conditions: Prisma.StudentProfileWhereInput[] = [];
  if (q)
    conditions.push({
      OR: [
        { studentNumber: { contains: q, mode: "insensitive" } },
        { user: { name: { contains: q, mode: "insensitive" } } },
        { user: { email: { contains: q, mode: "insensitive" } } },
      ],
    });
  if (userStatuses.includes(filters.status ?? ""))
    conditions.push({ user: { status: filters.status as UserStatus } });
  if (enrolmentStatuses.includes(filters.enrolment ?? ""))
    conditions.push({
      enrolments: {
        some: { status: filters.enrolment as EnrolmentStatus },
      },
    });
  const students = await database.studentProfile.findMany({
    where: conditions.length ? { AND: conditions } : undefined,
    include: {
      user: true,
      enrolments: { include: { batch: true }, orderBy: { enrolledAt: "desc" } },
    },
    orderBy: { user: { name: "asc" } },
  });
  const input =
    "h-10 rounded-[var(--radius-control)] border border-border bg-white px-3 text-sm outline-none focus:border-primary";
  return (
    <main className="mx-auto max-w-7xl p-5 sm:p-8">
      <Badge variant="soft">Student operations</Badge>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-olive-950">
            Student directory
          </h1>
          <p className="text-muted-foreground mt-2">
            Register students, manage accounts, and control batch access.
          </p>
        </div>
        <Link
          className={buttonVariants({ variant: "outline" })}
          href="/api/admin/enrolments/export"
        >
          <Download className="size-4" /> Export enrolments
        </Link>
      </div>
      <form className="mt-7 flex flex-wrap gap-2">
        <label className="relative min-w-60 flex-1">
          <Search className="text-muted-foreground absolute top-3 left-3 size-4" />
          <input
            className={`${input} w-full pl-9`}
            defaultValue={q}
            name="q"
            placeholder="Search name, email, or student number"
          />
        </label>
        <select
          className={input}
          defaultValue={filters.status ?? ""}
          name="status"
        >
          <option value="">All account statuses</option>
          {userStatuses.map((status) => (
            <option key={status}>{status}</option>
          ))}
        </select>
        <select
          className={input}
          defaultValue={filters.enrolment ?? ""}
          name="enrolment"
        >
          <option value="">All enrolments</option>
          {enrolmentStatuses.map((status) => (
            <option key={status}>{status}</option>
          ))}
        </select>
        <button className={buttonVariants()} type="submit">
          Filter
        </button>
      </form>
      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_390px]">
        <div className="space-y-3">
          {students.map((student) => (
            <Link href={`/admin/students/${student.id}`} key={student.id}>
              <Card className="mb-3 transition hover:border-olive-300">
                <CardContent className="flex flex-wrap items-center gap-4 p-5">
                  <span className="text-primary grid size-11 place-items-center rounded-xl bg-olive-100">
                    <Users className="size-5" />
                  </span>
                  <div className="min-w-48 flex-1">
                    <p className="font-bold text-olive-950">
                      {student.user.name}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {student.studentNumber} · {student.user.email}
                    </p>
                  </div>
                  <Badge
                    variant={
                      student.user.status === "ACTIVE" ? "soft" : "neutral"
                    }
                  >
                    {student.user.status}
                  </Badge>
                  <div className="min-w-36 text-right text-xs">
                    <strong>{student.enrolments.length} enrolments</strong>
                    <p className="text-muted-foreground mt-1">
                      {student.enrolments[0]?.batch.name ?? "No batch yet"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
          {!students.length ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Users className="text-primary mx-auto size-9" />
                <p className="text-muted-foreground mt-3 text-sm">
                  No students match these filters.
                </p>
              </CardContent>
            </Card>
          ) : null}
        </div>
        <aside className="space-y-5">
          <Card>
            <CardHeader>
              <UserRoundPlus className="text-primary size-6" />
              <CardTitle>Register student</CardTitle>
              <CardDescription>
                Creates an invited account and student profile.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CreateStudentForm />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Bulk CSV import</CardTitle>
              <CardDescription>
                Preview rows before valid students and pending enrolments are
                committed.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <StudentImportForm />
            </CardContent>
          </Card>
        </aside>
      </div>
    </main>
  );
}
