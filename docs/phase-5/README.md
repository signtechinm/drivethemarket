# Drive the Market — Phase 5 Student Registration and Enrolment

**Status:** Internally complete  
**Completed:** 15 August 2026  
**Next phase:** Phase 6 — Materials, recordings, and controlled release

## Delivered capabilities

### Student registration

- Staff-led individual registration
- Student account, Student role, profile, and invitation creation in one transaction
- Student number, contact, address, date-of-birth, and emergency-contact fields
- Profile editing and searchable student directory
- Account-state visibility inherited from the Phase 3 lifecycle controls
- Development invitation preview for local testing

### Batch enrolment

- One student can hold enrolments in multiple batches
- Duplicate-enrolment prevention
- Batch capacity enforcement and remaining-seat warnings
- Optional access start and expiry dates
- Pending, active, suspended, completed, and cancelled states
- Administrative notes and audited status changes
- Reusable active-enrolment access policy for Phase 6 protected content

### Bulk operations and reporting

- Downloadable CSV import template
- Browser-side row preview and validation feedback
- Server-side revalidation before every write
- Valid-row import with rejected-row reporting
- Atomic account/profile/enrolment creation per accepted row
- Protected enrolment CSV export
- Filters for account and enrolment status

## Routes

- `/admin/students` — directory, filters, registration, import, and export
- `/admin/students/[studentId]` — profile, enrolment history, access dates, and lifecycle controls
- `/api/admin/enrolments/export` — permission-protected CSV export

## CSV format

```text
name,email,phone,studentNumber,batchCode,accessStartsAt,accessEndsAt
```

Dates use ISO format such as `2026-08-15`. Imported enrolments begin in `PENDING` status so staff retain explicit activation control.

## Development seed

The seed creates an active sample batch and student enrolment. Student login:

```text
Email: student@tradetuter.local
Password: TradeTuter-Dev-2026!
```

Development credentials must not be used outside local development.

## Database decision

The Phase 2 foundation schema already contained the required student-profile and enrolment models, statuses, unique constraints, access dates, and capacity fields. Phase 5 therefore requires no new migration. The existing database constraints and updated seed were validated against local PostgreSQL.

## Validation

- Active-enrolment, capacity, and CSV parser tests added
- Formatting, ESLint, strict TypeScript, automated tests, and production build passed
- Updated seed completed against PostgreSQL
- Authenticated directory, student detail, and export routes verified
- Anonymous student administration access remains protected
