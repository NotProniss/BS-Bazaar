require('dotenv').config();
const express = require('express');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const http = require('http');
const { Server } = require('socket.io');
const fs = require('fs');
const path = require('path');

const app = express();
app.set('trust proxy', true);
const PORT = process.env.PORT || 3001;

let db;

// CORS Configuration
const corsOrigins = [
  process.env.FRONTEND_URL || 'http://localhost',
  'http://localhost',
  'http://localhost:80',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  'http://127.0.0.1',
  'http://127.0.0.1:80',
  'https://bs-bazaar.com'
];

// Middleware
app.use(cors({
  origin: corsOrigins,
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Session Configuration
app.use(session({
  store: new SQLiteStore({
    db: 'sessions.db',
    table: 'sessions',
    dir: './data',
    concurrentDB: true
  }),
  secret: process.env.SESSION_SECRET || 'changeme',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  },
}));

app.use(passport.initialize());
app.use(passport.session());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests from this IP, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Utility Functions
function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
}

async function ensureAdmin(req, res, next) {
  try {
    const row = await db.get('SELECT 1 FROM admins WHERE id = ?', req.user?.id);
    if (row) {
      return next();
    }
    return res.status(403).json({ error: 'Admin access required' });
  } catch (error) {
    console.error('Error checking admin status:', error);
    return res.status(500).json({ error: 'Failed to check admin status' });
  }
}

// Passport Configuration
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

passport.use(new DiscordStrategy({
  clientID: process.env.DISCORD_CLIENT_ID,
  clientSecret: process.env.DISCORD_CLIENT_SECRET,
  callbackURL: process.env.DISCORD_CALLBACK_URL,
  scope: ['identify'],
}, (accessToken, refreshToken, profile, done) => {
  const token = jwt.sign({
    id: profile.id,
    username: profile.username,
    avatar: profile.avatar,
  }, process.env.JWT_SECRET, { expiresIn: '7d' });

  profile.token = token;
  return done(null, profile);
}));

// Health Check and Info Routes
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: require('./package.json').version
  });
});

app.get('/api/info', (req, res) => {
  res.json({
    name: 'BS-Bazaar API',
    version: require('./package.json').version,
    environment: process.env.NODE_ENV || 'development',
    endpoints: {
      auth: '/auth/discord',
      listings: '/listings',
      items: '/api/items',
      health: '/health'
    }
  });
});

// Authentication Routes
app.get('/auth/discord', passport.authenticate('discord'));

app.get('/auth/discord/callback',
  passport.authenticate('discord', { failureRedirect: '/auth/discord/failure' }),
  (req, res) => {
    const token = req.user.token;
    const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost'}/auth-success?token=${token}`;
    res.redirect(redirectUrl);
  }
);

app.get('/auth/discord/failure', (req, res) => {
  res.status(401).json({ error: 'Authentication failed' });
});

app.get('/auth/discord/me', authenticateJWT, (req, res) => {
  res.json(req.user);
});

app.post('/logout', (req, res) => {
  req.logout(() => {
    res.json({ success: true });
  });
});

// Check if user is admin
app.get('/is-admin', authenticateJWT, async (req, res) => {
  try {
    const row = await db.get('SELECT 1 FROM admins WHERE id = ?', req.user?.id);
    res.json({ isAdmin: !!row });
  } catch (error) {
    console.error('Error checking admin status:', error);
    res.status(500).json({ error: 'Failed to check admin status' });
  }
});

// Listing Routes
app.get('/listings', async (req, res) => {
  try {
    const listings = await db.all('SELECT * FROM listings ORDER BY timestamp DESC');
    res.json(listings);
  } catch (err) {
    console.error('Error reading listings from DB:', err);
    res.status(500).json({ error: 'Failed to read listings from database' });
  }
});

