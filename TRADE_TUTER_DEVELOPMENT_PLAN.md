# Drive the Market — Development Plan

**Product:** Drive the Market  
**Document type:** Technical development and delivery plan  
**Preferred frontend:** Next.js, React, TypeScript, shadcn/ui  
**Brand direction:** Olive green with silver-gradient combinations  
**Version:** 1.0  
**Date:** August 2026

![Drive the Market sample logo](assets/trade-tuter-logo-concept.png)

---

## 1. Product vision

Drive the Market is a secure learning-management platform for a trading education institution. It connects the institution's public website, academic administration, and student learning portal.

Live classes will continue to take place outside Drive the Market. The platform will manage everything around those classes:

- Student registration and batch enrolment
- Course and syllabus planning
- Individual class scheduling
- Study-material and recording management
- Controlled release of resources after a class
- Student learning and video progress
- Institution website and enquiry collection
- Academic and engagement reporting

The central product rule is:

> A resource may be prepared before a live class, but it must remain unavailable to students until the class is completed and an authorized user releases it.

## 2. Development objectives

The implementation should:

1. Provide a secure and maintainable application foundation.
2. Give each staff role only the functions it is permitted to use.
3. Model courses, batches, syllabuses, modules, and classes clearly.
4. Protect private documents and video recordings.
5. Enforce the post-class material-release workflow on the server.
6. Provide a simple, responsive student learning experience.
7. Give non-technical staff control over public website content.
8. Produce reliable progress, activity, and operational reports.
9. Allow future modules to be added without rebuilding the core system.

## 3. Proposed technical architecture

### 3.1 Application stack

| Layer           | Recommended technology                                 | Purpose                                                         |
| --------------- | ------------------------------------------------------ | --------------------------------------------------------------- |
| Web framework   | Next.js with App Router                                | Public website, admin application, and student portal           |
| User interface  | React and TypeScript                                   | Typed, component-based application development                  |
| UI system       | shadcn/ui                                              | Accessible and reusable interface components                    |
| Styling         | Tailwind CSS                                           | Responsive styling and design tokens                            |
| Forms           | React Hook Form with schema validation                 | Reliable client and server form validation                      |
| Database        | PostgreSQL                                             | Relational academic and progress data                           |
| Data access     | Prisma ORM                                             | Typed schema, migrations, and database queries                  |
| Authentication  | Auth.js or a managed identity provider                 | Login, session management, password reset, and account security |
| Authorization   | Application RBAC policies                              | Role and permission enforcement on the server                   |
| File storage    | S3-compatible private object storage                   | Documents, images, and protected downloads                      |
| Video           | Protected streaming provider or private object storage | Secure recorded-class playback                                  |
| Background work | Managed queue or scheduled jobs                        | Email, release scheduling, imports, and reporting               |
| Email           | Transactional email provider                           | Invitations, password reset, releases, and notices              |
| Monitoring      | Error and performance monitoring service               | Production errors and application health                        |
| Deployment      | Vercel-compatible deployment plus managed PostgreSQL   | Preview deployments and production hosting                      |

Provider selection will be finalized during the foundation phase. The application should use adapters for storage, video, email, and notifications so providers can be changed later.

### 3.2 Application areas

```text
Drive the Market
├── Public Website
│   ├── Institution and course pages
│   ├── Faculty, testimonials, FAQs, and batches
│   └── Contact and enquiry capture
├── Administration Portal
│   ├── Users, roles, students, and enrolments
│   ├── Courses, batches, syllabuses, and classes
│   ├── Materials, videos, releases, and announcements
│   └── Reports, audit logs, website content, and settings
└── Student Portal
    ├── Dashboard and schedule
    ├── Modules and class sessions
    ├── Released documents and videos
    └── Learning history and progress
```

### 3.3 Next.js application organization

Recommended route groups:

```text
app/
├── (public)/                 Public institution website
├── (auth)/                   Login, invitation, and password reset
├── (student)/portal/         Student dashboard and learning area
├── (admin)/admin/            Administration application
├── api/                      Webhooks and integration endpoints
└── actions/                  Secured server-side application actions
```

Recommended supporting folders:

