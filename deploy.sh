#!/bin/bash
# Deploy Holy Land Photos to EC2
# Usage: ./deploy.sh

set -e

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

ssh -i "$EC2_KEY" "$EC2_USER@$EC2_HOST" 'bash -s' << 'REMOTE'
set -e

cd /home/ec2-user/app

echo "⏸  Stopping app..."
pm2 stop hlp 2>/dev/null || true

echo "📥 Pulling latest code..."
git pull origin main 2>&1 | tail -3

echo "📦 Installing dependencies..."
npm ci --production=false 2>&1 | tail -3

echo "🔨 Building..."
npm run build 2>&1 | tail -5

echo "▶️  Starting app..."
pm2 start hlp
sleep 3

STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/)
if [ "$STATUS" = "200" ]; then
  echo ""
  echo "✅ Deploy successful! Site is live."
  LOAD=$(curl -s -o /dev/null -w "%{time_total}" http://localhost:3000/)
  echo "   Homepage: ${LOAD}s"
else
  echo ""
  echo "❌ Deploy may have failed — homepage returned HTTP $STATUS"
  echo "   Check logs: pm2 logs hlp"
fi
REMOTE
