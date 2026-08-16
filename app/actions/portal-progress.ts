"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { authorizeStudentMaterial } from "@/lib/materials/authorization";
import { requireStudentProfile } from "@/lib/portal/student-scope";
import { getDatabase } from "@/lib/db/client";

export async function markMaterialCompletedAction(formData: FormData) {
  const { user } = await requireStudentProfile();
  const input = z
    .object({ materialId: z.string().min(1), enrolmentId: z.string().min(1) })
    .safeParse(Object.fromEntries(formData));
  if (!input.success) return;
  const authorized = await authorizeStudentMaterial(
    user.id,
    input.data.materialId,
  );
  if (!authorized || authorized.enrolment.id !== input.data.enrolmentId) return;
  await getDatabase().materialProgress.upsert({
    where: {
      enrolmentId_materialId: {
        enrolmentId: authorized.enrolment.id,
        materialId: input.data.materialId,
      },
    },
    update: { openedAt: new Date(), completedAt: new Date() },
    create: {
      enrolmentId: authorized.enrolment.id,
      materialId: input.data.materialId,
      openedAt: new Date(),
      completedAt: new Date(),
    },
  });
  revalidatePath(`/portal/courses/${authorized.enrolment.id}`);
  revalidatePath("/portal");
}

export async function updateStudentAccountAction(formData: FormData) {
  const { user, profile } = await requireStudentProfile();
  const parsed = z
    .object({
      name: z.string().trim().min(2).max(100),
      phone: z.string().trim().max(30).optional(),
      address: z.string().trim().max(500).optional(),
    })
    .safeParse({
      name: formData.get("name"),
      phone: formData.get("phone") || undefined,
      address: formData.get("address") || undefined,
    });
  if (!parsed.success) return;
  const database = getDatabase();
  await database.$transaction([
    database.user.update({
      where: { id: user.id },
      data: { name: parsed.data.name, phone: parsed.data.phone ?? null },
    }),
    database.studentProfile.update({
      where: { id: profile.id },
      data: { address: parsed.data.address ?? null },
    }),
  ]);
  revalidatePath("/portal/profile");
}

export async function markNotificationReadAction(formData: FormData) {
  const { user } = await requireStudentProfile();
  const notificationId = z
    .string()
    .min(1)
    .safeParse(formData.get("notificationId"));
  if (!notificationId.success) return;
  await getDatabase().notification.updateMany({
    where: { id: notificationId.data, userId: user.id },
    data: { status: "READ", readAt: new Date() },
  });
  revalidatePath("/portal");
}