```text
components/
├── ui/                       shadcn/ui primitives
├── brand/                    Logo and branded components
├── forms/                    Shared validated forms
├── tables/                   Data tables, filters, and pagination
└── learning/                 Syllabus, class, resource, and progress UI

lib/
├── auth/                     Authentication and authorization
├── db/                       Prisma database client and queries
├── storage/                  Private file access
├── video/                    Streaming and playback adapters
├── notifications/            Email and in-app notifications
├── validation/               Shared schemas
└── audit/                    Audit-event recording
```

Server Components should be the default for data-driven pages. Client Components should be used only where browser interaction is required, such as forms, data-table controls, video playback, and drag-and-drop ordering.

## 4. Drive the Market visual system

### 4.1 Brand palette

| Token      | Suggested value | Usage                                  |
| ---------- | --------------: | -------------------------------------- |
| Olive 900  |       `#28320F` | Dark brand backgrounds and strong text |
| Olive 800  |       `#3D4A18` | Navigation and elevated brand surfaces |
| Olive 700  |       `#556B2F` | Primary buttons and active controls    |
| Olive 600  |       `#6B7D3A` | Hover states and highlights            |
| Olive 100  |       `#EEF1E5` | Soft backgrounds and selected rows     |
| Silver 700 |       `#73777D` | Secondary text and dark gradient edge  |
| Silver 400 |       `#B8BDC3` | Borders, icons, and neutral accents    |
| Silver 200 |       `#DDE0E3` | Dividers and disabled controls         |
| Silver 50  |       `#F7F8F8` | Page and card backgrounds              |
| Charcoal   |       `#1E221B` | Primary body text                      |
| White      |       `#FFFFFF` | Cards and text on dark backgrounds     |

### 4.2 Brand gradients

Silver gradients should be restrained and used for decorative or premium surfaces, not long text backgrounds.

```css
--gradient-silver: linear-gradient(
  135deg,
  #f7f8f8 0%,
  #d9dde0 35%,
  #aeb4ba 68%,
  #f1f3f3 100%
);

--gradient-olive-silver: linear-gradient(
  135deg,
  #3d4a18 0%,
  #556b2f 48%,
  #b8bdc3 100%
);
```

### 4.3 shadcn/ui direction

The shadcn/ui theme should use CSS variables so branding is consistent across all components.

Priority components:

- Button, Badge, Card, Separator, Tabs, Avatar, Tooltip
- Input, Textarea, Select, Checkbox, Radio Group, Switch
- Form, Calendar, Popover, Command, Combobox
- Table/Data Table, Pagination, Dropdown Menu
- Dialog, Alert Dialog, Sheet, Drawer
- Breadcrumb, Sidebar, Navigation Menu
- Accordion, Collapsible, Progress, Skeleton
- Toast/Sonner and Alert

UI principles:

- Olive is reserved for primary actions, active navigation, progress, and successful states.
- Silver gradients are used for cover areas, selected premium cards, dividers, and restrained accents.
- Cards use soft silver-neutral backgrounds with clear olive focus states.
- Locked resources use a neutral silver state with a clear lock icon.
- Released resources use an olive badge and accessible text label.
- Destructive actions remain red and must not be recolored olive.
- Interfaces must be keyboard accessible and usable at mobile widths.

## 5. Core domain model

The initial database will include the following logical entities:

### Identity and authorization

- User
- Role
- Permission
- UserRole
- RolePermission
- StudentProfile
- InstructorProfile
- Session and account records

### Academic management

- Course
- SyllabusTemplate
- SyllabusTemplateModule
- SyllabusTemplateClass
- Batch
- BatchModule
- ClassSession
- Enrolment
- InstructorAssignment

### Content and learning

- Material
- VideoAsset
- MaterialRelease
- MaterialProgress
- VideoProgress
- ClassProgress

### Communication and operations

- Announcement
- Notification
- WebsitePage
- WebsiteEnquiry
- AuditLog
- SystemSetting

Important database rules:

- A student can have multiple enrolments.
- An enrolment belongs to one student and one batch.
- A batch receives an editable copy of the course syllabus template.
- A material belongs to an individual class session.
- A resource has separate preparation, approval, and release states.
- Progress belongs to one student and one resource.
- Release and re-lock actions create immutable audit entries.

