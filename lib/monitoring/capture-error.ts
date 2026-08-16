import "server-only";

import { logger } from "@/lib/logger";
import { getServerEnvironment } from "@/lib/env/server";

interface ErrorContext {
  operation: string;
  requestId?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
}

export function captureError(error: unknown, context: ErrorContext) {
  const normalizedError =
    error instanceof Error ? error : new Error(String(error));
  logger.error(
    {
      error: {
        name: normalizedError.name,
        message: normalizedError.message,
        stack: normalizedError.stack,
      },
      ...context,
    },
    "Application operation failed",
  );

  let environment;
  try {
    environment = getServerEnvironment();
  } catch {
    return;
  }
  if (environment.MONITORING_WEBHOOK_URL)
    void fetch(environment.MONITORING_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(environment.MONITORING_WEBHOOK_TOKEN
          ? { Authorization: `Bearer ${environment.MONITORING_WEBHOOK_TOKEN}` }
          : {}),
      },
      body: JSON.stringify({
        service: "trade-tuter-web",
        operation: context.operation,
        requestId: context.requestId,
        error: normalizedError.message,
        occurredAt: new Date().toISOString(),
      }),
      signal: AbortSignal.timeout(5_000),
    }).catch(() => undefined);
}
