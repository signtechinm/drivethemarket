# Trading Education Platform — Project Plan

## 1. Project overview

The platform will help a trading education institution manage students, batches, syllabuses, class schedules, study materials, and recorded videos.

Live classes are conducted outside this platform. The platform's central business rule is that study materials and recordings must remain locked until the related live class has been completed and an authorized staff member releases them.

The solution consists of three connected areas:

1. A public institution website
2. An administration and academic-management backend
3. A secure student learning portal

## 2. Project objectives

- Maintain students, staff, roles, and permissions securely.
- Create courses, batches, and batch-specific class schedules.
- Register students and enrol them in one or more batches.
- Plan the syllabus as modules and individual class sessions.
- Upload notes, documents, links, assignments, and recorded videos against a class.
- Keep class materials locked until the class is completed.
- Allow authorized staff to release materials manually or at a scheduled time.
- Give students secure access only to content belonging to their active enrolments.
- Track student learning and video progress.
- Present the institution, programs, faculty, and upcoming batches publicly.

## 3. User roles and permissions

The system will use role-based access control. Permissions will be checked by the server for every protected operation.

| Role             | Main responsibilities                                              |
| ---------------- | ------------------------------------------------------------------ |
| Super Admin      | Full system and configuration access                               |
| Administrator    | Users, students, batches, enrolments, and reports                  |
| Academic Manager | Syllabuses, class planning, completion, and material release       |
| Instructor       | Assigned batches, classes, materials, and recordings               |
| Content Manager  | Upload, edit, order, and manage learning resources                 |
| Website Editor   | Maintain public website content                                    |
| Student          | Access enrolled courses, released materials, and personal progress |

Example granular permissions:

- View, create, edit, deactivate, and delete users
- Assign roles and permissions
- Manage students
- Manage courses and batches
- Register and enrol students
- Manage syllabus templates
- Plan and reschedule classes
- Upload and approve materials
- Mark classes as completed
- Release or lock materials
- Manage public website content
- View or export reports
- View audit logs

## 4. Academic structure

The recommended academic hierarchy is:

```text
Course
└── Batch
    ├── Enrolled students
    └── Batch syllabus
        └── Module
            └── Class session
                ├── Notes and documents
                ├── Assignments
                ├── External links
                └── Recorded video
```

### 4.1 Course

A course defines the reusable trading program, its description, expected duration, and syllabus template.

Example courses:

- Beginner Trading Program
- Advanced Technical Analysis
- Options Trading

### 4.2 Batch

A batch is a scheduled delivery of a course to a group of students.

Suggested batch fields:

- Batch name and unique code
- Course
- Primary instructor
- Start and expected end dates
- Normal class schedule
- Maximum capacity
- External live-class link or instructions
- Enrolment start and end dates
- Status: draft, open, active, completed, or archived

### 4.3 Syllabus and modules

Each course has a reusable syllabus template. When a batch is created, the template is copied into a batch syllabus so staff can adjust dates or content without modifying other batches.

A syllabus contains ordered modules, and each module contains ordered class sessions.

### 4.4 Class session

Each planned class should contain:

- Class number and title
- Module
- Description and learning objectives
- Planned date and time
- Actual completion date and time
- Assigned instructor
- External live-class link
- Expected duration
- Material-release method
- Status

Recommended class lifecycle:

```text
Draft → Scheduled → Conducted → Completed → Materials Released
```

Cancelled and rescheduled states should also be supported.

## 5. Student registration and enrolment

Student registration and batch enrolment are separate processes. This allows one student account to join multiple courses or batches.

### 5.1 Student registration

Suggested student information:

- Full name
- Email address
- Phone number
- Address
- Date of birth, if required
- Emergency or guardian details, if required
- Profile image, optional
- Account status
- Password setup or invitation status

### 5.2 Batch enrolment

An enrolment connects a student to a batch and contains:

- Student
- Batch
- Enrolment date
- Access start and expiry dates
- Payment or reference status, if required
- Enrolment status: pending, active, suspended, completed, or cancelled
- Administrative notes

The system should support individual registration and CSV/Excel bulk import.

## 6. Study materials and recorded videos

Every learning resource must belong to a particular class session.

Supported resource types should include:

- PDF notes
- Presentations
- Images
- Worksheets
- Assignments
- External links
- Recorded videos
- Supplementary downloads

Each resource should contain:

- Title and description
- Resource type
- File or protected video reference
- Display order
- Draft, approved, published, or archived status
- Availability date and time
- Download permission
- Uploaded by and uploaded date
- File size and format, where applicable

Large videos should be stored using protected object storage or a secure video-streaming service. Private or signed URLs should be used instead of publicly accessible file links.

## 7. Class completion and material-release workflow