## 6. Development phases

The plan is divided into incremental phases. Every phase ends with an internal quality gate based on its documented deliverables, automated checks, and exit criteria. Client demonstrations and feedback remain valuable but are not blocking dependencies; work may continue to the next phase after internal validation. Feedback received later is evaluated and incorporated through normal backlog or change-control review.

---

## Phase 0 — Discovery and scope confirmation

**Indicative duration:** 1 week

### Objectives

- Confirm terminology, workflows, responsibilities, and MVP boundaries.
- Resolve decisions that materially affect architecture or effort.
- Convert the product concept into approved user journeys.

### Work items

- Conduct requirements workshop.
- Confirm staff roles and permission matrix.
- Confirm student registration and enrolment process.
- Define class completion and material approval authority.
- Confirm manual, scheduled, and delayed release requirements.
- Decide whether payment, attendance, quizzes, assignments, and certificates are in the MVP.
- Confirm expected student volume and file/video volume.
- Select external live-class, video, email, and storage approach.
- Define progress calculation rules.
- Produce prioritized product backlog.

### Deliverables

- Approved scope statement
- Role and permission matrix
- User-journey diagrams
- Initial entity relationship model
- Prioritized MVP backlog
- Refined delivery estimate

### Exit criteria

- The project owner adopts working defaults for unresolved decisions, and the MVP scope, permission model, journeys, domain model, and backlog pass internal review.

---

## Phase 1 — UX, brand system, and clickable prototype

**Indicative duration:** 1–2 weeks

### Objectives

- Establish the Drive the Market visual identity.
- Validate navigation and important workflows before implementation.

### Work items

- Refine the sample logo and create approved logo variants.
- Finalize olive and silver design tokens.
- Define typography, spacing, radius, shadows, icons, and responsive breakpoints.
- Configure the proposed shadcn/ui component theme.
- Design public, admin, and student navigation.
- Create low-fidelity wireframes.
- Produce high-fidelity screens for critical journeys:
  - Admin dashboard
  - Course, batch, and enrolment management
  - Syllabus and class planner
  - Material upload and release
  - Student dashboard
  - Class learning page and video view
  - Public home and course pages
- Prepare a clickable prototype for review.

### Deliverables

- Approved Drive the Market logo and brand guide
- UI token specification
- shadcn/ui component examples
- Responsive screen designs
- Clickable prototype

### Exit criteria

- The identity direction and critical desktop/mobile journeys pass internal UX, responsiveness, accessibility, and technical-feasibility checks. Later client feedback is handled without blocking Phase 2.

---

## Phase 2 — Project foundation and engineering setup

**Indicative duration:** 1 week

### Objectives

- Establish a production-ready Next.js foundation.
- Set quality, security, and deployment standards before feature development.

### Work items

- Initialize Next.js with TypeScript and App Router.
- Configure Tailwind CSS and shadcn/ui.
- Implement Drive the Market theme tokens and branded layout primitives.
- Configure linting, formatting, strict type checks, and commit standards.
- Establish environment-variable validation.
- Configure PostgreSQL and Prisma migrations.
- Add test framework and test database strategy.
- Configure preview and production deployment environments.
- Establish continuous integration checks.
- Add error monitoring, structured logs, and health checks.
- Create seed data for local development.

### Deliverables

- Deployable application shell
- Branded shadcn/ui theme
- Database migration workflow
- CI quality pipeline
- Preview deployment
- Engineering README and environment guide

### Exit criteria

- A clean checkout can be installed, tested, migrated, and deployed using documented steps.

---

## Phase 3 — Authentication, users, roles, and permissions

**Indicative duration:** 1–2 weeks

### Objectives

- Secure access to all application areas.
- Establish server-enforced role-based access control.

### Work items

- Implement login, logout, invitation, and password reset.
- Add secure session management and login throttling.
- Build user and profile management.
- Implement roles and granular permissions.
- Add reusable server-side authorization policies.
- Create route protection for admin and student areas.
- Add account activation, deactivation, and suspension.
- Record security-sensitive events in the audit log.
- Add optional administrator two-factor authentication if approved.

