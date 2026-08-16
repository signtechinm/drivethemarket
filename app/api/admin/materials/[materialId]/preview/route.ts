import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth/options";
import { permissions } from "@/lib/auth/constants";
import { getDatabase } from "@/lib/db/client";
import { readPrivateMaterial } from "@/lib/storage/private-storage";

interface PreviewRouteProps {
  params: Promise<{ materialId: string }>;
}

export async function GET(_request: Request, { params }: PreviewRouteProps) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });
  const database = getDatabase();
  const user = await database.user.findUnique({
    where: { id: session.user.id },
    include: {
      roles: {
        include: {
          role: {
            include: {
              permissions: { include: { permission: true } },
            },
          },
        },
      },
    },
  });
  const previewPermissions = new Set([
    permissions.materialsManage,
    permissions.materialsApprove,
    permissions.materialsRelease,
  ]);
  const allowed =
    user?.status === "ACTIVE" &&
    user.roles.some(
      ({ role }) =>
        role.key === "super-admin" ||
        role.permissions.some(({ permission }) =>
          previewPermissions.has(permission.key as never),
        ),
    );
  if (!allowed) return new Response("Forbidden", { status: 403 });
  const { materialId } = await params;
  const material = await database.material.findUnique({
    where: { id: materialId },
  });
  if (!material) return new Response("Not found", { status: 404 });
  if (material.externalUrl) return Response.redirect(material.externalUrl, 307);
  if (!material.storageKey)
    return new Response("File unavailable", { status: 404 });
  const stored = await readPrivateMaterial(material.storageKey).catch(
    () => null,
  );
  if (!stored) return new Response("File unavailable", { status: 404 });
  return new Response(stored.data, {
    headers: {
      "Cache-Control": "private, no-store",
      "Content-Type": material.mimeType ?? "application/octet-stream",
      "Content-Disposition": `inline; filename*=UTF-8''${encodeURIComponent(material.title)}`,
    },
  });
}
