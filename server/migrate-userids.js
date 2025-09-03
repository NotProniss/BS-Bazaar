#!/usr/bin/env node

/**
 * Migration Script: Fix userId fields in listings table
 * 
 * This script fixes two issues:
 * 1. Listings that have Discord IDs in userId field instead of database IDs
 * 2. Legacy listings that have no userId but can be matched by seller name
 * 
 * Usage: node migrate-userids.js [database-path]
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = process.argv[2] || path.join(__dirname, 'data', 'marketplace.db');

console.log(`🔄 Starting userId migration for database: ${dbPath}`);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error opening database:', err.message);
    process.exit(1);
  }
  console.log('✅ Connected to SQLite database');
});

// Promisify database methods
const dbGet = (sql, params = []) => new Promise((resolve, reject) => {
  db.get(sql, params, (err, row) => err ? reject(err) : resolve(row));
});

const dbAll = (sql, params = []) => new Promise((resolve, reject) => {
  db.all(sql, params, (err, rows) => err ? reject(err) : resolve(rows));
});

const dbRun = (sql, params = []) => new Promise((resolve, reject) => {
  db.run(sql, params, function(err) {
    err ? reject(err) : resolve({ changes: this.changes, lastID: this.lastID });
  });
});

async function migrate() {
  try {
    console.log('\n📊 Analyzing current state...');
    
    // Check total listings
    const totalListings = await dbGet('SELECT COUNT(*) as count FROM listings');
    console.log(`   Total listings: ${totalListings.count}`);
    
    // Check listings with potential Discord IDs in userId
    const discordIdListings = await dbAll(`
      SELECT l.id as listing_id, l.userId as discord_id, u.id as correct_user_id, u.username
      FROM listings l 
      JOIN users u ON l.userId = u.discord_id 
      WHERE LENGTH(l.userId) > 10 AND l.userId NOT LIKE '%@%'
    `);
    
    console.log(`   Listings with Discord IDs in userId: ${discordIdListings.length}`);
    
    // Check legacy listings without userId
    const legacyListings = await dbAll(`
      SELECT l.id as listing_id, l.seller, u.id as user_id, u.username
      FROM listings l
      JOIN users u ON LOWER(l.seller) = LOWER(u.username)
      WHERE l.userId IS NULL OR l.userId = ''
    `);
    
    console.log(`   Legacy listings without userId: ${legacyListings.length}`);
    
    if (discordIdListings.length === 0 && legacyListings.length === 0) {
      console.log('\n✅ No migration needed - all listings have correct userIds!');
      return;
    }
    
    console.log('\n🔧 Starting migration...');
    
    // Fix Discord ID listings
    if (discordIdListings.length > 0) {
      console.log(`\n   Fixing ${discordIdListings.length} listings with Discord IDs...`);
      
      for (const listing of discordIdListings) {
        await dbRun(
          'UPDATE listings SET userId = ? WHERE id = ?',
          [listing.correct_user_id, listing.listing_id]
        );
        console.log(`     ✓ Listing ${listing.listing_id}: Discord ID → User ID ${listing.correct_user_id} (${listing.username})`);
      }
    }
    
    // Fix legacy listings
    if (legacyListings.length > 0) {
      console.log(`\n   Populating userId for ${legacyListings.length} legacy listings...`);
      
      for (const listing of legacyListings) {
        await dbRun(
          'UPDATE listings SET userId = ? WHERE id = ?',
          [listing.user_id, listing.listing_id]
        );
        console.log(`     ✓ Listing ${listing.listing_id}: "${listing.seller}" → User ID ${listing.user_id}`);
      }
    }
    
    console.log('\n✅ Migration completed successfully!');
    
    // Verify results
    console.log('\n📊 Post-migration verification...');
    const fixedListings = await dbGet('SELECT COUNT(*) as count FROM listings WHERE userId IS NOT NULL AND userId != ""');
    console.log(`   Listings with proper userId: ${fixedListings.count}/${totalListings.count}`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    db.close((err) => {
      if (err) {
        console.error('❌ Error closing database:', err.message);
      } else {
        console.log('✅ Database connection closed');
      }
    });
  }
}

migrate();
