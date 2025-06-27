require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
app.set('trust proxy', true);
const PORT = process.env.PORT || 3001;

let db;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET || 'changeme',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000,
  },
}));

app.use(passport.initialize());
app.use(passport.session());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use(limiter);

// Passport setup
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

app.get('/auth/discord', passport.authenticate('discord'));

app.get('/auth/discord/callback',
  passport.authenticate('discord', { failureRedirect: '/auth/discord/failure' }),
  (req, res) => {
    const token = req.user.token;
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth-success?token=${token}`);
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

function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token provided' });

  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
}

async function ensureAdmin(req, res, next) {
  const row = await db.get('SELECT 1 FROM admins WHERE id = ?', req.user?.id);
  if (row) return next();
  return res.status(403).json({ error: 'Admin access required' });
}

app.get('/listings', async (req, res) => {
  try {
    const listings = await db.all('SELECT * FROM listings');
    res.json(listings);
  } catch (err) {
    console.error('Error reading listings from DB:', err);
    res.status(500).json({ error: 'Failed to read listings from database' });
  }
});

app.post('/listings', authenticateJWT, async (req, res) => {
  const { item, price, quantity, type, category } = req.body;
  try {
    const stmt = await db.run(`
      INSERT INTO listings (item, price, quantity, type, category, seller, sellerId, sellerAvatar, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      item,
      price,
      quantity,
      type,
      category,
      req.user.username,
      req.user.id,
      req.user.avatar,
      Date.now()
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
  const { item, price, quantity, type, category } = req.body;
  try {
    const listing = await db.get('SELECT * FROM listings WHERE id = ?', req.params.id);
    if (!listing) return res.status(404).json({ error: 'Listing not found' });
    if (listing.sellerId !== req.user.id) return res.status(403).json({ error: 'Forbidden' });

    await db.run(`
      UPDATE listings
      SET item = ?, price = ?, quantity = ?, type = ?, category = ?
      WHERE id = ?`,
      item, price, quantity, type, category, req.params.id
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

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }
});

// Socket.IO connection log (optional)
io.on('connection', (socket) => {
  console.log('A user connected');
  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

(async () => {
  db = await open({
    filename: 'marketplace.db',
    driver: sqlite3.Database,
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS listings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      item TEXT,
      price INTEGER,
      quantity INTEGER,
      type TEXT,
      category TEXT,
      seller TEXT,
      sellerId TEXT,
      sellerAvatar TEXT,
      timestamp INTEGER
    );
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS admins (
      id TEXT PRIMARY KEY
    );
  `);

  // Insert a default admin if not present
  await db.run('INSERT OR IGNORE INTO admins (id) VALUES (?)', '249099315056738304');

  server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
})();
