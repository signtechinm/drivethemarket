"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { hasBatchCapacity } from "@/lib/students/access-policy";
import { parseStudentImportCsv } from "@/lib/students/csv";
import {
  deliverPendingEmails,
  queueNotifications,
} from "@/lib/communications/notification-service";
import { permissions } from "@/lib/auth/constants";
import { requirePermission } from "@/lib/auth/session";
import {
  createOpaqueToken,
  expiresInHours,
  INVITATION_TTL_HOURS,
} from "@/lib/auth/tokens";
import { getDatabase } from "@/lib/db/client";
import { getServerEnvironment } from "@/lib/env/server";

export interface StudentActionState {
  success: boolean;
  message: string;
  studentId?: string;
  developmentInvitationUrl?: string;
}

const optionalText = z
  .string()
  .trim()
  .optional()
  .transform((value) => value || undefined);

const studentSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z
    .string()
    .trim()
    .email()
    .transform((value) => value.toLowerCase()),
  phone: optionalText,
  studentNumber: z
    .string()
    .trim()
    .min(2)
    .max(40)
    .transform((value) => value.toUpperCase()),
  address: optionalText,
  dateOfBirth: optionalText,
  emergencyName: optionalText,
  emergencyPhone: optionalText,
});

export async function createStudentAction(
  _state: StudentActionState,
  formData: FormData,
): Promise<StudentActionState> {
  const { user: actor } = await requirePermission(permissions.studentsManage);
  const parsed = studentSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success)
    return { success: false, message: "Enter valid student details." };
  const database = getDatabase();
  const [existingUser, existingNumber, studentRole] = await Promise.all([
    database.user.findUnique({ where: { email: parsed.data.email } }),
    database.studentProfile.findUnique({
      where: { studentNumber: parsed.data.studentNumber },
    }),
    database.role.findUnique({ where: { key: "student" } }),
  ]);
  if (existingUser)
    return { success: false, message: "This email is already registered." };
  if (existingNumber)
    return { success: false, message: "This student number already exists." };
  if (!studentRole)
    return { success: false, message: "The Student role is not configured." };

  const { token, tokenHash } = createOpaqueToken();
  const student = await database.$transaction(async (transaction) => {
    const user = await transaction.user.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        phone: parsed.data.phone,
        status: "INVITED",
        invitedAt: new Date(),
        roles: { create: { roleId: studentRole.id } },
        invitationTokens: {
          create: {
            tokenHash,
            expiresAt: expiresInHours(INVITATION_TTL_HOURS),
          },
        },
        studentProfile: {
          create: {
            studentNumber: parsed.data.studentNumber,
            address: parsed.data.address,
            dateOfBirth: parsed.data.dateOfBirth
              ? new Date(parsed.data.dateOfBirth)
              : undefined,
            emergencyName: parsed.data.emergencyName,
            emergencyPhone: parsed.data.emergencyPhone,
          },
        },
      },
      include: { studentProfile: true },
    });
    await transaction.auditLog.create({
      data: {
        actorId: actor.id,
        action: "student.registered",
        entityType: "StudentProfile",
        entityId: user.studentProfile?.id,
      },
    });
    return user.studentProfile;
  });
  if (!student)
    return { success: false, message: "The student profile was not created." };
  await queueNotifications({
    userIds: [student.userId],
    eventKey: "account_invitation",
    subject: "Welcome to Drive the Market",
    body: "Your student account is ready. Use your invitation link to set a password.",
    relatedEntityType: "StudentProfile",
    relatedEntityId: student.id,
    mandatory: true,
  });
  const delivery = await deliverPendingEmails(1, {
    userIds: [student.userId],
    eventKeys: ["account_invitation"],
  });
  const mailerIsLive = getServerEnvironment().EMAIL_PROVIDER !== "log";
  revalidatePath("/admin/students");
  return {
    success: true,
    message:
      delivery.sent > 0
        ? mailerIsLive
          ? `${parsed.data.name} was registered and the invitation email was sent.`
          : `${parsed.data.name} was registered. The development mailer logged the invitation.`
        : `${parsed.data.name} was registered, but email delivery failed. The invitation remains in Communications for retry.`,
    studentId: student.id,
    developmentInvitationUrl:
      process.env.NODE_ENV === "production"
        ? undefined
        : `${getServerEnvironment().NEXT_PUBLIC_APP_URL}/accept-invitation/${token}`,
  };
}

