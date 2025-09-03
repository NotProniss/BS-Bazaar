#!/bin/bash

# BS-Bazaar Database Backup Script
# Backs up all critical databases with timestamp

set -e  # Exit on any error

# Color codes for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🗄️  BS-Bazaar Database Backup Script${NC}"
echo "=================================="

# Get current timestamp
TIMESTAMP=$(date +"%Y%m%d-%H%M%S")
BACKUP_DIR="/home/proniss/BS-Bazaar/backups"
DATA_DIR="/home/proniss/BS-Bazaar/server/data"

# Create backup directory if it doesn't exist
echo -e "${BLUE}📁 Creating backup directory...${NC}"
mkdir -p "$BACKUP_DIR"

# Function to backup a file
backup_file() {
    local file=$1
    local description=$2
    
    if [ -f "$DATA_DIR/$file" ]; then
        echo -e "${BLUE}💾 Backing up $description...${NC}"
        cp "$DATA_DIR/$file" "$BACKUP_DIR/${file%.db}-backup-$TIMESTAMP.db"
        echo -e "${GREEN}✅ $description backed up successfully${NC}"
    else
        echo -e "${YELLOW}⚠️  $file not found, skipping...${NC}"
    fi
}

echo -e "${BLUE}📊 Starting database backup...${NC}"

# Backup marketplace database (listings, users, admins)
backup_file "marketplace.db" "Marketplace Database (listings & users)"

# Backup sessions database  
backup_file "sessions.db" "Sessions Database (user sessions)"

# Backup items database
backup_file "items.db" "Items Database (game items)"

# Also backup the items.json file
if [ -f "$DATA_DIR/items.json" ]; then
    echo -e "${BLUE}💾 Backing up Items JSON data...${NC}"
    cp "$DATA_DIR/items.json" "$BACKUP_DIR/items-backup-$TIMESTAMP.json"
    echo -e "${GREEN}✅ Items JSON backed up successfully${NC}"
fi

# Create a comprehensive backup archive
echo -e "${BLUE}📦 Creating comprehensive backup archive...${NC}"
tar -czf "$BACKUP_DIR/bs-bazaar-complete-backup-$TIMESTAMP.tar.gz" -C "$DATA_DIR" .
echo -e "${GREEN}✅ Complete backup archive created${NC}"

# Show backup summary
echo ""
echo -e "${GREEN}🎉 Backup Complete!${NC}"
echo "=================================="
echo -e "${BLUE}Backup Location:${NC} $BACKUP_DIR"
echo -e "${BLUE}Timestamp:${NC} $TIMESTAMP"
echo ""
echo -e "${BLUE}Backed up files:${NC}"
ls -lh "$BACKUP_DIR"/*$TIMESTAMP*

# Show disk usage
echo ""
echo -e "${BLUE}💽 Backup disk usage:${NC}"
du -sh "$BACKUP_DIR"

echo ""
echo -e "${GREEN}📋 Backup Summary:${NC}"
echo "• Marketplace DB: Contains all user listings, admin users"
echo "• Sessions DB: Contains user login sessions"  
echo "• Items DB: Contains game item data"
echo "• Items JSON: Contains item metadata"
echo "• Complete Archive: Full backup of entire data directory"
echo ""
echo -e "${YELLOW}💡 Tip: Keep these backups safe! They contain all your user data.${NC}"
