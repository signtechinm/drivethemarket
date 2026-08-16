# Phase 9 — Public Website and CMS

**Status:** Internally complete  
**Completed:** 15 August 2026

Phase 9 delivers Drive the Market's public institution website, editable launch content, prospective-student enquiry workflow, and website administration screens.

## Delivered

- Responsive public header, mobile navigation, footer, and student-login entry point.
- Public home, institution, courses, faculty, batches, testimonials, FAQ, contact, privacy, and terms pages.
- Database-backed content editing and draft/publish controls for institution, faculty, testimonials, FAQ, privacy, and terms content.
- Live course and available-batch listings sourced from academic records.
- Enquiry capture with validation, honeypot protection, minimum completion time, per-email rate limiting, staff notifications, audit logging, and status management.
- Role-protected CMS and enquiry administration using `website.manage`.
- Page metadata, Open Graph image, robots directives, XML sitemap, and organization structured data.
- Olive-green and silver visual system using the existing Drive the Market shadcn/ui conventions.

## Administration routes

- `/admin/website` — Edit and publish website content.
- `/admin/website/enquiries` — Review enquiries and mark them new, contacted, closed, or spam.

## Public routes

- `/`, `/about`, `/courses`, `/faculty`, `/batches`
- `/testimonials`, `/faq`, `/contact`, `/privacy`, `/terms`
- `/sitemap.xml`, `/robots.txt`, `/opengraph-image`

## Operational notes

- Seed data creates published starter content without overwriting later staff edits.
- A sample enquiry is included for local administration testing.
- Public course and batch information is read from the academic-management source of truth.
- Enquiry email delivery uses the communications outbox implemented in Phase 8.

## Production content gates

These do not block engineering completion, but must be resolved before public launch:

- Replace demonstration testimonials with verified, consented statements.
- Add the institution's final address, telephone, email, and social links.
- Have privacy and terms copy reviewed for the operating jurisdiction.
- Configure the canonical production URL and real outbound email provider.

See [Phase acceptance](PHASE-ACCEPTANCE.md) for the validation record.
