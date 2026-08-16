# Drive the Market — Phase 8 Announcements and Notifications

**Status:** Internally complete  
**Completed:** 15 August 2026  
**Next phase:** Phase 9 — Public website and content management

## Delivered capabilities

### Announcement management

- Institution-wide and batch-specific announcements
- Separate draft and publish steps
- Optional announcement expiry
- Active-student targeting for institution announcements
- Current active-enrolment targeting for batch announcements
- Publication audit records with audience counts
- Administration history with author, audience, and publication state

### Student notification centre

- Current institution and eligible batch announcements
- Personal in-app notification history
- Read and unread states
- Per-event in-app and email preferences
- Mandatory delivery for account invitation and access suspension/expiry
- Strict batch filtering based on the signed-in student’s current enrolments

### Branded email and durable delivery

- Responsive olive-and-silver Drive the Market HTML template
- HTML escaping for names, subjects, and message bodies
- Absolute application action links
- Fresh single-use invitation-token generation at email-delivery time
- `log` development provider and `transactional` production-provider boundary
- Durable pending/failed email outbox
- Attempt count, last-attempt time, and last-error fields
- Manual outbox processing and retry control
- Maximum of five automated/manual attempts per email record
- Delivery-failure visibility in administration

The local environment uses `EMAIL_PROVIDER=log`, which accepts branded messages without contacting real recipients. Production must connect the selected transactional provider before launch.

### Integrated communication events

- Account invitation
- Individual batch enrolment
- Enrolment suspension
- Seven-day enrolment expiry warning
- Class schedule update
- Material or recording release
- Institution or batch announcement

Email delivery is decoupled from business transactions: provider failure cannot roll back a valid account, enrolment, class schedule, release, or announcement.

## Routes

- `/admin/communications` — drafts, publishing, outbox status, retries, failures, and expiry scan
- `/portal/notifications` — targeted updates, notification history, and preferences

## Database update

Migration `20260815220000_phase8_communications` adds event/related-entity metadata, delivery-attempt fields, delivery-error storage, outbox indexes, and per-user notification preferences. It was applied successfully to local PostgreSQL.

## Targeting verification

Two seed students were used:

- The actively enrolled student saw the institution-wide and batch-specific messages.
- The non-enrolled student saw the institution-wide message only.
- The non-enrolled student did not receive or render the other batch’s announcement.

## Validation

- Announcement-targeting and email-template tests added
- Ten test files and twenty-one tests passed
- Formatting, zero-warning ESLint, strict TypeScript, Prisma validation, and production build passed
- Phase 8 migration and communication seed completed
- Communications administration returned HTTP 200
- Both student notification centres returned HTTP 200
- Batch and institution audience behavior matched the expected recipients
- Student access to communications administration redirected to unauthorized
- Anonymous notification-centre access redirected to login