This is the platform's most important workflow.

### 7.1 Default workflow

1. Academic staff schedule a class.
2. Staff may upload materials before the live class.
3. Students can see the upcoming class, but materials remain locked.
4. The live class is conducted outside the platform.
5. An instructor or academic manager marks the class as completed.
6. An authorized person reviews the resources and selects **Release materials**.
7. Approved resources become available to actively enrolled students.
8. Students receive an in-app notification and, if enabled, an email notification.

### 7.2 Release modes

- **Manual release:** An authorized staff member releases content after confirming completion.
- **Scheduled release:** Content becomes available at an approved date and time.
- **Delayed release:** Content is released a configured period after class completion.

Manual release is recommended for the first version.

### 7.3 Release controls

- A draft class cannot release materials.
- Uploading a resource does not automatically publish it.
- Only authorized roles can complete a class or release resources.
- Staff can preview locked content.
- Resources can be locked again in exceptional circumstances.
- Every completion, release, re-lock, and schedule change is written to an audit log.
- Students must have an active enrolment at the time of access.
- Direct file and video URLs must not bypass access checks.

## 8. Administration backend

### 8.1 Dashboard

The dashboard should summarize:

- Active students and batches
- Today's and upcoming classes
- Classes awaiting completion confirmation
- Classes with materials awaiting release
- Recent enrolments
- Recently uploaded recordings
- Students with low engagement
- Storage usage and system alerts

### 8.2 Administration sections

```text
Dashboard
Users and Roles
Students
Courses
Batches
Enrolments
Syllabus Templates
Class Schedule
Materials and Recordings
Announcements
Student Progress
Website Content
Reports
Audit Logs
Settings
```

## 9. Student portal

### 9.1 Student dashboard

The dashboard should display:

- Current courses and batches
- Next scheduled class
- Upcoming and completed classes
- Newly released materials
- Overall learning progress
- Announcements
- Recently viewed content
- Profile and account settings

### 9.2 Learning screen

Students should see the syllabus in its intended order:

- Modules
- Class sessions
- Scheduled dates
- Upcoming, completed, and released statuses
- Locked or unlocked resources
- Notes, documents, links, and videos
- Personal completion status

The interface may show locked future classes, but it must not expose their protected resources.

### 9.3 Progress tracking

The first version should track:

- Resource opened
- Resource marked as completed
- Video started
- Last video position
- Video completion percentage
- Class, module, and course completion percentage

Video progress should be saved periodically so students can resume playback.

## 10. Public website

Recommended public pages:

- Home
- About the institution
- Courses and programs
- Faculty or trainers
- Trading education approach
- Upcoming batches
- Testimonials
- Frequently asked questions
- Contact and enquiry
- Privacy policy and terms
- Student login

Website editors should be able to maintain:

- Homepage banners and sections
- Institution details
- Course descriptions
- Faculty profiles
- Upcoming-batch information
- Testimonials
- FAQs
- Contact details
- Announcements

The enquiry form should capture prospective-student leads and notify the appropriate administrator.

## 11. Notifications

Recommended notification events:

- Student account created
- Student enrolled in a batch
- Upcoming class reminder
- Class rescheduled or cancelled
- New materials released
- New recording released
- Enrolment suspended or nearing expiry
- Institution or batch announcement

The MVP should include in-app and email notifications. SMS or WhatsApp integration can be introduced later.

## 12. Reporting

Initial reports should include:

- Students by batch
- Active, pending, suspended, and completed enrolments
- Batch capacity and completion
- Planned versus conducted classes
- Materials awaiting approval or release
- Material-access activity
- Video-viewing progress
- Students who have not logged in recently
- Module and course completion
- Website enquiries

Reports should support filters and CSV/Excel export.

## 13. Proposed data model

The principal records are:

- `users`
- `roles`
- `permissions`
- `role_permissions`
- `user_roles`
- `student_profiles`
- `instructor_profiles`
- `courses`
- `batches`
- `enrolments`
- `syllabus_templates`
- `syllabus_modules`
- `batch_syllabuses`
- `batch_modules`
- `class_sessions`
- `materials`
- `video_assets`
- `student_material_progress`
- `student_video_progress`
- `announcements`
- `notifications`
- `website_pages`
- `website_enquiries`
- `audit_logs`
- `system_settings`

Exact tables may be consolidated during technical design, but materials should remain associated with individual class sessions.

## 14. Security and operational requirements

- Secure authentication and password-reset flows
- Server-side role and permission enforcement
- Login throttling and session security
- Optional two-factor authentication for administrators
- Protected files and video delivery
- Enrolment verification on every protected-content request
- File type, size, and malware validation for uploads
- Audit history for important administrative actions
- Database and file backups
- Defined retention and recovery procedures
- Privacy consent and account-deactivation processes
- Responsive interfaces for mobile, tablet, and desktop
- Basic accessibility compliance
- Logging and monitoring of application errors

