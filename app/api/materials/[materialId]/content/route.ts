import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth/options";
import { verifyMaterialAccessToken } from "@/lib/materials/access-token";
import { authorizeStudentMaterial } from "@/lib/materials/authorization";
import { getServerEnvironment } from "@/lib/env/server";
import { readPrivateMaterial } from "@/lib/storage/private-storage";

interface ContentRouteProps {
  params: Promise<{ materialId: string }>;
}

export async function GET(request: Request, { params }: ContentRouteProps) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });
  const { materialId } = await params;
  const token = new URL(request.url).searchParams.get("token") ?? "";
  const claims = verifyMaterialAccessToken(
    token,
    getServerEnvironment().AUTH_SECRET,
  );
  if (
    !claims ||
    claims.materialId !== materialId ||
    claims.userId !== session.user.id
  )
    return new Response("Invalid or expired access token.", { status: 403 });
  const authorized = await authorizeStudentMaterial(
    session.user.id,
    materialId,
  );
  if (!authorized)
    return new Response("Material is no longer available.", { status: 403 });
  const { material } = authorized;
  if (material.externalUrl) return Response.redirect(material.externalUrl, 307);
  if (!material.storageKey)
    return new Response("Material file is unavailable.", { status: 404 });
  const stored = await readPrivateMaterial(material.storageKey).catch(
    () => null,
  );
  if (!stored)
    return new Response("Material file is unavailable.", { status: 404 });

  const headers = new Headers({
    "Accept-Ranges": "bytes",
    "Cache-Control": "private, no-store",
    "Content-Type": material.mimeType ?? "application/octet-stream",
    "Content-Disposition": `${material.downloadAllowed ? "attachment" : "inline"}; filename*=UTF-8''${encodeURIComponent(material.title)}`,
  });
  const range = request.headers.get("range")?.match(/bytes=(\d+)-(\d*)/);
  if (range) {
    const start = Number(range[1]);
    const end = range[2]
      ? Math.min(Number(range[2]), stored.size - 1)
      : stored.size - 1;
    if (start > end || start >= stored.size)
      return new Response(null, {
        status: 416,
        headers: { "Content-Range": `bytes */${stored.size}` },
      });
    headers.set("Content-Range", `bytes ${start}-${end}/${stored.size}`);
    headers.set("Content-Length", String(end - start + 1));
    return new Response(stored.data.subarray(start, end + 1), {
      status: 206,
      headers,
    });
  }
  headers.set("Content-Length", String(stored.size));
  return new Response(stored.data, { headers });
}
