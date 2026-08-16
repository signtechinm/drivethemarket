import { describe, expect, it } from "vitest";

import {
  createOpaqueToken,
  expiresInMinutes,
  hashOpaqueToken,
} from "@/lib/auth/tokens";

describe("identity lifecycle tokens", () => {
  it("creates unique opaque values and deterministic hashes", () => {
    const first = createOpaqueToken();
    const second = createOpaqueToken();

    expect(first.token).not.toBe(second.token);
    expect(first.tokenHash).toBe(hashOpaqueToken(first.token));
    expect(first.tokenHash).toHaveLength(64);
  });

  it("creates a future expiry", () => {
    expect(expiresInMinutes(30).getTime()).toBeGreaterThan(Date.now());
  });
});
