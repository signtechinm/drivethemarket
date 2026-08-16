"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { buildBatchModuleCopies } from "@/lib/academics/clone-template";
import { permissions } from "@/lib/auth/constants";
import { requirePermission } from "@/lib/auth/session";
import { getDatabase } from "@/lib/db/client";
import { queueNotifications } from "@/lib/communications/notification-service";

export interface BatchActionState {
  success: boolean;
  message: string;
  batchId?: string;
}

const batchSchema = z
  .object({
    courseId: z.string().min(1),
    syllabusId: z.string().min(1),
    code: z
      .string()
      .trim()
      .min(3)
      .max(30)
      .transform((value) => value.toUpperCase()),
    name: z.string().trim().min(3).max(120),
    capacity: z.coerce.number().int().min(1).max(10000),
    startsAt: z.coerce.date(),
    endsAt: z.coerce.date(),
    instructorId: z.string().optional(),
  })
  .refine((value) => value.endsAt >= value.startsAt, {
    message: "End date must follow start date.",
  });

export async function createBatchAction(
  _state: BatchActionState,
  formData: FormData,
): Promise<BatchActionState> {
  const { user: actor } = await requirePermission(permissions.batchesManage);
  const parsed = batchSchema.safeParse({
    courseId: formData.get("courseId"),
    syllabusId: formData.get("syllabusId"),
    code: formData.get("code"),
    name: formData.get("name"),
    capacity: formData.get("capacity"),
    startsAt: formData.get("startsAt"),
    endsAt: formData.get("endsAt"),
    instructorId: formData.get("instructorId") || undefined,
  });
  if (!parsed.success)
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Enter valid batch details.",
    };

  const database = getDatabase();
  if (await database.batch.findUnique({ where: { code: parsed.data.code } }))
    return { success: false, message: "The batch code already exists." };
  const syllabus = await database.syllabusTemplate.findFirst({
    where: {
      id: parsed.data.syllabusId,
      courseId: parsed.data.courseId,
      publishedAt: { not: null },
    },
    include: {
      modules: { include: { classes: true }, orderBy: { position: "asc" } },
    },
  });
  if (!syllabus)
    return {
      success: false,
      message: "Select a published syllabus for this course.",
    };

  const batch = await database.$transaction(async (transaction) => {
    const created = await transaction.batch.create({
      data: {
        courseId: parsed.data.courseId,
        code: parsed.data.code,
        name: parsed.data.name,
        capacity: parsed.data.capacity,
        startsAt: parsed.data.startsAt,
        endsAt: parsed.data.endsAt,
        status: "DRAFT",
        modules: { create: buildBatchModuleCopies(syllabus.modules) },
        instructors: parsed.data.instructorId
          ? { create: { userId: parsed.data.instructorId } }
          : undefined,
      },
    });
    if (parsed.data.instructorId) {
      await transaction.classSession.updateMany({
        where: { module: { batchId: created.id } },
        data: { instructorId: parsed.data.instructorId },
      });
    }
    await transaction.auditLog.create({
      data: {
        actorId: actor.id,
        action: "batch.created",
        entityType: "Batch",
        entityId: created.id,
        metadata: { syllabusId: syllabus.id },
      },
    });
    return created;
  });
  revalidatePath("/admin/batches");
  return {
    success: true,
    message: `${batch.name} was created with an independent syllabus.`,
    batchId: batch.id,
  };
}

export async function updateBatchStatusAction(formData: FormData) {
  const { user: actor } = await requirePermission(permissions.batchesManage);
  const input = z
    .object({
      batchId: z.string().min(1),
      status: z.enum(["DRAFT", "ENROLLING", "ACTIVE", "COMPLETED", "ARCHIVED"]),
    })
    .safeParse({
      batchId: formData.get("batchId"),
      status: formData.get("status"),
    });
  if (!input.success) return;
  await getDatabase().$transaction([
    getDatabase().batch.update({
      where: { id: input.data.batchId },
      data: { status: input.data.status },
    }),
    getDatabase().auditLog.create({
      data: {
        actorId: actor.id,
        action: "batch.status_changed",
        entityType: "Batch",
        entityId: input.data.batchId,
        metadata: { status: input.data.status },
      },
    }),
  ]);
  revalidatePath("/admin/batches");
  revalidatePath(`/admin/batches/${input.data.batchId}`);
}

export async function scheduleClassAction(formData: FormData) {
  const { user: actor } = await requirePermission(permissions.batchesManage);
  const input = z
    .object({
      classId: z.string().min(1),
      batchId: z.string().min(1),
      scheduledAt: z.coerce.date(),
      instructorId: z.string().optional(),
      liveClassUrl: z.string().url().optional().or(z.literal("")),
    })
    .safeParse({
      classId: formData.get("classId"),
      batchId: formData.get("batchId"),
      scheduledAt: formData.get("scheduledAt"),
      instructorId: formData.get("instructorId") || undefined,
      liveClassUrl: formData.get("liveClassUrl") || "",
    });
  if (!input.success) return;
  await getDatabase().$transaction([
    getDatabase().classSession.update({
      where: { id: input.data.classId },
      data: {
        scheduledAt: input.data.scheduledAt,
        instructorId: input.data.instructorId,
        liveClassUrl: input.data.liveClassUrl || null,
        status: "SCHEDULED",
      },
    }),
    getDatabase().auditLog.create({
      data: {
        actorId: actor.id,
        action: "class.scheduled",
        entityType: "ClassSession",
        entityId: input.data.classId,
      },
    }),
  ]);
  const scheduledClass = await getDatabase().classSession.findUnique({
    where: { id: input.data.classId },
    include: { module: true },
  });
  if (scheduledClass) {
    const recipients = await getDatabase().enrolment.findMany({
      where: { batchId: scheduledClass.module.batchId, status: "ACTIVE" },
      select: { student: { select: { userId: true } } },
    });
    await queueNotifications({
      userIds: recipients.map((item) => item.student.userId),
      eventKey: "class_schedule",
      subject: `Class schedule updated: ${scheduledClass.title}`,
      body: `The class is scheduled for ${input.data.scheduledAt.toLocaleString("en-IN")}.`,
      relatedEntityType: "ClassSession",
      relatedEntityId: `${scheduledClass.id}:${input.data.scheduledAt.toISOString()}`,
    });
  }
  revalidatePath(`/admin/batches/${input.data.batchId}`);
}

export async function updateClassStatusAction(formData: FormData) {
  const { user: actor } = await requirePermission(permissions.batchesManage);
  const input = z
    .object({
      classId: z.string().min(1),
      batchId: z.string().min(1),
      status: z.enum(["DRAFT", "SCHEDULED", "RESCHEDULED", "CANCELLED"]),
    })
    .safeParse({
      classId: formData.get("classId"),
      batchId: formData.get("batchId"),
      status: formData.get("status"),
    });
  if (!input.success) return;
  await getDatabase().$transaction([
    getDatabase().classSession.update({
      where: { id: input.data.classId },
      data: { status: input.data.status },
    }),
    getDatabase().auditLog.create({
      data: {
        actorId: actor.id,
        action: "class.status_changed",
        entityType: "ClassSession",
        entityId: input.data.classId,
        metadata: { status: input.data.status },
      },
    }),
  ]);
  revalidatePath(`/admin/batches/${input.data.batchId}`);
}