### Deliverables

- Authentication flows
- User administration
- Role and permission screens
- Protected application areas
- Authorization test suite

### Exit criteria

- Every protected operation is denied unless the signed-in user has the required permission.

---

## Phase 4 — Course, syllabus, and batch management

**Indicative duration:** 2 weeks

### Objectives

- Implement the reusable academic structure.
- Allow staff to create a batch-specific teaching plan.

### Work items

- Build course create, edit, archive, search, and list functions.
- Build reusable syllabus templates.
- Add ordered modules and planned class templates.
- Build batch creation and management.
- Copy a syllabus template into a new batch.
- Add batch-specific module and class editing.
- Add instructors, dates, capacity, and external live-class links.
- Implement class statuses: draft, scheduled, conducted, completed, released, cancelled, and rescheduled.
- Add calendar and list views for class sessions.

### Deliverables

- Course management
- Syllabus-template builder
- Batch management
- Batch syllabus planner
- Class calendar and schedule

### Exit criteria

- Staff can create a course, build its syllabus, create a batch, and produce a complete class schedule.

---

## Phase 5 — Student registration and enrolment

**Indicative duration:** 1–2 weeks

### Objectives

- Manage student profiles and access to batches.
- Support efficient staff-led registration and bulk operations.

### Work items

- Build student profile create, edit, search, and status management.
- Implement account invitation and activation.
- Build batch enrolment workflow.
- Add access start and expiry dates.
- Support pending, active, suspended, completed, and cancelled enrolments.
- Add batch capacity warnings.
- Implement CSV/Excel import with preview and error reporting.
- Add enrolment filters and exports.
- Apply active-enrolment checks to future protected-content access.

### Deliverables

- Student directory
- Student profile screens
- Enrolment workflow
- Bulk import process
- Enrolment exports

### Exit criteria

- Staff can register students individually or in bulk and correctly control batch access.

---

## Phase 6 — Materials, recordings, and controlled release

**Indicative duration:** 2–3 weeks

### Objectives

- Implement the main Drive the Market business workflow.
- Protect all unreleased and private learning content.

### Work items

- Configure private object storage.
- Build document, link, and video-asset creation.
- Validate upload type, size, and ownership.
- Add resource title, description, type, order, and download settings.
- Implement draft, review, approved, released, and archived states.
- Allow staff preview of unreleased content.
- Implement class completion confirmation.
- Implement manual release after completion.
- Add scheduled or delayed release if approved for the MVP.
- Implement emergency re-lock with reason capture.
- Create short-lived protected resource access.
- Integrate secure video playback or provider webhooks.
- Record completion, approval, release, and re-lock audit events.
- Notify enrolled students when resources become available.

### Deliverables

- Material and recording library
- Secure upload and playback
- Approval and release workflow
- Protected access URLs
- Release notifications
- Audit history

### Exit criteria

- An unenrolled student or a student before release cannot access a resource, including through a copied direct URL.
- An authorized user can complete a class and release approved content successfully.

---

## Phase 7 — Student portal and progress tracking

**Indicative duration:** 2 weeks

### Objectives

- Give students a clear, mobile-friendly learning experience.
- Record meaningful learning activity without affecting release controls.

### Work items

- Build student dashboard.
- Display current enrolments and upcoming class schedule.
- Build module and class learning views.
- Display clear locked, upcoming, completed, and released states.
- Add document, link, and protected video access.
- Save video position periodically and allow resume.
- Record material opened and completed events.
- Calculate class, module, and course progress.
- Add recently viewed and newly released resources.
- Add profile and account settings.
- Add responsive mobile navigation and loading states.

### Deliverables

- Student dashboard
- Course learning interface
- Protected resource viewer
- Video playback and resume
- Progress indicators

### Exit criteria

- A student can complete the full post-class learning journey on mobile and desktop.
- Progress is accurate and isolated to the signed-in student.

---

## Phase 8 — Announcements and notifications

**Indicative duration:** 1 week

### Objectives

- Provide reliable institution-to-student communication.

### Work items

