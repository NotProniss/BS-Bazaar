#!/usr/bin/env node

/**
 * BS Bazaar API Test Script
 * This script demonstrates the various API endpoints available.
 */

const baseUrl = 'http://localhost:3001';

// Helper function to make HTTP requests
async function makeRequest(endpoint, description) {
  try {
    console.log(`\n🔍 ${description}`);
    console.log(`   GET ${baseUrl}${endpoint}`);
    
    const response = await fetch(`${baseUrl}${endpoint}`);
    const data = await response.json();
    
    if (response.ok) {
      console.log(`   ✅ Status: ${response.status}`);
      
      // Limit output for large responses
      if (Array.isArray(data)) {
        console.log(`   📊 Found ${data.length} items`);
        if (data.length > 0) {
          console.log(`   📝 Sample:`, JSON.stringify(data[0], null, 2).substring(0, 200) + '...');
        }
      } else if (data.items) {
        console.log(`   📊 Found ${data.items.length} items (Total: ${data.total})`);
        if (data.items.length > 0) {
          console.log(`   📝 Sample:`, JSON.stringify(data.items[0], null, 2).substring(0, 200) + '...');
        }
      } else if (data.listings) {
        console.log(`   📊 Found ${data.listings.length} listings (Total: ${data.total})`);
        if (data.listings.length > 0) {
          console.log(`   📝 Sample:`, JSON.stringify(data.listings[0], null, 2).substring(0, 200) + '...');
        }
      } else {
        console.log(`   📝 Response:`, JSON.stringify(data, null, 2).substring(0, 300) + '...');
      }
    } else {
      console.log(`   ❌ Error: ${response.status} - ${data.error || 'Unknown error'}`);
    }
  } catch (error) {
    console.log(`   ❌ Request failed: ${error.message}`);
  }
}

// Test creating a new listing
async function testCreateListing() {
  try {
    console.log(`\n🔍 Test creating a new listing`);
    console.log(`   POST ${baseUrl}/api/listings`);
    
    const testListing = {
      item: "Test Sword",
      price: 5000,
      quantity: 1,
      type: "sell",
      seller: "API-Tester",
      contactInfo: "IGN: API-Tester",
      priceMode: "Each"
    };
    
    const response = await fetch(`${baseUrl}/api/listings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testListing)
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log(`   ✅ Status: ${response.status}`);
      console.log(`   📝 Created listing with ID: ${data.listing?.id}`);
      console.log(`   📝 Response:`, JSON.stringify(data, null, 2).substring(0, 200) + '...');
    } else {
      console.log(`   ❌ Error: ${response.status} - ${data.error || 'Unknown error'}`);
    }
  } catch (error) {
    console.log(`   ❌ Request failed: ${error.message}`);
  }
}

async function runTests() {
  console.log('🚀 BS Bazaar API Test Suite');
  console.log('===========================');

  // Test metadata endpoints
  await makeRequest('/api/items/meta/professions', 'Get all professions');
  await makeRequest('/api/items/meta/episodes', 'Get all episodes');

  // Test item search endpoints
  await makeRequest('/api/items/search?q=sword&limit=3', 'Search for swords (limit 3)');
  await makeRequest('/api/items/search?profession=Combat&limit=5', 'Search for Combat items (limit 5)');
  await makeRequest('/api/items/search?episode=Hopeport&limit=3', 'Search for Hopeport items (limit 3)');

  // Test specific item lookup
  await makeRequest('/api/items/Basic%20Logs', 'Get specific item: Basic Logs');

  // Test listings endpoints
  await makeRequest('/listings', 'Get all listings (original endpoint)');
  await makeRequest('/api/listings-with-items?limit=2', 'Get listings with item details (limit 2)');
  await makeRequest('/api/listings-with-items?profession=Combat&limit=3', 'Get Combat item listings (limit 3)');

  // Test market stats (if there are any listings)
  await makeRequest('/api/market-stats/Basic%20Logs', 'Get market stats for Basic Logs');

  // Test creating a new listing via API
  await testCreateListing();

  console.log('\n✨ Test suite completed!');
  console.log('\nAvailable API Endpoints:');
  console.log('========================');
  console.log('• GET /api/items - Get all items');
  console.log('• GET /api/items/search - Search items with filters');
  console.log('• GET /api/items/:itemName - Get specific item');
  console.log('• GET /api/items/meta/professions - Get all professions');
  console.log('• GET /api/items/meta/episodes - Get all episodes');
  console.log('• GET /api/listings-with-items - Get listings with item details');
  console.log('• GET /api/market-stats/:itemName - Get market statistics');
  console.log('• POST /api/listings - Create a new listing (no auth required)');
  console.log('• GET /listings - Get all listings (original endpoint)');
  console.log('\nFor detailed documentation, see: bazaar-server/API-README.md');
}

// Check if fetch is available (Node.js 18+)
if (typeof fetch === 'undefined') {
  console.log('❌ This script requires Node.js 18+ with built-in fetch support');
  console.log('   Alternatively, you can test the endpoints manually with curl:');
  console.log('\n   curl "http://localhost:3001/api/items/meta/professions"');
  console.log('   curl "http://localhost:3001/api/items/search?q=sword&limit=3"');
  console.log('   curl "http://localhost:3001/api/listings-with-items?limit=2"');
  process.exit(1);
}

runTests().catch(console.error);
