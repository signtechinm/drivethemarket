"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { permissions } from "@/lib/auth/constants";
import { requirePermission } from "@/lib/auth/session";
import { queueNotifications } from "@/lib/communications/notification-service";
import { getDatabase } from "@/lib/db/client";
import { isLikelySpamSubmission } from "@/lib/website/enquiry-policy";

export interface WebsiteActionState {
  success: boolean;
  message: string;
}

export async function saveWebsitePageAction(
  _state: WebsiteActionState,
  formData: FormData,
): Promise<WebsiteActionState> {
  const { user: actor } = await requirePermission(permissions.websiteManage);
  const parsed = z
    .object({
      slug: z.enum([
        "about",
        "faculty",
        "testimonials",
        "faq",
        "privacy",
        "terms",
      ]),
      title: z.string().trim().min(2).max(120),
      eyebrow: z.string().trim().min(2).max(80),
      heading: z.string().trim().min(5).max(180),
      intro: z.string().trim().min(5).max(800),
      sections: z.string().min(2),
      publish: z.boolean(),
    })
    .safeParse({
      slug: formData.get("slug"),
      title: formData.get("title"),
      eyebrow: formData.get("eyebrow"),
      heading: formData.get("heading"),
      intro: formData.get("intro"),
      sections: formData.get("sections"),
      publish: formData.get("publish") === "on",
    });
  if (!parsed.success)
    return { success: false, message: "Enter valid page content." };
  const sections = parsed.data.sections.split("\n").flatMap((line) => {
    const [title, ...body] = line.split("|");
    return title?.trim() && body.join("|").trim()
      ? [{ title: title.trim(), body: body.join("|").trim() }]
      : [];
  });
  if (!sections.length)
    return {
      success: false,
      message: "Add at least one section using Title | Body.",
    };
  const now = new Date();
  await getDatabase().websitePage.upsert({
    where: { slug: parsed.data.slug },
    update: {
      title: parsed.data.title,
      content: {
        eyebrow: parsed.data.eyebrow,
        heading: parsed.data.heading,
        intro: parsed.data.intro,
        sections,
      },
      published: parsed.data.publish,
      publishedAt: parsed.data.publish ? now : null,
      editedById: actor.id,
    },
    create: {
      slug: parsed.data.slug,
      title: parsed.data.title,
      content: {
        eyebrow: parsed.data.eyebrow,
        heading: parsed.data.heading,
        intro: parsed.data.intro,
        sections,
      },
      published: parsed.data.publish,
      publishedAt: parsed.data.publish ? now : null,
      editedById: actor.id,
    },
  });
  revalidatePath(`/${parsed.data.slug}`);
  revalidatePath("/admin/website");
  return {
    success: true,
    message: `${parsed.data.title} was saved${parsed.data.publish ? " and published" : " as a draft"}.`,
  };
}

export async function submitWebsiteEnquiryAction(
  _state: WebsiteActionState,
  formData: FormData,
): Promise<WebsiteActionState> {
  const parsed = z
    .object({
      name: z.string().trim().min(2).max(100),
      email: z
        .string()
        .trim()
        .email()
        .transform((value) => value.toLowerCase()),
      phone: z.string().trim().max(30).optional(),
      courseId: z.string().optional(),
      message: z.string().trim().min(10).max(2000),
      website: z.string().max(0),
      startedAt: z.coerce.number(),
    })
    .safeParse({
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone") || undefined,
      courseId: formData.get("courseId") || undefined,
      message: formData.get("message"),
      website: formData.get("website") || "",
      startedAt: formData.get("startedAt"),
    });
  if (
    !parsed.success ||
    isLikelySpamSubmission({
      honeypot: parsed.success ? parsed.data.website : "invalid",
      startedAt: parsed.success ? parsed.data.startedAt : 0,
    })
  )
    return {
      success: false,
      message: "Please review the enquiry and try again.",
    };
  const database = getDatabase();
  const recent = await database.websiteEnquiry.count({
    where: {
      email: parsed.data.email,
      createdAt: { gte: new Date(Date.now() - 10 * 60 * 1000) },
    },
  });
  if (recent >= 3)
    return {
      success: false,
      message: "Please wait before sending another enquiry.",
    };
  const enquiry = await database.websiteEnquiry.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      courseId: parsed.data.courseId,
      message: parsed.data.message,
    },
  });
  const staff = await database.user.findMany({
    where: {
      status: "ACTIVE",
      roles: {
        some: {
          role: {
            permissions: { some: { permission: { key: "website.manage" } } },
          },
        },
      },
    },
    select: { id: true },
  });
  await queueNotifications({
    userIds: staff.map((user) => user.id),
    eventKey: "website_enquiry",
    subject: `New website enquiry from ${enquiry.name}`,
    body: "A prospective student submitted the Drive the Market contact form.",
    relatedEntityType: "WebsiteEnquiry",
    relatedEntityId: enquiry.id,
    mandatory: true,
  });
  const requestHeaders = await headers();
  await database.auditLog.create({
    data: {
      action: "website.enquiry_received",
      entityType: "WebsiteEnquiry",
      entityId: enquiry.id,
      ipAddress:
        requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
    },
  });
  return {
    success: true,
    message: "Thank you. The Drive the Market team will contact you shortly.",
  };
}

export async function updateEnquiryStatusAction(formData: FormData) {
  const { user: actor } = await requirePermission(permissions.websiteManage);
  const parsed = z
    .object({
      enquiryId: z.string().min(1),
      status: z.enum(["NEW", "CONTACTED", "CLOSED", "SPAM"]),
    })
    .safeParse(Object.fromEntries(formData));
  if (!parsed.success) return;
  const database = getDatabase();
  await database.$transaction([
    database.websiteEnquiry.update({
      where: { id: parsed.data.enquiryId },
      data: { status: parsed.data.status },
    }),
    database.auditLog.create({
      data: {
        actorId: actor.id,
        action: "website.enquiry_status_changed",
        entityType: "WebsiteEnquiry",
        entityId: parsed.data.enquiryId,
        metadata: { status: parsed.data.status },
      },
    }),
  ]);
  revalidatePath("/admin/website/enquiries");
}
