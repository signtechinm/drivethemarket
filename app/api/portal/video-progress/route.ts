import { getServerSession } from "next-auth";
import { z } from "zod";

import { authOptions } from "@/lib/auth/options";
import { authorizeStudentMaterial } from "@/lib/materials/authorization";
import { isVideoComplete } from "@/lib/portal/progress";
import { getDatabase } from "@/lib/db/client";

const progressSchema = z.object({
  materialId: z.string().min(1),
  positionSeconds: z.number().int().min(0).max(1_000_000),
  durationSeconds: z.number().positive().max(1_000_000),
});

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });
  const parsed = progressSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success) return new Response("Invalid progress", { status: 400 });
  const authorized = await authorizeStudentMaterial(
    session.user.id,
    parsed.data.materialId,
  );
  if (!authorized?.material.videoAsset)
    return new Response("Video is unavailable", { status: 403 });
  const percent = Math.min(
    100,
    (parsed.data.positionSeconds / parsed.data.durationSeconds) * 100,
  );
  const completed = isVideoComplete(percent);
  const database = getDatabase();
  await database.$transaction([
    database.videoProgress.upsert({
      where: {
        enrolmentId_videoAssetId: {
          enrolmentId: authorized.enrolment.id,
          videoAssetId: authorized.material.videoAsset.id,
        },
      },
      update: {
        positionSeconds: parsed.data.positionSeconds,
        percentComplete: percent,
        completedAt: completed ? new Date() : null,
      },
      create: {
        enrolmentId: authorized.enrolment.id,
        videoAssetId: authorized.material.videoAsset.id,
        positionSeconds: parsed.data.positionSeconds,
        percentComplete: percent,
        completedAt: completed ? new Date() : null,
      },
    }),
    database.materialProgress.upsert({
      where: {
        enrolmentId_materialId: {
          enrolmentId: authorized.enrolment.id,
          materialId: authorized.material.id,
        },
      },
      update: {
        openedAt: new Date(),
        completedAt: completed ? new Date() : undefined,
      },
      create: {
        enrolmentId: authorized.enrolment.id,
        materialId: authorized.material.id,
        openedAt: new Date(),
        completedAt: completed ? new Date() : null,
      },
    }),
  ]);
  return Response.json({ percentComplete: Math.round(percent), completed });
}
