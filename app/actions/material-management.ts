"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { permissions } from "@/lib/auth/constants";
import { requireAnyPermission, requirePermission } from "@/lib/auth/session";
import { canReleaseMaterial } from "@/lib/materials/release-policy";
import { getDatabase } from "@/lib/db/client";
import {
  removePrivateMaterial,
  storePrivateMaterial,
  validateMaterialUpload,
} from "@/lib/storage/private-storage";
import { queueNotifications } from "@/lib/communications/notification-service";
import { getServerEnvironment } from "@/lib/env/server";

export interface MaterialActionState {
  success: boolean;
  message: string;
}

const materialTypes = [
  "DOCUMENT",
  "PRESENTATION",
  "IMAGE",
  "WORKSHEET",
  "ASSIGNMENT",
  "EXTERNAL_LINK",
  "VIDEO",
  "DOWNLOAD",
] as const;

async function canManageAssignedClass(userId: string, classId: string) {
  const session = await getDatabase().classSession.findUnique({
    where: { id: classId },
    select: {
      instructorId: true,
      module: {
        select: {
          batch: {
            select: {
              instructors: { where: { userId }, select: { userId: true } },
            },
          },
        },
      },
    },
  });
  return Boolean(
    session &&
    (session.instructorId === userId ||
      session.module.batch.instructors.length > 0),
  );
}

export async function createMaterialAction(
  _state: MaterialActionState,
  formData: FormData,
): Promise<MaterialActionState> {
  const { session, user: actor } = await requirePermission(
    permissions.materialsManage,
  );
  const parsed = z
    .object({
      classId: z.string().min(1),
      title: z.string().trim().min(2).max(140),
      description: z.string().trim().max(1000).optional(),
      type: z.enum(materialTypes),
      externalUrl: z.string().url().optional().or(z.literal("")),
      required: z.coerce.boolean().default(false),
      downloadAllowed: z.coerce.boolean().default(false),
    })
    .safeParse({
      classId: formData.get("classId"),
      title: formData.get("title"),
      description: formData.get("description") || undefined,
      type: formData.get("type"),
      externalUrl: formData.get("externalUrl") || "",
      required: formData.get("required") === "on",
      downloadAllowed: formData.get("downloadAllowed") === "on",
    });
  if (!parsed.success)
    return { success: false, message: "Enter valid material details." };
  if (
    session.user.roleKeys.includes("instructor") &&
    !(await canManageAssignedClass(actor.id, parsed.data.classId))
  )
    return { success: false, message: "You are not assigned to this class." };

  const fileValue = formData.get("file");
  const file = fileValue instanceof File && fileValue.size ? fileValue : null;
  if (parsed.data.type === "EXTERNAL_LINK" && !parsed.data.externalUrl)
    return { success: false, message: "Enter the external resource URL." };
  if (parsed.data.type !== "EXTERNAL_LINK" && !file)
    return { success: false, message: "Select a file to upload." };
  if (file) {
    const validationError = validateMaterialUpload(file);
    if (validationError) return { success: false, message: validationError };
    if (parsed.data.type === "VIDEO" && !file.type.startsWith("video/"))
      return {
        success: false,
        message: "Video materials require a video file.",
      };
  }

  const database = getDatabase();
  const position =
    (
      await database.material.aggregate({
        where: { classSessionId: parsed.data.classId },
        _max: { position: true },
      })
    )._max.position ?? 0;
  const storageKey = file ? await storePrivateMaterial(file) : null;
  const mimeType = file?.type ?? null;
  const sizeBytes = file?.size ?? null;
  try {
    await database.$transaction(async (transaction) => {
      const material = await transaction.material.create({
        data: {
          classSessionId: parsed.data.classId,
          uploadedById: actor.id,
          title: parsed.data.title,
          description: parsed.data.description || null,
          type: parsed.data.type,
          position: position + 1,
          required: parsed.data.required,
          downloadAllowed: parsed.data.downloadAllowed,
          storageKey,
          externalUrl: parsed.data.externalUrl || null,
          mimeType,
          sizeBytes: sizeBytes === null ? null : BigInt(sizeBytes),
          videoAsset:
            parsed.data.type === "VIDEO" && storageKey
              ? {
                  create: {
                    provider:
                      getServerEnvironment().VIDEO_PROVIDER === "streaming"
                        ? "private-object-streaming"
                        : "local-private",
                    providerKey: storageKey,
                    playbackReady: true,
                  },
                }
              : undefined,
        },
      });
      await transaction.auditLog.create({
        data: {
          actorId: actor.id,
          action: "material.created",
          entityType: "Material",
          entityId: material.id,
          metadata: { type: material.type },
        },
      });
    });
  } catch (error) {
    if (storageKey) await removePrivateMaterial(storageKey);
    throw error;
  }
  revalidatePath(`/admin/classes/${parsed.data.classId}/materials`);
  return { success: true, message: "Material saved as a draft." };
}

