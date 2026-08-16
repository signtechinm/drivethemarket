# Drive the Market — Delivery Governance

**Effective date:** 15 August 2026  
**Status:** Active

## Non-blocking delivery model

Drive the Market development does not pause between phases for formal client review or signature.

A phase is complete when:

1. Its committed deliverables exist.
2. Its documented acceptance criteria pass.
3. Relevant technical, UX, security, and content checks are complete.
4. No known critical blocker prevents the next phase.
5. Open assumptions and risks are recorded.

## Client feedback

- Client demonstrations may happen during or after a phase.
- Feedback does not reopen completed work automatically.
- Small clarifications enter the current backlog where safe.
- Material changes are assessed for scope, architecture, schedule, migration, and security impact.
- A requested change that invalidates completed work is handled as a change request.

## Unresolved decisions

When a decision is required and no client answer is available, the team may adopt the documented recommended default if it:

- Keeps the MVP secure and internally consistent.
- Does not create an irreversible external commitment.
- Does not add a materially different product capability.
- Is recorded in the relevant decision register.

The adopted default becomes the implementation baseline until changed through change control.

## Phase status terminology

- **Planned:** Work has not started.
- **In progress:** Deliverables are being produced.
- **Internally complete:** Deliverables and internal checks pass; client feedback may still be received.
- **Changed:** A later approved change modifies completed phase output.
- **Blocked:** A genuine technical, legal, security, or external dependency prevents safe progress.

## Current status

| Phase                                           | Status              | Basis                                                                         |
| ----------------------------------------------- | ------------------- | ----------------------------------------------------------------------------- |
| Phase 0 — Discovery and scope                   | Internally complete | Recommended defaults adopted; discovery package validated                     |
| Phase 1 — UX and brand prototype                | Internally complete | Brand, UX specification, component map, and responsive prototype validated    |
| Phase 2 — Engineering foundation                | Internally complete | Next.js, Prisma, theme, tests, CI, observability, and build validated         |
| Phase 3 — Identity and permissions              | Internally complete | Authentication, RBAC, lifecycle, admin UI, audit, and runtime validated       |
| Phase 4 — Academic management                   | Internally complete | Courses, syllabuses, batch cloning, schedules, tests, and runtime validated   |
| Phase 5 — Students and enrolments               | Internally complete | Registration, imports, access control, export, tests, and runtime validated   |
| Phase 6 — Materials and release                 | Internally complete | Private uploads, review, release security, notifications, and runtime passed  |
| Phase 7 — Portal and progress                   | Internally complete | Dashboard, learning views, resume, progress, isolation, and runtime validated |
| Phase 8 — Communications                        | Internally complete | Targeting, preferences, branded email, outbox, retry, and isolation validated |
| Phase 9 — Public website and CMS                | Internally complete | Public pages, CMS, enquiries, SEO, access control, and runtime validated      |
| Phase 10 — Reporting and dashboards             | Internally complete | Metrics, filters, exports, authorization, tests, and runtime validated        |
| Phase 11 — QA, security, and launch preparation | Internally complete | Regression, hardening, recovery, readiness, and production build validated    |
| Phase 12 — Production launch and stabilization  | In progress         | Release candidate passed; external deployment and stabilization remain        |
