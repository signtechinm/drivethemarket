export const SESSION_MAX_AGE_SECONDS = 15 * 60;

export const permissions = {
  usersManage: "users.manage",
  rolesManage: "roles.manage",
  studentsManage: "students.manage",
  enrolmentsManage: "enrolments.manage",
  coursesManage: "courses.manage",
  batchesManage: "batches.manage",
  classesConduct: "classes.conduct",
  classesComplete: "classes.complete",
  materialsManage: "materials.manage",
  materialsApprove: "materials.approve",
  materialsRelease: "materials.release",
  reportsView: "reports.view",
  websiteManage: "website.manage",
  auditView: "audit.view",
  communicationsManage: "communications.manage",
} as const;

export type PermissionKey = (typeof permissions)[keyof typeof permissions];
