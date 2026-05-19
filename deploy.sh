#!/bin/bash
# Deploy Holy Land Photos to EC2
# Usage: ./deploy.sh

set -euo pipefail

EC2_HOST="18.220.101.13"
EC2_KEY="$HOME/.ssh/hlp-ec2-key.pem"
EC2_USER="ec2-user"

echo "🚀 Deploying Holy Land Photos to EC2..."
echo ""

# Push any uncommitted changes first
if [ -n "$(git status --porcelain)" ]; then
  echo "⚠️  You have uncommitted changes. Commit and push first."
  exit 1
fi

# Make sure we're pushed
LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/main 2>/dev/null || echo "")
if [ "$LOCAL" != "$REMOTE" ]; then
  echo "⚠️  Local commits not pushed. Run 'git push origin main' first."
  exit 1
fi

echo "📦 Deploying commit: $(git log --oneline -1)"
echo ""

# Local pre-flight build. Catches type/config errors here, BEFORE we
# SSH out and start mutating EC2 state. The auto-rollback on EC2 covers
# us if this is bypassed (or if the local build passes but EC2 build
# differs), but catching it locally is faster and avoids a deploy churn.
# Skip with: SKIP_LOCAL_BUILD=1 ./deploy.sh
if [ "${SKIP_LOCAL_BUILD:-0}" != "1" ]; then
  echo "🔍 Local pre-flight build..."
  # The middleware imports redirect-maps.generated.ts (gitignored).
  # Generate from local DB if available, otherwise stub it so the build
  # can at least typecheck the import.
  if [ -f data/payload.db ] || [ -L data/payload.db ]; then
    python3 scripts/generate_redirect_maps.py > /dev/null
  elif [ ! -f src/redirect-maps.generated.ts ]; then
    cat > src/redirect-maps.generated.ts <<'STUB'
export const SECTION_SLUGS: Readonly<Record<number, string>> = {}
export const PAGE_SLUGS: Readonly<Record<number, string>> = {}
STUB
  fi

  if ! npm run build 2>&1 | tail -8; then
    echo ""
    echo "❌ Local build failed. Fix the error above, then re-run ./deploy.sh"
    echo "   (Nothing was deployed; production is untouched.)"
    exit 1
  fi
  echo "✅ Local build passed."
  echo ""
fi

ssh -i "$EC2_KEY" "$EC2_USER@$EC2_HOST" 'bash -s' << 'REMOTE'
set -euo pipefail

cd /home/ec2-user/app

# Capture the currently-deployed commit so we can roll back if anything below
# fails. Saves us from a known failure mode where a bad next.config.mjs (e.g.
# an unsupported `experimental` flag) is loaded at server startup and prevents
# the app from booting at all.
PREV_COMMIT=$(git rev-parse HEAD)
echo "↩  Previous commit (rollback target): $PREV_COMMIT"

cleanup_failed_deploy() {
  local reason="$1"
  echo ""
  echo "❌ $reason"
  echo "↩  Rolling back to $PREV_COMMIT..."
  git reset --hard "$PREV_COMMIT" 2>&1 | tail -3
  python3 scripts/generate_redirect_maps.py 2>&1 | tail -3 || true
  npm run build 2>&1 | tail -3 || {
    echo "⚠️  Rollback build also failed — site may stay down. Investigate manually."
    pm2 start hlp 2>/dev/null || true
    exit 2
  }
  pm2 restart hlp
  echo "↩  Rolled back. Site should be on the previous commit."
  exit 1
}

echo "📥 Pulling latest code..."
git pull origin main 2>&1 | tail -3

echo "📦 Installing dependencies..."
npm ci --production=false 2>&1 | tail -3

# Apply any new Payload migrations against the live DB BEFORE anything
# else that reads the schema (the redirect-map generator below queries
# `published`, which only exists after the migration runs). `npx payload
# migrate` is a no-op if everything is already applied. The `echo y |`
# answers Payload's one-time "you've used dev push mode in the past"
# warning that fires the first time migrate runs.
echo "🗄  Running Payload migrations..."
echo y | npx payload migrate 2>&1 | tail -8

echo "🗺  Regenerating middleware redirect maps from live DB..."
python3 scripts/generate_redirect_maps.py

echo "🔨 Building..."
if ! npm run build 2>&1 | tail -5; then
  cleanup_failed_deploy "Build failed."
fi

echo "⏸  Stopping app..."
pm2 stop hlp 2>/dev/null || true

echo "▶️  Starting app..."
pm2 start hlp
sleep 3

STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/)
if [ "$STATUS" = "200" ]; then
  LOAD=$(curl -s -o /dev/null -w "%{time_total}" http://localhost:3000/)
  echo ""
  echo "✅ Deploy successful! Site is live."
  echo "   Homepage: ${LOAD}s"
else
  cleanup_failed_deploy "Homepage returned HTTP $STATUS after restart."
fi
REMOTE

# Run the local QA smoke against the live site. The EC2 healthcheck above
# already caught the catastrophic case (homepage 5xx) and auto-rolled back
# if needed; this catches finer regressions like a broken redirect or a
# missing meta tag. Smoke failures here do NOT auto-rollback — they're
# loud but not action-taking, so you can decide whether to revert.
echo ""
if ./scripts/qa-smoke.sh; then
  echo ""
  echo "✅ Smoke passed."
else
  echo ""
  echo "⚠️  Smoke check found regressions (above). Site is up but something is off."
  echo "   To revert: git revert HEAD && git push origin main && ./deploy.sh"
  exit 1
fi
