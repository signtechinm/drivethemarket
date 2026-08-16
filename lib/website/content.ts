import "server-only";

import { getDatabase } from "@/lib/db/client";

export interface WebsiteSection {
  title: string;
  body: string;
}

export interface WebsiteContent {
  eyebrow: string;
  heading: string;
  intro: string;
  sections: WebsiteSection[];
}

export const websiteFallbacks: Record<string, WebsiteContent> = {
  about: {
    eyebrow: "About the institution",
    heading: "Trading education built around clarity and disciplined practice.",
    intro:
      "Drive the Market helps learners move from live instruction into structured post-class study, with every module organized around practical market understanding.",
    sections: [
      {
        title: "Our purpose",
        body: "Make serious trading education easier to follow, revisit, and apply responsibly.",
      },
      {
        title: "Our approach",
        body: "Live instruction, carefully reviewed learning resources, secure recordings, and measurable progress work together as one learning journey.",
      },
      {
        title: "Responsible learning",
        body: "Education focuses on process, risk awareness, and independent decision-making. It does not promise financial returns.",
      },
    ],
  },
  faculty: {
    eyebrow: "Faculty and trainers",
    heading:
      "Learn from practitioners who teach the reasoning behind the chart.",
    intro:
      "Our faculty combines market experience with structured teaching and practical review.",
    sections: [
      {
        title: "Drive the Market Instructor",
        body: "Technical analysis · Market structure · Risk-aware trading plans",
      },
      {
        title: "Academic support",
        body: "Class planning, resource review, progress support, and disciplined learning follow-up.",
      },
    ],
  },
  testimonials: {
    eyebrow: "Student perspectives",
    heading: "A calmer, more structured way to revisit every class.",
    intro:
      "Representative feedback shown for design demonstration. Verified client testimonials can replace it through the CMS.",
    sections: [
      {
        title: "Clear learning order",
        body: "The modules make it easier to know what to review next instead of collecting disconnected notes.",
      },
      {
        title: "Useful after class",
        body: "Released recordings and reference material help reinforce the live session at a manageable pace.",
      },
      {
        title: "Progress feels visible",
        body: "Completion tracking makes consistent study more practical.",
      },
    ],
  },
  faq: {
    eyebrow: "Frequently asked questions",
    heading: "What prospective students usually want to know.",
    intro: "Contact the institution if your question is not covered here.",
    sections: [
      {
        title: "Are classes conducted inside Drive the Market?",
        body: "Live classes use the institution's external online-class platform. Drive the Market organizes schedules and post-class learning.",
      },
      {
        title: "When do materials become available?",
        body: "Approved resources are released only after the relevant live class has been completed.",
      },
      {
        title: "Can I revisit recorded classes?",
        body: "Eligible students can access released recordings during their active enrolment period.",
      },
      {
        title: "Does the course guarantee trading returns?",
        body: "No. Drive the Market provides education, not investment advice or guaranteed outcomes.",
      },
    ],
  },
  privacy: {
    eyebrow: "Privacy policy",
    heading: "How Drive the Market handles personal and learning information.",
    intro:
      "This MVP policy is a deployment baseline and must be reviewed against the institution's jurisdiction before launch.",
    sections: [
      {
        title: "Information collected",
        body: "Account, contact, enrolment, learning activity, progress, and enquiry information required to provide the service.",
      },
      {
        title: "How it is used",
        body: "To administer classes, protect learning content, communicate operational updates, and improve student support.",
      },
      {
        title: "Access and security",
        body: "Private learning resources and progress information are restricted through role, enrolment, and release checks.",
      },
      {
        title: "Contact",
        body: "Contact the institution to request access, correction, or deletion where applicable.",
      },
    ],
  },
  terms: {
    eyebrow: "Terms of use",
    heading: "The conditions for using Drive the Market learning services.",
    intro:
      "These MVP terms require legal review and institution-specific details before production publication.",
    sections: [
      {
        title: "Educational purpose",
        body: "Content is provided for education and does not constitute investment, legal, or tax advice.",
      },
      {
        title: "Account responsibility",
        body: "Students must protect account credentials and must not share private materials or access links.",
      },
      {
        title: "Content rights",
        body: "Course resources remain the property of the institution or their respective rights holders.",
      },
      {
        title: "Access",
        body: "Access depends on account and enrolment status and may be suspended when terms or institutional policies are breached.",
      },
    ],
  },
};

export async function getPublishedWebsiteContent(slug: string) {
  const page = await getDatabase().websitePage.findFirst({
    where: { slug, published: true },
  });
  return (
    (page?.content as unknown as WebsiteContent | undefined) ??
    websiteFallbacks[slug]
  );
}
