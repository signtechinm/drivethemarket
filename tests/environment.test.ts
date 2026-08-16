import { describe, expect, it } from "vitest";

import { parseServerEnvironment } from "@/lib/env/server";

const validEnvironment = {
  NODE_ENV: "test",
  NEXT_PUBLIC_APP_URL: "http://localhost:3000",
  NEXTAUTH_URL: "http://localhost:3000",
  INSTITUTION_TIMEZONE: "Asia/Kolkata",
  LOG_LEVEL: "info",
  DATABASE_URL: "postgresql://user:password@localhost:5432/trade_tuter",
  AUTH_SECRET: "a-secure-test-secret-that-is-long-enough",
  STORAGE_PROVIDER: "local",
  VIDEO_PROVIDER: "mock",
  EMAIL_PROVIDER: "log",
} satisfies NodeJS.ProcessEnv;

describe("server environment", () => {
  it("accepts the documented local configuration", () => {
    expect(parseServerEnvironment(validEnvironment).INSTITUTION_TIMEZONE).toBe(
      "Asia/Kolkata",
    );
  });

  it("rejects a short authentication secret", () => {
    expect(() =>
      parseServerEnvironment({ ...validEnvironment, AUTH_SECRET: "short" }),
    ).toThrow("Invalid server environment");
  });

  it("accepts Gmail as an email provider", () => {
    const environment = parseServerEnvironment({
      ...validEnvironment,
      EMAIL_PROVIDER: "gmail",
      GMAIL_USER: "mailer@example.com",
      GMAIL_APP_PASSWORD: "abcdefghijklmnop",
    });
    expect(environment.EMAIL_PROVIDER).toBe("gmail");
  });
});
