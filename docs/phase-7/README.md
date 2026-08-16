# Drive the Market — Phase 7 Student Portal and Progress Tracking

**Status:** Internally complete  
**Completed:** 15 August 2026  
**Next phase:** Phase 8 — Announcements and notifications

## Delivered capabilities

### Student dashboard

- Active enrolment and course cards
- Overall required-resource progress
- Upcoming live-class schedule
- Recently viewed resources
- Newly released in-app notifications
- Read-state control for personal notifications
- Empty states for students without active learning access

### Course learning interface

- Modules and classes displayed in syllabus order
- Scheduled dates and operational states
- Released classes with eligible resources
- Upcoming and locked classes without protected-resource metadata
- Class, module, and course progress percentages
- Clear completed and in-progress resource states
- Ownership checks on every enrolment route

### Protected resource viewer

- Embedded document/image viewer through the Phase 6 protected endpoint
- Protected external-link opening
- Protected video playback
- Manual completion for non-video resources
- Material-open activity recording
- Recently viewed ordering by personal activity
- Fresh release and enrolment authorization before rendering

### Video progress and resume

- Playback resumes from the student’s last saved position
- Progress saves approximately every ten seconds and on pause/end
- Position and percentage stored per enrolment and video
- Videos become complete at 90% watched
- Video completion synchronizes with material completion
- The progress API rechecks the signed-in user and material eligibility

### Profile and responsive experience

- Student name, phone, and address settings
- Desktop dashboard/profile navigation
- Fixed mobile navigation
- Responsive cards and learning layouts
- Portal loading skeleton

## Routes

- `/portal` — dashboard, courses, upcoming classes, recent activity, and notifications
- `/portal/courses/[enrolmentId]` — owned course learning interface
- `/portal/materials/[materialId]` — protected viewer and completion controls
- `/portal/profile` — personal account settings
- `/api/portal/video-progress` — student-scoped video progress updates

## Progress rules

- Progress percentages count required released resources.
- Optional resources do not reduce the completion percentage.
- A non-video resource is complete after the student explicitly marks it complete.
- A video is complete after at least 90% has been watched.
- Progress belongs to an enrolment, so repeat or separate batch enrolments remain independent.

## Isolation model

Course routes query by both enrolment ID and the signed-in student profile. Material and progress routes independently resolve the student’s eligible enrolment. A second seeded student with no enrolment was used to verify that another student’s course and material routes both return HTTP 404.

## Database decision

The foundation schema already included material and video progress models with per-enrolment unique constraints. Phase 7 requires no structural migration.

## Validation

- Progress-percentage and video-completion tests added
- Nine test files and nineteen tests passed
- Formatting, zero-warning ESLint, strict TypeScript, Prisma validation, and production build passed
- Phase 7 seed activity, notification, and isolation student completed
- Dashboard, owned course, released viewer, and profile returned HTTP 200
- Cross-student course and material access returned HTTP 404
- Anonymous portal access redirected to login
