const baseUrl = process.env.SMOKE_BASE_URL;
if (!baseUrl) throw new Error("SMOKE_BASE_URL is required.");

const checks = [
  ["/api/health", 200, '"status":"ok"'],
  ["/", 200, "Drive the Market"],
  ["/courses", 200, "Courses"],
  ["/login", 200, "Sign in"],
  ["/robots.txt", 200, "Sitemap"],
  ["/sitemap.xml", 200, "<urlset"],
];
const failures = [];

for (const [path, expectedStatus, marker] of checks) {
  try {
    const response = await fetch(new URL(path, baseUrl), {
      redirect: "manual",
      signal: AbortSignal.timeout(15_000),
    });
    const body = await response.text();
    if (response.status !== expectedStatus)
      failures.push(
        `${path}: expected ${expectedStatus}, received ${response.status}`,
      );
    else if (!body.includes(marker))
      failures.push(`${path}: missing expected content marker`);
    if (path === "/") {
      const requiredHeaders = [
        "content-security-policy",
        "strict-transport-security",
        "x-content-type-options",
        "x-frame-options",
      ];
      for (const header of requiredHeaders)
        if (!response.headers.has(header))
          failures.push(`/: missing ${header}`);
    }
  } catch (error) {
    failures.push(
      `${path}: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

const protectedResponse = await fetch(new URL("/admin", baseUrl), {
  redirect: "manual",
  signal: AbortSignal.timeout(15_000),
});
if (![302, 307, 308].includes(protectedResponse.status))
  failures.push(
    `/admin: expected authentication redirect, received ${protectedResponse.status}`,
  );

if (failures.length) {
  console.error("Drive the Market production smoke test failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else console.info("Drive the Market production smoke test passed.");
