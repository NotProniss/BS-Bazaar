# ![MIT License](https://img.shields.io/badge/License-MIT-green.svg)
# BS Bazaar API Documentation

## Overview
The BS Bazaar API provides access to both item data from the Brighter Shores game and marketplace listings data. This API allows you to retrieve item information, search through items, access marketplace listings, and get combined data with enriched item details.

## Base URL
- Local Development: `http://localhost:3001`
- Production: `https://your-domain.com`

## Authentication
Some endpoints require authentication using JWT tokens obtained through Discord OAuth.

### Headers for authenticated requests:
```
Authorization: Bearer <your-jwt-token>
```

## Items API Endpoints

### GET /api/items
Get all items from the items database.

**Response:**
```json
[
  {
    "Items": "Crooked Goat Horn (Brewed)",
    "Image": "https://brightershoreswiki.org/images/...",
    "Episode": "Mine of Mantuban",
    "Variant of": "Goat Horn (Brewed)",
    "Profession A": "Bonewright",
    "Profession Level A": "0",
    "Profession B": "Bonewright",
    "Profession Level B": "0",
    "Tradeable": true
  }
]
```

### GET /api/items/search
Search items with filters.

**Query Parameters:**
- `q` (string): Search query for item name
- `profession` (string): Filter by profession
- `episode` (string): Filter by episode
- `tradeable` (boolean): Filter by tradeable status
- `limit` (number): Number of results (default: 50)
- `offset` (number): Pagination offset (default: 0)

**Example:**
```
GET /api/items/search?q=sword&profession=Combat&limit=10
```

**Response:**
```json
{
  "items": [...],
  "total": 125,
  "offset": 0,
  "limit": 10
}
```

### GET /api/items/:itemName
Get a specific item by name.

**Example:**
```
GET /api/items/Crooked%20Goat%20Horn%20(Brewed)
```

### GET /api/items/meta/professions
Get all unique professions from items data.

**Response:**
```json
["Combat", "Bonewright", "Chef", "Alchemist", ...]
```

### GET /api/items/meta/episodes
Get all unique episodes from items data.

**Response:**
```json
["Hopeport", "Hopeforest", "Mine of Mantuban", ...]
```

## Listings API Endpoints

### GET /listings
Get all marketplace listings.

**Response:**
```json
[
  {
    "id": 1,
    "item": "Basic Sword",
    "price": 1000,
    "quantity": 5,
    "type": "sell",
    "seller": "PlayerName",
    "timestamp": 1640995200000,
    "contactInfo": "IGN: PlayerName"
  }
]
```

### POST /api/listings
Create a new listing (no authentication required for API access).

**Request Body:**
```json
{
  "item": "Basic Sword",
  "price": 1000,
  "quantity": 1,
  "type": "sell",
  "seller": "PlayerName",
  "contactInfo": "IGN: PlayerName",
  "priceMode": "Each",
  "category": "",
  "combatCategory": "",
  "combatLevel": "",
  "combatStrength": "",
  "combatDmgType": "",
  "combatDmgPercent": "",
  "combatImpact": "",
  "combatCryonae": "",
  "combatArborae": "",
  "combatTempestae": "",
  "combatInfernae": "",
  "combatNecromae": ""
}
```

**Required Fields:**
- `item` (string): The name of the item
- `price` (number): Price in copper (positive number)
- `quantity` (number): Quantity available (positive number)
- `type` (string): Either "buy" or "sell"
- `seller` (string): Name of the seller

**Optional Fields:**
- `contactInfo` (string): Contact information (default: "")
- `priceMode` (string): "Each" or "Total" (default: "Each")
- `category` (string): Item category (default: "")
- Combat-related fields for weapons/armor (all default to "")

**Response (Success - 201):**
```json
{
  "success": true,
  "message": "Listing created successfully",
  "listing": {
    "id": 64,
    "item": "Basic Sword",
    "price": 1000,
    "quantity": 1,
    "type": "sell",
    "seller": "PlayerName",
    "timestamp": 1640995200000,
    "contactInfo": "IGN: PlayerName"
  }
}
```

**Response (Error - 400):**
```json
{
  "error": "Missing required fields: item, price, quantity, type, seller"
}
```

### POST /listings
Create a new listing (requires authentication).

### PUT /listings/:id
Update a listing (requires authentication and ownership).

### DELETE /listings/:id
Delete a listing (requires authentication and ownership).

## Combined API Endpoints

### GET /api/listings-with-items
Get listings enriched with item details.

**Query Parameters:**
- `item_name` (string): Filter by item name
- `profession` (string): Filter by item profession
- `episode` (string): Filter by item episode
- `type` (string): Filter by listing type (buy/sell)
- `seller` (string): Filter by seller name
- `limit` (number): Number of results (default: 50)
- `offset` (number): Pagination offset (default: 0)

**Example:**
```
GET /api/listings-with-items?profession=Combat&type=sell&limit=20
```

**Response:**
```json
{
  "listings": [
    {
      "id": 1,
      "item": "Basic Sword",
      "price": 1000,
      "quantity": 5,
      "type": "sell",
      "seller": "PlayerName",
      "timestamp": 1640995200000,
      "contactInfo": "IGN: PlayerName",
      "itemDetails": {
        "Items": "Basic Sword",
        "Image": "https://...",
        "Episode": "Hopeport",
        "Profession A": "Combat",
        "Profession Level A": "1",
        "Tradeable": true
      }
    }
  ],
  "total": 45,
  "offset": 0,
  "limit": 20
}
```

### GET /api/market-stats/:itemName
Get market statistics for a specific item.

**Example:**
```
GET /api/market-stats/Basic%20Sword
```

**Response:**
```json
{
  "item": "Basic Sword",
  "totalListings": 15,
  "buyListings": 8,
  "sellListings": 7,
  "averagePrice": 1250,
  "lowestSellPrice": 1000,
  "highestBuyPrice": 1100,
  "totalQuantity": 45,
  "recentListings": [...]
}
```

## Error Responses

All endpoints return consistent error responses:

```json
{
  "error": "Error message description"
}
```

Common HTTP status codes:
- `400`: Bad Request
- `401`: Unauthorized (missing or invalid token)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `500`: Internal Server Error

## Rate Limiting

API requests are rate limited to 100 requests per 15-minute window per IP address.

## Examples

### Getting Combat Items with Active Sell Listings
```bash
curl "http://localhost:3001/api/listings-with-items?profession=Combat&type=sell&limit=10"
```

### Search for Potions
```bash
curl "http://localhost:3001/api/items/search?q=potion&tradeable=true"
```

### Get Market Data for a Specific Item
```bash
curl "http://localhost:3001/api/market-stats/Health%20Potion"
```

### Create a New Listing (requires authentication)
```bash
curl -X POST "http://localhost:3001/listings" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "item": "Basic Sword",
    "price": 1000,
    "quantity": 1,
    "type": "sell",
    "contactInfo": "IGN: MyPlayer"
  }'
```

### Create a New Listing via API (no authentication required)
```bash
curl -X POST "http://localhost:3001/api/listings" \
  -H "Content-Type: application/json" \
  -d '{
    "item": "Basic Sword",
    "price": 1000,
    "quantity": 1,
    "type": "sell",
    "seller": "MyPlayer",
    "contactInfo": "IGN: MyPlayer"
  }'
```
