import { ArrowLeft, CalendarRange, Mail, Phone } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  updateEnrolmentStatusAction,
  updateStudentProfileAction,
} from "@/app/actions/student-management";
import { EnrolStudentForm } from "@/components/students/enrol-student-form";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { permissions } from "@/lib/auth/constants";
import { hasPermission } from "@/lib/auth/policy";
import { requirePermission } from "@/lib/auth/session";
import { getDatabase } from "@/lib/db/client";

interface StudentDetailProps {
  params: Promise<{ studentId: string }>;
}

export default async function StudentDetailPage({
  params,
}: StudentDetailProps) {
  const { session } = await requirePermission(permissions.studentsManage);
  const { studentId } = await params;
  const database = getDatabase();
  const [student, batches] = await Promise.all([
    database.studentProfile.findUnique({
      where: { id: studentId },
      include: {
        user: true,
        enrolments: {
          include: { batch: { include: { course: true } } },
          orderBy: { enrolledAt: "desc" },
        },
      },
    }),
    database.batch.findMany({
      where: { status: { in: ["ENROLLING", "ACTIVE"] } },
      include: {
        _count: {
          select: {
            enrolments: { where: { status: { in: ["PENDING", "ACTIVE"] } } },
          },
        },
        course: true,
      },
      orderBy: { startsAt: "desc" },
    }),
  ]);
  if (!student) notFound();
  const canManageEnrolments = hasPermission(
    session.user.permissionKeys,
    permissions.enrolmentsManage,
  );
  const existingBatchIds = new Set(
    student.enrolments.map((item) => item.batchId),
  );
  const availableBatches = batches
    .filter((batch) => !existingBatchIds.has(batch.id))
    .map((batch) => ({
      id: batch.id,
      label: `${batch.code} · ${batch.course.title}`,
      available:
        batch.capacity === null
          ? null
          : Math.max(0, batch.capacity - batch._count.enrolments),
    }));
  const input =
    "h-10 w-full rounded-[var(--radius-control)] border border-border bg-white px-3 text-sm outline-none focus:border-primary";
  return (
    <main className="mx-auto max-w-7xl p-5 sm:p-8">
      <Link
        className={buttonVariants({ variant: "ghost", size: "sm" })}
        href="/admin/students"
      >
        <ArrowLeft className="size-4" /> Student directory
      </Link>
      <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <Badge
            variant={student.user.status === "ACTIVE" ? "soft" : "neutral"}
          >
            {student.user.status}
          </Badge>
          <h1 className="mt-3 text-3xl font-bold text-olive-950">
            {student.user.name}
          </h1>
          <div className="text-muted-foreground mt-2 flex flex-wrap gap-4 text-sm">
            <span className="flex items-center gap-1">
              <Mail className="size-4" />
              {student.user.email}
            </span>
            <span className="flex items-center gap-1">
              <Phone className="size-4" />
              {student.user.phone ?? "No phone"}
            </span>
          </div>
        </div>
        <p className="bg-silver-100 rounded-xl px-4 py-2 text-sm font-bold">
          {student.studentNumber}
        </p>
      </div>
      <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle>Batch enrolments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {student.enrolments.map((enrolment) => (
                <div
                  className="border-border rounded-xl border p-4"
                  key={enrolment.id}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-bold">{enrolment.batch.name}</p>
                      <p className="text-muted-foreground text-xs">
                        {enrolment.batch.code} · {enrolment.batch.course.title}
                      </p>
                    </div>
                    <Badge
                      variant={
                        enrolment.status === "ACTIVE" ? "soft" : "neutral"
                      }
                    >
                      {enrolment.status}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground mt-3 text-xs">
                    Access{" "}
                    {enrolment.accessStartsAt?.toLocaleDateString("en-IN") ??
                      "immediately"}{" "}
                    –{" "}
                    {enrolment.accessEndsAt?.toLocaleDateString("en-IN") ??
                      "no expiry"}
                  </p>
                  {canManageEnrolments ? (
                    <form
                      action={updateEnrolmentStatusAction}
                      className="mt-3 flex gap-2"
                    >
                      <input
                        name="enrolmentId"
                        type="hidden"
                        value={enrolment.id}
                      />
                      <input
                        name="studentId"
                        type="hidden"
                        value={student.id}
                      />
                      <select
                        className={`${input} max-w-48`}
                        defaultValue={enrolment.status}
                        name="status"
                      >
                        {(
                          [
                            "PENDING",
                            "ACTIVE",
                            "SUSPENDED",
                            "COMPLETED",
                            "CANCELLED",
                          ] as const
                        ).map((status) => (
                          <option key={status}>{status}</option>
                        ))}
                      </select>
                      <Button size="sm" type="submit" variant="outline">
                        Update
                      </Button>
                    </form>
                  ) : null}
                </div>
              ))}
              {!student.enrolments.length ? (
                <p className="text-muted-foreground p-5 text-center text-sm">
                  No batch enrolments yet.
                </p>
              ) : null}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Student profile</CardTitle>
            </CardHeader>
            <CardContent>
              <form
                action={updateStudentProfileAction}
                className="grid gap-4 sm:grid-cols-2"
              >
                <input name="studentId" type="hidden" value={student.id} />
                <Field
                  defaultValue={student.user.name}
                  label="Full name"
                  name="name"
                  required
                />
                <Field
                  defaultValue={student.studentNumber}
                  label="Student number"
                  name="studentNumber"
                  required
                />
                <Field
                  defaultValue={student.user.phone ?? ""}
                  label="Phone"
                  name="phone"
                />
                <Field
                  defaultValue={
                    student.dateOfBirth?.toISOString().slice(0, 10) ?? ""
                  }
                  label="Date of birth"
                  name="dateOfBirth"
                  type="date"
                />
                <Field
                  defaultValue={student.emergencyName ?? ""}
                  label="Emergency contact"
                  name="emergencyName"
                />
                <Field
                  defaultValue={student.emergencyPhone ?? ""}
                  label="Emergency phone"
                  name="emergencyPhone"
                />
                <label className="space-y-1.5 text-xs font-semibold sm:col-span-2">
                  <span>Address</span>
                  <textarea
                    className={`${input} min-h-20 py-2`}
                    defaultValue={student.address ?? ""}
                    name="address"
                  />
                </label>
                <Button className="sm:col-span-2" type="submit">
                  Save profile
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
        {canManageEnrolments ? (
          <aside>
            <Card className="sticky top-24">
              <CardHeader>
                <CalendarRange className="text-primary size-6" />
                <CardTitle>Enrol in batch</CardTitle>
              </CardHeader>
              <CardContent>
                <EnrolStudentForm
                  batches={availableBatches}
                  studentId={student.id}
                />
              </CardContent>
            </Card>
          </aside>
        ) : null}
      </div>
    </main>
  );
}

function Field({
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="space-y-1.5 text-xs font-semibold">
      <span>{label}</span>
      <input
        className="border-border focus:border-primary h-10 w-full rounded-[var(--radius-control)] border bg-white px-3 text-sm outline-none"
        {...props}
      />
    </label>
  );
}
