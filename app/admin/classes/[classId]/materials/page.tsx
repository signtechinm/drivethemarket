import { ArrowLeft, CheckCircle2, Eye, LockKeyhole, Video } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  approveMaterialAction,
  completeClassAction,
  markClassConductedAction,
  submitMaterialForReviewAction,
} from "@/app/actions/material-management";
import { CreateMaterialForm } from "@/components/materials/create-material-form";
import {
  ReleaseMaterialControl,
  RelockMaterialControl,
} from "@/components/materials/release-controls";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { permissions } from "@/lib/auth/constants";
import { hasPermission } from "@/lib/auth/policy";
import { requireAnyPermission } from "@/lib/auth/session";
import { getDatabase } from "@/lib/db/client";

interface ClassMaterialsPageProps {
  params: Promise<{ classId: string }>;
}

export default async function ClassMaterialsPage({
  params,
}: ClassMaterialsPageProps) {
  const { session } = await requireAnyPermission([
    permissions.materialsManage,
    permissions.materialsApprove,
    permissions.materialsRelease,
    permissions.classesConduct,
    permissions.classesComplete,
  ]);
  const { classId } = await params;
  const classSession = await getDatabase().classSession.findUnique({
    where: { id: classId },
    include: {
      module: { include: { batch: { include: { course: true } } } },
      instructor: true,
      materials: {
        include: {
          uploadedBy: true,
          videoAsset: true,
          releases: { orderBy: { releasedAt: "desc" }, take: 1 },
        },
        orderBy: { position: "asc" },
      },
    },
  });
  if (!classSession) notFound();
  const allowed = (
    permission: (typeof permissions)[keyof typeof permissions],
  ) => hasPermission(session.user.permissionKeys, permission);
  return (
    <main className="mx-auto max-w-7xl p-5 sm:p-8">
      <Link
        className={buttonVariants({ variant: "ghost", size: "sm" })}
        href={`/admin/batches/${classSession.module.batchId}`}
      >
        <ArrowLeft className="size-4" /> Batch planner
      </Link>
      <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <Badge variant="soft">{classSession.module.batch.code}</Badge>
          <h1 className="mt-3 text-3xl font-bold text-olive-950">
            {classSession.title}
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            {classSession.module.title} ·{" "}
            {classSession.module.batch.course.title}
          </p>
        </div>
        <Badge
          variant={classSession.status === "RELEASED" ? "soft" : "neutral"}
        >
          {classSession.status}
        </Badge>
      </div>
      <Card className="mt-7">
        <CardContent className="flex flex-wrap items-center gap-3 p-5">
          <LockKeyhole className="text-primary size-5" />
          <p className="min-w-64 flex-1 text-sm">
            Uploading never publishes content. Conduct, complete, approve, and
            release are separate audited steps.
          </p>
          {allowed(permissions.classesConduct) &&
          ["SCHEDULED", "RESCHEDULED"].includes(classSession.status) ? (
            <form action={markClassConductedAction}>
              <input name="classId" type="hidden" value={classSession.id} />
              <Button size="sm" type="submit" variant="outline">
                Mark conducted
              </Button>
            </form>
          ) : null}
          {allowed(permissions.classesComplete) &&
          classSession.status === "CONDUCTED" ? (
            <form action={completeClassAction}>
              <input name="classId" type="hidden" value={classSession.id} />
              <Button size="sm" type="submit">
                Confirm class complete
              </Button>
            </form>
          ) : null}
        </CardContent>
      </Card>
      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_370px]">
        <section className="space-y-4">
          {classSession.materials.map((material) => (
            <Card key={material.id}>
              <CardContent className="p-5">
                <div className="flex flex-wrap items-start gap-4">
                  <span className="text-primary grid size-11 place-items-center rounded-xl bg-olive-100">
                    {material.type === "VIDEO" ? (
                      <Video className="size-5" />
                    ) : (
                      <CheckCircle2 className="size-5" />
                    )}
                  </span>
                  <div className="min-w-52 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-bold text-olive-950">
                        {material.title}
                      </p>
                      <Badge
                        variant={
                          material.status === "RELEASED" ? "soft" : "neutral"
                        }
                      >
                        {material.status}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground mt-1 text-xs">
                      {material.type} · Uploaded by {material.uploadedBy.name} ·
                      {material.sizeBytes
                        ? ` ${Math.ceil(Number(material.sizeBytes) / 1024)} KB`
                        : " protected link"}
                    </p>
                    {material.type === "VIDEO" ? (
                      <p className="mt-2 text-xs">
                        Playback:{" "}
                        {material.videoAsset?.playbackReady
                          ? "Ready"
                          : "Processing"}
                      </p>
                    ) : null}
                  </div>
                  <a
                    className={buttonVariants({
                      variant: "outline",
                      size: "sm",
                    })}
                    href={`/api/admin/materials/${material.id}/preview`}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <Eye className="size-4" /> Staff preview
                  </a>
                </div>
                <div className="border-border mt-4 flex flex-wrap items-start gap-2 border-t pt-4">
                  {allowed(permissions.materialsManage) &&
                  ["DRAFT", "CHANGES_REQUESTED"].includes(material.status) ? (
                    <form action={submitMaterialForReviewAction}>
                      <input
                        name="materialId"
                        type="hidden"
                        value={material.id}
                      />
                      <input
                        name="classId"
                        type="hidden"
                        value={classSession.id}
                      />
                      <Button size="sm" type="submit" variant="outline">
                        Submit for review
                      </Button>
                    </form>
                  ) : null}
                  {allowed(permissions.materialsApprove) &&
                  material.status === "IN_REVIEW" ? (
                    <form action={approveMaterialAction}>
                      <input
                        name="materialId"
                        type="hidden"
                        value={material.id}
                      />
                      <input
                        name="classId"
                        type="hidden"
                        value={classSession.id}
                      />
                      <Button size="sm" type="submit" variant="outline">
                        Approve
                      </Button>
                    </form>
                  ) : null}
                  {allowed(permissions.materialsRelease) &&
                  material.status === "APPROVED" ? (
                    <ReleaseMaterialControl
                      classId={classSession.id}
                      materialId={material.id}
                    />
                  ) : null}
                  {allowed(permissions.materialsRelease) &&
                  material.status === "RELEASED" ? (
                    <RelockMaterialControl
                      classId={classSession.id}
                      materialId={material.id}
                    />
                  ) : null}
                  {material.releases[0]?.revokedAt ? (
                    <p className="w-full text-xs text-red-700">
                      Re-locked: {material.releases[0].revokeReason}
                    </p>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          ))}
          {!classSession.materials.length ? (
            <Card>
              <CardContent className="p-12 text-center">
                <LockKeyhole className="text-primary mx-auto size-9" />
                <p className="text-muted-foreground mt-3 text-sm">
                  No materials have been prepared for this class.
                </p>
              </CardContent>
            </Card>
          ) : null}
        </section>
        {allowed(permissions.materialsManage) ? (
          <aside>
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Add material</CardTitle>
                <CardDescription>
                  Files remain in private storage until every release gate
                  passes.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CreateMaterialForm classId={classSession.id} />
              </CardContent>
            </Card>
          </aside>
        ) : null}
      </div>
    </main>
  );
}
