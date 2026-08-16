# Drive the Market — Phase 6 Materials, Recordings, and Controlled Release

**Status:** Internally complete  
**Completed:** 15 August 2026  
**Next phase:** Phase 7 — Student portal and progress tracking

## Delivered capabilities

### Private materials and recordings

- Private local-development object-storage adapter outside the public web root
- Randomized storage keys with path-traversal protection
- PDF, presentation, image, MP4, and WebM validation
- 20 MB document/image limit and 250 MB video limit
- Private document, image, download, external-link, and recorded-video creation
- Required-resource and download-permission settings
- Local protected video playback with byte-range responses
- Staff preview of unreleased content through a permission-protected endpoint
- Orphaned-file cleanup when database creation fails

The storage provider boundary is configured through `STORAGE_PROVIDER`. Local development uses `.private-storage/learning`; production deployment must supply the selected private S3-compatible provider and credentials.

### Review and release workflow

```text
Draft → In review → Approved
Class: Scheduled → Conducted → Completed
Approved material + completed class → Released
Released → Emergency re-lock
```

- Uploading always creates a locked draft
- Instructor conduct confirmation is limited to assigned classes
- Academic completion requires `classes.complete`
- Review submission and approval are separate authorized operations
- Video release additionally requires playback-ready status
- Release creates a material-release record and audit event
- Emergency re-lock requires a reason and revokes current release records
- Conduct, completion, approval, release, and re-lock are audited

### Protected student delivery

- Released resources appear only for current active enrolments
- Access authorization creates a five-minute HMAC-signed token
- Tokens are bound to both user and material
- Content delivery rechecks session, token, material state, class state, and enrolment state
- Re-lock, suspension, cancellation, or access expiry takes effect on the next request
- Copied links fail under another user account
- Anonymous content requests fail
- Download disposition respects the material download setting

### Notifications

- Material release creates in-app notifications for active batch enrolments
- Notification count is recorded in release audit metadata
- Transactional email delivery remains part of the later communications-provider integration

## Routes

- `/admin/materials` — operational material library by batch and class
- `/admin/classes/[classId]/materials` — uploads, preview, review, approval, class completion, release, and re-lock
- `/api/admin/materials/[materialId]/preview` — protected staff preview
- `/api/materials/[materialId]/access` — student eligibility check and short-lived token issuance
- `/api/materials/[materialId]/content` — token-bound private content or video delivery
- `/portal` — minimal released-content inbox used to validate the Phase 6 access boundary

The complete student dashboard, class schedule, learning navigation, and progress tracking remain Phase 7 deliverables.

## Database decision

The foundation schema already contained material types and statuses, video assets, release history, notifications, progress records, class completion timestamps, and audit logs. Phase 6 requires no structural migration.

## Validation

- Release-gate and short-lived-token regression tests added
- Eight test files and seventeen tests passed
- Prisma schema validation passed
- Formatting, zero-warning ESLint, strict TypeScript, and production build passed
- Updated released and locked seed scenarios completed against PostgreSQL
- Staff material library returned HTTP 200
- Eligible student portal returned HTTP 200
- Eligible released-material authorization returned HTTP 307 to protected content
- Approved but unreleased material returned HTTP 403
- A copied user-bound token returned HTTP 403 under another account
- Anonymous content access returned HTTP 401
