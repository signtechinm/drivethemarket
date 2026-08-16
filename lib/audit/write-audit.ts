import "server-only";

import { getDatabase } from "@/lib/db/client";

interface AuditInput {
  actorId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  metadata?: Record<string, string | number | boolean | null>;
}

export function writeAudit(input: AuditInput) {
  return getDatabase().auditLog.create({
    data: {
      actorId: input.actorId,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      metadata: input.metadata,
    },
  });
}
