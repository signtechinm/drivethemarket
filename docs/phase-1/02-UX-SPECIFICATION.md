# Phase 1.2 — Information Architecture and Screen Specification

## Public navigation

```text
Home
Courses
Upcoming Batches
Faculty
About
Resources / FAQ
Contact
Student Login
```

### Public primary journey

Home → Course detail → Upcoming batch → Enquiry → Confirmation

## Administration navigation

```text
Overview
Students
Courses
Batches
Syllabus Planner
Class Schedule
Materials & Recordings
Announcements
Progress & Reports
Website Content
Enquiries
Users & Roles
Audit Log
Settings
```

Navigation items appear only when the signed-in user has the related permission.

## Student navigation

```text
Dashboard
My Learning
Schedule
Announcements
Progress
Profile
```

## Critical screen specifications

### 1. Public home

**Goal:** Explain value quickly and lead visitors to programs or enquiries.

Sections:

- Olive/silver hero with primary course action
- Trust/benefit summary
- Featured courses
- How learning works
- Upcoming batches
- Faculty preview
- Testimonials
- Enquiry call to action
- Legal and trading-risk footer

Mobile behavior: condensed navigation, single-column cards, sticky enquiry action only where it does not obstruct content.

### 2. Admin overview

**Goal:** Show what needs attention today.

Content:

- Active students, batches, today's classes, pending releases
- Today's schedule
- Classes awaiting completion
- Materials awaiting approval
- Recent enrolments and activity
- Quick actions respecting permissions

### 3. Batch list and detail

**Goal:** Create and operate course deliveries.

Content:

- Search, course/status filters, capacity, dates, and instructor
- Batch detail tabs: Overview, Students, Syllabus, Schedule, Materials, Progress
- Batch actions: edit, activate, complete, archive

Mobile behavior: table becomes summary cards; filters open in a Sheet.

### 4. Syllabus planner

**Goal:** Sequence modules and classes without ambiguity.

Content:

- Module accordion/list
- Ordered class rows
- Class status, instructor, date, and resource count
- Add module/class actions
- Reorder capability on desktop with accessible move controls
- Edit class in Sheet/Dialog

### 5. Material release

**Goal:** Make the most important control safe and understandable.

Content:

- Class identity and actual completion status
- Resource checklist with approval/processing state
- Student impact count
- Release prerequisites
- Confirmation dialog with summary
- Audit note after success
- Re-lock action separated from normal controls

The Release button remains disabled until the class is completed and at least one selected resource is approved and ready.

### 6. Student dashboard

**Goal:** Put the next useful learning action first.

Content:

- Next live class
- Continue watching
- Newly released materials
- Current course progress
- Announcements
- Enrolment/access information

### 7. Student class view

**Goal:** Present video and supporting materials in a clear sequence.

Content:

- Module/class breadcrumb
- Video player or locked state
- Resource list
- Learning objectives
- Completion control
- Previous/next class navigation

Future classes may be visible, but protected URLs and metadata are not returned before release.

## Global interaction patterns

- Use page-level Save for complex forms and immediate save only for simple toggles.
- Confirm releases, suspensions, cancellations, and re-locking.
- Toasts confirm successful background-safe operations.
- Persistent inline alerts explain blocking issues.
- Empty states provide the permitted next action.
- Skeletons are used for loading; spinners are reserved for direct actions.
- Preserve filters in the URL for list/report pages.

## Prototype limitations

- Representative data only
- No authentication or database
- No actual upload, email, playback, or permission enforcement
- No final institution copy or legal text
- Logo remains a concept until client approval and vector refinement