export async function updateStudentProfileAction(formData: FormData) {
  const { user: actor } = await requirePermission(permissions.studentsManage);
  const studentId = z.string().min(1).safeParse(formData.get("studentId"));
  const parsed = studentSchema.omit({ email: true }).safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    studentNumber: formData.get("studentNumber"),
    address: formData.get("address"),
    dateOfBirth: formData.get("dateOfBirth"),
    emergencyName: formData.get("emergencyName"),
    emergencyPhone: formData.get("emergencyPhone"),
  });
  if (!studentId.success || !parsed.success) return;
  const database = getDatabase();
  const profile = await database.studentProfile.findUnique({
    where: { id: studentId.data },
  });
  if (!profile) return;
  await database.$transaction([
    database.user.update({
      where: { id: profile.userId },
      data: { name: parsed.data.name, phone: parsed.data.phone ?? null },
    }),
    database.studentProfile.update({
      where: { id: profile.id },
      data: {
        studentNumber: parsed.data.studentNumber,
        address: parsed.data.address ?? null,
        dateOfBirth: parsed.data.dateOfBirth
          ? new Date(parsed.data.dateOfBirth)
          : null,
        emergencyName: parsed.data.emergencyName ?? null,
        emergencyPhone: parsed.data.emergencyPhone ?? null,
      },
    }),
    database.auditLog.create({
      data: {
        actorId: actor.id,
        action: "student.profile_updated",
        entityType: "StudentProfile",
        entityId: profile.id,
      },
    }),
  ]);
  revalidatePath(`/admin/students/${profile.id}`);
  revalidatePath("/admin/students");
}

const enrolmentSchema = z
  .object({
    studentId: z.string().min(1),
    batchId: z.string().min(1),
    status: z.enum(["PENDING", "ACTIVE"]),
    accessStartsAt: optionalText,
    accessEndsAt: optionalText,
    notes: optionalText,
  })
  .refine(
    (value) =>
      !value.accessStartsAt ||
      !value.accessEndsAt ||
      new Date(value.accessEndsAt) >= new Date(value.accessStartsAt),
    { message: "Access end must follow access start." },
  );

export async function enrolStudentAction(
  _state: StudentActionState,
  formData: FormData,
): Promise<StudentActionState> {
  const { user: actor } = await requirePermission(permissions.enrolmentsManage);
  const parsed = enrolmentSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success)
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Enter valid enrolment data.",
    };
  const database = getDatabase();
  const result = await database.$transaction(async (transaction) => {
    const [duplicate, batch, occupied] = await Promise.all([
      transaction.enrolment.findUnique({
        where: {
          studentId_batchId: {
            studentId: parsed.data.studentId,
            batchId: parsed.data.batchId,
          },
        },
      }),
      transaction.batch.findUnique({ where: { id: parsed.data.batchId } }),
      transaction.enrolment.count({
        where: {
          batchId: parsed.data.batchId,
          status: { in: ["PENDING", "ACTIVE"] },
        },
      }),
    ]);
    if (duplicate) return "This student is already enrolled in the batch.";
    if (!batch) return "The selected batch no longer exists.";
    if (!hasBatchCapacity(batch.capacity, occupied))
      return "This batch has reached its capacity.";
    const enrolment = await transaction.enrolment.create({
      data: {
        studentId: parsed.data.studentId,
        batchId: parsed.data.batchId,
        status: parsed.data.status,
        accessStartsAt: parsed.data.accessStartsAt
          ? new Date(parsed.data.accessStartsAt)
          : null,
        accessEndsAt: parsed.data.accessEndsAt
          ? new Date(parsed.data.accessEndsAt)
          : null,
        notes: parsed.data.notes,
      },
    });
    await transaction.auditLog.create({
      data: {
        actorId: actor.id,
        action: "enrolment.created",
        entityType: "Enrolment",
        entityId: enrolment.id,
        metadata: { status: enrolment.status },
      },
    });
    return null;
  });
  if (result) return { success: false, message: result };
  const enrolledStudent = await database.studentProfile.findUnique({
    where: { id: parsed.data.studentId },
    select: { userId: true },
  });
  const enrolledBatch = await database.batch.findUnique({
    where: { id: parsed.data.batchId },
    select: { name: true },
  });
  if (enrolledStudent && enrolledBatch)
    await queueNotifications({
      userIds: [enrolledStudent.userId],
      eventKey: "batch_enrolment",
      subject: "Batch enrolment created",
      body: `You have been enrolled in ${enrolledBatch.name}.`,
      relatedEntityType: "Batch",
      relatedEntityId: parsed.data.batchId,
    });
  revalidatePath("/admin/students");
  revalidatePath(`/admin/students/${parsed.data.studentId}`);
  return { success: true, message: "The batch enrolment was created." };
}