app.post('/listings', authenticateJWT, async (req, res) => {
  const { item, price, quantity, type, category, contactInfo, priceMode,
    combatCategory, combatLevel, combatStrength, combatDmgType, combatDmgPercent,
    combatImpact, combatCryonae, combatArborae, combatTempestae, combatInfernae, combatNecromae } = req.body;
  try {
    const stmt = await db.run(`
      INSERT INTO listings (item, price, quantity, type, category, seller, sellerId, sellerAvatar, timestamp, contactInfo, priceMode,
        combatCategory, combatLevel, combatStrength, combatDmgType, combatDmgPercent, combatImpact, combatCryonae, combatArborae, combatTempestae, combatInfernae, combatNecromae)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      item,
      price,
      quantity,
      type,
      category,
      req.user.username,
      req.user.id,
      req.user.avatar,
      Date.now(),
      contactInfo || '',
      priceMode || 'Each',
      combatCategory || '',
      combatLevel || '',
      combatStrength || '',
      combatDmgType || '',
      combatDmgPercent || '',
      combatImpact || '',
      combatCryonae || '',
      combatArborae || '',
      combatTempestae || '',
      combatInfernae || '',
      combatNecromae || ''
    );
    const listing = await db.get('SELECT * FROM listings WHERE id = ?', stmt.lastID);
    io.emit('listingCreated', listing); // Emit event
    res.json({ success: true, listing });
  } catch (err) {
    console.error('Error inserting listing into DB:', err);
    res.status(500).json({ error: 'Failed to save listing' });
  }
});

app.put('/listings/:id', authenticateJWT, async (req, res) => {
  const { item, price, quantity, type, category, contactInfo, priceMode,
    combatCategory, combatLevel, combatStrength, combatDmgType, combatDmgPercent,
    combatImpact, combatCryonae, combatArborae, combatTempestae, combatInfernae, combatNecromae } = req.body;
  try {
    const listing = await db.get('SELECT * FROM listings WHERE id = ?', req.params.id);
    if (!listing) return res.status(404).json({ error: 'Listing not found' });
    if (listing.sellerId !== req.user.id) return res.status(403).json({ error: 'Forbidden' });

    await db.run(`
      UPDATE listings
      SET item = ?, price = ?, quantity = ?, type = ?, category = ?, contactInfo = ?, priceMode = ?,
        combatCategory = ?, combatLevel = ?, combatStrength = ?, combatDmgType = ?, combatDmgPercent = ?,
        combatImpact = ?, combatCryonae = ?, combatArborae = ?, combatTempestae = ?, combatInfernae = ?, combatNecromae = ?,
        timestamp = ?
      WHERE id = ?`,
      item, price, quantity, type, category, contactInfo || '', priceMode || 'Each',
      combatCategory || '', combatLevel || '', combatStrength || '', combatDmgType || '', combatDmgPercent || '',
      combatImpact || '', combatCryonae || '', combatArborae || '', combatTempestae || '', combatInfernae || '', combatNecromae || '',
      Date.now(),
      req.params.id
    );
    const updated = await db.get('SELECT * FROM listings WHERE id = ?', req.params.id);
    io.emit('listingUpdated', updated); // Emit event
    res.json({ success: true, listing: updated });
  } catch (err) {
    console.error('Error updating listing in DB:', err);
    res.status(500).json({ error: 'Failed to update listing' });
  }
});

app.delete('/listings/:id', authenticateJWT, async (req, res) => {
  try {
    const listing = await db.get('SELECT * FROM listings WHERE id = ?', req.params.id);
    if (!listing) return res.status(404).json({ error: 'Listing not found' });
    if (listing.sellerId !== req.user.id) return res.status(403).json({ error: 'Forbidden' });

    await db.run('DELETE FROM listings WHERE id = ?', req.params.id);
    io.emit('listingDeleted', Number(req.params.id)); // Emit event
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting listing from DB:', err);
    res.status(500).json({ error: 'Failed to delete listing' });
  }
});

app.delete('/admin/listings/:id', authenticateJWT, ensureAdmin, async (req, res) => {
  try {
    const listing = await db.get('SELECT * FROM listings WHERE id = ?', req.params.id);
    if (!listing) return res.status(404).json({ error: 'Listing not found' });
    await db.run('DELETE FROM listings WHERE id = ?', req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error('Admin delete failed:', err);
    res.status(500).json({ error: 'Failed to delete listing as admin' });
  }
});

app.get('/admin/users', authenticateJWT, ensureAdmin, async (req, res) => {
  const admins = await db.all('SELECT * FROM admins');
  res.json({ admins });
});

app.post('/admin/users/add', authenticateJWT, ensureAdmin, async (req, res) => {
  const { id } = req.body;
  await db.run('INSERT OR IGNORE INTO admins (id) VALUES (?)', id);
  res.json({ success: true });
});

app.post('/admin/users/remove', authenticateJWT, ensureAdmin, async (req, res) => {
  const { id } = req.body;
  await db.run('DELETE FROM admins WHERE id = ?', id);
  res.json({ success: true });
});

// ==== ITEMS API ENDPOINTS ====

// Get all items from items.json
app.get('/api/items', async (req, res) => {
  try {
    const itemsPath = path.join(__dirname, 'data', 'items.json');
    
    if (!fs.existsSync(itemsPath)) {
      return res.status(404).json({ error: 'Items data not found' });
    }
    
    const itemsData = fs.readFileSync(itemsPath, 'utf8');
    const items = JSON.parse(itemsData);
    
    res.json(items);
  } catch (err) {
    console.error('Error reading items data:', err);
    res.status(500).json({ error: 'Failed to read items data' });
  }
});

// Search items by name, profession, episode, etc.
app.get('/api/items/search', async (req, res) => {
  try {
    const { 
      q: searchQuery, 
      profession, 
      episode, 
      tradeable, 
      limit = 50,
      offset = 0 
    } = req.query;
    
    const itemsPath = path.join(__dirname, 'data', 'items.json');
    
    if (!fs.existsSync(itemsPath)) {
      return res.status(404).json({ error: 'Items data not found' });
    }
    
    const itemsData = fs.readFileSync(itemsPath, 'utf8');
    let items = JSON.parse(itemsData);
    
    // Apply filters
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      items = items.filter(item => 
        item.Items && item.Items.toLowerCase().includes(query)
      );
    }
    
    if (profession) {
      items = items.filter(item => 
        item['Profession A'] === profession || item['Profession B'] === profession
      );
    }
    
    if (episode) {
      items = items.filter(item => item.Episode === episode);
    }
    
    if (tradeable !== undefined) {
      const isTradeableFilter = tradeable === 'true';
      items = items.filter(item => item.Tradeable === isTradeableFilter);
    }
    
    // Apply pagination
    const startIndex = parseInt(offset);
    const endIndex = startIndex + parseInt(limit);
    const paginatedItems = items.slice(startIndex, endIndex);
    
    res.json({
      items: paginatedItems,
      total: items.length,
      offset: startIndex,
      limit: parseInt(limit)
    });
  } catch (err) {
    console.error('Error searching items:', err);
    res.status(500).json({ error: 'Failed to search items' });
  }
});

// Get a specific item by name
app.get('/api/items/:itemName', async (req, res) => {
  try {
    const { itemName } = req.params;
    const itemsPath = path.join(__dirname, 'data', 'items.json');
    
    if (!fs.existsSync(itemsPath)) {
      return res.status(404).json({ error: 'Items data not found' });
    }
    
    const itemsData = fs.readFileSync(itemsPath, 'utf8');
    const items = JSON.parse(itemsData);
    
    const item = items.find(i => i.Items === itemName);
    
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    res.json(item);
  } catch (err) {
    console.error('Error getting item:', err);
    res.status(500).json({ error: 'Failed to get item data' });
  }
});

// Get unique professions from items data
app.get('/api/items/meta/professions', async (req, res) => {
  try {
    const itemsPath = path.join(__dirname, 'data', 'items.json');
    
    if (!fs.existsSync(itemsPath)) {
      return res.status(404).json({ error: 'Items data not found' });
    }
    
    const itemsData = fs.readFileSync(itemsPath, 'utf8');
    const items = JSON.parse(itemsData);
    
    const professions = new Set();
    items.forEach(item => {
      if (item['Profession A'] && item['Profession A'] !== 'None') {
        professions.add(item['Profession A']);
      }
      if (item['Profession B'] && item['Profession B'] !== 'None') {
        professions.add(item['Profession B']);
      }
    });
    
    res.json(Array.from(professions).sort());
  } catch (err) {
    console.error('Error getting professions:', err);
    res.status(500).json({ error: 'Failed to get professions data' });
  }
});

// Get unique episodes from items data
app.get('/api/items/meta/episodes', async (req, res) => {
  try {
    const itemsPath = path.join(__dirname, 'data', 'items.json');
    
    if (!fs.existsSync(itemsPath)) {
      return res.status(404).json({ error: 'Items data not found' });
    }
    
    const itemsData = fs.readFileSync(itemsPath, 'utf8');
    const items = JSON.parse(itemsData);
    
    const episodes = new Set();
    items.forEach(item => {
      if (item.Episode && item.Episode !== 'None') {
        episodes.add(item.Episode);
      }
    });
    
    res.json(Array.from(episodes).sort());
  } catch (err) {
    console.error('Error getting episodes:', err);
    res.status(500).json({ error: 'Failed to get episodes data' });
  }
});

// ==== COMBINED API ENDPOINTS ====

// Get listings with item details
app.get('/api/listings-with-items', async (req, res) => {
  try {
    const { 
      item_name, 
      profession, 
      episode, 
      type, 
      seller,
      limit = 50,
      offset = 0 
    } = req.query;
    
    // Get listings from database
    let query = 'SELECT * FROM listings';
    let params = [];
    let conditions = [];
    
    if (item_name) {
      conditions.push('item LIKE ?');
      params.push(`%${item_name}%`);
    }
    
    if (type) {
      conditions.push('type = ?');
      params.push(type);
    }
    
    if (seller) {
      conditions.push('seller LIKE ?');
      params.push(`%${seller}%`);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY timestamp DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));
    
    const listings = await db.all(query, params);
    
    // Get items data
    const itemsPath = path.join(__dirname, 'data', 'items.json');
    let itemsMap = {};
    
    if (fs.existsSync(itemsPath)) {
      const itemsData = fs.readFileSync(itemsPath, 'utf8');
      const items = JSON.parse(itemsData);
      
      // Create a map for quick lookup
      items.forEach(item => {
        if (item.Items) {
          itemsMap[item.Items] = item;
        }
      });
    }
    
    // Combine listings with item details
    let enrichedListings = listings.map(listing => ({
      ...listing,
      itemDetails: itemsMap[listing.item] || null
    }));
    
    // Apply additional filters based on item details
    if (profession) {
      enrichedListings = enrichedListings.filter(listing => {
        const itemDetails = listing.itemDetails;
        return itemDetails && (
          itemDetails['Profession A'] === profession || 
          itemDetails['Profession B'] === profession
        );
      });
    }
    
    if (episode) {
      enrichedListings = enrichedListings.filter(listing => {
        const itemDetails = listing.itemDetails;
        return itemDetails && itemDetails.Episode === episode;
      });
    }
    
    // Get total count for pagination
    const totalCountQuery = 'SELECT COUNT(*) as count FROM listings' + 
      (conditions.length > 0 ? ' WHERE ' + conditions.join(' AND ') : '');
    const totalResult = await db.get(totalCountQuery, params.slice(0, -2)); // Remove limit and offset params
    
    res.json({
      listings: enrichedListings,
      total: totalResult.count,
      offset: parseInt(offset),
      limit: parseInt(limit)
    });
  } catch (err) {
    console.error('Error getting enriched listings:', err);
    res.status(500).json({ error: 'Failed to get listings with item details' });
  }
});

// Get market statistics for an item
app.get('/api/market-stats/:itemName', async (req, res) => {
  try {
    const { itemName } = req.params;
    
    // Get all listings for this item
    const listings = await db.all(
      'SELECT * FROM listings WHERE item = ? ORDER BY timestamp DESC',
      [itemName]
    );
    
    if (listings.length === 0) {
      return res.json({
        item: itemName,
        totalListings: 0,
        buyListings: 0,
        sellListings: 0,
        averagePrice: null,
        lowestSellPrice: null,
        highestBuyPrice: null,
        totalQuantity: 0
      });
    }
    
    const buyListings = listings.filter(l => l.type === 'buy');
    const sellListings = listings.filter(l => l.type === 'sell');
    
    const allPrices = listings.map(l => l.price);
    const sellPrices = sellListings.map(l => l.price);
    const buyPrices = buyListings.map(l => l.price);
    
    const totalQuantity = listings.reduce((sum, l) => sum + l.quantity, 0);
    const averagePrice = allPrices.length > 0 
      ? allPrices.reduce((sum, price) => sum + price, 0) / allPrices.length 
      : null;
    
    res.json({
      item: itemName,
      totalListings: listings.length,
      buyListings: buyListings.length,
      sellListings: sellListings.length,
      averagePrice: averagePrice ? Math.round(averagePrice) : null,
      lowestSellPrice: sellPrices.length > 0 ? Math.min(...sellPrices) : null,
      highestBuyPrice: buyPrices.length > 0 ? Math.max(...buyPrices) : null,
      totalQuantity: totalQuantity,
      recentListings: listings.slice(0, 10) // Last 10 listings
    });
  } catch (err) {
    console.error('Error getting market stats:', err);
    res.status(500).json({ error: 'Failed to get market statistics' });
  }
});

// ==== CONSOLIDATED API ENDPOINTS ====

// Create a new listing (API endpoint with validation)
app.post('/api/listings', async (req, res) => {
  const { 
    item, 
    price, 
    quantity, 
    type, 
    category, 
    contactInfo, 
    priceMode,
    seller,
    combatCategory, 
    combatLevel, 
    combatStrength, 
    combatDmgType, 
    combatDmgPercent,
    combatImpact, 
    combatCryonae, 
    combatArborae, 
    combatTempestae, 
    combatInfernae, 
    combatNecromae 
  } = req.body;

  // Validation
  if (!item || !price || !quantity || !type || !seller) {
    return res.status(400).json({ 
      error: 'Missing required fields: item, price, quantity, type, seller' 
    });
  }

  if (!['buy', 'sell'].includes(type.toLowerCase())) {
    return res.status(400).json({ 
      error: 'Type must be either "buy" or "sell"' 
    });
  }

  if (price <= 0 || quantity <= 0) {
    return res.status(400).json({ 
      error: 'Price and quantity must be positive numbers' 
    });
  }

  try {
    const stmt = await db.run(`
      INSERT INTO listings (item, price, quantity, type, category, seller, sellerId, sellerAvatar, timestamp, contactInfo, priceMode,
        combatCategory, combatLevel, combatStrength, combatDmgType, combatDmgPercent, combatImpact, combatCryonae, combatArborae, combatTempestae, combatInfernae, combatNecromae)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      item,
      price,
      quantity,
      type.toLowerCase(),
      category || '',
      seller,
      '', // sellerId - empty for API created listings
      '', // sellerAvatar - empty for API created listings
      Date.now(),
      contactInfo || '',
      priceMode || 'Each',
      combatCategory || '',
      combatLevel || '',
      combatStrength || '',
      combatDmgType || '',
      combatDmgPercent || '',
      combatImpact || '',
      combatCryonae || '',
      combatArborae || '',
      combatTempestae || '',
      combatInfernae || '',
      combatNecromae || ''
    );
    
    const listing = await db.get('SELECT * FROM listings WHERE id = ?', stmt.lastID);
    
    // Emit socket event for real-time updates
    io.emit('listingCreated', listing);
    
    res.status(201).json({ 
      success: true, 
      message: 'Listing created successfully',
      listing: listing 
    });
  } catch (err) {
    console.error('Error inserting listing into DB:', err);
    res.status(500).json({ error: 'Failed to save listing' });
  }
});

