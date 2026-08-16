import "server-only";

import pino from "pino";

const level = process.env.LOG_LEVEL ?? "info";

export const logger = pino({
  level,
  base: {
    service: "trade-tuter-web",
    environment: process.env.NODE_ENV ?? "development",
  },
  redact: {
    paths: [
      "password",
      "token",
      "authorization",
      "req.headers.authorization",
      "DATABASE_URL",
      "AUTH_SECRET",
    ],
    censor: "[REDACTED]",
  },
});
