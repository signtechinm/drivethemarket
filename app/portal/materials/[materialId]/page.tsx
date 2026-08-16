import { ArrowLeft, CheckCircle2, ExternalLink, FileText } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { markMaterialCompletedAction } from "@/app/actions/portal-progress";
import { VideoPlayer } from "@/components/portal/video-player";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { authorizeStudentMaterial } from "@/lib/materials/authorization";
import { requireStudentProfile } from "@/lib/portal/student-scope";
import { getDatabase } from "@/lib/db/client";

interface MaterialViewerProps {
  params: Promise<{ materialId: string }>;
}

export default async function MaterialViewerPage({
  params,
}: MaterialViewerProps) {
  const { user } = await requireStudentProfile();
  const { materialId } = await params;
  const authorized = await authorizeStudentMaterial(user.id, materialId);
  if (!authorized) notFound();
  const database = getDatabase();
  const progress = await database.materialProgress.upsert({
    where: {
      enrolmentId_materialId: {
        enrolmentId: authorized.enrolment.id,
        materialId,
      },
    },
    update: { openedAt: new Date() },
    create: {
      enrolmentId: authorized.enrolment.id,
      materialId,
      openedAt: new Date(),
    },
  });
  const videoProgress = authorized.material.videoAsset
    ? await database.videoProgress.findUnique({
        where: {
          enrolmentId_videoAssetId: {
            enrolmentId: authorized.enrolment.id,
            videoAssetId: authorized.material.videoAsset.id,
          },
        },
      })
    : null;
  return (
    <main className="mx-auto max-w-5xl px-5 py-8 sm:px-8">
      <Link
        className={buttonVariants({ variant: "ghost", size: "sm" })}
        href={`/portal/courses/${authorized.enrolment.id}`}
      >
        <ArrowLeft className="size-4" /> Back to course
      </Link>
      <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <Badge variant="soft">{authorized.material.type}</Badge>
          <h1 className="mt-3 text-3xl font-bold text-olive-950">
            {authorized.material.title}
          </h1>
          <p className="text-muted-foreground mt-2">
            {authorized.material.description}
          </p>
        </div>
        {progress.completedAt ? (
          <Badge variant="soft">
            <CheckCircle2 className="size-3" /> Completed
          </Badge>
        ) : (
          <Badge variant="neutral">In progress</Badge>
        )}
      </div>
      <Card className="mt-7">
        <CardContent className="p-4 sm:p-6">
          {authorized.material.type === "VIDEO" ? (
            <VideoPlayer
              initialPosition={videoProgress?.positionSeconds ?? 0}
              materialId={materialId}
            />
          ) : authorized.material.type === "EXTERNAL_LINK" ? (
            <div className="py-16 text-center">
              <ExternalLink className="text-primary mx-auto size-10" />
              <p className="text-muted-foreground mt-4 text-sm">
                This protected resource opens in a new tab.
              </p>
              <a
                className={`${buttonVariants()} mt-5`}
                href={`/api/materials/${materialId}/access`}
                rel="noopener noreferrer"
                target="_blank"
              >
                Open resource
              </a>
            </div>
          ) : (
            <div>
              <iframe
                className="h-[65vh] w-full rounded-xl border"
                src={`/api/materials/${materialId}/access`}
                title={authorized.material.title}
              />
              <a
                className={`${buttonVariants({ variant: "outline", size: "sm" })} mt-4`}
                href={`/api/materials/${materialId}/access`}
                rel="noopener noreferrer"
                target="_blank"
              >
                <FileText className="size-4" /> Open separately
              </a>
            </div>
          )}
        </CardContent>
      </Card>
      {authorized.material.type !== "VIDEO" && !progress.completedAt ? (
        <form
          action={markMaterialCompletedAction}
          className="mt-5 flex justify-end"
        >
          <input name="materialId" type="hidden" value={materialId} />
          <input
            name="enrolmentId"
            type="hidden"
            value={authorized.enrolment.id}
          />
          <Button type="submit">
            <CheckCircle2 className="size-4" /> Mark completed
          </Button>
        </form>
      ) : null}
    </main>
  );
}
