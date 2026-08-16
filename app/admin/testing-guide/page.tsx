"use client";

import {
  ArrowUpRight,
  CheckCircle2,
  ClipboardCheck,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type TestItem = {
  id: string;
  task: string;
  expected: string;
  href?: string;
  linkLabel?: string;
};

type TestSection = {
  title: string;
  description: string;
  items: TestItem[];
};

const storageKey = "drive-the-market-admin-test-progress";

const testSections: TestSection[] = [
  {
    title: "1. Public website",
    description:
      "Confirm that visitors can discover the institution and submit interest.",
    items: [
      {
        id: "public-home",
        task: "Review the home page on desktop and mobile.",
        expected:
          "Hero, animations, programs, batches, navigation, and footer render without overlap.",
        href: "/",
        linkLabel: "Open home",
      },
      {
        id: "public-courses",
        task: "Open the public course catalogue and a course enquiry link.",
        expected:
          "Published courses appear and the selected course is carried into the contact form.",
        href: "/courses",
        linkLabel: "Open courses",
      },
      {
        id: "public-batches",
        task: "Review current and enrolling batches.",
        expected:
          "Only public batches show with accurate dates, course names, and status.",
        href: "/batches",
        linkLabel: "Open batches",
      },
      {
        id: "public-contact",
        task: "Submit a test website enquiry.",
        expected:
          "A success response appears and the enquiry is available in administration.",
        href: "/contact",
        linkLabel: "Open contact",
      },
    ],
  },
  {
    title: "2. Accounts and access",
    description:
      "Validate administrator, staff, and student authentication boundaries.",
    items: [
      {
        id: "auth-login",
        task: "Sign in with the intended administrator account.",
        expected:
          "The user reaches /admin and sees only navigation allowed by their permissions.",
        href: "/login?callbackUrl=/admin",
        linkLabel: "Open login",
      },
      {
        id: "auth-forgot",
        task: "Submit the forgot-password form with a known account.",
        expected:
          "The request completes without revealing whether an unknown email exists.",
        href: "/forgot-password",
        linkLabel: "Test recovery",
      },
      {
        id: "auth-permissions",
        task: "Compare access using a restricted staff role.",
        expected:
          "Hidden modules stay hidden and direct unauthorized URLs are rejected.",
        href: "/admin/roles",
        linkLabel: "Review roles",
      },
      {
        id: "auth-student",
        task: "Sign in as an active student and attempt /admin.",
        expected:
          "The student reaches /portal and cannot access administration.",
        href: "/portal",
        linkLabel: "Open portal",
      },
    ],
  },
  {
    title: "3. Students and enrolments",
    description: "Test the complete learner onboarding and access lifecycle.",
    items: [
      {
        id: "student-create",
        task: "Create or invite a test student.",
        expected:
          "The student profile is created once and the invitation flow is available.",
        href: "/admin/students",
        linkLabel: "Manage students",
      },
      {
        id: "student-enrol",
        task: "Enrol the test student into an active batch.",
        expected:
          "The enrolment appears on the student, batch, dashboard, and reports.",
        href: "/admin/students",
        linkLabel: "Test enrolment",
      },
      {
        id: "student-status",
        task: "Suspend and restore the test enrolment.",
        expected:
          "Portal access follows the enrolment state without deleting progress.",
        href: "/admin/students",
        linkLabel: "Review access",
      },
      {
        id: "student-export",
        task: "Export the enrolment list.",
        expected:
          "The downloaded file respects the selected filters and contains expected rows.",
        href: "/admin/reports",
        linkLabel: "Open reports",
      },
    ],
  },
  {
    title: "4. Courses, batches, and classes",
    description:
      "Verify the academic structure from course setup to scheduled delivery.",
    items: [
      {
        id: "course-manage",
        task: "Create or edit a course and its syllabus.",
        expected:
          "Changes save, validation is clear, and public visibility follows publication state.",
        href: "/admin/courses",
        linkLabel: "Manage courses",
      },
      {
        id: "batch-manage",
        task: "Create or edit a batch with capacity and dates.",
        expected:
          "The batch appears with the correct course, status, capacity, and date range.",
        href: "/admin/batches",
        linkLabel: "Manage batches",
      },
      {
        id: "batch-modules",
        task: "Add modules and schedule a class session.",
        expected: "Ordering and schedule information are preserved on refresh.",
        href: "/admin/batches",
        linkLabel: "Review structure",
      },
      {
        id: "batch-capacity",
        task: "Compare active enrolments with batch capacity.",
        expected:
          "Dashboard capacity and batch counts match the actual active enrolments.",
        href: "/admin",
        linkLabel: "Check dashboard",
      },
    ],
  },
  {
    title: "5. Materials and recordings",
    description:
      "Exercise the protected-content approval and release workflow.",
    items: [
      {
        id: "material-upload",
        task: "Upload a test material to a class.",
        expected:
          "The file validates, uploads once, and starts in the correct workflow state.",
        href: "/admin/materials",
        linkLabel: "Open materials",
      },
      {
        id: "material-review",
        task: "Move the material through review, approval, and release.",
        expected:
          "Only permitted roles can perform each transition and every change is auditable.",
        href: "/admin/materials",
        linkLabel: "Test workflow",
      },
      {
        id: "material-preview",
        task: "Preview the protected material as an administrator.",
        expected:
          "The correct file opens without exposing a permanent public URL.",
        href: "/admin/materials",
        linkLabel: "Test preview",
      },
      {
        id: "material-student",
        task: "Open the released material as an enrolled student.",
        expected:
          "Eligible students can view it; unreleased or unrelated content remains blocked.",
        href: "/portal",
        linkLabel: "Open portal",
      },
      {
        id: "material-progress",
        task: "Complete a material or watch a recording as the test student.",
        expected:
          "Progress persists after refresh and appears in administrative reporting.",
        href: "/admin/reports",
        linkLabel: "Verify progress",
      },
    ],
  },
  {
    title: "6. Communications and enquiries",
    description: "Confirm operational messages reach the intended audience.",
    items: [
      {
        id: "comms-compose",
        task: "Create a test communication for a selected audience.",
        expected:
          "Recipient targeting is accurate and no unrelated user is included.",
        href: "/admin/communications",
        linkLabel: "Open communications",
      },
      {
        id: "comms-notification",
        task: "Check the message in the student notification centre.",
        expected:
          "The notification appears once with the correct title, body, and timestamp.",
        href: "/portal/notifications",
        linkLabel: "Check notifications",
      },
      {
        id: "enquiry-process",
        task: "Open the test enquiry and update its status.",
        expected:
          "Contact details and course context are correct; status remains after refresh.",
        href: "/admin/website/enquiries",
        linkLabel: "Review enquiries",
      },
      {
        id: "website-content",
        task: "Review editable website content and visibility.",
        expected:
          "Published changes appear publicly while drafts remain private.",
        href: "/admin/website",
        linkLabel: "Manage website",
      },
    ],
  },
  {
    title: "7. Reports, audit, and completion",
    description:
      "Reconcile system totals and finish with security and regression checks.",
    items: [
      {
        id: "report-filters",
        task: "Exercise report search, date, status, batch, and activity filters.",
        expected:
          "Counts and rows update consistently and empty states remain usable.",
        href: "/admin/reports",
        linkLabel: "Test filters",
      },
      {
        id: "report-export",
        task: "Export the filtered report.",
        expected:
          "The export matches the visible filter scope and opens correctly.",
        href: "/admin/reports",
        linkLabel: "Test export",
      },
      {
        id: "audit-events",
        task: "Confirm recent test actions appear in operational activity.",
        expected:
          "Important changes identify the actor, action, target, and time.",
        href: "/admin",
        linkLabel: "Check activity",
      },
      {
        id: "responsive",
        task: "Repeat critical journeys at mobile and tablet widths.",
        expected:
          "Navigation, tables, forms, dialogs, and actions remain accessible.",
        href: "/admin",
        linkLabel: "Review layout",
      },
      {
        id: "logout",
        task: "Sign out, then revisit protected URLs using browser history.",
        expected:
          "The session is cleared and protected pages redirect to login.",
        href: "/admin",
        linkLabel: "Finish in admin",
      },
    ],
  },
];

export default function AdminTestingGuidePage() {
  const [completed, setCompleted] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);
  const allItems = useMemo(
    () => testSections.flatMap((section) => section.items),
    [],
  );

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      try {
        const saved = window.localStorage.getItem(storageKey);
        if (saved) setCompleted(JSON.parse(saved) as string[]);
      } catch {
        setCompleted([]);
      } finally {
        setLoaded(true);
      }
    }, 0);

    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (loaded)
      window.localStorage.setItem(storageKey, JSON.stringify(completed));
  }, [completed, loaded]);

  const completedCount = completed.filter((id) =>
    allItems.some((item) => item.id === id),
  ).length;
  const progress = Math.round((completedCount / allItems.length) * 100);

  function toggleItem(id: string) {
    setCompleted((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-10">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="text-primary text-xs font-bold tracking-[0.16em] uppercase">
            Administrator QA
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-olive-950 sm:text-4xl">
            End-to-end system test guide
          </h1>
          <p className="text-muted-foreground mt-3 max-w-3xl leading-7">
            Follow the sections in order using dedicated test data. Check an
            item only after its expected result has been confirmed.
          </p>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border bg-white px-4 py-3 shadow-sm">
          <ClipboardCheck className="text-primary size-5" />
          <div>
            <p className="text-lg font-bold text-olive-950">
              {completedCount}/{allItems.length}
            </p>
            <p className="text-muted-foreground text-xs">checks complete</p>
          </div>
        </div>
      </div>

      <section className="mt-8 rounded-2xl bg-olive-950 p-5 text-white shadow-[var(--shadow-card)]">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold">Overall test progress</p>
            <p className="mt-1 text-xs text-olive-200">
              Progress is saved in this browser.
            </p>
          </div>
          <span className="text-2xl font-bold">{progress}%</span>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/15">
          <div
            className="h-full rounded-full bg-olive-400 transition-[width] duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        {completedCount > 0 ? (
          <button
            className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-olive-200 hover:text-white"
            onClick={() => setCompleted([])}
            type="button"
          >
            <RotateCcw className="size-3.5" /> Reset checklist
          </button>
        ) : null}
      </section>

      <div className="mt-8 grid gap-6">
        {testSections.map((section) => {
          const sectionDone = section.items.filter((item) =>
            completed.includes(item.id),
          ).length;
          return (
            <section
              className="overflow-hidden rounded-2xl border bg-white shadow-sm"
              key={section.title}
            >
              <header className="flex flex-wrap items-start justify-between gap-4 border-b bg-olive-50/60 px-5 py-4 sm:px-6">
                <div>
                  <h2 className="text-lg font-bold text-olive-950">
                    {section.title}
                  </h2>
                  <p className="text-muted-foreground mt-1 text-sm">
                    {section.description}
                  </p>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-olive-700 ring-1 ring-olive-200">
                  {sectionDone}/{section.items.length}
                </span>
              </header>
              <div className="divide-y">
                {section.items.map((item) => {
                  const checked = completed.includes(item.id);
                  return (
                    <div
                      className={`grid gap-4 px-5 py-5 transition sm:grid-cols-[auto_1fr_auto] sm:px-6 ${checked ? "bg-olive-50/45" : ""}`}
                      key={item.id}
                    >
                      <button
                        aria-label={
                          checked
                            ? `Mark ${item.task} incomplete`
                            : `Mark ${item.task} complete`
                        }
                        className={`mt-0.5 grid size-7 place-items-center rounded-full border-2 transition ${checked ? "border-primary bg-primary text-white" : "border-olive-300 text-transparent hover:border-olive-600"}`}
                        onClick={() => toggleItem(item.id)}
                        type="button"
                      >
                        <CheckCircle2 className="size-4" />
                      </button>
                      <div>
                        <h3
                          className={`font-semibold ${checked ? "text-olive-600 line-through" : "text-olive-950"}`}
                        >
                          {item.task}
                        </h3>
                        <div className="text-silver-800 mt-2 flex items-start gap-2 text-sm">
                          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-olive-600" />
                          <p>
                            <strong className="text-olive-800">
                              Expected:
                            </strong>{" "}
                            {item.expected}
                          </p>
                        </div>
                      </div>
                      {item.href ? (
                        <Link
                          className="inline-flex h-9 items-center justify-center gap-2 self-center rounded-lg border px-3 text-xs font-bold text-olive-800 transition hover:bg-olive-100"
                          href={item.href}
                        >
                          {item.linkLabel}
                          <ArrowUpRight className="size-3.5" />
                        </Link>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}
