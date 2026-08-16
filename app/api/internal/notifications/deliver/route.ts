import { deliverPendingEmails } from "@/lib/communications/notification-service";
import { getServerEnvironment } from "@/lib/env/server";
import { captureError } from "@/lib/monitoring/capture-error";
import { secretsMatch } from "@/lib/security/secret";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const expected = getServerEnvironment().CRON_SECRET;
  const authorization = request.headers.get("authorization") ?? "";
  const supplied = authorization.startsWith("Bearer ")
    ? authorization.slice(7)
    : "";
  if (!expected || !secretsMatch(supplied, expected))
    return new Response("Unauthorized", { status: 401 });
  try {
    return Response.json(await deliverPendingEmails(100));
  } catch (error) {
    captureError(error, { operation: "scheduled-email-delivery" });
    return new Response("Delivery job failed", { status: 500 });
  }
}
