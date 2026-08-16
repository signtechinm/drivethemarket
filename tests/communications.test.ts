import { describe, expect, it } from "vitest";

import { selectAnnouncementRecipientIds } from "@/lib/communications/events";
import { renderTradeTuterEmail } from "@/lib/communications/email-template";

describe("announcement targeting", () => {
  const recipients = [
    { userId: "student-a", batchIds: ["batch-1"] },
    { userId: "student-b", batchIds: ["batch-2"] },
  ];

  it("targets only students in the selected batch", () => {
    expect(selectAnnouncementRecipientIds(recipients, "batch-1")).toEqual([
      "student-a",
    ]);
    expect(selectAnnouncementRecipientIds(recipients, null)).toEqual([
      "student-a",
      "student-b",
    ]);
  });
});

describe("Drive the Market email template", () => {
  it("uses brand styling and escapes user-controlled content", () => {
    const html = renderTradeTuterEmail({
      recipientName: "<Student>",
      subject: "Class & update",
      body: "Open <script>alert(1)</script>",
      eventKey: "announcement",
    });
    expect(html).toContain("Drive the Market");
    expect(html).toContain("linear-gradient");
    expect(html).toContain("&lt;Student&gt;");
    expect(html).not.toContain("<script>");
  });
});