## 15. Non-functional expectations

- Pages should load quickly on normal mobile connections.
- The platform must prevent students from seeing another student's data.
- Content-release times must use a defined institution timezone.
- All important dates should be stored consistently and displayed in the user's expected timezone.
- Common backend operations should provide search, filters, sorting, and pagination.
- The interface should clearly distinguish draft, locked, released, suspended, and completed states.

## 16. MVP scope

The first production release should include:

- Authentication and password reset
- Role and permission management
- Staff and student management
- Course and batch management
- Student registration and batch enrolment
- Syllabus templates and batch syllabuses
- Module and class scheduling
- Material and recorded-video management
- Locked content with manual post-class release
- Student dashboard and learning screen
- Basic progress tracking
- Announcements and notifications
- Public institution website
- Basic website content management
- Reports, exports, and audit logs

## 17. Features recommended for later phases

- Online fee payment and invoices
- Public self-registration and automatic enrolment
- Attendance management
- Assignments, submissions, and instructor grading
- Quizzes and assessments
- Downloadable certificates
- Live-class provider integration
- WhatsApp and SMS notifications
- Discussion forums and student questions
- Native mobile applications
- Advanced learning analytics
- Referral or affiliate management
- Customer relationship management integration

## 18. Delivery phases

### Phase 1 — Discovery and design

- Confirm business rules and terminology
- Finalize the MVP boundary
- Define roles and permission matrix
- Produce user journeys and wireframes
- Finalize database and application architecture
- Decide video storage and delivery method

### Phase 2 — System foundation

- Project setup and environments
- Authentication
- User, role, and permission management
- Application settings
- Audit logging foundation

### Phase 3 — Academic administration

- Student profiles
- Courses and batches
- Student registration and enrolment
- Syllabus templates
- Batch syllabuses and modules
- Class scheduling

### Phase 4 — Content and release workflow

- File and video management
- Resource approval states
- Class completion
- Manual and scheduled material release
- Locked-content authorization
- Release notifications

### Phase 5 — Student portal

- Student dashboard
- Syllabus and class views
- Protected resource access
- Video playback and resume position
- Progress calculation
- Announcements and profile management

### Phase 6 — Public website

- Institution and course pages
- Faculty and testimonials
- Upcoming batches
- Contact and enquiry forms
- Website content-management screens
- Student-login entry point

### Phase 7 — Quality assurance and launch

- Functional and permission testing
- Content-security testing
- Responsive and browser testing
- Performance checks
- Backup and recovery verification
- Initial data import
- Staff training
- Production deployment and launch monitoring

## 19. MVP acceptance criteria

The MVP is ready when all of the following are true:

1. Administrators can create staff and students and assign appropriate roles.
2. Staff can create a course and a batch with a class schedule.
3. A registered student can be enrolled in a batch.
4. Staff can create modules and class sessions from a syllabus.
5. Staff can upload multiple materials and a recording against a class.
6. An enrolled student cannot access those resources before release.
7. An authorized staff member can complete the class and release its resources.
8. Only actively enrolled students can access released resources.
9. Student material and video progress is stored and displayed correctly.
10. Administrative release actions appear in the audit log.
11. Public visitors can view institution and course information and submit enquiries.
12. The application works on current mobile and desktop browsers.

## 20. Recommended implementation approach

As the project is located in a MAMP workspace, Laravel and MySQL are a natural backend choice. Two practical interface approaches are:

- **Laravel with Blade and Livewire:** Faster development and simpler deployment for a unified application.
- **Laravel API with Vue or React:** More separation and flexibility, with additional implementation complexity.

For a focused first version, Laravel with Blade/Livewire is recommended unless a separate mobile application or public API is already a firm requirement.

## 21. Decisions required before development

The following items should be confirmed during discovery:

- Final course, batch, and class terminology
- Exact staff roles and approval authority
- Whether students register themselves or are created only by staff
- Whether payment status controls enrolment access
- Whether class completion and material release require different people
- Manual, scheduled, or delayed release requirements
- Video provider and expected storage volume
- Whether students may download videos or documents
- Required notification channels
- Progress-completion calculation rules
- Attendance, assignments, quizzes, and certificates required for the MVP
- Branding, language, and public website content
- Hosting, backup, and expected student volume

## 22. Immediate next steps

1. Review and approve this scope.
2. Complete the decisions listed above.
3. Prepare the permission matrix and detailed user journeys.
4. Create low-fidelity wireframes for the administration and student portals.
5. Finalize the database schema and technical architecture.
6. Divide the MVP into development milestones and estimates.
