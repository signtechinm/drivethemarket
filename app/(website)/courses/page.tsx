import type { Metadata } from "next";
import { ArrowRight, BookOpenCheck } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDatabase } from "@/lib/db/client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Courses",
  description:
    "Explore structured Drive the Market trading education programs and their learning plans.",
};

export default async function PublicCoursesPage() {
  const courses = await getDatabase().course.findMany({
    where: { active: true },
    include: {
      syllabuses: {
        where: { publishedAt: { not: null } },
        include: {
          modules: { include: { _count: { select: { classes: true } } } },
        },
        orderBy: { version: "desc" },
        take: 1,
      },
    },
    orderBy: { title: "asc" },
  });
  return (
    <main>
      <section className="bg-[image:var(--gradient-silver)]">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
          <Badge variant="soft">Courses and programs</Badge>
          <h1 className="mt-6 max-w-4xl text-5xl font-bold tracking-tight text-olive-950">
            Build market understanding in a clear learning sequence.
          </h1>
          <p className="text-muted-foreground mt-5 max-w-2xl text-lg leading-8">
            Live teaching is supported by ordered modules, reviewed resources,
            protected recordings, and measurable post-class progress.
          </p>
        </div>
      </section>
      <section className="mx-auto grid max-w-7xl gap-5 px-5 py-16 sm:px-8 md:grid-cols-2">
        {courses.map((course) => {
          const syllabus = course.syllabuses[0];
          const classCount =
            syllabus?.modules.reduce(
              (sum, module) => sum + module._count.classes,
              0,
            ) ?? 0;
          return (
            <Card className="border-t-4 border-t-olive-600" key={course.id}>
              <CardHeader>
                <BookOpenCheck className="text-primary size-7" />
                <CardTitle className="text-2xl text-olive-950">
                  {course.title}
                </CardTitle>
                <Badge variant="neutral">{course.code}</Badge>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-7">
                  {course.description}
                </p>
                <div className="bg-silver-50 mt-5 grid grid-cols-2 rounded-xl p-4 text-center text-sm">
                  <span>
                    <strong className="block text-xl text-olive-950">
                      {syllabus?.modules.length ?? 0}
                    </strong>
                    Modules
                  </span>
                  <span>
                    <strong className="block text-xl text-olive-950">
                      {classCount}
                    </strong>
                    Classes
                  </span>
                </div>
                <Link
                  className={`${buttonVariants()} mt-5`}
                  href={`/contact?course=${course.id}`}
                >
                  Enquire now <ArrowRight className="size-4" />
                </Link>
              </CardContent>
            </Card>
          );
        })}
        {!courses.length ? (
          <p className="text-muted-foreground">
            Course information is being prepared.
          </p>
        ) : null}
      </section>
    </main>
  );
}
