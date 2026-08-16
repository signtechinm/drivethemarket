import { describe, expect, it } from "vitest";

import { buildBatchModuleCopies } from "@/lib/academics/clone-template";

describe("buildBatchModuleCopies", () => {
  it("creates an ordered, independent batch curriculum copy", () => {
    const source = [
      {
        title: "Risk management",
        description: null,
        position: 2,
        classes: [
          {
            title: "Position sizing",
            description: null,
            learningOutcomes: ["Calculate trade size"],
            expectedMinutes: 60,
            position: 1,
          },
        ],
      },
      {
        title: "Market foundations",
        description: "Start here",
        position: 1,
        classes: [
          {
            title: "Chart reading",
            description: "Core chart concepts",
            learningOutcomes: ["Read price charts"],
            expectedMinutes: 90,
            position: 2,
          },
          {
            title: "Market structure",
            description: null,
            learningOutcomes: ["Identify structure"],
            expectedMinutes: null,
            position: 1,
          },
        ],
      },
    ];

    const copies = buildBatchModuleCopies(source);

    expect(copies.map((module) => module.title)).toEqual([
      "Market foundations",
      "Risk management",
    ]);
    expect(copies[0]?.classes.create.map((item) => item.title)).toEqual([
      "Market structure",
      "Chart reading",
    ]);
    expect(copies[0]?.classes.create[1]).toMatchObject({
      description: "Core chart concepts",
      learningOutcomes: ["Read price charts"],
      expectedMinutes: 90,
    });
    expect(copies[0]).not.toHaveProperty("id");
    expect(copies[0]?.classes.create[0]).not.toHaveProperty("id");
  });
});
