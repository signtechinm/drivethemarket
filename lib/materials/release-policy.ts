import type { EnrolmentAccessInput } from "@/lib/students/access-policy";
import { hasActiveEnrolmentAccess } from "@/lib/students/access-policy";

export interface ReleasableMaterial {
  status: string;
  type: string;
  playbackReady?: boolean;
}

export function canReleaseMaterial(
  classStatus: string,
  material: ReleasableMaterial,
) {
  return (
    ["COMPLETED", "RELEASED"].includes(classStatus) &&
    material.status === "APPROVED" &&
    (material.type !== "VIDEO" || material.playbackReady === true)
  );
}

export function canAccessReleasedMaterial({
  classStatus,
  materialStatus,
  enrolment,
  now = new Date(),
}: {
  classStatus: string;
  materialStatus: string;
  enrolment: EnrolmentAccessInput | null;
  now?: Date;
}) {
  return (
    classStatus === "RELEASED" &&
    materialStatus === "RELEASED" &&
    enrolment !== null &&
    hasActiveEnrolmentAccess(enrolment, now)
  );
}
