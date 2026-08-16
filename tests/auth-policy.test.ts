import { describe, expect, it } from "vitest";

import { permissions } from "@/lib/auth/constants";
import { canAccessAdministration, hasPermission } from "@/lib/auth/policy";

describe("authorization policy", () => {
  it("matches exact permission keys", () => {
    expect(
      hasPermission([permissions.usersManage], permissions.usersManage),
    ).toBe(true);
    expect(
      hasPermission([permissions.usersManage], permissions.rolesManage),
    ).toBe(false);
  });

  it("keeps student-only accounts out of administration", () => {
    expect(canAccessAdministration(["student"])).toBe(false);
    expect(canAccessAdministration(["instructor"])).toBe(true);
    expect(canAccessAdministration(["student", "administrator"])).toBe(true);
  });
});
