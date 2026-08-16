import {
  Activity,
  ArrowRight,
  BookOpenCheck,
  CalendarDays,
  CheckCircle2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { getDatabase } from "@/lib/db/client";

export const dynamic = "force-dynamic";

function MarketChart() {
  const candles = [
    [22, 42, 31, 36],
    [30, 48, 37, 44],
    [36, 55, 48, 41],
    [34, 49, 40, 46],
    [38, 64, 56, 45],
    [49, 70, 61, 55],
    [54, 73, 58, 66],
    [59, 79, 70, 63],
    [57, 75, 65, 70],
    [63, 85, 77, 69],
  ];

  return (
    <div className="hero-market-graphic absolute inset-0 overflow-hidden">
      <div className="market-grid absolute inset-0" />
      <div className="absolute top-[18%] right-[4%] bottom-[15%] left-[39%]">
        <svg
          aria-hidden="true"
          className="absolute inset-0 size-full overflow-visible"
          preserveAspectRatio="none"
          viewBox="0 0 500 190"
        >
          <defs>
            <linearGradient id="chart-fill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#d9e0c7" stopOpacity=".26" />
              <stop offset="100%" stopColor="#d9e0c7" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            className="market-area"
            d="M0 164 C45 153 55 132 91 139 C135 147 145 99 185 112 C220 122 234 77 271 91 C310 106 322 55 361 68 C402 81 421 36 500 25 L500 190 L0 190 Z"
            fill="url(#chart-fill)"
          />
          <path
            className="market-line"
            d="M0 164 C45 153 55 132 91 139 C135 147 145 99 185 112 C220 122 234 77 271 91 C310 106 322 55 361 68 C402 81 421 36 500 25"
            fill="none"
            stroke="#d9e0c7"
            strokeLinecap="round"
            strokeWidth="4"
            vectorEffect="non-scaling-stroke"
          />
          {candles.map(([low, high, open, close], index) => {
            const x = 25 + index * 49;
            const rising = close >= open;
            const top = 178 - Math.max(open, close) * 1.7;
            const height = Math.max(Math.abs(close - open) * 1.7, 5);
            return (
              <g
                className="market-candle"
                key={x}
                style={{ animationDelay: `${index * 90}ms` }}
              >
                <line
                  stroke={rising ? "#d9e0c7" : "#aeb4ba"}
                  strokeWidth="2"
                  x1={x}
                  x2={x}
                  y1={178 - high * 1.7}
                  y2={178 - low * 1.7}
                />
                <rect
                  fill={rising ? "#819653" : "#8d9399"}
                  height={height}
                  rx="2"
                  width="11"
                  x={x - 5.5}
                  y={top}
                />
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

export default async function HomePage() {
  const database = getDatabase();
  const [courses, batches] = await Promise.all([
    database.course.findMany({
      where: { active: true },
      take: 3,
      orderBy: { title: "asc" },
    }),
    database.batch.findMany({
      where: {
        status: { in: ["ENROLLING", "ACTIVE"] },
        endsAt: { gte: new Date() },
      },
      include: { course: true },
      take: 3,
      orderBy: { startsAt: "asc" },
    }),
  ]);
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: "Drive the Market",
    url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
    description:
      "Structured trading education with secure post-class learning resources.",
    offers: courses.map((course) => ({
      "@type": "Course",
      name: course.title,
      description: course.description,
    })),
  };
  return (
    <div className="bg-background min-h-screen">
      <SiteHeader />
      <main>
        <script
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData).replaceAll("<", "\\u003c"),
          }}
          type="application/ld+json"
        />
        <section className="border-border relative isolate min-h-[720px] overflow-hidden border-b bg-olive-950">
          <Image
            alt="A trading student analysing market charts in a modern classroom"
            className="-z-20 object-cover object-[58%_center]"
            fill
            preload
            sizes="100vw"
            src="/trading-classroom-hero.png"
          />
          <div className="hero-photo-overlay absolute inset-0 -z-10" />
          <MarketChart />
          <div className="hero-orb absolute -top-32 -left-28 size-96 rounded-full border border-white/10" />
          <div className="hero-orb absolute -right-32 -bottom-40 size-[32rem] rounded-full border border-olive-200/15" />
          <div className="relative mx-auto grid min-h-[720px] max-w-7xl items-center gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[1.05fr_.95fr]">
            <div className="max-w-3xl rounded-[2rem] border border-white/15 bg-olive-950/72 p-7 text-white shadow-2xl backdrop-blur-md sm:p-10 lg:-ml-2">
              <Badge
                className="border-white/15 bg-white/10 text-olive-100"
                variant="outline"
              >
                Structured trading education
              </Badge>
              <h1 className="mt-6 text-5xl leading-[1.04] font-bold tracking-[-0.045em] sm:text-6xl">
                Learn live. Review clearly. Build disciplined market
                understanding.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-olive-100">
                Drive the Market connects instructor-led classes with ordered
                modules, reviewed study material, protected recordings, and
                visible learning progress.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Link
                  className={buttonVariants({ variant: "silver", size: "lg" })}
                  href="/courses"
                >
                  Explore courses <ArrowRight className="size-4" />
                </Link>
                <Link
                  className="inline-flex h-11 items-center justify-center rounded-[var(--radius-control)] border border-white/25 bg-white/10 px-5 text-sm font-bold text-white backdrop-blur transition hover:bg-white/20"
                  href="/login?callbackUrl=/portal"
                >
                  Student login
                </Link>
              </div>
              <div className="mt-9 flex flex-wrap gap-x-7 gap-y-3 border-t border-white/15 pt-6 text-sm text-olive-100">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="size-4" /> Instructor-led
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="size-4" /> Structured modules
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="size-4" /> Progress tracking
                </span>
              </div>
            </div>
            <div className="relative hidden min-h-[560px] lg:block" />
          </div>
          <div
            aria-hidden="true"
            className="hero-ticker absolute inset-x-0 bottom-0 border-t border-white/10 bg-olive-950/80 py-3 text-xs font-semibold tracking-[0.14em] text-olive-100 uppercase backdrop-blur"
          >
            <div className="mx-auto flex max-w-7xl justify-between gap-8 overflow-hidden px-5 sm:px-8">
              <span>Market structure</span>
              <span>Price action</span>
              <span>Risk awareness</span>
              <span>Trading psychology</span>
              <span className="hidden sm:inline">Disciplined review</span>
            </div>
          </div>
        </section>
        <section className="relative isolate overflow-hidden bg-olive-900 text-white">
          <div
            aria-hidden="true"
            className="section-depth-grid absolute inset-0 -z-10"
          />
          <svg
            aria-hidden="true"
            className="absolute inset-0 -z-10 size-full opacity-30"
            preserveAspectRatio="none"
            viewBox="0 0 1200 520"
          >
            <defs>
              <linearGradient id="depth-buy-fill" x1="0" x2="1" y1="0" y2="0">
                <stop offset="0%" stopColor="#819653" stopOpacity=".04" />
                <stop offset="100%" stopColor="#819653" stopOpacity=".48" />
              </linearGradient>
              <linearGradient id="depth-sell-fill" x1="0" x2="1" y1="0" y2="0">
                <stop offset="0%" stopColor="#b8bdc3" stopOpacity=".42" />
                <stop offset="100%" stopColor="#b8bdc3" stopOpacity=".03" />
              </linearGradient>
            </defs>
            <line
              stroke="#d9e0c7"
              strokeDasharray="8 12"
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
              x1="0"
              x2="1200"
              y1="260"
              y2="260"
            />
            <path
              className="section-depth-fill section-depth-buy"
              d="M0 462 H92 V430 H186 V397 H288 V362 H390 V326 H496 V292 H600 V260 L600 520 H0 Z"
              fill="url(#depth-buy-fill)"
            />
            <path
              className="section-depth-line section-depth-line-buy"
              d="M0 462 H92 V430 H186 V397 H288 V362 H390 V326 H496 V292 H600 V260"
              fill="none"
              stroke="#a8b78a"
              strokeLinejoin="round"
              strokeWidth="4"
              vectorEffect="non-scaling-stroke"
            />
            <path
              className="section-depth-fill section-depth-sell"
              d="M600 260 H704 V292 H810 V326 H912 V362 H1014 V397 H1108 V430 H1200 V462 L1200 520 H600 Z"
              fill="url(#depth-sell-fill)"
            />
            <path
              className="section-depth-line section-depth-line-sell"
              d="M600 260 H704 V292 H810 V326 H912 V362 H1014 V397 H1108 V430 H1200 V462"
              fill="none"
              stroke="#c9cdd1"
              strokeLinejoin="round"
              strokeWidth="4"
              vectorEffect="non-scaling-stroke"
            />
            <circle
              className="section-depth-point"
              cx="600"
              cy="260"
              fill="#eef1e5"
              r="9"
            />
            <circle
              className="section-depth-ring"
              cx="600"
              cy="260"
              fill="none"
              opacity=".5"
              r="22"
              stroke="#eef1e5"
              strokeWidth="2"
            />
          </svg>
          <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-20 sm:px-8 lg:grid-cols-2">
            <div className="relative">
              <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] border border-white/10 shadow-2xl">
                <Image
                  alt="An instructor guiding learners through a printed market chart"
                  className="object-cover"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  src="/market-analysis-session.png"
                />
                <div className="absolute inset-0 ring-1 ring-white/10 ring-inset" />
              </div>
            </div>
            <div className="lg:pl-8">
              <Badge
                className="border-white/20 bg-white/10 text-olive-100"
                variant="outline"
              >
                Market thinking in motion
              </Badge>
              <h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
                See how price moves. Learn why discipline matters.
              </h2>
              <p className="mt-5 max-w-xl text-lg leading-8 text-olive-100">
                Work through chart structure, market context, and risk concepts
                with instructors—then revisit every lesson in a clear sequence.
              </p>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/7 p-5">
                  <Activity className="size-6 text-olive-200" />
                  <p className="mt-4 font-bold">Chart-led practice</p>
                  <p className="mt-2 text-sm leading-6 text-olive-100">
                    Turn market movement into repeatable observation.
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/7 p-5">
                  <CheckCircle2 className="size-6 text-olive-200" />
                  <p className="mt-4 font-bold">Guided review</p>
                  <p className="mt-2 text-sm leading-6 text-olive-100">
                    Return to notes and recordings after each class.
                  </p>
                </div>
              </div>
              <p className="text-silver-200 mt-6 text-xs leading-5">
                Educational illustrations only. Charts do not represent live
                prices or investment recommendations.
              </p>
            </div>
          </div>
        </section>
        <section className="border-border border-b bg-white">
          <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
            <div className="grid gap-8 lg:grid-cols-[.72fr_1.28fr] lg:gap-16">
              <div>
                <div className="flex size-12 items-center justify-center rounded-2xl bg-olive-100 text-olive-800">
                  <BookOpenCheck className="size-6" />
                </div>
                <p className="mt-6 text-xs font-bold tracking-[0.18em] text-olive-700 uppercase">
                  Current programs
                </p>
                <h2 className="mt-4 text-3xl font-bold tracking-tight text-olive-950 sm:text-4xl">
                  Courses designed as connected learning journeys.
                </h2>
                <p className="text-muted-foreground mt-5 max-w-md leading-7">
                  Start with a focused foundation and progress through an
                  ordered learning path built for practical understanding.
                </p>
                <Link
                  className={`${buttonVariants({ variant: "outline" })} mt-7`}
                  href="/courses"
                >
                  View all courses <ArrowRight className="size-4" />
                </Link>
              </div>
              <div className="divide-y divide-olive-200 border-y border-olive-200">
                {courses.map((course, index) => (
                  <article
                    className="group grid gap-5 py-7 sm:grid-cols-[3.5rem_1fr_auto] sm:items-center"
                    key={course.id}
                  >
                    <span className="text-3xl font-semibold text-olive-300">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <h3 className="text-xl font-bold text-olive-950">
                        {course.title}
                      </h3>
                      <p className="text-muted-foreground mt-2 line-clamp-2 leading-6">
                        {course.description}
                      </p>
                    </div>
                    <Link
                      aria-label={`Ask about ${course.title}`}
                      className="grid size-11 place-items-center rounded-full border border-olive-300 text-olive-800 transition group-hover:border-olive-700 group-hover:bg-olive-700 group-hover:text-white"
                      href={`/contact?course=${course.id}`}
                    >
                      <ArrowRight className="size-4" />
                    </Link>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>
        <section className="relative overflow-hidden bg-olive-100">
          <div className="absolute top-0 right-0 h-full w-1/3 bg-[image:var(--gradient-silver)] opacity-35" />
          <div className="relative mx-auto max-w-7xl px-5 py-20 sm:px-8">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <p className="text-xs font-bold tracking-[0.18em] text-olive-700 uppercase">
                  Upcoming learning
                </p>
                <h2 className="mt-4 text-3xl font-bold tracking-tight text-olive-950 sm:text-4xl">
                  Current and enrolling batches
                </h2>
              </div>
              <Link className={buttonVariants()} href="/batches">
                See batch details <ArrowRight className="size-4" />
              </Link>
            </div>
            <div className="mt-10 grid gap-5 lg:grid-cols-2">
              {batches.map((batch) => (
                <article
                  className="grid overflow-hidden rounded-3xl border border-olive-200 bg-white shadow-[var(--shadow-card)] sm:grid-cols-[9rem_1fr]"
                  key={batch.id}
                >
                  <div className="flex flex-col items-center justify-center bg-olive-900 px-5 py-7 text-center text-white">
                    <span className="text-xs font-bold tracking-[0.16em] text-olive-200 uppercase">
                      {batch.startsAt.toLocaleDateString("en-IN", {
                        month: "short",
                      })}
                    </span>
                    <span className="mt-1 text-5xl leading-none font-semibold">
                      {batch.startsAt.getDate()}
                    </span>
                    <span className="mt-2 text-xs text-olive-100">
                      {batch.startsAt.getFullYear()}
                    </span>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 text-xs font-bold text-olive-700">
                      <CalendarDays className="size-4" /> Enrolling now
                    </div>
                    <h3 className="mt-4 text-xl font-bold text-olive-950">
                      {batch.name}
                    </h3>
                    <p className="text-muted-foreground mt-2 text-sm">
                      {batch.course.title}
                    </p>
                    <p className="mt-5 text-sm font-semibold text-olive-900">
                      Starts {batch.startsAt.toLocaleDateString("en-IN")}
                    </p>
                  </div>
                </article>
              ))}
              {!batches.length ? (
                <p className="text-muted-foreground rounded-3xl border border-olive-200 bg-white p-7">
                  New batch schedules will be announced soon.
                </p>
              ) : null}
            </div>
          </div>
        </section>
        <section className="mx-auto grid max-w-7xl gap-8 px-5 py-20 text-center sm:px-8">
          <h2 className="text-3xl font-bold text-olive-950">
            Ready to find the right course?
          </h2>
          <p className="text-muted-foreground mx-auto max-w-xl">
            Speak with the institution about the learning approach, upcoming
            dates, and suitability for your experience level.
          </p>
          <Link
            className={`${buttonVariants({ size: "lg" })} mx-auto`}
            href="/contact"
          >
            Contact Drive the Market
          </Link>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
