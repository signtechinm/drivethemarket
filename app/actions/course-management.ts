"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { permissions } from "@/lib/auth/constants";
import { requirePermission } from "@/lib/auth/session";
import { getDatabase } from "@/lib/db/client";

export interface CourseActionState {
  success: boolean;
  message: string;
}

const courseSchema = z.object({
  code: z
    .string()
    .trim()
    .min(2)
    .max(30)
    .transform((value) => value.toUpperCase()),
  title: z.string().trim().min(3).max(120),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: z.string().trim().max(1000).optional(),
});

export async function createCourseAction(
  _state: CourseActionState,
  formData: FormData,
): Promise<CourseActionState> {
  const { user: actor } = await requirePermission(permissions.coursesManage);
  const parsed = courseSchema.safeParse({
    code: formData.get("code"),
    title: formData.get("title"),
    slug: formData.get("slug"),
    description: formData.get("description") || undefined,
  });
  if (!parsed.success)
    return {
      success: false,
      message: "Enter a valid code, title, slug, and description.",
    };

  const database = getDatabase();
  const duplicate = await database.course.findFirst({
    where: { OR: [{ code: parsed.data.code }, { slug: parsed.data.slug }] },
  });
  if (duplicate)
    return {
      success: false,
      message: "The course code or slug already exists.",
    };

  const course = await database.$transaction(async (transaction) => {
    const created = await transaction.course.create({ data: parsed.data });
    await transaction.auditLog.create({
      data: {
        actorId: actor.id,
        action: "course.created",
        entityType: "Course",
        entityId: created.id,
        metadata: { code: created.code },
      },
    });
    return created;
  });

  revalidatePath("/admin/courses");
  return { success: true, message: `${course.title} was created.` };
}

export async function toggleCourseAction(formData: FormData) {
  const { user: actor } = await requirePermission(permissions.coursesManage);
  const input = z
    .object({ courseId: z.string().min(1), active: z.enum(["true", "false"]) })
    .safeParse({
      courseId: formData.get("courseId"),
      active: formData.get("active"),
    });
  if (!input.success) return;
  await getDatabase().$transaction([
    getDatabase().course.update({
      where: { id: input.data.courseId },
      data: { active: input.data.active === "true" },
    }),
    getDatabase().auditLog.create({
      data: {
        actorId: actor.id,
        action:
          input.data.active === "true" ? "course.activated" : "course.archived",
        entityType: "Course",
        entityId: input.data.courseId,
      },
    }),
  ]);
  revalidatePath("/admin/courses");
}

export async function createSyllabusAction(formData: FormData) {
  const { user: actor } = await requirePermission(permissions.coursesManage);
  const input = z
    .object({
      courseId: z.string().min(1),
      title: z.string().trim().min(3).max(120),
    })
    .safeParse({
      courseId: formData.get("courseId"),
      title: formData.get("title"),
    });
  if (!input.success) return;

  const database = getDatabase();
  const latest = await database.syllabusTemplate.aggregate({
    where: { courseId: input.data.courseId },
    _max: { version: true },
  });
  const syllabus = await database.syllabusTemplate.create({
    data: {
      courseId: input.data.courseId,
      title: input.data.title,
      version: (latest._max.version ?? 0) + 1,
    },
  });
  await database.auditLog.create({
    data: {
      actorId: actor.id,
      action: "syllabus.created",
      entityType: "SyllabusTemplate",
      entityId: syllabus.id,
    },
  });
  redirect(`/admin/courses/${input.data.courseId}?syllabus=${syllabus.id}`);
}

export async function addTemplateModuleAction(formData: FormData) {
  const { user: actor } = await requirePermission(permissions.coursesManage);
  const input = z
    .object({
      syllabusId: z.string().min(1),
      courseId: z.string().min(1),
      title: z.string().trim().min(2).max(120),
    })
    .safeParse({
      syllabusId: formData.get("syllabusId"),
      courseId: formData.get("courseId"),
      title: formData.get("title"),
    });
  if (!input.success) return;
  const database = getDatabase();
  const position =
    (
      await database.templateModule.aggregate({
        where: { syllabusId: input.data.syllabusId },
        _max: { position: true },
      })
    )._max.position ?? 0;
  const syllabusModule = await database.templateModule.create({
    data: {
      syllabusId: input.data.syllabusId,
      title: input.data.title,
      position: position + 1,
    },
  });
  await database.auditLog.create({
    data: {
      actorId: actor.id,
      action: "syllabus.module_added",
      entityType: "TemplateModule",
      entityId: syllabusModule.id,
    },
  });
  revalidatePath(`/admin/courses/${input.data.courseId}`);
}

export async function addTemplateClassAction(formData: FormData) {
  const { user: actor } = await requirePermission(permissions.coursesManage);
  const input = z
    .object({
      moduleId: z.string().min(1),
      courseId: z.string().min(1),
      title: z.string().trim().min(2).max(140),
      expectedMinutes: z.coerce.number().int().min(15).max(480).default(90),
    })
    .safeParse({
      moduleId: formData.get("moduleId"),
      courseId: formData.get("courseId"),
      title: formData.get("title"),
      expectedMinutes: formData.get("expectedMinutes"),
    });
  if (!input.success) return;
  const database = getDatabase();
  const position =
    (
      await database.templateClass.aggregate({
        where: { moduleId: input.data.moduleId },
        _max: { position: true },
      })
    )._max.position ?? 0;
  const session = await database.templateClass.create({
    data: {
      moduleId: input.data.moduleId,
      title: input.data.title,
      position: position + 1,
      expectedMinutes: input.data.expectedMinutes,
      learningOutcomes: [],
    },
  });
  await database.auditLog.create({
    data: {
      actorId: actor.id,
      action: "syllabus.class_added",
      entityType: "TemplateClass",
      entityId: session.id,
    },
  });
  revalidatePath(`/admin/courses/${input.data.courseId}`);
}

export async function publishSyllabusAction(formData: FormData) {
  const { user: actor } = await requirePermission(permissions.coursesManage);
  const input = z
    .object({ syllabusId: z.string().min(1), courseId: z.string().min(1) })
    .safeParse({
      syllabusId: formData.get("syllabusId"),
      courseId: formData.get("courseId"),
    });
  if (!input.success) return;
  await getDatabase().$transaction([
    getDatabase().syllabusTemplate.update({
      where: { id: input.data.syllabusId },
      data: { publishedAt: new Date() },
    }),
    getDatabase().auditLog.create({
      data: {
        actorId: actor.id,
        action: "syllabus.published",
        entityType: "SyllabusTemplate",
        entityId: input.data.syllabusId,
      },
    }),
  ]);
  revalidatePath(`/admin/courses/${input.data.courseId}`);
}