- Build global and batch-specific announcements.
- Add in-app notification centre.
- Add email templates using Drive the Market branding.
- Implement notifications for:
  - Account invitation
  - Batch enrolment
  - Class schedule change
  - Material or recording release
  - Enrolment suspension or expiry
  - General announcement
- Add notification preference controls where appropriate.
- Add retry and failure visibility for email delivery.

### Deliverables

- Announcement management
- Student notification centre
- Branded transactional emails
- Delivery and failure logs

### Exit criteria

- Targeted users receive the correct in-app and email messages without exposing another batch's information.

---

## Phase 9 — Public website and content management

**Indicative duration:** 2 weeks

### Objectives

- Launch the public Drive the Market and institution presence.
- Allow authorized staff to maintain content without code changes.

### Work items

- Build responsive public layout and navigation.
- Implement pages for home, institution, courses, faculty, batches, testimonials, FAQ, contact, privacy, and terms.
- Add SEO metadata, social preview images, sitemap, and structured content.
- Build editable content blocks for common page sections.
- Add enquiry form with validation, spam protection, and admin notification.
- Store and manage enquiries in the administration portal.
- Add student-login entry points.
- Optimize images, performance, and accessibility.

### Deliverables

- Public responsive website
- Website content-management screens
- Enquiry-management workflow
- SEO and performance baseline

### Exit criteria

- Staff can update approved website content and enquiries are captured reliably.

---

## Phase 10 — Reporting and operational dashboards

**Indicative duration:** 1–2 weeks

### Objectives

- Give administrators practical academic and engagement visibility.

### Work items

- Build admin summary dashboard.
- Add reports for:
  - Students by batch
  - Enrolment state and expiry
  - Planned versus conducted classes
  - Materials awaiting review or release
  - Resource access and video progress
  - Module and course completion
  - Students with low or no recent activity
  - Website enquiries
- Add filters, date ranges, pagination, and CSV/Excel export.
- Ensure report access respects permissions.
- Optimize larger queries and indexes.

### Deliverables

- Operational dashboard
- Academic reports
- Student-engagement reports
- Export functions

### Exit criteria

- Authorized staff can answer routine operational questions without direct database access.

---

## Phase 11 — Quality assurance, security, and launch preparation

**Indicative duration:** 2 weeks

### Objectives

- Validate the complete system under realistic conditions.
- Prepare staff, data, infrastructure, and recovery procedures for launch.

### Work items

- Complete end-to-end workflow testing.
- Test every role and permission boundary.
- Test unreleased-resource and copied-link protection.
- Perform responsive, browser, accessibility, and keyboard tests.
- Verify input validation, upload protection, rate limiting, and session security.
- Perform performance and database-query review.
- Test email and scheduled job behavior.
- Verify backup and restoration procedure.
- Import initial users, courses, batches, syllabuses, and enrolments.
- Prepare administrator and instructor training.
- Produce support and operational documentation.
- Complete client user-acceptance testing.

### Deliverables

- QA report and resolved defect list
- Security review checklist
- Backup and recovery evidence
- Production data-import report
- User guides and staff training
- Client UAT approval

### Exit criteria

- No critical or high-risk defects remain.
- UAT, security, recovery, and launch checklists are approved.

---

## Phase 12 — Production launch and stabilization

**Indicative duration:** 1–2 weeks of focused monitoring

### Objectives

- Release Drive the Market safely.
- Resolve real-world launch issues quickly and establish normal support.

### Work items

- Complete final production migration.
- Verify domains, HTTPS, email authentication, storage, and webhooks.
- Run production smoke tests.
- Enable production monitoring and alerts.
- Monitor authentication, uploads, video access, releases, and notifications.
- Review errors and performance daily during stabilization.
- Resolve launch defects according to severity.
- Conduct post-launch review and prioritize the next release.

### Deliverables

- Live Drive the Market platform
- Launch report
- Stabilization issue register
- Prioritized post-MVP roadmap

### Exit criteria

- Core workflows are stable in production and normal support ownership is established.

## 7. Indicative schedule

The phases above represent approximately **18–24 weeks** for a controlled MVP, depending on team size, approval speed, content readiness, external provider integrations, and which optional items are retained in the MVP.

