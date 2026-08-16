import { describe, expect, it } from "vitest";

import {
  hasActiveEnrolmentAccess,
  hasBatchCapacity,
} from "@/lib/students/access-policy";
import { parseStudentImportCsv } from "@/lib/students/csv";

describe("student enrolment policy", () => {
  const now = new Date("2026-08-15T12:00:00Z");

  it("allows only active enrolments inside their access window", () => {
    expect(
      hasActiveEnrolmentAccess(
        {
          status: "ACTIVE",
          accessStartsAt: new Date("2026-08-01"),
          accessEndsAt: new Date("2026-09-01"),
        },
        now,
      ),
    ).toBe(true);
    expect(
      hasActiveEnrolmentAccess(
        { status: "SUSPENDED", accessStartsAt: null, accessEndsAt: null },
        now,
      ),
    ).toBe(false);
    expect(
      hasActiveEnrolmentAccess(
        {
          status: "ACTIVE",
          accessStartsAt: null,
          accessEndsAt: new Date("2026-08-01"),
        },
        now,
      ),
    ).toBe(false);
  });

  it("enforces finite capacity while allowing unlimited batches", () => {
    expect(hasBatchCapacity(20, 19)).toBe(true);
    expect(hasBatchCapacity(20, 20)).toBe(false);
    expect(hasBatchCapacity(null, 500)).toBe(true);
  });
});

describe("student CSV parsing", () => {
  it("parses quoted values and reports invalid rows", () => {
    const rows = parseStudentImportCsv(
      "name,email,phone,studentNumber,batchCode,accessStartsAt,accessEndsAt\n" +
        '"Doe, Ava",ava@example.com,555,ST-001,B-01,2026-08-01,2026-09-01\n' +
        "Broken,no-email,,ST-002,B-01,2026-10-01,2026-09-01",
    );
    expect(rows[0]).toMatchObject({
      name: "Doe, Ava",
      email: "ava@example.com",
      errors: [],
    });
    expect(rows[1]?.errors).toContain("Invalid email");
    expect(rows[1]?.errors).toContain("Access end precedes start");
  });
});
