# Phase 1.3 — shadcn/ui Component Map

| Product pattern      | shadcn/ui foundation                     | Drive the Market adaptation                        |
| -------------------- | ---------------------------------------- | -------------------------------------------------- |
| Primary navigation   | Sidebar, Navigation Menu, Sheet          | Olive active state; mobile Sheet                   |
| Page header          | Breadcrumb, Button, Dropdown Menu        | Permission-aware actions                           |
| Dashboard metric     | Card, Badge                              | Olive icon tile, tabular figures                   |
| Search and filters   | Input, Select, Popover, Command          | URL-synchronized filters                           |
| Admin records        | Table, Checkbox, Dropdown Menu           | Responsive record cards on mobile                  |
| Edit form            | Form, Input, Select, Calendar, Textarea  | Schema validation and field errors                 |
| Batch tabs           | Tabs                                     | Sticky context header on desktop                   |
| Syllabus modules     | Accordion, Collapsible                   | Ordered class rows and status badges               |
| Class editor         | Sheet or Dialog                          | Sheet for larger forms, Dialog for focused action  |
| Upload area          | Card, Progress, Alert                    | Private-upload progress and validation             |
| Resource status      | Badge, Tooltip                           | Text plus icon; never color alone                  |
| Release confirmation | Alert Dialog, Checkbox, Alert            | Prerequisite summary and affected count            |
| Student learning     | Card, Progress, Accordion                | Large touch targets and clear locked states        |
| Notifications        | Popover, Scroll Area, Badge              | Read/unread grouping                               |
| Feedback             | Sonner, Alert, Skeleton                  | Toast for success; inline Alert for blocking issue |
| Destructive action   | Alert Dialog, Button destructive variant | Mandatory reason for re-lock/suspension            |

## Initial implementation set

Install only components needed by the first implemented workflow:

1. Button, Badge, Card, Separator
2. Input, Label, Select, Checkbox, Textarea
3. Form, Calendar, Popover, Command
4. Table, Dropdown Menu, Pagination
5. Dialog, Alert Dialog, Sheet
6. Tabs, Accordion, Progress, Skeleton
7. Sidebar, Breadcrumb, Avatar
8. Alert, Tooltip, Sonner

This avoids maintaining unused generated component code.

## Required custom compositions

- `AppShell`
- `PublicHeader`
- `AdminSidebar`
- `StudentMobileNav`
- `PageHeader`
- `MetricCard`
- `StatusBadge`
- `DataTableToolbar`
- `BatchContextHeader`
- `SyllabusModule`
- `ClassSessionRow`
- `ResourceRow`
- `ReleaseChecklist`
- `LockedResourceCard`
- `LearningProgressCard`
- `VideoLessonShell`
