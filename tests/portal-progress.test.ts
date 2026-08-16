import { describe, expect, it } from "vitest";

import { calculateProgress, isVideoComplete } from "@/lib/portal/progress";

describe("student learning progress", () => {
  it("calculates required-resource completion only", () => {
    expect(
      calculateProgress([
        { id: "1", required: true, completed: true },
        { id: "2", required: true, completed: false },
        { id: "3", required: false, completed: false },
      ]),
    ).toBe(50);
    expect(calculateProgress([])).toBe(0);
  });

  it("marks videos complete at ninety percent", () => {
    expect(isVideoComplete(89.99)).toBe(false);
    expect(isVideoComplete(90)).toBe(true);
  });
});
