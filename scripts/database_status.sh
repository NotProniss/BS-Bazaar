#!/bin/bash

# BS-Bazaar Database Status Check
# Shows current database statistics

# Color codes for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}📊 BS-Bazaar Database Status${NC}"
echo "=========================="

DATA_DIR="/home/proniss/BS-Bazaar/server/data"

# Check marketplace database
if [ -f "$DATA_DIR/marketplace.db" ]; then
    echo -e "${GREEN}✅ Marketplace Database${NC}"
    echo "   📝 Total Listings: $(sqlite3 "$DATA_DIR/marketplace.db" "SELECT COUNT(*) FROM listings;")"
    echo "   👥 Total Admins: $(sqlite3 "$DATA_DIR/marketplace.db" "SELECT COUNT(*) FROM admins;")"
    echo "   📅 Database Size: $(du -h "$DATA_DIR/marketplace.db" | cut -f1)"
    echo ""
else
    echo -e "${YELLOW}⚠️  Marketplace Database: NOT FOUND${NC}"
fi

# Check sessions database  
if [ -f "$DATA_DIR/sessions.db" ]; then
    echo -e "${GREEN}✅ Sessions Database${NC}"
    echo "   📅 Database Size: $(du -h "$DATA_DIR/sessions.db" | cut -f1)"
    echo ""
else
    echo -e "${YELLOW}⚠️  Sessions Database: NOT FOUND${NC}"
fi

# Check items database
if [ -f "$DATA_DIR/items.db" ]; then
    echo -e "${GREEN}✅ Items Database${NC}"
    echo "   🎮 Total Items: $(sqlite3 "$DATA_DIR/items.db" "SELECT COUNT(*) FROM items;")"
    echo "   📅 Database Size: $(du -h "$DATA_DIR/items.db" | cut -f1)"
    echo ""
else
    echo -e "${YELLOW}⚠️  Items Database: NOT FOUND${NC}"
fi

# Show recent backups
BACKUP_DIR="/home/proniss/BS-Bazaar/backups"
if [ -d "$BACKUP_DIR" ]; then
    echo -e "${BLUE}💾 Recent Backups${NC}"
    echo "   📁 Backup Directory: $BACKUP_DIR"
    echo "   💽 Total Backup Size: $(du -sh "$BACKUP_DIR" | cut -f1)"
    echo ""
    echo "   📋 Latest 3 Backups:"
    ls -lt "$BACKUP_DIR"/*marketplace-backup*.db 2>/dev/null | head -3 | while read line; do
        echo "     $line"
    done
fi
