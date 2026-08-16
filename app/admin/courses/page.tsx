import { BookOpenCheck, Layers3 } from "lucide-react";
import Link from "next/link";

import { toggleCourseAction } from "@/app/actions/course-management";
import { CreateCourseForm } from "@/components/academics/create-course-form";
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
import { requirePermission } from "@/lib/auth/session";
import { getDatabase } from "@/lib/db/client";

export default async function CoursesPage() {
  await requirePermission(permissions.coursesManage);
  const courses = await getDatabase().course.findMany({
    include: { _count: { select: { batches: true, syllabuses: true } } },
    orderBy: { createdAt: "desc" },
  });
  return (
    <main className="mx-auto max-w-7xl p-5 sm:p-8">
      <Badge variant="soft">Academic structure</Badge>
      <h1 className="mt-4 text-3xl font-bold tracking-tight text-olive-950">
        Courses and syllabus templates
      </h1>
      <p className="text-muted-foreground mt-2">
        Create reusable programs before delivering them through independent
        batches.
      </p>
      <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_340px]">
        <div className="grid gap-4 md:grid-cols-2">
          {courses.map((course) => (
            <Card className="border-t-4 border-t-olive-600" key={course.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <span className="text-primary grid size-10 place-items-center rounded-xl bg-olive-100">
                    <BookOpenCheck className="size-5" />
                  </span>
                  <Badge variant={course.active ? "soft" : "neutral"}>
                    {course.active ? "Active" : "Archived"}
                  </Badge>
                </div>
                <CardTitle>{course.title}</CardTitle>
                <CardDescription>
                  {course.code} · /{course.slug}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground min-h-12 text-sm">
                  {course.description || "No description supplied."}
                </p>
                <div className="text-muted-foreground mt-4 flex gap-4 text-xs">
                  <span>
                    <strong className="text-foreground">
                      {course._count.syllabuses}
                    </strong>{" "}
                    syllabuses
                  </span>
                  <span>
                    <strong className="text-foreground">
                      {course._count.batches}
                    </strong>{" "}
                    batches
                  </span>
                </div>
                <div className="mt-5 flex gap-2">
                  <Link
                    className={buttonVariants({ size: "sm" })}
                    href={`/admin/courses/${course.id}`}
                  >
                    Open syllabus
                  </Link>
                  <form action={toggleCourseAction}>
                    <input name="courseId" type="hidden" value={course.id} />
                    <input
                      name="active"
                      type="hidden"
                      value={String(!course.active)}
                    />
                    <Button size="sm" type="submit" variant="outline">
                      {course.active ? "Archive" : "Activate"}
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          ))}
          {!courses.length ? (
            <Card>
              <CardContent className="text-muted-foreground p-10 text-center text-sm">
                <Layers3 className="mx-auto mb-3 size-8" />
                Create the first Drive the Market course.
              </CardContent>
            </Card>
          ) : null}
        </div>
        <aside>
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Create course</CardTitle>
              <CardDescription>
                A syllabus template is added after the course is created.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CreateCourseForm />
            </CardContent>
          </Card>
        </aside>
      </div>
    </main>
  );
}
