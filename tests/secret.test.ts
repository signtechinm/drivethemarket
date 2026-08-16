import { describe, expect, it } from "vitest";

import { secretsMatch } from "@/lib/security/secret";

describe("scheduled job authentication", () => {
  it("accepts only exact secrets without length errors", () => {
    expect(secretsMatch("correct-secret", "correct-secret")).toBe(true);
    expect(secretsMatch("wrong-secret", "correct-secret")).toBe(false);
    expect(secretsMatch("x", "a-much-longer-secret")).toBe(false);
  });
});
