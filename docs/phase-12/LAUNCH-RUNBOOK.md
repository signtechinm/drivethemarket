# Production Launch Runbook

## Before deployment

1. Approve the domain, legal content, verified testimonials, and contact details.
2. Provision hosting, managed PostgreSQL, private S3 storage, email, monitoring, and DNS.
3. Configure `.env.example` values in the secret manager.
4. Verify PITR, object encryption/versioning, sender authentication, TLS, WAF limits, and alerts.
5. Take a pre-launch backup and run `npm run release:production` from the approved commit.

## Deployment

1. Deploy the immutable standalone/container artifact with traffic disabled.
2. Run migrations and verify `/api/health` and logs.
3. Run the automated smoke suite against the HTTPS URL.
4. Test admin/student login, protected document, video range, progress, enquiry, email, and report export.
5. Enable the scheduler, verify one delivery, then enable public traffic.

## Rollback

- Route traffic to the previous immutable artifact.
- Do not reverse migrations blindly; assess post-launch writes before restoring.
- Revoke credentials and disable scheduling if authorization or provider behavior is suspect.
- Preserve logs/audit evidence and record the incident.

## Stabilization

For 7–14 days, review health, latency, errors, authentication, uploads, video access, releases, progress, email, database capacity, storage, and costs daily. Close only after core workflows remain stable and support ownership is accepted.
