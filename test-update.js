const axios = require('axios');

// Test updating listing ID 102 (the one with notes)
const testUpdate = async () => {
  const token = 'test-token'; // You'll need to get a real token
  const listingId = 102;
  
  const updateData = {
    item: "2006 to 2500 Bolas",
    type: "buy",
    price: 2000000000,
    quantity: 3,
    notes: "UPDATED NOTES - This is a test update",
    IGN: "UPDATED IGN",
    combatCategory: "Weapon",
    combatLevel: "2500",
    combatStrength: "3000",
    combatDmgType: "Impact",
    combatDmgPercent: "30",
    rarity: "Rare",
    priceMode: "Each",
    seller: "proniss"
  };

  try {
    const response = await axios.put(`http://localhost:3001/api/listings/${listingId}`, updateData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('Update successful:', response.data);
  } catch (error) {
    console.error('Update failed:', error.response?.data || error.message);
  }
};

console.log('Testing update endpoint...');
// testUpdate(); // Uncomment to run test
console.log('Test script ready - you need to provide a valid JWT token first');
