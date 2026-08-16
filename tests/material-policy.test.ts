import { describe, expect, it } from "vitest";

import {
  createMaterialAccessToken,
  verifyMaterialAccessToken,
} from "@/lib/materials/access-token";
import {
  canAccessReleasedMaterial,
  canReleaseMaterial,
} from "@/lib/materials/release-policy";

describe("controlled material release", () => {
  it("requires a completed class and approved, ready content", () => {
    expect(
      canReleaseMaterial("SCHEDULED", { status: "APPROVED", type: "DOCUMENT" }),
    ).toBe(false);
    expect(
      canReleaseMaterial("COMPLETED", { status: "DRAFT", type: "DOCUMENT" }),
    ).toBe(false);
    expect(
      canReleaseMaterial("COMPLETED", {
        status: "APPROVED",
        type: "VIDEO",
        playbackReady: false,
      }),
    ).toBe(false);
    expect(
      canReleaseMaterial("COMPLETED", {
        status: "APPROVED",
        type: "VIDEO",
        playbackReady: true,
      }),
    ).toBe(true);
  });

  it("requires released state and an active, current enrolment", () => {
    const now = new Date("2026-08-15T12:00:00Z");
    expect(
      canAccessReleasedMaterial({
        classStatus: "RELEASED",
        materialStatus: "RELEASED",
        enrolment: {
          status: "ACTIVE",
          accessStartsAt: null,
          accessEndsAt: null,
        },
        now,
      }),
    ).toBe(true);
    expect(
      canAccessReleasedMaterial({
        classStatus: "RELEASED",
        materialStatus: "RELOCKED",
        enrolment: {
          status: "ACTIVE",
          accessStartsAt: null,
          accessEndsAt: null,
        },
        now,
      }),
    ).toBe(false);
  });
});

describe("short-lived material tokens", () => {
  it("binds access to the user and expiry", () => {
    const token = createMaterialAccessToken(
      { materialId: "material-1", userId: "student-1" },
      "test-secret",
      1_000,
      60,
    );
    expect(
      verifyMaterialAccessToken(token, "test-secret", 2_000),
    ).toMatchObject({
      materialId: "material-1",
      userId: "student-1",
    });
    expect(verifyMaterialAccessToken(token, "wrong-secret", 2_000)).toBeNull();
    expect(verifyMaterialAccessToken(token, "test-secret", 62_000)).toBeNull();
  });
});
