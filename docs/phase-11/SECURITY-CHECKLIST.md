# Security Review Checklist

## Passed

- Server-side authentication and active-account checks protect private interfaces.
- RBAC is enforced by server actions, pages, and protected export routes.
- Student material access requires ownership, active enrolment dates, released status, and a short-lived signed access token.
- Private files are outside the public directory; storage keys are validated and never used as public URLs.
- Upload MIME types and size limits are allow-listed.
- Passwords use bcrypt; invitation and reset tokens are hashed and expire.
- Session lifetime is limited to 15 minutes.
- State-changing forms use framework server-action/CSRF protections.
- Enquiries use validation, honeypot, minimum completion time, and submission throttling.
- Security events and controlled releases create audit records.
- CSP, frame denial, no-sniff, referrer, permissions, cross-origin, and HSTS policies are configured.
- Protected responses use `private, no-store`.
- External new-tab links prevent opener access.
- Production dependencies report zero known vulnerabilities.

## Production verification

- Generate unique database, authentication, object-storage, streaming, mail, and monitoring credentials.
- Restrict database and provider credentials to the minimum required privileges.
- Verify TLS, DNS, sender authentication, storage CORS, upload scanning, and provider webhook signatures.
- Configure rate limiting at the CDN/WAF for login, password recovery, enquiry, progress, and download endpoints.
- Enable secret rotation, alerting, log retention, and incident-response ownership.
- Run an authorized external penetration test after the production candidate is deployed.

No secret or production credential is stored in the repository.
