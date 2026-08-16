# Drive the Market — Phase 3 Identity and Authorization

**Status:** Internally complete  
**Completed:** 15 August 2026  
**Next phase:** Phase 4 — Course, syllabus, and batch management

## Delivered capabilities

### Authentication

- Auth.js/NextAuth credential authentication
- Secure bcrypt password verification using cost factor 12
- JWT sessions limited to 15 minutes
- Branded login and logout flows
- Generic password-reset requests that prevent account enumeration
- Single-use, SHA-256-hashed password-reset tokens with 30-minute expiry
- Single-use, SHA-256-hashed invitation tokens with 72-hour expiry
- Strong password policy with length and character-class requirements
- Invitation acceptance activates and verifies an invited account

### Route and account protection

- Next.js proxy protects `/admin` and `/portal`
- Student-only accounts are denied administration access
- Protected server layouts recheck the current database account status
- Suspended and deactivated accounts lose protected server access
- Authentication-sensitive events create audit records

### Role-based permissions

- Server-side `requirePermission` guard
- Permission-aware administration navigation
- Seven seeded system roles
- Fourteen granular permissions
- Role-to-permission defaults based on the Phase 0 matrix
- Custom role creation with selected permissions
- Role assignment to existing users

### User lifecycle administration

- User list with account status and role badges
- User invitation with initial role
- Development-only invitation link preview
- Account suspension and reactivation
- Self-suspension prevention
- User role assignment
- Identity and security activity dashboard

## System roles

- Super Admin
- Administrator
- Academic Manager
- Instructor
- Content Manager
- Website Editor
- Student

## Development administrator

Local seed credentials:

```text
Email: admin@tradetuter.local
Password: TradeTuter-Dev-2026!
```

These credentials are development-only and must never be used in preview or production environments.

## Database update

Migration `20260815163000_phase3_identity` adds password lifecycle fields and invitation/reset tokens. The local PostgreSQL database and role were created, both migrations were applied, and seed data completed successfully.

## Security notes

- Raw lifecycle tokens are never stored in PostgreSQL.
- Development links are returned only in non-production form state and are not logged.
- Production invitation and reset delivery will use the Phase 8 email adapter.
- Database account status is authoritative for protected page/action access.
- JWT claims support navigation but do not replace server-side authorization.
- Secret and authorization fields remain redacted from structured logs.

## Runtime verification

- `/login` and `/forgot-password` returned HTTP 200.
- Anonymous `/admin` redirected to login.
- `/api/health` returned HTTP 200 with database reachable.
- Seeded administrator credential sign-in succeeded.
- Authenticated `/admin` returned HTTP 200.
- Temporary test cookies were removed after validation.
