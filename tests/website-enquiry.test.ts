import { describe, expect, it } from "vitest";

import { isLikelySpamSubmission } from "@/lib/website/enquiry-policy";

describe("website enquiry spam policy", () => {
  it("accepts a human-paced empty-honeypot submission", () => {
    expect(
      isLikelySpamSubmission({ honeypot: "", startedAt: 1_000, now: 5_000 }),
    ).toBe(false);
  });

  it("rejects honeypots, instant submissions, and stale forms", () => {
    expect(
      isLikelySpamSubmission({ honeypot: "bot", startedAt: 1_000, now: 5_000 }),
    ).toBe(true);
    expect(
      isLikelySpamSubmission({ honeypot: "", startedAt: 4_000, now: 5_000 }),
    ).toBe(true);
    expect(
      isLikelySpamSubmission({
        honeypot: "",
        startedAt: 1_000,
        now: 4_000_001,
      }),
    ).toBe(true);
  });
});
