import { describe, expect, it } from "vitest";

import nextConfig from "@/next.config";

describe("security response policy", () => {
  it("publishes browser security headers", async () => {
    const routes = await nextConfig.headers?.();
    const global = routes?.find((route) => route.source === "/:path*");
    const headers = new Map(
      global?.headers.map((header) => [header.key, header.value]),
    );
    expect(headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(headers.get("X-Frame-Options")).toBe("DENY");
    expect(headers.get("Content-Security-Policy")).toContain(
      "frame-ancestors 'none'",
    );
    expect(headers.get("Content-Security-Policy")).toContain(
      "object-src 'none'",
    );
    expect(headers.get("Permissions-Policy")).toContain("camera=()");
  });

  it("prevents protected pages and APIs from shared caching", async () => {
    const routes = await nextConfig.headers?.();
    for (const source of ["/admin/:path*", "/portal/:path*", "/api/:path*"])
      expect(
        routes
          ?.find((route) => route.source === source)
          ?.headers.some(
            (header) =>
              header.key === "Cache-Control" &&
              header.value === "private, no-store",
          ),
      ).toBe(true);
  });
});
