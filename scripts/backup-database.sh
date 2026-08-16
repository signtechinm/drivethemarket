#!/usr/bin/env sh
set -eu

target=${1:-}
if [ -z "$target" ] || [ "$target" = "/" ]; then
  echo "Usage: npm run db:backup -- /explicit/path/trade-tuter.dump" >&2
  exit 1
fi
if [ -z "${DATABASE_URL:-}" ]; then
  echo "DATABASE_URL is required." >&2
  exit 1
fi

native_database_url=$(printf '%s' "$DATABASE_URL" | sed 's/[?&]schema=[^&]*//')
pg_dump --format=custom --no-owner --no-privileges --file="$target" "$native_database_url"
echo "Encrypted storage and retention must now be applied to: $target"
