import "server-only";

import { canAccessReleasedMaterial } from "@/lib/materials/release-policy";
import { getDatabase } from "@/lib/db/client";

export async function authorizeStudentMaterial(
  userId: string,
  materialId: string,
) {
  const database = getDatabase();
  const material = await database.material.findUnique({
    where: { id: materialId },
    include: {
      classSession: { include: { module: true } },
      videoAsset: true,
    },
  });
  if (!material) return null;
  const enrolment = await database.enrolment.findFirst({
    where: {
      student: { userId },
      batchId: material.classSession.module.batchId,
    },
  });
  if (
    !enrolment ||
    !canAccessReleasedMaterial({
      classStatus: material.classSession.status,
      materialStatus: material.status,
      enrolment,
    })
  )
    return null;
  return { material, enrolment };
}
