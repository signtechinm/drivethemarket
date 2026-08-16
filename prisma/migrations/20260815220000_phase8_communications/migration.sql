ALTER TABLE "Notification"
ADD COLUMN "eventKey" TEXT NOT NULL DEFAULT 'general',
ADD COLUMN "relatedEntityType" TEXT,
ADD COLUMN "relatedEntityId" TEXT,
ADD COLUMN "attemptCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "lastAttemptAt" TIMESTAMP(3),
ADD COLUMN "lastError" TEXT;

CREATE INDEX "Notification_channel_status_createdAt_idx"
ON "Notification"("channel", "status", "createdAt");

CREATE INDEX "Notification_eventKey_relatedEntityId_idx"
ON "Notification"("eventKey", "relatedEntityId");

CREATE TABLE "NotificationPreference" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "eventKey" TEXT NOT NULL,
  "inAppEnabled" BOOLEAN NOT NULL DEFAULT true,
  "emailEnabled" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "NotificationPreference_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "NotificationPreference_userId_eventKey_key"
ON "NotificationPreference"("userId", "eventKey");

CREATE INDEX "NotificationPreference_userId_idx"
ON "NotificationPreference"("userId");

ALTER TABLE "NotificationPreference"
ADD CONSTRAINT "NotificationPreference_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
