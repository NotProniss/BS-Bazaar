const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');

const DB_PATH = path.join(__dirname, 'data', 'marketplace.db');
const JSON_PATH = path.join(__dirname, 'data', 'listings.json');

const FIELDS = [
  'item', 'price', 'quantity', 'type', 'category', 'seller', 'sellerId', 'sellerAvatar',
  'timestamp', 'IGN', 'priceMode', 'combatCategory', 'combatLevel', 'combatStrength',
  'combatDmgType', 'combatDmgPercent', 'combatImpact', 'combatCryonae', 'combatArborae',
  'combatTempestae', 'combatInfernae', 'combatNecromae'
];

(async () => {
  const db = await open({ filename: DB_PATH, driver: sqlite3.Database });
  const listings = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));

  for (const entry of listings) {
    // Skip if entry is not an object or is empty
    if (typeof entry !== 'object' || !entry) continue;

    // Map contactInfo to IGN, fill missing fields with empty string
    const values = FIELDS.map(field => {
      if (field === 'IGN') return entry.contactInfo || '';
      return entry[field] !== undefined && entry[field] !== null ? entry[field] : '';
    });

    // Insert into DB
    await db.run(
      `INSERT INTO listings (${FIELDS.join(',')}) VALUES (${FIELDS.map(() => '?').join(',')})`,
      values
    );
  }

  await db.close();
  console.log('Import complete!');
})();