#!/bin/bash
# Daily SQLite backup to S3
# Copies the database to S3 with a timestamped filename
# Keeps the last 30 days of backups

set -e

DB_PATH="/home/ec2-user/data/payload.db"
S3_BUCKET="hlp-dev-photos-335804564725-us-east-2-an"
S3_PREFIX="backups/db"
TIMESTAMP=$(date +%Y-%m-%d_%H%M)
BACKUP_FILE="/tmp/payload-backup-${TIMESTAMP}.db"

echo "[$(date)] Starting backup..."

# Use sqlite3 .backup for a safe copy (handles WAL mode correctly)
sqlite3 "$DB_PATH" ".backup '$BACKUP_FILE'"

# Upload to S3
aws s3 cp "$BACKUP_FILE" "s3://${S3_BUCKET}/${S3_PREFIX}/payload-${TIMESTAMP}.db" --quiet

# Clean up local temp file
rm -f "$BACKUP_FILE"

# Delete backups older than 30 days from S3
aws s3 ls "s3://${S3_BUCKET}/${S3_PREFIX}/" | while read -r line; do
  file_date=$(echo "$line" | awk '{print $1}')
  file_name=$(echo "$line" | awk '{print $4}')
  if [ -n "$file_date" ] && [ -n "$file_name" ]; then
    cutoff=$(date -d "30 days ago" +%Y-%m-%d 2>/dev/null || date -v-30d +%Y-%m-%d)
    if [[ "$file_date" < "$cutoff" ]]; then
      aws s3 rm "s3://${S3_BUCKET}/${S3_PREFIX}/${file_name}" --quiet
      echo "  Deleted old backup: $file_name"
    fi
  fi
done

echo "[$(date)] Backup complete: payload-${TIMESTAMP}.db"
