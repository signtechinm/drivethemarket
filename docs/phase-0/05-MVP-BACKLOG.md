# Phase 0.5 — Prioritized MVP Backlog

## Prioritization method

- **Must:** Required for the Drive the Market MVP to operate safely.
- **Should:** Important for launch quality; may be reduced only by explicit approval.
- **Could:** Valuable if capacity remains after Must and Should work.
- **Later:** Intentionally excluded from the MVP.

## Must-have epics

| ID   | Epic                    | Outcome                                               | Key dependencies           |
| ---- | ----------------------- | ----------------------------------------------------- | -------------------------- |
| M-01 | Authentication          | Staff and students access the correct portal securely | Identity provider decision |
| M-02 | Roles and permissions   | Server-enforced access by responsibility              | Approved permission matrix |
| M-03 | Student management      | Staff manage student profiles and account states      | M-01, M-02                 |
| M-04 | Course and syllabus     | Staff define reusable structured programs             | M-02                       |
| M-05 | Batch and schedule      | Staff deliver a course through a dated batch          | M-04                       |
| M-06 | Enrolment               | Students receive access to the correct batch          | M-03, M-05                 |
| M-07 | Private content         | Staff prepare protected class resources               | Storage/video decisions    |
| M-08 | Approval and release    | Content unlocks only after completed class            | M-02, M-05, M-07           |
| M-09 | Student learning portal | Eligible students access released learning            | M-06, M-08                 |
| M-10 | Basic progress          | Students and staff see meaningful activity            | M-09                       |
| M-11 | Notifications           | Students learn about access and changes               | Email provider decision    |
| M-12 | Public website          | Visitors understand the institution and programs      | Approved content/brand     |
| M-13 | Enquiries               | Institution receives and manages public leads         | M-12                       |
| M-14 | Audit logging           | High-risk actions are traceable                       | M-01, M-02                 |
| M-15 | Operations              | Backups, monitoring, validation, and recovery         | Hosting decisions          |

## Should-have backlog

| ID   | Item                      | Acceptance summary                                         |
| ---- | ------------------------- | ---------------------------------------------------------- |
| S-01 | Bulk student import       | Preview errors before committing valid students/enrolments |
| S-02 | Responsive calendar       | Staff and students view upcoming class schedule clearly    |
| S-03 | Video resume              | Playback resumes near the last confirmed position          |
| S-04 | Website CMS               | Website Editor updates approved sections without code      |
| S-05 | Operational dashboard     | Staff see today's classes and pending actions              |
| S-06 | Standard reports          | Authorized users filter and export agreed reports          |
| S-07 | Emergency re-lock         | Authorized user revokes access with a mandatory reason     |
| S-08 | Class rescheduling notice | Enrolled students receive schedule-change notice           |
| S-09 | Accessibility baseline    | Critical journeys support keyboard and visible focus       |
| S-10 | Initial data import       | Launch data is validated and migrated safely               |

## Could-have backlog

| ID   | Item                            | Notes                                           |
| ---- | ------------------------------- | ----------------------------------------------- |
| C-01 | Scheduled release               | Only if manual release is confirmed first       |
| C-02 | Delayed release                 | Configurable delay after completion             |
| C-03 | Admin two-factor authentication | Recommended if provider/setup fits schedule     |
| C-04 | Notification preferences        | Students control non-essential email categories |
| C-05 | Recently viewed                 | Student shortcut to recent learning resources   |
| C-06 | Low-engagement alert            | Configurable staff dashboard warning            |

## Later backlog

| ID   | Item                                         |
| ---- | -------------------------------------------- |
| L-01 | Online payments and invoices                 |
| L-02 | Attendance and live-class integration        |
| L-03 | Assignments, submissions, and grading        |
| L-04 | Quizzes and assessments                      |
| L-05 | Certificates                                 |
| L-06 | WhatsApp/SMS messaging                       |
| L-07 | Discussion and instructor Q&A                |
| L-08 | Native mobile application                    |
| L-09 | Advanced analytics and CRM integrations      |
| L-10 | Multi-institution and multilingual operation |

## MVP release slices

### Slice A — Secure administration foundation

M-01, M-02, M-03, M-14, and the required part of M-15.

### Slice B — Academic setup

M-04, M-05, M-06, S-01, and S-02.

### Slice C — Controlled learning content

M-07, M-08, M-11, S-07, and S-08.

### Slice D — Student experience

M-09, M-10, S-03, and S-09.

### Slice E — Public website and operations

M-12, M-13, S-04, S-05, S-06, S-10, and completion of M-15.
