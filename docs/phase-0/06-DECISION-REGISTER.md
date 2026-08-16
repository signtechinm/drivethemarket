# Phase 0.6 — Decision Register

**Status:** Closed using the documented recommended defaults  
**Decision basis:** Project direction authorizes non-blocking progress without formal client review. These defaults are now the implementation baseline and may be changed later through change control.

## How to respond

For each open item, replace `Pending` with the selected option or add the answer under **Client decision**. Priority-one items are required to close Phase 0.

## Priority 1 — Scope and workflow blockers

### D-01 — Student account creation

**Question:** How are student accounts created in the MVP?  
**Recommended default:** Staff creation plus CSV/Excel import; self-registration later.  
**Impact:** Public workflow, verification, duplicate prevention, and effort.  
**Adopted decision:** Staff creation plus CSV/Excel import; self-registration is post-MVP.

### D-02 — Payment and access

**Question:** Does fee/payment status control batch access in the MVP?  
**Recommended default:** No payment module; Administrator controls enrolment status manually.  
**Impact:** Payment integration, data model, finance workflows, and testing.  
**Adopted decision:** No MVP payment module; Administrators control enrolment status manually.

### D-03 — Class completion authority

**Question:** Who can mark a class conducted and completed?  
**Recommended default:** Instructor marks conducted; Academic Manager marks completed.  
**Impact:** Permission matrix and release workflow.  
**Adopted decision:** Instructor marks conducted; Academic Manager marks completed.

### D-04 — Material release authority

**Question:** Who can approve and release class materials?  
**Recommended default:** Academic Manager only, with Super Admin emergency authority.  
**Impact:** Separation of duties, UI, and audit rules.  
**Adopted decision:** Academic Manager approves and releases; Super Admin retains emergency authority.

### D-05 — Release timing

**Question:** Which modes are required at launch?  
**Options:** Manual only; manual plus scheduled; manual plus delayed; all modes.  
**Recommended default:** Manual only for the MVP.  
**Impact:** Background jobs, timezone rules, retry behavior, and QA.  
**Adopted decision:** Manual release only for the MVP.

### D-06 — MVP learning features

**Question:** Are attendance, assignments, quizzes, grading, or certificates required in the MVP?  
**Recommended default:** No; all are post-MVP.  
**Impact:** Major scope and schedule change.  
**Adopted decision:** Attendance, assignments, quizzes, grading, and certificates are post-MVP.

### D-07 — Video delivery

**Question:** Where are recordings currently stored, and must they be migrated?  
**Recommended default:** Protected streaming provider; no direct downloadable video files.  
**Impact:** Provider, cost, playback, upload/processing workflow, and migration.  
**Adopted decision:** Use a protected streaming adapter; videos are stream-only and provider selection remains an engineering configuration decision.

### D-08 — Expected scale

**Question:** Provide launch and 12-month estimates for students, staff, batches, monthly videos, average video duration, and concurrent viewers.  
**Recommended default:** No assumption; figures are required.  
**Impact:** Hosting, video provider, database design, cost, and performance tests.  
**Adopted planning assumption:** Design for moderate initial scale and keep storage/video providers replaceable. Actual load figures will tune infrastructure before production launch and do not block foundation development.

## Priority 2 — Experience and operational choices

### D-09 — Document downloads

**Question:** Can students download documents, or only view them?  
**Recommended default:** Per-resource download control.  
**Adopted decision:** Download permission is configured per document; video remains stream-only.

### D-10 — Notifications

**Question:** Which channels are needed in the MVP?  
**Recommended default:** In-app and email; WhatsApp/SMS later.  
**Adopted decision:** In-app and email notifications; WhatsApp/SMS are post-MVP.

### D-11 — Progress calculation

**Question:** What counts as complete for a material, video, class, module, and course?  
**Recommended default:** Document manually marked complete; video complete at 90%; class complete when all required resources complete.  
**Adopted decision:** Documents are manually marked complete; video completes at 90%; a class completes when all required released resources complete.

### D-12 — Enrolment expiry

**Question:** After batch completion or expiry, may students continue viewing released content?  
**Recommended default:** Access follows explicit enrolment expiry date.  
**Adopted decision:** Protected access follows the explicit enrolment expiry date.

### D-13 — Instructor scope

**Question:** Can an instructor view student progress and contact details for assigned batches?  
**Recommended default:** View academic progress and basic identity; hide private administrative notes.  
**Adopted decision:** Instructors see academic progress and basic identity for assigned batches, but not private administrative notes.

### D-14 — Website enquiry ownership

**Question:** Who receives and manages public enquiries?  
**Recommended default:** Administrators manage; Website Editors see content only.  
**Adopted decision:** Administrators manage enquiries; Website Editors manage website content without enquiry contact access.

## Priority 3 — Brand, content, and infrastructure

### D-15 — Product spelling

**Question:** Confirm the final registered product spelling is exactly **Drive the Market**.  
**Adopted decision:** The product spelling is exactly **Drive the Market**.

### D-16 — Brand approval

**Question:** Is the sample olive/silver logo an approved direction or only a starting concept?  
**Recommended default:** Starting concept to be refined in Phase 1.  
**Adopted decision:** The current olive/silver logo is the Phase 1 identity direction and may receive non-structural refinement later.

### D-17 — Institution identity

**Question:** Will the public website use Drive the Market as the institution identity, or display a separate institution name powered by Drive the Market?  
**Adopted decision:** Drive the Market is the product identity; institution name/content remains separately configurable.

### D-18 — Language and timezone

**Question:** Confirm launch language and institution timezone.  
**Recommended default:** English; Asia/Kolkata.  
**Adopted decision:** English and Asia/Kolkata for the MVP, with timestamps stored in UTC.

### D-19 — Hosting and data region

**Question:** Are there required hosting providers, countries, or data residency restrictions?  
**Adopted decision:** Use provider-neutral adapters and a Vercel-compatible deployment with managed PostgreSQL; final region is selected before production based on legal and operational needs.

### D-20 — Legal content

**Question:** Who supplies privacy, terms, cookie, and trading-risk disclaimer content?  
**Recommended default:** Client/legal adviser supplies final approved text.  
**Adopted decision:** Use clearly marked placeholder legal content during development; final approved privacy, terms, cookie, and trading-risk text is required only before production launch.

## Change-control note

After Phase 0 approval, changes to priority-one decisions must be evaluated for impact on database design, security, interfaces, delivery schedule, and cost before acceptance.
