const required = [
  "DATABASE_URL",
  "AUTH_SECRET",
  "NEXT_PUBLIC_APP_URL",
  "NEXTAUTH_URL",
  "STORAGE_PROVIDER",
  "VIDEO_PROVIDER",
  "EMAIL_PROVIDER",
  "S3_REGION",
  "S3_BUCKET",
  "S3_ACCESS_KEY_ID",
  "S3_SECRET_ACCESS_KEY",
  "MONITORING_WEBHOOK_URL",
  "CRON_SECRET",
];

const errors = [];
for (const key of required)
  if (!process.env[key]) errors.push(`${key} is missing`);

for (const key of ["NEXT_PUBLIC_APP_URL", "NEXTAUTH_URL"]) {
  const value = process.env[key];
  if (value) {
    try {
      if (new URL(value).protocol !== "https:")
        errors.push(`${key} must use HTTPS`);
    } catch {
      errors.push(`${key} must be a valid URL`);
    }
  }
}

if (process.env.NEXT_PUBLIC_APP_URL !== process.env.NEXTAUTH_URL)
  errors.push("NEXT_PUBLIC_APP_URL and NEXTAUTH_URL must match");
if (
  (process.env.AUTH_SECRET?.length ?? 0) < 48 ||
  process.env.AUTH_SECRET?.includes("replace")
)
  errors.push(
    "AUTH_SECRET must be a non-placeholder secret of at least 48 characters",
  );
if (process.env.DATABASE_URL?.includes("change-me"))
  errors.push("DATABASE_URL still contains a placeholder password");
if (process.env.STORAGE_PROVIDER !== "s3")
  errors.push("STORAGE_PROVIDER must be s3 for production");
if (process.env.VIDEO_PROVIDER !== "streaming")
  errors.push("VIDEO_PROVIDER must be streaming for production");
if (!["transactional", "gmail"].includes(process.env.EMAIL_PROVIDER))
  errors.push("EMAIL_PROVIDER must be transactional or gmail for production");
if (process.env.EMAIL_PROVIDER === "transactional") {
  for (const key of ["EMAIL_API_URL", "EMAIL_API_TOKEN", "EMAIL_FROM"])
    if (!process.env[key]) errors.push(`${key} is missing`);
}
if (process.env.EMAIL_PROVIDER === "gmail") {
  for (const key of ["GMAIL_USER", "GMAIL_APP_PASSWORD"])
    if (!process.env[key]) errors.push(`${key} is missing`);
}
if (
  process.env.EMAIL_API_URL &&
  !process.env.EMAIL_API_URL.startsWith("https://")
)
  errors.push("EMAIL_API_URL must use HTTPS");
if (
  process.env.MONITORING_WEBHOOK_URL &&
  !process.env.MONITORING_WEBHOOK_URL.startsWith("https://")
)
  errors.push("MONITORING_WEBHOOK_URL must use HTTPS");

if (errors.length) {
  console.error("Drive the Market production readiness check failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.info(
    "Drive the Market production environment is ready for deployment validation.",
  );
}
