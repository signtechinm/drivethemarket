import type { Metadata } from "next";
import { CalendarDays, Users } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDatabase } from "@/lib/db/client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Upcoming Batches",
  description: "View upcoming and enrolling Drive the Market course batches.",
};

export default async function PublicBatchesPage() {
  const batches = await getDatabase().batch.findMany({
    where: {
      status: { in: ["ENROLLING", "ACTIVE"] },
      endsAt: { gte: new Date() },
    },
    include: {
      course: true,
      _count: {
        select: {
          enrolments: { where: { status: { in: ["PENDING", "ACTIVE"] } } },
        },
      },
    },
    orderBy: { startsAt: "asc" },
  });
  return (
    <main className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
      <Badge variant="soft">Upcoming batches</Badge>
      <h1 className="mt-5 text-4xl font-bold text-olive-950 sm:text-5xl">
        Find the right starting point.
      </h1>
      <p className="text-muted-foreground mt-4 max-w-2xl text-lg">
        Ask the institution about schedules, suitability, and current seat
        availability.
      </p>
      <div className="mt-10 grid gap-5 md:grid-cols-2">
        {batches.map((batch) => {
          const remaining =
            batch.capacity === null
              ? null
              : Math.max(0, batch.capacity - batch._count.enrolments);
          return (
            <Card key={batch.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <CalendarDays className="text-primary size-7" />
                  <Badge
                    variant={batch.status === "ENROLLING" ? "soft" : "neutral"}
                  >
                    {batch.status}
                  </Badge>
                </div>
                <CardTitle>{batch.name}</CardTitle>
                <p className="text-muted-foreground text-sm">
                  {batch.course.title}
                </p>
              </CardHeader>
              <CardContent>
                <div className="bg-silver-50 flex items-center justify-between rounded-xl p-4 text-sm">
                  <span>
                    {batch.startsAt.toLocaleDateString("en-IN")} –{" "}
                    {batch.endsAt?.toLocaleDateString("en-IN") ?? "Open"}
                  </span>
                  <span className="flex items-center gap-1 font-semibold">
                    <Users className="size-4" />
                    {remaining === null ? "Contact us" : `${remaining} seats`}
                  </span>
                </div>
                <Link
                  className={`${buttonVariants()} mt-5`}
                  href={`/contact?course=${batch.courseId}`}
                >
                  Ask about this batch
                </Link>
              </CardContent>
            </Card>
          );
        })}
        {!batches.length ? (
          <Card>
            <CardContent className="text-muted-foreground p-10 text-center">
              New batch dates will be published soon.
            </CardContent>
          </Card>
        ) : null}
      </div>
    </main>
  );
}
