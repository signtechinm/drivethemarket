# Drive the Market — Phase 4 Academic Management

**Status:** Internally complete  
**Completed:** 15 August 2026  
**Next phase:** Phase 5 — Student registration and batch enrolment

## Delivered capabilities

### Courses and syllabus planning

- Course creation, listing, activation, and archival
- Versioned syllabus templates within each course
- Ordered module and class planning
- Class learning outcomes and expected duration
- Explicit syllabus publication before operational use
- Server-side `courses.manage` authorization and audit records

### Batches and curriculum copies

- Batch creation from a published syllabus version
- Independent module and class copies that protect active batches from later template edits
- Capacity, start date, end date, and lifecycle status management
- Optional instructor assignment at creation
- Server-side `batches.manage` authorization and audit records

### Class scheduling

- Per-class schedule date and time
- Instructor assignment
- External live-class URL storage
- Draft, scheduled, rescheduled, and cancelled operational states
- Responsive academic planning screens for administration

## Routes

- `/admin/courses` — course catalogue and creation
- `/admin/courses/[courseId]` — syllabus versions, modules, classes, and publication
- `/admin/batches` — batch catalogue and creation from published syllabuses
- `/admin/batches/[batchId]` — curriculum, schedule, instructor, URL, and status management

## Development seed

The local seed publishes the Technical Analysis Foundations syllabus and creates a development instructor:

```text
Email: instructor@tradetuter.local
Password: TradeTuter-Dev-2026!
```

Development credentials must not be used in preview or production environments.

## Database update

Migration `20260815170000_phase4_academics` adds class-level instructor assignment and its scheduling index. The migration was applied to local PostgreSQL and the updated seed completed successfully.

## Design decisions

- Only published syllabus versions may create batches.
- A batch receives an independent curriculum copy at creation time.
- Live teaching remains outside Drive the Market; the platform stores its external class link and schedule.
- Conducted/completed class gates and material release remain in Phase 6, where the controlled-release workflow is implemented as one cohesive capability.

## Validation

- Prisma schema and generated client validated
- Phase 4 migration and seed completed
- Curriculum-copy regression coverage added
- Formatting, ESLint, strict TypeScript, automated tests, and production build passed
- Authenticated course and batch routes verified against PostgreSQL
