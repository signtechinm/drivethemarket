import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "bcryptjs";

import { PrismaClient, UserStatus } from "../generated/prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required to seed Drive the Market.");
}

const database = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

const permissionDefinitions = [
  ["users.manage", "Create, update, activate, and suspend users"],
  ["roles.manage", "Manage roles and permission assignments"],
  ["students.manage", "Manage student profiles"],
  ["enrolments.manage", "Manage batch enrolments"],
  ["courses.manage", "Manage courses and syllabus templates"],
  ["batches.manage", "Manage batches and schedules"],
  ["classes.conduct", "Mark an assigned class as conducted"],
  ["classes.complete", "Verify and complete a class"],
  ["materials.manage", "Create and update learning materials"],
  ["materials.approve", "Approve materials for release"],
  ["materials.release", "Release and re-lock approved materials"],
  ["reports.view", "View authorized operational reports"],
  ["website.manage", "Manage public website content"],
  ["audit.view", "View audit history"],
  ["communications.manage", "Manage announcements and notification delivery"],
] as const;

const roleDefinitions = [
  ["super-admin", "Super Admin"],
  ["administrator", "Administrator"],
  ["academic-manager", "Academic Manager"],
  ["instructor", "Instructor"],
  ["content-manager", "Content Manager"],
  ["website-editor", "Website Editor"],
  ["student", "Student"],
] as const;

