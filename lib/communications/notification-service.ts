import "server-only";

import type { NotificationEventKey } from "@/lib/communications/events";
import { renderTradeTuterEmail } from "@/lib/communications/email-template";
import { sendTransactionalEmail } from "@/lib/communications/email-provider";
import { getDatabase } from "@/lib/db/client";
import {
  createOpaqueToken,
  expiresInHours,
  INVITATION_TTL_HOURS,
} from "@/lib/auth/tokens";
import { getServerEnvironment } from "@/lib/env/server";

export interface QueueNotificationInput {
  userIds: string[];
  eventKey: NotificationEventKey;
  subject: string;
  body: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
  mandatory?: boolean;
}

export async function queueNotifications(input: QueueNotificationInput) {
  const userIds = [...new Set(input.userIds)];
  if (!userIds.length) return 0;
  const database = getDatabase();
  const preferences = await database.notificationPreference.findMany({
    where: { userId: { in: userIds }, eventKey: input.eventKey },
  });
  const preferenceMap = new Map(preferences.map((item) => [item.userId, item]));
  const existing = input.relatedEntityId
    ? await database.notification.findMany({
        where: {
          userId: { in: userIds },
          eventKey: input.eventKey,
          relatedEntityId: input.relatedEntityId,
        },
        select: { userId: true, channel: true },
      })
    : [];
  const existingKeys = new Set(
    existing.map((item) => `${item.userId}:${item.channel}`),
  );
  const data = userIds.flatMap((userId) => {
    const preference = preferenceMap.get(userId);
    const inApp = input.mandatory || preference?.inAppEnabled !== false;
    const email = input.mandatory || preference?.emailEnabled !== false;
    return [
      ...(inApp && !existingKeys.has(`${userId}:IN_APP`)
        ? [
            {
              userId,
              channel: "IN_APP" as const,
              status: "SENT" as const,
              subject: input.subject,
              body: input.body,
              eventKey: input.eventKey,
              relatedEntityType: input.relatedEntityType,
              relatedEntityId: input.relatedEntityId,
              sentAt: new Date(),
            },
          ]
        : []),
      ...(email && !existingKeys.has(`${userId}:EMAIL`)
        ? [
            {
              userId,
              channel: "EMAIL" as const,
              status: "PENDING" as const,
              subject: input.subject,
              body: input.body,
              eventKey: input.eventKey,
              relatedEntityType: input.relatedEntityType,
              relatedEntityId: input.relatedEntityId,
            },
          ]
        : []),
    ];
  });
  if (data.length) await database.notification.createMany({ data });
  return data.length;
}

export async function deliverPendingEmails(
  limit = 50,
  filters?: {
    notificationIds?: string[];
    userIds?: string[];
    eventKeys?: NotificationEventKey[];
  },
) {
  const database = getDatabase();
  const pending = await database.notification.findMany({
    where: {
      channel: "EMAIL",
      status: { in: ["PENDING", "FAILED"] },
      attemptCount: { lt: 5 },
      ...(filters?.notificationIds?.length
        ? { id: { in: filters.notificationIds } }
        : {}),
      ...(filters?.userIds?.length ? { userId: { in: filters.userIds } } : {}),
      ...(filters?.eventKeys?.length
        ? { eventKey: { in: filters.eventKeys } }
        : {}),
    },
    include: { user: true },
    orderBy: { createdAt: "asc" },
    take: limit,
  });
  let sent = 0;
  let failed = 0;
  for (const notification of pending) {
    let actionUrl = `${getServerEnvironment().NEXT_PUBLIC_APP_URL}/portal`;
    if (notification.eventKey === "account_invitation") {
      const { token, tokenHash } = createOpaqueToken();
      await database.invitationToken.create({
        data: {
          userId: notification.userId,
          tokenHash,
          expiresAt: expiresInHours(INVITATION_TTL_HOURS),
        },
      });
      actionUrl = `${getServerEnvironment().NEXT_PUBLIC_APP_URL}/accept-invitation/${token}`;
    }
    const result = await sendTransactionalEmail({
      to: notification.user.email,
      subject: notification.subject,
      html: renderTradeTuterEmail({
        recipientName: notification.user.name,
        subject: notification.subject,
        body: notification.body,
        eventKey: notification.eventKey,
        actionUrl,
      }),
    });
    await database.notification.update({
      where: { id: notification.id },
      data: {
        attemptCount: { increment: 1 },
        lastAttemptAt: new Date(),
        status: result.success ? "SENT" : "FAILED",
        sentAt: result.success ? new Date() : null,
        lastError: result.success ? null : result.error,
      },
    });
    if (result.success) sent += 1;
    else failed += 1;
  }
  return { processed: pending.length, sent, failed };
}
