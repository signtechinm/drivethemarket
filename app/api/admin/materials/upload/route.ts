import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth/options";
import { permissions } from "@/lib/auth/constants";
import { getDatabase } from "@/lib/db/client";
import { allowedMaterialMimeTypes } from "@/lib/storage/private-storage";

const materialTypes = [
  "DOCUMENT",
  "PRESENTATION",
  "IMAGE",
  "WORKSHEET",
  "ASSIGNMENT",
  "VIDEO",
  "DOWNLOAD",
] as const;

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (!session.user.permissionKeys.includes(permissions.materialsManage))
    return Response.json({ error: "Forbidden" }, { status: 403 });

  const user = await getDatabase().user.findUnique({
    where: { id: session.user.id },
    select: { status: true },
  });
  if (user?.status !== "ACTIVE")
    return Response.json({ error: "Account inactive" }, { status: 403 });

  const body = (await request.json()) as HandleUploadBody;
  try {
    const result = await handleUpload({
      request,
      body,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        if (!/^learning\/[a-f0-9-]+(?:\.[a-z0-9]+)?$/i.test(pathname))
          throw new Error("Invalid material pathname.");
        const payload = JSON.parse(clientPayload ?? "{}") as {
          classId?: string;
          type?: string;
        };
        if (!payload.classId || !materialTypes.includes(payload.type as never))
          throw new Error("Invalid material upload request.");
        const classSession = await getDatabase().classSession.findUnique({
          where: { id: payload.classId },
          select: {
            instructorId: true,
            module: {
              select: {
                batch: {
                  select: {
                    instructors: {
                      where: { userId: session.user.id },
                      select: { userId: true },
                    },
                  },
                },
              },
            },
          },
        });
        if (!classSession) throw new Error("Class not found.");
        if (
          session.user.roleKeys.includes("instructor") &&
          classSession.instructorId !== session.user.id &&
          classSession.module.batch.instructors.length === 0
        )
          throw new Error("You are not assigned to this class.");
        return {
          allowedContentTypes: [...allowedMaterialMimeTypes],
          maximumSizeInBytes:
            payload.type === "VIDEO" ? 250_000_000 : 20_000_000,
          addRandomSuffix: false,
          cacheControlMaxAge: 60,
        };
      },
    });
    return Response.json(result);
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 400 },
    );
  }
}
