#!/bin/bash

# BS-Bazaar Database Restore Script
# Restores databases from backup with safety checks

set -e  # Exit on any error

# Color codes for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${RED}⚠️  BS-Bazaar Database Restore Script${NC}"
echo "===================================="
echo -e "${RED}WARNING: This will OVERWRITE your current databases!${NC}"
echo ""

BACKUP_DIR="/home/proniss/BS-Bazaar/backups"
DATA_DIR="/home/proniss/BS-Bazaar/server/data"

# List available backups
echo -e "${BLUE}📋 Available backups:${NC}"
ls -lt "$BACKUP_DIR"/*marketplace-backup*.db | head -5

echo ""
echo -e "${YELLOW}Please specify the backup timestamp (format: YYYYMMDD-HHMMSS):${NC}"
read -p "Timestamp: " TIMESTAMP

if [ -z "$TIMESTAMP" ]; then
    echo -e "${RED}❌ No timestamp provided. Exiting.${NC}"
    exit 1
fi

# Verify backup files exist
MARKETPLACE_BACKUP="$BACKUP_DIR/marketplace-backup-$TIMESTAMP.db"
SESSIONS_BACKUP="$BACKUP_DIR/sessions-backup-$TIMESTAMP.db"
ITEMS_BACKUP="$BACKUP_DIR/items-backup-$TIMESTAMP.db"

if [ ! -f "$MARKETPLACE_BACKUP" ]; then
    echo -e "${RED}❌ Marketplace backup not found: $MARKETPLACE_BACKUP${NC}"
    exit 1
fi

echo ""
echo -e "${RED}⚠️  FINAL WARNING: This will restore databases from backup $TIMESTAMP${NC}"
echo -e "${RED}⚠️  Current data will be LOST!${NC}"
echo ""
read -p "Type 'RESTORE' to confirm: " CONFIRM

if [ "$CONFIRM" != "RESTORE" ]; then
    echo -e "${YELLOW}📝 Restore cancelled.${NC}"
    exit 0
fi

echo ""
echo -e "${BLUE}🔄 Creating safety backup of current data...${NC}"
SAFETY_TIMESTAMP=$(date +"%Y%m%d-%H%M%S")
cp "$DATA_DIR/marketplace.db" "$BACKUP_DIR/marketplace-pre-restore-$SAFETY_TIMESTAMP.db"

echo -e "${BLUE}♻️  Restoring databases...${NC}"

# Stop the server first
echo -e "${BLUE}🛑 Stopping server...${NC}"
docker stop bs-bazaar-server || true

# Restore marketplace database
if [ -f "$MARKETPLACE_BACKUP" ]; then
    echo -e "${BLUE}📦 Restoring marketplace database...${NC}"
    cp "$MARKETPLACE_BACKUP" "$DATA_DIR/marketplace.db"
    echo -e "${GREEN}✅ Marketplace database restored${NC}"
fi

# Restore sessions database
if [ -f "$SESSIONS_BACKUP" ]; then
    echo -e "${BLUE}📦 Restoring sessions database...${NC}"
    cp "$SESSIONS_BACKUP" "$DATA_DIR/sessions.db"
    echo -e "${GREEN}✅ Sessions database restored${NC}"
fi

# Restore items database
if [ -f "$ITEMS_BACKUP" ]; then
    echo -e "${BLUE}📦 Restoring items database...${NC}"
    cp "$ITEMS_BACKUP" "$DATA_DIR/items.db"
    echo -e "${GREEN}✅ Items database restored${NC}"
fi

# Start the server
echo -e "${BLUE}🚀 Starting server...${NC}"
docker start bs-bazaar-server

echo ""
echo -e "${GREEN}🎉 Restore Complete!${NC}"
echo "================================"
echo -e "${BLUE}Restored from backup:${NC} $TIMESTAMP"
echo -e "${BLUE}Safety backup created:${NC} marketplace-pre-restore-$SAFETY_TIMESTAMP.db"
echo ""
echo -e "${YELLOW}💡 Please verify your data is correct in the application.${NC}"
