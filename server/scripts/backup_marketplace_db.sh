#!/bin/sh
# backup_marketplace_db.sh
# Backs up marketplace.db to marketplace.db.bak every hour

SRC="/app/data/marketplace.db"
DEST="/app/data/marketplace.db.bak"

if [ -f "$SRC" ]; then
  cp "$SRC" "$DEST"
  echo "[$(date)] marketplace.db backed up to marketplace.db.bak"
else
  echo "[$(date)] marketplace.db not found, skipping backup"
fi
