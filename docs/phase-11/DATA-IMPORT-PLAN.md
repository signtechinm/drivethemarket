# Production Data Import Plan

## Order

1. Freeze and export approved source data.
2. Configure roles and staff accounts.
3. Import courses and versioned syllabuses.
4. Create batches and verify dates, capacity, instructors, and external class links.
5. Import students with the existing CSV preview workflow.
6. Review validation errors before committing valid records.
7. Activate enrolments only after totals and dates reconcile.
8. Upload and review learning resources; release nothing during import.
9. Import approved public content and verified testimonials.

## Reconciliation

Record source totals and accepted/rejected totals for users, students, courses, batches, classes, enrolments, and materials. Spot-check at least five records per entity and every rejected row. Confirm duplicate student numbers, duplicate emails, capacity, access dates, and batch codes.

## Rollback

Take a pre-import snapshot. If reconciliation fails, stop account invitations and releases, restore the snapshot in the isolated procedure, correct the source file, and rerun the preview. Never repair a large failed import directly in production without a reviewed migration script.
