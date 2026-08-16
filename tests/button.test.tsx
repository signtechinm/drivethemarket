import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Button } from "@/components/ui/button";

describe("Button", () => {
  it("renders an accessible button and handles interaction", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(<Button onClick={onClick}>Release materials</Button>);
    await user.click(screen.getByRole("button", { name: "Release materials" }));

    expect(onClick).toHaveBeenCalledOnce();
  });

  it("prevents interaction while disabled", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(
      <Button disabled onClick={onClick}>
        Release materials
      </Button>,
    );
    await user.click(screen.getByRole("button", { name: "Release materials" }));

    expect(onClick).not.toHaveBeenCalled();
  });
});
