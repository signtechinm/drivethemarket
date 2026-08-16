import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth/options";
import { createMaterialAccessToken } from "@/lib/materials/access-token";
import { authorizeStudentMaterial } from "@/lib/materials/authorization";
import { getServerEnvironment } from "@/lib/env/server";

interface AccessRouteProps {
  params: Promise<{ materialId: string }>;
}

export async function GET(request: Request, { params }: AccessRouteProps) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });
  const { materialId } = await params;
  if (!(await authorizeStudentMaterial(session.user.id, materialId)))
    return new Response("Material is not available.", { status: 403 });
  const token = createMaterialAccessToken(
    { materialId, userId: session.user.id },
    getServerEnvironment().AUTH_SECRET,
  );
  return Response.redirect(
    new URL(
      `/api/materials/${materialId}/content?token=${encodeURIComponent(token)}`,
      request.url,
    ),
    307,
  );
}
