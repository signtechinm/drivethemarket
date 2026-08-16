#!/usr/bin/env sh
set -eu

npm run launch:check
npm run db:deploy
npm run build
echo "Release candidate built. Deploy the immutable artifact, then run npm run smoke:production."
