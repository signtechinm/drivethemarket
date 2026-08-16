import "server-only";

import { notFound } from "next/navigation";

import { requireActiveUser } from "@/lib/auth/session";
import { getDatabase } from "@/lib/db/client";

export async function requireStudentProfile() {
  const { user: activeUser, session } = await requireActiveUser("/portal");
  const profile = await getDatabase().studentProfile.findUnique({
    where: { userId: activeUser.id },
    include: { user: true },
  });
  if (!profile) notFound();
  return { user: profile.user, session, profile };
}

export async function requireOwnedEnrolment(enrolmentId: string) {
  const { user, session, profile } = await requireStudentProfile();
  const enrolment = await getDatabase().enrolment.findFirst({
    where: { id: enrolmentId, studentId: profile.id },
  });
  if (!enrolment) notFound();
  return { user, session, profile, enrolment };
}