// Socket.IO Setup
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: corsOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);
  
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
  
  // Optional: Add room-based subscriptions for different item categories
  socket.on('subscribe-to-item', (itemName) => {
    socket.join(`item-${itemName}`);
  });
  
  socket.on('unsubscribe-from-item', (itemName) => {
    socket.leave(`item-${itemName}`);
  });
});

// Database Initialization and Server Startup
(async () => {
  try {
    console.log('Initializing database...');
    
    // Open database connection
    db = await open({
      filename: 'marketplace.db',
      driver: sqlite3.Database,
    });
    
    console.log('Database connected successfully');

    // Create tables if they don't exist
    await db.exec(`
      CREATE TABLE IF NOT EXISTS listings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        item TEXT NOT NULL,
        price INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        type TEXT NOT NULL,
        category TEXT,
        seller TEXT NOT NULL,
        sellerId TEXT,
        sellerAvatar TEXT,
        timestamp INTEGER NOT NULL,
        contactInfo TEXT,
        priceMode TEXT DEFAULT 'Each',
        combatCategory TEXT,
        combatLevel TEXT,
        combatStrength TEXT,
        combatDmgType TEXT,
        combatDmgPercent TEXT,
        combatImpact TEXT,
        combatCryonae TEXT,
        combatArborae TEXT,
        combatTempestae TEXT,
        combatInfernae TEXT,
        combatNecromae TEXT
      );
    `);

    await db.exec(`
      CREATE TABLE IF NOT EXISTS admins (
        id TEXT PRIMARY KEY
      );
    `);

    // Add new columns for combat fields if they do not exist
    const columns = [
      'combatCategory TEXT',
      'combatLevel TEXT',
      'combatStrength TEXT',
      'combatDmgType TEXT',
      'combatDmgPercent TEXT',
      'combatImpact TEXT',
      'combatCryonae TEXT',
      'combatArborae TEXT',
      'combatTempestae TEXT',
      'combatInfernae TEXT',
      'combatNecromae TEXT',
    ];
    
    for (const col of columns) {
      try {
        await db.exec(`ALTER TABLE listings ADD COLUMN ${col}`);
        console.log(`Added column: ${col}`);
      } catch (e) {
        // Column already exists, ignore error
      }
    }

    // Insert default admin if not present
    const defaultAdminId = '249099315056738304';
    const existingAdmin = await db.get('SELECT 1 FROM admins WHERE id = ?', defaultAdminId);
    if (!existingAdmin) {
      await db.run('INSERT INTO admins (id) VALUES (?)', defaultAdminId);
      console.log('Default admin created');
    }

    // Create data directory if it doesn't exist
    const dataDir = path.join(__dirname, 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
      console.log('Data directory created');
    }

    console.log('Database initialization completed');

    // Start server
    server.listen(PORT, () => {
      console.log(`🚀 BS-Bazaar Server running on http://localhost:${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost'}`);
      console.log(`📋 Health check: http://localhost:${PORT}/health`);
    });

  } catch (error) {
    console.error('Failed to initialize database or start server:', error);
    process.exit(1);
  }
})();
