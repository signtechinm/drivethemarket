# Phase 0.2 — Draft Role and Permission Matrix

## Legend

- **F** — Full access
- **A** — Assigned records only
- **V** — View only
- **O** — Own data only
- **—** — No access

This is a draft. The client must approve who can complete a class and release materials.

| Capability                        | Super Admin | Administrator | Academic Manager | Instructor | Content Manager | Website Editor | Student |
| --------------------------------- | :---------: | :-----------: | :--------------: | :--------: | :-------------: | :------------: | :-----: |
| Manage system settings            |      F      |       —       |        —         |     —      |        —        |       —        |    —    |
| Manage roles and permissions      |      F      |       —       |        —         |     —      |        —        |       —        |    —    |
| Create and manage staff users     |      F      |       F       |        V         |     —      |        —        |       —        |    —    |
| View audit logs                   |      F      |       V       |        V         |     —      |        —        |       —        |    —    |
| Create and edit students          |      F      |       F       |        V         |     —      |        —        |       —        |    O    |
| Activate/suspend student accounts |      F      |       F       |        —         |     —      |        —        |       —        |    —    |
| Import students                   |      F      |       F       |        —         |     —      |        —        |       —        |    —    |
| Manage courses                    |      F      |       V       |        F         |     V      |        V        |       —        |    —    |
| Manage syllabus templates         |      F      |       —       |        F         |     A      |        V        |       —        |    —    |
| Create and edit batches           |      F      |       F       |        F         |     V      |        V        |       —        |    —    |
| Manage enrolments                 |      F      |       F       |        V         |     —      |        —        |       —        |    O    |
| View assigned batch students      |      F      |       F       |        F         |     A      |        —        |       —        |    —    |
| Create/edit class schedule        |      F      |       V       |        F         |     A      |        V        |       —        |    V    |
| Mark class conducted              |      F      |       —       |        F         |     A      |        —        |       —        |    —    |
| Mark class completed              |      F      |       —       |        F         |     —      |        —        |       —        |    —    |
| Upload and edit materials         |      F      |       —       |        F         |     A      |        F        |       —        |    —    |
| Submit materials for review       |      F      |       —       |        F         |     A      |        F        |       —        |    —    |
| Approve materials                 |      F      |       —       |        F         |     —      |        —        |       —        |    —    |
| Preview locked materials          |      F      |       —       |        F         |     A      |        F        |       —        |    —    |
| Release approved materials        |      F      |       —       |        F         |     —      |        —        |       —        |    —    |
| Re-lock released materials        |      F      |       —       |        F         |     —      |        —        |       —        |    —    |
| Access released learning content  |      F      |       —       |        F         |     A      |        F        |       —        |    O    |
| Create batch announcements        |      F      |       F       |        F         |     A      |        —        |       —        |    —    |
| Manage public website content     |      F      |       V       |        —         |     —      |        —        |       F        |    —    |
| View website enquiries            |      F      |       F       |        —         |     —      |        —        |       V        |    —    |
| Manage website enquiries          |      F      |       F       |        —         |     —      |        —        |       —        |    —    |
| View academic reports             |      F      |       F       |        F         |     A      |        —        |       —        |    O    |
| Export administrative reports     |      F      |       F       |        F         |     —      |        —        |       —        |    —    |

## Recommended separation of duties

The MVP should use the following workflow unless the client chooses otherwise:

1. Instructor or Content Manager uploads materials.
2. Academic Manager reviews and approves materials.
3. Instructor marks the external class as conducted.
4. Academic Manager verifies and marks the class completed.
5. Academic Manager releases approved materials.

Super Admin retains emergency authority, but normal operations should use the designated academic roles.

## Permission implementation rules

- Permissions are checked on the server for every action and protected read.
- Assigned access is determined through instructor-to-batch or instructor-to-class assignments.
- Student access requires both ownership and an active enrolment.
- UI visibility reflects permissions but is not treated as authorization.
- High-risk actions require confirmation and an audit record.
- Release, re-lock, suspension, and permission changes capture actor, target, time, and reason where applicable.

## Questions requiring approval

1. May an Administrator manage courses or only operational batches and enrolments?
2. May an Instructor mark a class completed, or only conducted?
3. May an Instructor release materials for an assigned class?
4. Is approval by a different person mandatory before release?
5. May students edit their phone/address, or only view them?
6. Should Website Editors see enquiry contact information?
