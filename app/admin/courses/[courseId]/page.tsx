import { ArrowLeft, BookOpenCheck, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  addTemplateClassAction,
  addTemplateModuleAction,
  createSyllabusAction,
  publishSyllabusAction,
} from "@/app/actions/course-management";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

interface CourseDetailPageProps {
  params: Promise<{ courseId: string }>;
  searchParams: Promise<{ syllabus?: string }>;
}

export default async function CourseDetailPage({
  params,
  searchParams,
}: CourseDetailPageProps) {
  await requirePermission(permissions.coursesManage);
  const [{ courseId }, query] = await Promise.all([params, searchParams]);
  const course = await getDatabase().course.findUnique({
    where: { id: courseId },
    include: {
      syllabuses: {
        include: {
          modules: {
            include: { classes: { orderBy: { position: "asc" } } },
            orderBy: { position: "asc" },
          },
        },
        orderBy: { version: "desc" },
      },
    },
  });
  if (!course) notFound();
  const syllabus =
    course.syllabuses.find((item) => item.id === query.syllabus) ??
    course.syllabuses[0];
  const input = "h-9 rounded-lg border border-border bg-white px-3 text-sm";
  return (
    <main className="mx-auto max-w-7xl p-5 sm:p-8">
      <Link
        className="text-primary inline-flex items-center gap-2 text-sm font-semibold"
        href="/admin/courses"
      >
        <ArrowLeft className="size-4" />
        Courses
      </Link>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <Badge variant="soft">{course.code}</Badge>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-olive-950">
            {course.title}
          </h1>
          <p className="text-muted-foreground mt-2">
            Reusable syllabus versions remain independent from active batches.
          </p>
        </div>
        <form action={createSyllabusAction} className="flex gap-2">
          <input name="courseId" type="hidden" value={course.id} />
          <input
            className={input}
            name="title"
            placeholder="New syllabus title"
            required
          />
          <Button size="sm" type="submit">
            New version
          </Button>
        </form>
      </div>
      {course.syllabuses.length ? (
        <div className="mt-7 flex flex-wrap gap-2">
          {course.syllabuses.map((item) => (
            <Link
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${item.id === syllabus?.id ? "border-primary text-primary bg-olive-100" : "border-border bg-white"}`}
              href={`/admin/courses/${course.id}?syllabus=${item.id}`}
              key={item.id}
            >
              v{item.version} · {item.title}
            </Link>
          ))}
        </div>
      ) : null}
      {!syllabus ? (
        <Card className="mt-8">
          <CardContent className="p-12 text-center">
            <BookOpenCheck className="text-primary mx-auto size-10" />
            <h2 className="mt-4 font-semibold">
              Create the first syllabus version
            </h2>
            <p className="text-muted-foreground mt-2 text-sm">
              Use the form above to begin organizing modules and classes.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_300px]">
          <section className="space-y-4">
            {syllabus.modules.map((module) => (
              <Card key={module.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-primary text-xs font-bold">
                        MODULE {module.position}
                      </p>
                      <CardTitle>{module.title}</CardTitle>
                    </div>
                    <Badge variant="neutral">
                      {module.classes.length} classes
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {module.classes.map((item) => (
                    <div
                      className="border-border grid grid-cols-[34px_1fr_auto] items-center gap-3 rounded-xl border p-3"
                      key={item.id}
                    >
                      <span className="bg-silver-100 grid size-8 place-items-center rounded-lg text-xs font-bold">
                        {String(item.position).padStart(2, "0")}
                      </span>
                      <div>
                        <p className="text-sm font-semibold">{item.title}</p>
                        <p className="text-muted-foreground text-xs">
                          {item.expectedMinutes ?? 90} minutes
                        </p>
                      </div>
                      <CheckCircle2 className="text-silver-400 size-4" />
                    </div>
                  ))}
                  <form
                    action={addTemplateClassAction}
                    className="mt-3 flex flex-wrap gap-2"
                  >
                    <input name="moduleId" type="hidden" value={module.id} />
                    <input name="courseId" type="hidden" value={course.id} />
                    <input
                      className={`${input} min-w-56 flex-1`}
                      name="title"
                      placeholder="Add class title"
                      required
                    />
                    <input
                      className={`${input} w-28`}
                      defaultValue="90"
                      min="15"
                      name="expectedMinutes"
                      type="number"
                    />
                    <Button size="sm" type="submit" variant="outline">
                      Add class
                    </Button>
                  </form>
                </CardContent>
              </Card>
            ))}
          </section>
          <aside className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Template status</CardTitle>
                <CardDescription>Version {syllabus.version}</CardDescription>
              </CardHeader>
              <CardContent>
                <Badge variant={syllabus.publishedAt ? "soft" : "warning"}>
                  {syllabus.publishedAt ? "Published" : "Draft"}
                </Badge>
                <p className="text-muted-foreground mt-4 text-xs leading-5">
                  Published templates can create batches. Later edits never
                  rewrite an existing batch copy.
                </p>
                {!syllabus.publishedAt ? (
                  <form action={publishSyllabusAction} className="mt-4">
                    <input
                      name="syllabusId"
                      type="hidden"
                      value={syllabus.id}
                    />
                    <input name="courseId" type="hidden" value={course.id} />
                    <Button className="w-full" type="submit">
                      Publish syllabus
                    </Button>
                  </form>
                ) : null}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Add module</CardTitle>
              </CardHeader>
              <CardContent>
                <form action={addTemplateModuleAction} className="space-y-3">
                  <input name="syllabusId" type="hidden" value={syllabus.id} />
                  <input name="courseId" type="hidden" value={course.id} />
                  <input
                    className={`${input} w-full`}
                    name="title"
                    placeholder="Module title"
                    required
                  />
                  <Button className="w-full" type="submit" variant="outline">
                    Add module
                  </Button>
                </form>
              </CardContent>
            </Card>
          </aside>
        </div>
      )}
    </main>
  );
}
