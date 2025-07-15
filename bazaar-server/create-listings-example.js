#!/usr/bin/env node

/**
 * BS Bazaar API - Listing Creation Example
 * This script demonstrates how to create listings programmatically using the API.
 */

const baseUrl = 'http://localhost:3001';

// Example function to create a listing
async function createListing(listingData) {
  try {
    console.log('🔄 Creating listing:', listingData.item);
    
    const response = await fetch(`${baseUrl}/api/listings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(listingData)
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Listing created successfully!');
      console.log(`   ID: ${result.listing.id}`);
      console.log(`   Item: ${result.listing.item}`);
      console.log(`   Price: ${result.listing.price} copper`);
      console.log(`   Type: ${result.listing.type}`);
      console.log(`   Seller: ${result.listing.seller}`);
      return result.listing;
    } else {
      console.log('❌ Error creating listing:', result.error);
      return null;
    }
  } catch (error) {
    console.log('❌ Request failed:', error.message);
    return null;
  }
}

// Example function to create multiple listings
async function createMultipleListings() {
  const listings = [
    {
      item: "Iron Sword",
      price: 15000,
      quantity: 1,
      type: "sell",
      seller: "WeaponSmith",
      contactInfo: "IGN: WeaponSmith",
      priceMode: "Each",
      combatCategory: "Sword",
      combatLevel: "10",
      combatStrength: "15",
      combatDmgType: "Slash",
      combatDmgPercent: "100",
      combatImpact: "5",
      combatCryonae: "0",
      combatArborae: "0",
      combatTempestae: "0",
      combatInfernae: "0",
      combatNecromae: "0"
    },
    {
      item: "Health Potion",
      price: 500,
      quantity: 10,
      type: "sell",
      seller: "AlchemistGuild",
      contactInfo: "Discord: AlchemistGuild#1234",
      priceMode: "Each",
      combatCategory: "Potion",
      combatLevel: "1",
      combatStrength: "0",
      combatDmgType: "Heal",
      combatDmgPercent: "0",
      combatImpact: "0",
      combatCryonae: "0",
      combatArborae: "0",
      combatTempestae: "0",
      combatInfernae: "0",
      combatNecromae: "0"
    },
    {
      item: "Rare Crystals",
      price: 100000,
      quantity: 5,
      type: "buy",
      seller: "CrystalCollector",
      contactInfo: "IGN: CrystalCollector",
      priceMode: "Total",
      combatCategory: "Crystal",
      combatLevel: "5",
      combatStrength: "0",
      combatDmgType: "Magic",
      combatDmgPercent: "0",
      combatImpact: "0",
      combatCryonae: "10",
      combatArborae: "5",
      combatTempestae: "0",
      combatInfernae: "0",
      combatNecromae: "0"
    }
  ];

  console.log('🚀 Creating multiple listings...\n');
  
  for (const listing of listings) {
    await createListing(listing);
    console.log(''); // Empty line for readability
    
    // Small delay between requests to be nice to the server
    await new Promise(resolve => setTimeout(resolve, 500));
  }
}

// Example validation function
function validateListing(listing) {
  const required = ['item', 'price', 'quantity', 'type', 'seller'];
  const missing = required.filter(field => !listing[field]);
  
  if (missing.length > 0) {
    console.log('❌ Missing required fields:', missing.join(', '));
    return false;
  }
  
  if (!['buy', 'sell'].includes(listing.type.toLowerCase())) {
    console.log('❌ Type must be "buy" or "sell"');
    return false;
  }
  
  if (listing.price <= 0 || listing.quantity <= 0) {
    console.log('❌ Price and quantity must be positive numbers');
    return false;
  }
  
  return true;
}

// Main execution
async function main() {
  console.log('🎯 BS Bazaar API - Listing Creation Examples');
  console.log('===========================================\n');
  
  // Example 1: Single listing
  console.log('📝 Example 1: Creating a single listing');
  const singleListing = {
    item: "Basic Shield",
    price: 8000,
    quantity: 1,
    type: "sell",
    seller: "DefenseExpert",
    contactInfo: "IGN: DefenseExpert",
    priceMode: "Each",
    combatCategory: "Shield",
    combatLevel: "8",
    combatStrength: "12",
    combatDmgType: "Block",
    combatDmgPercent: "0",
    combatImpact: "2",
    combatCryonae: "0",
    combatArborae: "0",
    combatTempestae: "0",
    combatInfernae: "0",
    combatNecromae: "0"
  };
  
  if (validateListing(singleListing)) {
    await createListing(singleListing);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Example 2: Multiple listings
  console.log('📝 Example 2: Creating multiple listings');
  await createMultipleListings();
  
  console.log('✨ Examples completed!');
  console.log('\n💡 Tips:');
  console.log('• Always validate your data before sending');
  console.log('• Use meaningful seller names and contact info');
  console.log('• Price is always in copper (smallest currency unit)');
  console.log('• Set priceMode to "Each" for per-item pricing or "Total" for bulk pricing');
  console.log('• Include combat fields for weapons/armor if needed');
}

// Check if fetch is available (Node.js 18+)
if (typeof fetch === 'undefined') {
  console.log('❌ This script requires Node.js 18+ with built-in fetch support');
  process.exit(1);
}

main().catch(console.error);
