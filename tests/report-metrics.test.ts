import { describe, expect, it } from "vitest";

import {
  classifyActivity,
  completionPercent,
  latestDate,
  normalizePage,
  parseReportDate,
} from "@/lib/reports/metrics";

describe("report metrics", () => {
  it("parses bounded report filters", () => {
    expect(parseReportDate("2026-08-15")?.toISOString()).toBe(
      "2026-08-15T00:00:00.000Z",
    );
    expect(parseReportDate("2026-08-15", true)?.toISOString()).toBe(
      "2026-08-15T23:59:59.999Z",
    );
    expect(parseReportDate("not-a-date")).toBeUndefined();
    expect(normalizePage("-4")).toBe(1);
    expect(normalizePage("4")).toBe(4);
  });

  it("calculates completion safely", () => {
    expect(completionPercent(3, 4)).toBe(75);
    expect(completionPercent(2, 0)).toBe(0);
    expect(completionPercent(8, 4)).toBe(100);
  });

  it("classifies recent, low, and absent activity", () => {
    const now = new Date("2026-08-15T00:00:00.000Z");
    expect(classifyActivity(new Date("2026-08-10T00:00:00.000Z"), now)).toBe(
      "active",
    );
    expect(classifyActivity(new Date("2026-08-05T00:00:00.000Z"), now)).toBe(
      "low",
    );
    expect(classifyActivity(null, now)).toBe("none");
    expect(
      latestDate([
        new Date("2026-08-01T00:00:00.000Z"),
        new Date("2026-08-03T00:00:00.000Z"),
      ])?.getUTCDate(),
    ).toBe(3);
  });
});
