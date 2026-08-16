import { describe, expect, it } from "vitest";

import { passwordSchema } from "@/lib/auth/password";

describe("password policy", () => {
  it("accepts a long mixed password", () => {
    expect(passwordSchema.safeParse("TradeTuter-Strong-2026!").success).toBe(
      true,
    );
  });

  it("rejects weak passwords", () => {
    expect(passwordSchema.safeParse("passwordpassword").success).toBe(false);
    expect(passwordSchema.safeParse("Short1!").success).toBe(false);
  });
});
