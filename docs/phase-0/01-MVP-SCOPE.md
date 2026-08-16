# Phase 0.1 — MVP Scope and Assumptions

## 1. Product statement

Drive the Market is a web-based learning-management platform for a trading education institution. It contains a public website, staff administration portal, and student learning portal.

Drive the Market does not conduct the live class in the MVP. It schedules the class and controls the learning resources that become available afterward.

## 2. Primary outcome

An authorized staff member can plan a batch and its classes, enrol students, prepare class resources, confirm that the external live class has been completed, and release approved materials securely to eligible students. Students can then consume those materials and see their own progress.

## 3. Users in scope

- Super Administrator
- Administrator
- Academic Manager
- Instructor
- Content Manager
- Website Editor
- Student
- Anonymous public visitor

## 4. Functional scope

### 4.1 Identity and access

- Secure login and logout
- Password invitation and reset
- Staff and student account activation/deactivation
- Role-based server authorization
- Configurable role permissions
- Audit of security-sensitive operations

### 4.2 Students and enrolments

- Student profile management
- Individual student creation
- Bulk student import with validation preview
- Batch enrolment
- Access start and expiry dates
- Pending, active, suspended, completed, and cancelled enrolment states
- Student and enrolment search, filters, and export

### 4.3 Courses, batches, and syllabuses

- Course management
- Reusable syllabus templates
- Ordered modules and class templates
- Batch creation from a course
- Batch-specific syllabus copy
- Batch schedule, instructor, capacity, and status
- Class rescheduling and cancellation
- External live-class link or joining instructions

### 4.4 Materials and class release

- Documents, images, links, and recorded videos against a class
- Resource ordering and description
- Draft, review, approved, released, and archived states
- Staff preview before release
- Class conducted and completed states
- Manual release after completion
- Emergency re-lock with mandatory reason
- Protected file and video access
- Release audit trail and student notification

### 4.5 Student learning portal

- Dashboard with current enrolments and next class
- Batch syllabus with modules and classes
- Visible locked states without protected content leakage
- Released document, link, and video access
- Video resume position and completion percentage
- Material completion state
- Class, module, and course progress
- Announcements and in-app notifications
- Student profile and password management

### 4.6 Public website

- Home, institution, courses, faculty, upcoming batches, testimonials, FAQ, contact, privacy, and terms pages
- Basic staff-managed content sections
- Enquiry form with spam protection
- Enquiry storage and administrator notification
- Student-login entry point
- Responsive layout and baseline SEO

### 4.7 Reporting and audit

- Students and enrolments by batch
- Planned versus conducted classes
- Content awaiting review or release
- Resource and video activity
- Module and course progress
- Inactive-student view
- Website enquiries
- CSV/Excel export
- Immutable audit history for key actions

## 5. Explicitly out of MVP

- Integrated live video classes
- Payment gateway, invoices, and accounting
- Student public self-registration
- Attendance management
- Assignments and submissions
- Quizzes and examinations
- Instructor grading
- Certificates
- WhatsApp and SMS integrations
- Discussion forums
- Native mobile applications
- Advanced CRM, affiliate, or marketing automation
- Multi-institution tenancy
- Multilingual content

Items may move into the MVP only through approved scope change.

## 6. Key business rules

1. A student may be enrolled in multiple batches.
2. Only an active enrolment grants batch access.
3. A batch receives an independent copy of its course syllabus.
4. Each material belongs to one class session.
5. Uploading a material never publishes it.
6. A class must be completed before resources can be released.
7. Only approved resources can be released.
8. Only authorized roles can complete, release, or re-lock a class.
9. Re-locking requires a reason and creates an audit event.
10. A copied file or video URL cannot bypass authorization.
11. Progress does not unlock future content.
12. Suspending or expiring an enrolment removes protected access.

## 7. Non-functional scope

- Responsive from 360px mobile width through desktop
- Keyboard-accessible critical workflows
- Server-side permission enforcement
- Secure sessions and login throttling
- Private storage with short-lived access URLs
- File type and size validation
- Error monitoring and structured logs
- Automated database and asset backups
- Tested restoration procedure
- Pagination and indexed queries for large lists
- Institution timezone used consistently for schedules and releases
- Audit timestamps retained in UTC and displayed in the institution timezone

## 8. Technical assumptions

- Next.js App Router, React, TypeScript, Tailwind CSS, and shadcn/ui
- PostgreSQL with Prisma ORM
- A single deployable web application for public, staff, and student experiences
- Private S3-compatible object storage
- Protected external video streaming or private streaming adapter
- Transactional email provider
- Vercel-compatible deployment and managed PostgreSQL

Final vendors remain an implementation decision after expected volume and budget are confirmed.

## 9. Success measures for the MVP

- Staff can create a batch and complete the end-to-end academic workflow without developer support.
- An unauthorized or unenrolled user cannot access protected content.
- Students can locate newly released material in no more than three navigation actions after login.
- Release actions and security-sensitive changes are traceable to an individual staff user.
- Core student journeys work on current mobile and desktop browsers.
- Initial staff can manage website content and enquiries after training.

## 10. Dependencies supplied by the client

- Institution legal name, address, contact details, and policies
- Final Drive the Market brand approval
- Staff role owners and approval authority
- Course, syllabus, batch, student, trainer, and website sample data
- Live-class joining workflow
- Video and file retention expectations
- Domain and production hosting ownership
- Privacy, terms, and trading-risk disclaimer content