export async function updateEnrolmentStatusAction(formData: FormData) {
  const { user: actor } = await requirePermission(permissions.enrolmentsManage);
  const parsed = z
    .object({
      enrolmentId: z.string().min(1),
      studentId: z.string().min(1),
      status: z.enum([
        "PENDING",
        "ACTIVE",
        "SUSPENDED",
        "COMPLETED",
        "CANCELLED",
      ]),
    })
    .safeParse(Object.fromEntries(formData));
  if (!parsed.success) return;
  const database = getDatabase();
  await database.$transaction([
    database.enrolment.update({
      where: { id: parsed.data.enrolmentId },
      data: { status: parsed.data.status },
    }),
    database.auditLog.create({
      data: {
        actorId: actor.id,
        action: "enrolment.status_changed",
        entityType: "Enrolment",
        entityId: parsed.data.enrolmentId,
        metadata: { status: parsed.data.status },
      },
    }),
  ]);
  if (parsed.data.status === "SUSPENDED") {
    const enrolment = await database.enrolment.findUnique({
      where: { id: parsed.data.enrolmentId },
      include: { student: true, batch: true },
    });
    if (enrolment)
      await queueNotifications({
        userIds: [enrolment.student.userId],
        eventKey: "enrolment_access",
        subject: "Learning access suspended",
        body: `Your access to ${enrolment.batch.name} has been suspended. Contact the institution for assistance.`,
        relatedEntityType: "Enrolment",
        relatedEntityId: `${enrolment.id}:suspended`,
        mandatory: true,
      });
  }
  revalidatePath(`/admin/students/${parsed.data.studentId}`);
  revalidatePath("/admin/students");
}

export interface ImportActionState {
  success: boolean;
  message: string;
  imported: number;
  errors: string[];
}

export async function importStudentsAction(
  _state: ImportActionState,
  formData: FormData,
): Promise<ImportActionState> {
  const { user: actor } = await requirePermission(permissions.studentsManage);
  if (!actor) return _state;
  const csv = z.string().min(1).safeParse(formData.get("csv"));
  if (!csv.success)
    return {
      success: false,
      message: "Select a CSV file.",
      imported: 0,
      errors: [],
    };
  const rows = parseStudentImportCsv(csv.data);
  const errors = rows.flatMap((row) =>
    row.errors.map((error) => `Row ${row.row}: ${error}`),
  );
  if (!rows.length)
    return {
      success: false,
      message: "The CSV has no student rows.",
      imported: 0,
      errors,
    };

  const database = getDatabase();
  const studentRole = await database.role.findUnique({
    where: { key: "student" },
  });
  if (!studentRole)
    return {
      success: false,
      message: "Student role is missing.",
      imported: 0,
      errors,
    };
  let imported = 0;
  for (const row of rows.filter((item) => !item.errors.length)) {
    const [existingUser, existingNumber, batch] = await Promise.all([
      database.user.findUnique({ where: { email: row.email } }),
      database.studentProfile.findUnique({
        where: { studentNumber: row.studentNumber },
      }),
      database.batch.findUnique({ where: { code: row.batchCode } }),
    ]);
    if (existingUser || existingNumber || !batch) {
      errors.push(
        `Row ${row.row}: ${existingUser ? "email already exists" : existingNumber ? "student number already exists" : "batch not found"}`,
      );
      continue;
    }
    const occupied = await database.enrolment.count({
      where: { batchId: batch.id, status: { in: ["PENDING", "ACTIVE"] } },
    });
    if (!hasBatchCapacity(batch.capacity, occupied)) {
      errors.push(`Row ${row.row}: batch is full`);
      continue;
    }
    const { tokenHash } = createOpaqueToken();
    await database.$transaction(async (transaction) => {
      const user = await transaction.user.create({
        data: {
          name: row.name,
          email: row.email,
          phone: row.phone || null,
          status: "INVITED",
          invitedAt: new Date(),
          roles: { create: { roleId: studentRole.id } },
          invitationTokens: {
            create: {
              tokenHash,
              expiresAt: expiresInHours(INVITATION_TTL_HOURS),
            },
          },
          studentProfile: { create: { studentNumber: row.studentNumber } },
        },
        include: { studentProfile: true },
      });
      if (!user.studentProfile)
        throw new Error("Student profile creation failed.");
      await transaction.enrolment.create({
        data: {
          studentId: user.studentProfile.id,
          batchId: batch.id,
          status: "PENDING",
          accessStartsAt: row.accessStartsAt
            ? new Date(row.accessStartsAt)
            : null,
          accessEndsAt: row.accessEndsAt ? new Date(row.accessEndsAt) : null,
        },
      });
      await transaction.auditLog.create({
        data: {
          actorId: actor.id,
          action: "student.bulk_registered",
          entityType: "StudentProfile",
          entityId: user.studentProfile.id,
          metadata: { batchCode: row.batchCode, row: row.row },
        },
      });
    });
    imported += 1;
  }
  revalidatePath("/admin/students");
  return {
    success: imported > 0,
    message: `${imported} student${imported === 1 ? "" : "s"} imported; ${errors.length} issue${errors.length === 1 ? "" : "s"}.`,
    imported,
    errors,
  };
}
