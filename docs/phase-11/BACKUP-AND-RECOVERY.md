# Backup and Recovery Procedure

## Policy baseline

- Managed PostgreSQL point-in-time recovery plus a daily encrypted logical backup.
- Private object storage versioning and lifecycle protection.
- Backup retention baseline: 35 daily, 12 monthly, and one pre-release snapshot.
- Backups must use a different failure domain from the primary service.
- Target objectives: RPO 24 hours or better; RTO 4 hours or better.

## Database backup

```bash
npm run db:backup -- /explicit/encrypted/path/trade-tuter-YYYYMMDD.dump
```

Record the timestamp, database environment, file checksum, encrypted storage location, operator, and retention date. Never place a backup in the repository or public web root.

## Restore rehearsal

1. Create an isolated empty recovery database.
2. Point `DATABASE_URL` only to that isolated target.
3. Confirm the target name and execute:

```bash
CONFIRM_RESTORE=TRADE_TUTER npm run db:restore -- /explicit/path/trade-tuter-YYYYMMDD.dump
npm run db:deploy
```

4. Check `/api/health`, row counts, administrator login, one student enrolment, one released material, and one report export.
5. Record duration and discrepancies, then destroy the isolated recovery environment according to policy.

The restore script deliberately refuses to run without an existing dump, `DATABASE_URL`, and the explicit confirmation value.

## Internal rehearsal evidence

On 15 August 2026, the local PostgreSQL database was dumped in custom format, restored into an isolated `trade_tuter_phase11_restore` database, and queried successfully. All four seeded users were present. The isolated database and temporary dump were then removed. Production restore evidence must be repeated using the managed provider before launch.
