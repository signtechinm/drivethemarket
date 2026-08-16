#!/usr/bin/env sh
set -eu

source_file=${1:-}
if [ -z "$source_file" ] || [ ! -f "$source_file" ]; then
  echo "Usage: CONFIRM_RESTORE=TRADE_TUTER npm run db:restore -- /explicit/path/trade-tuter.dump" >&2
  exit 1
fi
if [ "${CONFIRM_RESTORE:-}" != "TRADE_TUTER" ]; then
  echo "Restore refused. Set CONFIRM_RESTORE=TRADE_TUTER after verifying the target database." >&2
  exit 1
fi
if [ -z "${DATABASE_URL:-}" ]; then
  echo "DATABASE_URL is required." >&2
  exit 1
fi

native_database_url=$(printf '%s' "$DATABASE_URL" | sed 's/[?&]schema=[^&]*//')
pg_restore --clean --if-exists --no-owner --no-privileges --dbname="$native_database_url" "$source_file"
echo "Restore completed. Run migrations, health checks, and workflow smoke tests."
