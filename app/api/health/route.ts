import { NextResponse } from "next/server";

import { getDatabase } from "@/lib/db/client";
import { getServerEnvironment } from "@/lib/env/server";
import { captureError } from "@/lib/monitoring/capture-error";

export const dynamic = "force-dynamic";

export async function GET() {
  const checkedAt = new Date().toISOString();

  try {
    const environment = getServerEnvironment();
    await getDatabase().$queryRaw`SELECT 1`;

    return NextResponse.json({
      status: "ok",
      service: "trade-tuter-web",
      environment: environment.NODE_ENV,
      database: "reachable",
      checkedAt,
    });
  } catch (error) {
    captureError(error, { operation: "health-check" });
    return NextResponse.json(
      {
        status: "unavailable",
        service: "trade-tuter-web",
        database: "unavailable",
        checkedAt,
      },
      { status: 503 },
    );
  }
}