export async function submitMaterialForReviewAction(formData: FormData) {
  const { user: actor } = await requirePermission(permissions.materialsManage);
  const input = z
    .object({ materialId: z.string().min(1), classId: z.string().min(1) })
    .safeParse(Object.fromEntries(formData));
  if (!input.success) return;
  const database = getDatabase();
  await database.$transaction([
    database.material.update({
      where: {
        id: input.data.materialId,
        status: { in: ["DRAFT", "CHANGES_REQUESTED"] },
      },
      data: { status: "IN_REVIEW" },
    }),
    database.auditLog.create({
      data: {
        actorId: actor.id,
        action: "material.submitted",
        entityType: "Material",
        entityId: input.data.materialId,
      },
    }),
  ]);
  revalidatePath(`/admin/classes/${input.data.classId}/materials`);
}

export async function approveMaterialAction(formData: FormData) {
  const { user: actor } = await requirePermission(permissions.materialsApprove);
  const input = z
    .object({ materialId: z.string().min(1), classId: z.string().min(1) })
    .safeParse(Object.fromEntries(formData));
  if (!input.success) return;
  const database = getDatabase();
  await database.$transaction([
    database.material.update({
      where: { id: input.data.materialId, status: "IN_REVIEW" },
      data: { status: "APPROVED", approvedAt: new Date() },
    }),
    database.auditLog.create({
      data: {
        actorId: actor.id,
        action: "material.approved",
        entityType: "Material",
        entityId: input.data.materialId,
      },
    }),
  ]);
  revalidatePath(`/admin/classes/${input.data.classId}/materials`);
}

export async function markClassConductedAction(formData: FormData) {
  const { session, user: actor } = await requireAnyPermission([
    permissions.classesConduct,
    permissions.batchesManage,
  ]);
  const classId = z.string().min(1).safeParse(formData.get("classId"));
  if (!classId.success) return;
  if (
    session.user.permissionKeys.includes(permissions.classesConduct) &&
    !session.user.permissionKeys.includes(permissions.batchesManage) &&
    !(await canManageAssignedClass(actor.id, classId.data))
  )
    return;
  const database = getDatabase();
  await database.$transaction([
    database.classSession.update({
      where: { id: classId.data, status: { in: ["SCHEDULED", "RESCHEDULED"] } },
      data: { status: "CONDUCTED", conductedAt: new Date() },
    }),
    database.auditLog.create({
      data: {
        actorId: actor.id,
        action: "class.conducted",
        entityType: "ClassSession",
        entityId: classId.data,
      },
    }),
  ]);
  revalidatePath(`/admin/classes/${classId.data}/materials`);
}

