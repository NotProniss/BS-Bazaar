# Database Migration Guide

## Overview
When deploying to production, the database will automatically migrate to support the new userId system. This ensures all existing Discord users continue working seamlessly.

## What Gets Migrated

### 1. User Table
- Automatically adds missing columns for email authentication
- Existing Discord users keep all their data
- New fields: `email`, `password_hash`, `email_verified`, etc.

### 2. Listings Table
- Adds `userId` column if missing
- Fixes listings with Discord IDs in `userId` field → converts to database IDs
- Populates missing `userId` fields for legacy listings
- Ensures all listings have proper permanent user identification

## Automatic Migration (Built-in)
The server automatically runs migration on startup:

```javascript
// Runs automatically when server starts
- Adds missing table columns
- Fixes Discord ID → Database ID mapping
- Populates legacy userId fields
```

## Manual Migration (Optional)
For extra safety, you can run the standalone migration script:

```bash
# Backup first
cp marketplace.db marketplace.db.backup

# Run migration
node migrate-userids.js marketplace.db

# Verify results
```

## Post-Migration Benefits

### For Existing Discord Users:
- ✅ Continue logging in exactly the same way
- ✅ Get permanent user ID system automatically
- ✅ Username changes sync all their listings
- ✅ Better security and abuse prevention

### For New Features:
- ✅ Email authentication support
- ✅ Permanent user identification
- ✅ Automatic listing ownership tracking
- ✅ Discord bot API compatibility maintained

## Zero Downtime Deployment
1. Upload new code
2. Start server → automatic migration runs
3. All existing users continue working
4. New features available immediately

## Rollback Plan
If anything goes wrong:
```bash
# Stop server
docker-compose down

# Restore backup
cp marketplace.db.backup marketplace.db

# Start with old version
# (But this shouldn't be needed!)
```

## Verification
After deployment, verify everything works:
- Existing Discord users can log in
- New listings have proper userId
- Username changes update all listings
- IGN API endpoint still works for Discord bot
