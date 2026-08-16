# Drive the Market

Drive the Market is a Next.js application for trading education institutions. It combines a public website, administration portal, and protected student-learning portal.

## Technology

- Next.js App Router and React
- TypeScript in strict mode
- Tailwind CSS and shadcn/ui conventions
- PostgreSQL and Prisma ORM
- Vitest and Testing Library
- ESLint and Prettier

## Local setup

### Requirements

- Node.js 24
- npm 11 or later
- PostgreSQL

### Installation

```bash
npm ci
cp .env.example .env.local
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
```

Open `http://localhost:3000`.

The seed creates these development-only accounts:

```text
admin@tradetuter.local
TradeTuter-Dev-2026!

instructor@tradetuter.local
TradeTuter-Dev-2026!

student@tradetuter.local
TradeTuter-Dev-2026!
```

### Environment

Never commit `.env` or `.env.local`. Use [.env.example](.env.example) as the required-variable reference. Provider placeholders are intentionally local/mock in Phase 2.

### Quality checks

```bash
npm run validate
```

Individual checks:

```bash
npm run format:check
npm run lint
npm run typecheck
npm run test
npm run build
```

### Database workflow

```bash
npm run db:generate
npm run db:migrate -- --name describe_change
npm run db:seed
```

Production deployments use `npm run db:deploy` rather than `migrate dev`.

### Production release

```bash
npm run launch:check
npm run release:production
SMOKE_BASE_URL=https://your-domain.example npm run smoke:production
```

The repository includes a standalone [Dockerfile](Dockerfile). Production requires managed PostgreSQL, private S3-compatible storage, streaming mode, transactional email, monitoring, and scheduler credentials.

## Application routes

- `/` — Public Drive the Market website
- `/about`, `/faculty`, `/testimonials`, `/faq` — Editable institution content
- `/courses`, `/batches` — Public academic offerings
- `/contact` — Prospective-student enquiry form
- `/privacy`, `/terms` — Editable legal-information pages
- `/admin` — Administration shell
- `/admin/users` — Invitations, roles, and account status
- `/admin/roles` — Role and permission administration
- `/admin/courses` — Courses and versioned syllabus templates
- `/admin/batches` — Batch creation, curriculum copies, and class schedules
- `/admin/students` — Student registration, profiles, imports, and enrolments
- `/admin/materials` — Private materials, recordings, review, and release operations
- `/admin/communications` — Announcements, email outbox, retries, and expiry notices
- `/admin/website` — Public website content management
- `/admin/website/enquiries` — Prospective-student enquiry management
- `/admin/reports` — Operational, academic, engagement, and admissions reporting
- `/api/admin/reports/export` — Permission-protected filtered CSV reports
- `/admin/classes/[classId]/materials` — Class completion and controlled release workflow
- `/portal` — Student portal shell
- `/portal/courses/[enrolmentId]` — Ordered course, module, and class learning view
- `/portal/materials/[materialId]` — Protected resource viewer and progress tracking
- `/portal/profile` — Student account settings
- `/portal/notifications` — Targeted announcements, notifications, and channel preferences
- `/login` — Secure account login
- `/forgot-password` — Password recovery
- `/api/health` — Readiness check, including database connectivity

## Project documentation

- [Development plan](TRADE_TUTER_DEVELOPMENT_PLAN.md)
- [Delivery governance](docs/DELIVERY-GOVERNANCE.md)
- [Phase 0 discovery](docs/phase-0/README.md)
- [Phase 1 UX and brand](docs/phase-1/README.md)
- [Phase 2 engineering record](docs/phase-2/README.md)
- [Phase 3 identity and authorization](docs/phase-3/README.md)
- [Phase 4 academic management](docs/phase-4/README.md)
- [Phase 5 students and enrolments](docs/phase-5/README.md)
- [Phase 6 materials and controlled release](docs/phase-6/README.md)
- [Phase 7 student portal and progress](docs/phase-7/README.md)
- [Phase 8 announcements and notifications](docs/phase-8/README.md)
- [Phase 9 public website and CMS](docs/phase-9/README.md)
- [Phase 10 reporting and operational dashboards](docs/phase-10/README.md)
- [Phase 11 QA, security, and launch preparation](docs/phase-11/README.md)
- [Phase 12 production launch and stabilization](docs/phase-12/README.md)

## Security conventions

- All authorization is enforced on the server.
- Private storage keys are never exposed as permanent public URLs.
- Logs redact credentials and tokens.
- Runtime configuration is validated before protected infrastructure is used.
- Security headers are applied centrally in Next.js configuration.
