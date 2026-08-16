# Phase 10 — Reporting and Operational Dashboards

**Status:** Internally complete  
**Completed:** 15 August 2026

Phase 10 gives authorized Drive the Market staff operational visibility without requiring direct database access.

## Delivered

- Permission-protected operational dashboard at `/admin/reports`.
- Summary indicators for active students, active batches, today's classes, release backlog, new enquiries, expiring access, and filtered students.
- Student-engagement report with released required-resource completion, last activity, and active/low/no-activity classification.
- Batch report covering planned, conducted, and released classes plus active enrolments.
- Oldest-first material review and release queue.
- Website-enquiry pipeline totals.
- Search, batch, enrolment-status, activity, from/to date, and page filters.
- Excel-compatible CSV exports for student, batch, material, and enquiry reports.
- Server-enforced `reports.view` permission for dashboard and export access.
- Reusable, tested report-date, pagination, completion, and activity metric utilities.

## Report definitions

- **Active activity:** learning activity within the last seven days.
- **Low activity:** last learning activity 8–14 days ago.
- **No activity:** no recorded activity or the last activity is more than 14 days old.
- **Completion:** completed released materials marked as required, divided by released required materials for that enrolment's batch.
- **Expiring access:** active enrolments ending within the next 30 days.
- **Awaiting release:** materials in review or approved but not released.

## Exports

`/api/admin/reports/export?type=students|batches|materials|enquiries`

The student export accepts the visible batch, enrolment status, date, and search filters. Batch and material exports accept batch/date scope where applicable. Files are UTF-8 CSV and open directly in spreadsheet applications.

## Performance

The existing schema already includes compound indexes for batch/status, enrolment access expiry, class status/schedule, material class/status, progress resources, and enquiry status/date. Phase 10 therefore required no structural database migration. Larger production datasets will receive query-plan and load validation during Phase 11.

See [Phase acceptance](PHASE-ACCEPTANCE.md).
