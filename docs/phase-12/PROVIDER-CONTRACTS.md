# Production Provider Contracts

## Private storage and video

The `s3` adapter supports AWS S3 and compatible HTTPS services through `S3_ENDPOINT`, `S3_REGION`, `S3_BUCKET`, `S3_ACCESS_KEY_ID`, and `S3_SECRET_ACCESS_KEY`. Objects remain private under `learning/` and are served only after Drive the Market authorization. Enable bucket encryption, versioning, public-access blocking, and prefix-scoped credentials.

`VIDEO_PROVIDER=streaming` uses authorized private object delivery with HTTP byte ranges. A specialized adaptive-bitrate or DRM service can replace this adapter later.

## Transactional email

The adapter posts `{ from, to, subject, html }` JSON to `EMAIL_API_URL` using `EMAIL_API_TOKEN`. The endpoint must return 2xx. Failures remain durable and retryable.

## Monitoring

`MONITORING_WEBHOOK_URL` receives service, operation, request ID, error message, and timestamp with the optional bearer `MONITORING_WEBHOOK_TOKEN`.

## Scheduler

Call `POST /api/internal/notifications/deliver` every five minutes with `Authorization: Bearer <CRON_SECRET>`. Use and rotate an independent 32+ character secret.
