-- Phase 4 class-level instructor scheduling
ALTER TABLE "ClassSession" ADD COLUMN "instructorId" TEXT;

CREATE INDEX "ClassSession_instructorId_scheduledAt_idx"
ON "ClassSession"("instructorId", "scheduledAt");

ALTER TABLE "ClassSession"
ADD CONSTRAINT "ClassSession_instructorId_fkey"
FOREIGN KEY ("instructorId") REFERENCES "User"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
