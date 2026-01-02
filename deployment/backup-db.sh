#!/bin/bash

###############################################################################
# Database Backup Script
#
# This script creates a backup of the PostgreSQL database
# Backups are stored with timestamps for easy identification
###############################################################################

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Configuration
APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKUP_DIR="$APP_DIR/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/inalogystics_$TIMESTAMP.sql"

# Retention policy (keep backups for 30 days)
RETENTION_DAYS=30

# Load environment variables
if [ -f "$APP_DIR/.env" ]; then
    export $(grep -v '^#' "$APP_DIR/.env" | xargs)
else
    echo -e "${RED}Error: .env file not found${NC}"
    exit 1
fi

# Parse DATABASE_URL to extract connection details
# Format: postgresql://user:password@host:port/database
DB_URL="$DATABASE_URL"

if [[ $DB_URL =~ postgresql://([^:]+):([^@]+)@([^:]+):([^/]+)/(.+) ]]; then
    DB_USER="${BASH_REMATCH[1]}"
    DB_PASS="${BASH_REMATCH[2]}"
    DB_HOST="${BASH_REMATCH[3]}"
    DB_PORT="${BASH_REMATCH[4]}"
    DB_NAME="${BASH_REMATCH[5]}"
else
    echo -e "${RED}Error: Could not parse DATABASE_URL${NC}"
    exit 1
fi

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

echo -e "${GREEN}Creating database backup...${NC}"
echo "Database: $DB_NAME"
echo "Host: $DB_HOST:$DB_PORT"
echo "Backup file: $BACKUP_FILE"
echo ""

# Create backup using pg_dump
PGPASSWORD="$DB_PASS" pg_dump \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -U "$DB_USER" \
    -d "$DB_NAME" \
    -F c \
    -f "$BACKUP_FILE" \
    --no-owner \
    --no-acl

if [ $? -eq 0 ]; then
    # Compress the backup
    gzip "$BACKUP_FILE"
    BACKUP_FILE="${BACKUP_FILE}.gz"

    # Get file size
    BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)

    echo -e "${GREEN}✓ Backup created successfully${NC}"
    echo "File: $BACKUP_FILE"
    echo "Size: $BACKUP_SIZE"

    # Clean up old backups
    echo ""
    echo -e "${YELLOW}Cleaning up old backups (older than $RETENTION_DAYS days)...${NC}"
    find "$BACKUP_DIR" -name "inalogystics_*.sql.gz" -mtime +$RETENTION_DAYS -delete

    REMAINING_BACKUPS=$(ls -1 "$BACKUP_DIR"/inalogystics_*.sql.gz 2>/dev/null | wc -l)
    echo -e "${GREEN}✓ Cleanup complete. $REMAINING_BACKUPS backup(s) retained${NC}"
else
    echo -e "${RED}✗ Backup failed${NC}"
    exit 1
fi