export async function completeClassAction(formData: FormData) {
  const { user: actor } = await requirePermission(permissions.classesComplete);
  const classId = z.string().min(1).safeParse(formData.get("classId"));
  if (!classId.success) return;
  const database = getDatabase();
  await database.$transaction([
    database.classSession.update({
      where: { id: classId.data, status: "CONDUCTED" },
      data: { status: "COMPLETED", completedAt: new Date() },
    }),
    database.auditLog.create({
      data: {
        actorId: actor.id,
        action: "class.completed",
        entityType: "ClassSession",
        entityId: classId.data,
      },
    }),
  ]);
  revalidatePath(`/admin/classes/${classId.data}/materials`);
}

export async function releaseMaterialAction(
  _state: MaterialActionState,
  formData: FormData,
): Promise<MaterialActionState> {
  const { user: actor } = await requirePermission(permissions.materialsRelease);
  const input = z
    .object({ materialId: z.string().min(1), classId: z.string().min(1) })
    .safeParse(Object.fromEntries(formData));
  if (!input.success) return { success: false, message: "Invalid material." };
  const database = getDatabase();
  const material = await database.material.findUnique({
    where: { id: input.data.materialId },
    include: {
      videoAsset: true,
      classSession: { include: { module: true } },
    },
  });
  if (
    !material ||
    !canReleaseMaterial(material.classSession.status, {
      status: material.status,
      type: material.type,
      playbackReady: material.videoAsset?.playbackReady,
    })
  )
    return {
      success: false,
      message: "Complete the class and approve ready content before release.",
    };
  const enrolments = await database.enrolment.findMany({
    where: {
      batchId: material.classSession.module.batchId,
      status: "ACTIVE",
    },
    select: { student: { select: { userId: true } } },
  });
  await database.$transaction(async (transaction) => {
    await transaction.material.update({
      where: { id: material.id },
      data: { status: "RELEASED" },
    });
    await transaction.classSession.update({
      where: { id: material.classSessionId },
      data: { status: "RELEASED", releasedAt: new Date() },
    });
    await transaction.materialRelease.create({
      data: { materialId: material.id, actorId: actor.id },
    });
    await transaction.auditLog.create({
      data: {
        actorId: actor.id,
        action: "material.released",
        entityType: "Material",
        entityId: material.id,
        metadata: { notifiedStudents: enrolments.length },
      },
    });
  });
  await queueNotifications({
    userIds: enrolments.map(({ student }) => student.userId),
    eventKey: "material_release",
    subject: `New material: ${material.title}`,
    body: `${material.title} is now available in Drive the Market.`,
    relatedEntityType: "Material",
    relatedEntityId: material.id,
  });
  revalidatePath(`/admin/classes/${input.data.classId}/materials`);
  revalidatePath("/portal");
  return { success: true, message: "Material released to eligible students." };
}

export async function relockMaterialAction(
  _state: MaterialActionState,
  formData: FormData,
): Promise<MaterialActionState> {
  const { user: actor } = await requirePermission(permissions.materialsRelease);
  const input = z
    .object({
      materialId: z.string().min(1),
      classId: z.string().min(1),
      reason: z.string().trim().min(5).max(500),
    })
    .safeParse(Object.fromEntries(formData));
  if (!input.success)
    return { success: false, message: "Enter a re-lock reason." };
  const database = getDatabase();
  await database.$transaction([
    database.material.update({
      where: { id: input.data.materialId, status: "RELEASED" },
      data: { status: "RELOCKED" },
    }),
    database.materialRelease.updateMany({
      where: { materialId: input.data.materialId, revokedAt: null },
      data: { revokedAt: new Date(), revokeReason: input.data.reason },
    }),
    database.auditLog.create({
      data: {
        actorId: actor.id,
        action: "material.relocked",
        entityType: "Material",
        entityId: input.data.materialId,
        metadata: { reason: input.data.reason },
      },
    }),
  ]);
  revalidatePath(`/admin/classes/${input.data.classId}/materials`);
  revalidatePath("/portal");
  return { success: true, message: "Student access was revoked immediately." };
}
