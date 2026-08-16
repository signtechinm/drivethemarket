"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { notificationEvents } from "@/lib/communications/events";
import {
  deliverPendingEmails,
  queueNotifications,
} from "@/lib/communications/notification-service";
import { permissions } from "@/lib/auth/constants";
import { requirePermission } from "@/lib/auth/session";
import { requireStudentProfile } from "@/lib/portal/student-scope";
import { getDatabase } from "@/lib/db/client";

export interface CommunicationActionState {
  success: boolean;
  message: string;
}

export async function createAnnouncementAction(
  _state: CommunicationActionState,
  formData: FormData,
): Promise<CommunicationActionState> {
  const { user: actor } = await requirePermission(
    permissions.communicationsManage,
  );
  const parsed = z
    .object({
      title: z.string().trim().min(3).max(140),
      body: z.string().trim().min(5).max(3000),
      batchId: z.string().optional(),
      expiresAt: z.string().optional(),
    })
    .safeParse({
      title: formData.get("title"),
      body: formData.get("body"),
      batchId: formData.get("batchId") || undefined,
      expiresAt: formData.get("expiresAt") || undefined,
    });
  if (!parsed.success)
    return { success: false, message: "Enter valid announcement details." };
  const announcement = await getDatabase().announcement.create({
    data: {
      authorId: actor.id,
      title: parsed.data.title,
      body: parsed.data.body,
      batchId: parsed.data.batchId,
      expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null,
    },
  });
  revalidatePath("/admin/communications");
  return {
    success: true,
    message: `${announcement.title} was saved as a draft.`,
  };
}

export async function publishAnnouncementAction(
  _state: CommunicationActionState,
  formData: FormData,
): Promise<CommunicationActionState> {
  const { user: actor } = await requirePermission(
    permissions.communicationsManage,
  );
  const announcementId = z
    .string()
    .min(1)
    .safeParse(formData.get("announcementId"));
  if (!announcementId.success)
    return { success: false, message: "Invalid announcement." };
  const database = getDatabase();
  const announcement = await database.announcement.findUnique({
    where: { id: announcementId.data },
  });
  if (!announcement)
    return { success: false, message: "Announcement not found." };
  if (announcement.publishedAt)
    return { success: false, message: "Announcement is already published." };
  const now = new Date();
  const users = announcement.batchId
    ? await database.user.findMany({
        where: {
          status: "ACTIVE",
          studentProfile: {
            enrolments: {
              some: {
                batchId: announcement.batchId,
                status: "ACTIVE",
                OR: [
                  { accessStartsAt: null },
                  { accessStartsAt: { lte: now } },
                ],
                AND: [
                  {
                    OR: [
                      { accessEndsAt: null },
                      { accessEndsAt: { gte: now } },
                    ],
                  },
                ],
              },
            },
          },
        },
        select: { id: true },
      })
    : await database.user.findMany({
        where: {
          status: "ACTIVE",
          roles: { some: { role: { key: "student" } } },
        },
        select: { id: true },
      });
  await database.$transaction([
    database.announcement.update({
      where: { id: announcement.id },
      data: { publishedAt: now },
    }),
    database.auditLog.create({
      data: {
        actorId: actor.id,
        action: "announcement.published",
        entityType: "Announcement",
        entityId: announcement.id,
        metadata: {
          batchId: announcement.batchId,
          recipients: users.length,
        },
      },
    }),
  ]);
  await queueNotifications({
    userIds: users.map((user) => user.id),
    eventKey: "announcement",
    subject: announcement.title,
    body: announcement.body,
    relatedEntityType: "Announcement",
    relatedEntityId: announcement.id,
  });
  revalidatePath("/admin/communications");
  revalidatePath("/portal/notifications");
  return {
    success: true,
    message: `Published to ${users.length} eligible student${users.length === 1 ? "" : "s"}.`,
  };
}

export async function processEmailOutboxAction(
  _state: CommunicationActionState,
): Promise<CommunicationActionState> {
  void _state;
  await requirePermission(permissions.communicationsManage);
  const result = await deliverPendingEmails();
  revalidatePath("/admin/communications");
  return {
    success: result.failed === 0,
    message: `Processed ${result.processed}: ${result.sent} sent, ${result.failed} failed.`,
  };
}

export async function queueExpiryNoticesAction(
  _state: CommunicationActionState,
): Promise<CommunicationActionState> {
  void _state;
  await requirePermission(permissions.communicationsManage);
  const now = new Date();
  const cutoff = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const enrolments = await getDatabase().enrolment.findMany({
    where: {
      status: "ACTIVE",
      accessEndsAt: { gte: now, lte: cutoff },
    },
    include: { student: true, batch: true },
  });
  for (const enrolment of enrolments)
    await queueNotifications({
      userIds: [enrolment.student.userId],
      eventKey: "enrolment_access",
      subject: "Your learning access is nearing expiry",
      body: `Access to ${enrolment.batch.name} expires on ${enrolment.accessEndsAt?.toLocaleDateString("en-IN")}.`,
      relatedEntityType: "Enrolment",
      relatedEntityId: `${enrolment.id}:expiry`,
      mandatory: true,
    });
  revalidatePath("/admin/communications");
  return {
    success: true,
    message: `Expiry notices queued for ${enrolments.length} enrolment${enrolments.length === 1 ? "" : "s"}.`,
  };
}

export async function updateNotificationPreferencesAction(formData: FormData) {
  const { user } = await requireStudentProfile();
  const database = getDatabase();
  for (const event of notificationEvents) {
    if (event.mandatory) continue;
    await database.notificationPreference.upsert({
      where: { userId_eventKey: { userId: user.id, eventKey: event.key } },
      update: {
        inAppEnabled: formData.get(`${event.key}:in_app`) === "on",
        emailEnabled: formData.get(`${event.key}:email`) === "on",
      },
      create: {
        userId: user.id,
        eventKey: event.key,
        inAppEnabled: formData.get(`${event.key}:in_app`) === "on",
        emailEnabled: formData.get(`${event.key}:email`) === "on",
      },
    });
  }
  revalidatePath("/portal/notifications");
}