async function main() {
  const developmentPasswordHash = await hash("TradeTuter-Dev-2026!", 12);
  const permissions = await Promise.all(
    permissionDefinitions.map(([key, description]) =>
      database.permission.upsert({
        where: { key },
        update: { description },
        create: { key, description },
      }),
    ),
  );

  const roles = await Promise.all(
    roleDefinitions.map(([key, name]) =>
      database.role.upsert({
        where: { key },
        update: { name },
        create: { key, name, system: true },
      }),
    ),
  );

  const permissionByKey = new Map(
    permissions.map((permission) => [permission.key, permission]),
  );
  const roleByKey = new Map(roles.map((role) => [role.key, role]));
  const rolePermissionKeys: Record<string, string[]> = {
    administrator: [
      "users.manage",
      "students.manage",
      "enrolments.manage",
      "batches.manage",
      "reports.view",
      "communications.manage",
    ],
    "academic-manager": [
      "courses.manage",
      "batches.manage",
      "classes.complete",
      "materials.manage",
      "materials.approve",
      "materials.release",
      "reports.view",
      "audit.view",
      "communications.manage",
    ],
    instructor: ["classes.conduct", "materials.manage", "reports.view"],
    "content-manager": ["materials.manage"],
    "website-editor": ["website.manage"],
    student: [],
  };

  for (const [roleKey, keys] of Object.entries(rolePermissionKeys)) {
    const role = roleByKey.get(roleKey);
    if (!role) continue;
    await database.rolePermission.createMany({
      data: keys.flatMap((key) => {
        const permission = permissionByKey.get(key);
        return permission
          ? [{ roleId: role.id, permissionId: permission.id }]
          : [];
      }),
      skipDuplicates: true,
    });
  }

  const superAdminRole = roles.find((role) => role.key === "super-admin");
  if (!superAdminRole) throw new Error("Super Admin role seed failed.");

  await database.rolePermission.createMany({
    data: permissions.map((permission) => ({
      roleId: superAdminRole.id,
      permissionId: permission.id,
    })),
    skipDuplicates: true,
  });

  const adminUser = await database.user.upsert({
    where: { email: "admin@tradetuter.local" },
    update: {
      name: "Drive the Market Administrator",
      passwordHash: developmentPasswordHash,
      status: UserStatus.ACTIVE,
    },
    create: {
      email: "admin@tradetuter.local",
      name: "Drive the Market Administrator",
      passwordHash: developmentPasswordHash,
      status: UserStatus.ACTIVE,
    },
  });

  await database.userRole.upsert({
    where: {
      userId_roleId: { userId: adminUser.id, roleId: superAdminRole.id },
    },
    update: {},
    create: { userId: adminUser.id, roleId: superAdminRole.id },
  });

  const instructorRole = roleByKey.get("instructor");
  if (!instructorRole) throw new Error("Instructor role seed failed.");

  const instructorUser = await database.user.upsert({
    where: { email: "instructor@tradetuter.local" },
    update: {
      name: "Drive the Market Instructor",
      passwordHash: developmentPasswordHash,
      status: UserStatus.ACTIVE,
    },
    create: {
      email: "instructor@tradetuter.local",
      name: "Drive the Market Instructor",
      passwordHash: developmentPasswordHash,
      status: UserStatus.ACTIVE,
    },
  });

  await database.userRole.upsert({
    where: {
      userId_roleId: {
        userId: instructorUser.id,
        roleId: instructorRole.id,
      },
    },
    update: {},
    create: { userId: instructorUser.id, roleId: instructorRole.id },
  });

  await database.instructorProfile.upsert({
    where: { userId: instructorUser.id },
    update: {
      bio: "Seed instructor for local academic scheduling.",
      expertise: ["Technical analysis", "Market structure"],
    },
    create: {
      userId: instructorUser.id,
      bio: "Seed instructor for local academic scheduling.",
      expertise: ["Technical analysis", "Market structure"],
    },
  });

  const course = await database.course.upsert({
    where: { code: "TA-FOUNDATION" },
    update: {
      active: true,
      description: "Seed course for local Drive the Market development.",
    },
    create: {
      code: "TA-FOUNDATION",
      title: "Technical Analysis Foundations",
      slug: "technical-analysis-foundations",
      description: "Seed course for local Drive the Market development.",
    },
  });

  await database.syllabusTemplate.upsert({
    where: { courseId_version: { courseId: course.id, version: 1 } },
    update: { publishedAt: new Date() },
    create: {
      courseId: course.id,
      title: "Technical Analysis Foundations",
      version: 1,
      publishedAt: new Date(),
      modules: {
        create: [
          {
            title: "Market and chart foundations",
            position: 1,
            classes: {
              create: [
                {
                  title: "Understanding market structure",
                  learningOutcomes: ["Recognize common market structures"],
                  expectedMinutes: 90,
                  position: 1,
                },
                {
                  title: "Candlesticks and chart reading",
                  learningOutcomes: ["Read core candlestick information"],
                  expectedMinutes: 90,
                  position: 2,
                },
              ],
            },
          },
        ],
      },
    },
  });

  const batch = await database.batch.upsert({
    where: { code: "TT-AUG26" },
    update: { status: "ACTIVE", capacity: 30 },
    create: {
      courseId: course.id,
      code: "TT-AUG26",
      name: "August 2026 Foundation Batch",
      status: "ACTIVE",
      capacity: 30,
      startsAt: new Date("2026-08-01T00:00:00.000Z"),
      endsAt: new Date("2026-11-30T23:59:59.000Z"),
    },
  });

  const batchModule = await database.batchModule.upsert({
    where: { batchId_position: { batchId: batch.id, position: 1 } },
    update: { title: "Market and chart foundations" },
    create: {
      batchId: batch.id,
      title: "Market and chart foundations",
      position: 1,
    },
  });
  const releasedClass = await database.classSession.upsert({
    where: {
      moduleId_position: { moduleId: batchModule.id, position: 1 },
    },
    update: {
      status: "RELEASED",
      instructorId: instructorUser.id,
      conductedAt: new Date("2026-08-10T10:00:00.000Z"),
      completedAt: new Date("2026-08-10T12:00:00.000Z"),
      releasedAt: new Date("2026-08-10T13:00:00.000Z"),
    },
    create: {
      moduleId: batchModule.id,
      title: "Understanding market structure",
      learningOutcomes: ["Recognize common market structures"],
      position: 1,
      status: "RELEASED",
      instructorId: instructorUser.id,
      conductedAt: new Date("2026-08-10T10:00:00.000Z"),
      completedAt: new Date("2026-08-10T12:00:00.000Z"),
      releasedAt: new Date("2026-08-10T13:00:00.000Z"),
    },
  });
  const scheduledClass = await database.classSession.upsert({
    where: {
      moduleId_position: { moduleId: batchModule.id, position: 2 },
    },
    update: { status: "SCHEDULED", instructorId: instructorUser.id },
    create: {
      moduleId: batchModule.id,
      title: "Candlesticks and chart reading",
      learningOutcomes: ["Read core candlestick information"],
      position: 2,
      status: "SCHEDULED",
      instructorId: instructorUser.id,
      scheduledAt: new Date("2026-08-20T10:00:00.000Z"),
    },
  });
  const releasedMaterial = await database.material.upsert({
    where: {
      classSessionId_position: {
        classSessionId: releasedClass.id,
        position: 1,
      },
    },
    update: { status: "RELEASED" },
    create: {
      classSessionId: releasedClass.id,
      uploadedById: adminUser.id,
      title: "Market structure reference chart",
      description: "Released sample resource for local access verification.",
      type: "EXTERNAL_LINK",
      status: "RELEASED",
      position: 1,
      externalUrl: "https://example.com/",
      approvedAt: new Date("2026-08-10T12:30:00.000Z"),
    },
  });
  if (
    !(await database.materialRelease.findFirst({
      where: { materialId: releasedMaterial.id, revokedAt: null },
    }))
  )
    await database.materialRelease.create({
      data: {
        materialId: releasedMaterial.id,
        actorId: adminUser.id,
        releasedAt: new Date("2026-08-10T13:00:00.000Z"),
      },
    });
  await database.material.upsert({
    where: {
      classSessionId_position: {
        classSessionId: scheduledClass.id,
        position: 1,
      },
    },
    update: { status: "APPROVED" },
    create: {
      classSessionId: scheduledClass.id,
      uploadedById: adminUser.id,
      title: "Locked candlestick preparation notes",
      description: "Approved but unavailable until the class is completed.",
      type: "EXTERNAL_LINK",
      status: "APPROVED",
      position: 1,
      externalUrl: "https://example.com/",
      approvedAt: new Date(),
    },
  });

  const studentRole = roleByKey.get("student");
  if (!studentRole) throw new Error("Student role seed failed.");
  const studentUser = await database.user.upsert({
    where: { email: "student@tradetuter.local" },
    update: {
      name: "Drive the Market Student",
      phone: "+91 90000 00000",
      passwordHash: developmentPasswordHash,
      status: UserStatus.ACTIVE,
      emailVerifiedAt: new Date(),
    },
    create: {
      email: "student@tradetuter.local",
      name: "Drive the Market Student",
      phone: "+91 90000 00000",
      passwordHash: developmentPasswordHash,
      status: UserStatus.ACTIVE,
      emailVerifiedAt: new Date(),
    },
  });
  await database.userRole.upsert({
    where: {
      userId_roleId: { userId: studentUser.id, roleId: studentRole.id },
    },
    update: {},
    create: { userId: studentUser.id, roleId: studentRole.id },
  });
  const studentProfile = await database.studentProfile.upsert({
    where: { userId: studentUser.id },
    update: { studentNumber: "TT-STU-001" },
    create: {
      userId: studentUser.id,
      studentNumber: "TT-STU-001",
      address: "Development seed profile",
    },
  });
  const sampleEnrolment = await database.enrolment.upsert({
    where: {
      studentId_batchId: { studentId: studentProfile.id, batchId: batch.id },
    },
    update: {
      status: "ACTIVE",
      accessStartsAt: new Date("2026-08-01T00:00:00.000Z"),
      accessEndsAt: new Date("2026-12-31T23:59:59.000Z"),
    },
    create: {
      studentId: studentProfile.id,
      batchId: batch.id,
      status: "ACTIVE",
      accessStartsAt: new Date("2026-08-01T00:00:00.000Z"),
      accessEndsAt: new Date("2026-12-31T23:59:59.000Z"),
    },
  });
  await database.materialProgress.upsert({
    where: {
      enrolmentId_materialId: {
        enrolmentId: sampleEnrolment.id,
        materialId: releasedMaterial.id,
      },
    },
    update: { openedAt: new Date() },
    create: {
      enrolmentId: sampleEnrolment.id,
      materialId: releasedMaterial.id,
      openedAt: new Date(),
    },
  });
  if (
    !(await database.notification.findFirst({
      where: {
        userId: studentUser.id,
        subject: "Welcome to your Drive the Market batch",
      },
    }))
  )
    await database.notification.create({
      data: {
        userId: studentUser.id,
        channel: "IN_APP",
        status: "SENT",
        subject: "Welcome to your Drive the Market batch",
        body: "Your learning dashboard and first released resource are ready.",
        sentAt: new Date(),
      },
    });

  const isolatedStudent = await database.user.upsert({
    where: { email: "student2@tradetuter.local" },
    update: {
      name: "Isolated Test Student",
      passwordHash: developmentPasswordHash,
      status: UserStatus.ACTIVE,
      emailVerifiedAt: new Date(),
    },
    create: {
      email: "student2@tradetuter.local",
      name: "Isolated Test Student",
      passwordHash: developmentPasswordHash,
      status: UserStatus.ACTIVE,
      emailVerifiedAt: new Date(),
    },
  });
  await database.userRole.upsert({
    where: {
      userId_roleId: { userId: isolatedStudent.id, roleId: studentRole.id },
    },
    update: {},
    create: { userId: isolatedStudent.id, roleId: studentRole.id },
  });
  await database.studentProfile.upsert({
    where: { userId: isolatedStudent.id },
    update: { studentNumber: "TT-STU-002" },
    create: {
      userId: isolatedStudent.id,
      studentNumber: "TT-STU-002",
    },
  });

  const batchAnnouncement =
    (await database.announcement.findFirst({
      where: { title: "Foundation batch market briefing" },
    })) ??
    (await database.announcement.create({
      data: {
        authorId: adminUser.id,
        batchId: batch.id,
        title: "Foundation batch market briefing",
        body: "A batch-only market briefing has been added to this week's schedule.",
        publishedAt: new Date(),
      },
    }));
  const globalAnnouncement =
    (await database.announcement.findFirst({
      where: { title: "Drive the Market learning update" },
    })) ??
    (await database.announcement.create({
      data: {
        authorId: adminUser.id,
        title: "Drive the Market learning update",
        body: "Welcome to the new Drive the Market notification centre.",
        publishedAt: new Date(),
      },
    }));

  for (const [announcement, recipientIds] of [
    [batchAnnouncement, [studentUser.id]],
    [globalAnnouncement, [studentUser.id, isolatedStudent.id]],
  ] as const)
    for (const userId of recipientIds)
      for (const channel of ["IN_APP", "EMAIL"] as const)
        if (
          !(await database.notification.findFirst({
            where: {
              userId,
              channel,
              eventKey: "announcement",
              relatedEntityId: announcement.id,
            },
          }))
        )
          await database.notification.create({
            data: {
              userId,
              channel,
              status: channel === "IN_APP" ? "SENT" : "PENDING",
              subject: announcement.title,
              body: announcement.body,
              eventKey: "announcement",
              relatedEntityType: "Announcement",
              relatedEntityId: announcement.id,
              sentAt: channel === "IN_APP" ? new Date() : null,
            },
          });

  const websitePages = [
    {
      slug: "about",
      title: "About Drive the Market",
      content: {
        eyebrow: "About the institution",
        heading:
          "Trading education built around clarity and disciplined practice.",
        intro:
          "Drive the Market connects live instruction with structured post-class study and measurable learning progress.",
        sections: [
          {
            title: "Our purpose",
            body: "Make serious trading education easier to follow, revisit, and apply responsibly.",
          },
          {
            title: "Our approach",
            body: "Live instruction, reviewed resources, secure recordings, and progress tracking form one learning journey.",
          },
        ],
      },
    },
    {
      slug: "faculty",
      title: "Faculty",
      content: {
        eyebrow: "Faculty and trainers",
        heading:
          "Learn from practitioners who teach the reasoning behind the chart.",
        intro:
          "Our faculty combines market experience with structured teaching and practical review.",
        sections: [
          {
            title: "Drive the Market Instructor",
            body: "Technical analysis, market structure, and risk-aware trading plans.",
          },
          {
            title: "Academic support",
            body: "Class planning, resource review, progress support, and disciplined follow-up.",
          },
        ],
      },
    },
    {
      slug: "testimonials",
      title: "Testimonials",
      content: {
        eyebrow: "Student perspectives",
        heading: "A calmer, more structured way to revisit every class.",
        intro:
          "Representative demonstration copy. Replace it with verified client testimonials before launch.",
        sections: [
          {
            title: "Clear learning order",
            body: "Modules make it easier to know what to review next.",
          },
          {
            title: "Useful after class",
            body: "Released recordings and references reinforce each live session.",
          },
        ],
      },
    },
    {
      slug: "faq",
      title: "Frequently Asked Questions",
      content: {
        eyebrow: "Frequently asked questions",
        heading: "What prospective students usually want to know.",
        intro: "Contact the institution if your question is not covered here.",
        sections: [
          {
            title: "When do materials become available?",
            body: "Approved resources are released only after the relevant live class is completed.",
          },
          {
            title: "Does the course guarantee trading returns?",
            body: "No. Drive the Market provides education, not investment advice or guaranteed outcomes.",
          },
        ],
      },
    },
    {
      slug: "privacy",
      title: "Privacy Policy",
      content: {
        eyebrow: "Privacy policy",
        heading:
          "How Drive the Market handles personal and learning information.",
        intro:
          "This deployment baseline requires jurisdiction-specific legal review before launch.",
        sections: [
          {
            title: "Information collected",
            body: "Account, contact, enrolment, learning activity, progress, and enquiry information required to provide the service.",
          },
          {
            title: "Access and security",
            body: "Private learning resources and progress information are restricted through role, enrolment, and release checks.",
          },
        ],
      },
    },
    {
      slug: "terms",
      title: "Terms of Use",
      content: {
        eyebrow: "Terms of use",
        heading: "The conditions for using Drive the Market learning services.",
        intro:
          "These baseline terms require legal review and institution-specific details before publication.",
        sections: [
          {
            title: "Educational purpose",
            body: "Content is educational and does not constitute investment, legal, or tax advice.",
          },
          {
            title: "Account responsibility",
            body: "Students must protect credentials and must not share private materials or access links.",
          },
        ],
      },
    },
  ] as const;

  for (const page of websitePages)
    await database.websitePage.upsert({
      where: { slug: page.slug },
      update: {},
      create: {
        ...page,
        published: true,
        publishedAt: new Date(),
        editedById: adminUser.id,
      },
    });

  if (
    !(await database.websiteEnquiry.findFirst({
      where: { email: "prospect@tradetuter.local" },
    }))
  )
    await database.websiteEnquiry.create({
      data: {
        courseId: course.id,
        name: "Sample Prospective Student",
        email: "prospect@tradetuter.local",
        phone: "+91 90000 00000",
        message: "I would like to know more about the next foundation batch.",
      },
    });

  console.info("Drive the Market seed completed.");
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await database.$disconnect();
  });