Some activities can overlap safely:

- Brand/UX can continue while the engineering foundation is prepared.
- Public website content collection can run alongside core portal development.
- Test-case preparation can begin as soon as each workflow is approved.
- Initial data preparation can begin before final QA.

An indicative sequence is:

| Stage                 | Phases | Approximate period |
| --------------------- | ------ | -----------------: |
| Definition            | 0–1    |          2–3 weeks |
| Foundation            | 2–3    |          2–3 weeks |
| Academic core         | 4–5    |          3–4 weeks |
| Learning workflow     | 6–8    |          5–6 weeks |
| Website and reporting | 9–10   |          3–4 weeks |
| QA and release        | 11–12  |          3–4 weeks |

This is a planning range, not a fixed quotation. A delivery estimate should be finalized after Phase 0.

## 8. Testing strategy

### Automated tests

- Unit tests for release rules, progress calculations, and permission policies
- Integration tests for database workflows and protected resource access
- Component tests for important forms and UI states
- End-to-end tests for administrator, instructor, and student journeys
- Regression tests for all critical business rules

### Mandatory end-to-end scenarios

1. Administrator creates a user and assigns a role.
2. Staff creates a course, syllabus, batch, and schedule.
3. Student is registered and enrolled in the batch.
4. Staff uploads materials before a scheduled class.
5. Student sees the class but cannot access those materials.
6. Instructor completes the live class.
7. Authorized staff reviews and releases the content.
8. Student receives a notification and accesses the released content.
9. Video progress is saved and resumed correctly.
10. Suspended or expired enrolment immediately loses protected access.
11. Release and access events appear correctly in the audit trail.

## 9. Definition of done

A feature is complete only when:

- The approved acceptance criteria pass.
- Permission checks are implemented on the server.
- Loading, empty, error, success, and unauthorized states are designed.
- Desktop and mobile behavior is verified.
- Accessibility checks are completed.
- Automated tests cover critical logic.
- Audit logging is added where required.
- Error monitoring receives useful context without private data leakage.
- Documentation and migrations are updated.
- The feature is reviewed in a preview environment.

## 10. MVP launch acceptance criteria

Drive the Market is ready for MVP launch when:

1. Staff roles and permissions operate correctly.
2. Courses, syllabuses, batches, and class schedules can be managed.
3. Students can be registered and enrolled individually or in bulk.
4. Materials and recordings can be assigned to individual classes.
5. Content prepared before class is inaccessible to students.
6. Authorized staff can complete a class and release approved resources.
7. Only students with active enrolments can access released content.
8. Copied private file or video links cannot bypass authorization.
9. Students can view their schedule, materials, videos, and progress.
10. Public pages and enquiry capture work correctly.
11. Reports and audit logs provide the agreed operational information.
12. Backup restoration, monitoring, responsive design, and accessibility checks pass.
13. The client completes user-acceptance testing and approves production launch.

## 11. Post-MVP roadmap

Potential later releases:

- Payment collection, invoices, and payment-gated enrolment
- Attendance and live-class provider integration
- Assignments, submissions, feedback, and grading
- Quizzes, assessments, and question banks
- Certificates and completion verification
- WhatsApp and SMS notifications
- Student discussion and instructor Q&A
- Native or installable mobile experience
- Advanced engagement analytics
- CRM, marketing, accounting, or affiliate integrations
- Multi-institution or franchise support

## 12. Decisions required to start

The client should confirm:

- Final approval of the name **Drive the Market**
- Final logo direction and brand palette
- Final staff roles and release authority
- Staff-created versus self-created student accounts
- Whether payments affect MVP access
- Manual-only or scheduled content release
- Allowed document and video downloads
- Video hosting preference and approximate monthly volume
- Required notification channels
- Progress completion rules
- MVP inclusion of attendance, assessments, assignments, or certificates
- Expected launch student count and concurrent usage
- Hosting region, privacy requirements, and retention periods
- Institution content, images, policies, and domain details

## 13. Immediate next action

Begin with a Phase 0 discovery workshop, approve the permission matrix and content-release rules, and then prepare the branded Drive the Market interface prototype before starting feature implementation.
